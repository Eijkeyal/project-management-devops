const notificationPaths = {
  "/notifications": {
    get: {
      tags: ["Notifications"],
      summary: "My notifications",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Notifications" } },
    },
  },
  "/notifications/unread-count": {
    get: {
      tags: ["Notifications"],
      summary: "Unread count",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Count" } },
    },
  },
  "/notifications/read-all": {
    patch: {
      tags: ["Notifications"],
      summary: "Mark all read",
      security: [{ BearerAuth: [] }],
      responses: { 200: { description: "Marked" } },
    },
  },
  "/notifications/{id}/read": {
    patch: {
      tags: ["Notifications"],
      summary: "Mark read",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Marked" } },
    },
  },
  "/notifications/{id}": {
    delete: {
      tags: ["Notifications"],
      summary: "Delete notification",
      security: [{ BearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/IdParam" }],
      responses: { 200: { description: "Deleted" } },
    },
  },
};
const notificationSchemas = {
  Notification: {
    type: "object",
    properties: { id: { type: "string" }, title: { type: "string" } },
  },
};
export { notificationPaths, notificationSchemas };
