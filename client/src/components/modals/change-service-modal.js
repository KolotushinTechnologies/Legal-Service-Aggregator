import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Select from "react-dropdown-select";
import FroalaEditorComponent from "react-froala-wysiwyg";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import { ModalContext } from "../../context/modal/modalContext";
import Alert from "../alerts/Alert";
import { Editor } from "react-draft-wysiwyg";
import { convertToRaw } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import "./_index.scss";

const ChangeServiceModal = ({
  getServices,
  activeModal,
  setActiveModal,
  title,
  textContent,
  standartCategories,
  id,
  editorState,
  setEditorState,
}) => {
  const [status, setStatus] = useState("");

  // const [editorState, setEditorState] = useState(() =>
  //   EditorState.createWithContent(ContentState.createFromBlockArray(
  //     convertFromHTML(textContent).contentBlocks,

  //   )),
  // );
  // useEffect(() => {
  //   console.log(standartCategories)
  // }, [standartCategories])
  const [formData, setFormData] = useState({
    title: title ? title : "",
    textContent: textContent ? textContent : "",
    categories: [],
    selectedCategories:
      standartCategories.map((e) => {
        return { label: e, value: e };
      }) || [],
    sections: [],
    selectedSection: [{ label: "", value: "" }],
  });

  const [localEditorState, setLocalEditorState] = useState(editorState);

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
      let filtered = [...data.data].map((item) => {
      //   return {
      //     id: item._id,
      //     value: item.name,
      //     label: item.name,
      //     section: item.section,
      //   };
      // });
      // let uniqueSections = [];
      // for (let el of data.data) {
      //   !uniqueSections.includes(el.section) && uniqueSections.push(el.section);
      // }
      // uniqueSections = uniqueSections.map((e) => {
      //   return { label: e, value: e };
      // });
      // console.log(uniqueSections);
      // console.log(filtered);
      // console.log(formData.selectedCategories);
      // console.log(
      //   data.data.find((e) => e.name == formData.selectedCategories[0].value)
      // );
      // let searchSection = data.data.find(
      //   (e) => e.name == formData.selectedCategories[0].value
      // )?.section;
      const searchSection = data.data.find(e => e.categories.map(el => el.name == formData.selectedCategories[0].value)).name
      // setFormData((prev) => {
      //   return {
      //     ...prev,
      //     categories: filtered,
      //     sections: uniqueSections,
      //     selectedSection: [
      //       {
      //         value: searchSection,
      //         label: searchSection,
      //       },
      //     ],
      //   };
      // });
      const filtered = data.data.filter(e => e.categories.length > 0)
      setFormData((prev) => {
        return {
          ...prev,
         // categories: filtered,
          sections: filtered,
          selectedSection: [
            {
              value: searchSection,
              label: searchSection,
            },
          ],
        };
      });
    });
    });
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    console.log(stateToHTML(editorState.getCurrentContent()));
    //alert(editorState.getCurrentContent().getPlainText())
    let categories = [...formData.selectedCategories];
    categories = categories.map((item) => {
      return item.value;
    });
    let categoriesStr;
    console.log(categories);
    for (let i of categories) {
      if (categories.indexOf(i) == categories.length - 1) {
        categoriesStr ? (categoriesStr += i) : (categoriesStr = i);
      } else {
        categoriesStr ? (categoriesStr += `${i};`) : (categoriesStr = `${i};`);
      }
    }
    setEditorState(localEditorState);
    let textContentBlocks = convertToRaw(localEditorState.getCurrentContent())
      .blocks;
    if (categories.length == 0) {
      setAlert({
        title: "Ошибка",
        description: "Выбирите хотя бы одну категорию",
        isActive: true,
      });
    } else if (formData.title.trim() == "") {
      setAlert({
        title: "Ошибка",
        description: "Введите заголовок услуги",
        isActive: true,
      });
    } else if (
      textContentBlocks.filter((blck) => blck.text.trim() == "").length ==
      textContentBlocks.length
    ) {
      setAlert({
        title: "Ошибка",
        description: "Введите контент услуги",
        isActive: true,
      });
    } else {
      axios({
        method: "PUT",
        url: `http://localhost:5000/api/services/${id}`,
        data: {
          title: formData.title,
          textContent: JSON.stringify(
            convertToRaw(localEditorState.getCurrentContent())
          ),
          categories: categoriesStr,
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
            setActiveModal(false);
          }
        })
        .catch((err) => {
          if (err.response) {
            setAlert({
              title: "Ошибка",
              description: "Ошибка, попробуйте позже",
              isActive: true,
            });
            setActiveModal(false);
          }
        });
    }
  };

  return (
    <React.Fragment>
      <form
        onSubmit={onSubmit}
        className={activeModal ? "modal modal_activeServiceEdit" : "modal"}
      >
        <button
          onClick={() => {
            setActiveModal(false);
          }}
          className="modal__close"
          type="button"
        >
          <i className="fas fa-times"></i>
        </button>
        <p className="modal__title">Редактировать услугу</p>
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
              console.log(value);
              console.log(formData.selectedSection);
              setFormData({
                ...formData,
                selectedSection: value,
                filteredCategories: formData.sections.find(e => e.name === value[0]?.value)?.categories,
                selectedCategories:
                  formData.selectedSection &&
                  formData.selectedSection[0].value != value[0].value
                    ? []
                    : formData.selectedCategories,
              });
            }}
            placeholder="Разделы"
            values={formData.selectedSection}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <p>Категории</p>
          <Select
            multi={true}
            options={formData.filteredCategories?.map(e => {
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
            value
          />
        </div>
        <div className="default-group flex-wrap" style={{ width: "100%" }}>
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
          <Editor
            editorState={localEditorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            wrapperStyle={{ width: "100%" }}
            editorStyle={{
              width: "100%",
              border: "1px solid #F1F1F1",
              maxHeight: "30vh",
            }}
            toolbarStyle={{ width: "100%" }}
            onEditorStateChange={(e) => setLocalEditorState(e)}
          />
        </div>

        {/* <FroalaEditorComponent
          tag="textarea"
          onModelChange={(value) => {
            setFormData({ ...formData, textContent: value });
          }}
          model={formData.textContent}
          // value={formData.textContent}
          name="textContent"
          placeholder="dsadsad"
        /> */}
        {formData && console.log(formData)}

        <div className="modal__footer">
          <button type="submit" className="default-btn modal__btn">
            Редактировать
          </button>
        </div>
        <p style={{ textAlign: "center", margin: "10px auto 0 auto" }}>
          {status}
        </p>
      </form>
      <div
        onClick={() => {
          setActiveModal(false);
        }}
        className={
          activeModal ? "modal_overlay modal_overlay_active" : "modal_overlay"
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

export default ChangeServiceModal;
