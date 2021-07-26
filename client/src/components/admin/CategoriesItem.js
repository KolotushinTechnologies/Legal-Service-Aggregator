import React, { useState } from 'react'
import styled from 'styled-components'
import moment from 'moment'

import './_index.scss'

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

function CategoriesItem({
  nameCategory,
  _id,
  date,
  updateCategory,
  deleteCategory,
  section
}) {
  const [data, setData] = useState({
    nameCategory: nameCategory ? nameCategory : '',
    _id: _id ? _id : null,
    date: date ? date : null,
    section: section ? section : null
  });

  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(false);

  const closeDeleteCategory = () => {
    setConfirmDeleteCategory(false);
  };

  const onChangeData = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const onSubmit = () => {
    updateCategory(data);
  };

  return (
    <tr>
      <td>
        <input
          value={data.nameCategory}
          type='text'
          onChange={onChangeData}
          name='nameCategory'
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
      <td>{data.section?.name}</td>
      <td>{moment(date).format('DD.MM.YYYY')}</td>
      <td>{_id}</td>
      <th>
        <button onClick={onSubmit} className='default-btn default-btn-s1'>
          Редактировать
        </button>
      </th>
      <th>
        {confirmDeleteCategory && (
          <>
            <Background onClick={closeDeleteCategory} />
            <Modal>
              <Row className='title'>
                <div className='modalTitle'>Удаление</div>
                <div className='cross' onClick={closeDeleteCategory}>
                  <i className='fas fa-times' />
                </div>
              </Row>
              <div className='message'>
                <div>
                  <div>Удалить категорию?</div>
                </div>
              </div>
              <Row className='btns'>
                <div onClick={closeDeleteCategory} className='close'>
                  Отмена
                </div>
                <div
                  className='confirm'
                  onClick={() => {
                    deleteCategory(_id);
                  }}
                >
                  Удалить
                </div>
              </Row>
            </Modal>
          </>
        )}
        <button
          onClick={() => setConfirmDeleteCategory(true)}
          className='default-btn'
        >
          Удалить
        </button>
      </th>
    </tr>
  );
}

export default CategoriesItem;
