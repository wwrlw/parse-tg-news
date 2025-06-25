import { Post, CreatePostDto } from '../../models/Post';
import { PostQuery, PaginatedResponse } from '../../types/PostQuery';

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findAll(): Promise<Post[]>;
  findWithQuery(query: PostQuery): Promise<PaginatedResponse<Post>>;
  create(post: CreatePostDto): Promise<Post>;
  findByChannel(channel: string): Promise<Post[]>;
  deleteById(id: string): Promise<boolean>;
  count(filters?: any): Promise<number>;
} 