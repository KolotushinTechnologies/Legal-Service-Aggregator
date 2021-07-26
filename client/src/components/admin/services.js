import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Filter, ServiceItem } from './_index';
import axios from 'axios';
import './_index.scss';
import Alert from '../alerts/Alert';
import styled, { createGlobalStyle } from 'styled-components';

const Background = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  z-index: 2;
`

const Modal = styled.div`
  z-index: 3;
  position: fixed;
  top: 10%;
  right: 50%;
  overflow-y: auto;
  transform: translate(50%, 0);
  max-width: 95vw;
  max-height: 82vh;
  border: 1px solid #c0c0c0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 55px 45px;
  @media (max-width: ${p => p.theme.breakpoints.SMdesktop}) {
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
    overflow: auto;
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
`

const Row = styled.div`
  display: flex;
`

const GlobalStyle = createGlobalStyle`
  body {
    overflow: ${props => props.memo ? 'hidden ' : 'visible'};
  }
`

const TitleInput = styled.input`
  min-height: 35px;
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 5px;
  border: 1px solid #c0c0c0;
  margin-right: 10px;
`
const BodyTextArea = styled.textarea`
  min-height: 35px;

  padding-left: 10px;
  padding-right: 10px;
  border-radius: 5px;
  border: 1px solid #c0c0c0;
  width: 100%;
    height: 200px;


    resize: none;
    overflow: auto;
`

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [memo, setMemo] = useState(false)
  const [memoData, setMemoData] = useState()
  const [initRef, setInitRef] = useState(false)

  const [profile, setProfile] = useState()

  const [alert, setAlert] = useState({
    title: '',
    description: '',
    isActive: false,
  });

  const onChangeAlert = (active) => {
    setAlert({
      ...alert,
      isActive: active,
    });
  };

  const titleRef = useRef()
  const textRef = useRef()

  useEffect(() => {
    getServices();
    getMemo()
  }, []);

  useLayoutEffect(() => {
    if(titleRef.current && textRef.current && !initRef){
      titleRef.current.value = memoData?.nameMemo
      textRef.current.value = memoData?.textMemo
      setInitRef(true)
    }
  })

  const onSetFilteredServices = (e) => {
    let new_list = [...services];
    let { value } = e.target;
    new_list = new_list.filter((item) => item.user?.email?.includes(value));
    setFilteredServices(new_list);
  };

  const getServices = async () => {
    axios({
      method: 'GET',
      url: 'http://localhost:5000/api/admin-panel/all-services',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
    })
      .then((data) => {
        setServices(data.data);
        setFilteredServices(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const updateService = (data) => {
    const changeService = async () => {
      await axios({
        url: `http://localhost:5000/api/admin-panel/change-service/${data._id}`,
        method: 'PUT',
        headers: {
          Authorization: localStorage.token,
        },
        data: {
          ...data,
        },
      })
        .then((res) => {
          setAlert({
            title: 'Успешно',
            description: 'Данные изменились',
            isActive: true,
          });
          getServices();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changeService();
  };

  const deleteService = async (id) => {
    await axios({
      url: `http://localhost:5000/api/admin-panel/delete-service/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: 'Успешно',
          description: 'Успешное удаление услги',
          isActive: true,
        });
        getServices();
      })
      .catch((err) => {
        setAlert({
          title: 'Ошибка',
          description: 'Ошибка удаления услуги',
          isActive: true,
        });
      });
  };

  const getProfile = async () => {
    const res = await axios({
      url: "http://localhost:5000/api/users/profile",
      method: "GET",
      headers: {
        Authorization: localStorage.token,
      },
    });
    setProfile(res.data);
  };

  const closeMemo = () => setMemo(false)

  const getMemo = async() => {
    const res = await axios({
      method: "GET",
      url: `http://localhost:5000/api/memo`,
      headers: {
        Authorization: localStorage.token,
      },
    })
    setMemoData(res.data[0])
  }

  const editMemo = async(memoId, nameMemo, textMemo) => {
      if(!memoId) return

      const res = await axios({
        method: "PUT",
        url: `http://localhost:5000/api/memo/${memoId}`,
        headers: {
          Authorization: localStorage.token,
        },
        data: {
          nameMemo,
          textMemo,
        }
      })
      setMemoData(res.data)
      console.log(res)
      res?.status ?
        setAlert({
          title: 'Успешно',
          description: 'Памятка изменена',
          isActive: true,
        })
      :
        setAlert({
          title: 'Ошибка',
          description: 'Памятка не изменена',
          isActive: true,
        })
  }

  const deleteMemo = async(id) => {
    const res = await axios({
      method: "DELETE",
      url: `http://localhost:5000/api/memo/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
    console.log(res)
    res?.status ?
      setAlert({
        title: 'Успешно',
        description: 'Памятка удалена',
        isActive: true,
      }) 
    :
      setAlert({
        title: 'Ошибка',
        description: 'Памятка не удалена',
        isActive: true,
      })
  }

  return (
    <>
      <GlobalStyle memo={memo} />
      <div style={{ display: 'flex', height: '35px', alignItems: 'baseline', marginBottom: '15px' }}>
        <Filter services={services} filterMethod={onSetFilteredServices} />
        <button onClick={() => {
          setMemo(true)
          getProfile()
        }} style={{ marginLeft: '10px' }} className='default-btn default-btn_s1'>
          Памятка для модераторов
        </button>
      </div>

      <div className='table'>
        <table className='table__content'>
          <thead>
            <tr>
              <th>Заголовок</th>
              <th>Описание</th>
              <th>Статус блокировки</th>
              <th>Категории</th>
              <th>Дата</th>

              <th>Имя</th>
              <th>Почта</th>
              <th>Депозит</th>

              <th>Страница</th>
              <th>Обновить</th>
              <th>Удалить</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices?.map((item, indx) => {
              return (
                <ServiceItem
                  key={item._id}
                  updateService={updateService}
                  deleteService={deleteService}
                  serviceId={item._id}
                  date={item.date}
                  categories={item.categories}
                  title={item.title}
                  textContent={item.textContent}
                  userId={item.user && item.user._id}
                  email={item.user && item.user.email}
                  deposit={item.user && item.user.deposit}
                  username={item.user && item.user.username}
                  locked={item.locked}
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
      {memo && <>
        <Background onClick={closeMemo} />
        <Modal>
          {profile?.roles.includes("SUPERADMIN") ? <>
            <Row className='title'>
              <TitleInput ref={titleRef} />
              <div className='cross' onClick={closeMemo}>
                <i className='fas fa-times' />
              </div>
            </Row>
            <div className='message'>
              <div>
                <div>
                <BodyTextArea ref={textRef} />
                <Row style={{display: "flex", justifyContent: "space-around", marginTop: "10px"}}>
                  <div 
                    class="default-btn default-btn_s1" 
                    onClick={() => editMemo(memoData?._id, titleRef.current.value, textRef.current.value)}>
                      Изменить
                  </div>
                  <div 
                    onClick={() => deleteMemo(memoData?._id)}
                    class="default-btn default-btn_s1">
                      Удалить
                  </div>
                </Row>
                </div>
              </div>
            </div>
          </> : <>
            <Row className='title'>
              <div className='modalTitle'>{memoData?.nameMemo}</div>
              <div className='cross' onClick={closeMemo}>
                <i className='fas fa-times' />
              </div>
            </Row>
            <div className='message'>
              <div>
                <div>
                {memoData?.textMemo}
                </div>
              </div>
            </div>
          </>}
          
        </Modal>
      </>}
    </>
  );
};

export default Services;

Services.defaultProps = {
  services: [],
};
