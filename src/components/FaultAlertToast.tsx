import React, { useEffect } from 'react';
import {
  AlertTriangle,
  X,
  Volume2,
  Flame,
  Activity,
} from 'lucide-react';
import { soundAlert } from '../utils/soundAlert';

export interface FaultNotification {
  id: string;
  title: string;
  serviceName: string;
  category?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
  timestamp: string;
  incidentId?: string;
}

interface FaultAlertToastProps {
  notifications: FaultNotification[];
  onDismiss: (id: string) => void;
  onNavigateToIncident?: (incidentId?: string) => void;
  onNavigateToSimulator?: () => void;
}

export const FaultAlertToast: React.FC<FaultAlertToastProps> = ({
  notifications,
  onDismiss,
  onNavigateToIncident,
  onNavigateToSimulator,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
      aria-live="assertive"
    >
      {notifications.map((item) => (
        <ToastItem
          key={item.id}
          item={item}
          onDismiss={() => onDismiss(item.id)}
          onNavigateToIncident={onNavigateToIncident}
          onNavigateToSimulator={onNavigateToSimulator}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  item: FaultNotification;
  onDismiss: () => void;
  onNavigateToIncident?: (incidentId?: string) => void;
  onNavigateToSimulator?: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  item,
  onDismiss,
  onNavigateToIncident,
  onNavigateToSimulator,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 9000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundAlert.playFaultSound({ force: true, durationMs: 1000 });
  };

  return (
    <div className="pointer-events-auto bg-[#FFFFFF] border border-[#DEDEDA] rounded-xl p-4 shadow-xl overflow-hidden relative">
      {/* Top Critical Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#DC2626]" />

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#DC2626] shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold font-mono tracking-wider text-[#DC2626] uppercase">
                Fault Detected
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-red-50 text-[#DC2626] border border-red-200">
                1s AUDIO ALERT
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundAlert.stopSound();
                onDismiss();
              }}
              className="text-[#777770] hover:text-[#252525] p-1 rounded-md hover:bg-[#F4F4F2] transition-colors cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="font-heading text-sm font-semibold text-[#252525] mt-1 leading-snug">
            {item.title}
          </h4>

          <div className="flex items-center gap-2 mt-1 text-xs text-[#555555] font-mono flex-wrap">
            <span className="text-[#252525] font-medium">Target: {item.serviceName}</span>
            {item.category && (
              <>
                <span className="text-[#DEDEDA]">·</span>
                <span className="text-[#777770]">{item.category}</span>
              </>
            )}
          </div>

          <p className="text-xs text-[#555555] mt-2 line-clamp-2 leading-relaxed bg-[#F4F4F2] p-2.5 rounded-lg border border-[#DEDEDA] font-mono">
            {item.details}
          </p>

          {/* Action Row */}
          <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-[#DEDEDA]">
            <button
              type="button"
              onClick={handleReplay}
              className="flex items-center gap-1.5 text-[11px] font-mono text-[#C65D20] hover:bg-[#FCE8D8] bg-[#FCE8D8]/60 px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap"
              title="Replay the 1-second fault warning sound"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Replay 1s Sound</span>
            </button>

            <div className="flex items-center gap-2">
              {item.incidentId && onNavigateToIncident && (
                <button
                  type="button"
                  onClick={() => onNavigateToIncident(item.incidentId)}
                  className="flex items-center gap-1 text-[11px] font-medium text-white bg-[#252525] hover:bg-[#3A3A3A] px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Activity className="w-3 h-3" />
                  <span>View Incident</span>
                </button>
              )}
              {onNavigateToSimulator && (
                <button
                  type="button"
                  onClick={onNavigateToSimulator}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#252525] bg-[#F4F4F2] hover:bg-[#EAEAE6] border border-[#DEDEDA] px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Flame className="w-3 h-3 text-[#C65D20]" />
                  <span>Simulator</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ECECE8]">
        <div
          className="h-full bg-[#C65D20]"
          style={{
            animation: 'toastProgress 9000ms linear forwards',
          }}
        />
      </div>
    </div>
  );
};
