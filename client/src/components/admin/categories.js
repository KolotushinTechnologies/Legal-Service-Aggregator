import React, { useState, useEffect, useRef } from 'react'
import Axios from 'axios'
import styled from 'styled-components'
import { Filter } from './_index'
import Alert from '../alerts/Alert'
import CategoriesItem from './CategoriesItem'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import './_index.scss'

const InputCategory = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: ${p => p.error ? '1px solid #fc171e' : '1px solid #c0c0c0'};
`

const ButtonCategory = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: 0;
  color: #ffffff;
  background: #fc171e;
  cursor: pointer;
`

const SelectSectionForm = styled.form`
  display: flex;
  margin-bottom: 30px;
  @media(max-width: ${p => p.theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`

const FormControlSectionStyled = styled(FormControl)`
  margin: 0 10px !important;
  @media(max-width: ${p => p.theme.breakpoints.tablet}) {
    margin: 10px 0 !important;
  }
`

const SelectSectionStyled = styled(Select)`
  min-width: 200px;
  @media(max-width: ${p => p.theme.breakpoints.tablet}) {
    min-width: none;
    width: 100%;
  }
`

function CategoriesAdmin() {
  const [sections, setSections] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)
  const [errorCreateCategory, setErrorCreateCategory] = useState(false)
  const [filterValue, setFilterValue] = useState('')

  const [alert, setAlert] = useState({
    title: '',
    description: '',
    isActive: false,
  });
  const categoryName = useRef('')

  const onChangeAlert = (active) => {
    setAlert({
      ...alert,
      isActive: active,
    });
  };

  const onSetFilteredCategories = (e) => {
    let newList = [...categories];
    let { value } = e.target;
    newList = newList.filter((item) => item.name.toLowerCase().includes(value.toLowerCase()) || item.section.name.toLowerCase().includes(value.toLowerCase()));
    setFilteredCategories(newList);
    setFilterValue(value) // чтобы отфильтровать новые поступления
  };

  useEffect(() => {
    getCategories();
  }, []);

  // Форма создания категории
  const onSubmit = e => {
    e.preventDefault()
    if (categoryName.current.value.trim().match(/^.{3,}$/g) === null || selectedSection === null || (categories.length > 0 && categories.some(category => category.name === categoryName.current.value && category.section._id === selectedSection))) {
      setErrorCreateCategory(true)
      return
    }

    Axios({
      method: 'POST',
      url: 'http://localhost:5000/api/categories',
      data: {
        name: categoryName.current.value,
        section: selectedSection
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.token
      }
    })
      .then(data => {
        setCategories(p => [data.data, ...p])
        setFilteredCategories(p => [data.data, ...p].filter((item) => item.name.toLowerCase().includes(filterValue.toLowerCase()) || item.section.name.toLowerCase().includes(filterValue.toLowerCase())))
      })
      .catch(() => {
        setAlert({
          title: 'Ошибка',
          description: 'Ошибка, попробуйте позже',
          isActive: true,
        })
      })

    setErrorCreateCategory(false)
    setSelectedSection(null)
    categoryName.current.value = ''
  }

  const getCategories = async () => {
    Axios({
      method: 'GET',
      url: 'http://localhost:5000/api/categories',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
    })
      .then((data) => {
        setSections(data.data.sections)
        setCategories(data.data.categories)
        setFilteredCategories(data.data.categories.filter((item) => item.name.toLowerCase().includes(filterValue.toLowerCase()) || item.section.name.toLowerCase().includes(filterValue.toLowerCase())))
      })
  }

  const updateCategories = async (data) => {
    const changeCategories = async () => {
      console.log(data)
      await Axios({
        method: 'PUT',
        url: `http://localhost:5000/api/categories/${data._id}`,
        headers: {
          Authorization: localStorage.token,
        },
        data: {
          name: data.nameCategory,
          section: data.section
        },
      })
        .then((res) => {
          setAlert({
            title: 'Успешно',
            description: 'Данные изменились',
            isActive: true,
          });
          getCategories();
          console.log(res.res);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    changeCategories();
  };

  const deleteCategories = async (id) => {
    await Axios({
      method: 'DELETE',
      url: `http://localhost:5000/api/categories/${id}`,
      headers: {
        Authorization: localStorage.token,
      },
    })
      .then((data) => {
        setAlert({
          title: 'Успешно',
          description: 'Успешное удаление категории',
          isActive: true,
        });
        getCategories();
      })
      .catch((err) => {
        setAlert({
          title: 'Ошибка',
          description: 'Ошибка удаления категории',
          isActive: true,
        });
      });
  };
  const handleSection = e => {
    setSelectedSection(e.target.value)
    setErrorCreateCategory(false)
  }

  return (
    <>
      <SelectSectionForm onSubmit={onSubmit}>
        <InputCategory
          ref={categoryName}
          placeholder='Создать новую категорию'
          name='sendCategory'
          error={errorCreateCategory}
          onChange={() => setErrorCreateCategory(false)}
        />
        <FormControlSectionStyled>
          <InputLabel error={errorCreateCategory}>Выбор раздела</InputLabel>
          <SelectSectionStyled value={selectedSection} onChange={handleSection} error={errorCreateCategory}>
            {sections.map(section => <MenuItem key={section._id} value={section._id}>{section.name}</MenuItem>)}
          </SelectSectionStyled>
        </FormControlSectionStyled>
        <ButtonCategory type='submit'>Создать</ButtonCategory>
      </SelectSectionForm>
      <Filter categories={categories} filterMethod={onSetFilteredCategories} />
      <div className='table'>
        <table className='table__content'>
          <thead>
            <tr>
              <th>Имя категории</th>
              <th>Раздел</th>
              <th>Дата создания категории</th>
              <th>Идентификатор категории</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories?.map((item, index) => {
              return (
                <CategoriesItem
                  key={item._id}
                  updateCategory={updateCategories}
                  deleteCategory={deleteCategories}
                  nameCategory={item.name}
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

export default CategoriesAdmin;
