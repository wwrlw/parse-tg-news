import { ObjectId } from 'mongodb';
import { FastifyMongoObject } from '@fastify/mongodb';
import { IPostRepository } from '../interfaces/repositories/IPostRepository';
import { Post, CreatePostDto } from '../models/Post';
import { PostQuery, PaginatedResponse, PostFilters } from '../types/PostQuery';

export class PostRepository implements IPostRepository {
  constructor(private mongo: FastifyMongoObject) {}

  async findById(id: string): Promise<Post | null> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid post ID');
    }

    const post = await this.mongo.db.collection('posts').findOne({ 
      _id: new ObjectId(id) 
    });

    return post as Post | null;
  }

  async findAll(): Promise<Post[]> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    const posts = await this.mongo.db.collection('posts')
      .find()
      .sort({ created_at: -1 })
      .toArray();

    return posts as Post[];
  }

  async findWithQuery(query: PostQuery): Promise<PaginatedResponse<Post>> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    const { pagination, filters, sort } = query;
    const mongoFilters = this.buildMongoFilters(filters);
    const mongoSort = this.buildMongoSort(sort);
    
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [posts, total] = await Promise.all([
      this.mongo.db.collection('posts')
        .find(mongoFilters)
        .sort(mongoSort)
        .skip(skip)
        .limit(pagination.limit)
        .toArray(),
      this.count(mongoFilters)
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    return {
      data: posts as Post[],
      params: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      }
    };
  }

  async count(filters: any = {}): Promise<number> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    return await this.mongo.db.collection('posts').countDocuments(filters);
  }

  private buildMongoFilters(filters?: PostFilters): any {
    if (!filters) return {};

    const mongoFilters: any = {};

    if (filters.source_channel) {
      mongoFilters.source_channel = { 
        $regex: filters.source_channel, 
        $options: 'i' 
      };
    }

    if (filters.text) {
      mongoFilters.text = { 
        $regex: filters.text, 
        $options: 'i' 
      };
    }

    if (filters.is_unique !== undefined) {
      mongoFilters.is_unique = filters.is_unique;
    }

    if (filters.date_from || filters.date_to) {
      mongoFilters.created_at = {};
      if (filters.date_from) {
        mongoFilters.created_at.$gte = filters.date_from;
      }
      if (filters.date_to) {
        mongoFilters.created_at.$lte = filters.date_to;
      }
    }

    return mongoFilters;
  }

  private buildMongoSort(sort?: any): any {
    if (!sort) {
      return { created_at: -1 };
    }

    const sortOrder = sort.order === 'asc' ? 1 : -1;
    return { [sort.field]: sortOrder };
  }

  async create(post: CreatePostDto): Promise<Post> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    const newPost: Post = {
      ...post,
      timestamp: new Date(),
      created_at: new Date(),
      is_unique: post.is_unique ?? false,
      media: post.media ?? []
    };

    const result = await this.mongo.db.collection('posts').insertOne(newPost);
    return { ...newPost, _id: result.insertedId };
  }

  async findByChannel(channel: string): Promise<Post[]> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    const posts = await this.mongo.db.collection('posts')
      .find({ source_channel: channel })
      .sort({ created_at: -1 })
      .toArray();

    return posts as Post[];
  }

  async deleteById(id: string): Promise<boolean> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid post ID');
    }

    const result = await this.mongo.db.collection('posts').deleteOne({ 
      _id: new ObjectId(id) 
    });

    return result.deletedCount > 0;
  }
} 