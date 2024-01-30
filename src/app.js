import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cookieParser());
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));


//routes import 
import userRouter from "./routes/user.route.js";
import healthCheckRouter from "./routes/healthCheck.route.js";

//routes declaration
app.use("/api/v1/user",userRouter);
app.use("/api/v1", healthCheckRouter);

export {app};
