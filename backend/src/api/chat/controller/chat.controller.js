import { createConversationService, getRecentConversationRows } from '../service/chat.service.js';

export async function createConversationController(req, res, next) {
  try {
    const { question } = req.body;

    const result = await createConversationService(question);
    res.status(201).json({
      success: true,
      message: 'conversation posted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversationsController(req, res, next) {
  try {

  const result = await getRecentConversationRows(100);
  
   res.status(200).json({
    success: true,
    message: 'conversations fetched successfully',
    data: result,
  });
  //



  } catch (error) {
    next(error);
  }
}