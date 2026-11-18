import React from 'react';
import { Incident, RecoveryActionType } from '../types/index.ts';
import {
  X,
  ShieldAlert,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { SeverityBadge } from './ui/StatusBadge';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onTriggerRecovery?: (incident: Incident, action: RecoveryActionType) => Promise<void>;
  onNavigateToDiagnosis: (incident: Incident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onNavigateToDiagnosis,
}) => {
  if (!incident) return null;

  const isRecovered = incident.status === 'RECOVERED';
  const isEscalated = incident.status === 'REQUIRES_HUMAN_INTERVENTION';

  return (
    <div className="fixed inset-0 z-50 bg-[#252525]/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#DEDEDA] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DEDEDA] flex items-center justify-between shrink-0 bg-[#F9F9F7]">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#DC2626]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-semibold text-[#252525] font-mono">
                  {incident.id}
                </h3>
                <span className="text-[#DEDEDA]">·</span>
                <span className="text-xs text-[#555555] font-medium">{incident.serviceName}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <SeverityBadge severity={incident.severity} />
                <span className="text-[11px] font-mono text-[#777770]">{incident.category}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#777770] hover:text-[#252525] p-1.5 rounded-lg hover:bg-[#F4F4F2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status & Lifecycle Strip */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg text-xs font-mono">
            <div>
              <span className="text-[#777770] block text-[10px] uppercase tracking-wider">
                Status
              </span>
              <span
                className={`font-semibold text-xs mt-0.5 block ${
                  isRecovered
                    ? 'text-[#16A34A]'
                    : isEscalated
                    ? 'text-[#D97706]'
                    : incident.status === 'RECOVERY_FAILED'
                    ? 'text-[#DC2626]'
                    : 'text-[#2563EB]'
                }`}
              >
                {incident.status}
              </span>
            </div>
            <div>
              <span className="text-[#777770] block text-[10px] uppercase tracking-wider">
                Detected
              </span>
              <span className="text-[#252525] text-xs mt-0.5 block font-medium">
                {new Date(incident.detectionTimestamp).toLocaleTimeString()}
              </span>
            </div>
            <div>
              <span className="text-[#777770] block text-[10px] uppercase tracking-wider">
                Recovery Attempts
              </span>
              <span className="text-[#252525] text-xs mt-0.5 block font-medium">
                {incident.recoveryAttemptsCount} attempt
                {incident.recoveryAttemptsCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Failure Reason / Escalation Details */}
          {(incident.failureReason ||
            incident.status === 'RECOVERY_FAILED' ||
            incident.status === 'REQUIRES_HUMAN_INTERVENTION') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-1.5">
              <div className="flex items-center gap-2 text-[#DC2626] font-semibold text-xs font-heading">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {incident.status === 'REQUIRES_HUMAN_INTERVENTION'
                    ? 'Autonomous Remediation Escalated to Human Intervention'
                    : 'Remediation Failure Details'}
                </span>
              </div>
              <p className="text-xs text-[#252525] font-mono leading-relaxed">
                {incident.failureReason ||
                  'Automated verification probes could not confirm healthy service state within timeout.'}
              </p>
            </div>
          )}

          {/* Suspected Root Cause */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-[#555555] uppercase tracking-wider block">
              Suspected Root Cause & Fault Dynamics
            </span>
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg text-xs text-[#252525] leading-relaxed font-mono">
              {incident.suspectedRootCause}
            </div>
          </div>

          {/* Confirmed Facts */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#555555] uppercase tracking-wider block">
              Empirical Evidence Collected
            </span>
            <div className="space-y-2">
              {(incident.confirmedFacts || []).map((fact, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg text-xs text-[#252525] font-mono"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Inference & Confidence */}
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg text-xs font-mono">
              <span className="text-[10px] text-[#777770] uppercase tracking-wider block">
                Diagnostic Engine
              </span>
              <span className="font-semibold text-[#C65D20] mt-1 block">
                {incident.diagnosticMethod}
              </span>
            </div>

            <div className="p-3.5 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg text-xs font-mono">
              <span className="text-[10px] text-[#777770] uppercase tracking-wider block">
                ML Confidence
              </span>
              <span className="font-semibold text-[#16A34A] mt-1 block">
                {incident.mlConfidence !== null
                  ? `${Math.round(incident.mlConfidence * 100)}% Match`
                  : 'Suppressed (< 0.60)'}
              </span>
            </div>
          </div>

          {/* Autonomous Self-Healing Status */}
          <div
            className={`p-4 rounded-lg space-y-3.5 border ${
              isRecovered
                ? 'bg-emerald-50/70 border-emerald-200'
                : incident.status === 'RECOVERY_FAILED'
                ? 'bg-red-50/70 border-red-200'
                : isEscalated
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-blue-50/70 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#252525] flex items-center gap-2">
                <ShieldCheck
                  className={`w-4 h-4 ${
                    isRecovered
                      ? 'text-[#16A34A]'
                      : isEscalated
                      ? 'text-[#D97706]'
                      : 'text-[#2563EB]'
                  }`}
                />
                <span className="font-heading">Autonomous Self-Healing Pipeline</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                  isRecovered
                    ? 'bg-white border-emerald-200 text-[#16A34A]'
                    : incident.status === 'RECOVERY_FAILED'
                    ? 'bg-white border-red-200 text-[#DC2626]'
                    : isEscalated
                    ? 'bg-white border-amber-200 text-[#D97706]'
                    : 'bg-white border-blue-200 text-[#2563EB]'
                }`}
              >
                {isRecovered
                  ? 'Auto-Healed & Verified'
                  : incident.status === 'RECOVERY_FAILED'
                  ? 'Remediation Unsuccessful'
                  : isEscalated
                  ? 'Human Intervention Required'
                  : 'Self-Healing Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FFFFFF] border border-[#DEDEDA] rounded-lg">
                <span className="text-[10px] text-[#777770] block font-mono uppercase tracking-wider">
                  Autonomous Policy
                </span>
                <span className="font-mono font-semibold text-[#C65D20] mt-1 block">
                  {incident.recommendedAction}
                </span>
                <span className="text-[10px] text-[#555555] mt-1 block">
                  Dispatched automatically without human intervention
                </span>
              </div>

              <div className="p-3 bg-[#FFFFFF] border border-[#DEDEDA] rounded-lg">
                <span className="text-[10px] text-[#777770] block font-mono uppercase tracking-wider">
                  Multi-Probe Verification
                </span>
                <span className="font-mono font-semibold text-[#252525] mt-1 block">
                  {isRecovered
                    ? '5/5 Readiness Probes Passed'
                    : 'Active Multi-Probe Verification (5 Probes)'}
                </span>
                <span className="text-[10px] text-[#555555] mt-1 block">
                  Continuous health probe stabilization over 20-30s
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#555555] leading-relaxed">
              Faults are cleared automatically by Project Chimera&apos;s closed-loop engine. When a
              degradation occurs, telemetry is diagnosed by machine learning and the allowlisted
              recovery policy is dispatched, followed by 5 readiness verification probes across a
              20–30s recovery window without requiring manual intervention.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#DEDEDA] flex items-center justify-between shrink-0 bg-[#F9F9F7]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToDiagnosis(incident);
            }}
            className="text-xs text-[#C65D20] hover:text-[#E87524] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Open in Full Root-Cause Analysis Studio</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#252525] hover:bg-[#3A3A3A] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
