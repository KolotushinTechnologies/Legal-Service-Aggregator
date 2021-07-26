### Запрос - Получение данных о своем профиле

---

### Описание запроса - Получение данных о своем профиле

Возвращает объект своего профиля путем проверки Bearer токена в Local Storage

### Роут (URL) (localhost:5000):

##### http://localhost:5000/api/users/profile или /api/users/profile

### Метод

`GET`

### Параметры URL

Нет

### Данные

По умолчанию передается идентификатор пользователя чей Bearer токен находится в Local Storage, если пользователь авторизован, то запрос возвращает объект пользователя со всеми его данными с кодом 200 ok, если Bearer токен не подходит или у него истек срок работоспосбности, то возвращает Unauthorized с кодом 401 Unauthorized

- **Данные тела запроса**

`Данные о пользователе берутся по умолчанию путем проверки Bearer токена в Local Storage`

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
    "_id": "60251cc9fe3b1f2d6083c2a3",
    "email": "test@gmail.ru",
    "password": "9GXkiG8U",
    "username": "username1",
    "createdAt": "2021-02-11T12:02:17.487Z",
    "updatedAt": "2021-02-11T12:02:17.487Z",
    "__v": 0
}
```

- **Ответ ошибки если пользователь не существует (401 Unauthorized)**

```js
Unauthorized;
```
