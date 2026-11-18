import React from 'react';
import { NavTab } from './Sidebar';
import {
  RefreshCw,
  Flame,
  Volume2,
  VolumeX,
  BellRing,
  Activity,
  Radio,
  Menu,
} from 'lucide-react';

interface TopBarProps {
  currentTab: NavTab;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSimulator: () => void;
  autoRecoveryEnabled: boolean;
  isMuted?: boolean;
  criticalOnly?: boolean;
  onToggleMute?: () => void;
  onToggleCriticalOnly?: () => void;
  onTestSound?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onRefresh,
  isRefreshing,
  onOpenSimulator,
  autoRecoveryEnabled,
  isMuted = false,
  criticalOnly = true,
  onToggleMute,
  onTestSound,
  onOpenMobileSidebar,
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'System Overview',
      subtitle: 'Real-time telemetry, service health fleet, and self-healing KPIs',
    },
    services: {
      title: 'Service Health Fleet',
      subtitle: 'Continuous HTTP health probing, SLA latency metrics, and hardware utilization',
    },
    incidents: {
      title: 'Incident Desk',
      subtitle: 'Active and resolved incidents, root-cause states, and recovery lifecycles',
    },
    diagnosis: {
      title: 'Root-Cause Analysis',
      subtitle: 'Hybrid diagnostic baseline, ML classifications, and evidence correlation audit',
    },
    recovery: {
      title: 'Recovery Policies',
      subtitle: 'Allowlisted remediation policies, cooldown enforcement, and execution trails',
    },
    analytics: {
      title: 'Reliability Analytics',
      subtitle: 'MTTR, recovery success rates, failure distribution, and SLA uptime trends',
    },
    simulator: {
      title: 'Fault Simulator',
      subtitle: 'Interactive testbed to inject failure modes and demonstrate autonomous self-healing',
    },
    tools: {
      title: 'Software Engineering Tools',
      subtitle: 'Developer ecosystem, source code repositories, agile project boards, and engineering runbooks',
    },
    settings: {
      title: 'Engine Settings',
      subtitle: 'Probe intervals, SLA timeouts, resource thresholds, and security policies',
    },
  };

  const current = titles[currentTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#FFFFFF] border-b border-[#DEDEDA] flex items-center justify-between gap-4 shrink-0 z-10 sticky top-0">
      {/* Left: Mobile Menu Trigger & Title Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileSidebar && (
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-[#252525] hover:bg-[#F4F4F2] border border-[#DEDEDA] transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-[#777770] hidden sm:inline">Chimera</span>
          <span className="text-[#C8C8C2] hidden sm:inline">/</span>
          <h1 className="font-heading text-sm sm:text-base font-semibold text-[#252525] tracking-tight truncate">
            {current.title}
          </h1>
        </div>
      </div>

      {/* Center: Operational Telemetry Status Indicators */}
      <div className="hidden xl:flex items-center gap-2.5 text-xs font-mono shrink-0">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F4F4F2] border border-[#DEDEDA] whitespace-nowrap">
          <span
            className={`w-2 h-2 rounded-full ${
              autoRecoveryEnabled ? 'bg-[#16A34A]' : 'bg-[#D97706]'
            }`}
          />
          <span className="text-[#555555]">Engine:</span>
          <span className={autoRecoveryEnabled ? 'text-[#16A34A] font-semibold' : 'text-[#D97706] font-semibold'}>
            {autoRecoveryEnabled ? 'Closed-Loop Active' : 'Manual Approval'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4F4F2] border border-[#DEDEDA] text-[#555555] whitespace-nowrap">
          <Activity className="w-3.5 h-3.5 text-[#252525]" />
          <span>Probe:</span>
          <span className="text-[#252525] font-semibold">4.0s</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4F4F2] border border-[#DEDEDA] text-[#555555] whitespace-nowrap">
          <Radio className="w-3.5 h-3.5 text-[#C65D20]" />
          <span>Audio:</span>
          <span className={!isMuted ? 'text-[#252525] font-semibold' : 'text-[#777770]'}>
            {!isMuted ? (criticalOnly ? 'Critical Only' : '1s Warning') : 'Muted'}
          </span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {onTestSound && (
          <button
            type="button"
            onClick={onTestSound}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#252525] bg-[#FFFFFF] hover:bg-[#F4F4F2] border border-[#DEDEDA] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            title="Test the 1-second fault alarm audio and notification toast"
          >
            <BellRing className="w-3.5 h-3.5 text-[#C65D20]" />
            <span className="hidden sm:inline">Test Sound</span>
          </button>
        )}

        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              isMuted
                ? 'text-[#555555] bg-[#F4F4F2] hover:bg-[#EAEAE6] border-[#DEDEDA]'
                : 'text-[#252525] bg-[#FFFFFF] hover:bg-[#F4F4F2] border-[#DEDEDA]'
            }`}
            title={
              isMuted
                ? 'Sound alerts are muted. Click to enable 1-second warning sound.'
                : 'Sound alerts active. Click to mute.'
            }
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#777770]" />
                <span className="hidden md:inline font-mono text-[11px]">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="hidden md:inline font-mono text-[11px]">Sound ON</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#252525] bg-[#FFFFFF] hover:bg-[#F4F4F2] border border-[#DEDEDA] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
          title="Refresh telemetry and incidents"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C65D20]' : 'text-[#555555]'}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <button
          type="button"
          onClick={onOpenSimulator}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#C65D20] hover:bg-[#E87524] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Inject Fault</span>
        </button>
      </div>
    </header>
  );
};
