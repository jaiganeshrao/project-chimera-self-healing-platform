import React, { useEffect, useState } from 'react';
import { AnalyticsOverview, Incident } from '../types';
import { BarChart3, TrendingUp, Clock, Zap, ShieldCheck } from 'lucide-react';
import { IncidentStatusBadge } from './ui/StatusBadge';

interface AnalyticsViewProps {
  overview: AnalyticsOverview | null;
  incidents: Incident[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ overview, incidents }) => {
  const [reliabilityData, setReliabilityData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics/reliability')
      .then((res) => res.json())
      .then((data) => setReliabilityData(data))
      .catch((err) => console.error('Error fetching reliability analytics:', err));
  }, [incidents.length]);

  const categoryMap: Record<string, number> = {};
  for (const inc of incidents) {
    categoryMap[inc.category] = (categoryMap[inc.category] || 0) + 1;
  }

  const categoryData = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count,
  }));

  const dailyTrends = reliabilityData?.dailyTrends || [
    { day: 'Mon', failures: 1, recoveries: 1, uptimePct: 99.8 },
    { day: 'Tue', failures: 3, recoveries: 3, uptimePct: 99.4 },
    { day: 'Wed', failures: 2, recoveries: 2, uptimePct: 99.7 },
    { day: 'Thu', failures: 4, recoveries: 4, uptimePct: 99.2 },
    { day: 'Fri', failures: 2, recoveries: 2, uptimePct: 99.6 },
    { day: 'Sat', failures: 1, recoveries: 1, uptimePct: 99.9 },
    { day: 'Sun', failures: incidents.length || 2, recoveries: incidents.length || 2, uptimePct: 99.5 },
  ];

  const maxFailures = Math.max(
    ...dailyTrends.map((d: any) => Math.max(d.failures || 0, d.recoveries || 0)),
    5
  );

  const yTicks = [maxFailures, Math.round(maxFailures * 0.5), 0];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recovery Success Rate */}
        <div className="surface-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#555555]">
              Recovery Success
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#16A34A]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-[#16A34A]">
              {overview?.recoverySuccessRate ?? 100}%
            </span>
          </div>
          <p className="text-[11px] text-[#555555] mt-2 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            Autonomous verifications passed
          </p>
        </div>

        {/* MTTR */}
        <div className="surface-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#555555]">
              Mean Time to Recovery
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-[#C65D20]">
              {overview?.meanTimeToRecoverySec ?? 18}
            </span>
            <span className="text-sm font-mono text-[#555555]">sec</span>
          </div>
          <p className="text-[11px] text-[#555555] mt-2 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C65D20]" />
            Detection to multi-probe health
          </p>
        </div>

        {/* Total Remediations */}
        <div className="surface-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#555555]">
              Remediation Events
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F4F4F2] border border-[#DEDEDA] flex items-center justify-center text-[#252525]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-[#252525]">
              {overview?.successfulRecoveries ?? incidents.length}
            </span>
            <span className="text-xs font-mono text-[#16A34A] font-medium">Closed</span>
          </div>
          <p className="text-[11px] text-[#555555] mt-2 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#252525]" />
            Autonomous self-healing actions
          </p>
        </div>

        {/* SLA Availability */}
        <div className="surface-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[#555555]">
              Fleet SLA Availability
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#16A34A]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold font-mono tabular-nums tracking-tight text-[#16A34A]">
              99.64%
            </span>
          </div>
          <p className="text-[11px] text-[#555555] mt-2 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            Target uptime: &gt; 99.50%
          </p>
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="surface-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DEDEDA]">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#C65D20]" />
              <h3 className="font-heading text-sm font-semibold text-[#252525]">
                Failure Ingestion vs Autonomous Remediation
              </h3>
            </div>
            <p className="text-xs text-[#555555] mt-0.5">
              Daily trend of detected service incidents and verified self-healing closures
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#DC2626] inline-block" />
              <span className="text-[#555555]">Failures Detected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#16A34A] inline-block" />
              <span className="text-[#555555]">Recovered & Verified</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {/* Y-Axis */}
          <div className="h-52 flex flex-col justify-between text-[11px] font-mono text-[#777770] pr-2 pb-1 text-right select-none">
            {yTicks.map((tick, idx) => (
              <span key={idx}>{tick}</span>
            ))}
          </div>

          {/* Chart Plot Area */}
          <div className="flex-1 relative">
            {/* Horizontal gridlines */}
            <div className="absolute inset-x-0 top-0 h-52 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-[#ECECE8]" />
              <div className="border-t border-[#ECECE8]" />
              <div className="border-t border-[#DEDEDA]" />
            </div>

            <div className="h-52 flex items-end gap-3 sm:gap-6 px-2 relative z-10">
              {dailyTrends.map((d: any, idx: number) => {
                const failHeight = (d.failures / maxFailures) * 188;
                const recHeight = (d.recoveries / maxFailures) * 188;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-52">
                      <div
                        className="w-4 sm:w-6 bg-[#DC2626] hover:bg-[#B91C1C] rounded-t transition-colors cursor-pointer relative group"
                        style={{ height: `${Math.max(8, failHeight)}px` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white bg-[#252525] px-2 py-1 rounded shadow-sm whitespace-nowrap z-20 transition-opacity pointer-events-none">
                          {d.failures} failed
                        </span>
                      </div>

                      <div
                        className="w-4 sm:w-6 bg-[#16A34A] hover:bg-[#15803D] rounded-t transition-colors cursor-pointer relative group"
                        style={{ height: `${Math.max(8, recHeight)}px` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white bg-[#252525] px-2 py-1 rounded shadow-sm whitespace-nowrap z-20 transition-opacity pointer-events-none">
                          {d.recoveries} healed
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex gap-3 sm:gap-6 px-2 mt-2.5">
              {dailyTrends.map((d: any, idx: number) => (
                <div key={idx} className="flex-1 text-center">
                  <span className="text-xs font-mono font-medium text-[#252525] block">
                    {d.day}
                  </span>
                  <span className="text-[10px] font-mono text-[#777770]">{d.uptimePct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution & Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="surface-card p-6">
          <div className="pb-3.5 border-b border-[#DEDEDA] flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold text-[#252525]">
              Failure Category Distribution
            </h3>
            <span className="text-[11px] font-mono text-[#555555]">Root-Cause Archetypes</span>
          </div>

          <div className="mt-5 space-y-4">
            {categoryData.length === 0 ? (
              <div className="text-xs text-[#555555] py-8 text-center font-mono">
                No incidents recorded in telemetry store yet.
              </div>
            ) : (
              categoryData.map((cat, i) => {
                const total = incidents.length || 1;
                const pct = Math.round((cat.count / total) * 100);
                const barColors = ['#C65D20', '#252525', '#E87524', '#555555', '#9E9E98'];
                const barColor = barColors[i % barColors.length];

                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#252525] font-medium">{cat.name}</span>
                      <span className="text-[#555555] tabular-nums">
                        {cat.count} event{cat.count !== 1 ? 's' : ''} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#ECECE8] rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Resolution & Duration Ledger */}
        <div className="surface-card p-6">
          <div className="pb-3.5 border-b border-[#DEDEDA] flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold text-[#252525]">
              Resolution & Duration Ledger
            </h3>
            <span className="text-[11px] font-mono text-[#555555]">Recent Incidents</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DEDEDA] text-[#555555] font-mono text-[11px]">
                  <th className="pb-2.5 font-medium">Incident ID</th>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium text-right">Recovery Time</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEDEDA]">
                {incidents.slice(0, 6).map((inc) => {
                  let duration = 'Ongoing';
                  if (inc.resolutionTimestamp) {
                    const sec = Math.round(
                      (new Date(inc.resolutionTimestamp).getTime() -
                        new Date(inc.detectionTimestamp).getTime()) /
                        1000
                    );
                    duration = `${sec}s`;
                  }
                  return (
                    <tr key={inc.id} className="hover:bg-[#F4F4F2]/70 transition-colors">
                      <td className="py-2.5 font-mono text-[#C65D20] font-semibold">{inc.id}</td>
                      <td className="py-2.5 font-mono text-[#555555]">{inc.category}</td>
                      <td className="py-2.5 text-right font-mono text-[#252525] tabular-nums font-medium">
                        {duration}
                      </td>
                      <td className="py-2.5 text-right">
                        <IncidentStatusBadge status={inc.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
