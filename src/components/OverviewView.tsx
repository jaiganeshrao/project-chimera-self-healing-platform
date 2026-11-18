import React from 'react';
import {
  AnalyticsOverview,
  Incident,
  Service,
  AuditLog,
} from '../types';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  Server,
  ArrowUpRight,
  XCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';
import {
  ServiceStatusBadge,
  IncidentStatusBadge,
  AuditResultBadge,
} from './ui/StatusBadge';

interface OverviewViewProps {
  analytics: AnalyticsOverview | null;
  services: Service[];
  incidents: Incident[];
  auditLogs: AuditLog[];
  onSelectService: (service: Service) => void;
  onSelectIncident: (incident: Incident) => void;
  onGoToIncidents: () => void;
  onGoToServices: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  analytics,
  services,
  incidents,
  auditLogs,
  onSelectService,
  onSelectIncident,
  onGoToIncidents,
  onGoToServices,
}) => {
  const activeIncidents = incidents.filter((i) =>
    ['DETECTED', 'ANALYZING', 'RECOVERING', 'VERIFYING', 'REQUIRES_HUMAN_INTERVENTION'].includes(
      i.status
    )
  );

  const healthyCount =
    analytics?.healthyServices ?? services.filter((s) => s.status === 'healthy').length;
  const degradedCount =
    analytics?.degradedServices ?? services.filter((s) => s.status === 'degraded').length;
  const downCount =
    analytics?.unavailableServices ?? services.filter((s) => s.status === 'unavailable').length;
  const activeCount = analytics?.activeIncidents ?? activeIncidents.length;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Registered Fleet */}
        <div className="surface-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#555555]">
              Registered Fleet
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20]">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums text-[#252525] tracking-tight">
              {analytics?.totalServices ?? services.length}
            </span>
            <span className="text-xs text-[#555555]">targets</span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-[#DEDEDA] flex items-center gap-2 text-xs font-mono">
            <span className="text-[#16A34A] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              {healthyCount} UP
            </span>
            <span className="text-[#DEDEDA]">·</span>
            <span className="text-[#D97706]">{degradedCount} Degraded</span>
            <span className="text-[#DEDEDA]">·</span>
            <span className="text-[#DC2626]">{downCount} Down</span>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="surface-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#555555]">
              Active Incidents
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeCount > 0 ? 'bg-red-50 text-[#DC2626]' : 'bg-[#F4F4F2] text-[#252525]'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-semibold font-mono tabular-nums tracking-tight ${
                activeCount > 0 ? 'text-[#DC2626]' : 'text-[#252525]'
              }`}
            >
              {activeCount}
            </span>
            <span className="text-xs text-[#555555]">in remediation</span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-[#DEDEDA] flex items-center justify-between text-xs font-mono text-[#555555]">
            <span>Historical Total</span>
            <span className="text-[#252525] font-semibold">
              {analytics?.totalIncidentsAllTime ?? incidents.length}
            </span>
          </div>
        </div>

        {/* Recovery Success Rate */}
        <div className="surface-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#555555]">
              Recovery Success
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#16A34A]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums text-[#16A34A] tracking-tight">
              {analytics?.recoverySuccessRate ?? 100}%
            </span>
            <span className="text-xs text-[#555555]">verified</span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-[#DEDEDA] flex items-center gap-2 text-xs font-mono text-[#555555]">
            <span className="text-[#16A34A] font-medium">
              {analytics?.successfulRecoveries ?? 0} Solved
            </span>
            <span className="text-[#DEDEDA]">·</span>
            <span className="text-[#DC2626] font-medium">
              {analytics?.failedRecoveries ?? 0} Failed
            </span>
          </div>
        </div>

        {/* Mean Time to Recovery (MTTR) */}
        <div className="surface-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#555555]">
              MTTR SLA
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums text-[#C65D20] tracking-tight">
              {analytics?.meanTimeToRecoverySec ?? 24}s
            </span>
            <span className="text-xs text-[#555555]">closed loop</span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-[#DEDEDA] flex items-center justify-between text-xs font-mono text-[#555555]">
            <span>Avg Response</span>
            <span className="text-[#252525] font-semibold">
              {analytics?.averageResponseTimeMs ?? 28}ms
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Remediation Queue + Service Health Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Remediation Queue */}
        <div className="surface-card p-6 lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#DEDEDA]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20] shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-sm font-semibold text-[#252525] truncate">
                  Active Remediation Queue
                </h3>
                <p className="text-xs text-[#555555] truncate">
                  Incidents undergoing diagnosis & recovery
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onGoToIncidents}
              className="text-xs text-[#C65D20] hover:text-[#E87524] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Incident desk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center mt-4">
            {activeIncidents.length === 0 ? (
              <div className="py-10 px-4 text-center rounded-lg bg-[#F4F4F2] border border-[#DEDEDA]">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3 text-[#16A34A]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="font-semibold text-[#252525] text-sm">
                  All Services Operating Nominally
                </div>
                <p className="text-xs text-[#555555] mt-1 max-w-xs mx-auto leading-relaxed">
                  Zero active incidents in queue. Trigger a fault simulation from the top bar to
                  observe automated closed-loop healing.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#DEDEDA]">
                {activeIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="py-3.5 px-3 -mx-3 rounded-lg hover:bg-[#F4F4F2] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-semibold text-[#C65D20] shrink-0">
                          {inc.id}
                        </span>
                        <span className="text-[#DEDEDA]">·</span>
                        <span className="text-[#252525] font-medium truncate">
                          {inc.serviceName}
                        </span>
                      </div>
                      <IncidentStatusBadge status={inc.status} />
                    </div>
                    <div className="text-xs text-[#555555] mt-1.5 line-clamp-1">
                      {inc.suspectedRootCause || inc.description}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#555555] font-mono">
                      <span>Cause: {inc.category}</span>
                      <span className="text-[#DEDEDA]">·</span>
                      <span className="text-[#252525] font-medium">
                        Policy: {inc.recommendedAction}
                      </span>
                      {inc.mlConfidence !== null && (
                        <>
                          <span className="text-[#DEDEDA]">·</span>
                          <span className="text-[#16A34A] font-medium">
                            {Math.round(inc.mlConfidence * 100)}% confidence
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Service Health Table */}
        <div className="surface-card lg:col-span-7 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#DEDEDA] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#F4F4F2] border border-[#DEDEDA] flex items-center justify-center text-[#252525] shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-sm font-semibold text-[#252525] truncate">
                  Service Health Table
                </h3>
                <p className="text-xs text-[#555555] truncate">
                  Continuous telemetry, latency, and runtime resource utilization
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onGoToServices}
              className="text-xs text-[#C65D20] hover:text-[#E87524] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>All services</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DEDEDA] bg-[#F9F9F7] text-[#555555] font-mono text-[11px]">
                  <th className="px-6 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Latency</th>
                  <th className="px-4 py-3 font-medium text-right">CPU / RAM</th>
                  <th className="px-6 py-3 font-medium text-right">Monitor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEDEDA]">
                {services.map((srv) => (
                  <tr
                    key={srv.id}
                    onClick={() => onSelectService(srv)}
                    className="hover:bg-[#F4F4F2]/70 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#252525]">{srv.name}</span>
                        {srv.id === 'srv-chimera-controlled' && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#FCE8D8] text-[#C65D20]">
                            TESTBED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#777770] truncate max-w-[240px]">
                        {srv.healthCheckUrl}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <ServiceStatusBadge status={srv.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#252525] font-medium">
                      {srv.responseTimeMs}ms
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[#555555]">
                      {srv.cpuUsagePct}% · {srv.memoryUsagePct}%
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-[11px] text-[#555555] whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                        {new Date(srv.lastHealthCheck).toLocaleTimeString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Vertical Audit History Timeline */}
      <div className="surface-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#DEDEDA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F4F4F2] border border-[#DEDEDA] flex items-center justify-center text-[#252525]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-[#252525]">
                System Audit & Recovery Timeline
              </h3>
              <p className="text-xs text-[#555555]">
                Immutable operations history with verification outcomes
              </p>
            </div>
          </div>
          <span className="text-[11px] text-[#555555] font-mono px-2.5 py-1 rounded-md bg-[#F4F4F2] border border-[#DEDEDA]">
            Latest {Math.min(auditLogs.length, 6)} events
          </span>
        </div>

        <div className="mt-5">
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#555555] font-mono">
              No audit entries recorded yet.
            </div>
          ) : (
            <ol className="relative ml-3 border-l border-[#DEDEDA] space-y-5">
              {auditLogs.slice(0, 6).map((log) => {
                const DotIcon =
                  log.result === 'SUCCESS'
                    ? CheckCircle2
                    : log.result === 'FAILURE'
                    ? XCircle
                    : log.result === 'WARNING'
                    ? AlertTriangle
                    : Info;

                const dotColor =
                  log.result === 'SUCCESS'
                    ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                    : log.result === 'FAILURE'
                    ? 'bg-red-50 text-[#DC2626] border-red-200'
                    : log.result === 'WARNING'
                    ? 'bg-amber-50 text-[#D97706] border-amber-200'
                    : 'bg-blue-50 text-[#2563EB] border-blue-200';

                return (
                  <li key={log.id} className="pl-6 relative">
                    <span
                      className={`absolute -left-3 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center ${dotColor}`}
                    >
                      <DotIcon className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#252525]">
                          {log.eventType}
                        </span>
                        <AuditResultBadge result={log.result} />
                        {log.relatedIncidentId && (
                          <span className="font-mono text-[11px] text-[#C65D20]">
                            {log.relatedIncidentId}
                          </span>
                        )}
                      </div>
                      <time className="font-mono text-[11px] text-[#777770] tabular-nums shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </time>
                    </div>
                    <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                      {log.actionDetails}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};
