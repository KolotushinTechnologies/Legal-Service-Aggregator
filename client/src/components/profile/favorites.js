import Axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Search from "./search";
import FavoriteItem from "./favoriteItem";
import "./_index.scss";
import { Link } from "react-router-dom";
import styled from "styled-components";

const NotFavorite = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  font-size: 30px;
`;
const Favorites = () => {
  const [favoriteData, setFavoriteData] = useState([]);
  const [countFav, setCountFav] = useState();
  const [filtered, setFavorite] = useState();
  const [load, setLoad] = useState(true);

  const searchText = useRef("");

  useEffect(() => {
    getFavorites();
  }, []);

  const getFavorites = async () => {
    const res = await Axios({
      method: "GET",
      url: "http://localhost:5000/api/favorites",
      headers: {
        Authorization: localStorage.token,
      },
    });
    setFavoriteData(res.data);
    setCountFav(res.data.filter((e) => e.favoriteUser).length);
    console.log(res.data);
    setLoad(false);
  };

  const searchFavorites = () => {
    setFavorite(
      favoriteData.filter(
        (e) =>
          e.favoriteUser.username
            .toLowerCase()
            .includes(searchText.current.value.toLowerCase().trim()) ||
          e.additionalText
            .toLowerCase()
            .includes(searchText.current.value.toLowerCase().trim()) ||
          chechIncludes(searchText.current.value, e.favoriteUser.services)
      )
    );
  }

  const chechIncludes = (item, services) => {
    for (let ser of services) {
      if (Array.isArray(ser.categories)) {
        for (let ctg of ser.categories) {
          if (ctg.toLowerCase().trim().includes(item.toLowerCase().trim())) return true
        }
      }
    }
    return false
  }

  return (
    <div className="profile profile_favorites">
      <p className="favorites__title">
        <i className="favorites__star far fa-star"></i>
        Избранное {countFav && `-  ${countFav}`}
      </p>
      <Search searchFavorites={searchFavorites} searchText={searchText} />
      <div className="favorites__list">
        {!filtered ? (
          favoriteData[0] ? (
            favoriteData.map((e) => {
              return (
                e.favoriteUser && (
                    <FavoriteItem
                      key={e._id}
                      user={e.favoriteUser.username}
                      avatar={e.favoriteUser.avatar}
                      deposit={e.favoriteUser.deposit}
                      rating={e.favoriteUser.rating}
                      guarantorService={e.favoriteUser.guarantorService}
                      id={e._id}
                      userId={e.favoriteUser._id}
                      additionalText={e.additionalText}
                      getFavorites={getFavorites}
                      setCountFav={setCountFav}
                      oldCount={countFav}
                      services={e.favoriteUser.services}
                    />
                )
              );
            })
          ) : load ? (
            "Загрузка..."
          ) : (
            <NotFavorite>Вы еще никого не добавили в избранное</NotFavorite>
          )
        ) : filtered[0] ? (
          filtered.map((e) => {
            return (
              e.favoriteUser && (
                <Link
                  key={e._id}
                  to={`/user/${e.favoriteUser._id}`}
                  style={{ textDecoration: "none" }}
                >
                  <FavoriteItem
                    key={e._id}
                    user={e.favoriteUser.username}
                    deposit={e.favoriteUser.deposit}
                    rating={e.favoriteUser.rating}
                    guarantorService={e.favoriteUser.guarantorService}
                    id={e._id}
                    additionalText={e.additionalText}
                    setCountFav={setCountFav}
                    oldCount={countFav}
                    services={e.favoriteUser.services}
                  />
                </Link>
              )
            );
          })
        ) : (
          "Поиск не дал результатов"
        )}
      </div>
    </div>
  );
};

export default Favorites;
