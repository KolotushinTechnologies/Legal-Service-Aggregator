import React, { useContext, useEffect, useState } from 'react'
import { bitcoin, qiwi, visa, yandexWallet } from '../../assets/images/_index'
import { Link } from 'react-router-dom'
import ResultContent from './result-content'
import styled from 'styled-components'

import './index.sass'

const NoSearch = styled.div`
    display: flex;
    justify-content: center;
    font-size: 26px;
    margin: 15px 0;
    text-align: center;
`

const Results = ({ profiles, updatedProfilesProps, ctg, paymentMethods }) => {
  const [updatedProfiles, setUpdatedProfiles] = useState(updatedProfilesProps?.filter(e => e.services.length > 0))

  useEffect(() => {
    setUpdatedProfiles(updatedProfilesProps?.filter(e => e.services.length > 0))
  }, [updatedProfilesProps])

  if (updatedProfiles !== undefined && updatedProfiles?.length > 0) {
    return (
      <div id='results' className='results w-100 active'>
        <div className='results__top'>
          <p className='results__title'>
            Найдено {updatedProfiles.length} исполнителей:
          </p>
          <p className='results__value'>{ctg.length == 0 ? 'по всем категориям' : ctg.map(e => e.value).join(', ')}</p>
        </div>

        <div className='results__table-wrapper'>
          <div className='results__table'>
            <div className='results__header'>
              <div className='results__col results__col_header'>
                Исполнитель
              </div>
              <div className='results__col results__col_header'>Регион</div>
              <div className='results__col results__col_header results__col_center'>
                <button className='results__col-rating-btn'>Рейтинг</button>
              </div>
              <div className='results__col results__col_header results__col_center'>
                Депозит
              </div>
              <div className='results__col results__col_header results__col_guarantor'>
                Гарант
              </div>
              <div className='results__col results__col_header'>
                Способы оплаты
              </div>
              <div className='results__col results__col_header results__col_contact'>
                Ссылка
              </div>
            </div>
            <div className='results__body'>
              {updatedProfiles.length > 0 && updatedProfiles !== null
                ? updatedProfiles.map((item) => (
                  <ResultContent key={item._id} user={item} paymentMethods={paymentMethods} />
                ))
                : null}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (updatedProfiles?.length == 0 && <NoSearch>
      Поиск не дал результатов
    </NoSearch>);
  }
}

export default Results;
