import { corsOptions } from "./middleware/cors.js";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { generateSwaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import productRoutes from "./products/product.routes.js";
import profileRoutes from "./profiles/profile.routes.js";
import { resetDb } from "./shared/store.js";

const app = express();
const port = process.env["PORT"] ?? "9001";

// Middleware
app.use(express.json());
app.use(corsOptions);

// Health check
app.get("/", (_, res) => {
  res.json({ message: "FOBOH Pricing Module API", status: "running" });
});

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/pricing-profiles", profileRoutes);

// Generate OpenAPI spec "AFTER" routes are registered
const swaggerSpec = generateSwaggerSpec();

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test-only route to reset in-memory DB
if (process.env["NODE_ENV"] === "test") {
  app.post("/api/test/reset", (_, res) => {
    resetDb();
    res.status(204).send();
  });
}

// Error handling (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api-docs`);
});
