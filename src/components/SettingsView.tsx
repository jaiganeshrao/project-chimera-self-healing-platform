import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import {
  Settings,
  Save,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Activity,
  Lock,
  Cpu,
  HardDrive,
  Clock,
  Zap,
  UserCheck,
  Bot,
  AlertCircle,
  Terminal,
  Ban,
  Check,
  Volume2,
  VolumeX,
  BellRing,
  Radio,
} from 'lucide-react';

interface SettingsViewProps {
  settings: SystemSettings | null;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  isMuted?: boolean;
  onToggleMute?: () => void;
  criticalOnly?: boolean;
  onToggleCriticalOnly?: () => void;
  onTestSound?: () => void;
}

const DEFAULT_FACTORY_SETTINGS: SystemSettings = {
  monitoringIntervalSec: 4,
  timeoutMs: 3000,
  errorRateThresholdPct: 25,
  cpuWarningThresholdPct: 70,
  cpuThresholdPct: 80,
  memoryWarningThresholdPct: 75,
  memoryThresholdPct: 85,
  maxRecoveryAttempts: 3,
  recoveryCooldownSec: 25,
  autoRecoveryEnabled: true,
  verificationProbesCount: 5,
  allowedHosts: ['localhost', '127.0.0.1', 'ais-dev', '0.0.0.0', 'chimera-self-healing-platform.com'],
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  isMuted = false,
  onToggleMute,
  criticalOnly = true,
  onToggleCriticalOnly,
  onTestSound,
}) => {
  const [formData, setFormData] = useState<SystemSettings>(() => ({
    ...DEFAULT_FACTORY_SETTINGS,
    ...(settings || {}),
  }));

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        ...settings,
        cpuWarningThresholdPct: settings.cpuWarningThresholdPct ?? 70,
        memoryWarningThresholdPct: settings.memoryWarningThresholdPct ?? 75,
      }));
    }
  }, [settings]);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotification, setSaveNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    timestamp?: string;
  } | null>(null);

  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const validateSettings = (data: SystemSettings): string[] => {
    const errors: string[] = [];

    if (
      !Number.isInteger(data.monitoringIntervalSec) ||
      data.monitoringIntervalSec < 1 ||
      data.monitoringIntervalSec > 60
    ) {
      errors.push('Probe interval must be an integer between 1 and 60 seconds.');
    }

    if (!Number.isInteger(data.timeoutMs) || data.timeoutMs < 500 || data.timeoutMs > 10000) {
      errors.push('Response timeout must be an integer between 500 and 10,000 milliseconds.');
    }

    const cpuWarn = data.cpuWarningThresholdPct ?? 70;
    const cpuCrit = data.cpuThresholdPct;
    if (cpuWarn < 10 || cpuWarn > 98) {
      errors.push('CPU Warning threshold must be between 10% and 98%.');
    }
    if (cpuCrit < 20 || cpuCrit > 99) {
      errors.push('CPU Critical threshold must be between 20% and 99%.');
    }
    if (cpuWarn >= cpuCrit) {
      errors.push(
        `CPU Warning threshold (${cpuWarn}%) must be strictly lower than CPU Critical threshold (${cpuCrit}%).`
      );
    }

    const memWarn = data.memoryWarningThresholdPct ?? 75;
    const memCrit = data.memoryThresholdPct;
    if (memWarn < 10 || memWarn > 98) {
      errors.push('Memory Warning threshold must be between 10% and 98%.');
    }
    if (memCrit < 20 || memCrit > 99) {
      errors.push('Memory Critical threshold must be between 20% and 99%.');
    }
    if (memWarn >= memCrit) {
      errors.push(
        `Memory Warning threshold (${memWarn}%) must be strictly lower than Memory Critical threshold (${memCrit}%).`
      );
    }

    if (
      !Number.isInteger(data.recoveryCooldownSec) ||
      data.recoveryCooldownSec < 5 ||
      data.recoveryCooldownSec > 300
    ) {
      errors.push('Recovery cooldown must be an integer between 5 and 300 seconds.');
    }

    if (
      !Number.isInteger(data.maxRecoveryAttempts) ||
      data.maxRecoveryAttempts < 1 ||
      data.maxRecoveryAttempts > 10
    ) {
      errors.push('Maximum recovery attempts must be an integer between 1 and 10.');
    }

    if (
      !Number.isInteger(data.verificationProbesCount) ||
      data.verificationProbesCount < 1 ||
      data.verificationProbesCount > 10
    ) {
      errors.push('Verification probes count must be an integer between 1 and 10.');
    }

    return errors;
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveNotification(null);

    const errors = validateSettings(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSaveNotification({
        type: 'error',
        message: 'Please resolve the validation errors highlighted below before saving.',
      });
      return;
    }

    setValidationErrors([]);
    setIsSaving(true);

    try {
      await onUpdateSettings(formData);
      setSaveNotification({
        type: 'success',
        message:
          'Engine configuration successfully updated and synchronized with the backend monitoring daemon.',
        timestamp: new Date().toLocaleTimeString(),
      });
      setTimeout(() => {
        setSaveNotification((prev) => (prev?.type === 'success' ? null : prev));
      }, 6000);
    } catch (err: any) {
      setSaveNotification({
        type: 'error',
        message: err.message || 'Failed to save settings to the backend storage daemon.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    setValidationErrors([]);
    try {
      await onUpdateSettings(DEFAULT_FACTORY_SETTINGS);
      setFormData(DEFAULT_FACTORY_SETTINGS);
      setShowResetConfirmModal(false);
      setSaveNotification({
        type: 'success',
        message:
          'Factory baseline settings restored and synchronized with backend monitoring daemon.',
        timestamp: new Date().toLocaleTimeString(),
      });
      setTimeout(() => {
        setSaveNotification((prev) => (prev?.type === 'success' ? null : prev));
      }, 6000);
    } catch (err: any) {
      setSaveNotification({
        type: 'error',
        message: err.message || 'Failed to restore default settings.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const cpuWarn = formData.cpuWarningThresholdPct ?? 70;
  const cpuCrit = formData.cpuThresholdPct;
  const memWarn = formData.memoryWarningThresholdPct ?? 75;
  const memCrit = formData.memoryThresholdPct;

  return (
    <div className="max-w-5xl space-y-6 pb-12">
      {/* Page Header with Real-Time Backend Status */}
      <div className="surface-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20] shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-[#252525] tracking-tight">
                Engine Architecture & Autonomous Governance
              </h2>
              <p className="text-xs text-[#555555] mt-0.5">
                Tune SLA probe frequencies, multi-tier saturation alerts, autonomous self-healing
                postures, and safety rails.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-mono text-[#16A34A] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              Live Backend Enforced
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#F4F4F2] border border-[#DEDEDA] text-xs font-mono text-[#555555]">
              Storage: Persistent JSON
            </span>
          </div>
        </div>
      </div>

      {/* Global Notification Banner */}
      {saveNotification && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            saveNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-[#252525]'
              : 'bg-red-50 border-red-200 text-[#252525]'
          }`}
        >
          {saveNotification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs font-mono leading-relaxed">
            <span
              className={`font-semibold block text-sm font-sans mb-0.5 ${
                saveNotification.type === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {saveNotification.type === 'success' ? 'Configuration Synchronized' : 'Action Failed'}
            </span>
            <span className="text-[#555555]">{saveNotification.message}</span>
            {saveNotification.timestamp && (
              <span className="text-[11px] text-[#777770] block mt-1">
                Last synchronized: {saveNotification.timestamp}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSaveNotification(null)}
            className="text-[#555555] hover:text-[#252525] text-xs font-mono px-2 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Validation Error Summary */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-[#DC2626] text-xs font-bold font-mono uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Validation Errors Detected ({validationErrors.length})</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-[#252525] font-mono">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: MONITORING CONFIGURATION */}
        <div className="surface-card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DEDEDA]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-[#252525]">
                  1. Monitoring Configuration
                </h3>
                <p className="text-xs text-[#555555] mt-0.5">
                  Configure SLA health check probing cadence, response latency budgets, and
                  multi-tier resource saturation thresholds.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              Backend Loop Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Probe Interval */}
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-[#252525] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C65D20]" />
                  <span>Probe Interval</span>
                </label>
                <span className="text-xs font-mono font-semibold text-[#C65D20] px-2 py-0.5 bg-[#FCE8D8] rounded">
                  {formData.monitoringIntervalSec}s
                </span>
              </div>

              <p className="text-[11px] text-[#555555] leading-relaxed">
                Pacing between consecutive health-check probe rounds dispatched across all
                registered fleet microservices. (Configurable: 1–60s, Default: 4s).
              </p>

              <div className="space-y-2 pt-1">
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={formData.monitoringIntervalSec}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monitoringIntervalSec: parseInt(e.target.value) || 4,
                    })
                  }
                  className="w-full h-1.5 bg-[#DEDEDA] rounded-lg appearance-none cursor-pointer accent-[#C65D20]"
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 4, 10, 30].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setFormData({ ...formData, monitoringIntervalSec: sec })}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                          formData.monitoringIntervalSec === sec
                            ? 'bg-[#252525] text-white font-semibold'
                            : 'bg-[#FFFFFF] border border-[#DEDEDA] text-[#555555] hover:text-[#252525]'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={formData.monitoringIntervalSec}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monitoringIntervalSec: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-16 px-2 py-1 bg-[#FFFFFF] border border-[#DEDEDA] rounded text-xs text-[#252525] font-mono text-center focus:border-[#C65D20] focus:outline-none"
                    />
                    <span className="text-xs font-mono text-[#555555]">sec</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Timeout */}
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-[#252525] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Response Timeout Budget</span>
                </label>
                <span className="text-xs font-mono font-semibold text-[#D97706] px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
                  {formData.timeoutMs} ms
                </span>
              </div>

              <p className="text-[11px] text-[#555555] leading-relaxed">
                Health probe timeout ceiling. Responses exceeding this threshold trigger a
                REQUEST_TIMEOUT degradation incident. (Configurable: 500–10000ms, Default: 3000ms).
              </p>

              <div className="space-y-2 pt-1">
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="250"
                  value={formData.timeoutMs}
                  onChange={(e) =>
                    setFormData({ ...formData, timeoutMs: parseInt(e.target.value) || 3000 })
                  }
                  className="w-full h-1.5 bg-[#DEDEDA] rounded-lg appearance-none cursor-pointer accent-[#C65D20]"
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {[1000, 2000, 3000, 5000].map((ms) => (
                      <button
                        key={ms}
                        type="button"
                        onClick={() => setFormData({ ...formData, timeoutMs: ms })}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                          formData.timeoutMs === ms
                            ? 'bg-[#252525] text-white font-semibold'
                            : 'bg-[#FFFFFF] border border-[#DEDEDA] text-[#555555] hover:text-[#252525]'
                        }`}
                      >
                        {ms / 1000}s
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="500"
                      max="10000"
                      step="100"
                      value={formData.timeoutMs}
                      onChange={(e) =>
                        setFormData({ ...formData, timeoutMs: parseInt(e.target.value) || 500 })
                      }
                      className="w-20 px-2 py-1 bg-[#FFFFFF] border border-[#DEDEDA] rounded text-xs text-[#252525] font-mono text-center focus:border-[#C65D20] focus:outline-none"
                    />
                    <span className="text-xs font-mono text-[#555555]">ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CPU Warning & Critical Thresholds */}
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DEDEDA]">
                <label className="text-xs font-mono font-semibold text-[#252525] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#C65D20]" />
                  <span>CPU Telemetry Saturation Thresholds</span>
                </label>
                <span className="text-[10px] font-mono text-[#777770]">Warn vs Crit</span>
              </div>

              <p className="text-[11px] text-[#555555] leading-relaxed">
                Dual-tier thresholds: Warning classifies service as degraded and alerts telemetry
                logs. Critical triggers automated diagnosis and thread pool recycling remediation.
              </p>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 bg-[#FFFFFF] border border-amber-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#D97706] flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                      Warning
                    </span>
                    <span className="font-semibold text-[#252525]">{cpuWarn}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="98"
                    value={cpuWarn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cpuWarningThresholdPct: parseInt(e.target.value) || 70,
                      })
                    }
                    className="w-full h-1.5 bg-[#ECECE8] rounded-lg appearance-none cursor-pointer accent-[#D97706]"
                  />
                  <div className="text-[10px] font-mono text-[#777770]">Default: 70%</div>
                </div>

                <div className="p-3 bg-[#FFFFFF] border border-red-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#DC2626] flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                      Critical
                    </span>
                    <span className="font-semibold text-[#252525]">{cpuCrit}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="99"
                    value={cpuCrit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cpuThresholdPct: parseInt(e.target.value) || 80,
                      })
                    }
                    className="w-full h-1.5 bg-[#ECECE8] rounded-lg appearance-none cursor-pointer accent-[#DC2626]"
                  />
                  <div className="text-[10px] font-mono text-[#777770]">Default: 80%</div>
                </div>
              </div>

              {cpuWarn >= cpuCrit && (
                <div className="text-[11px] font-mono text-[#DC2626] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Warning threshold must be strictly lower than Critical threshold.</span>
                </div>
              )}
            </div>

            {/* Memory Warning & Critical Thresholds */}
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DEDEDA]">
                <label className="text-xs font-mono font-semibold text-[#252525] flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#C65D20]" />
                  <span>Memory Saturation Thresholds</span>
                </label>
                <span className="text-[10px] font-mono text-[#777770]">Warn vs Crit</span>
              </div>

              <p className="text-[11px] text-[#555555] leading-relaxed">
                Dual-tier thresholds: Warning identifies progressive leak slope. Critical triggers
                container cache reset, garbage collection, and safe worker recycle.
              </p>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 bg-[#FFFFFF] border border-amber-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#D97706] flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                      Warning
                    </span>
                    <span className="font-semibold text-[#252525]">{memWarn}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="98"
                    value={memWarn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memoryWarningThresholdPct: parseInt(e.target.value) || 75,
                      })
                    }
                    className="w-full h-1.5 bg-[#ECECE8] rounded-lg appearance-none cursor-pointer accent-[#D97706]"
                  />
                  <div className="text-[10px] font-mono text-[#777770]">Default: 75%</div>
                </div>

                <div className="p-3 bg-[#FFFFFF] border border-red-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#DC2626] flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                      Critical
                    </span>
                    <span className="font-semibold text-[#252525]">{memCrit}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="99"
                    value={memCrit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memoryThresholdPct: parseInt(e.target.value) || 85,
                      })
                    }
                    className="w-full h-1.5 bg-[#ECECE8] rounded-lg appearance-none cursor-pointer accent-[#DC2626]"
                  />
                  <div className="text-[10px] font-mono text-[#777770]">Default: 85%</div>
                </div>
              </div>

              {memWarn >= memCrit && (
                <div className="text-[11px] font-mono text-[#DC2626] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Warning threshold must be strictly lower than Critical threshold.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: RECOVERY CONFIGURATION */}
        <div className="surface-card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DEDEDA]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#16A34A]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-[#252525]">
                  2. Recovery Configuration & Retry Limits
                </h3>
                <p className="text-xs text-[#555555] mt-0.5">
                  Configure cooldown windows, retry ceilings, and readiness probe verification passes.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              Anti-Flapping Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Recovery Cooldown */}
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-[#252525]">
                    Recovery Cooldown
                  </label>
                  <span className="text-xs font-mono font-semibold text-[#C65D20] px-2 py-0.5 bg-[#FCE8D8] rounded">
                    {formData.recoveryCooldownSec}s
                  </span>
                </div>
                <p className="text-[11px] text-[#555555] mt-2 leading-relaxed">
                  Enforces a mandatory stabilization window following an automated remediation
                  attempt. Prevents thrashing and rapid restart flapping loops. (5–300s, Default:
                  25s).
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={formData.recoveryCooldownSec}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recoveryCooldownSec: parseInt(e.target.value) || 25,
                    })
                  }
                  className="w-full h-1.5 bg-[#DEDEDA] rounded-lg appearance-none cursor-pointer accent-[#C65D20]"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-[#777770]">
                  <span>Min: 5s</span>
                  <span>Default: 25s</span>
                  <span>Max: 300s</span>
                </div>
              </div>
            </div>

            {/* Maximum Recovery Attempts */}
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-[#252525]">
                    Max Recovery Attempts
                  </label>
                  <span className="text-xs font-mono font-semibold text-[#D97706] px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
                    {formData.maxRecoveryAttempts} attempts
                  </span>
                </div>
                <p className="text-[11px] text-[#555555] mt-2 leading-relaxed">
                  Upper bound on automated recovery retries per incident. Once reached, retries
                  terminate and escalate to human intervention. (1–10, Default: 3).
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.maxRecoveryAttempts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxRecoveryAttempts: parseInt(e.target.value) || 3,
                    })
                  }
                  className="w-full h-1.5 bg-[#DEDEDA] rounded-lg appearance-none cursor-pointer accent-[#C65D20]"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-[#777770]">
                  <span>1 attempt</span>
                  <span>Default: 3</span>
                  <span>10 attempts</span>
                </div>
              </div>
            </div>

            {/* Verification Probes Count */}
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-[#252525]">
                    Verification Probes Count
                  </label>
                  <span className="text-xs font-mono font-semibold text-[#16A34A] px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                    {formData.verificationProbesCount} probes
                  </span>
                </div>
                <p className="text-[11px] text-[#555555] mt-2 leading-relaxed">
                  Consecutive passing health check probes required across the 20–30s stabilization
                  window before marking the service RECOVERED. (1–10, Default: 5).
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.verificationProbesCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      verificationProbesCount: parseInt(e.target.value) || 5,
                    })
                  }
                  className="w-full h-1.5 bg-[#DEDEDA] rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-[#777770]">
                  <span>1 probe</span>
                  <span>Default: 5</span>
                  <span>10 probes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hard Stop Guarantee Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <Ban className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold text-[#252525] block text-sm mb-0.5">
                Automatic Retry Termination Guarantee
              </span>
              <p className="text-[#555555]">
                When an incident reaches the configured maximum recovery attempts limit (currently{' '}
                <strong className="text-[#252525] font-mono">{formData.maxRecoveryAttempts}</strong>
                ), Project Chimera{' '}
                <strong className="text-[#252525]">automatically stops all automated retries</strong>
                , changes the incident status to{' '}
                <span className="px-1.5 py-0.5 bg-white border border-amber-200 rounded text-[11px] font-mono text-[#D97706] font-medium">
                  REQUIRES_HUMAN_INTERVENTION
                </span>
                , and records an escalation audit log. No infinite retry loops occur.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: OPERATING MODE */}
        <div className="surface-card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DEDEDA]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-[#252525]">
                  3. Operating Mode & Remediation Posture
                </h3>
                <p className="text-xs text-[#555555] mt-0.5">
                  Select between full machine autonomy or Human-In-The-Loop approval for recovery
                  dispatches.
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${
                formData.autoRecoveryEnabled
                  ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                  : 'bg-amber-50 text-[#D97706] border-amber-200'
              }`}
            >
              {formData.autoRecoveryEnabled ? 'AUTONOMOUS ACTIVE' : 'HUMAN APPROVAL REQUIRED'}
            </span>
          </div>

          {/* Current Operating Mode Status Display */}
          <div
            className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              formData.autoRecoveryEnabled
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                  formData.autoRecoveryEnabled
                    ? 'bg-white text-[#16A34A] border-emerald-200'
                    : 'bg-white text-[#D97706] border-amber-200'
                }`}
              >
                {formData.autoRecoveryEnabled ? (
                  <Bot className="w-5 h-5" />
                ) : (
                  <UserCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="text-[11px] font-mono text-[#555555] uppercase tracking-wider">
                  Currently Active Engine Posture
                </div>
                <div className="text-base font-heading font-semibold text-[#252525]">
                  {formData.autoRecoveryEnabled
                    ? 'Autonomous Self-Healing Mode'
                    : 'Human Approval Required (HITL Mode)'}
                </div>
              </div>
            </div>

            <div className="text-xs font-mono sm:text-right">
              <div className="text-[11px] text-[#555555]">Backend Execution:</div>
              <div
                className={
                  formData.autoRecoveryEnabled
                    ? 'text-[#16A34A] font-semibold'
                    : 'text-[#D97706] font-semibold'
                }
              >
                {formData.autoRecoveryEnabled
                  ? 'Policies Execute Automatically'
                  : 'Remediation Held for Approval'}
              </div>
            </div>
          </div>

          {/* Two Selectable Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Mode 1: Autonomous Healing */}
            <div
              onClick={() => setFormData({ ...formData, autoRecoveryEnabled: true })}
              className={`p-5 rounded-xl border transition-colors cursor-pointer ${
                formData.autoRecoveryEnabled
                  ? 'bg-[#FFFFFF] border-[#C65D20] ring-1 ring-[#C65D20]'
                  : 'bg-[#F4F4F2] border-[#DEDEDA] hover:border-[#252525]/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.autoRecoveryEnabled
                        ? 'bg-[#FCE8D8] text-[#C65D20]'
                        : 'bg-[#FFFFFF] border border-[#DEDEDA] text-[#555555]'
                    }`}
                  >
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-semibold text-[#252525]">
                      Autonomous Healing
                    </h4>
                    <span className="text-[11px] font-mono text-[#C65D20]">
                      Zero-Latency Closed Loop
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    formData.autoRecoveryEnabled
                      ? 'border-[#C65D20] bg-[#C65D20] text-white'
                      : 'border-[#C8C8C2] bg-[#FFFFFF]'
                  }`}
                >
                  {formData.autoRecoveryEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <p className="text-xs text-[#555555] mt-3.5 leading-relaxed">
                Execute approved recovery policies automatically upon ML fault diagnosis.
                Self-healing dispatches within milliseconds and verifies recovery across 5 probe
                cycles without human intervention.
              </p>

              <div className="mt-4 pt-3 border-t border-[#DEDEDA] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#777770]">Workflow:</span>
                <span className="text-[#252525] font-medium">Detect → ML Diagnose → Auto-Heal</span>
              </div>
            </div>

            {/* Mode 2: Human Approval */}
            <div
              onClick={() => setFormData({ ...formData, autoRecoveryEnabled: false })}
              className={`p-5 rounded-xl border transition-colors cursor-pointer ${
                !formData.autoRecoveryEnabled
                  ? 'bg-[#FFFFFF] border-[#C65D20] ring-1 ring-[#C65D20]'
                  : 'bg-[#F4F4F2] border-[#DEDEDA] hover:border-[#252525]/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      !formData.autoRecoveryEnabled
                        ? 'bg-[#FCE8D8] text-[#C65D20]'
                        : 'bg-[#FFFFFF] border border-[#DEDEDA] text-[#555555]'
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-semibold text-[#252525]">
                      Human Approval
                    </h4>
                    <span className="text-[11px] font-mono text-[#D97706]">
                      Human-In-The-Loop (HITL)
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    !formData.autoRecoveryEnabled
                      ? 'border-[#C65D20] bg-[#C65D20] text-white'
                      : 'border-[#C8C8C2] bg-[#FFFFFF]'
                  }`}
                >
                  {!formData.autoRecoveryEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <p className="text-xs text-[#555555] mt-3.5 leading-relaxed">
                Require explicit operator approval before executing any recovery action. The
                monitoring engine detects incidents and generates full ML root-cause diagnostics,
                but remediation is held until manually authorized.
              </p>

              <div className="mt-4 pt-3 border-t border-[#DEDEDA] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#777770]">Workflow:</span>
                <span className="text-[#252525] font-medium">
                  Detect → Diagnose → Await Approval
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: SECURITY GUARDRAILS */}
        <div className="surface-card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DEDEDA]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F4F4F2] border border-[#DEDEDA] flex items-center justify-center text-[#252525]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-[#252525]">
                  4. Security Guardrails & Operational Constraints
                </h3>
                <p className="text-xs text-[#555555] mt-0.5">
                  Five immutable protections enforced by the core platform to eliminate unauthorized
                  execution and runaway loops.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              5 Guardrails Enforced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span className="font-heading text-xs font-semibold text-[#252525]">
                    Allowlisted Actions Only
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-[#16A34A] border border-emerald-200 rounded text-[10px] font-mono">
                  Enforced
                </span>
              </div>
              <p className="text-[11px] text-[#555555] leading-relaxed">
                Only the 5 validated recovery policies (Restart, Retry, Cache Reset, Thread Scale,
                Circuit Breaker) can be executed. Unauthorized actions are rejected.
              </p>
            </div>

            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#16A34A]" />
                  <span className="font-heading text-xs font-semibold text-[#252525]">
                    Zero Shell Execution
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-[#16A34A] border border-emerald-200 rounded text-[10px] font-mono">
                  Enforced
                </span>
              </div>
              <p className="text-[11px] text-[#555555] leading-relaxed">
                No arbitrary shell or bash commands are permitted. Policies dispatch exclusively via
                structured internal service hooks and container lifecycle endpoints.
              </p>
            </div>

            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#16A34A]" />
                  <span className="font-heading text-xs font-semibold text-[#252525]">
                    Approved Test Targets
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-[#16A34A] border border-emerald-200 rounded text-[10px] font-mono">
                  SSRF Filter
                </span>
              </div>
              <p className="text-[11px] text-[#555555] leading-relaxed">
                Outbound probing and simulated fault injections are restricted to validated allowlist
                hosts (<code className="text-[#C65D20] font-mono">localhost, 127.0.0.1, ais-dev</code>
                ), preventing SSRF attacks.
              </p>
            </div>

            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 text-[#16A34A]" />
                  <span className="font-heading text-xs font-semibold text-[#252525]">
                    Bounded Recovery Retries
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-[#16A34A] border border-emerald-200 rounded text-[10px] font-mono">
                  Bounded
                </span>
              </div>
              <p className="text-[11px] text-[#555555] leading-relaxed">
                Automated remediation strictly respects the attempt limit (
                {formData.maxRecoveryAttempts}). Recovery terminates automatically if the threshold
                is met, avoiding endless retry thrashing.
              </p>
            </div>

            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#16A34A]" />
                  <span className="font-heading text-xs font-semibold text-[#252525]">
                    Human Intervention Escalation
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-[#16A34A] border border-emerald-200 rounded text-[10px] font-mono">
                  Fail-Safe
                </span>
              </div>
              <p className="text-[11px] text-[#555555] leading-relaxed">
                When automated remediation policies fail to restore health or exceed attempt quotas,
                the incident transitions to{' '}
                <code className="text-[#D97706] font-mono font-medium">
                  REQUIRES_HUMAN_INTERVENTION
                </code>{' '}
                and alerts the operations on-call engineer, halting automated intervention.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 5: SOUND & ALERT NOTIFICATION CONTROLS */}
        <div className="surface-card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DEDEDA]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20]">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-[#252525]">
                  5. Alert Audio & Notification Controls
                </h3>
                <p className="text-xs text-[#555555] mt-0.5">
                  Configure acoustic warning alarm tones, critical incident severity gates, and
                  single-alert session deduplication.
                </p>
              </div>
            </div>
            <span
              className={`text-[11px] font-mono px-2.5 py-1 rounded-md border ${
                !isMuted
                  ? 'text-[#16A34A] bg-emerald-50 border-emerald-200'
                  : 'text-[#D97706] bg-amber-50 border-amber-200'
              }`}
            >
              {!isMuted ? 'Audio Enabled' : 'Audio Muted'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Master Sound Alert */}
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#252525] flex items-center gap-1.5">
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-[#777770]" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    )}
                    <span>Master Sound Alert</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      !isMuted
                        ? 'text-[#16A34A] bg-emerald-50 border-emerald-200'
                        : 'text-[#555555] bg-[#FFFFFF] border-[#DEDEDA]'
                    }`}
                  >
                    {!isMuted ? 'SOUND ON' : 'MUTED'}
                  </span>
                </div>

                <p className="text-[11px] text-[#555555] leading-relaxed">
                  Controls the 1.0-second synthesized dual-tone warning alarm (880Hz / 988Hz)
                  generated when new incidents occur.
                </p>
              </div>

              {onToggleMute && (
                <button
                  type="button"
                  onClick={onToggleMute}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isMuted
                      ? 'bg-[#252525] hover:bg-[#3A3A3A] text-white border-[#252525]'
                      : 'bg-[#FFFFFF] hover:bg-red-50 text-[#DC2626] border-red-200'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Unmute Sound Alerts</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Mute All Audio Alerts</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Severity Filter */}
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#252525] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Severity Filter</span>
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FCE8D8] text-[#C65D20]">
                    {criticalOnly ? 'CRITICAL ONLY' : 'ALL SEVERITIES'}
                  </span>
                </div>

                <p className="text-[11px] text-[#555555] leading-relaxed">
                  {criticalOnly
                    ? 'Audio sounds exclusively for CRITICAL severity incidents (SLA breaches > 3000ms, crashes). Medium/Low warnings stay silent.'
                    : 'Audio sounds for all severity grades (Low, Medium, High, Critical) on first detection.'}
                </p>
              </div>

              {onToggleCriticalOnly && (
                <button
                  type="button"
                  onClick={onToggleCriticalOnly}
                  className="w-full py-2 px-3 rounded-lg text-xs font-mono font-medium border border-[#DEDEDA] bg-[#FFFFFF] hover:bg-[#EAEAE6] text-[#252525] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 text-[#C65D20]" />
                  <span>{criticalOnly ? 'Switch to All Incidents' : 'Switch to Critical Only'}</span>
                </button>
              )}
            </div>

            {/* Diagnostic Speaker Test */}
            <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#252525] flex items-center gap-1.5">
                    <BellRing className="w-3.5 h-3.5 text-[#C65D20]" />
                    <span>Diagnostic Speaker Test</span>
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-[#DEDEDA] bg-[#FFFFFF] text-[#252525]">
                    1000ms Alarm
                  </span>
                </div>

                <p className="text-[11px] text-[#555555] leading-relaxed">
                  Synthesizes a 1.0-second test alarm using the browser Web Audio API to verify
                  speaker output and audio context authorization.
                </p>
              </div>

              {onTestSound && (
                <button
                  type="button"
                  onClick={onTestSound}
                  className="w-full py-2 px-3 rounded-lg text-xs font-mono font-semibold text-white bg-[#C65D20] hover:bg-[#E87524] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Test Notification Sound</span>
                </button>
              )}
            </div>
          </div>

          {/* Smart Audio Deduplication Rules Banner */}
          <div className="p-4 bg-[#F4F4F2] border border-[#DEDEDA] rounded-lg space-y-2">
            <span className="text-xs font-semibold font-mono text-[#252525] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Smart Single-Alert Guarantee (Zero Audio Looping)</span>
            </span>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-[#555555] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-[#16A34A] font-mono font-bold">✓</span>
                <span>
                  <strong className="text-[#252525]">Once per Incident ID:</strong> Audio sounds
                  strictly once per unique incident ID and never repeats for unchanged states.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#16A34A] font-mono font-bold">✓</span>
                <span>
                  <strong className="text-[#252525]">Clean Recovery Stop:</strong> Audio immediately
                  cuts off as soon as the service recovers or is verified.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#16A34A] font-mono font-bold">✓</span>
                <span>
                  <strong className="text-[#252525]">Zero Startup Audio:</strong> When reloading the
                  dashboard or navigating between pages, existing incidents stay silent.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#16A34A] font-mono font-bold">✓</span>
                <span>
                  <strong className="text-[#252525]">Session Memory:</strong> Sound and mute
                  preferences are preserved throughout your application session.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* SECTION 6: SAVE AND RESET */}
        <div className="surface-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowResetConfirmModal(true)}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-[#252525] bg-[#FFFFFF] hover:bg-[#F4F4F2] border border-[#DEDEDA] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 text-[#555555]" />
              <span>Reset to Defaults</span>
            </button>
            <span className="text-[11px] text-[#777770] font-mono hidden md:inline">
              Restore factory baseline SLA
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#252525] hover:bg-[#3A3A3A] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Synchronizing with Daemon...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal for Reset to Defaults */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#252525]/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#DEDEDA] rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-[#252525]">
                  Reset Engine Settings?
                </h3>
                <p className="text-xs text-[#555555]">
                  This will restore all configurations to default factory values.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#F4F4F2] rounded-lg border border-[#DEDEDA] text-xs font-mono space-y-1.5 text-[#555555]">
              <div className="flex justify-between">
                <span>Probe Interval:</span>
                <span className="text-[#252525] font-semibold">4 seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Response Timeout:</span>
                <span className="text-[#252525] font-semibold">3000 ms</span>
              </div>
              <div className="flex justify-between">
                <span>CPU Warn / Crit:</span>
                <span className="text-[#252525] font-semibold">70% / 80%</span>
              </div>
              <div className="flex justify-between">
                <span>Memory Warn / Crit:</span>
                <span className="text-[#252525] font-semibold">75% / 85%</span>
              </div>
              <div className="flex justify-between">
                <span>Recovery Cooldown:</span>
                <span className="text-[#252525] font-semibold">25 seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Max Attempts:</span>
                <span className="text-[#252525] font-semibold">3 retries</span>
              </div>
              <div className="flex justify-between">
                <span>Operating Mode:</span>
                <span className="text-[#16A34A] font-semibold">Autonomous Healing</span>
              </div>
            </div>

            <p className="text-[11px] text-[#555555] leading-relaxed">
              All active monitoring intervals and retry limits will be reset immediately and
              synchronized with the backend storage daemon.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#555555] hover:text-[#252525] hover:bg-[#F4F4F2] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isResetting ? 'Restoring...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
