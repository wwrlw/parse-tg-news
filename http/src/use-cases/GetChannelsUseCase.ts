import { IChannelService } from '../interfaces/services/IChannelService';
import { ChannelResponse } from '../models/Channel';

export class GetChannelsUseCase {
  constructor(private channelService: IChannelService) {}

  async execute(): Promise<ChannelResponse[]> {
    try {
      return await this.channelService.getAllChannels();
    } catch (error) {
      throw error;
    }
  }
} 