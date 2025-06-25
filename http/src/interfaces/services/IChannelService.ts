import { Channel, CreateChannelDto, ChannelResponse } from '../../models/Channel';

export interface IChannelService {
  createChannel(channelData: CreateChannelDto): Promise<ChannelResponse>;
  getChannelById(id: string): Promise<ChannelResponse>;
  getAllChannels(): Promise<ChannelResponse[]>;
  updateChannel(id: string, channelData: Partial<Channel>): Promise<ChannelResponse>;
  deleteChannel(id: string): Promise<boolean>;
  getChannelIdsForParser(): Promise<number[]>;
} 