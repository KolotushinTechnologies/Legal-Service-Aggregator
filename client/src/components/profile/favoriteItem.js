import { reduce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import Popover from '@material-ui/core/Popover';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Axios from 'axios';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Background = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  z-index: 2;
`;
const Modal = styled.div`
  z-index: 3;
  position: fixed;
  top: 10%;
  right: 50%;
  transform: translate(50%, 0);
  width: 30vw;
  height: 370px;
  max-width: 900px;
  height: auto;
  border: 1px solid #c0c0c0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 55px 45px;
  overflow-y: auto;
  color: #333 !important;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    width: 85vw;
    height: 82vh;
  }

  .title {
    justify-content: space-between;
    font-size: 20px;
  }
  .message {
    font-size: 16px;
    text-align: center;
    margin-top: 70px;
  }
  .modalTitle {
    font-size: 24px;
    padding-top: 20px;
  }
  .cross {
    font-size: 20px;
    height: 28px;
    padding: 0 6px 8px 6px;
    cursor: pointer;
  }
  .btns {
    margin-top: 65px;
    justify-content: center;
    cursor: pointer;
    text-align: center;
    font-size: 17px;
  }
  .confirm {
    margin-left: 10px;
    border: 1px solid #c0c0c0;
    padding: 13px 32px;
    border-radius: 4px;
  }
  .close {
    border: none;
    background-color: #fc171e;
    color: #fff;
    padding: 13px 32px;
    border-radius: 4px;
  }
`;
const Row = styled.div`
  display: flex;
`;
const AvatarUploaded = styled.img`
  background-color: #e1e1e1;
  object-fit: cover;
  height: 60px;
  width: 60px;
  border-radius: 50%;
  margin-right: 80px;
  margin-bottom: 20px;
  font-size: 95px;
  color: #fff;
  text-align: center;
  line-height: 145px;
