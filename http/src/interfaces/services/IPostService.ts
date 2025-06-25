import { Post, CreatePostDto } from '../../models/Post';
import { PostQuery, PaginatedResponse } from '../../types/PostQuery';

export interface IPostService {
  getPost(id: string): Promise<Post>;
  getPosts(): Promise<Post[]>;
  getPostsWithQuery(query: PostQuery): Promise<PaginatedResponse<Post>>;
  createPost(post: CreatePostDto): Promise<Post>;
  getPostsByChannel(channel: string): Promise<Post[]>;
  deletePost(id: string): Promise<void>;
} 