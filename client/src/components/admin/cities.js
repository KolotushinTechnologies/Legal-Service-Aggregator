import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import styled from "styled-components";
import { Filter } from "./_index";
import Alert from "../alerts/Alert";
import CitiesItem from "./CitiesItem";
import "./_index.scss";

const InputCity = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #c0c0c0;
`;

const ButtonCity = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: 0;
  color: #ffffff;
  background: #fc171e;
  cursor: pointer;
  margin-left: 10px;
  margin-bottom: 30px;
`

function CitiesAdmin() {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
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

  const onSetFilteredCities = (e) => {
    let newList = [...cities];
    let { value } = e.target;
    newList = newList.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()));
    setFilteredCities(newList);
  };

  useEffect(() => {
    getCities();
  }, []);

  // Форма создания города
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(text.current.value);
    let nowValue = text.current.value;
    if (nowValue.length > 2) {
      text.current.value = "";
      setTextArea("");
      await Axios({
        method: "POST",
        url: "http://localhost:5000/api/city",
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
            console.log("Успешно создан новый город");
            setTextArea("");
            getCities();
            setCities(data.data);
          }
        })
        .catch((err) => {
          if (err.response) {
            alert("Ошибка, попробуйте позже");
          }
        });
    }
  };

  const getCities = async () => {
    Axios({
      method: "GET",
      url: " http://localhost:5000/api/city",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((data) => {
        setCities(data.data);
        setFilteredCities(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const updateCities = async (data) => {
    const changeCities = async () => {
      console.log(data);
      await Axios({
        method: "PUT",
        url: `http://localhost:5000/api/city/${data._id}`,
        headers: {
          Authorization: localStorage.token,
        },
        data: {
          name: data.nameCity,
        },
      })
        .then((res) => {
          setAlert({
            title: "Успешно",
            description: "Данные изменились",
            isActive: true,
          });
          getCities();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changeCities();
  };

  const deleteCities = async (id) => {
    await Axios({
      method: "DELETE",
      url: `http://localhost:5000/api/city/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: "Успешно",
          description: "Успешное удаление города",
          isActive: true,
        });
        getCities();
      })
      .catch((err) => {
        setAlert({
          title: "Ошибка",
          description: "Ошибка удаления города",
          isActive: true,
        });
      });
  };

  return (
    <>
      <InputCity
        ref={text}
        type="text"
        placeholder="Создать новый город"
        name="sendCity"
      />
      <ButtonCity onClick={onSubmit}>Создать</ButtonCity>
      <Filter cities={cities} filterMethod={onSetFilteredCities} />
      <div className="table">
        <table className="table__content">
          <thead>
            <tr>
              <th>Имя города</th>
              <th>Дата создания города</th>
              <th>Идентификатор города</th>
            </tr>
          </thead>
          <tbody>
            {filteredCities?.map((item, index) => {
              return (
                <CitiesItem
                  key={item._id}
                  updateCity={updateCities}
                  deleteCity={deleteCities}
                  nameCity={item.name}
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

export default CitiesAdmin;
