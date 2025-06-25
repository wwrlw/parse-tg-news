import Fastify from 'fastify';
import dotenv from 'dotenv';
import mongoConnector from './db/mongo';
import authPlugin from './plugins/auth';
import { authRoutes } from './routes/auth';
import { postsRoutes } from './routes/posts';
import { channelsRoutes } from './routes/channels';
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import path from 'path';
import { DependencyContainer } from './container/DependencyContainer';
import { errorHandler } from './middleware/ErrorHandler';

dotenv.config();

const fastify = Fastify({ logger: true });

async function start() {
    try {
        await fastify.register(cors, {
            origin: true,
            credentials: true,
          });
        await fastify.register(mongoConnector);
        const container = DependencyContainer.getInstance();
        container.setMongo(fastify.mongo);
        
        // Настройка раздачи статических файлов для медиа
        await fastify.register(fastifyStatic, {
            root: path.join(process.cwd(), 'media'),
            prefix: '/media/',
            decorateReply: false
        });
        
        await fastify.register(authPlugin);
        await fastify.register(authRoutes);
        await fastify.register(postsRoutes);
        await fastify.register(channelsRoutes);
        fastify.setErrorHandler(errorHandler);
        await fastify.ready();
        await fastify.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();