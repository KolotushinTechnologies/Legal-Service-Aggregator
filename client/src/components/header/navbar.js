import styled from "styled-components";
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './_index.scss';

const navSpan = styled.span`
    background: ${props => props.active == 'active' ? '#fff' : '#f3f3f3'};
    z-index: ${props => props.zindex ? props.zindex : 0};
`
function Navbar({activeNav}) {
    let history = useHistory()
    let url = history.location.pathname

    const [secondActive, setSecondActive] = useState(false)

    useEffect(() => {
        url == '/categories' ? setSecondActive(true) : setSecondActive(false)
        console.log(secondActive)
        console.log(url)
    }, [url])

    useEffect(() => {
        console.log(url)
    })

    useEffect(() => {
        if(url != '/settings' && localStorage.getItem('username') == 'false' && localStorage.getItem('token')){
            history.push('/settings')
            window.location.reload()
        }
    }, [url])
    const SvgPath = () => {
        return (
            <svg className="navigation__svg">
                <clipPath id="my-clip-path" clipPathUnits="objectBoundingBox">
                    <path d="M1,1 L0.952,0.545 C0.924,0.278,0.91,0.144,0.89,0.072 C0.869,0,0.845,0,0.798,0 H0 V1 H1"></path>
                </clipPath>
            </svg>
        );
    };

    return (
        <React.Fragment>
            <nav className="navigation" style={{background: activeNav ? '#f3f3f3' : '#fff'}}>
                
                <Link to="/search" className={activeNav ? "navigation__item" : "navigation__item navigation__item_active"}>
                    <navSpan active={!activeNav? 'active' : 'common'} style={{zIndex: 20}} className="navigation__link">Поиск</navSpan>
                </Link>
                
                <Link to="/categories"  className={activeNav ? "navigation__item navigation__item_active" : "navigation__item"}>
                    <navSpan active={activeNav ? 'active' : 'common'} style={{zIndex: 10}} className="navigation__link">Все разделы</navSpan>
                </Link>
                
                
                {/* <Link to="/search" className={secondActive ? "navigation__item" : "navigation__item navigation__item_active"} onClick={() => setSecondActive(false)}>
                    <navSpan active={!secondActive? 'active' : 'common'} className="navigation__link">Поиск</navSpan>
                </Link>
                
                <Link to="/categories"  className={secondActive ? "navigation__item navigation__item_active" : "navigation__item"} onClick={() => setSecondActive(true)}>
                    <navSpan active={secondActive ? 'active' : 'common'} className="navigation__link">Все разделы</navSpan>
                </Link> */}

                <SvgPath />
            </nav>
        </React.Fragment>
    );
}

export default Navbar;