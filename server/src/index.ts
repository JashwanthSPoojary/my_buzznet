import express from "express";
import { userRouter } from "./routes/usersRoute";
import { PORT, SESSION_KEY } from "./utils/config";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import "./utils/passport";
import { workspaceRouter } from "./routes/workspaceRoute";

const app = express();

app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: SESSION_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/user", userRouter);
app.use("/workspace", workspaceRouter);


app.listen(PORT, () => {
  console.log("server is running");
});
