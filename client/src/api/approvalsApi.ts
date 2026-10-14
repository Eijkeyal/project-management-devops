import { axiosClient } from "./axiosClient";

export interface ApprovalResponse {
  approval_id: string;
  content_id: string;
  submitted_by: string;
  submitted_at: string;
  reviewer_id: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason: string | null;
  decided_at: string | null;
  publish_mode: "immediate" | "scheduled" | null;
  scheduled_for: string | null;
  published_at: string | null;
  notes: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
  meta?: {
    total: number;
    limit: number;
    offset: number;
    count: number;
  };
}

export const approvalsApi = {
  submitForApproval: (contentId: string, notes?: string) =>
    axiosClient
      .post<ApiResponse<ApprovalResponse>>(`/approvals/content/${contentId}/submit`, { notes })
      .then((res) => res.data),

  listPending: (limit?: number, offset?: number) =>
    axiosClient
      .get<ApiResponse<ApprovalResponse[]>>("/approvals/pending", { params: { limit, offset } })
      .then((res) => res.data),

  listForContent: (contentId: string) =>
    axiosClient
      .get<ApiResponse<ApprovalResponse[]>>(`/approvals/content/${contentId}`)
      .then((res) => res.data),

  approve: (approvalId: string, publish: "immediate" | "scheduled", scheduledFor?: string) =>
    axiosClient
      .post<ApiResponse<ApprovalResponse>>(`/approvals/${approvalId}/approve`, {
        publish,
        scheduled_for: scheduledFor,
      })
      .then((res) => res.data),

  reject: (approvalId: string, reason: string) =>
    axiosClient
      .post<ApiResponse<ApprovalResponse>>(`/approvals/${approvalId}/reject`, { reason })
      .then((res) => res.data),

  cancel: (approvalId: string) =>
    axiosClient
      .post<ApiResponse<ApprovalResponse>>(`/approvals/${approvalId}/cancel`)
      .then((res) => res.data),
};
