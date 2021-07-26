import styled from "styled-components";

const Content = styled.div`
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  flex-direction: column;
`;
const Back = styled.div`
  padding-left: 9vw;
  cursor: pointer;
`;
const Underline = styled.span`
  text-decoration: underline;
`;

const Title = styled.h2`
  font-size: 50px;
  font-weight: 900;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media(max-width: ${p => p.theme.breakpoints.SMdesktop}) {
    font-size: 22px;
  }
`;

const ContactsForm = styled.div`
  font-size: 20px;
  display: flex;
  align-items: center;
`;

const InfoContact = styled.span`
  margin: 0 0 0 5px;
`;

const RulesHeader = styled.h4`
  font-size: 20px;
  font-weight: 600;
`;

const DescriptionRule = styled.p`
  font-size: 14px;
`;

export {
  Content,
  Back,
  Underline,
  Title,
  ContactsForm,
  InfoContact,
  RulesHeader,
  DescriptionRule,
};
