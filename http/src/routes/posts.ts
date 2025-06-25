import { FastifyInstance } from "fastify";
import { DependencyContainer } from "../container/DependencyContainer";
import { GetPostUseCase } from "../use-cases/GetPostUseCase";
import { GetPostsUseCase } from "../use-cases/GetPostsUseCase";
import { PublishPostUseCase } from "../use-cases/PublishPostUseCase";

export async function postsRoutes(fastify: FastifyInstance) {
  const container = DependencyContainer.getInstance();

  fastify.get(
    "/posts",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
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
