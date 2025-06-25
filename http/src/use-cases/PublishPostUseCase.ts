import { IPostRepository } from '../interfaces/repositories/IPostRepository';
import { ITelegramPublishService } from '../services/TelegramPublishService';
import { NotFoundError } from '../exceptions/NotFoundError';

export class PublishPostUseCase {
  constructor(
    private postRepository: IPostRepository,
    private telegramPublishService: ITelegramPublishService
  ) {}

  async execute(postId: string): Promise<{ success: boolean; message: string }> {
    const post = await this.postRepository.findById(postId);
    
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const published = await this.telegramPublishService.publishPost(post);
    
    if (published) {
      return {
        success: true,
        message: 'Post published successfully to Telegram channel'
      };
    } else {
      return {
        success: false,
        message: 'Failed to publish post to Telegram channel'
      };
    }
  }
} 