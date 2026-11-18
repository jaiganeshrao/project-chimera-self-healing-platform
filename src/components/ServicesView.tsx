import React, { useState } from 'react';
import { Service } from '../types';
import { Server, Plus, Search } from 'lucide-react';
import { ServiceStatusBadge } from './ui/StatusBadge';

interface ServicesViewProps {
  services: Service[];
  onOpenRegisterModal: () => void;
  onRefresh: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  onOpenRegisterModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.healthCheckUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#777770] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services or endpoints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#DEDEDA] rounded-lg text-xs text-[#252525] placeholder-[#888880] focus:outline-none focus:border-[#C65D20] focus:ring-1 focus:ring-[#C65D20]/20 w-72 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#FFFFFF] border border-[#DEDEDA] rounded-lg">
            {['ALL', 'HEALTHY', 'DEGRADED', 'UNAVAILABLE'].map((st) => (
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
        </div>

        <button
          type="button"
          onClick={onOpenRegisterModal}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#252525] hover:bg-[#3A3A3A] transition-colors flex items-center gap-2 self-start md:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register Target Service</span>
        </button>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((srv) => (
          <div
            key={srv.id}
            className="surface-card-interactive p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-sm font-semibold text-[#252525] truncate">
                      {srv.name}
                    </h4>
                    {srv.id === 'srv-chimera-controlled' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FCE8D8] text-[#C65D20] uppercase shrink-0 font-semibold">
                        TESTBED
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#777770] block mt-1 truncate">
                    {srv.healthCheckUrl}
                  </span>
                </div>
                <ServiceStatusBadge status={srv.status} />
              </div>

              <p className="text-xs text-[#555555] mt-3 line-clamp-2 leading-relaxed">
                {srv.description}
              </p>

              {/* Telemetry Metric Triad */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-[#DEDEDA] font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#F4F4F2] border border-[#DEDEDA]">
                  <span className="text-[10px] text-[#777770] block uppercase tracking-wider">
                    Latency
                  </span>
                  <span className="font-semibold text-[#252525] tabular-nums text-sm mt-0.5 block">
                    {srv.responseTimeMs}ms
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F4F4F2] border border-[#DEDEDA]">
                  <span className="text-[10px] text-[#777770] block uppercase tracking-wider">
                    CPU Load
                  </span>
                  <span className="font-semibold text-[#252525] tabular-nums text-sm mt-0.5 block">
                    {srv.cpuUsagePct}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F4F4F2] border border-[#DEDEDA]">
                  <span className="text-[10px] text-[#777770] block uppercase tracking-wider">
                    Memory
                  </span>
                  <span className="font-semibold text-[#252525] tabular-nums text-sm mt-0.5 block">
                    {srv.memoryUsagePct}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#DEDEDA] flex items-center justify-between text-[11px] text-[#555555] font-mono">
              <div>
                Failures: <span className="text-[#252525] font-semibold">{srv.consecutiveFailures}</span>
              </div>
              <div>
                Checked:{' '}
                <span className="text-[#252525]">
                  {new Date(srv.lastHealthCheck).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Endpoints Table */}
      <div className="surface-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DEDEDA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20]">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-sm font-semibold text-[#252525]">
              Registered Target Endpoints
            </h3>
          </div>
          <span className="text-xs text-[#555555] font-mono px-2.5 py-1 rounded-md bg-[#F4F4F2] border border-[#DEDEDA]">
            {filtered.length} targets active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DEDEDA] bg-[#F9F9F7] text-[#555555] font-mono text-[11px]">
                <th className="px-6 py-3 font-medium">Service Identifier</th>
                <th className="px-4 py-3 font-medium">Endpoint URL</th>
                <th className="px-4 py-3 font-medium">Health Status</th>
                <th className="px-4 py-3 font-medium text-right">Response Time</th>
                <th className="px-4 py-3 font-medium text-right">CPU / RAM</th>
                <th className="px-6 py-3 font-medium text-right">Last Health Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDEDA]">
              {filtered.map((srv) => (
                <tr key={srv.id} className="hover:bg-[#F4F4F2]/70 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-[#252525]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#252525]">{srv.name}</span>
                      {srv.id === 'srv-chimera-controlled' && (
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#FCE8D8] text-[#C65D20]">
                          TESTBED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#777770]">{srv.id}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#555555] max-w-xs truncate">
                    {srv.healthCheckUrl}
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
                  <td className="px-6 py-3.5 text-right font-mono tabular-nums text-[#555555]">
                    {new Date(srv.lastHealthCheck).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
