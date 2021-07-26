import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Select from "react-dropdown-select";
import FroalaEditorComponent from "react-froala-wysiwyg";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "./_index.scss";
import { ModalContext } from "../../context/modal/modalContext";
import Alert from "../alerts/Alert";
import { Editor } from 'react-draft-wysiwyg';
import { convertToRaw, EditorState } from 'draft-js';

const AddServiceModal = ({ getServices }) => {
  const { modalService, setModalService } = useContext(ModalContext);

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );

  const { token } = localStorage.token;
  const [status, setStatus] = useState("");

  const [alert, setAlert] = useState({
    title: "",
    description: "",
    isActive: false,
  });

  const onChangeAlert = (active) => {
    setAlert({
      ...alert,
      isActive: active,
    });
  };

  const [formData, setFormData] = useState({
    title: "",
    textContent: "",
    categories: [],
    filteredCategories: [],
    selectedCategories: [],
    sections: [],
    selectedSection: [{label: "", value: ""}]
  });

  const onChange = (e) => {
    e.preventDefault();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Получить все категории
  useEffect(() => {
    axios({
      method: "GET",
      url: "http://localhost:5000/api/sections",
    }).then((data) => {
      
      // let filtered = [...data.data].map((item) => {
      //   return {
      //     id: item._id,
      //     value: item.name,
      //     label: item.name,
      //     section: item.section
      //   };
      // });
      // let uniqueSections = []
      // for(let el of data.data){
      //   !uniqueSections.includes(el.section) && uniqueSections.push(el.section)
      // }
      // uniqueSections = uniqueSections.map(e => {
      //   return {label: e, value: e}
      // })
      // console.log(uniqueSections)
      // console.log(filtered)
      const filtered = data.data.filter(e => e.categories.length > 0)
      setFormData((prev) => {
        return {
          ...prev,
         // categories: filtered,
          sections: filtered
        };
      });
    });
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    let categories = [...formData.selectedCategories];
    categories = categories.map((item) => {
      return item.value;
    });
    let textContentBlocks = convertToRaw(editorState.getCurrentContent()).blocks
    if (categories.length == 0){
      setAlert({
        title: "Ошибка",
        description: "Выбирите хотя бы одну категорию",
        isActive: true,
      })
    } else if (formData.title.trim() == ''){
      setAlert({
        title: "Ошибка",
        description: "Введите заголовок услуги",
        isActive: true,
      })
    } else if (textContentBlocks.filter(blck => blck.text.trim() == '').length == textContentBlocks.length) {
      setAlert({
        title: "Ошибка",
        description: "Введите контент услуги",
        isActive: true,
      })
    } else {
      categories = categories.join(';');
      axios({
        method: "POST",
        url: "http://localhost:5000/api/services",
        data: {
          title: formData.title.trim(),
          textContent: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
          categories,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.token,
        },
      })
      .then((data) => {
        if (data.status === 200) {
          setAlert({
            title: "Успешно добавлено",
            description: "Успешно добавлено",
            isActive: true,
          });
          getServices();
          setFormData(prev => {
            return {
              ...prev,
              title: "",
              textContent: "",
              filteredCategories: [],
              selectedCategories: [],
              selectedSection: [{label: "", value: ""}]
            }
          })
          setModalService(false);
          setEditorState(() => EditorState.createEmpty())
        }
      })
      .catch((err) => {
        if (err.response) {
          setAlert({
            title: "Ошибка",
            description: "Ошибка, попробуйте позже",
            isActive: true,
          });
          setModalService(false);
        }
      });
    }
  };

  return (
    <React.Fragment>
      <form
        onSubmit={onSubmit}
        className={modalService ? "modal modal_activeServiceEdit" : "modal"}
      >
        <button
          onClick={() => {
            setModalService(false);
          }}
          className="modal__close"
          type="button"
        >
          <i className="fas fa-times"></i>
        </button>
        <p className="modal__title">Добавить услугу</p>
        <div style={{ marginBottom: 15 }}>
          <p>Разделы</p>
          <Select
            options={formData.sections.map(e => {
              return {
                label: e.name,
                value: e.name,
              }
            })}
            closeOnSelect={true}
            name="Разделы"
            color="#fc171e"
            onChange={(value) => {
              console.log(value)
              console.log(formData.selectedSection)
              setFormData({
                ...formData,
                selectedSection: value,
                filteredCategories: formData.sections.find(e => e.name === value[0]?.value)?.categories,
                selectedCategories: formData.selectedSection && formData.selectedSection[0].value != value[0].value ? [] : formData.selectedCategories
              });
            }}
            placeholder="Разделы"
            values={formData.selectedSection}
          />
        </div>

        {formData.selectedSection && formData.selectedSection[0].value != '' && <div style={{ marginBottom: 15 }}>
          <p>Категории</p>
          <Select
            multi={true}
            options={formData.filteredCategories.map(e => {
              return {
                label: e.name,
                value: e.name,
              }
            })}
            closeOnSelect={false}
            name="Категории"
            values={[...formData.selectedCategories]}
            color="#fc171e"
            onChange={(value) => {
              setFormData({
                ...formData,
                selectedCategories: value,
              });
            }}
            placeholder="Категории"
            
          />
        </div>}
        <div className="default-group flex-wrap">
          <p className="default-group__title">Заголовок</p>
          <input
            onChange={(e) => {
              onChange(e);
            }}
            name="title"
            className="default-group__input"
            placeholder="Заголовок"
            type="text"
            value={formData.title}
          />
        </div>

        <Editor
            editorState={editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            wrapperStyle={{width: '100%'}}
            editorStyle={{width: '100%', border: '1px solid #F1F1F1', maxHeight: '30vh'}}
            toolbarStyle={{width: '100%'}}
            onEditorStateChange={e => setEditorState(e)}
            
          />
         

        <div className="modal__footer">
          <button type="submit" className="default-btn modal__btn">
            Создать
          </button>
        </div>
        <p style={{ textAlign: "center", margin: "10px auto 0 auto" }}>
          {status}
        </p>
      </form>
      <div
        onClick={() => {
          setModalService(false);
        }}
        className={
          modalService ? "modal_overlay modal_overlay_active" : "modal_overlay"
        }
      ></div>
      <Alert
        onChangeAlert={onChangeAlert}
        title={alert.title}
        description={alert.description}
        isActive={alert.isActive}
      />
    </React.Fragment>
  );
};

export default AddServiceModal;
