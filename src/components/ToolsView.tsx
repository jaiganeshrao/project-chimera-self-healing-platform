import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  CheckSquare,
  BookOpen,
  Figma,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Globe,
} from 'lucide-react';

const GitHubActionsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="6" height="6" rx="1.5" />
    <rect x="15" y="3" width="6" height="6" rx="1.5" />
    <rect x="15" y="15" width="6" height="6" rx="1.5" />
    <path d="M9 6h6" />
    <path d="M6 9v6a3 3 0 0 0 3 3h6" />
  </svg>
);

const DockerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M2 13.5c0 4.2 3.2 7 8 7 5.5 0 9.6-2.8 11-7.2.9-.1 1.7-.5 2-1.3-.8-.5-1.9-.5-2.6-.1-.2-1.1-.8-2-1.7-2.6-.7.8-.9 2-.5 3.1-.7.4-1.6.6-2.7.6H2.5c-.3 0-.5.2-.5.5z" />
    <rect x="5" y="9" width="2.8" height="2.6" rx="0.3" />
    <rect x="8.8" y="9" width="2.8" height="2.6" rx="0.3" />
    <rect x="12.6" y="9" width="2.8" height="2.6" rx="0.3" />
    <rect x="8.8" y="5.4" width="2.8" height="2.6" rx="0.3" />
    <rect x="12.6" y="5.4" width="2.8" height="2.6" rx="0.3" />
  </svg>
);

const KubernetesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="7.2" />
    <circle cx="12" cy="12" r="2.5" />
    <line x1="12" y1="9.5" x2="12" y2="1.8" />
    <line x1="13.95" y1="10.44" x2="19.97" y2="5.64" />
    <line x1="14.44" y1="12.56" x2="21.94" y2="14.27" />
    <line x1="13.08" y1="14.25" x2="16.43" y2="21.19" />
    <line x1="10.92" y1="14.25" x2="7.57" y2="21.19" />
    <line x1="9.56" y1="12.56" x2="2.06" y2="14.27" />
    <line x1="10.05" y1="10.44" x2="4.03" y2="5.64" />
  </svg>
);

