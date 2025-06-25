import { IChannelService } from '../interfaces/services/IChannelService';
import { ChannelResponse } from '../models/Channel';
import { ValidationError } from '../exceptions/ValidationError';

export class GetChannelUseCase {
  constructor(private channelService: IChannelService) {}

  async execute(id: string): Promise<ChannelResponse> {
    if (!id || id.trim() === '') {
      throw new ValidationError('Channel ID is required');
    }

    try {
      return await this.channelService.getChannelById(id);
    } catch (error) {
      throw error;
    }
  }
} 