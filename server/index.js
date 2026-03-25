import app from './app.js';
import { logger } from './logger.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  if (!process.env.OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY not set in environment variables!');
  }
});

export { logger };
