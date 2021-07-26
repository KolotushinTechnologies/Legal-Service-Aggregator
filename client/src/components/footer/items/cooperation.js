import React from "react";
import { useHistory } from "react-router-dom";
import {
  Content,
  Back,
  Underline,
  Title,
  ContactsForm,
  InfoContact,
} from "./styles/style";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";
import PhoneIcon from "@material-ui/icons/Phone";

const Cooperation = () => {
  const history = useHistory();

  return (
    <>
      <Back onClick={() => history.goBack()}>
        {"<"}
        <Underline>Вернуться назад</Underline>
      </Back>
      <Content>
        <Title>Сотрудничество</Title>
        <div>
          <ContactsForm>
            <AlternateEmailIcon />{" "}
            <InfoContact>lawyermaster@info.com</InfoContact>
          </ContactsForm>

          <ContactsForm>
            <PhoneIcon />
            <InfoContact>+7 495 222 33 66</InfoContact>
          </ContactsForm>
        </div>
      </Content>
    </>
  );
};
export default Cooperation;
