import { IChannelService } from '../interfaces/services/IChannelService';
import { IChannelRepository } from '../interfaces/repositories/IChannelRepository';
import { 
  Channel, 
  CreateChannelDto, 
  ChannelResponse 
} from '../models/Channel';
import { NotFoundError } from '../exceptions/NotFoundError';

export class ChannelService implements IChannelService {
  constructor(private channelRepository: IChannelRepository) {}

  async createChannel(channelData: CreateChannelDto): Promise<ChannelResponse> {
    const channel = await this.channelRepository.create(channelData);

    return {
      id: channel._id?.toString() || '',
      username: channel.username,
      channel_id: channel.channel_id,
      created_at: channel.created_at
    };
  }

  async getChannelById(id: string): Promise<ChannelResponse> {
    const channel = await this.channelRepository.findById(id);
    if (!channel) {
      throw new NotFoundError('Channel not found');
    }

    return {
      id: channel._id?.toString() || '',
      username: channel.username,
      channel_id: channel.channel_id,
      created_at: channel.created_at
    };
  }

  async getAllChannels(): Promise<ChannelResponse[]> {
    const channels = await this.channelRepository.findAll();
    
    return channels.map(channel => ({
      id: channel._id?.toString() || '',
      username: channel.username,
      channel_id: channel.channel_id,
      created_at: channel.created_at
    }));
  }

  async updateChannel(id: string, channelData: Partial<Channel>): Promise<ChannelResponse> {
    const updatedChannel = await this.channelRepository.update(id, channelData);
    if (!updatedChannel) {
      throw new NotFoundError('Channel not found');
    }

    return {
      id: updatedChannel._id?.toString() || '',
      username: updatedChannel.username,
      channel_id: updatedChannel.channel_id,
      created_at: updatedChannel.created_at
    };
  }

  async deleteChannel(id: string): Promise<boolean> {
    const deleted = await this.channelRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError('Channel not found');
    }
    return deleted;
  }

  async getChannelIdsForParser(): Promise<number[]> {
    const channels = await this.channelRepository.findAll();
    return channels.map(channel => channel.channel_id);
  }
} 