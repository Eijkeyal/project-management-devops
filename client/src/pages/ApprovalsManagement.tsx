import { useState, useEffect } from "react";
import { approvalsApi } from "../api/approvalsApi";
import AppNav from "../components/layout/AppNav";
import PendingApprovalsList from "../features/approvals/PendingApprovalsList";

type ApprovalsTab = "pending" | "history";

interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const ApprovalsManagement = () => {
  const [activeTab, setActiveTab] = useState<ApprovalsTab>("pending");
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await approvalsApi.listPending(1, 0);
        if (cancelled) return;
        setPendingCount(response.meta?.total ?? response.data.length);
      } catch (err: unknown) {
        if (cancelled) return;
        const apiErr = err as ApiErrorShape;
        setError(apiErr.response?.data?.message || "Failed to load approval stats");
      } finally {
        if (!cancelled) {
          setLoadingStats(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const tabs: { key: ApprovalsTab; label: string; count: number; color: string }[] = [
    { key: "pending", label: "Pending Review", count: pendingCount, color: "#dd5b00" },
    { key: "history", label: "Approval History", count: 0, color: "#787671" },
  ];

  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-[#f6f5f4]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-5xl font-semibold text-[#1a1a1a] mb-2" style={{ letterSpacing: "-1px" }}>
              Approvals &amp; Governance
            </h1>
            <p className="text-lg text-[#5d5b54]">
              Review pending content, approve submissions, and track publication workflow
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[#fde0ec] border border-[#e03131]/20">
              <p className="text-sm text-[#e03131]">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#fff4e0] p-4 rounded-xl border border-[#dd5b00]/20">
              <span className="text-xs uppercase font-semibold text-[#dd5b00]">
                Awaiting Review
              </span>
              <div className="text-3xl font-semibold text-[#dd5b00] mt-1">
                {loadingStats ? "—" : pendingCount}
              </div>
              <span className="text-xs text-[#dd5b00]/80">
                Requires Manager or Admin sign-off
              </span>
            </div>
            <div className="bg-[#d9f3e1] p-4 rounded-xl border border-[#1aae39]/20">
              <span className="text-xs uppercase font-semibold text-[#1aae39]">
                Approved This Cycle
              </span>
              <div className="text-3xl font-semibold text-[#1aae39] mt-1">—</div>
              <span className="text-xs text-[#1aae39]/80">
                Content cleared for publication
              </span>
            </div>
            <div className="bg-[#fde0ec] p-4 rounded-xl border border-[#e03131]/20">
              <span className="text-xs uppercase font-semibold text-[#e03131]">
                Rejected / Returned
              </span>
              <div className="text-3xl font-semibold text-[#e03131] mt-1">—</div>
              <span className="text-xs text-[#e03131]/80">
                Sent back to author with feedback
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e5e3df] p-6">
            <div className="flex items-center gap-1 mb-6 border-b border-[#e5e3df] -mx-6 -mt-6 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab.key
                      ? "border-[#5645d4] text-[#5645d4]"
                      : "border-transparent text-[#787671] hover:text-[#37352f]"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${tab.color}20`, color: tab.color }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "pending" ? (
              <PendingApprovalsList />
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f6f5f4] mb-4">
                  <svg className="w-8 h-8 text-[#787671]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-[#787671] font-medium">Approval History</p>
                <p className="text-sm text-[#9b9a97] mt-1 max-w-md mx-auto">
                  Historical records of past approvals, rejections, and publication decisions will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ApprovalsManagement;
