import React from 'react';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  BrainCircuit,
  Wrench,
  BarChart3,
  Settings,
  Flame,
  ShieldCheck,
  Radio,
  FolderGit2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'services'
  | 'incidents'
  | 'diagnosis'
  | 'recovery'
  | 'analytics'
  | 'simulator'
  | 'tools'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeIncidentsCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeIncidentsCount,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
    { id: 'services', label: 'Service Health', icon: Activity },
    { id: 'incidents', label: 'Incident Desk', icon: AlertTriangle, badge: activeIncidentsCount },
    { id: 'diagnosis', label: 'Root-Cause Analysis', icon: BrainCircuit },
    { id: 'recovery', label: 'Recovery Policies', icon: Wrench },
    { id: 'analytics', label: 'Reliability Analytics', icon: BarChart3 },
    { id: 'simulator', label: 'Fault Simulator', icon: Flame },
    { id: 'tools', label: 'Software Engineering Tools', icon: FolderGit2 },
    { id: 'settings', label: 'Engine Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const renderSidebarContent = (collapsed: boolean, isMobile = false) => (
    <div className="flex flex-col h-full bg-[#252525] text-white select-none">
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-[#343434] shrink-0 ${
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#C65D20] flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-sm font-semibold tracking-tight text-white truncate">
                Project Chimera
              </span>
              <span className="text-[11px] text-[#A8A8A2] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                Autonomous v1.0
              </span>
            </div>
          )}
        </div>

        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#A8A8A2] hover:text-white hover:bg-[#333333] transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          onToggleCollapse &&
          !collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#A8A8A2] hover:text-white hover:bg-[#333333] transition-colors cursor-pointer shrink-0"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      {/* Expand button when collapsed */}
      {!isMobile && collapsed && onToggleCollapse && (
        <div className="px-2 pt-3 flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-10 h-9 rounded-lg text-[#A8A8A2] hover:text-white hover:bg-[#333333] transition-colors flex items-center justify-center cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Modules */}
      <nav className={`flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#9A9A94]">
            Reliability Operations
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5'
                } rounded-lg text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#C65D20] text-white'
                    : 'text-[#C8C8C2] hover:text-white hover:bg-[#333333]'
                }`}
              >
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-[#9E9E98] group-hover:text-white'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded-md shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#DC2626] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#DC2626]" />
                )}
              </button>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity fixed left-[78px] -mt-8 z-50 px-2.5 py-1.5 rounded-md bg-[#252525] border border-[#3E3E3E] text-xs font-medium text-white shadow-md whitespace-nowrap">
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 ? ` (${item.badge})` : ''}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer System Telemetry Status */}
      <div
        className={`border-t border-[#343434] bg-[#1E1E1E] text-[11px] text-[#A8A8A2] shrink-0 ${
          collapsed ? 'p-3 flex flex-col items-center gap-1' : 'p-4 space-y-1.5'
        }`}
      >
        {collapsed ? (
          <div title="Watchdog Status: Active · 4s" className="flex items-center justify-center">
            <Radio className="w-4 h-4 text-[#16A34A]" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#C8C8C2]">
                <Radio className="w-3.5 h-3.5 text-[#16A34A]" />
                Watchdog Status
              </span>
              <span className="font-mono text-[#4ADE80] font-medium">Active · 4s</span>
            </div>
            <div className="text-[10px] text-[#8F8F89] font-mono truncate">
              Target: Order Processing Svc
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-[#343434] relative z-20 transition-[width] duration-200 ease-out ${
          isCollapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {renderSidebarContent(isCollapsed, false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#252525]/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10 border-r border-[#343434] shadow-xl">
            {renderSidebarContent(false, true)}
          </aside>
        </div>
      )}
    </>
  );
};
