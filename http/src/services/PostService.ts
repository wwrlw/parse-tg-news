import { IPostService } from '../interfaces/services/IPostService';
import { IPostRepository } from '../interfaces/repositories/IPostRepository';
import { Post, CreatePostDto } from '../models/Post';
import { PostQuery, PaginatedResponse } from '../types/PostQuery';
import { NotFoundError } from '../exceptions/NotFoundError';

export class PostService implements IPostService {
  constructor(private postRepository: IPostRepository) {}

  async getPost(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    return post;
  }

  async getPosts(): Promise<Post[]> {
    return await this.postRepository.findAll();
  }

  async getPostsWithQuery(query: PostQuery): Promise<PaginatedResponse<Post>> {
    return await this.postRepository.findWithQuery(query);
  }

  async createPost(postData: CreatePostDto): Promise<Post> {
    return await this.postRepository.create(postData);
  }

  async getPostsByChannel(channel: string): Promise<Post[]> {
    return await this.postRepository.findByChannel(channel);
  }

  async deletePost(id: string): Promise<void> {
    const deleted = await this.postRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError('Post not found');
    }
  }
} 