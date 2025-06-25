import { IChannelService } from '../interfaces/services/IChannelService';
import { ValidationError } from '../exceptions/ValidationError';

export class DeleteChannelUseCase {
  constructor(private channelService: IChannelService) {}

  async execute(id: string): Promise<boolean> {
    if (!id || id.trim() === '') {
      throw new ValidationError('Channel ID is required');
    }

    try {
      return await this.channelService.deleteChannel(id);
    } catch (error) {
      throw error;
    }
  }
} 