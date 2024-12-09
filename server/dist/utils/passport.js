"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = require("./config");
const client_1 = require("@prisma/client");
const pgClient = new client_1.PrismaClient();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: config_1.GOOGLE_CLIENT_ID,
    clientSecret: config_1.GOOGLE_CLIENT_SECRET,
    callbackURL: config_1.CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email === null)
            return done(null, false);
        let user = yield pgClient.users.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            user = yield pgClient.users.create({
                data: {
                    username: profile.displayName,
                    email: email,
                    password_hash: "none",
                },
            });
        }
        if (!config_1.JWT_SECRET)
            return done(null, false);
        const token = yield jsonwebtoken_1.default.sign({
            user_id: user.id,
        }, config_1.JWT_SECRET);
        return done(null, { token });
    }
    catch (error) {
        return done(error);
    }
})));
