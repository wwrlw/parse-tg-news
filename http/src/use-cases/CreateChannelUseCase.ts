import { IChannelService } from '../interfaces/services/IChannelService';
import { CreateChannelDto, ChannelResponse } from '../models/Channel';
import { ValidationError } from '../exceptions/ValidationError';

export class CreateChannelUseCase {
  constructor(private channelService: IChannelService) {}

  async execute(channelData: CreateChannelDto): Promise<ChannelResponse> {
    if (!channelData.username || channelData.username.trim() === '') {
      throw new ValidationError('Username is required');
    }

    if (!channelData.channel_id || typeof channelData.channel_id !== 'number') {
      throw new ValidationError('Channel ID is required and must be a number');
    }

    // Валидация формата username (должен начинаться с @ или без)
    const username = channelData.username.startsWith('@') 
      ? channelData.username 
      : `@${channelData.username}`;

    try {
      return await this.channelService.createChannel({
        ...channelData,
        username
      });
    } catch (error) {
      throw error;
    }
  }
} 