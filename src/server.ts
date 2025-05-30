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
import { User } from "./models/User";

const app = express();
const PORT = process.env.PORT || 6000;

app.use(
    cors({
        origin: process.env.NODE_ENV === 'production' 
            ? [process.env.FRONTEND_URL as string]
            : ['http://localhost:3000'],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["set-cookie"],
        preflightContinue: false,
        optionsSuccessStatus: 204
    })
)

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
    },
});

const messageRepository = AppDataSource.getRepository(Message);
const userRepository = AppDataSource.getRepository(User);

const userSocketMap = new Map<string, string>();

io.on("connection", (socket) => {
    socket.on("userConnect", async (userId: string) => {
        console.log("User connected:", socket.id);
        if (userId) {
            userSocketMap.set(userId, socket.id);

            await userRepository.update(
                { id: userId },
                { online: true }
            );

            io.emit("userStatus", { userId, online: true });
        }
    })

    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
    });

    socket.on("sendMessage", async ({ chatId, senderId, content }) => {
        const message = messageRepository.create({
            chat: { id: chatId },
            sender: { id: senderId },
            content,
        });
        await messageRepository.save(message);

        io.to(chatId).emit("receiveMessage", message);
    });

    socket.on("disconnect", async () => {
        console.log("User disconnected:", socket.id);
        let userId: string | undefined;
        for (const [id, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userId = id;
                break;
            }
        }

        if (userId) {
            await userRepository.update(
              { id: userId },
              { online: false }
            );
      
            userSocketMap.delete(userId);
      
            io.emit("userStatus", { userId, online: false });
          }
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
