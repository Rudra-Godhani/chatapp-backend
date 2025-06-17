import { Request, Response } from 'express';
import { AppDataSource } from '../config/databaseConnection';
import { AiChat } from '../models/AiChat';
import { User } from '../models/User';
import ollama from 'ollama';

const aiChatRepository = AppDataSource.getRepository(AiChat);

interface AuthenticatedRequest extends Request {
    user: User
}

export const generateAIResponse = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { message, model = 'llama3.2:1b' } = req.body;
        const userId = req.user?.id;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get recent conversation history (last 5 messages)
        const recentChats = await aiChatRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['user']
        });

        // Prepare conversation history for Ollama
        const conversationHistory = recentChats
            .reverse()
            .map(chat => [
                { role: 'user', content: chat.message },
                { role: 'assistant', content: chat.response }
            ])
            .flat();

        // Add current message
        conversationHistory.push({ role: 'user', content: `${message}` });

        const response = await ollama.chat({
            model: model,
            messages: conversationHistory
        });

        // Save chat history
        const aiChat = aiChatRepository.create({
            message,
            response: response.message.content,
            model,
            user: { id: userId }
        });
        await aiChatRepository.save(aiChat);

        return res.json({
            response: response.message.content,
            model: model,
            conversationHistory: conversationHistory
        });
    } catch (error) {
        console.error('Error generating AI response:', error);
        return res.status(500).json({ error: 'Failed to generate AI response' });
    }
};

export const getChatHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        
        const chatHistory = await aiChatRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            relations: ['user']
        });

        return res.json(chatHistory);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({ error: 'Failed to fetch chat history' });
    }
}; 