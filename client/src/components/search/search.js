import React, { useContext, useEffect, useState } from 'react';
import { visa, bitcoin, qiwi, yandexMoney } from '../../assets/images/_index';
import Select from 'react-dropdown-select';
import { Results } from '../results';
import './index.sass';
import { ProfileContext } from '../../context/profile/profileContext';
import Axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField';
// import {
//   BreadcrumbsItem,
//   Breadcrumbs
// } from 'react-breadcrumbs-dynamic'
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { common } from '@material-ui/core/colors';

import get_payment_logo from '../payment/logo'

export default function Search({ searchTextState, setTransOnSub }) {
  const history = useHistory()
  const [firstLoad, setFirstLoad] = useState(true)
  let url = history.location.pathname.split("/search/")[1];
  const [profiles, setProfiles] = useState(null);
  const [updatedProfiles, setUpdatedProfiles] = useState(null)
  const [cities, setCities] = useState([])
  const [formData, setFormData] = useState({
    keywords: '',
    currentKeywords: '',
    categories: [],
    filteredCategories: [],
    selectedCategories: [],
    constCtgs: [],
    sections: [],
    selectedSection: [{ label: "", value: "" }],
    registration: [
      { value: '2', title: 'От 2 лет' },
      { value: '1', title: 'От года' },
      { value: '0.5', title: 'От 0.5' },
      { value: '0', title: 'Не важно' }
    ],
    selected_registration: (searchTextState != '') || url ? '0' : '1',
    selected_rating: 0,
    selected_city: '',
    deposit: 0,
    guarantor: false,
    payment_visa: false,
    payment_btc: false,
    payment_qiwi: false,
    payment_yandex: false,
    payment: {

    }
  });
  const [paymentMethods, setPaymentMethods] = useState()

  useEffect(() => {
    console.log(searchTextState)
    setFormData({ ...formData, currentKeywords: searchTextState })
    //onSubmit()
  }, [searchTextState])

  useEffect(() => {

    firstLoad && searchTextState && searchTextState != '' && onSubmit()

  })
  // Получить всех пользователей
  useEffect(() => {
    const getAllProfiles = async () => {

      await Axios({
        url: 'http://localhost:5000/api/users/profiles',
        method: 'GET'
      })
        .then((data) => {
          setProfiles(data.data);
        })
        .catch((err) => {
          console.log('Ошибка во время загрузки профилей');
        });
    };
    getAllProfiles();



  }, []);

  // Получить все города
  const getCities = async () => {
    const res = await Axios({
      method: 'GET',
      url: 'http://localhost:5000/api/city'
    })

    const fetched_cities = res.data.map((city) => {
      return {
        value: city.name,
        label: city.name
      };
    });
    setCities(fetched_cities)
  }
  useEffect(() => {
    getPaymentMethods()
    getCities()
  }, []);

  // Получить все категории
  useEffect(() => {
    Axios({
      method: 'GET',
      url: 'http://localhost:5000/api/sections'
    })
      .then((data) => {
        console.log(data.data)
        const filtered = data.data.filter(e => e.categories.length > 0)
        const needSec = filtered.find(el => el.categories.map(e => e._id).includes(url))
        console.log('Смотри тут')
        setFormData({
          ...formData,
          sections: filtered,
          selectedSection: url ? [{
            label: needSec.name,
            value: needSec.name,
          }] : [],
          selectedCategories: url ? [
            {
              // label: filtered.find(el => el.categories.map(e => e.id).include(url)).categories[0].name,
              // value: filtered.find(el => el.categories.map(e => e.id).include(url)).categories[0].name,
              label: needSec.categories.find(e => e._id.includes).name,
              value: needSec.categories.find(e => e._id.includes).name,
            }
          ] : []
        })

        // if(url){
        //   Axios({
        //     method: 'GET',
        //     url: 'http://localhost:5000/api/categories'
        //   }).then(data2 => {
        //     let filtered = [...data.data].map((item) => {
        //       return {
        //         id: item._id,
        //         value: item.name,
        //         label: item.name,
        //         section: item.section,
        //       }})

        //       setFormData({
        //         ...formData,
        //         selectedCategories: [
        //           {
        //             label: filtered.find(el => el.id == url).label,
        //             value: filtered.find(el => el.id == url).value,
        //           }
        //         ]
        //       })
        //   })
        // }
        // let filtered = [...data.data].map((item) => {
        //   return {
        //     id: item._id,
        //     value: item.name,
        //     label: item.name,
        //     section: item.section,
        //   };
        // });
        // let uniqueSections = []
        // for(let el of data.data){
        //   !uniqueSections.includes(el.section) && uniqueSections.push(el.section)
        // }
        // uniqueSections = uniqueSections.map(e => {
        //   return {label: e, value: e}
        // })
        // // let searchSection = data.data.find(e => e.name == formData.selectedCategories[0].value)?.section
        // console.log(filtered.find(el => el.id == url))
        // setFormData((prev) => {
        //   return {
        //     ...prev,
        //     categories: filtered,
        //     sections: uniqueSections,
        //     selectedSection: url ? [
        //       {
        //         label: filtered.find(el => el.id == url)?.section,
        //         value: filtered.find(el => el.id == url)?.section,
        //       }
        //     ] : [
        //       {
        //         label: "",
        //         value: "",
        //       }
        //     ],
        //     filteredCategories: url && filtered.filter(el => el.section == filtered.find(el => el.id == url)?.section),
        //     // selectedSection: [{
        //     //   value: searchSection,
        //     //   label: searchSection
        //     // }]
        //     selectedCategories: url ? [
        //       {
        //         label: filtered.find(el => el.id == url).label,
        //         value: filtered.find(el => el.id == url).value,
        //       }
        //     ] : [],
        //   }
        // });


      });
  }, []);

  useEffect(() => {
    url && firstLoad && formData.selectedCategories[0] && onSubmit()

  })

  const getPaymentMethods = async () => {
    const res = await Axios({
      url: `http://localhost:5000/api/payment-methods`,
      method: 'GET',
    })
    console.log(res.data)
    setPaymentMethods(res.data)
  }

  const onSubmit = (e, data) => {
    e && e.preventDefault();
    //searchTextState && searchTextState !== '' && setFormData({...formData, keywords: formData.currentKeywords})
    const keywords = formData.keywords
    !setTransOnSub && setTransOnSub(onSubmit)
    if (profiles) {
      console.log(searchTextState)
      if (!searchTextState || searchTextState == '') {
        setFormData({ ...formData, constCtgs: formData.selectedCategories })
        let {
          deposit,
          guarantor,
          payment,
          selectedCategories,
          selected_city,
          selected_rating,
          selected_registration
        } = formData

        console.log(formData.categories.find(el => el.id == url))

        url && console.log(url)
        url && console.log(selectedCategories)

        // Сравнение на категории
        selectedCategories = selectedCategories?.map((item) => item.value);

        let filtered = [...profiles];
        console.log(formData)
        //console.log(filtered[0].services[0].title)

        let upd_filtered = filtered.filter(
          (item) =>
            (item.city ? item.city.includes(selected_city) : true) &&
            item.rating >= selected_rating &&
            item.deposit >= deposit &&
            item.guarantorService === guarantor &&
            cheackMethods(payment, item.paymentMethods) &&
            // item.paymentMethods.bitcoin === payment_btc &&
            // item.paymentMethods.qiwi === payment_qiwi &&
            // item.paymentMethods.visaMastercard === payment_visa &&
            // item.paymentMethods.yandex === payment_yandex && 
            (
              cheackOld(item.createdAt, selected_registration)
            ) && (
              checkIncludes(selectedCategories, item)
            )
        )
        console.log(upd_filtered);
        setUpdatedProfiles(upd_filtered);
        setFirstLoad(false)
      } else {
        console.log('поиск по кейвортсам')
        let filtered = [...profiles];
        console.log(filtered)

        setFormData({ ...formData, constCtgs: formData.selectedCategories, selected_registration: 0 })
        let {
          deposit,
          guarantor,
          payment,
          selectedCategories,
          selected_city,
          selected_rating,
          selected_registration
        } = formData

        let upd_filtered = filtered.filter(
          (item) =>
            ((item.city ? item.city.includes(selected_city) : true) &&
              item.rating >= selected_rating &&
              item.deposit >= deposit &&
              item.guarantorService === guarantor &&
              cheackMethods(payment, item.paymentMethods) &&
              // item.paymentMethods.bitcoin === payment_btc &&
              // item.paymentMethods.qiwi === payment_qiwi &&
              // item.paymentMethods.visaMastercard === payment_visa &&
              // item.paymentMethods.yandex === payment_yandex && 
              (
                cheackOld(item.createdAt, selected_registration)
              ) && (
                checkIncludes(selectedCategories, item)
              )) && (
              item.email?.toLowerCase().includes(searchTextState) ||
              item.username?.toLowerCase().includes(searchTextState) ||
              item.services.find(e => e.title?.toLowerCase().includes(searchTextState))
            )
        )
        console.log(upd_filtered)
        setUpdatedProfiles(upd_filtered);
        setFirstLoad(false)
      }
    }
  };

  const STEP = 0.5;
  const MIN = 0;
  const MAX = 100000;

  const checkIncludes = (selectedCategories, item) => {

    let res = true

    for (let elem of selectedCategories) {
      let include = false
      for (let i of item.services) {
        i.categories?.includes(elem) && (include = true)
        console.log(`${elem}  ${i.categories?.includes(elem)}`)
      }
      res && (res = include)
    }
    if (!selectedCategories.length) {
      return true
    }
    return res
  }

  const cheackOld = (old, years) => {
    const oldMS = Date.parse(old)
    const nowMS = Date.parse(new Date())

    if ((nowMS - oldMS) / 1000 > years * 12 * 30 * 24 * 60 * 60) {
      return true
    }
    return false
  }
  // cheackOld('2020-11-02T06:34:43.451Z', 1)

  const cheackMethods = (searchParams, userMethods) => {
    let needArr = []
    //console.log(searchParams)
    for (let key in searchParams) {
      // console.log(searchParams[key].status)
      searchParams[key].status && needArr.push(searchParams[key]._id)
    }
    if (needArr.length == 0) return true
    let res = true
    //console.log(res)
    userMethods[0] && console.log(userMethods)
    for (let el of needArr) {
      if (!userMethods.includes(el)) res = false
    }
    return res
  }

  return (
    <div>
      {/* <BreadcrumbsItem to='/search'>Поиск</BreadcrumbsItem> */}
      <Breadcrumbs>
        <Link to={'/'}>Главная</Link>
        <div>Поиск</div>
      </Breadcrumbs>
      <form onSubmit={onSubmit} className='advanced-search'>
        <p className='advanced-search__title'>Расширенный поиск</p>
        {/* Ключевые слова */}
        {/* <div className='advanced-search__group'>
          <label className='advanced-search__label'>Ключевые слова</label>
          <div className='advanced-search__direction-wrapper'>
            <TextField 
              variant="outlined"
              size="small"
              autoComplete={'off'}
              name="Ключевые слова"
              color="secondary"
              onChange={(e) => {
                console.log(e.target.value.trim())
                setFormData({
                  ...formData,
                  currentKeywords: e.target.value.trim(),
                })
              //   console.log(formData.selectedSection[0].value)
              //   console.log(value[0].value)
              //   console.log(value)
              //   console.log(formData.selectedSection)
              //   setFormData({
              //     ...formData,
              //     selectedSection: value,
              //     filteredCategories: formData.categories.filter(e => e.section == value[0].value),
              //     selectedCategories: formData.selectedSection && formData.selectedSection[0].value != value[0].value ? [] : formData.selectedCategories
              //   });
              }}
              style={{width: '100%', height: '35px'}}
            />
          </div>
        </div> */}
        {/* Разделы */}
        <div className='advanced-search__group'>
          <label className='advanced-search__label'>Разделы</label>
          <div className='advanced-search__direction-wrapper'>
            <Select
              options={formData?.sections?.map(e => {
                return {
                  label: e.name,
                  value: e.name,
                }
              })}
              // options={[{
              //   label: 'test',
              //   value: 'test'
              // }]}
              closeOnSelect={true}
              name="Разделы"
              color="#fc171e"
              onChange={(value) => {
                // console.log(formData.selectedSection[0].value)
                // console.log(value[0].value)
                // console.log(value)
                // console.log(formData.selectedSection)
                // console.log(formData)
                setFormData({
                  ...formData,
                  selectedSection: value,
                  //filteredCategories: formData.categories.filter(e => e.section == value[0].value),
                  filteredCategories: formData.sections.find(e => e.name === value[0]?.value)?.categories,
                  selectedCategories: formData.selectedSection && formData.selectedSection[0]?.value != value[0]?.value ? [] : formData.selectedCategories
                });
              }}
              values={formData.selectedSection}
              placeholder='Разделы'
            />
          </div>
        </div>
        {/* Категории */}
        {formData.selectedSection[0] && formData.selectedSection[0]?.value != '' &&
          <div className='advanced-search__group'>
            <label className='advanced-search__label'>Категории</label>
            <div className='advanced-search__direction-wrapper'>
              <Select
                multi={true}
                options={formData.filteredCategories?.map(e => {
                  return {
                    label: e.name,
                    value: e.name,
                  }
                })}
                closeOnSelect={false}
                name='Категории'
                values={[...formData.selectedCategories]}
                color='#fc171e'
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    selectedCategories: value
                  });
                }}
                placeholder='Категории'

              />
              <span className='advanced-search__direction-small'>
                Например: трудовые споры
              </span>
            </div>
          </div>
        }

        {/* Сроки */}
        <div className='advanced-search__group'>
          <label className='advanced-search__label'>
            Срок регистрации на сайте
          </label>
          <div className='advanced-search__input-buttons'>
            <div className='advanced-search__input-group'>
              <input
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, selected_registration: 2 };
                  });
                }}
                defaultValue='2'
                id='registration_term_1'
                name='registration_term'
                type='radio'
                className='advanced-search__input-button'
              />
              <label
                className='advanced-search__input-label'
                htmlFor='registration_term_1'
              >
                От 2 лет
              </label>
            </div>

            <div className='advanced-search__input-group'>
              <input
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, selected_registration: 1 };
                  });
                }}
                defaultValue='1'
                defaultChecked={!url || false}
                id='registration_term_2'
                name='registration_term'
                type='radio'
                className='advanced-search__input-button'
              />
              <label
                className='advanced-search__input-label'
                htmlFor='registration_term_2'
              >
                От года
              </label>
            </div>

            <div className='advanced-search__input-group'>
              <input
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, selected_registration: 0.5 };
                  });
                }}
                defaultValue='0.5'
                id='registration_term_3'
                name='registration_term'
                type='radio'
                className='advanced-search__input-button'
              />
              <label
                className='advanced-search__input-label'
                htmlFor='registration_term_3'
              >
                От 0.5 года
              </label>
            </div>

            <div className='advanced-search__input-group'>
              <input
                onChange={(e) => {
                  setFormData((prev) => {
                    return { ...prev, selected_registration: 0 };
                  });
                }}
                defaultChecked={url || (searchTextState != '') || false}
                defaultValue='0'
                id='registration_term_4'
                name='registration_term'
                type='radio'
                className='advanced-search__input-button'
              />
              <label
                className='advanced-search__input-label'
                htmlFor='registration_term_4'
              >
                Не важно
              </label>
            </div>
          </div>
        </div>

        {/* Рейтинг */}
        <div className='advanced-search__group'>
          <span className='advanced-search__label'>Рейтинг исполнителя</span>
          <div className='advanced-search__rating-wrapper'>
            <div className='star-rating'>
              <div className='star-rating__wrap'>
                <div className='rating'>
                  <input
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        selected_rating: parseInt(e.target.value)
                      });
                    }}
                    id='rating-5'
                    type='radio'
                    name='rating'
                    defaultValue='5'
                  />
                  <label htmlFor='rating-5'>
                    <i className='fas fa-star'></i>
                  </label>
                  <input
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        selected_rating: parseInt(e.target.value)
                      });
                    }}
                    id='rating-4'
                    type='radio'
                    name='rating'
                    defaultValue='4'
                  />
                  <label htmlFor='rating-4'>
                    <i className='fas fa-star'></i>
                  </label>
                  <input
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        selected_rating: parseInt(e.target.value)
                      });
                    }}
                    id='rating-3'
                    type='radio'
                    name='rating'
                    defaultValue='3'
                  />
                  <label htmlFor='rating-3'>
                    <i className='fas fa-star'></i>
                  </label>
                  <input
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        selected_rating: parseInt(e.target.value)
                      });
                    }}
                    id='rating-2'
                    type='radio'
                    name='rating'
                    defaultValue='2'
                  />
                  <label htmlFor='rating-2'>
                    <i className='fas fa-star'></i>
                  </label>
                  <input
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        selected_rating: parseInt(e.target.value)
                      });
                    }}
                    id='rating-1'
                    type='radio'
                    name='rating'
                    defaultValue='1'
                  />
                  <label htmlFor='rating-1'>
                    <i className='fas fa-star'></i>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Регион */}
        <div className='advanced-search__group'>
          <label
            htmlFor='liveSearchHomeCity'
            className='advanced-search__label'
          >
            Регион
          </label>
          <div className='advanced-search__city-wrapper'>
            {console.log('here', formData)}
            <Select
              multi={false}
              options={cities}
              closeOnSelect={false}
              values={[]}
              color='#fc171e'
              onChange={(value) => {
                let newVal = value[0]?.value;

                setFormData({
                  ...formData,
                  selected_city: newVal
                });
              }}
              placeholder='Выбирете город'
              value
            />
          </div>
        </div>

        {/* Депозит */}
        <div className='advanced-search__group'>
          <p className='advanced-search__label'>Депозит:</p>
          <div className='advanced-search__range-wrapper'>
            <input
              onChange={(e) => {
                console.log(e.target.value);
                setFormData({
                  ...formData,
                  deposit: parseInt(e.target.value)
                });
              }}
              min='1000'
              max='10000'
              name='deposit'
              placeholder='Депозит'
              type='range'
              style={{ width: '100%' }}
            />
            <div className='advanced-search__range-wrapper'>{formData.deposit}</div>
          </div>
        </div>

        {/* Работа через гаранта */}
        <div className='advanced-search__group advanced-search__group_garant'>
          <p className='advanced-search__label advanced-search__label_garant'>
            Работа через гарант сервис
          </p>
          <div className='advanced-search__custom-input-wrapper'>
            <input
              onChange={() => {
                setFormData((prev) => {
                  return { ...prev, guarantor: !prev.guarantor };
                });
              }}
              defaultChecked={formData.guarantor}
              className='advanced-search__custom-input'
              type='checkbox'
              id='liveSearchGarant'
            />
            <label
              className='advanced-search__custom-label'
              htmlFor='liveSearchGarant'
            ></label>
          </div>
        </div>

        {/*  Способы оплаты */}
        <div className='advanced-search__group'>
          <p className='advanced-search__label'>Способы оплаты</p>
          <div className='advanced-search__custom-input-wrapper'>
            {paymentMethods?.map(el =>
              <>
                <input
                  onChange={() => setFormData(prev => ({ ...prev, payment: { ...prev.payment, [el.name]: { status: !prev.payment[el.name], _id: el._id } } }))}
                  defaultChecked={formData.payment[el.name]}
                  name='payment'
                  className='advanced-search__custom-input advanced-search__custom-input_payment'
                  type='checkbox'
                  id={el._id}
                />
                <label
                  className='advanced-search__custom-label advanced-search__custom-label_payment'
                  htmlFor={el._id}>
                  <img src={get_payment_logo(el.name)} alt={el.name} />
                  {/* <span style={{ paddingLeft: 10 }}>{el.name}</span> */}
                </label>
              </>)}
          </div>
        </div>

        <div className='advanced-search__btn-wrapper'>
          <button
            type='submit'
            className='advanced-search__btn-submit default-btn'
          >
            Найти
          </button>
        </div>
      </form>

      <div>
        <Results paymentMethods={paymentMethods} updatedProfilesProps={updatedProfiles} profiles={profiles} ctg={formData.constCtgs} />
      </div>
    </div>
  );
}
