import { IPostService } from '../interfaces/services/IPostService';
import { PostQuery, PaginatedResponse } from '../types/PostQuery';
import { Post } from '../models/Post';

export class GetPostsWithQueryUseCase {
  constructor(private postService: IPostService) {}

  async execute(query: PostQuery): Promise<PaginatedResponse<Post>> {
    try {
      return await this.postService.getPostsWithQuery(query);
    } catch (error) {
      throw error;
    }
  }
} 