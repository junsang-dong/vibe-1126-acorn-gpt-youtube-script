import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import generateTitlesRouter from './routes/generateTitles.js';
import generateScriptRouter from './routes/generateScript.js';
import extractYoutubeRouter from './routes/extractYoutube.js';
import uploadScriptRouter from './routes/uploadScript.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function corsOrigin() {
  if (process.env.NODE_ENV === 'production') {
    if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
    return true;
  }
  return 'http://localhost:5173';
}

app.use(
  cors({
    origin: corsOrigin(),
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use((req, res, next) => {
  logger.info(
    {
      method: req.method,
      url: req.url,
      ip: req.ip
    },
    'Incoming request'
  );
  next();
});

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      {
        ip: req.ip,
        url: req.url
      },
      'Rate limit exceeded'
    );
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
});

app.use('/api/', limiter);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const healthPayload = () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime()
});

app.get('/health', (req, res) => {
  res.json(healthPayload());
});

app.get('/api/health', (req, res) => {
  res.json(healthPayload());
});

app.use('/api/generate-titles', generateTitlesRouter);
app.use('/api/generate-script', generateScriptRouter);
app.use('/api/extract-youtube', extractYoutubeRouter);
app.use('/api/upload-script', uploadScriptRouter);

app.use((err, req, res, next) => {
  logger.error(
    {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    },
    'Unhandled error'
  );

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

export default app;