`;

const FavoriteItem = ({
  user,
  avatar,
  deposit,
  rating,
  guarantorService,
  id,
  additionalText,
  getFavorites,
  setCountFav,
  oldCount,
  services,
  userId,
}) => {
  const [open, setOpen] = useState();
  const [delItem, setDelItem] = useState(false);
  const [editWindow, setEditWindow] = useState(false);
  const [addText, setAddText] = useState();
  const [categoriesData, setCategoriesData] = useState({});
  const [delModal, setDelModal] = useState(false);
  const text = useRef('');
  const [errAvt, setErrAvt] = useState(false)
  //   const [favoriteData, setFavoriteData] = useState([]);
  //   const [countFav, setCountFav] = useState();
  //   const [load, setLoad] = useState(true);

  useEffect(() => {
    setAddText(additionalText);
    filterServices();
  }, [additionalText]);

  //   const getFavorites = async () => {
  //     const res = await Axios({
  //       method: 'GET',
  //       url: 'http://localhost:5000/api/favorites',
  //       headers: {
  //         Authorization: localStorage.token,
  //       },
  //     });
  //     setFavoriteData(res.data);
  //     setCountFav(res.data.filter((e) => e.favoriteUser).length);
  //     console.log(res.data);
  //     setLoad(false);
  //   };

  const deleteFavorite = async () => {
    // DELETE http://localhost:5000/api/favorites/:_id
    console.log(id);
    await Axios({
      method: 'DELETE',
      url: `http://localhost:5000/api/favorites/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    });
    setDelItem(true);
    setCountFav(oldCount - 1);
  };

  const renameFav = async () => {
    //http://localhost:5000/api/favorites/:_id
    const t = text.current.value;
    setEditWindow(false);
    await Axios({
      method: 'PUT',
      url: `http://localhost:5000/api/favorites/${id}`,
      data: {
        additionalText: t,
      },
      headers: {
        Authorization: localStorage.token,
      },
    });

    setAddText(t);

    getFavorites();
  };
  const filterServices = () => {
    let res = [];

    for (let item of services) {
      res = res.concat(item.categories);
    }
    res = [...new Set(res)];
    let str = '';
    for (let item of res) {
      str != '' ? (str += `, ${item}`) : (str = item);
    }
    return str;
  }

  return (
    !delItem && (
      <>
      <Link
        to={`/user/${userId}`}
        style={{ textDecoration: "none" }}
      >
        <div className='favorites__item'>
          <div className='favorites__profile'>
            <div className='favorites__profile-img-wrapper'>
              {/*<img src='' alt='' className='favorites__profile-img' />*/}
              {avatar && !errAvt ? (
                <AvatarUploaded src={avatar.url} onError={() => setErrAvt(true)} />
              ) : (
                user?.substr(0, 1)?.toUpperCase()
              )}
            </div>
            <p className='favorites__profile-name'>{user}</p>
          </div>

          <div className='favorites__tags'>
            <div className='favorites__tag'>
              <p className='favorites__tags-value'>
                <span className='favorites__tags-cat'>
                  {filterServices()
                    ? filterServices()
                    : 'Категории отсутствуют'}
                </span>
              </p>
            </div>
            <div className='favorites__deposit'>
              <span className='favorites__deposit-name'>Комментарий</span>
              <p style={{width: '100%', overflow: 'hidden', textOverflow: 'ellipsis'}} className='favorites__deposit-price'>
                {additionalText
                  ? additionalText
                  : 'Комментария к избранному нет'}
              </p>
            </div>
          </div>
          <div className='favorites__deposit'>
            <p className='favorites__deposit-name'>Депозит</p>
            <p className='favorites__deposit-price'>{`${deposit} руб.`}</p>
          </div>
          <div className='favorites__actions-wrapper'>
            <div className='favorites__info'>
              <div className='favorites__star'>
                {rating > 4 && <i className='favorites__star-icon fas fa-star' />}
                {rating <= 4 && rating >= 3 && (
                  <i className='favorites__star-icon fas fa-star-half-alt' />
                )}
                {rating < 3 && <i className='favorites__star-icon far fa-star' />}
                <span className='favorites__star-value'>{rating}</span>
              </div>
              <div className='favorites__shield'>
                {guarantorService && (
                  <i className='favorites__shield-icon fas fa-shield-alt' />
                )}
              </div>
            </div>
            <div
              onClick={e => {
                e.preventDefault()
                setOpen(e.currentTarget)
              }}
              style={{ padding: '4px 14px', cursor: 'pointer' }}>
              <i className='fas fa-ellipsis-v' style={{ fontSize: '28px' }}></i>
            </div>
          </div>
          <Menu
            onClick={(e) => e.preventDefault()}
            anchorEl={open}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={id}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={!!open}
            onClose={() => setOpen()}
          >
            <MenuItem
              onClick={() => {
                setEditWindow(true);
                setOpen();
              }}
            >
              Изменить
            </MenuItem>
            <MenuItem
              onClick={() => {
                setDelModal(true);
                setOpen();
              }}
            >
              Удалить
            </MenuItem>
          </Menu>
        </div>
        </Link>
        {editWindow && (
          <div>
            <Background
              onClick={(e) => {
                e.preventDefault();
                setEditWindow(false);
              }}
            />
            <Modal onClick={(e) => e.preventDefault()}>
              <Row className='title'>
                <div className='modalTitle'>Изменить описание</div>
                <div className='cross' onClick={() => setEditWindow(false)}>
                  <i className='fas fa-times' />
                </div>
              </Row>
              <form
                className='favorites__comment-form'
                onClick={(e) => e.preventDefault()}
              >
                <div className='favorites__comment-filed'>
                  <textarea
                    style={{height: '100px'}}
                    defaultValue={addText}
                    className='favorites__comment-area'
                    ref={text}
                  ></textarea>
                </div>

                <div className='favorites__comment-wrapper'>
                  <button className='default-btn mr-2' onClick={renameFav}>
                    Сохранить
                  </button>
                </div>
              </form>
            </Modal>
          </div>
        )}
        {delModal && (
          <div>
            <Background
              onClick={(e) => {
                e.preventDefault();
                setDelModal(false);
              }}
            />
            <Modal onClick={(e) => e.preventDefault()}>
              <Row className='title'>
                <div className='modalTitle'>Удалить из избранного</div>
                <div className='cross' onClick={() => setDelModal(false)}>
                  <i className='fas fa-times' />
                </div>
              </Row>
              <div className='favorites__comment-wrapper'>
                <button className='default-btn mr-2' onClick={deleteFavorite}>
                  Удалить
                </button>
              </div>
            </Modal>
          </div>
        )}
      </>
    )
  );
};

export default FavoriteItem;
