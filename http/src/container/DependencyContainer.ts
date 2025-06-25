import { FastifyMongoObject } from '@fastify/mongodb';
import { PostRepository } from '../repositories/PostRepository';
import { UserRepository } from '../repositories/UserRepository';
import { PostService } from '../services/PostService';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { TelegramPublishService } from '../services/TelegramPublishService';
import { GetPostUseCase } from '../use-cases/GetPostUseCase';
import { GetPostsUseCase } from '../use-cases/GetPostsUseCase';
import { CreateUserUseCase } from '../use-cases/CreateUserUseCase';
import { LoginUseCase } from '../use-cases/LoginUseCase';
import { PublishPostUseCase } from '../use-cases/PublishPostUseCase';

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

  getGetPostUseCase(): GetPostUseCase {
    return new GetPostUseCase(this.getPostService());
  }

  getGetPostsUseCase(): GetPostsUseCase {
    return new GetPostsUseCase(this.getPostService());
  }

  getCreateUserUseCase(): CreateUserUseCase {
    return new CreateUserUseCase(this.getUserService());
  }

  getLoginUseCase(): LoginUseCase {
    return new LoginUseCase(this.getUserService());
  }

  getPublishPostUseCase(): PublishPostUseCase {
    return new PublishPostUseCase(this.getPostRepository(), this.getTelegramPublishService());
  }
} 