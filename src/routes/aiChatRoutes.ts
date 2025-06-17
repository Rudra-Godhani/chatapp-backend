import express, { RequestHandler } from 'express';
import { generateAIResponse, getChatHistory } from '../controller/aiChatController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.post('/generate', isAuthenticated, generateAIResponse as unknown as RequestHandler);
router.get('/history', isAuthenticated, getChatHistory as unknown as RequestHandler);

export default router; 