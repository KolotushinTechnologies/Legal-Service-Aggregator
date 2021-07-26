import React, { useEffect, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './_index.scss';
import styled from "styled-components";
import axios from 'axios';

const SearchPlace = styled.input`
    background-color: #f3f3f3;
    border-top-left-radius: 4px;
    border-bottom-left-radius: ${p => p.focused ? '0px' : '4px'};
    transition: all 0.3s ease;
    border-top: 1px solid #f3f3f3;
    border-bottom: 1px solid #f3f3f3;
    border-left: 1px solid #f3f3f3;
    padding: 10px 20px;
    border: 0;
    outline: 0;
    font-size: 14px;
    font-weight: 600;
    width: calc(100% - 100px);
`

const Hints = styled.div`
    position: absolute;
    height: 266px;
    border-radius: 0 0 4px 4px;
    border: 1px solid #787878;
    border-top: none;
    top: 6px;
    width: 100%;
    margin-top: 33px;
    background: #fff;
`

const Controls = styled.div`
    display: flex;
    align-items: stretch;
    flex-basis: 100px;
    margin-left: auto;
    border-bottom-right-radius: ${p => p.focused ? '0px' : '4px'};
`

const Apply = styled.div`
    width: 50px;
    padding: 0;
    border: none;
    text-decoration: none;
    background-color: #f3f3f3;
    border-top-right-radius: 4px;

    border-left: 0;
    transition: all 0.3s ease;
    border-top: 1px solid #f3f3f3;
    border-bottom: 1px solid #f3f3f3;
    border-right: 1px solid #f3f3f3;
    transition: all 0.3s ease;
    align-items: center;
    justify-content: center;
    display: flex;
    color: #333;
    cursor: pointer;
    border-bottom-right-radius: ${p => p.focused ? '0px' : '4px'};
    ${p => p.focused && `
        border-top-color: #787878;
        border-bottom-color: #787878;
        border-right-color: #787878;
    `}
`

const SItem = styled(Link)`
    border-bottom: 1px solid #787878;
    height: 38px;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0 20px;
    text-decoration: none;
    color: #000;
    &:hover{
        background-color: #fc171e;
        color: #fff;
    }
    &:last-child{
        border: none;
    }
`

const SearchSection = styled.div`
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    width: 85%;
    z-index: 2;
    background: #fff;
    border-radius: 4px;
    @media(max-width: ${p => p.theme.breakpoints.tablet}) {
        width: calc(100% - 30px);
    }
    ${p => p.focused && `
        transition: all 0.3s ease;
        border: 1px solid #000;
    `}
`

const SearchItem = ({ label, url, _id }) => {

    return (<SItem to={url}>
        {label}
    </SItem>)
}

const Omnibox = ({ setSearchTextState, transOnSub }) => {
    useEffect(() => {
        console.log(transOnSub)
    }, [transOnSub])
    const [term, setTerm] = useState()
    const [focused, setFocused] = useState(false)
    const [searchData, setSearchData] = useState([])

    const history = useHistory()

    history.listen(location => location.pathname != '/search' && (document.querySelector('.omnibox__input').value = '') && setSearchTextState())

    const searchText = useRef('')

    const onBlur = (e) => {
        e.preventDefault();
        //setFocused(prev => !prev)
    }

    const onFocusElement = (e) => {
        e.preventDefault();
        setFocused(true)
    }

    const onChangeInput = e => {
        e.preventDefault()
        console.log(searchText.current.value)
        setTerm(searchText.current.value)
        getSearchData(searchText.current.value)
        !searchText.current.value && setSearchData([])
    }

    const onBlurInput = e => {
        e.preventDefault()
        setTimeout(() => setFocused(false), 250)
        console.log('liv')
    }

    const getSearchData = async (text) => {
        if (text && text != '') {
            const res = await axios({
                url: `http://localhost:5000/api/search/${text}`,
                method: "GET",
            })
            if (res) {
                console.log(tranformSearch(res.data.message))
                setSearchData(tranformSearch(res.data.message))
            }
        } else {
            setSearchData([])
        }
    }

    const tranformSearch = el => {
        let transform_arr = []
        if (el.categories !== undefined) transform_arr.push(...el.categories.map(e => ({
            label: e.name,
            _id: e._id,
            url: `/search/${e._id}`,
            type: 'category'
        })))
        if (el.services !== undefined) transform_arr.push(...el.services.map(e => ({
            label: e.title,
            _id: e._id,
            url: `/service/${e._id}`,
            type: 'service'
        })))
        if (el.services !== undefined) transform_arr.push(...el.users.map(e => ({
            label: e.username,
            _id: e._id,
            url: `/user/${e._id}`,
            type: 'user'
        })))

        if (history.location.pathname == '/search') return transform_arr.slice(0, 9)
        return [...transform_arr.slice(0, 8), {
            label: 'Перейти в расширенный поиск',
            _id: 'last',
            url: '/search'
        }]
    }
    return (<SearchSection onBlur={onBlurInput} focused={focused}>
        <div onFocus={onFocusElement} onClick={onFocusElement} className={'header__omnibox omnibox omnibox_default'}>
            <SearchPlace onInput={onChangeInput} ref={searchText}
                onChange={() => history.location.pathname == '/search' && setSearchTextState(searchText.current.value)}
                name="omniboxInput"
                type="text"
                autoComplete="off"
                focused={focused}
                className="omnibox__input" />
            <Controls focused={focused}>
                <Link to="/search" className="omnibox__settings"><i className="fas fa-sliders-h"></i></Link>
                <Apply onClick={() => {
                    if (history.location.pathname != '/search') {
                        if (searchText.current.value && searchText.current.value.length > 0) {
                            history.push('/search')
                            setSearchTextState(searchText.current.value)
                        }
                    } else {
                        //transOnSub()
                        document.querySelector('.advanced-search__btn-submit').click()
                    }
                }}
                >
                    <i className="fas fa-search" />
                </Apply>
            </Controls>

        </div>

        {focused && searchText.current.value != '' && searchData.map(e => <SearchItem {...e} />)}
    </SearchSection>);
}

export default Omnibox