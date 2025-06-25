import { FastifyInstance } from "fastify";
import { DependencyContainer } from "../container/DependencyContainer";

export async function channelsRoutes(fastify: FastifyInstance) {
  const container = DependencyContainer.getInstance();

  // Получить все каналы
  fastify.get(
    "/channels",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const getChannelsUseCase = container.getGetChannelsUseCase();
        const channels = await getChannelsUseCase.execute();
        return {
          success: true,
          data: channels
        };
      } catch (error) {
        throw error;
      }
    }
  );

  // Получить канал по ID
  fastify.get(
    "/channels/:id",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const id = (request.params as any).id;
        const getChannelUseCase = container.getGetChannelUseCase();
        const channel = await getChannelUseCase.execute(id);
        return {
          success: true,
          data: channel
        };
      } catch (error) {
        throw error;
      }
    }
  );

  // Создать новый канал
  fastify.post(
    "/channels",
    { 
      preValidation: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['username', 'channel_id'],
          properties: {
            username: { type: 'string' },
            channel_id: { type: 'number' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const channelData = request.body as any;
        const createChannelUseCase = container.getCreateChannelUseCase();
        const channel = await createChannelUseCase.execute(channelData);
        return {
          success: true,
          data: channel
        };
      } catch (error) {
        throw error;
      }
    }
  );

  // Удалить канал
  fastify.delete(
    "/channels/:id",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const id = (request.params as any).id;
        const deleteChannelUseCase = container.getDeleteChannelUseCase();
        const deleted = await deleteChannelUseCase.execute(id);
        return {
          success: true,
          data: { deleted }
        };
      } catch (error) {
        throw error;
      }
    }
  );

  // Получить ID каналов для парсера (специальный endpoint)
  fastify.get(
    "/channels/parser/ids",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const getChannelIdsForParserUseCase = container.getGetChannelIdsForParserUseCase();
        const channelIds = await getChannelIdsForParserUseCase.execute();
        return {
          success: true,
          data: channelIds
        };
      } catch (error) {
        throw error;
      }
    }
  );
} 