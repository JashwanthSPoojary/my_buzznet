import express from "express";
import { userRouter } from "./routes/usersRoute";
import { JWT_SECRET, PORT, SESSION_KEY } from "./utils/config";
import passport from "passport";
import cors from "cors";
import "./utils/passport";
import { workspaceRouter } from "./routes/workspaceRoute";
import http from "http";
import { initializeWebSocketServer } from "./websocketHandler";
import { chatbotRouter } from "./routes/chatbotRoute";
import path from "path";



const app = express();
const server = http.createServer(app);


app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.use("/user", userRouter);
app.use("/workspace", workspaceRouter);
app.use("/chatbot", chatbotRouter);

initializeWebSocketServer(server);

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
