const taskCommentPaths = {
  "/task-comments/task/{taskId}": {
    get: {
      tags: ["Task Comments"],
      summary: "Comments for task",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "taskId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Comments" } },
    },
  },
  "/task-comments": {
    post: {
      tags: ["Task Comments"],
      summary: "Create comment",
      security: [{ BearerAuth: [] }],
      responses: { 201: { description: "Created" } },
    },
  },
  "/task-comments/{id}": {
    patch: {
      tags: ["Task Comments"],
      summary: "Update comment",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Updated" } },
    },
    delete: {
      tags: ["Task Comments"],
      summary: "Delete comment",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Deleted" } },
    },
  },
};
const taskCommentSchemas = {
  TaskComment: {
    type: "object",
    properties: { id: { type: "string" }, body: { type: "string" } },
  },
};
export { taskCommentPaths, taskCommentSchemas };
