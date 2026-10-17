import db from '../../../../db/db.config.js';
import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getRecentConversationRows = async (limit = 5) => {
  const normalizedLimit = Number.parseInt(limit, 10);
  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0
      ? 20
      : normalizedLimit;

  const { rows } = await db.query(
    `SELECT id, role, content, token_count, created_at
     FROM chat_conversations
     ORDER BY id DESC
     LIMIT $1`,
    [safeLimit],
  );

  return rows.reverse();
};

const getMessageById = async (messageId) => {
  const { rows } = await db.query(
    'SELECT id, role, content, token_count, created_at FROM chat_conversations WHERE id = $1 LIMIT 1',
    [messageId],
  );

  if (!rows[0]) return null;

  return {
    id: rows[0].id,
    role: rows[0].role,
    content: rows[0].content,
    tokenCount: Number(rows[0].token_count || 0),
    createdAt: rows[0].created_at,
  };
};

const generateAssistantAnswer = async ({ historyRows, question }) => {
  const formattedHistory = historyRows.map((row) => ({
    role: row.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: row.content }],
  }));

  const chat = geminiClient.chats.create({
    model: GEMINI_MODEL,
    history: formattedHistory,
  });

  const result = await chat.sendMessage({ message: question });
  console.log(result.usageMetadata.totalTokenCount);

  return {
    text: result.text,
    totalTokens: result.usageMetadata.totalTokenCount,
  };
};

export async function createConversationService(question) {
  if (!question || !question.trim()) {
    const error = new Error('Question is required');
    error.status = 400;
    throw error;
  }

  // 1. Fetch recent conversation history before inserting
  const historyRows = await getRecentConversationRows(5);

  // 2. Insert the new user question (token count not known yet, so null)
  const userInsert = await db.query(
    'INSERT INTO chat_conversations (role, content, token_count) VALUES ($1, $2, $3) RETURNING id',
    ['user', question, null],
  );

  // 3. Call Gemini to generate a reply
  const { text, totalTokens } = await generateAssistantAnswer({
    historyRows,
    question,
  });

  // 4. Save the assistant's reply along with token usage
  const assistantInsert = await db.query(
    'INSERT INTO chat_conversations (role, content, token_count) VALUES ($1, $2, $3) RETURNING id',
    ['assistant', text, totalTokens],
  );

  // 5. Fetch the freshly inserted user and assistant rows by their IDs
  const userConversation = await getMessageById(userInsert.rows[0].id);
  const assistantConversation = await getMessageById(
    assistantInsert.rows[0].id,
  );

  // 6. Fetch updated conversation history including both new records
  const recentConversations = await getRecentConversationRows(5);

  return {
    answer: text,
    totalTokens,
    userConversation,
    assistantConversation,
    historyRows,
    recentConversations,
  };
}

export async function getMessageByIdService(messageId) {
  const message = await getMessageById(messageId);

  if (!message) {
    const error = new Error('Message not found');
    error.status = 404;
    throw error;
  }

  return message;
}
