import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Filter } from "./_index";
import Alert from "../alerts/Alert";
import FavoritesItem from "./FavoritesItem";
import "./_index.scss";

function FavoritesAdmin() {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
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

  const onSetFilteredFavorites = (e) => {
    let newList = [...favorites];
    let { value } = e.target;
    newList = newList.filter(
      (item) =>
        (item.whoSaved && item.whoSaved.email.includes(value)) ||
        (item.favoriteUser && item.favoriteUser.email.includes(value))
    );
    setFilteredFavorites(newList);
  };

  useEffect(() => {
    getFavorites();
  }, []);

  const getFavorites = async () => {
    Axios({
      method: "GET",
      url: "http://localhost:5000/api/admin-panel/all-favorites",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((data) => {
        setFavorites(data.data);
        setFilteredFavorites(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const updateFavorites = async (data) => {
    const changeFavorites = async () => {
      await Axios({
        method: "PUT",
        url: `http://localhost:5000/api/admin-panel/change-favorite/${data._id}`,
        headers: {
          Authorization: localStorage.token,
        },
        data: {
          ...data,
        },
      })
        .then((res) => {
          setAlert({
            title: "Успешно",
            description: "Данные изменились",
            isActive: true,
          });
          getFavorites();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changeFavorites();
  };

  const deleteFavorites = async (id) => {
    await Axios({
      method: "DELETE",
      url: `http://localhost:5000/api/admin-panel/delete-favorite/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description: "Успешное удаление избранного",
          isActive: true,
        });
        getFavorites();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description: "Ошибка удаления избранного",
          isActive: true,
        });
      });
  };

  return (
    <>
      <Filter favorites={favorites} filterMethod={onSetFilteredFavorites} />
      <div className="table">
        <table className="table__content">
          <thead>
            <tr>
              <th>Кто сохранил</th>
              <th>Кого сохранили</th>
              <th>Комментарий к сохранению</th>
              <th>Депозит сохранившего пользователя</th>
              <th>Депозит сохраненного пользователя</th>
              <th>Дата сохранения</th>
              <th>Идентификатор избранного</th>
            </tr>
          </thead>
          <tbody>
            {filteredFavorites?.map((item, index) => {
              return (
                <FavoritesItem
                  key={item._id}
                  updateFavorite={updateFavorites}
                  deleteFavorite={deleteFavorites}
                  whoSaved={item.whoSaved && item.whoSaved.email}
                  favoriteUser={item.favoriteUser && item.favoriteUser.email}
                  additionalText={item.additionalText}
                  depositWhoSavedUser={item.whoSaved && item.whoSaved.deposit}
                  deppositFavoriteUser={item.favoriteUser && item.favoriteUser.deposit}
                  _id={item._id}
                  date={item.createdAt}
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
    </>
  );
}

export default FavoritesAdmin;
