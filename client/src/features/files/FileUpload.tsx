import { useState, useRef } from "react";
import { filesApi } from "../../api/filesApi";

interface FileUploadProps {
  projectId?: string;
  taskId?: string;
  contentId?: string;
  onUploadComplete?: () => void;
}

const FileUpload = ({ projectId, taskId, contentId, onUploadComplete }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      await filesApi.upload(file, projectId, taskId, contentId);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
          uploading
            ? "bg-[#c8c4be] text-[#787671] cursor-not-allowed"
            : "bg-[#5645d4] text-white hover:bg-[#4534b3]"
        }`}
      >
        {uploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload File
          </>
        )}
      </label>

      {error && (
        <div className="mt-2 text-sm text-[#e03131]">{error}</div>
      )}
    </div>
  );
};

export default FileUpload;
