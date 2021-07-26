import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Categories.sass'

const CategoriesPage = ({setActiveNav}) => {
  const [data, setData] = useState()

  useEffect(() => {
    !data && getSections()
  }, [])

  useEffect(()=>{
    setActiveNav(true)
    return(() => setActiveNav(false))
  }, [])

  const getSections = async() => {
    const res = await Axios({
      url: 'http://localhost:5000/api/sections',
      method: 'GET',
      headers: {
        Authorization: localStorage.token,
      },
    })
    console.log(res.data)
    setData(res.data)
  }
  return (<>
    <div className="categories-page">
      <div className="categories-page__container">
        <p className="categories-page__title">Все разделы</p>

        <div className="categories-page__lists">
          {data?.map(e => {
            if ( e.categories.length > 0 ) return (
              <ul className="categories-page__list">
                <li className="categories-page__item categories-page__item_title">{e.name}</li>
                {e.categories?.map(ctg => {
                  return (
                    <li className="categories-page__item_inner" id={ctg._id}>
                      <Link to={`/search/${ctg._id}`} className="categories-page__link_inner" href="#!">{ctg.name}</Link>
                    </li>
                  )
                })}
              </ul>
            )
          })}
        </div>
      </div>
    </div>
  </>)
};

export default CategoriesPage;