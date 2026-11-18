import React, { useState } from 'react';
import { Incident, RecoveryActionType } from '../types';
import {
  Search,
  CheckCircle2,
  RotateCw,
  ShieldCheck,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { IncidentStatusBadge, SeverityBadge } from './ui/StatusBadge';

interface IncidentsViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onTriggerRecovery?: (incident: Incident, action?: RecoveryActionType) => Promise<void>;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.suspectedRootCause.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && inc.status !== 'RECOVERED') ||
      inc.status === statusFilter;

    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Search & Multi-Criteria Filter Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#777770] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, target, root cause, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#DEDEDA] rounded-lg text-xs text-[#252525] placeholder-[#888880] focus:outline-none focus:border-[#C65D20] focus:ring-1 focus:ring-[#C65D20]/20 w-72 transition-colors"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1 p-1 bg-[#FFFFFF] border border-[#DEDEDA] rounded-lg overflow-x-auto">
            {['ALL', 'ACTIVE', 'DETECTED', 'RECOVERING', 'RECOVERED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  statusFilter === st
                    ? 'bg-[#252525] text-white font-semibold'
                    : 'text-[#555555] hover:text-[#252525] hover:bg-[#F4F4F2]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filters */}
          <div className="flex items-center gap-1 p-1 bg-[#FFFFFF] border border-[#DEDEDA] rounded-lg overflow-x-auto">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  severityFilter === sev
                    ? 'bg-[#C65D20] text-white font-semibold'
                    : 'text-[#555555] hover:text-[#252525] hover:bg-[#F4F4F2]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-[#555555] px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#DEDEDA] whitespace-nowrap self-start xl:self-auto">
          Showing <span className="text-[#252525] font-semibold">{filtered.length}</span> of{' '}
          {incidents.length} recorded
        </div>
      </div>

      {/* Incidents Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DEDEDA] bg-[#F9F9F7] text-[#555555] font-mono text-[11px]">
                <th className="px-6 py-3.5 font-medium">Incident ID</th>
                <th className="px-4 py-3.5 font-medium">Target Service</th>
                <th className="px-4 py-3.5 font-medium">Failure Category</th>
                <th className="px-4 py-3.5 font-medium">Severity</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium">Diagnosed Root Cause</th>
                <th className="px-4 py-3.5 font-medium">Detection Time</th>
                <th className="px-6 py-3.5 font-medium text-right">Autonomous Healing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDEDA]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-[#555555] text-xs">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-2.5 text-[#16A34A]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-[#252525] text-sm block">
                      No matching incidents found
                    </span>
                    <span className="text-xs text-[#777770] mt-1 block">
                      Adjust filters or search criteria to inspect other incident records.
                    </span>
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => {
                  const isRecovered = inc.status === 'RECOVERED';
                  const isFailed = inc.status === 'RECOVERY_FAILED';
                  const isEscalated = inc.status === 'REQUIRES_HUMAN_INTERVENTION';

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="hover:bg-[#F4F4F2]/70 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-3.5 font-mono font-semibold text-[#C65D20] whitespace-nowrap">
                        {inc.id}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#252525] whitespace-nowrap">
                        {inc.serviceName}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[#555555] whitespace-nowrap">
                        {inc.category}
                      </td>
                      <td className="px-4 py-3.5">
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="px-4 py-3.5">
                        <IncidentStatusBadge status={inc.status} />
                      </td>
                      <td className="px-4 py-3.5 text-[#555555] max-w-xs truncate">
                        {inc.suspectedRootCause}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[#555555] tabular-nums whitespace-nowrap">
                        {new Date(inc.detectionTimestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        {isRecovered ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#16A34A] bg-emerald-50 border border-emerald-200 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Healed{' '}
                            {inc.resolutionTimestamp
                              ? `(${Math.max(
                                  1,
                                  Math.round(
                                    (new Date(inc.resolutionTimestamp).getTime() -
                                      new Date(inc.detectionTimestamp).getTime()) /
                                      1000
                                  )
                                )}s)`
                              : ''}
                          </span>
                        ) : inc.status === 'RECOVERING' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#2563EB] bg-blue-50 border border-blue-200 font-medium">
                            <RotateCw className="w-3.5 h-3.5 animate-spin" /> Self-Healing...
                          </span>
                        ) : inc.status === 'VERIFYING' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#2563EB] bg-blue-50 border border-blue-200 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verifying...
                          </span>
                        ) : inc.status === 'DETECTED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#D97706] bg-amber-50 border border-amber-200 font-medium">
                            <Zap className="w-3.5 h-3.5" /> Diagnosing...
                          </span>
                        ) : isEscalated ? (
                          <span
                            title={inc.failureReason || 'Escalated to human operator'}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#D97706] bg-amber-50 border border-amber-200 font-medium"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Operator Required
                          </span>
                        ) : isFailed ? (
                          <span
                            title={inc.failureReason || 'Recovery failed'}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#DC2626] bg-red-50 border border-red-200 font-medium"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono text-[#555555] bg-[#F4F4F2] border border-[#DEDEDA] font-medium">
                            {inc.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
