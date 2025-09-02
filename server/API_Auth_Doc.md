### Authentication Endpoints

#### POST /auth/register
Регистрация нового пользователя.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "male"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-15",
    "gender": "male",
    "role": "client",
    "is_verified": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /auth/login
Вход в систему.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client"
  }
}
```

#### POST /auth/logout
Выход из системы.

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

#### POST /auth/refresh
Обновление access токена.

**Response (200):**
```json
{
  "message": "Token refreshed successfully"
}
```

#### GET /auth/google
Начало OAuth авторизации через Google.
Перенаправляет на Google OAuth.

#### GET /auth/google/callback
Callback для Google OAuth.
Перенаправляет на фронтенд после успешной авторизации.

#### GET /auth/me
Получение информации о текущем пользователе.

**Headers:**
```
Cookie: accessToken=your_token_here
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "is_verified": true
  }
}
```

#### PUT /auth/profile
Обновление профиля пользователя.

**Body:**
```json
{
  "name": "John Smith",
  "phone": "+1987654321",
  "dateOfBirth": "1990-01-15",
  "gender": "male"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1987654321",
    "role": "client"
  }
}
```

#### GET /auth/sessions
Получение списка активных сессий.

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "device": "Chrome on Windows 10",
      "ip": "192.168.1.1",
      "lastActive": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-02-14T10:30:00Z"
    }
  ]
}
```

#### DELETE /auth/sessions/:id
Удаление конкретной сессии.

**Response (200):**
```json
{
  "message": "Session deleted successfully"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

#### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "User with this email already exists"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Security Features

1. **Password Hashing**: Используется bcrypt с настраиваемым количеством раундов
2. **JWT Tokens**: Отдельные секреты для access и refresh токенов
3. **Secure Cookies**: httpOnly, secure (в продакшене), SameSite
4. **Rate Limiting**: Защита от брute force атак
5. **Input Validation**: Валидация всех входных данных
6. **Session Management**: Ограничение количества активных сессий
7. **Token Rotation**: Опциональная ротация refresh токенов

## Environment Variables

Все чувствительные данные хранятся в переменных окружения:
- Секреты JWT
- Данные подключения к БД
- Google OAuth credentials
- Настройки cookies и безопасности

## Database Schema

### users table
- Хранение пользователей с поддержкой Google OAuth
- Хеширование паролей
- Роли и права доступа

### refresh_tokens table
- Хранение refresh токенов с метаданными
- Отслеживание устройств и сессий
- Автоматическая очистка истёкших токенов

## Deployment

Проект готов для деплоя в production со всеми необходимыми настройками безопасности и производительности.
*/