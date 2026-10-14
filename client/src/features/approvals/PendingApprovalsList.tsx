import { useState, useEffect } from "react";
import { approvalsApi, type ApprovalResponse } from "../../api/approvalsApi";
import ApprovalActionModal from "./ApprovalActionModal";

const PendingApprovalsList = () => {
  const [approvals, setApprovals] = useState<ApprovalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApproval, setSelectedApproval] = useState<ApprovalResponse | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await approvalsApi.listPending(100, 0);
      setApprovals(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[#fff4e0] text-[#dd5b00]";
      case "approved":
        return "bg-[#d9f3e1] text-[#1aae39]";
      case "rejected":
        return "bg-[#fde0ec] text-[#e03131]";
      default:
        return "bg-[#f6f5f4] text-[#787671]";
    }
  };

  const handleAction = (approval: ApprovalResponse, type: "approve" | "reject") => {
    setSelectedApproval(approval);
    setActionType(type);
  };

  const handleActionComplete = () => {
    setSelectedApproval(null);
    setActionType(null);
    loadApprovals();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#787671]">Loading approvals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-[#fde0ec] border border-[#e03131]/20">
        <p className="text-sm text-[#e03131]">{error}</p>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#787671]">No pending approvals</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e3df]">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#787671] uppercase tracking-wider">
                Content ID
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#787671] uppercase tracking-wider">
                Submitted By
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#787671] uppercase tracking-wider">
                Submitted At
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#787671] uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#787671] uppercase tracking-wider">
                Notes
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-[#787671] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((approval) => (
              <tr
                key={approval.approval_id}
                className="border-b border-[#e5e3df] hover:bg-[#fafaf9] transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="text-sm font-mono text-[#37352f]">
                    {approval.content_id.slice(0, 8)}...
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-[#37352f]">
                    {approval.submitted_by.slice(0, 8)}...
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-[#37352f]">
                    {new Date(approval.submitted_at).toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                      approval.status
                    )}`}
                  >
                    {approval.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-[#787671] truncate max-w-xs block">
                    {approval.notes || "—"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {approval.status === "pending" && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(approval, "approve")}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#1aae39] hover:bg-[#158a2e] rounded transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(approval, "reject")}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#e03131] hover:bg-[#b92727] rounded transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApproval && actionType && (
        <ApprovalActionModal
          approval={selectedApproval}
          actionType={actionType}
          onClose={() => {
            setSelectedApproval(null);
            setActionType(null);
          }}
          onComplete={handleActionComplete}
        />
      )}
    </>
  );
};

export default PendingApprovalsList;