interface ToolItem {
  id: string;
  name: string;
  category: string;
  defaultUrl: string;
  url: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEFAULT_TOOLS: ToolItem[] = [
  {
    id: 'github',
    name: 'GitHub Repository',
    category: 'Version Control & Source Code',
    defaultUrl: 'https://github.com/jaiganeshrao/chimera-self-healing-platform',
    url: 'https://github.com/jaiganeshrao/chimera-self-healing-platform',
    description:
      'Source repository containing Project Chimera core engine, autonomous remediation policies, and full-stack reliability components.',
    icon: GitBranch,
  },
  {
    id: 'jira',
    name: 'Jira Software',
    category: 'Agile Project & Issue Tracking',
    defaultUrl:
      'https://jaiganeshrao29.atlassian.net/jira/software/projects/CHIM/boards/6/backlog',
    url: 'https://jaiganeshrao29.atlassian.net/jira/software/projects/CHIM/boards/6/backlog',
    description:
      'Project Chimera sprint backlog, reliability incident epics, SRE user stories, and bug tracking.',
    icon: CheckSquare,
  },
  {
    id: 'confluence',
    name: 'Confluence Workspace',
    category: 'Engineering Runbooks & Documentation',
    defaultUrl:
      'https://jaiganeshrao29-1793632605281.atlassian.net/wiki/spaces/PC/pages/884737/01+Project+Overview',
    url: 'https://jaiganeshrao29-1793632605281.atlassian.net/wiki/spaces/PC/pages/884737/01+Project+Overview',
    description:
      'System architectural specifications, autonomous healing runbooks, failover playbooks, and SRE post-mortem documentation.',
    icon: BookOpen,
  },
  {
    id: 'figma',
    name: 'Figma Design System',
    category: 'UI/UX Architecture & Prototype',
    defaultUrl:
      'https://www.figma.com/make/nWTcrS8FEq5wkRRI0px87i/Project-Chimera-Reliability-Dashboard?fullscreen=1&t=jzsLeNGqQXwQdtX6-1&code-node-id=0-6',
    url: 'https://www.figma.com/make/nWTcrS8FEq5wkRRI0px87i/Project-Chimera-Reliability-Dashboard?fullscreen=1&t=jzsLeNGqQXwQdtX6-1&code-node-id=0-6',
    description:
      'High-fidelity telemetry dashboard prototypes, enterprise design tokens, and responsive layout specifications.',
    icon: Figma,
  },
  {
    id: 'github-actions',
    name: 'CI/CD – GitHub Actions',
    category: 'Continuous Integration & Continuous Deployment',
    defaultUrl: 'https://github.com/features/actions',
    url: 'https://github.com/features/actions',
    description:
      'Automated build, testing, and deployment workflows for Project Chimera.',
    icon: GitHubActionsIcon,
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'Containerization & Application Packaging',
    defaultUrl: 'https://www.docker.com/',
    url: 'https://www.docker.com/',
    description:
      'Containerize Project Chimera using Docker to ensure consistent application deployment.',
    icon: DockerIcon,
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    category: 'Container Orchestration & Self-Healing',
    defaultUrl: 'https://kubernetes.io/',
    url: 'https://kubernetes.io/',
    description:
      'Deploy, manage, scale, and monitor Project Chimera containers using Kubernetes.',
    icon: KubernetesIcon,
  },
];

export const ToolsView: React.FC = () => {
  const [tools, setTools] = useState<ToolItem[]>(DEFAULT_TOOLS);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chimera_tool_links');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTools((prev) =>
          prev.map((t) => {
            const savedUrl = parsed[t.id];
            return {
              ...t,
              url: savedUrl || t.url,
            };
          })
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const handleUrlChange = (id: string, newUrl: string) => {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, url: newUrl } : t)));
  };

  const handleSave = () => {
    for (const tool of tools) {
      if (!tool.url.trim()) {
        setFeedback({
          type: 'error',
          message: `URL cannot be empty for ${tool.name}.`,
        });
        return;
      }
      try {
        new URL(tool.url);
      } catch {
        setFeedback({
          type: 'error',
          message: `Invalid URL format for ${tool.name}. Ensure it includes https://`,
        });
        return;
      }
    }

    try {
      const dataToSave: Record<string, string> = {};
      tools.forEach((t) => {
        dataToSave[t.id] = t.url;
      });
      localStorage.setItem('chimera_tool_links', JSON.stringify(dataToSave));
      setFeedback({
        type: 'success',
        message: 'All tool links saved successfully to local storage.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback({
        type: 'error',
        message: 'Failed to write configurations to localStorage.',
      });
    }
  };

  const handleReset = () => {
    setTools(DEFAULT_TOOLS);
    try {
      localStorage.removeItem('chimera_tool_links');
      setFeedback({
        type: 'success',
        message: 'All tool endpoints reset to Project Chimera baseline defaults.',
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wide bg-[#FCE8D8] text-[#C65D20] uppercase">
              DevOps & SRE Ecosystem
            </span>
            <span className="text-xs text-[#555555] font-mono">
              {tools.length} Tools Configured
            </span>
          </div>
          <h2 className="text-xl font-semibold font-heading text-[#252525] tracking-tight mt-1.5">
            Software Engineering Tools
          </h2>
          <p className="text-xs text-[#555555] mt-1 max-w-2xl leading-relaxed">
            Quick-access mission control for Project Chimera source repositories, agile backlog,
            engineering runbooks, design specifications, CI/CD pipelines, and container orchestration.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#252525] bg-[#FFFFFF] hover:bg-[#F4F4F2] border border-[#DEDEDA] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#555555]" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#252525] hover:bg-[#3A3A3A] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Links</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg border text-xs flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-[#16A34A]'
              : 'bg-red-50 border-red-200 text-[#DC2626]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* 7 Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isHttps = tool.url.trim().toLowerCase().startsWith('https://');
          return (
            <div
              key={tool.id}
              className="surface-card-interactive p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20] shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-[#252525] text-sm tracking-tight truncate">
                        {tool.name}
                      </h3>
                      <span className="inline-block px-2 py-0.5 rounded bg-[#F4F4F2] border border-[#DEDEDA] text-[10px] font-mono text-[#555555] mt-1">
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#C65D20] hover:bg-[#E87524] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
                    title={`Open ${tool.name} in new tab`}
                  >
                    <span>Open Tool</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Description */}
                <p className="text-xs text-[#555555] mt-3 leading-relaxed">{tool.description}</p>

                {/* Editable Primary Link */}
                <div className="mt-4 space-y-1.5">
                  <label className="text-[10px] font-mono text-[#555555] uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#777770]" />
                    <span>Target URL (Editable)</span>
                  </label>
                  <input
                    type="url"
                    value={tool.url}
                    onChange={(e) => handleUrlChange(tool.id, e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#F4F4F2] border border-[#DEDEDA] focus:bg-[#FFFFFF] focus:border-[#C65D20] focus:ring-1 focus:ring-[#C65D20]/20 rounded-lg px-3 py-2 text-xs font-mono text-[#252525] placeholder-[#888880] transition-colors outline-none"
                  />
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-4 pt-3 border-t border-[#DEDEDA] flex items-center justify-between text-[11px] font-mono text-[#555555]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  External Link Configured
                </span>
                <span className="text-[#777770]">
                  {isHttps ? 'HTTPS • Opens in New Tab' : 'Opens in New Tab'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
