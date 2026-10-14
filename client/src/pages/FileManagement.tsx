import { useState, useEffect } from "react";
import { projectApi } from "../api/axiosClient";
import type { ApiProjectResponse } from "../api/types";
import AppNav from "../components/layout/AppNav";
import FileManager from "../features/files/FileManager";

interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const FileManagement = () => {
  const [projects, setProjects] = useState<ApiProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await projectApi.list({ per_page: 100 });
        if (cancelled) return;
        setProjects(response.data);
        if (response.data.length > 0) {
          setSelectedProjectId((prev) => prev || response.data[0].project_id);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const apiErr = err as ApiErrorShape;
        setError(apiErr.response?.data?.message || "Failed to load projects");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProject = projects.find((p) => p.project_id === selectedProjectId);
  const totalSize = 0;

  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-[#f6f5f4]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-5xl font-semibold text-[#1a1a1a] mb-2" style={{ letterSpacing: "-1px" }}>
              File Management
            </h1>
            <p className="text-lg text-[#5d5b54]">
              Upload, organize, and manage files across projects
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[#fde0ec] border border-[#e03131]/20">
              <p className="text-sm text-[#e03131]">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#e5e3df] p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-[#1a1a1a]">Project Files</h2>
              <div className="flex items-center gap-3">
                <label htmlFor="project-select" className="text-sm font-medium text-[#37352f]">
                  Project:
                </label>
                <select
                  id="project-select"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={loading}
                  className="px-3 py-2 text-sm border border-[#e5e3df] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5645d4] bg-white min-w-[240px]"
                >
                  {loading ? (
                    <option>Loading projects...</option>
                  ) : projects.length === 0 ? (
                    <option>No projects available</option>
                  ) : (
                    projects.map((project) => (
                      <option key={project.project_id} value={project.project_id}>
                        {project.name} ({project.key_code})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {selectedProject && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#fafaf9] p-4 rounded-xl border border-[#e8e7e4]">
                  <span className="text-xs text-[#9b9a97] uppercase font-semibold">Project</span>
                  <div className="text-lg font-semibold text-[#37352f] mt-1">
                    {selectedProject.name}
                  </div>
                  <span className="text-xs text-[#5d5b54] font-mono">
                    {selectedProject.key_code}
                  </span>
                </div>
                <div className="bg-[#fafaf9] p-4 rounded-xl border border-[#e8e7e4]">
                  <span className="text-xs text-[#9b9a97] uppercase font-semibold">Status</span>
                  <div className="text-lg font-semibold text-[#37352f] mt-1 capitalize">
                    {selectedProject.status.replace("_", " ")}
                  </div>
                  <span className="text-xs text-[#5d5b54]">
                    Priority: {selectedProject.priority}
                  </span>
                </div>
                <div className="bg-[#fafaf9] p-4 rounded-xl border border-[#e8e7e4]">
                  <span className="text-xs text-[#9b9a97] uppercase font-semibold">Storage Used</span>
                  <div className="text-lg font-semibold text-[#5645d4] mt-1">
                    {totalSize > 0 ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB` : "—"}
                  </div>
                  <span className="text-xs text-[#5d5b54]">Attachments for this project</span>
                </div>
              </div>
            )}

            {!loading && selectedProjectId ? (
              <FileManager
                projectId={selectedProjectId}
                title={`Files — ${selectedProject?.name || "Selected Project"}`}
              />
            ) : loading ? (
              <div className="text-center py-12">
                <p className="text-[#787671]">Loading projects...</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#787671]">
                  No projects available. Create a project first to upload files.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FileManagement;
