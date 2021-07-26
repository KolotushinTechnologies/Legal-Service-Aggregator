import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ChangeServiceModal } from "../modals/_index";
import FroalaEditorView from "react-froala-wysiwyg/FroalaEditorView";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw } from "draft-js";
import "./_index.scss";
import { Link } from "@material-ui/core";
import { useHistory } from "react-router-dom";

const Background = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  z-index: 2;
`;
const Modal = styled.div`
  z-index: 3;
  position: fixed;
  top: 15%;
  right: 50%;
  transform: translate(50%, 0);
  max-width: 400px;
  height: auto;
  border: 1px solid #c0c0c0;
  border-radius: 10px;
  background-color: #fff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 55px 45px;
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

const LockedService = styled.p`
  text-align: center;
  font-size: 40px;
  height: 0;
`;
const ContentLink = styled.div`
  textdecoration: none;
`;

const ProfileService = ({
  getServices,
  id,
  title,
  textContent,
  categories = ["Категория 1", "Категория 2", "Категория 3"],
  locked,
  deleteService,
}) => {
  const [activeModal, setActiveModal] = useState(false);
  const [confirmDeleteService, setConfirmDeleteService] = useState(false);

  const closeDeleteService = () => {
    setConfirmDeleteService(false);
  };

  const confirmDeleteServiceId = () => {
    if (deleteService) {
      deleteService(id);
      setConfirmDeleteService(false);
    }
  };

  const [editorState, setEditorState] = useState(() =>
    //json test
    /^[\],:{}\s]*$/.test(
      textContent
        .replace(/\\["\\\/bfnrtu]/g, "@")
        .replace(
          /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
          "]"
        )
        .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
    )
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(textContent)))
      : EditorState.createEmpty()
  );

  const history = useHistory();

  return (
    <React.Fragment>
      {locked && <LockedService>Услуга заблокирована</LockedService>}
      <form
        className="profile-services__item"
        style={locked ? { opacity: ".1" } : {}}
      >
        <ContentLink onClick={() => history.push(`/service/${id}`)}>
          <p className="profile-services__title">{title}</p>
          <p className="profile-services__description">
            <div id="editor">
              {/* <FroalaEditorView
              disabled
              className="editor__froala"
              model={textContent}
            /> */}
              <Editor
                editorState={editorState}
                toolbarClassName="toolbarClassName"
                wrapperClassName="wrapperClassName"
                editorClassName="editorClassName"
                wrapperStyle={{ width: "100%" }}
                editorStyle={{ width: "100%" }}
                toolbarStyle={{ display: "none" }}
                readOnly={true}
                onEditorStateChange={(e) => setEditorState(e)}
              />
            </div>
          </p>
          <p className="profile-services__categories">
            {categories?.map(
              (category, indx) =>
                category && (
                  <span className="category__list" key={indx}>
                    {category}
                  </span>
                )
            )}
          </p>
        </ContentLink>
        <div className="profile-services__buttons">
          {!locked && (
            <>
              <button
                onClick={() => {
                  setConfirmDeleteService(true);
                }}
                type="button"
                className="profile-services__close"
              >
                <i className="fas fa-times"></i>
              </button>
              {confirmDeleteService && (
                <>
                  <Background onClick={closeDeleteService} />
                  <Modal>
                    <Row className="title">
                      <div className="modalTitle">Удалить услугу</div>
                      <div className="cross" onClick={closeDeleteService}>
                        <i className="fas fa-times" />
                      </div>
                    </Row>
                    <div className="message">
                      <div>
                        <div>Удалить услугу?</div>
                      </div>
                    </div>
                    <Row className="btns">
                      <div onClick={closeDeleteService} className="close">
                        Отмена
                      </div>
                      <input
                        className="confirm"
                        type="button"
                        onClick={() => {
                          confirmDeleteServiceId();
                        }}
                        value="Удалить"
                      />
                    </Row>
                  </Modal>
                </>
              )}
              <button
                onClick={() => {
                  setActiveModal(true);
                }}
                type="button"
                className="profile-services__edit"
              >
                <i className="fas fa-pen"></i>
              </button>
            </>
          )}
        </div>
      </form>
      <ChangeServiceModal
        title={title}
        textContent={textContent}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        standartCategories={categories}
        id={id}
        getServices={getServices}
        editorState={editorState}
        setEditorState={setEditorState}
      />
    </React.Fragment>
  );
};

export default ProfileService;
