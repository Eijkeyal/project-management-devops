const approvalPaths = {
  "/approvals/content/{contentId}/submit": {
    post: {
      tags: ["Approvals"],
      summary: "Submit for approval",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "contentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 201: { description: "Submitted" } },
    },
  },
  "/approvals/pending": {
    get: {
      tags: ["Approvals"],
      summary: "Pending approvals",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Pending" } },
    },
  },
  "/approvals/content/{contentId}": {
    get: {
      tags: ["Approvals"],
      summary: "Approvals for content",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "contentId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: { 200: { description: "Approvals" } },
    },
  },
  "/approvals/{id}/approve": {
    post: {
      tags: ["Approvals"],
      summary: "Approve",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Approved" } },
    },
  },
  "/approvals/{id}/reject": {
    post: {
      tags: ["Approvals"],
      summary: "Reject",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Rejected" } },
    },
  },
  "/approvals/{id}/cancel": {
    post: {
      tags: ["Approvals"],
      summary: "Cancel",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Cancelled" } },
    },
  },
};
const approvalSchemas = {
  Approval: {
    type: "object",
    properties: { id: { type: "string" }, status: { type: "string" } },
  },
};
export { approvalPaths, approvalSchemas };
