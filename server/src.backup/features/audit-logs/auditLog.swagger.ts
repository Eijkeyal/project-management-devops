const auditLogPaths = {
  "/audit-logs": {
    get: {
      tags: ["Audit Logs"],
      summary: "List audit logs",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Logs" } },
    },
  },
  "/audit-logs/{id}": {
    get: {
      tags: ["Audit Logs"],
      summary: "Get audit log",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Log" } },
    },
  },
  "/audit-logs/project/{projectId}/feed": {
    get: {
      tags: ["Audit Logs"],
      summary: "Project feed",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Feed" } },
    },
  },
};
const auditLogSchemas = {
  AuditLog: {
    type: "object",
    properties: { id: { type: "string" }, action: { type: "string" } },
  },
};
export { auditLogPaths, auditLogSchemas };
