import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';

const apiId = 27372023;
const apiHash = 'af2556b37ca189e5ca1dee74ad61e390';

const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
  connectionRetries: 5,
});

(async () => {
  await client.start({
    phoneNumber: async () => await input.text('Введите номер телефона: '),
    password: async () => await input.text('Введите пароль: '),
    phoneCode: async () => await input.text('Введите код из Telegram: '),
    onError: (err) => console.error('Ошибка:', err),
  });

  console.log('Новая сессия:', client.session.save());
  await client.disconnect();
})(); 