import express from 'express';
import cors from 'cors';
import { config } from './config';
import { apiRouter } from './api/routes';
import { errorHandler, requestLogger } from './api/middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api', apiRouter);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`[心智界] 服务启动于端口 ${config.PORT}`);
  console.log(`[心智界] AI模式: ${config.AI_MOCK ? 'Mock(模拟)' : '真实API'}`);
});