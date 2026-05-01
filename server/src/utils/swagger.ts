import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TECHALVES Solutions API",
      version: "1.0.0",
      description: "Backend API for TECHALVES Solutions e-commerce platform",
    },
    servers: [{ url: "/api", description: "API server" }],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
