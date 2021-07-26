### Запрос - Вход

---

### Описание запроса - Вход

Возвращает объект уже зарегистрированного пользовтаеля и получившего вход в систему после отправки email и password

### Роут (URL) (localhost:5000):

##### http://localhost:5000/api/users/login или /api/users/login

### Метод

`POST`

### Параметры URL

Нет

### Данные

В теле запроса передается email и password пользовтаеля, которые он получил после регистрации пользователя. Если не обращать внимание на JSON, то сгенированный пароль также приходит на email пользователя. Запрос проводит проверку на правильность введенных данных email и password, если email или password неверны, то возвращает код 400 Bad Request, если все верно, то возвращает объект уже существующего пользователя с кодом статуса 200 OK, который совпал по всем введенным данным в теле запроса

- **Данные тела запроса**

```js
{
  "email": "test@gmail.com",
  "password": "kU47X2Sb",
}
```

- **Успешный ответ (200 OK)**

```js
{
    "success": true,
    "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwMjNmMmJmMTA3MjAzNDI5NGUyMzNmMCIsImlhdCI6MTYxMjk3MDgyNSwiZXhwIjoxNjEyOTc0NDI1fQ.M4ujdv0IICPLwu84LJzo6UuwIRIDSFIJUNLm-R2VDu0",
    "role": 0,
    "user": {
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
}
```

- **Ответ ошибки (400 Bad Request)**

```js
{
    "status": "error",
    "message": "Email or password entered incorrectly"
}
```

- **Ответ ошибки если пользователь не существует (404 Not Found)**

```js
{
    "status": "error",
    "message": "User not found!"
}
```

- **Ответ ошибки если поля password не хватает (400 Bad Request)**

```js
{
    "password": "Password field is required!"
}
```

- **Ответ ошибки если поля email не хватает (400 Bad Request)**

```js
{
    "email": "Email field is required!"
}
```
