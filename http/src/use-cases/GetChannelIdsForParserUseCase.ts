import { IChannelService } from '../interfaces/services/IChannelService';

export class GetChannelIdsForParserUseCase {
  constructor(private channelService: IChannelService) {}

  async execute(): Promise<number[]> {
    try {
      return await this.channelService.getChannelIdsForParser();
    } catch (error) {
      throw error;
    }
  }
} 