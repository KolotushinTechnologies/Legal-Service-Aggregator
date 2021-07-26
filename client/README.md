#### Авторизация

###### http://localhost:5000/api/users/registration - Регистрация 👍

POST – Public
Параметры: –
Тело: email
Ответ:

```js
{
    "onlineUser": false,
    "paymentMethods": [],
    "guarantorService": false,
    "balance": 0,
    "role": 0,
    "_id": "5f83dc30ff469f47b4d9a2bd",
    "email": "superuser@mail.com",
    "password": "b3982f74g2",
    "username": "username1",
    "__v": 0
}
```

###### http://localhost:5000/api/users/login - Автооризация 👍

POST – Public
Параметры: –
Тело: email, password
Ответ:

```js
{
    "success": true,
    "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmODNkYzMwZmY0NjlmNDdiNGQ5YTJiZCIsImlhdCI6MTYwMjQ3NzMzMCwiZXhwIjoxNjAyNDgwOTMwfQ.SKSIjq8j8G9MTjoubhjG1w1Gk2vwMWdcI4haQ8kRPcI",
    "role": 0,
    "user": {
        "onlineUser": false,
        "paymentMethods": [],
        "guarantorService": false,
        "balance": 0,
        "role": 0,
        "_id": "5f83dc30ff469f47b4d9a2bd",
        "email": "superuser@mail.com",
        "password": "b3982f74g2",
        "username": "username1",
        "__v": 0
    }
}
```

###### http://localhost:5000/api/users/reset-password - Сброс 👍

POST – Public
Параметры: –
Тело: req.body.email
Ответ:

```js
{
    "onlineUser": false,
    "paymentMethods": [],
    "guarantorService": false,
    "balance": 0,
    "role": 0,
    "_id": "5f83dc30ff469f47b4d9a2bd",
    "email": "superuser@mail.com",
    "password": "g9h3undefined53df3",
    "username": "username1",
    "__v": 0
}
```

###### http://localhost:5000/api/users/delete-account - Удалить аккаунт 👍

DELETE – Private
Параметры: jwt
Тело:
Ответ:

```js

```

#### Профиль

###### http://localhost:5000/api/users/profile - Получить данные своего профиля 👍

GET – Private
Параметры: jwt
Тело: –
Ответ:

```js
{
    "onlineUser": false,
    "paymentMethods": [],
    "guarantorService": false,
    "balance": 0,
    "role": 0,
    "_id": "5f83e0081f2002310013fd2f",
    "email": "superuser2@mail.com",
    "password": "26kcundefinedeg9h8",
    "username": "username1",
    "__v": 0
}
```

###### http://localhost:5000/api/users/profile/settings - Изменить свои данные 👍

PUT – Private
Параметры: jwt
Тело: email, password?, username?, city?, guarantorService?
Ответ:

```js

```

###### http://localhost:5000/api/users/profile/:\_id - Получить данные другого профиля 👍

GET – Public
Параметры: –
Тело: \_id - user id from database
Ответ:

```js
{
    "onlineUser": false,
    "paymentMethods": [],
    "guarantorService": false,
    "balance": 0,
    "role": 1,
    "_id": "5f81d3b223559a0364dc7276",
    "email": "network2020oop@mail.ru",
    "password": "6ek7undefinede1f1d",
    "username": "username1",
    "__v": 0
}
```

#### Пользователи

###### http://localhost:5000/api/users/profiles - Получить всех пользователей 👍

GET – Public
Параметры: –
Тело: –
Ответ:

```js

```

#### Сервисы

###### http://localhost:5000/api/services - Создать сервис

POST – Private
Параметры: jwt
Тело:

```js
req.body.title,
textContent: req.body.textContent,
categories: req.body.categories.split(","),
user: req.user._id,
```

Ответ: –

###### http://localhost:5000/api/services/user - Получить сервис(ы)? пользователя

GET – Private
Параметры: jwt
Тело: –
Ответ:

```js

```

###### http://localhost:5000/api/services/:\_id - Получить сервис по ID

GET – Private
Параметры: jwt
Тело: req.params.\_id
Ответ:

```js

```

###### http://localhost:5000/api/services/:\_id - Изменить сервис по ID

PUT – Private
Параметры: jwt
Тело: req.params.\_id
Ответ:

```js

```

###### http://localhost:5000/api/services/:\_id - Удалить сервис по ID

DELETE – Private  
Параметры: jwt  
Тело: req.params.\_id  
Ответ:

```js

```

#### Города

###### http://localhost:5000/api/city - Создать город

POST – Private  
Параметры: jwt  
Тело: req.body.name  
Ответ:

```js

```

###### http://localhost:5000/api/city - Получить все города

GET – Public  
Параметры: –  
Тело: –  
Ответ:

```js

```

###### http://localhost:5000/api/city/:\_id - Получить город по ID

GET – Public
Параметры: –
Тело: req.params.\_id
Ответ:

```js

```

###### http://localhost:5000/api/city/:\_id - Изменить город по ID

PUT – Private  
Параметры: jwt  
Тело: req.params.\_id  
Ответ:

```js

```

###### http://localhost:5000/api/city/:\_id - Удалить город по ID

DELETE – Private  
Параметры: jwt  
Тело: req.params.\_id  
Ответ:

```js

```
