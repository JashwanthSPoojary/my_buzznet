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
exports.auth = void 0;
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.token;
    console.log(token);
    if (token) {
        try {
            if (!config_1.JWT_SECRET)
                return;
            const decodedinformation = yield jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
            const user_id = decodedinformation.user_id;
            console.log(user_id);
            req.user_id = user_id;
            next();
        }
        catch (error) {
            res.json({
                error_message: "failed to authorize",
                error: error
            });
        }
    }
    else {
        res.json({
            error_message: "user is unauthorized",
            error: "no token found "
        });
        return;
    }
});
exports.auth = auth;
