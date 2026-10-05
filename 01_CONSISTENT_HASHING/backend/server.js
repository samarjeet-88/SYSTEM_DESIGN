import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.js";
import globalErrorHandler from "./utils/globalErrorHandler.js";
import router from "./route.js";

const app = express();

// Allow all origins, methods, and headers in development to prevent CORS errors
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json());

app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.listen(8000, () => {
    console.log("Server is running and listening on port 8000");
    console.log("Swagger documentation available at http://localhost:8000/api/v1/docs");
});