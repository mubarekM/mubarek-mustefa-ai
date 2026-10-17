import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { errorHandler } from './src/middleware/error-handler.js';

import mainRouter from './src/api/main.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use('/api', mainRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3888;

// Run a normal server on your computer; Vercel runs the app by itself
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
