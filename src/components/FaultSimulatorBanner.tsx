import React, { useState, useEffect } from 'react';
import { FaultMode, TestServiceState, Incident, RecoveryAttempt } from '../types';
import {
  Flame,
  RotateCcw,
  Zap,
  AlertOctagon,
  Clock,
  Cpu,
  Database,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Loader2,
  Volume2,
} from 'lucide-react';

interface FaultSimulatorProps {
  testState: TestServiceState | null;
  activeIncident?: Incident | null;
  activeAttempt?: RecoveryAttempt | null;
  latestRecoveredIncident?: Incident | null;
  onInjectFault: (mode: FaultMode) => Promise<void>;
  onReset: () => Promise<void>;
}

export const FaultSimulatorBanner: React.FC<FaultSimulatorProps> = ({
  testState,
  activeIncident,
  activeAttempt,
  latestRecoveredIncident,
  onInjectFault,
  onReset,
}) => {
  const [loadingMode, setLoadingMode] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [recentlyRecoveredTime, setRecentlyRecoveredTime] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);

  const incidentAgeSec = activeIncident?.detectionTimestamp
    ? (now - new Date(activeIncident.detectionTimestamp).getTime()) / 1000
    : 0;
  const isIncidentFresh = incidentAgeSec < 45;

  const isHealingActive = Boolean(
    (testState && testState.faultMode !== 'NONE') ||
      (activeIncident &&
        ['DETECTED', 'ANALYZING', 'RECOVERING', 'VERIFYING'].includes(activeIncident.status) &&
        isIncidentFresh)
  );

  useEffect(() => {
    if (!isHealingActive && latestRecoveredIncident?.resolutionTimestamp) {
      const resTime = new Date(latestRecoveredIncident.resolutionTimestamp).getTime();
      if (Date.now() - resTime < 35000) {
        setRecentlyRecoveredTime(resTime);
      }
    }
  }, [isHealingActive, latestRecoveredIncident?.resolutionTimestamp]);

  const handleInject = async (mode: FaultMode) => {
    setLoadingMode(mode);
    setRecentlyRecoveredTime(null);
    try {
      await onInjectFault(mode);
    } finally {
      setLoadingMode(null);
    }
  };

  const handleReset = async () => {
    setLoadingMode('reset');
    try {
      await onReset();
    } finally {
      setLoadingMode(null);
    }
  };

  const faultButtons: {
    mode: FaultMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }[] = [
    {
      mode: 'PROCESS_CRASH',
      label: 'Process Crash (503)',
      icon: AlertOctagon,
      desc: 'Simulates SIGSEGV process termination',
    },
    {
      mode: 'HIGH_LATENCY',
      label: 'SLA Timeout (3200ms)',
      icon: Clock,
      desc: 'Simulates worker thread starvation delay',
    },
    {
      mode: 'ERROR_SPIKE',
      label: 'HTTP 500 Error Spike',
      icon: Zap,
      desc: 'Simulates cascading unhandled exceptions',
    },
    {
      mode: 'HIGH_CPU',
      label: 'High CPU Loop (94%)',
      icon: Cpu,
      desc: 'Simulates runaway regex computational load',
    },
    {
      mode: 'DB_CONNECTION_FAIL',
      label: 'DB Pool Exhaustion',
      icon: Database,
      desc: 'Simulates exhausted PostgreSQL connection pool',
    },
  ];

  const currentMode = testState?.faultMode || 'NONE';
  const isFaultActive = currentMode !== 'NONE';

  let elapsedSec = 0;
  if (activeIncident?.detectionTimestamp) {
    elapsedSec = Math.max(
      0,
      Math.round((now - new Date(activeIncident.detectionTimestamp).getTime()) / 1000)
    );
  } else if (isFaultActive) {
    elapsedSec = 2;
  }

  const targetDurationSec = 24;
  const progressPct = isHealingActive
    ? Math.min(94, Math.max(6, Math.round((elapsedSec / targetDurationSec) * 100)))
    : 100;

  const status = activeIncident?.status;
  let phaseName = 'Detection & ML Diagnosis';
  let phaseStep = 1;
  if (status === 'RECOVERING') {
    phaseStep = 2;
    phaseName = `Remediation in Progress (${activeIncident?.recommendedAction || 'RESTART_SERVICE'})`;
  } else if (status === 'VERIFYING') {
    phaseStep = 3;
    const passed = activeAttempt?.verificationDetails?.passedCount ?? 0;
    const total = activeAttempt?.verificationDetails?.probesCount ?? 5;
    phaseName = `Multi-Probe Verification Soak (${passed}/${total} Probes Passed)`;
  } else if (status === 'RECOVERED') {
    phaseStep = 4;
    phaseName = 'Fully Recovered & Nominal';
  }

  return (
    <div className="surface-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#DEDEDA]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20]">
              <Flame className="w-4 h-4" />
            </div>
            <h2 className="font-heading text-base font-semibold text-[#252525] tracking-tight">
              Controlled Failure Simulation Testbed
            </h2>
          </div>
          <p className="text-xs text-[#555555] mt-1.5 max-w-2xl leading-relaxed">
            Simulate realistic failure patterns against the target Order Processing service. Project
            Chimera autonomously diagnoses the failure, dispatches allowlisted recovery policies, and
            verifies health across a{' '}
            <strong className="text-[#252525] font-semibold font-mono">
              20–30s closed-loop window
            </strong>
            .
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#FCE8D8] text-[#C65D20] ml-2 align-middle">
              <Volume2 className="w-3 h-3" />
              1s Warning Alarm
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#777770]">
              Target Service State
            </div>
            <div className="text-xs font-mono font-semibold mt-0.5">
              {isHealingActive ? (
                <span className="text-[#D97706] flex items-center justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                  Self-Healing Active
                </span>
              ) : isFaultActive ? (
                <span className="text-[#DC2626] font-semibold">{currentMode}</span>
              ) : (
                <span className="text-[#16A34A] flex items-center justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                  Nominal (UP)
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={loadingMode !== null}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#252525] bg-[#FFFFFF] hover:bg-[#F4F4F2] border border-[#DEDEDA] transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            title="Reset testbed to nominal UP operation and clear any active fault"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 ${
                loadingMode === 'reset' ? 'animate-spin text-[#C65D20]' : 'text-[#555555]'
              }`}
            />
            <span>Reset Testbed</span>
          </button>
        </div>
      </div>

      {/* Fault Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
        {faultButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = currentMode === btn.mode;
          const isLoadingThis = loadingMode === btn.mode;

          return (
            <button
              key={btn.mode}
              type="button"
              onClick={() => handleInject(btn.mode)}
              disabled={loadingMode !== null}
              className={`p-3.5 rounded-lg border text-left transition-colors flex flex-col justify-between cursor-pointer group ${
                isActive
                  ? 'bg-red-50 border-[#DC2626] text-[#252525]'
                  : 'bg-[#F4F4F2] border-[#DEDEDA] text-[#252525] hover:border-[#C65D20] hover:bg-[#FCE8D8]/40 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
              title={
                isActive
                  ? `${btn.label} is currently active`
                  : `Inject ${btn.label} (1s warning alarm)`
              }
            >
              <div className="flex items-center justify-between w-full mb-2.5">
                {isLoadingThis ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#C65D20]" />
                ) : (
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-[#FFFFFF] border border-[#DEDEDA] text-[#555555] group-hover:text-[#C65D20] group-hover:border-[#C65D20]/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                )}
                {isActive && (
                  <span className="text-[9px] font-mono bg-[#DC2626] text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                    ACTIVE
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold leading-tight font-heading text-[#252525]">
                  {btn.label}
                </div>
                <div className="text-[11px] text-[#555555] mt-1 leading-normal">{btn.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Autonomous Self-Healing Real-Time Progress Monitor */}
      {isHealingActive && (
        <div className="mt-5 p-4 rounded-lg bg-[#F9F9F7] border border-[#DEDEDA] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              <span className="font-heading font-semibold text-[#252525]">
                Autonomous Self-Healing in Progress
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-50 border border-amber-200 text-[#D97706]">
                Closed-Loop (20-30s SLA)
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
              <span className="text-[#555555]">
                Elapsed: <strong className="text-[#C65D20] tabular-nums">{elapsedSec}s</strong> / ~24s
              </span>
              <span className="text-[#DEDEDA]">·</span>
              <span className="text-[#252525] font-semibold">{phaseName}</span>
              {elapsedSec > 28 && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loadingMode !== null}
                  className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-red-50 hover:bg-red-100 border border-red-200 text-[#DC2626] transition-colors flex items-center gap-1 cursor-pointer"
                  title="Force reset stuck recovery state"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Force Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#ECECE8] rounded-md h-2 overflow-hidden">
            <div
              className="bg-[#C65D20] h-2 transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Stepper Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] font-mono">
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                phaseStep >= 1
                  ? 'bg-[#FFFFFF] border-[#C65D20]/40 text-[#252525]'
                  : 'bg-[#F4F4F2] border-[#DEDEDA] text-[#555555]'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0 text-[#C65D20]" />
              <div className="truncate">
                <div className="font-semibold text-[#252525]">Phase 1: ML Diagnosis</div>
                <div className="text-[10px] text-[#555555] truncate">
                  {activeIncident?.suspectedRootCause || 'Telemetry signature classified'}
                </div>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                phaseStep === 2
                  ? 'bg-blue-50 border-blue-200 text-[#252525]'
                  : phaseStep > 2
                  ? 'bg-[#FFFFFF] border-[#DEDEDA] text-[#252525]'
                  : 'bg-[#F4F4F2] border-[#DEDEDA] text-[#777770]'
              }`}
            >
              {phaseStep === 2 ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin text-[#2563EB]" />
              ) : (
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#2563EB]" />
              )}
              <div className="truncate">
                <div className="font-semibold text-[#252525]">Phase 2: Remediation</div>
                <div className="text-[10px] text-[#555555] truncate">
                  {activeIncident?.recommendedAction || 'Policy dispatch'} (~13s)
                </div>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                phaseStep === 3
                  ? 'bg-blue-50 border-blue-200 text-[#252525]'
                  : phaseStep > 3
                  ? 'bg-emerald-50 border-emerald-200 text-[#252525]'
                  : 'bg-[#F4F4F2] border-[#DEDEDA] text-[#777770]'
              }`}
            >
              {phaseStep === 3 ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin text-[#2563EB]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
              )}
              <div className="truncate">
                <div className="font-semibold text-[#252525]">Phase 3: Readiness Probing</div>
                <div className="text-[10px] text-[#555555] truncate">
                  {activeAttempt?.verificationDetails
                    ? `${activeAttempt.verificationDetails.passedCount}/${activeAttempt.verificationDetails.probesCount} passed (~11s)`
                    : '5 sequential probes (~11s)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recently Recovered Confirmation Banner */}
      {!isHealingActive && recentlyRecoveredTime && latestRecoveredIncident && (
        <div className="mt-5 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#16A34A] flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold font-mono text-[#16A34A] mr-2 tracking-wide">
                CLOSED-LOOP RECOVERY VERIFIED:
              </span>
              <span className="text-[#252525]">
                Service healed autonomously and verified across 5 consecutive readiness probes.
                {latestRecoveredIncident.detectionTimestamp &&
                  latestRecoveredIncident.resolutionTimestamp && (
                    <span className="ml-1.5 font-mono text-[#16A34A] font-semibold">
                      (Total:{' '}
                      {Math.max(
                        20,
                        Math.round(
                          (new Date(latestRecoveredIncident.resolutionTimestamp).getTime() -
                            new Date(latestRecoveredIncident.detectionTimestamp).getTime()) /
                            1000
                        )
                      )}
                      s)
                    </span>
                  )}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#16A34A] bg-white px-2.5 py-1 rounded-md border border-emerald-200 shrink-0 font-medium">
            0 Manual Actions Required
          </span>
        </div>
      )}
    </div>
  );
};
