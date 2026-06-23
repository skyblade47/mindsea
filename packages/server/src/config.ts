export const config = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  AI_MOCK: process.env.AI_MOCK !== 'false',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gpt-4o',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || '',
  DB_URL: process.env.DB_URL || '',
};