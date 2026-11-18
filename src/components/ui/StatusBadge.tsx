import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  ServiceStatus,
  IncidentStatus,
  IncidentSeverity,
  RecoveryResult,
} from '../../types';

export const ServiceStatusBadge: React.FC<{ status: ServiceStatus }> = ({ status }) => {
  const config: Record<
    ServiceStatus,
    { label: string; classes: string; dot: string; Icon: React.ComponentType<{ className?: string }> }
  > = {
    healthy: {
      label: 'Healthy',
      classes: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
      dot: 'bg-[#16A34A]',
      Icon: CheckCircle2,
    },
    degraded: {
      label: 'Degraded',
      classes: 'bg-amber-50 text-[#D97706] border-amber-200',
      dot: 'bg-[#D97706]',
      Icon: AlertTriangle,
    },
    recovering: {
      label: 'Recovering',
      classes: 'bg-blue-50 text-[#2563EB] border-blue-200',
      dot: 'bg-[#2563EB]',
      Icon: Activity,
    },
    unavailable: {
      label: 'Critical',
      classes: 'bg-red-50 text-[#DC2626] border-red-200',
      dot: 'bg-[#DC2626]',
      Icon: XCircle,
    },
  };

  const c = config[status] || config.unavailable;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border whitespace-nowrap ${c.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span>{c.label}</span>
    </span>
  );
};

export const IncidentStatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const styles: Record<IncidentStatus, string> = {
    RECOVERED: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    DETECTED: 'bg-red-50 text-[#DC2626] border-red-200',
    ANALYZING: 'bg-amber-50 text-[#D97706] border-amber-200',
    RECOVERING: 'bg-blue-50 text-[#2563EB] border-blue-200',
    VERIFYING: 'bg-blue-50 text-[#2563EB] border-blue-200',
    RECOVERY_FAILED: 'bg-red-50 text-[#DC2626] border-red-200',
    REQUIRES_HUMAN_INTERVENTION: 'bg-amber-50 text-[#D97706] border-amber-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border tracking-wide whitespace-nowrap ${
        styles[status] || 'bg-stone-100 text-[#555555] border-[#DEDEDA]'
      }`}
    >
      {status}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: IncidentSeverity }> = ({ severity }) => {
  const styles: Record<IncidentSeverity, string> = {
    CRITICAL: 'bg-red-50 text-[#DC2626] border-red-200',
    HIGH: 'bg-amber-50 text-[#D97706] border-amber-200',
    MEDIUM: 'bg-amber-50/70 text-[#B45309] border-amber-200/80',
    LOW: 'bg-blue-50 text-[#2563EB] border-blue-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border tracking-wide whitespace-nowrap ${
        styles[severity]
      }`}
    >
      {severity}
    </span>
  );
};

export const AuditResultBadge: React.FC<{ result: 'SUCCESS' | 'FAILURE' | 'INFO' | 'WARNING' }> = ({
  result,
}) => {
  const config = {
    SUCCESS: { classes: 'bg-emerald-50 text-[#16A34A] border-emerald-200', Icon: CheckCircle2 },
    FAILURE: { classes: 'bg-red-50 text-[#DC2626] border-red-200', Icon: XCircle },
    WARNING: { classes: 'bg-amber-50 text-[#D97706] border-amber-200', Icon: ShieldAlert },
    INFO: { classes: 'bg-blue-50 text-[#2563EB] border-blue-200', Icon: Info },
  }[result];

  const Icon = config.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border whitespace-nowrap ${config.classes}`}
    >
      <Icon className="w-3 h-3" />
      <span>{result}</span>
    </span>
  );
};

export const RecoveryResultBadge: React.FC<{ result: RecoveryResult }> = ({ result }) => {
  const classes =
    result === 'SUCCESS'
      ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
      : result === 'PENDING'
      ? 'bg-blue-50 text-[#2563EB] border-blue-200'
      : result === 'SKIPPED_COOLDOWN'
      ? 'bg-amber-50 text-[#D97706] border-amber-200'
      : 'bg-red-50 text-[#DC2626] border-red-200';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border tracking-wide whitespace-nowrap ${classes}`}
    >
      {result}
    </span>
  );
};
