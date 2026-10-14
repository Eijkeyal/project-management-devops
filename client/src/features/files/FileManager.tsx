import { useState } from "react";
import FileUpload from "./FileUpload";
import FileList from "./FileList";

interface FileManagerProps {
  projectId?: string;
  taskId?: string;
  contentId?: string;
  title?: string;
}

const FileManager = ({ projectId, taskId, contentId, title = "Files" }: FileManagerProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e3df] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#1a1a1a]">{title}</h3>
        <FileUpload
          projectId={projectId}
          taskId={taskId}
          contentId={contentId}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      <FileList
        projectId={projectId}
        taskId={taskId}
        contentId={contentId}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default FileManager;
