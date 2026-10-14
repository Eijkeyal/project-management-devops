import { useState, useEffect } from "react";
import { filesApi, type FileResponse } from "../../api/filesApi";

interface FileListProps {
  projectId?: string;
  taskId?: string;
  contentId?: string;
  refreshTrigger?: number;
}

const FileList = ({ projectId, taskId, contentId, refreshTrigger }: FileListProps) => {
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFiles();
  }, [projectId, taskId, contentId, refreshTrigger]);

  const loadFiles = async () => {
    setLoading(true);
    setError("");

    try {
      let response;
      if (projectId) {
        response = await filesApi.listForProject(projectId);
      } else if (taskId) {
        response = await filesApi.listForTask(taskId);
      } else if (contentId) {
        response = await filesApi.listForContent(contentId);
      } else {
        setFiles([]);
        setLoading(false);
        return;
      }
      setFiles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Delete this file?")) return;

    try {
      await filesApi.delete(fileId);
      loadFiles();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    if (mimeType.includes("zip") || mimeType.includes("compress")) return "📦";
    return "📎";
  };

  if (loading) {
    return <div className="text-sm text-[#787671]">Loading files...</div>;
  }

  if (error) {
    return <div className="text-sm text-[#e03131]">{error}</div>;
  }

  if (files.length === 0) {
    return <div className="text-sm text-[#787671]">No files uploaded</div>;
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.file_id}
          className="flex items-center justify-between p-3 border border-[#e5e3df] rounded-lg hover:bg-[#fafaf9] transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1a1a1a] truncate">
                {file.original_name}
              </p>
              <p className="text-xs text-[#787671]">
                {formatFileSize(file.size_bytes)} • {new Date(file.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={filesApi.getDownloadUrl(file.file_id, false)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-[#5645d4] hover:bg-[#f6f5f4] rounded transition-colors"
            >
              View
            </a>
            <a
              href={filesApi.getDownloadUrl(file.file_id, true)}
              download
              className="px-3 py-1.5 text-xs font-medium text-[#0075de] hover:bg-[#f6f5f4] rounded transition-colors"
            >
              Download
            </a>
            <button
              onClick={() => handleDelete(file.file_id)}
              className="px-3 py-1.5 text-xs font-medium text-[#e03131] hover:bg-[#fde0ec] rounded transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;
