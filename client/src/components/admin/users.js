import React, { useEffect, useState } from "react";
import { Filter, UserItem } from "./_index";
import axios from "axios";
import qs from "qs";
import "./_index.scss";
import Alert from "../alerts/Alert";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [alert, setAlert] = useState({
    title: "",
    description: "",
    isActive: false,
  });

  const onChangeAlert = (active) => {
    setAlert({
      ...alert,
      isActive: active,
    });
  };

  useEffect(() => {
    getUsers();
  }, []);

  const onSetFilteredUsers = (e) => {
    let new_list = [...users];
    let { value } = e.target;
    new_list = new_list.filter(
      item => item.email?.includes(value) || item.username?.includes(value)
    );
    setFilteredUsers(new_list);
  };

  const getUsers = async () => {
    axios({
      method: "GET",
      url: "http://localhost:5000/api/admin-panel/all-users",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((data) => {
        if (data.status === 200) {
          setFilteredUsers(data.data);
          setUsers(data.data);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const updateUser = (data) => {
    const changeUser = async () => {
      await axios({
        url: `http://localhost:5000/api/admin-panel/change-user/${data._id}`,
        method: "PUT",
        headers: {
          Authorization: localStorage.token,
        },
        data: qs.stringify({
          ...data
        })
      })
        .then((res) => {
          setAlert({
            title: "Данные изменились",
            description: "Описание",
            isActive: true,
          });
          getUsers();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changeUser();
  };

  const deleteUser = async (id) => {
    await axios({
      url: `http://localhost:5000/api/admin-panel/delete-user/${id}`,
      method: "DELETE",
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description: "Пользователь удален",
          isActive: true,
        });
        getUsers();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description: "Ошибка удаления пользователя",
          isActive: true,
        });
      });
  };

  return (
    <React.Fragment>
      <Filter users={users} filterMethod={onSetFilteredUsers} />
      <div className="table">
        <table className="table__content">
          <thead>
            <tr>
              <th>Никнейм</th>
              <th>Email</th>
              <th>Регистрация</th>
              <th>Услуги</th>
              <th>Баланс</th>
              <th>Город</th>
              <th>Рейтинг</th>
              <th>Гарант сервис</th>
              <th>Депозит</th>
              <th>Роль</th>
              <th>Пароль</th>
              <th>Страница</th>
              <th>Обновить</th>
              <th>Удалить</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user, indx) => {
              const {
                _id,
                email,
                username,
                createdAt,
                services,
                balance,
                deposit,
                onlineUser,
                city,
                rating,
                guarantorService,
                roles,
                password
              } = user
              return (
                <UserItem
                  updateUser={updateUser}
                  deleteUser={deleteUser}
                  key={_id}
                  _id={_id}
                  email={email}
                  username={username}
                  createdAt={createdAt}
                  services={services}
                  balance={balance}
                  deposit={deposit}
                  onlineUser={onlineUser}
                  city={city}
                  rating={rating}
                  guarantorService={guarantorService}
                  roles={roles}
                  password={password}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      <Alert
        onChangeAlert={onChangeAlert}
        title={alert.title}
        description={alert.description}
        isActive={alert.isActive}
      />
    </React.Fragment>
  );
};

export default Users;

Users.defaultProps = {
  users: [],
};
