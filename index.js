import Fastify from 'fastify';
import axios from 'axios';
import cors from '@fastify/cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: '*',
});

const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db(process.env.MONGODB_DB);
  console.log('✅ Connected to MongoDB');
});

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';

fastify.post('/chat', async (request, reply) => {
  const { prompt } = request.body;

  if (!prompt) {
    return reply.code(400).send({ error: 'Prompt is required.' });
  }

  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama3.2:latest',
      prompt,
      stream: false
    });

    return reply.send({ response: response.data.response });
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: 'Error communicating with Ollama.' });
  }
});

fastify.post('/posts', async (req, reply) => {
  console.log("📩 Получен пост:", req.body);
  if (!db) return reply.code(500).send({ error: 'DB not ready' });
  await db.collection('posts').insertOne(req.body);
  reply.send({ status: 'saved' });
});

fastify.post('/make-unique', async (req, reply) => {
  if (!db) return reply.code(500).send({ error: 'DB not ready' });
  const posts = await db.collection('posts').find({ unique_text: { $exists: false } }).toArray();
  let count = 0;
  for (const post of posts) {
    const prompt = `Перефразируй данный пост: ${post.original_text || post.text}`;
    try {
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'llama3.2:latest',
        prompt: `
      Ты — профессиональный копирайтер. Твоя задача — переформулировать следующий текст, сохранив его смысл, но сделав его более уникальным и читабельным. Избегай повторов и клише, используй литературный стиль, как если бы ты писал для новостного телеграм-канала.  
      Не меняй факты и не добавляй ничего от себя.  
      Вот текст:  
      "${post.original_text || post.text}"
        `.trim(),
        stream: false
      });
      await db.collection('posts').updateOne(
        { _id: post._id },
        { $set: { unique_text: response.data.response, is_unique: true } }
      );
      count++;
    } catch (e) {
      fastify.log.error(e);
    }
  }
  reply.send({ processed: count });
});

// --- Воркер для автоматической уникализации постов ---
async function uniqueWorker() {
  while (true) {
    if (!db) {
      await new Promise(res => setTimeout(res, 2000));
      continue;
    }
    // Берём только один пост, который ещё не уникализирован
    const post = await db.collection('posts').findOne({ unique_text: { $exists: false } });
    if (!post) {
      // Нет новых постов — ждём 10 секунд
      await new Promise(res => setTimeout(res, 10000));
      continue;
    }
    const prompt = `Сделай этот новостной пост уникальным: ${post.original_text || post.text}`;
    try {
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'llama3.2:latest',
        prompt,
        stream: false
      });
      await db.collection('posts').updateOne(
        { _id: post._id },
        { $set: { unique_text: response.data.response, is_unique: true } }
      );
      fastify.log.info(`Уникализирован пост: ${post._id}`);
    } catch (e) {
      fastify.log.error(e);
      // Подождём чуть дольше, если ошибка
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

// Запускаем воркер (не блокирует основной поток)
uniqueWorker();

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Fastify API listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
