/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import notFound from './app/middlewares/notFound';
import cookieParser from 'cookie-parser';
import globalErrorMainHandler from './app/middlewares/globalErrorMainHandler';
import router from './app/routes';
import { logger } from './utils/logger';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Logging middleware
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'server is running' });
});

// Global error handler
app.use(globalErrorMainHandler);

// Not Found handler
app.use(notFound);

export default app;
