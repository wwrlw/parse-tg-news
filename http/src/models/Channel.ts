import { ObjectId } from 'mongodb';

export interface Channel {
  _id?: ObjectId;
  username: string;
  channel_id: number;
  created_at: Date;
}

export interface CreateChannelDto {
  username: string;
  channel_id: number;
}

export interface ChannelResponse {
  id: string;
  username: string;
  channel_id: number;
  created_at: Date;
} 