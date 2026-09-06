import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import db from './db/db.config.js';
import { errorHandler } from './src/middleware/error-handler.js';

import mainRouter from './src/api/main.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', mainRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3888;

async function startServer() {
  try {
    const connection = await db.getConnection();
    connection.release();

    app.listen(PORT, err => {
      if (err) {
        throw err;
      }
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
  }
}

startServer();