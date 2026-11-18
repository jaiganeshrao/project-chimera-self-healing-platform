import { Incident, RecoveryAttempt, Service } from '../src/types/index.ts';
import { resolveInternalUrl, storage } from './storage.ts';

export interface VerificationResult {
  verified: boolean;
  probesCount: number;
  passedCount: number;
  averageResponseTimeMs: number;
  message: string;
}

export class VerificationEngine {
  async verifyRecovery(
    service: Service,
    incident: Incident,
    attempt: RecoveryAttempt
  ): Promise<VerificationResult> {
    const settings = storage.getSettings();
    const requiredProbes = Math.max(5, settings.verificationProbesCount || 5);

    incident.status = 'VERIFYING';
    storage.saveIncident(incident);

    const probeUrl = resolveInternalUrl(service.healthCheckUrl);
    let passedCount = 0;
    let totalLatency = 0;
    let lastProbeError = '';

    for (let i = 1; i <= requiredProbes; i++) {
      // 2200ms between verification probes (5 probes * 2.2s = 11.0s verification phase)
      await new Promise((r) => setTimeout(r, 2200));

      let probeSuccess = false;
      let latency = 0;

      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), settings.timeoutMs);

        const res = await fetch(probeUrl, {
          signal: controller.signal,
          headers: { 'X-Chimera-Probe': 'Verification' },
        });

        clearTimeout(timeoutId);
        latency = Date.now() - startTime;
        totalLatency += latency;

        if (res.ok) {
          const body = (await res.json().catch(() => ({}))) as any;
          if (body.status === 'UP' || res.status === 200) {
            passedCount++;
            probeSuccess = true;
          } else {
            lastProbeError = `Probe returned status '${body.status || 'DOWN'}'`;
          }
        } else {
          lastProbeError = `HTTP ${res.status} ${res.statusText || 'Error'}`;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          lastProbeError = `Probe timed out after ${settings.timeoutMs}ms`;
        } else {
          lastProbeError = err.message || 'Connection refused or network unreachable';
        }
      }

      const currentAvgLatency = Math.round(totalLatency / (passedCount || 1));
      attempt.verificationDetails = {
        probesCount: requiredProbes,
        passedCount,
        responseTimeMs: currentAvgLatency,
      };
      storage.saveRecoveryAttempt(attempt);

      storage.addAuditLog({
        timestamp: new Date().toISOString(),
        eventType: 'VERIFICATION_PASSED',
        relatedIncidentId: incident.id,
        serviceId: service.id,
        actionDetails: `[Readiness Probe ${i}/${requiredProbes}] Target: "${service.name}". Result: ${probeSuccess ? `PASS (HTTP 200 OK, latency: ${latency}ms)` : `WAITING (${lastProbeError})`}. Cumulative: ${passedCount}/${i} passed.`,
        result: probeSuccess ? 'INFO' : 'WARNING',
      });
    }

    const avgLatency = Math.round(totalLatency / (passedCount || 1));
    const allPassed = passedCount === requiredProbes;

    attempt.verified = allPassed;
    attempt.verificationDetails = {
      probesCount: requiredProbes,
      passedCount,
      responseTimeMs: avgLatency,
    };
    if (!allPassed) {
      attempt.errorDetails = lastProbeError || `Verification probes failed (${passedCount}/${requiredProbes} passed)`;
    }
    storage.saveRecoveryAttempt(attempt);

    if (allPassed) {
      incident.status = 'RECOVERED';
      incident.resolutionTimestamp = new Date().toISOString();
      delete incident.failureReason;
      storage.saveIncident(incident);

      service.status = 'healthy';
      service.consecutiveFailures = 0;
      service.responseTimeMs = avgLatency;
      service.lastHealthCheck = new Date().toISOString();
      storage.saveService(service);

      storage.addAuditLog({
        timestamp: new Date().toISOString(),
        eventType: 'VERIFICATION_PASSED',
        relatedIncidentId: incident.id,
        serviceId: service.id,
        actionDetails: `Recovery VERIFIED for "${service.name}". Passed all ${passedCount}/${requiredProbes} readiness probes across closed-loop stabilization window (avg latency: ${avgLatency}ms). Incident closed automatically.`,
        result: 'SUCCESS',
      });

      return {
        verified: true,
        probesCount: requiredProbes,
        passedCount,
        averageResponseTimeMs: avgLatency,
        message: `Recovery verified successfully (${passedCount}/${requiredProbes} probes passed).`,
      };
    } else {
      service.status = 'unavailable';
      storage.saveService(service);

      const attempts = storage.getRecoveryAttempts(incident.id);
      if (attempts.length >= settings.maxRecoveryAttempts) {
        incident.status = 'REQUIRES_HUMAN_INTERVENTION';
        incident.failureReason = `Verification failed (${passedCount}/${requiredProbes} probes passed). Maximum recovery attempts (${settings.maxRecoveryAttempts}) exhausted. Last probe error: ${lastProbeError || 'Readiness probe failed'}.`;
        storage.saveIncident(incident);

        storage.addAuditLog({
          timestamp: new Date().toISOString(),
          eventType: 'VERIFICATION_FAILED',
          relatedIncidentId: incident.id,
          serviceId: service.id,
          actionDetails: `Recovery verification FAILED (${passedCount}/${requiredProbes} passed). Max recovery attempts reached. Escalating to human intervention. Reason: ${incident.failureReason}`,
          result: 'FAILURE',
        });
      } else {
        incident.status = 'RECOVERY_FAILED';
        incident.failureReason = `Verification failed: only ${passedCount}/${requiredProbes} readiness probes passed. Last probe error: ${lastProbeError || 'Readiness probe returned non-200 or timed out'}.`;
        storage.saveIncident(incident);

        storage.addAuditLog({
          timestamp: new Date().toISOString(),
          eventType: 'VERIFICATION_FAILED',
          relatedIncidentId: incident.id,
          serviceId: service.id,
          actionDetails: `Recovery verification FAILED (${passedCount}/${requiredProbes} passed). Service remains degraded. Reason: ${incident.failureReason}`,
          result: 'WARNING',
        });
      }

      return {
        verified: false,
        probesCount: requiredProbes,
        passedCount,
        averageResponseTimeMs: avgLatency,
        message: `Verification failed: only ${passedCount}/${requiredProbes} probes succeeded. ${lastProbeError}`,
      };
    }
  }
}

export const verificationEngine = new VerificationEngine();
