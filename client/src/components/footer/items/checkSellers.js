import React from "react";
import { useHistory } from "react-router-dom";
import { Content, Back, Underline, Title } from "./styles/style";

const CheckSellers = () => {
  const history = useHistory();

  return (
    <>
      <Back onClick={() => history.goBack()}>
        {"<"}
        <Underline>Вернуться назад</Underline>
      </Back>
      <Content>
        <Title>Проверка продавцов</Title>
        <div style={{ whiteSpace: 'pre-line' }}>
          {"Проверка продавцов - это система направленная на выбор безопасного и надежного продавца.\n"}
          {"Нашли продавца на нашей площадке и сомневаетесь в его репутации?\n"}
          {"Окажем комплексную услугу:\n"}
          {"- пробив основной информации о продавце\n"}
          {"- выявление сферы деятельности\n"}
          {"- проверка компетентности в заявленной сфере деятельности\n"}
        </div>
      </Content>
    </>
  );
};
export default CheckSellers;
