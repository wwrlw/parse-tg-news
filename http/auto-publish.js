const { MongoClient } = require('mongodb');

// Конфигурация
const config = {
  mongoUri: 'mongodb://admin:Xdas33JJdasnnjdA22KKsaaA@mongo:27017/parse-news?authSource=admin',
  botToken: '8175655426:AAEw_vSc04q4LJ44Jg4WqX0rmLITy_R-hNE',
  channelId: '-1002897118156'
};

// Подключение к MongoDB
async function connectToMongo() {
  const client = new MongoClient(config.mongoUri);
  await client.connect();
  return client.db('parse-news');
}

// Публикация в Telegram
async function publishToTelegram(post) {
  const message = formatPostMessage(post);
  
  const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: config.channelId,
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
  console.log('✅ Пост опубликован:', result);
  return true;
}

// Форматирование сообщения
function formatPostMessage(post) {
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

// Основная функция
async function autoPublish() {
  try {
    console.log('🚀 Запуск автоматической публикации...');
    
    const db = await connectToMongo();
    const postsCollection = db.collection('posts');
    
    // Получаем неопубликованные посты (старше 1 минуты)
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const unpublishedPosts = await postsCollection.find({
      created_at: { $gte: oneMinuteAgo },
      published: { $ne: true }
    }).toArray();
    
    console.log(`📊 Найдено ${unpublishedPosts.length} новых постов`);
    
    for (const post of unpublishedPosts) {
      try {
        const published = await publishToTelegram(post);
        
        if (published) {
          // Отмечаем пост как опубликованный
          await postsCollection.updateOne(
            { _id: post._id },
            { $set: { published: true, published_at: new Date() } }
          );
          console.log(`✅ Пост ${post._id} опубликован и отмечен`);
        }
      } catch (error) {
        console.error(`❌ Ошибка публикации поста ${post._id}:`, error);
      }
    }
    
    console.log('✅ Автоматическая публикация завершена');
    
  } catch (error) {
    console.error('❌ Ошибка автоматической публикации:', error);
  }
}

// Запуск
autoPublish(); 