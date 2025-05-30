import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/databaseConnection";
import { catchAsyncErrorHandler } from "../utils/catchAsyncErorrHandler";
import { validate } from "class-validator";
import { ErrorHandler } from "../middleware/errorHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const userRepository = AppDataSource.getRepository(User);

interface AuthenticatedRequest extends Request {
    user?: User;
}

export const getAllUsers = catchAsyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const users = await userRepository.find();

    res.status(200).json({ success: true, users });
})

export const getUser = catchAsyncErrorHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    const user = await userRepository.findOneBy({ id: userId });

    res.status(200).json({ success: true, user });
})


export const register = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { username, email, password } = req.body;

        const newUser = userRepository.create({
            username,
            email,
            password,
        });

        const validationErrors = await validate(newUser, {
            skipMissingProperties: true,
        });
        if (validationErrors.length > 0) {
            next(
                new ErrorHandler(
                    Object.values(validationErrors[0].constraints!)[0],
                    400
                )
            );
            return;
        }

        const emailExists = await userRepository.findOne({ where: { email } });
        if (emailExists) {
            next(new ErrorHandler("Email is already used", 400));
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        newUser.password = hashedPassword;

        await userRepository.save(newUser);

        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: userWithoutPassword,
        });
    }
);

export const login = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { email, password } = req.body;

        const userToValidate = userRepository.create({
            email,
            password,
        });
        const validationErrors = await validate(userToValidate, {
            skipMissingProperties: true,
        });
        if (validationErrors.length > 0) {
            next(
                new ErrorHandler(
                    Object.values(validationErrors[0].constraints!)[0],
                    400
                )
            );
            return;
        }

        const user = await userRepository.findOne({
            where: { email },
        });
        if (!user) {
            next(
                new ErrorHandler(
                    "User is not registered,Please signup first",
                    400
                )
            );
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
            const payload = {
                id: user.id,
            };

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                next(new ErrorHandler("JWT_SECRET is not found.", 400));
                return;
            }

            const token = jwt.sign(payload, secret, {
                expiresIn: "7d",
            });

            user.token = token;
            await userRepository.save(user);
            const { password: _, ...userWithoutPassword } = user;

            res.cookie("token", token, {
                httpOnly: false,
                secure: true,
                sameSite: "none",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000
            }).status(200).json({
                success: true,
                token,
                user: userWithoutPassword,
                message: "User Logged in successfully",
            });
        } else {
            next(new ErrorHandler("Password is incorrect", 400));
            return;
        }
    }
);

export const logout = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        res.clearCookie("token");
        res.status(200).json({
            success: true,
            message: "User Logged out successfully",
        });
    }
);
