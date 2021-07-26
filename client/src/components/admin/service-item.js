import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
import axios from 'axios'
import moment from 'moment'

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
  width: 65vw;
  height: auto;
  overflow-y: auto;
  transform: translate(50%, 0);
  border: 1px solid #c0c0c0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 15px 30px 50px 30px;
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

const CategoryDiv = styled.div`
  padding: 5px;
  margin: 5px;
  border-radius: 5px;
  line-height: 21px;
  background: #fc171e;
  color: white;
  font-size: 14px;
  font-weight: 600;
  width: max-content;
`

const useStyles = makeStyles((theme) => ({
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));


const ServiceItem = ({
  _id,
  serviceId,
  date,
  categories,
  title,
  textContent,
  userId,
  email,
  username,
  updateService,
  deleteService,
  locked,
  deposit
}) => {
  const classes = useStyles()

  const [data, setData] = useState({
    _id: serviceId ? serviceId : null,
    categories: '',
    categoriesArr: categories ? categories : null,
    date: date ? date : null,
    title: title ? title : '',
    textContent: textContent ? textContent : '',
    userId: userId ? userId : null,
    email: email ? email : null,
    deposit: deposit ? deposit : null,
    username: username ? username : null,
    locked: !!locked
  })
  const [localEditorState, setLocalEditorState] = useState(
    //json test
    (/^[\],:{}\s]*$/.test(textContent.replace(/\\['\\\/bfnrtu]/g, '@').
      replace(/'[^'\\\n\r]*'|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
      replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) ?
      EditorState.createWithContent(convertFromRaw(
        JSON.parse(textContent)
      )) : EditorState.createEmpty()
  )
  const [modalActive, setModalActive] = useState(false)
  const [confirmDeleteService, setConfirmDeleteService] = useState(false)


  const handleChange = (e) => {
    setData({ ...data, locked: e.target.value })
  }
  const closeDeleteService = () => {
    setConfirmDeleteService(false)
  }

  useEffect(() => {
    let cat_upd = [...data.categoriesArr];
    let cat_new = '';
    cat_upd = cat_upd.map((item) => {
      cat_new += item + ',';
    });
    setData({ ...data, categories: cat_new });
  }, []);

  const onChangeData = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const onSumbit = () => {
    updateService(data);
  };

  const saveService = async () => {
    let categoriesStr
    console.log(data.categoriesArr)
    for (let i of data.categoriesArr) {
      if (data.categoriesArr.indexOf(i) == data.categoriesArr.length - 1) {
        categoriesStr += i
      } else {
        categoriesStr ? categoriesStr += `${i};` : categoriesStr = `${i};`
      }
    }
    axios({
      method: 'PUT',
      url: `http://localhost:5000/api/services/${data._id}`,
      data: {
        title: data.title,
        textContent: JSON.stringify(convertToRaw(localEditorState.getCurrentContent())),
        categories: categoriesStr[categoriesStr.length - 1] == ',' ? categoriesStr.substring(0, categoriesStr.length - 1) : categoriesStr,
        locked: data.locked
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        if (data.status === 200) {
          // setAlert({
          //   title: 'Успешно добавлено',
          //   description: 'Успешно добавлено',
          //   isActive: true,
          // });
          //getServices();
          setModalActive(false)
        }
      })
      .catch((err) => {
        if (err.response) {
          // setAlert({
          //   title: 'Ошибка',
          //   description: 'Ошибка, попробуйте позже',
          //   isActive: true,
          // });
          setModalActive(false)
        }
      });
  }

  return (
    <tr style={data.locked ? { background: 'rgba(252, 23, 30, 0.2)' } : {}}>
      <td>
        <input
          value={data.title}
          type='text'
          onChange={onChangeData}
          name='title'
        />
      </td>

      <td>
        <button onClick={() => setModalActive(true)} className='default-btn default-btn_s1'>
          Изменить описание
        </button>
      </td>
      <td>
        <FormControl className={classes.formControl}>
          <InputLabel>Выбор статуса</InputLabel>
          <Select
            value={data.locked}
            onChange={handleChange}>
            <MenuItem value={false}>
              Разблокирована
            </MenuItem>
            <MenuItem value={true}>
              Заблокирована
            </MenuItem>
          </Select>
        </FormControl>
      </td>
      <td>
        {data.categoriesArr.map((item, indx) => (
          <CategoryDiv key={indx}>{item}</CategoryDiv>
        ))}
      </td>
      <td>{moment(date).format('DD.MM.YYYY')}</td>
      {username && email ? <>
        <td>{username}</td>
        <td>{email}</td>
        <td>{deposit} р.</td>
      </> : <>
        <td>Пользователь удален</td>
        <td></td><td></td>
      </>}

      <td>
        <Link to={`/user/${data.userId}`} className='results__col-btn'>
          Перейти
        </Link>
      </td>
      <th>
        <button onClick={onSumbit} className='default-btn default-btn_s1'>
          Обновить
        </button>
      </th>
      <th>

      </th>
      <th>
        {confirmDeleteService && (
          <>
            <Background onClick={closeDeleteService} />
            <Modal>
              <Row className='title'>
                <div className='modalTitle'>Удалить услугу</div>
                <div className='cross' onClick={closeDeleteService}>
                  <i className='fas fa-times' />
                </div>
              </Row>
              <div className='message'>
                <div>
                  <div>Удалить услугу?</div>
                </div>
              </div>
              <Row className='btns'>
                <div onClick={closeDeleteService} className='close'>
                  Отмена
                </div>
                <div
                  className='confirm'
                  onClick={() => {
                    deleteService(serviceId);
                  }}
                >
                  Удалить
                </div>
              </Row>
            </Modal>
          </>
        )}
        {modalActive && <>
          <Background onClick={() => setModalActive(false)} />
          <Modal>
            <Row className='title'>
              <div className='modalTitle'>Редактировать услугу</div>
              <div className='cross' onClick={() => setModalActive(false)}>
                <i className='fas fa-times' />
              </div>
            </Row>

            <input
              value={data.title}
              type='text'
              onChange={onChangeData}
              name='title'
            />


            <Editor
              editorState={localEditorState}
              toolbarClassName='toolbarClassName'
              wrapperClassName='wrapperClassName'
              editorClassName='editorClassName'
              wrapperStyle={{ width: '100%' }}
              editorStyle={{ width: '100%', border: '1px solid #F1F1F1', maxHeight: '30vh' }}
              toolbarStyle={{ width: '100%' }}
              onEditorStateChange={e => setLocalEditorState(e)}

            />
            <Row className='btns'>
              <div
                className='close'
                onClick={saveService}
              >
                Изменить
              </div>
            </Row>
          </Modal>
        </>}

        <button
          onClick={() => setConfirmDeleteService(true)}
          className='default-btn default-btn_s1'
        >
          Удалить
        </button>
      </th>
    </tr>
  );
};

export default ServiceItem;
