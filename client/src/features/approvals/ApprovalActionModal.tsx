import { useState } from "react";
import { approvalsApi, type ApprovalResponse } from "../../api/approvalsApi";

interface ApprovalActionModalProps {
  approval: ApprovalResponse;
  actionType: "approve" | "reject";
  onClose: () => void;
  onComplete: () => void;
}

const ApprovalActionModal = ({ approval, actionType, onClose, onComplete }: ApprovalActionModalProps) => {
  const [publishMode, setPublishMode] = useState<"immediate" | "scheduled">("immediate");
  const [scheduledFor, setScheduledFor] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (actionType === "approve") {
        await approvalsApi.approve(
          approval.approval_id,
          publishMode,
          publishMode === "scheduled" ? scheduledFor : undefined
        );
      } else {
        if (!reason.trim()) {
          setError("Rejection reason is required");
          setSubmitting(false);
          return;
        }
        await approvalsApi.reject(approval.approval_id, reason);
      }
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${actionType} approval`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-[#e5e3df]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#1a1a1a]">
                {actionType === "approve" ? "Approve Content" : "Reject Content"}
              </h2>
              <p className="text-sm text-[#787671] mt-1">
                Content ID: {approval.content_id.slice(0, 8)}...
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#787671] hover:text-[#1a1a1a] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {actionType === "approve" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-[#37352f] mb-2">
                  Publishing Mode
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="immediate"
                      checked={publishMode === "immediate"}
                      onChange={(e) => setPublishMode(e.target.value as "immediate")}
                      className="mr-2"
                    />
                    <span className="text-sm text-[#37352f]">Publish Immediately</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="scheduled"
                      checked={publishMode === "scheduled"}
                      onChange={(e) => setPublishMode(e.target.value as "scheduled")}
                      className="mr-2"
                    />
                    <span className="text-sm text-[#37352f]">Schedule for Later</span>
                  </label>
                </div>
              </div>

              {publishMode === "scheduled" && (
                <div>
                  <label htmlFor="scheduled_for" className="block text-sm font-medium text-[#37352f] mb-2">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduled_for"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    required={publishMode === "scheduled"}
                    className="w-full px-3 py-2 text-sm border border-[#e5e3df] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5645d4]"
                  />
                </div>
              )}
            </>
          ) : (
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-[#37352f] mb-2">
                Rejection Reason <span className="text-[#e03131]">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={4}
                placeholder="Explain why this content is being rejected..."
                className="w-full px-3 py-2 text-sm border border-[#e5e3df] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5645d4] resize-none"
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-[#fde0ec] border border-[#e03131]/20">
              <p className="text-sm text-[#e03131]">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-[#787671] border border-[#e5e3df] rounded-lg hover:bg-[#f6f5f4] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                actionType === "approve"
                  ? "bg-[#1aae39] hover:bg-[#158a2e]"
                  : "bg-[#e03131] hover:bg-[#b92727]"
              }`}
            >
              {submitting ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalActionModal;
