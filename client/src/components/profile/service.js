import Axios from "axios";
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom";
import { compact, identity } from "lodash";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { AuthModal, ForgotModal, RegistrationModal } from "../modals/_index";
import { ModalContext } from "../../context/modal/modalContext";
import styled from "styled-components";
import Comment from "./comment";
import Alert from "../alerts/Alert";

import Breadcrumbs from '@material-ui/core/Breadcrumbs';

import ServiceContent from './service-item'
import { Link, useLocation } from 'react-router-dom'

const Main = styled.div`
  max-width: 1140px;
  width: 100%;
  margin: 0 auto;
`
const ServiceContentContainer = styled.div`
   @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    img {
      width: auto !important;
      height: auto !important;
      max-width: 100% !important;
    }
  }
`

const Service = ({ isSignedIn }) => {
  const history = useHistory()

  const url = history.location.pathname.split("/service/")[1].split("/page/")[0];
  const pageUrl = history.location.pathname.split('/page/')[1]
  const focusTo = new URLSearchParams(useLocation().search).get('focusTo') || null
  const answerTo = new URLSearchParams(useLocation().search).get('answerTo') || null

  const [myProfileData, setMyProfileData] = useState()
  const [serviceData, setServiceData] = useState()

  useEffect(() => {
    getService()
  }, [url])

  useEffect(() => {
    !myProfileData && isSignedIn && getMyProfile()
  }, [])

  const getMyProfile = async () => {
    const myProfile = await Axios({
      url: `http://localhost:5000/api/users/profile`,
      method: "GET",
      headers: {
        Authorization: localStorage.token,
      },
    });

    console.log(myProfile.data);
    setMyProfileData(myProfile.data);
  };

  const getService = async () => {
    const res = await Axios({
      method: "GET",
      url: `http://localhost:5000/api/services/${url}`,
    });
    res && console.log(res.data);
    res && setServiceData(res.data);
  };

  return (
    <Main>
      {serviceData && (<>
        <Breadcrumbs style={{ marginBottom: '25px' }}>
          <Link to={'/'}>Главная</Link>
          <Link to={'/search'}>Поиск</Link>
          <Link to={`/search/user/${serviceData?.user?._id}`}>{`Пользователь ${serviceData?.user?.username ? serviceData?.user?.username : '" "'}`}</Link>
          <div>{serviceData.title}</div>
        </Breadcrumbs>
        <ServiceContentContainer>
          <ServiceContent
            key={serviceData._id}
            title={serviceData.title}
            serviceId={serviceData._id}
            comments={serviceData.comments}
            url={url}
            pageUrl={pageUrl}
            focusTo={focusTo}
            isSignedIn={isSignedIn}
            myProfileData={myProfileData}
            textContent={
              <Editor
                editorState={
                  //json test
                  /^[\],:{}\s]*$/.test(
                    serviceData.textContent
                      .replace(/\\["\\\/bfnrtu]/g, "@")
                      .replace(
                        /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                        "]"
                      )
                      .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
                  )
                    ? EditorState.createWithContent(
                      convertFromRaw(JSON.parse(serviceData.textContent))
                    )
                    : EditorState.createEmpty()
                }
                toolbarClassName="toolbarClassName"
                wrapperClassName="wrapperClassName"
                editorClassName="editorClassName"
                wrapperStyle={{ width: "100%" }}
                editorStyle={{ width: "100%" }}
                toolbarStyle={{ display: "none" }}
                readOnly={true}
              />
            }
            categories={serviceData.categories}
            answerTo={answerTo}
          />
        </ServiceContentContainer>
      </>)}
    </Main>
  );
};

export default Service;
