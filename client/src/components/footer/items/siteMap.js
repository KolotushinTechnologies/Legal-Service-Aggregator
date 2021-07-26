import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {Content, Back, Underline, Title} from "./styles/style"

const MapBody = styled.div`
    display: flex;
    flex-direction: column;
`
const MapItem = styled(Link)`
    text-decoration: none;
    color: #333;
    margin-left: ${props => props.margin ? `${props.margin}px` : 0};
    width: max-content;
`

const SiteMap = () => {
    const history = useHistory()

    const [data, setData] = useState()
    // const [sections, setSections] = useState()

    useEffect(() => {
      !data && getSections()
    })

    // const getSections = async() => {
    //   let ctg = await getCategories()

    //   let uniqueSections = []
    //   for(let el of ctg){
    //     !uniqueSections.includes(el.section) && uniqueSections.push(el.section)
    //   }
    //   console.log(uniqueSections)

    //   setSections(uniqueSections.map(e => {
    //     return({ section: e, categories: ctg.filter(flt => flt.section == e)})
    //   }))

    // }
    const getSections = async() => {
      const res = await axios({
        url: 'http://localhost:5000/api/sections',
        method: 'GET',
        headers: {
          Authorization: localStorage.token,
        },
      })
      setData(res.data)
    }
    return(<>
        <Back onClick={() => history.goBack()}>
            {'<'}
            <Underline>
              Вернуться назад
            </Underline>
        </Back>
        <Content>
            <Title>
              Карта сайта
            </Title>
            <MapBody>
                <MapItem to={'/search'}>
                  Расширенный поиск
                </MapItem> 
                <MapItem  to={'/categories'}>
                  Все разделы
                </MapItem> 
                {data?.map(e => {
                  if (e.categories.length > 0) return(<>
                    <MapItem margin='20'>
                      {e.name}
                    </MapItem>
                    {e.categories?.map(ctg => {
                      return (
                        <MapItem margin='40' to={`/search/${ctg._id}`}>
                          {ctg.name}
                        </MapItem>
                      )})
                    }
                  </>)})}
                <MapItem to={'/guarantorService'}>
                  Гарант сервис
                </MapItem> 
                <MapItem to={'/checkSellers'}>
                  Проверка продавцов 
                </MapItem> 
                <MapItem to={'/news'}>
                  Новости
                </MapItem> 
                <MapItem to={'/cooperation'}>
                  Сотрудничество  
                </MapItem>
                <MapItem to={'/aboutProject'}>
                  О проекте
                </MapItem>
                <MapItem to={'/rulesProject'}>
                  Правила проекта
                </MapItem>  
            </MapBody>
        </Content>
    </>)
}
export default SiteMap