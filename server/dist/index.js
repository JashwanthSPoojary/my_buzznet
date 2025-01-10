"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersRoute_1 = require("./routes/usersRoute");
const config_1 = require("./utils/config");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
require("./utils/passport");
const workspaceRoute_1 = require("./routes/workspaceRoute");
const http_1 = __importDefault(require("http"));
const websocketHandler_1 = require("./websocketHandler");
const chatbotRoute_1 = require("./routes/chatbotRoute");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "..", "uploads")));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, express_session_1.default)({
    secret: config_1.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/user", usersRoute_1.userRouter);
app.use("/workspace", workspaceRoute_1.workspaceRouter);
app.use("/chatbot", chatbotRoute_1.chatbotRouter);
// Initialize WebSocket server
(0, websocketHandler_1.initializeWebSocketServer)(server);
server.listen(config_1.PORT, () => {
    console.log("Server is running on port", config_1.PORT);
});
