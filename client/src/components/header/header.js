import React from 'react'
import { Link } from 'react-router-dom'
import { Omnibox, Cabinet } from './_index'
import styled from 'styled-components'

const HeaderContainer = styled.div`
    width: 100%;
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 15px;
    margin-bottom: 50px;
    position: relative;
    display: flex;
    margin-top: 25px;
    @media (max-width: 768px) {
        flex-direction: column;
    }
`
const SearchSector = styled.div`
    width: 100%;
    flex-direction: row;
    display: flex;
    align-items: center;
`

const Header = ({ setSearchTextState, searchTextState, transOnSub }) => {
    return (
        <HeaderContainer>
            <Link to='/' className='header__title'>
                Logo
            </Link>
            <SearchSector>
                <Omnibox setSearchTextState={setSearchTextState} searchTextState={searchTextState} transOnSub={transOnSub} />
                <Cabinet />
            </SearchSector>
        </HeaderContainer>
    )
}

export default Header