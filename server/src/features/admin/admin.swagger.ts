const adminPaths = {
  "/admin/dashboard/stats": {
    get: {
      tags: ["Admin"],
      summary: "Get admin dashboard statistics",
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: "Dashboard statistics" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
};
export { adminPaths };
