import dotenv from 'dotenv';
import { TelegramService } from './services/telegramService.js';
import { ApiService } from './services/apiService.js';

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

// Конфигурация API
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
const apiUsername = process.env.API_USERNAME;
const apiPassword = process.env.API_PASSWORD;

if (!apiUsername || !apiPassword) {
  console.error('❌ API_USERNAME и API_PASSWORD должны быть установлены в переменных окружения');
  process.exit(1);
}

const config = {
  apiId: Number(process.env.API_ID),
  apiHash: process.env.API_HASH!,
  sessionString: process.env.STRING_SESSION!,

  mongoUri: process.env.MONGO_URI || mongoUri,
  mongoDbName,
  mediaPath: process.env.MEDIA_PATH || './media'
};

console.log('🔗 API URL:', apiBaseUrl);
console.log('📁 Media path:', config.mediaPath);
console.log('🗄️ MongoDB:', config.mongoUri);

// Создаем API сервис для получения каналов
const apiService = new ApiService(apiBaseUrl, apiUsername, apiPassword);

let telegramService: TelegramService;

// Функция для получения каналов и запуска парсера
async function initializeParser() {
  try {
    console.log('🔍 Получаем каналы из API...');
    
    // Получаем ID каналов из API
    const channelIds = await apiService.getChannelIds();
    
    if (channelIds.length === 0) {
      console.warn('⚠️ Не найдено каналов для парсинга. Добавьте каналы через веб-интерфейс.');
      // Ждем 30 секунд и пробуем снова
      setTimeout(initializeParser, 30000);
      return;
    }
    
    console.log('🎯 Target channel IDs:', channelIds);
    
    // Получаем полную информацию о каналах для логирования
    const channels = await apiService.getAllChannels();
    console.log('📋 Channels info:');
    channels.forEach(channel => {
      console.log(`  - ${channel.username} (ID: ${channel.channel_id})`);
    });

    // Создаем TelegramService с полученными каналами
    telegramService = new TelegramService({
      ...config,
      targetChannelIds: channelIds
    });

    await telegramService.start();
    
  } catch (error) {
    console.error('❌ Ошибка инициализации парсера:', error);
    console.log('🔄 Повторная попытка через 30 секунд...');
    setTimeout(initializeParser, 30000);
  }
}

// Функция для периодического обновления списка каналов
async function updateChannels() {
  try {
    console.log('🔄 Обновляем список каналов...');
    const channelIds = await apiService.getChannelIds();
    
    if (telegramService) {
      await telegramService.updateTargetChannels(channelIds);
    }
    
    console.log('✅ Список каналов обновлен:', channelIds);
  } catch (error) {
    console.error('❌ Ошибка обновления каналов:', error);
  }
}

// Обработка сигналов для graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Получен сигнал SIGINT, останавливаем сервис...');
  if (telegramService) {
    await telegramService.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Получен сигнал SIGTERM, останавливаем сервис...');
  if (telegramService) {
    await telegramService.stop();
  }
  process.exit(0);
});

// Запуск сервиса
(async () => {
  try {
    await initializeParser();
    
    // Обновляем список каналов каждые 5 минут
    setInterval(updateChannels, 5 * 60 * 1000);
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
})(); 