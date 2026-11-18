import React, { useState } from 'react';
import { X, Server, AlertCircle, ShieldCheck } from 'lucide-react';

interface RegisterServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: {
    name: string;
    description: string;
    healthCheckUrl: string;
    tags: string[];
  }) => Promise<void>;
}

export const RegisterServiceModal: React.FC<RegisterServiceModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [healthCheckUrl, setHealthCheckUrl] = useState(
    'http://localhost:3000/api/test-service/health?target=custom'
  );
  const [tagsInput, setTagsInput] = useState('microservice, internal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !healthCheckUrl.trim()) {
      setError('Service name and health check endpoint URL are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onRegister({
        name: name.trim(),
        description: description.trim(),
        healthCheckUrl: healthCheckUrl.trim(),
        tags,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#252525]/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#DEDEDA] rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DEDEDA] flex items-center justify-between bg-[#F9F9F7]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FCE8D8] flex items-center justify-center text-[#C65D20]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-[#252525]">
                Register Target Microservice
              </h3>
              <p className="text-[11px] text-[#555555]">
                Add an endpoint to Project Chimera&apos;s autonomous telemetry fleet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#777770] hover:text-[#252525] p-1 rounded-lg hover:bg-[#F4F4F2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2626] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-mono text-[#252525] block mb-1.5 font-medium">
              Service Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Notification Dispatch Worker"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F4F4F2] border border-[#DEDEDA] focus:bg-[#FFFFFF] rounded-lg text-xs text-[#252525] focus:outline-none focus:border-[#C65D20] focus:ring-1 focus:ring-[#C65D20]/20 transition-colors placeholder:text-[#888880]"
              required
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#252525] block mb-1.5 font-medium">
              HTTP Health Check Endpoint URL *
            </label>
            <input
              type="url"
              placeholder="http://localhost:3000/api/test-service/health?target=..."
              value={healthCheckUrl}
              onChange={(e) => setHealthCheckUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F4F4F2] border border-[#DEDEDA] focus:bg-[#FFFFFF] rounded-lg text-xs text-[#252525] font-mono focus:outline-none focus:border-[#C65D20] focus:ring-1 focus:ring-[#C65D20]/20 transition-colors placeholder:text-[#888880]"
              required
            />
            <div className="flex items-center gap-1.5 text-[11px] text-[#555555] mt-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>SSRF Filter: Target host must match localhost, 127.0.0.1, or ais-dev.</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-[#252525] block mb-1.5 font-medium">
              Operational Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief operational context, workload characteristics, and downstream dependencies..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F4F4F2] border border-[#DEDEDA] focus:bg-[#FFFFFF] rounded-lg text-xs text-[#252525] focus:outline-none focus:border-[#C65D20] focus:ring-1 focus:ring-[#C65D20]/20 transition-colors placeholder:text-[#888880]"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#252525] block mb-1.5 font-medium">
              Metadata Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="core, queue, notification"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F4F4F2] border border-[#DEDEDA] focus:bg-[#FFFFFF] rounded-lg text-xs text-[#252525] focus:outline-none focus:border-[#C65D20] focus:ring-1 focus:ring-[#C65D20]/20 transition-colors placeholder:text-[#888880]"
            />
          </div>

          <div className="pt-3 border-t border-[#DEDEDA] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#555555] hover:text-[#252525] hover:bg-[#F4F4F2] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#252525] hover:bg-[#3A3A3A] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Registering...' : 'Register Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
