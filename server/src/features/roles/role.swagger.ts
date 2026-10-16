const rolePaths = {
  "/roles": {
    get: {
      tags: ["Roles"],
      summary: "List all roles",
      description:
        "Returns the full list of roles defined in the system. " +
        "Any authenticated user can view them.",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "List of roles",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Role" },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
};

const roleSchemas = {
  Role: {
    type: "object",
    properties: {
      id: { type: "string", example: "72f359f9-c21d-4f3b-917b-1e7477f7ef2b" },
      name: { type: "string", example: "Admin" },
      description: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
};

export { rolePaths, roleSchemas };
