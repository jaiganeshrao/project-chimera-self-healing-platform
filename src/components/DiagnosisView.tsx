import React from 'react';
import { Incident } from '../types';
import {
  BrainCircuit,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface DiagnosisViewProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
  onGoToRecovery: () => void;
}

export const DiagnosisView: React.FC<DiagnosisViewProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onGoToRecovery,
}) => {
  const current = selectedIncident || incidents[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Selector */}
      <div className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20] shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-[#252525]">
              Root-Cause Analysis & AI Diagnostic Inference
            </h3>
            <p className="text-xs text-[#555555]">
              Rule-based baseline verification coupled with Scikit-learn Random Forest feature weighting.
            </p>
          </div>
        </div>

        {incidents.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#555555] font-mono">Incident:</span>
            <select
              value={current?.id || ''}
              onChange={(e) => {
                const found = incidents.find((i) => i.id === e.target.value);
                if (found) onSelectIncident(found);
              }}
              className="px-3 py-1.5 bg-[#FFFFFF] border border-[#DEDEDA] rounded-lg text-xs text-[#252525] font-mono focus:outline-none focus:border-[#C65D20] cursor-pointer max-w-xs"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.id} - {inc.serviceName} ({inc.category})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!current ? (
        <div className="surface-card p-16 text-center text-[#555555] text-xs">
          <div className="w-10 h-10 rounded-lg bg-[#F4F4F2] border border-[#DEDEDA] flex items-center justify-center mx-auto mb-3 text-[#777770]">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="font-semibold text-[#252525] text-sm block">
            No diagnostic history recorded yet
          </span>
          <p className="text-xs text-[#555555] mt-1">
            Inject a failure via the simulator to evaluate the AI diagnostic engine.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Diagnosis Panel */}
            <div className="surface-card p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DEDEDA] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[#DC2626] uppercase tracking-wider">
                    Suspected Root Cause
                  </span>
                  <span className="text-[#DEDEDA]">·</span>
                  <span className="text-xs font-mono text-[#C65D20] font-semibold">
                    {current.id}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#555555]">Method:</span>
                  <span className="text-[#252525] font-semibold px-2.5 py-0.5 rounded-md bg-[#F4F4F2] border border-[#DEDEDA]">
                    {current.diagnosticMethod}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-heading text-lg font-semibold text-[#252525]">
                  {current.category}
                </h4>
                <p className="text-sm text-[#252525] mt-2 leading-relaxed">
                  {current.suspectedRootCause}
                </p>
                <p className="text-xs text-[#555555] mt-2 leading-relaxed">
                  {current.description}
                </p>
                {current.failureReason && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#DC2626] font-mono">
                    <span className="font-semibold block mb-0.5">Remediation Status Detail:</span>
                    {current.failureReason}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#DEDEDA]">
                <span className="text-[11px] font-mono font-semibold text-[#555555] uppercase tracking-wider block mb-3">
                  Confirmed Empirical Evidence
                </span>
                <div className="space-y-2">
                  {(current.confirmedFacts || []).map((fact, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-[#252525] font-mono p-2.5 rounded-lg bg-[#F4F4F2] border border-[#DEDEDA]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Impact Breakdown */}
            <div className="surface-card p-6">
              <div className="flex items-center justify-between border-b border-[#DEDEDA] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20]">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-heading text-xs font-semibold text-[#252525] uppercase tracking-wider">
                    Feature Impact Weights
                  </h4>
                </div>
                <span className="text-[11px] text-[#555555] font-mono">
                  Random Forest Importance
                </span>
              </div>

              <div className="mt-4 space-y-3.5">
                {current.featureContributions && current.featureContributions.length > 0 ? (
                  current.featureContributions.map((fc, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[#252525]">{fc.feature}</span>
                        <span className="text-[#C65D20] font-semibold tabular-nums">
                          {fc.impactPct}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#ECECE8] rounded-md overflow-hidden">
                        <div
                          className="h-full rounded-md transition-all duration-300"
                          style={{
                            width: `${fc.impactPct}%`,
                            backgroundColor: i === 0 ? '#C65D20' : i === 1 ? '#E87524' : '#252525',
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#555555] font-mono">
                    Feature weights extracted via deterministic invariant rules.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Classifier Confidence */}
            <div className="surface-card p-6">
              <div className="flex items-center justify-between border-b border-[#DEDEDA] pb-3.5">
                <h4 className="font-heading text-xs font-semibold text-[#252525] uppercase tracking-wider">
                  ML Confidence
                </h4>
                <TrendingUp className="w-4 h-4 text-[#16A34A]" />
              </div>

              <div className="mt-5 text-center">
                {current.mlConfidence !== null ? (
                  <>
                    <div className="text-5xl font-semibold font-mono text-[#16A34A] tabular-nums tracking-tight">
                      {Math.round(current.mlConfidence * 100)}%
                    </div>
                    <div className="text-xs text-[#252525] font-mono mt-1.5 font-medium">
                      Ensemble Certainty Score
                    </div>
                    <p className="text-xs text-[#555555] mt-3 text-left leading-relaxed">
                      High statistical certainty. Telemetry vector strongly correlates with the
                      trained multi-class failure profile.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-mono text-[#D97706] font-semibold">
                      Confidence Withheld
                    </div>
                    <p className="text-xs text-[#555555] mt-2 text-left leading-relaxed">
                      Confidence threshold policy enforced: Raw probability falls below the 0.60
                      certainty cutoff. Relying on deterministic system invariants.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Recommended Recovery Policy Card */}
            <div className="surface-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#DEDEDA] pb-3.5">
                <h4 className="font-heading text-xs font-semibold text-[#252525] uppercase tracking-wider">
                  Recommended Recovery
                </h4>
                <ShieldCheck className="w-4 h-4 text-[#C65D20]" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#777770] block">
                  Approved Policy Action
                </span>
                <span className="text-sm font-mono font-semibold text-[#C65D20] mt-0.5 block">
                  {current.recommendedAction}
                </span>
              </div>

              <p className="text-xs text-[#555555] leading-relaxed">
                Policy engine validated: Action resides on the security allowlist. Safe for
                autonomous execution under active cooldown constraints.
              </p>

              <button
                type="button"
                onClick={onGoToRecovery}
                className="w-full mt-2 py-2.5 px-3 rounded-lg text-xs font-semibold text-white bg-[#252525] hover:bg-[#3A3A3A] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Inspect Recovery Policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
