import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerServerUrl = process.env.SWAGGER_SERVER_URL || "http://localhost:3000";

export const setupSwagger = (app: Express) => {
    const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Mini Blog API",
        version: "1.0.0",
        description: "Documentation for the Mini Blog REST API",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      servers: [
        { url: swaggerServerUrl },
      ],
    },

    apis: ["./Routes.ts"], 
  };

  const specs = swaggerJsdoc(options);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}