import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AppDataSource, databaseConnection } from "./config/databaseConnection";
import { errorMiddleware } from "./middleware/errorHandler";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import { Server } from "socket.io";
import { createServer } from "http";
import { Message } from "./models/Message";

const app = express();
const PORT = process.env.PORT || 6000;

app.use(
    cors({
        origin: [process.env.FRONTEND_URL as string],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
)

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
    },
});

io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);

    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
    });

    socket.on("sendMessage", async ({ chatId, senderId, content }) => {
        const message =  AppDataSource.getRepository(Message).create({
            chat: { id: chatId },
            sender: { id: senderId },
            content,
        });
        await AppDataSource.getRepository(Message).save(message);

        io.to(chatId).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
})

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);

const startServer = async () => {
    // connect to database
    await databaseConnection();
};

startServer();
app.use(errorMiddleware);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
