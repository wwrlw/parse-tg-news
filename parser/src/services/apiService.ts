import fetch from 'node-fetch';

export interface Channel {
  id: string;
  username: string;
  channel_id: number;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
}

export class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private username: string;
  private password: string;

  constructor(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl;
    this.username = username;
    this.password = password;
  }

  private async login(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json() as { success: boolean; data: AuthResponse };
      if (data.success && data.data.token) {
        this.token = data.data.token;
        console.log('🔐 Successfully authenticated with API');
      } else {
        throw new Error('Login failed: invalid response');
      }
    } catch (error) {
      console.error('❌ API login error:', error);
      throw error;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.token) {
      await this.login();
    }
  }

  async getChannelIds(): Promise<number[]> {
    await this.ensureAuthenticated();

    try {
      const response = await fetch(`${this.baseUrl}/channels/parser/ids`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired, try to login again
        this.token = null;
        await this.ensureAuthenticated();
        
        const retryResponse = await fetch(`${this.baseUrl}/channels/parser/ids`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!retryResponse.ok) {
          throw new Error(`Failed to get channel IDs: ${retryResponse.statusText}`);
        }

        const retryData = await retryResponse.json() as { success: boolean; data: number[] };
        return retryData.data || [];
      }

      if (!response.ok) {
        throw new Error(`Failed to get channel IDs: ${response.statusText}`);
      }

      const data = await response.json() as { success: boolean; data: number[] };
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching channel IDs:', error);
      throw error;
    }
  }

  async getAllChannels(): Promise<Channel[]> {
    await this.ensureAuthenticated();

    try {
      const response = await fetch(`${this.baseUrl}/channels`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired, try to login again
        this.token = null;
        await this.ensureAuthenticated();
        
        const retryResponse = await fetch(`${this.baseUrl}/channels`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!retryResponse.ok) {
          throw new Error(`Failed to get channels: ${retryResponse.statusText}`);
        }

        const retryData = await retryResponse.json() as { success: boolean; data: Channel[] };
        return retryData.data || [];
      }

      if (!response.ok) {
        throw new Error(`Failed to get channels: ${response.statusText}`);
      }

      const data = await response.json() as { success: boolean; data: Channel[] };
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching channels:', error);
      throw error;
    }
  }
} 