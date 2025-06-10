# Используем официальное Node LTS образ
FROM node:22-alpine AS base

# Создаём рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем только production-зависимости
RUN npm install --production

# Копируем исходный код
COPY . .

# Экспортируем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "index.js"] 