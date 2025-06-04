import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/databaseConnection";
import { User } from "../models/User";
import { catchAsyncErrorHandler } from "../utils/catchAsyncErorrHandler";
import { ErrorHandler } from "../middleware/errorHandler";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";

const userRepository = AppDataSource.getRepository(User);
const chatRepository = AppDataSource.getRepository(Chat);
const messageRepository = AppDataSource.getRepository(Message);

export const startChat = catchAsyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId1, userId2 } = req.body;
    const user1 = await userRepository.findOneBy({ id: userId1 });
    const user2 = await userRepository.findOneBy({ id: userId2 });

    if (!user1 || !user2) {
        next(new ErrorHandler("User not found", 404));
        return;
    }

    let chat = await chatRepository.findOne({
        where: [
            { user1: { id: userId1 }, user2: { id: userId2 } },
            { user1: { id: userId2 }, user2: { id: userId1 } }
        ],
    });

    if (!chat) {
        chat = chatRepository.create({ user1, user2 });
        await chatRepository.save(chat);
    }

    res.status(200).json({
        success: true,
        chat,
        message: "Chat started"
    });
})

export const getUserChats = catchAsyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;

    const chats = await chatRepository.find({
        where: [{ user1: { id: userId } }, { user2: { id: userId } }],
        relations: ["user1", "user2", "messages", "messages.sender"],
        order: {
            messages: {
                createdAt: "ASC"
            }
        }
    });
    res.status(200).json({ success: true, chats });
})

export const sendMessage = catchAsyncErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { chatId, senderId, content } = req.body; 

    const chat = await chatRepository.findOneBy({ id: chatId });
    const sender = await userRepository.findOneBy({ id: senderId });

    if (!chat || !sender) {
        next(new ErrorHandler("Chat or user not found.", 404));
        return;
    }

    const message = messageRepository.create({ chat, sender, content });
    await messageRepository.save(message);

    res.status(200).json({ success: true, message });
})
