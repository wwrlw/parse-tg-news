import dotenv from 'dotenv';
import { TelegramService } from './services/telegramService.js';

dotenv.config();

// Формируем URI для MongoDB с учетом аутентификации
const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || '27019';
const mongoDbName = process.env.MONGO_DB_NAME || 'telegram_parser';

let mongoUri = `mongodb://${mongoHost}:${mongoPort}/${mongoDbName}`;
if (mongoUsername && mongoPassword) {
  mongoUri = `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDbName}?authSource=admin`;
}

const config = {
  apiId: Number(process.env.API_ID),
  apiHash: process.env.API_HASH!,
  sessionString: process.env.STRING_SESSION!,
  targetChannelIds: process.env.TARGET_CHANNELS?.split(',').map((id: string) => Number(id.trim())) || [],
  mongoUri: process.env.MONGO_URI || mongoUri,
  mongoDbName,
  mediaPath: process.env.MEDIA_PATH || './media'
};

console.log('🎯 Target channel IDs:', config.targetChannelIds);
console.log('📁 Media path:', config.mediaPath);
console.log('🗄️ MongoDB:', config.mongoUri);

const telegramService = new TelegramService(config);

// Обработка сигналов для graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Получен сигнал SIGINT, останавливаем сервис...');
  await telegramService.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Получен сигнал SIGTERM, останавливаем сервис...');
  await telegramService.stop();
  process.exit(0);
});

// Запуск сервиса
(async () => {
  try {
    await telegramService.start();
    
    // Если нужно получить информацию о канале, раскомментируйте:
    // await telegramService.getChannelInfo('sfhdgojuhwqtrge');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
})(); 