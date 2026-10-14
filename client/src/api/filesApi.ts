import { axiosClient } from "./axiosClient";

export interface FileResponse {
  file_id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string;
  created_at: string;
  url: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
}

export const filesApi = {
  upload: (file: File, projectId?: string, taskId?: string, contentId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (projectId) formData.append("project_id", projectId);
    if (taskId) formData.append("task_id", taskId);
    if (contentId) formData.append("content_id", contentId);

    return axiosClient
      .post<ApiResponse<FileResponse>>("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient
      .post<ApiResponse<FileResponse>>("/files/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  listForProject: (projectId: string) =>
    axiosClient
      .get<ApiResponse<FileResponse[]>>(`/files/project/${projectId}`)
      .then((res) => res.data),

  listForTask: (taskId: string) =>
    axiosClient
      .get<ApiResponse<FileResponse[]>>(`/files/task/${taskId}`)
      .then((res) => res.data),

  listForContent: (contentId: string) =>
    axiosClient
      .get<ApiResponse<FileResponse[]>>(`/files/content/${contentId}`)
      .then((res) => res.data),

  delete: (fileId: string) =>
    axiosClient
      .delete<ApiResponse<boolean>>(`/files/${fileId}`)
      .then((res) => res.data),

  getDownloadUrl: (fileId: string, download: boolean = false) => {
    const params = download ? "?download=1" : "";
    return `/api/v1/files/${fileId}/raw${params}`;
  },
};
