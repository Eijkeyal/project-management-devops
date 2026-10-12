const filePaths = {
  "/files/upload": {
    post: {
      tags: ["Files"],
      summary: "Upload file",
      security: [{ BearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: { file: { type: "string", format: "binary" } },
            },
          },
        },
      },
      responses: { 201: { description: "Uploaded" } },
    },
  },
  "/files/avatar": {
    post: {
      tags: ["Files"],
      summary: "Upload avatar",
      security: [{ BearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: { file: { type: "string", format: "binary" } },
            },
          },
        },
      },
      responses: { 201: { description: "Uploaded" } },
    },
  },
  "/files/project/{projectId}": {
    get: {
      tags: ["Files"],
      summary: "Project files",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Files" } },
    },
  },
  "/files/task/{taskId}": {
    get: {
      tags: ["Files"],
      summary: "Task files",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "taskId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Files" } },
    },
  },
  "/files/content/{contentId}": {
    get: {
      tags: ["Files"],
      summary: "Content files",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "contentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Files" } },
    },
  },
  "/files/{id}/raw": {
    get: {
      tags: ["Files"],
      summary: "Stream file",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Stream" } },
    },
  },
  "/files/{id}": {
    delete: {
      tags: ["Files"],
      summary: "Delete file",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Deleted" } },
    },
  },
};
const fileSchemas = {
  File: {
    type: "object",
    properties: { id: { type: "string" }, name: { type: "string" } },
  },
};
export { filePaths, fileSchemas };
