import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Service,
  Incident,
  RecoveryAttempt,
  AuditLog,
  SystemSettings,
  AnalyticsOverview,
  FaultMode,
  TestServiceState,
  RecoveryActionType,
} from './types';

import { Sidebar, NavTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { FaultSimulatorBanner } from './components/FaultSimulatorBanner';
import { OverviewView } from './components/OverviewView';
import { ServicesView } from './components/ServicesView';
import { IncidentsView } from './components/IncidentsView';
import { DiagnosisView } from './components/DiagnosisView';
import { RecoveryView } from './components/RecoveryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { ToolsView } from './components/ToolsView';
import { RegisterServiceModal } from './components/RegisterServiceModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { FaultAlertToast, FaultNotification } from './components/FaultAlertToast';
import { soundAlert } from './utils/soundAlert';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [recoveryAttempts, setRecoveryAttempts] = useState<RecoveryAttempt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [testState, setTestState] = useState<TestServiceState | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [detailModalIncident, setDetailModalIncident] = useState<Incident | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fault Alert & Sound State
  const [notifications, setNotifications] = useState<FaultNotification[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundAlert.getMuted());
  const [criticalOnly, setCriticalOnly] = useState<boolean>(() => soundAlert.getCriticalOnly());

  // Tracking refs to guarantee exactly 1 alert and sound per incident ID
  const knownIncidentIdsRef = useRef<Set<string>>(new Set());
  const activeAlertIncidentIdRef = useRef<string | null>(null);
  const lastInjectedTimeRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(Date.now());
  const initialLoadRef = useRef<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);
  const incidentsRef = useRef<Incident[]>(incidents);
  incidentsRef.current = incidents;
  const testStateRef = useRef<TestServiceState | null>(testState);
  testStateRef.current = testState;

  const triggerFaultAlert = useCallback((fault: {
    title: string;
    serviceName: string;
    category?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details: string;
    incidentId?: string;
    forceSound?: boolean;
  }) => {
    // Gate: If this specific incident has already sounded an alert, do not replay
    if (fault.incidentId && soundAlert.hasSounded(fault.incidentId) && !fault.forceSound) {
      return;
    }

    // Play synthesized 1.0-second urgent warning sound (soundAlert enforces mute, critical-only, and 1-per-ID checks)
    soundAlert.playFaultSound({
      durationMs: 1000,
      force: fault.forceSound,
      incidentId: fault.incidentId,
      severity: fault.severity || 'CRITICAL',
    });

    if (fault.incidentId) {
      knownIncidentIdsRef.current.add(fault.incidentId);
      activeAlertIncidentIdRef.current = fault.incidentId;
    }

    // Dispatch system desktop notification if permission granted
    soundAlert.sendSystemNotification(
      `Chimera Alert: ${fault.title}`,
      `${fault.serviceName} - ${fault.details}`
    );

    // Display single floating toast notification
    const now = Date.now();
    const newNotif: FaultNotification = {
      id: `notif-${now}-${Math.random().toString(36).slice(2, 7)}`,
      title: fault.title,
      serviceName: fault.serviceName,
      category: fault.category,
      severity: fault.severity || 'CRITICAL',
      details: fault.details,
      timestamp: new Date().toLocaleTimeString(),
      incidentId: fault.incidentId,
    };

    setNotifications([newNotif]);
  }, []);

  const fetchAllData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const [
        servicesRes,
        incidentsRes,
        auditRes,
        settingsRes,
        analyticsRes,
        testStateRes,
      ] = await Promise.all([
        fetch('/api/services').then((r) => r.json()).catch(() => []),
        fetch('/api/incidents').then((r) => r.json()).catch(() => []),
        fetch('/api/audit-logs').then((r) => r.json()).catch(() => []),
        fetch('/api/settings').then((r) => r.json()).catch(() => null),
        fetch('/api/analytics/overview').then((r) => r.json()).catch(() => null),
        fetch('/api/test-service/metrics').then((r) => r.json()).catch(() => null),
      ]);

      if (Array.isArray(servicesRes)) setServices(servicesRes);
      if (Array.isArray(auditRes)) setAuditLogs(auditRes);
      if (settingsRes && typeof settingsRes === 'object' && !('error' in settingsRes)) setSettings(settingsRes);
      if (analyticsRes && typeof analyticsRes === 'object' && !('error' in analyticsRes)) setAnalytics(analyticsRes);

      // Process incidents and detect any newly emerging faults
      if (Array.isArray(incidentsRes)) {
        incidentsRef.current = incidentsRes;
        setIncidents(incidentsRes);

        const nowMs = Date.now();
        const isInStartupWindow = nowMs - mountTimeRef.current < 6000;

        if (initialLoadRef.current || isInStartupWindow) {
          // On baseline initial load or during the 6s startup window, mark ALL current incidents as known and sounded
          // This strictly prevents playing any old alerts when the dashboard loads or refreshes!
          const existingIds = incidentsRes.map((inc) => inc.id);
          existingIds.forEach((id) => knownIncidentIdsRef.current.add(id));
          soundAlert.markAllKnown(existingIds);
          if (initialLoadRef.current) initialLoadRef.current = false;
        } else {
          // Detect genuinely new incidents with a different incident ID
          for (const inc of incidentsRes) {
            const isUnsounded = !soundAlert.hasSounded(inc.id) && !knownIncidentIdsRef.current.has(inc.id);
            const isActive = ['DETECTED', 'ANALYZING', 'RECOVERING'].includes(inc.status);

            if (isUnsounded && isActive) {
              knownIncidentIdsRef.current.add(inc.id);

              // If from manual injection within 10s, it already had its notification on button click
              const isRecentManual =
                inc.serviceId === 'srv-chimera-controlled' &&
                Date.now() - lastInjectedTimeRef.current < 10000;

              if (isRecentManual) {
                soundAlert.markSounded(inc.id);
              } else {
                const isCritical = inc.severity === 'CRITICAL';
                if (!soundAlert.getCriticalOnly() || isCritical) {
                  triggerFaultAlert({
                    title: `FAULT DETECTED: ${inc.category.replace(/_/g, ' ')}`,
                    serviceName: inc.serviceName,
                    category: inc.category,
                    severity: inc.severity,
                    details: inc.description || inc.suspectedRootCause || 'Service exceeded SLA failure threshold.',
                    incidentId: inc.id,
                  });
                } else {
                  soundAlert.markSounded(inc.id);
                }
              }
            }
          }

          // Stop any active alert sound when all incidents have recovered or when current alert incident recovers
          const hasActiveIncidents = incidentsRes.some((inc) =>
            ['DETECTED', 'ANALYZING', 'RECOVERING', 'VERIFYING'].includes(inc.status)
          );

          if (!hasActiveIncidents) {
            soundAlert.stopSound('All active incidents recovered');
            activeAlertIncidentIdRef.current = null;
          } else if (activeAlertIncidentIdRef.current) {
            const alertedIncident = incidentsRes.find((i) => i.id === activeAlertIncidentIdRef.current);
            if (alertedIncident && alertedIncident.status === 'RECOVERED') {
              soundAlert.stopSound(`Alerted incident ${activeAlertIncidentIdRef.current} reached RECOVERED`);
              activeAlertIncidentIdRef.current = null;
            }
          }
        }
      }

      // Check test service state transitions
      if (testStateRes && typeof testStateRes === 'object' && !('error' in testStateRes)) {
        testStateRef.current = testStateRes;
        setTestState(testStateRes);
      }

      if (Array.isArray(incidentsRes) && incidentsRes.length > 0) {
        const allAttempts: RecoveryAttempt[] = [];
        for (const inc of incidentsRes.slice(0, 10)) {
          const atts = await fetch(`/api/incidents/${inc.id}/recovery-attempts`)
            .then((r) => r.json())
            .catch(() => []);
          if (Array.isArray(atts)) allAttempts.push(...atts);
        }
        setRecoveryAttempts(allAttempts);
      }
    } catch (err) {
      console.warn('Error fetching Chimera data:', err);
    } finally {
      isFetchingRef.current = false;
    }
  }, [triggerFaultAlert]);

  useEffect(() => {
    let isMounted = true;
    let timerId: NodeJS.Timeout | null = null;

    const poll = async () => {
      await fetchAllData();
      if (!isMounted) return;

      const hasActiveHealing =
        incidentsRef.current.some((inc) =>
          ['DETECTED', 'ANALYZING', 'RECOVERING', 'VERIFYING'].includes(inc.status)
        ) || (testStateRef.current && testStateRef.current.faultMode !== 'NONE');

      // 4.0s normal monitoring interval; 1.5s during active recovery cycles
      timerId = setTimeout(poll, hasActiveHealing ? 1500 : 4000);
    };

    poll();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [fetchAllData]);

  // Handle URL path synchronization (/tools, /simulator, etc.)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getTabFromPath = () => {
        const path = window.location.pathname.replace(/^\//, '');
        const validTabs: NavTab[] = [
          'overview',
          'services',
          'incidents',
          'diagnosis',
          'recovery',
          'analytics',
          'simulator',
          'tools',
          'settings',
        ];
        if (validTabs.includes(path as NavTab)) {
          setCurrentTab(path as NavTab);
        }
      };

      getTabFromPath();
      window.addEventListener('popstate', getTabFromPath);
      return () => window.removeEventListener('popstate', getTabFromPath);
    }
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      const targetPath = tab === 'overview' ? '/' : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleInjectFault = async (mode: FaultMode) => {
    if (mode !== 'NONE') {
      const faultLabels: Record<FaultMode, string> = {
        NONE: 'None',
        UNAVAILABLE: 'Service Unavailable (503)',
        PROCESS_CRASH: 'Process Crash (HTTP 503)',
        HIGH_LATENCY: 'SLA Latency Timeout (3200ms)',
        ERROR_SPIKE: 'HTTP 500 Cascading Exception Spike',
        HIGH_CPU: 'High CPU Infinite Loop (94%)',
        MEMORY_LEAK: 'Progressive Memory Leak OOM',
        DB_CONNECTION_FAIL: 'Database Pool Exhaustion',
      };

      lastInjectedTimeRef.current = Date.now();

      triggerFaultAlert({
        title: `FAULT INJECTED: ${faultLabels[mode] || mode}`,
        serviceName: 'Order Processing Service (Controlled Testbed)',
        category: 'CONTROLLED_SIMULATION',
        severity: 'CRITICAL',
        details: `Fault mode '${mode}' injected. 1-second alarm sounded. Autonomous self-healing pipeline running.`,
        forceSound: true,
      });
    }

    await fetch('/api/test-service/inject-fault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    await fetchAllData();
  };

  const handleResetTestService = async () => {
    soundAlert.stopSound();
    setNotifications([]);
    await fetch('/api/test-service/reset', { method: 'POST' });
    await fetchAllData();
  };

  const handleRegisterService = async (serviceData: {
    name: string;
    description: string;
    healthCheckUrl: string;
    tags: string[];
  }) => {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to register service');
    }
    await fetchAllData();
  };

  const handleTriggerRecovery = async (
    incident: Incident,
    action?: RecoveryActionType
  ) => {
    const actionToRun = action || incident.recommendedAction;
    const res = await fetch(`/api/incidents/${incident.id}/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: actionToRun }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Recovery trigger failed');
    }

    await fetchAllData();
  };

  const handleUpdateSettings = async (newSettings: Partial<SystemSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    if (!res.ok) throw new Error('Failed to update system settings');
    const updated = await res.json();
    setSettings(updated);
    await fetchAllData();
  };

  // Test sound function for user immediate testing
  const handleTestSound = () => {
    triggerFaultAlert({
      title: 'TEST FAULT ALERT (1s Sound Verified)',
      serviceName: 'Audio & Telemetry System',
      category: 'AUDIO_VERIFICATION',
      severity: 'CRITICAL',
      details: '1.0-second dual-frequency warning tone generated via Web Audio API. Audio context and visual toast verified.',
      forceSound: true,
    });
  };

  const handleToggleMute = () => {
    const next = soundAlert.toggleMuted();
    setIsMuted(next);
  };

  const handleToggleCriticalOnly = () => {
    const next = !criticalOnly;
    soundAlert.setCriticalOnly(next);
    setCriticalOnly(next);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNavigateToIncidentFromToast = (incidentId?: string) => {
    if (!incidentId) {
      setCurrentTab('incidents');
      return;
    }
    const inc = incidents.find((i) => i.id === incidentId);
    if (inc) {
      setDetailModalIncident(inc);
    } else {
      setCurrentTab('incidents');
    }
  };

  const controlledIncident = incidents.find(
    (i) =>
      i.serviceId === 'srv-chimera-controlled' &&
      ['DETECTED', 'ANALYZING', 'RECOVERING', 'VERIFYING'].includes(i.status)
  );

  const controlledAttempt = recoveryAttempts.find(
    (a) =>
      a.serviceId === 'srv-chimera-controlled' &&
      (a.result === 'PENDING' || (controlledIncident && a.incidentId === controlledIncident.id))
  );

  const latestRecoveredControlledIncident = incidents.find(
    (i) => i.serviceId === 'srv-chimera-controlled' && i.status === 'RECOVERED'
  );

  const activeIncidentsCount = incidents.filter((i) =>
    ['DETECTED', 'ANALYZING', 'RECOVERING', 'VERIFYING'].includes(i.status)
  ).length;

  return (
    <div className="flex h-screen bg-[#F4F4F2] text-[#252525] font-sans antialiased overflow-hidden selection:bg-[#FCE8D8] selection:text-[#252525]">
      {/* Floating Real-Time Fault Alert Notifications */}
      <FaultAlertToast
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onNavigateToIncident={handleNavigateToIncidentFromToast}
        onNavigateToSimulator={() => setCurrentTab('simulator')}
      />

      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        activeIncidentsCount={activeIncidentsCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          currentTab={currentTab}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          onOpenSimulator={() => setCurrentTab('simulator')}
          autoRecoveryEnabled={settings?.autoRecoveryEnabled ?? true}
          isMuted={isMuted}
          criticalOnly={criticalOnly}
          onToggleMute={handleToggleMute}
          onToggleCriticalOnly={handleToggleCriticalOnly}
          onTestSound={handleTestSound}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {currentTab === 'simulator' && (
            <FaultSimulatorBanner
              testState={testState}
              activeIncident={controlledIncident}
              activeAttempt={controlledAttempt}
              latestRecoveredIncident={latestRecoveredControlledIncident}
              onInjectFault={handleInjectFault}
              onReset={handleResetTestService}
            />
          )}

          {currentTab === 'overview' && (testState?.faultMode !== 'NONE' || controlledIncident) && (
            <FaultSimulatorBanner
              testState={testState}
              activeIncident={controlledIncident}
              activeAttempt={controlledAttempt}
              latestRecoveredIncident={latestRecoveredControlledIncident}
              onInjectFault={handleInjectFault}
              onReset={handleResetTestService}
            />
          )}

          {currentTab === 'overview' && (
            <OverviewView
              analytics={analytics}
              services={services}
              incidents={incidents}
              auditLogs={auditLogs}
              onSelectService={() => setCurrentTab('services')}
              onSelectIncident={(inc) => {
                setDetailModalIncident(inc);
              }}
              onGoToIncidents={() => setCurrentTab('incidents')}
              onGoToServices={() => setCurrentTab('services')}
            />
          )}

          {currentTab === 'services' && (
            <ServicesView
              services={services}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onRefresh={handleManualRefresh}
            />
          )}

          {currentTab === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              onSelectIncident={(inc) => setDetailModalIncident(inc)}
              onTriggerRecovery={handleTriggerRecovery}
            />
          )}

          {currentTab === 'diagnosis' && (
            <DiagnosisView
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              onGoToRecovery={() => setCurrentTab('recovery')}
            />
          )}

          {currentTab === 'recovery' && (
            <RecoveryView
              recoveryAttempts={recoveryAttempts}
              incidents={incidents}
              onTriggerManualRecovery={async (incId, action) => {
                const found = incidents.find((i) => i.id === incId);
                if (found) await handleTriggerRecovery(found, action);
              }}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView overview={analytics} incidents={incidents} />
          )}

          {currentTab === 'tools' && (
            <ToolsView />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              criticalOnly={criticalOnly}
              onToggleCriticalOnly={handleToggleCriticalOnly}
              onTestSound={handleTestSound}
            />
          )}
        </main>
      </div>

      <RegisterServiceModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegisterService}
      />

      <IncidentDetailModal
        incident={detailModalIncident}
        onClose={() => setDetailModalIncident(null)}
        onTriggerRecovery={handleTriggerRecovery}
        onNavigateToDiagnosis={(inc) => {
          setSelectedIncident(inc);
          setCurrentTab('diagnosis');
        }}
      />
    </div>
  );
}
