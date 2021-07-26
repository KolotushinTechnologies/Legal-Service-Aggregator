import React, { useState, useEffect, useRef } from "react"
import Axios from "axios"
import styled from "styled-components"
import moment from 'moment'

import Alert from "../alerts/Alert"
import { Filter } from "./_index"
import "./_index.scss"

const InputMethod = styled.input`
padding: 10px;
border-radius: 5px;
border: 1px solid #c0c0c0;
`;

const ButtonMethod = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: 0;
  color: #ffffff;
  background: #fc171e;
  cursor: pointer;
  margin-left: 10px;
  margin-bottom: 30px;
`

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
  max-width: 400px;
  height: auto;
  border: 1px solid #c0c0c0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 55px 45px;
  overflow-y: auto;
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
    div {
      @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
        padding: 11px 28px;
        font-size: 14px;
      }
    }
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
`;

function MethodItem({ nameMethod, _id, date, updateMethod, deleteMethod }) {
  const [data, setData] = useState({
    nameMethod: nameMethod ? nameMethod : "",
    _id: _id ? _id : null,
    date: date ? date : null,
  });

  const [confirmDeleteMethod, setConfirmDeleteMethod] = useState(false);

  const closeDeleteMethod = () => {
    setConfirmDeleteMethod(false);
  };

  const onChangeData = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const onSubmit = () => {
    updateMethod(data);
  };

  return (
    <tr>
      <td>
        <input
          value={data.nameMethod}
          type="text"
          onChange={onChangeData}
          name="nameMethod"
        />
      </td>
      <td>{moment(date).format('DD.MM.YYYY')}</td>
      <td>{_id}</td>
      <th>
        <button onClick={onSubmit} className="default-btn default-btn-s1">
          Редактировать
        </button>
      </th>
      <th>
        {confirmDeleteMethod && (
          <>
            <Background onClick={closeDeleteMethod} />
            <Modal>
              <Row className="title">
                <div className="modalTitle">Удаление</div>
                <div className="cross" onClick={closeDeleteMethod}>
                  <i className="fas fa-times" />
                </div>
              </Row>
              <div className="message">
                <div>
                  <div>Удалить метод?</div>
                </div>
              </div>
              <Row className="btns">
                <div onClick={closeDeleteMethod} className="close">
                  Отмена
                </div>
                <div
                  className="confirm"
                  onClick={() => {
                    deleteMethod(_id);
                  }}
                >
                  Удалить
                </div>
              </Row>
            </Modal>
          </>
        )}
        <button
          onClick={() => setConfirmDeleteMethod(true)}
          className="default-btn"
        >
          Удалить
        </button>
      </th>
    </tr>
  );
}

const PaymentSystem = () => {
  const [methods, setMethods] = useState([]);
  const [filteredMethods, setFilteredMethods] = useState([]);
  const [alert, setAlert] = useState({
    title: "",
    description: "",
    isActive: false,
  });
  const text = useRef("");
  // Область ввода города
  const [textarea, setTextArea] = useState("");

  const onChangeAlert = (active) => {
    setAlert({
      ...alert,
      isActive: active,
    });
  };

  const onSetFilteredMethods = (e) => {
    let newList = [...methods];
    let { value } = e.target;
    newList = newList.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()));
    setFilteredMethods(newList);
  };

  useEffect(() => {
    getMethods();
  }, []);

  // Форма добавления метода
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(text.current.value);
    let nowValue = text.current.value;
    if (nowValue.length > 2) {
      text.current.value = "";
      setTextArea("");
      await Axios({
        method: "POST",
        url: "http://localhost:5000/api/payment-methods",
        data: {
          name: nowValue,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.token,
        },
      })
        .then((data) => {
          if (data.status === 200) {
            console.log("Успешно добавлен новый метод");
            setTextArea("");
            getMethods();
            setMethods(data.data);
          }
        })
        .catch((err) => {
          if (err.response) {
            alert("Ошибка, попробуйте позже");
          }
        });
    }
  };

  const getMethods = async () => {
    Axios({
      method: "GET",
      url: "http://localhost:5000/api/payment-methods",
    })
      .then((data) => {
        setMethods(data.data);
        setFilteredMethods(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const updateMethod = async (data) => {
    const changeCities = async () => {
      console.log(data);
      await Axios({
        method: "PUT",
        url: `http://localhost:5000/api/payment-methods/${data._id}`,
        headers: {
          Authorization: localStorage.token,
        },
        data: {
          name: data.nameMethod,
        },
      })
        .then((res) => {
          setAlert({
            title: "Успешно",
            description: "Данные изменились",
            isActive: true,
          });
          getMethods();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changeCities();
  };

  const deleteMethod = async (id) => {
    await Axios({
      method: "DELETE",
      url: `http://localhost:5000/api/payment-methods/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description: "Успешное удаление метода",
          isActive: true,
        });
        getMethods();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description: "Ошибка удаления метода",
          isActive: true,
        });
      });
  };

  return (<>
    <InputMethod
      ref={text}
      type="text"
      placeholder="Добавить новый метод"
      name="payment-system"
    />
    <ButtonMethod onClick={onSubmit}>Добавить</ButtonMethod>
    <Filter cities={methods} filterMethod={onSetFilteredMethods} />
    <div className="table">
      <table className="table__content">
        <thead>
          <tr>
            <th>Название метода</th>
            <th>Дата добавления</th>
            <th>Идентификатор</th>
          </tr>
        </thead>
        <tbody>
          {filteredMethods?.map((item, index) => {
            return (
              <MethodItem
                key={item._id}
                updateMethod={updateMethod}
                deleteMethod={deleteMethod}
                nameMethod={item.name}
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
  </>)
}
export default PaymentSystem