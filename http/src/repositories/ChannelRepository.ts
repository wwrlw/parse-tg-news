import { ObjectId } from 'mongodb';
import { FastifyMongoObject } from '@fastify/mongodb';
import { IChannelRepository } from '../interfaces/repositories/IChannelRepository';
import { Channel, CreateChannelDto } from '../models/Channel';

export class ChannelRepository implements IChannelRepository {
  constructor(private mongo: FastifyMongoObject) {}

  async findById(id: string): Promise<Channel | null> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid channel ID');
    }

    const channel = await this.mongo.db.collection('channels').findOne({ 
      _id: new ObjectId(id) 
    });

    return channel as Channel | null;
  }

  async findByUsername(username: string): Promise<Channel | null> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    const channel = await this.mongo.db.collection('channels').findOne({ 
      username: username 
    });

    return channel as Channel | null;
  }

  async findByChannelId(channelId: number): Promise<Channel | null> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    const channel = await this.mongo.db.collection('channels').findOne({ 
      channel_id: channelId 
    });

    return channel as Channel | null;
  }

  async findAll(): Promise<Channel[]> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    const channels = await this.mongo.db.collection('channels')
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return channels as Channel[];
  }

  async create(channelData: CreateChannelDto): Promise<Channel> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    // Проверяем, не существует ли уже канал с таким username или channel_id
    const existingByUsername = await this.findByUsername(channelData.username);
    if (existingByUsername) {
      throw new Error('Channel with this username already exists');
    }

    const existingByChannelId = await this.findByChannelId(channelData.channel_id);
    if (existingByChannelId) {
      throw new Error('Channel with this channel_id already exists');
    }

    const channel: Channel = {
      ...channelData,
      created_at: new Date()
    };

    const result = await this.mongo.db.collection('channels').insertOne(channel);
    return { ...channel, _id: result.insertedId };
  }

  async update(id: string, channelData: Partial<Channel>): Promise<Channel | null> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid channel ID');
    }

    const result = await this.mongo.db.collection('channels').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: channelData },
      { returnDocument: 'after' }
    );

    return result?.value as Channel | null;
  }

  async deleteById(id: string): Promise<boolean> {
    if (!this.mongo.db) throw new Error('MongoDB is not connected');
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid channel ID');
    }

    const result = await this.mongo.db.collection('channels').deleteOne({ 
      _id: new ObjectId(id) 
    });

    return result.deletedCount > 0;
  }
} 