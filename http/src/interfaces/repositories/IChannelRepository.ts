import { Channel, CreateChannelDto } from '../../models/Channel';

export interface IChannelRepository {
  findById(id: string): Promise<Channel | null>;
  findByUsername(username: string): Promise<Channel | null>;
  findByChannelId(channelId: number): Promise<Channel | null>;
  findAll(): Promise<Channel[]>;
  create(channel: CreateChannelDto): Promise<Channel>;
  update(id: string, channel: Partial<Channel>): Promise<Channel | null>;
  deleteById(id: string): Promise<boolean>;
} 