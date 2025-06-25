import { FastifyInstance } from "fastify";
import { DependencyContainer } from "../container/DependencyContainer";
import { GetPostUseCase } from "../use-cases/GetPostUseCase";
import { GetPostsUseCase } from "../use-cases/GetPostsUseCase";

import { GetPostsWithQueryUseCase } from "../use-cases/GetPostsWithQueryUseCase";
import { parsePostQuery } from "../utils/queryParser";
import { postQuerySchema, postSearchResponseSchema } from "../schemas/postQuerySchema";

export async function postsRoutes(fastify: FastifyInstance) {
  const container = DependencyContainer.getInstance();

  // Новый endpoint с пагинацией, фильтрацией и сортировкой
  fastify.get(
    "/posts/search",
    { 
      preValidation: [fastify.authenticate],
      schema: {
        querystring: postQuerySchema,
        response: {
          200: postSearchResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = parsePostQuery(request.query);
        const getPostsWithQueryUseCase = container.getGetPostsWithQueryUseCase();
        const result = await getPostsWithQueryUseCase.execute(query);
        return {
          success: true,
          ...result
        };
      } catch (error) {
        throw error;
      }
    }
  );

  // Обновленный endpoint /posts с поддержкой query параметров
  fastify.get(
    "/posts",
    { 
      preValidation: [fastify.authenticate],
      schema: {
        querystring: postQuerySchema
      }
    },
    async (request, reply) => {
      try {
        // Если есть query параметры, используем новую логику
        const queryParams = request.query as any;
        if (Object.keys(queryParams).length > 0) {
          const query = parsePostQuery(queryParams);
          const getPostsWithQueryUseCase = container.getGetPostsWithQueryUseCase();
          const result = await getPostsWithQueryUseCase.execute(query);
          return {
            success: true,
            ...result
          };
        }

        // Иначе используем старую логику для обратной совместимости
        const getPostsUseCase = container.getGetPostsUseCase();
        const posts = await getPostsUseCase.execute();
        return {
          success: true,
          data: posts
        };
      } catch (error) {
        throw error;
      }
    }
  );

  fastify.get(
    '/post/:id', 
    { preValidation: [fastify.authenticate] }, 
    async (request, reply) => {
      try {
        const id = (request.params as any).id;
        const getPostUseCase = container.getGetPostUseCase();
        const post = await getPostUseCase.execute(id);
        return {
          success: true,
          data: post
        };
      } catch (error) {
        throw error;
      }
    }
  );

  fastify.post(
    '/post/:id/publish',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const id = (request.params as any).id;
        const publishPostUseCase = container.getPublishPostUseCase();
        const result = await publishPostUseCase.execute(id);
        
        return {
          success: result.success,
          message: result.message
        };
      } catch (error) {
        throw error;
      }
    }
  );
}
