# Posts API Documentation

## Endpoints

### GET /posts
Получение списка постов с поддержкой пагинации, фильтрации и сортировки.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Номер страницы (минимум 1) |
| limit | integer | No | 10 | Количество элементов на странице (1-100) |
| source_channel | string | No | - | Фильтр по каналу источнику |
| text | string | No | - | Поиск по тексту поста |
| is_unique | boolean | No | - | Фильтр по уникальности поста |
| date_from | string (ISO 8601) | No | - | Фильтр по дате начала |
| date_to | string (ISO 8601) | No | - | Фильтр по дате окончания |
| sort_field | string | No | created_at | Поле для сортировки (timestamp, created_at, source_channel) |
| sort_order | string | No | desc | Порядок сортировки (asc, desc) |

**Examples:**

```bash
# Базовый запрос
GET /posts

# С пагинацией
GET /posts?page=2&limit=20

# С фильтрацией по каналу
GET /posts?source_channel=my_channel

# С поиском по тексту
GET /posts?text=важный%20пост

# С фильтрацией по уникальности
GET /posts?is_unique=true

# С фильтрацией по дате
GET /posts?date_from=2024-01-01T00:00:00.000Z&date_to=2024-12-31T23:59:59.999Z

# С сортировкой
GET /posts?sort_field=timestamp&sort_order=asc

# Комбинированный запрос
GET /posts?page=1&limit=15&source_channel=news&text=обновление&is_unique=true&sort_field=created_at&sort_order=desc
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "source_channel": "news_channel",
      "text": "Текст поста",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "url": "https://t.me/channel/123",
      "media": [
        {
          "type": "photo",
          "file_path": "/path/to/file.jpg"
        }
      ],
      "is_unique": true,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET /posts/search
Альтернативный endpoint для поиска постов (идентичен /posts с параметрами).

### GET /post/:id
Получение конкретного поста по ID.

**Parameters:**
- `id` (string, required) - ID поста

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "source_channel": "news_channel",
    "text": "Текст поста",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "url": "https://t.me/channel/123",
    "media": [],
    "is_unique": true,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "querystring/page must be >= 1"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Post not found"
}
```

## Особенности

1. **Пагинация**: Максимальный размер страницы ограничен 100 элементами
2. **Фильтрация**: Все текстовые фильтры используют регистронезависимый поиск
3. **Сортировка**: По умолчанию сортировка по дате создания (created_at) в убывающем порядке
4. **Обратная совместимость**: Endpoint /posts без параметров возвращает все посты как раньше 