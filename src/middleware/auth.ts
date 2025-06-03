import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/databaseConnection";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import { ErrorHandler } from "./errorHandler";
import { catchAsyncErrorHandler } from "../utils/catchAsyncErorrHandler";

const userRepository = AppDataSource.getRepository(User);
interface AuthenticatedRequest extends Request {
    user?: User;
}

export const isAuthenticated = catchAsyncErrorHandler(
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { token } = req.cookies;
        console.log("-----------------------");
        console.log("req cookies:", req.cookies);
        console.log("1");
        
        if (!token) {
            console.log("2");
            next(new ErrorHandler("User is not authenticated.", 401));
            return;
        }
        console.log("3");
        if (!process.env.JWT_SECRET) {
            console.log("4");
            next(new ErrorHandler("JWT_SECRET is not found.", 404));
            return;
        }
        console.log("5");
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
            id: string;
        };
        console.log("6");
        if (!decoded) {
            console.log("7");
             next(new ErrorHandler("token is invalid.", 401));
             return;
        }
        console.log("8");
        const user = await userRepository.findOne({
            where: { id: decoded.id },
        });
        console.log("9");
        if (!user) {
            console.log("10");
            next(new ErrorHandler("User not found.", 404));
            return;
        }
        console.log("11");
        req.user = user;
        next();
    }
);
