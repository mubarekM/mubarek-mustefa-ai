import express from 'express';
import {
  createConversationController,
  getConversationsController,
} from './controller/chat.controller.js';

const chatRouter = express.Router();

chatRouter.post('/conversations', createConversationController);
chatRouter.get('/conversations', getConversationsController);

export default chatRouter;