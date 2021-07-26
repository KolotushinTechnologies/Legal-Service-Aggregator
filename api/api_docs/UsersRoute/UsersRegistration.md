### Запрос - Регистрация

---

### Описание запроса - Регистрация

Возвращает объект пользователя после отправки email

### Роут (URL) (localhost:5000):

##### http://localhost:5000/api/users/registration или /api/users/registration

### Метод

`POST`

### Параметры URL

Нет

### Данные

В теле запроса передается email пользователя, который проходит проверку среди всех зарегистрированных пользователей, если такой email уже есть, то возвращает код 400 Bad Request, если нет, то возвращает объект нового пользователя с кодом статуса 200 OK и отправляет сгенерированный пароль на указанную в теле запроса почту

- **Данные тела запроса**
  `{ email: test@gmail.com }`

- **Успешный ответ (200 OK)**

```js
{
    "paymentMethods": {
        "yandex": false,
        "visaMastercard": false,
        "bitcoin": false,
        "qiwi": false
    },
    "services": [],
    "onlineUser": false,
    "status": "",
    "city": "Москва",
    "rating": 0,
    "guarantorService": false,
    "deposit": 0,
    "balance": 0,
    "role": 0,
    "_id": "6023f2bf1072034294e233f0",
    "email": "test@gmail.com",
    "password": "kU47X2Sb",
    "username": "username1",
    "createdAt": "2021-02-10T14:50:39.088Z",
    "updatedAt": "2021-02-10T14:50:39.088Z",
    "__v": 0
}
```

- **Ответ ошибки (400 Bad Request)**

```js
{
    "status": "error",
    "message": "Email already exists!"
}
```

- **Ответ ошибки при не соблюдении валидации email (400 Bad Request)**

```js
{
    "email": "Email is invalid"
}
```
