import React, { useState, useEffect, useRef } from 'react'
import Axios from 'axios'
import moment from 'moment'
import styled from 'styled-components'

import Alert from '../alerts/Alert'
import { Filter } from './_index'
import './_index.scss'

const InputSection = styled.input`
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #c0c0c0;
`

const ButtonSection = styled.button`
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
const SectionItem = ({
  nameSection,
  _id,
  date,
  updateSection,
  deleteSection,
  section
}) => {
  const [data, setData] = useState({
    nameSection: nameSection ? nameSection : '',
    _id: _id ? _id : null,
    date: date ? date : null,
    section: section ? section : null
  });

  const [confirmDeleteSection, setConfirmDeleteSection] = useState(false);

  const closeDeleteSection = () => {
    setConfirmDeleteSection(false);
  };

  const onChangeData = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const onSubmit = () => {
    console.log(data)
    updateSection(data);
  };

  return (
    <tr>
      <td>
        <input
          value={data.nameSection}
          type='text'
          onChange={onChangeData}
          name='nameSection'
        />
      </td>
      {/* <td>
        <input
          value={data.section}
          type='text'
          onChange={onChangeData}
          name='section'
        />
      </td> */}
      <td>{moment(date).format('DD.MM.YYYY')}</td>
      <td>{_id}</td>
      <th>
        <button onClick={onSubmit} className='default-btn default-btn-s1'>
          Редактировать
        </button>
      </th>
      <th>
        {confirmDeleteSection && (
          <>
            <Background onClick={closeDeleteSection} />
            <Modal>
              <Row className='title'>
                <div className='modalTitle'>Удаление</div>
                <div className='cross' onClick={closeDeleteSection}>
                  <i className='fas fa-times' />
                </div>
              </Row>
              <div className='message'>
                <div>
                  <div>Удалить раздел?</div>
                </div>
              </div>
              <Row className='btns'>
                <div onClick={closeDeleteSection} className='close'>
                  Отмена
                </div>
                <div
                  className='confirm'
                  onClick={() => {
                    deleteSection(_id);
                  }}
                >
                  Удалить
                </div>
              </Row>
            </Modal>
          </>
        )}
        <button
          onClick={() => setConfirmDeleteSection(true)}
          className='default-btn'
        >
          Удалить
        </button>
      </th>
    </tr>
  );
}

function SectionsAdmin() {
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [alert, setAlert] = useState({
    title: '',
    description: '',
    isActive: false,
  });
  const text = useRef('');
  const section = useRef('')
  // Область ввода категории
  const [textarea, setTextArea] = useState('');

  const onChangeAlert = (active) => {
    setAlert({
      ...alert,
      isActive: active,
    });
  };

  const onSetFilteredSections = (e) => {
    let newList = [...sections];
    let { value } = e.target;
    newList = newList.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()) || item.section?.toLowerCase().includes(value.toLowerCase()));
    setFilteredSections(newList);
  };

  useEffect(() => {
    getSections();
  }, []);

  // Форма создания категории
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(text.current.value);
    console.log(section.current.value)
    let nowValue = text.current.value
    if (nowValue.length > 2) {
      text.current.value = '';
      setTextArea('');
      await Axios({
        method: 'POST',
        url: 'http://localhost:5000/api/sections',
        data: {
          name: nowValue,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.token,
        },
      })
        .then((data) => {
          if (data.status === 200) {
            console.log('Успешно создан новый раздел');
            setTextArea('');
            getSections();
            setSections(data.data);
          }
        })
        .catch((err) => {
          if (err.response) {

            setAlert({
              title: 'Ошибка',
              description: 'Ошибка, попробуйте позже',
              isActive: true,
            })
          }
        });
    }
  };

  const getSections = async () => {
    Axios({
      method: 'GET',
      url: ' http://localhost:5000/api/sections',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
    })
      .then((data) => {
        setSections(data.data);
        setFilteredSections(data.data);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
      });
  };

  const updateSections = async (data) => {
    const changeSections = async () => {
      console.log(data)
      await Axios({
        method: 'PUT',
        url: `http://localhost:5000/api/sections/${data._id}`,
        headers: {
          Authorization: localStorage.token,
        },
        data: {
          name: data.nameSection,
        },
      })
        .then((res) => {
          setAlert({
            title: 'Успешно',
            description: 'Данные изменились',
            isActive: true,
          });
          getSections();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changeSections();
  };

  const deleteSections = async (id) => {
    await Axios({
      method: 'DELETE',
      url: `http://localhost:5000/api/sections/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: 'Успешно',
          description: 'Успешное удаление раздела',
          isActive: true,
        });
        getSections();
      })
      .catch((err) => {
        setAlert({
          title: 'Ошибка',
          description: 'Ошибка удаления раздела',
          isActive: true,
        });
      });
  };

  return (
    <>
      <InputSection
        ref={text}
        type='text'
        placeholder='Создать новый раздел'
        name='sendSection'
      />
      <ButtonSection onClick={onSubmit}>Создать</ButtonSection>
      <Filter section={section} filterMethod={onSetFilteredSections} />
      <div className='table'>
        <table className='table__content'>
          <thead>
            <tr>
              <th>Имя раздела</th>
              <th>Дата создания раздела</th>
              <th>Идентификатор раздела</th>
            </tr>
          </thead>
          <tbody>
            {filteredSections?.map((item, index) => {
              return (
                <SectionItem
                  key={item._id}
                  updateSection={updateSections}
                  deleteSection={deleteSections}
                  nameSection={item.name}
                  _id={item._id}
                  date={item.createdAt}
                  section={item.section}
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

export default SectionsAdmin;
