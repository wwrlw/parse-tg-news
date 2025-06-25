import { FastifyMongoObject } from '@fastify/mongodb';
import { PostRepository } from '../repositories/PostRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ChannelRepository } from '../repositories/ChannelRepository';
import { PostService } from '../services/PostService';
import { UserService } from '../services/UserService';
import { ChannelService } from '../services/ChannelService';
import { AuthService } from '../services/AuthService';
import { TelegramPublishService } from '../services/TelegramPublishService';
import { GetPostUseCase } from '../use-cases/GetPostUseCase';
import { GetPostsUseCase } from '../use-cases/GetPostsUseCase';
import { GetPostsWithQueryUseCase } from '../use-cases/GetPostsWithQueryUseCase';
import { CreateUserUseCase } from '../use-cases/CreateUserUseCase';
import { LoginUseCase } from '../use-cases/LoginUseCase';
import { CreateChannelUseCase } from '../use-cases/CreateChannelUseCase';
import { GetChannelsUseCase } from '../use-cases/GetChannelsUseCase';
import { GetChannelUseCase } from '../use-cases/GetChannelUseCase';
import { DeleteChannelUseCase } from '../use-cases/DeleteChannelUseCase';
import { GetChannelIdsForParserUseCase } from '../use-cases/GetChannelIdsForParserUseCase';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private mongo: FastifyMongoObject | null = null;

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  setMongo(mongo: FastifyMongoObject) {
    this.mongo = mongo;
  }

  getPostRepository(): PostRepository {
    if (!this.mongo) throw new Error('MongoDB not initialized');
    return new PostRepository(this.mongo);
  }

  getUserRepository(): UserRepository {
    if (!this.mongo) throw new Error('MongoDB not initialized');
    return new UserRepository(this.mongo);
  }

  getChannelRepository(): ChannelRepository {
    if (!this.mongo) throw new Error('MongoDB not initialized');
    return new ChannelRepository(this.mongo);
  }

  getAuthService(): AuthService {
    const jwtSecret = process.env.JWT_SECRET || 'supersecretkey';
    return new AuthService(jwtSecret);
  }

  getTelegramPublishService(): TelegramPublishService {
    return new TelegramPublishService();
  }

  getPostService(): PostService {
    return new PostService(this.getPostRepository());
  }

  getUserService(): UserService {
    return new UserService(this.getUserRepository(), this.getAuthService());
  }

  getChannelService(): ChannelService {
    return new ChannelService(this.getChannelRepository());
  }

  getGetPostUseCase(): GetPostUseCase {
    return new GetPostUseCase(this.getPostService());
  }

  getGetPostsUseCase(): GetPostsUseCase {
    return new GetPostsUseCase(this.getPostService());
  }

  getGetPostsWithQueryUseCase(): GetPostsWithQueryUseCase {
    return new GetPostsWithQueryUseCase(this.getPostService());
  }

  getCreateUserUseCase(): CreateUserUseCase {
    return new CreateUserUseCase(this.getUserService());
  }

  getLoginUseCase(): LoginUseCase {
    return new LoginUseCase(this.getUserService());
  }

  getCreateChannelUseCase(): CreateChannelUseCase {
    return new CreateChannelUseCase(this.getChannelService());
  }

  getGetChannelsUseCase(): GetChannelsUseCase {
    return new GetChannelsUseCase(this.getChannelService());
  }

  getGetChannelUseCase(): GetChannelUseCase {
    return new GetChannelUseCase(this.getChannelService());
  }

  getDeleteChannelUseCase(): DeleteChannelUseCase {
    return new DeleteChannelUseCase(this.getChannelService());
  }

  getGetChannelIdsForParserUseCase(): GetChannelIdsForParserUseCase {
    return new GetChannelIdsForParserUseCase(this.getChannelService());
  }
} 