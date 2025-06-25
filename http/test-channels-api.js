// Тестовый скрипт для проверки API каналов
// Запуск: node test-channels-api.js

const API_BASE_URL = 'http://localhost:3001';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'password123';

let authToken = null;

async function login() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
      }),
    });

    const data = await response.json();
    if (data.success) {
      authToken = data.data.token;
      console.log('✅ Авторизация успешна');
      return true;
    } else {
      console.error('❌ Ошибка авторизации:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при авторизации:', error.message);
    return false;
  }
}

async function createChannel(username, channelId) {
  try {
    const response = await fetch(`${API_BASE_URL}/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        channel_id: channelId,
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Канал создан:', data.data);
      return data.data;
    } else {
      console.error('❌ Ошибка создания канала:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка при создании канала:', error.message);
    return null;
  }
}

async function getAllChannels() {
  try {
    const response = await fetch(`${API_BASE_URL}/channels`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Получены каналы:');
      data.data.forEach(channel => {
        console.log(`  - ${channel.username} (ID: ${channel.channel_id})`);
      });
      return data.data;
    } else {
      console.error('❌ Ошибка получения каналов:', data);
      return [];
    }
  } catch (error) {
    console.error('❌ Ошибка при получении каналов:', error.message);
    return [];
  }
}

async function getChannelIdsForParser() {
  try {
    const response = await fetch(`${API_BASE_URL}/channels/parser/ids`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ ID каналов для парсера:', data.data);
      return data.data;
    } else {
      console.error('❌ Ошибка получения ID каналов:', data);
      return [];
    }
  } catch (error) {
    console.error('❌ Ошибка при получении ID каналов:', error.message);
    return [];
  }
}

async function deleteChannel(channelId) {
  try {
    const response = await fetch(`${API_BASE_URL}/channels/${channelId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Канал удален');
      return true;
    } else {
      console.error('❌ Ошибка удаления канала:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при удалении канала:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Тестирование API каналов');
  console.log('===========================');

  // 1. Авторизация
  console.log('\n1. Авторизация...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Не удалось авторизоваться. Проверьте что бэкенд запущен и пользователь существует.');
    return;
  }

  // 2. Получение текущих каналов
  console.log('\n2. Получение текущих каналов...');
  await getAllChannels();

  // 3. Создание тестового канала
  console.log('\n3. Создание тестового канала...');
  const testChannel = await createChannel('@test_channel', 1234567890);

  // 4. Получение ID каналов для парсера
  console.log('\n4. Получение ID каналов для парсера...');
  await getChannelIdsForParser();

  // 5. Получение обновленного списка каналов
  console.log('\n5. Получение обновленного списка каналов...');
  const channels = await getAllChannels();

  // 6. Удаление тестового канала
  if (testChannel) {
    console.log('\n6. Удаление тестового канала...');
    await deleteChannel(testChannel.id);
  }

  // 7. Финальная проверка
  console.log('\n7. Финальная проверка каналов...');
  await getAllChannels();

  console.log('\n✅ Тестирование завершено!');
}

// Запуск тестов
main().catch(console.error); 