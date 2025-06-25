export class PublishService {
  private botToken: string;
  private channelId: string;
  private baseUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || '';
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async publishPost(post: any): Promise<boolean> {
    try {
      const message = this.formatPostMessage(post);
      
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.channelId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Telegram API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('✅ Пост автоматически опубликован в канал:', result);
      return true;
    } catch (error) {
      console.error('❌ Ошибка автоматической публикации:', error);
      return false;
    }
  }

  private formatPostMessage(post: any): string {
    const date = new Date(post.timestamp || post.created_at).toLocaleString('ru-RU');
    
    let message = `<b>📰 Новость</b>\n\n`;
    message += `${post.text}\n\n`;
    message += `📅 Дата: ${date}\n`;
    message += `📺 Источник: ${post.source_channel}\n`;
    
    if (post.url) {
      message += `🔗 Ссылка: ${post.url}\n`;
    }

    if (post.media && post.media.length > 0) {
      message += `📎 Медиа файлов: ${post.media.length}\n`;
    }

    return message;
  }
} 