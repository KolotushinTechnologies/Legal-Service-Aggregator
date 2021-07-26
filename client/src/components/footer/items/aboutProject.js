import React from "react";
import { useHistory } from "react-router-dom";
import { Content, Back, Underline, Title } from "./styles/style";

const AboutProject = () => {
  const history = useHistory();

  return (
    <>
      <Back onClick={() => history.goBack()}>
        {"<"}
        <Underline>Вернуться назад</Underline>
      </Back>
      <Content>
        <Title>О проекте</Title>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
        dapibus, urna et interdum bibendum, mi lectus imperdiet mauris, id
        tincidunt metus urna vel nisl. Aliquam euismod libero turpis, lobortis
        aliquam tortor elementum ac. Sed aliquet metus nec auctor faucibus.
        Nullam sed viverra purus. Donec quis porttitor velit, vel lacinia nibh.
        Suspendisse et mauris purus. Nam venenatis dignissim vestibulum. Donec
        eget urna pellentesque, viverra mauris sed, fringilla dolor. Nulla
        facilisi. Maecenas ac felis at purus facilisis iaculis ut sed est.
        Curabitur nec lacus posuere, auctor enim lobortis, tristique turpis.
        Suspendisse potenti. Aenean et elementum leo, nec ultricies nulla. Nunc
        sed eros placerat, ornare felis quis, finibus lorem. Integer elit diam,
        tristique a dui in, dapibus interdum nisl. Quisque erat magna, rhoncus
        eget faucibus at, placerat non ligula. In efficitur ut velit vel
        laoreet. In semper, leo et sodales condimentum, purus sem venenatis ex,
        nec mollis massa ante quis ex. Nullam non nulla quis leo vehicula
        commodo quis non nisl. In eu risus non lectus scelerisque imperdiet quis
        vitae est. Phasellus a fermentum nisl, vitae blandit libero. Praesent id
        eleifend ante. Aliquam dui elit, sagittis et nibh vel, malesuada dictum
        dui. Sed vitae nibh vel lacus egestas pellentesque. Vivamus cursus neque
        ut risus ornare lacinia. Suspendisse sagittis tortor id cursus blandit.
        Sed scelerisque gravida mi id commodo. Vivamus eu blandit velit, in
        pellentesque nisl. Quisque finibus facilisis purus, dignissim dapibus
        sem. Pellentesque habitant morbi tristique senectus et netus et
        malesuada fames ac turpis egestas. Nunc ornare faucibus purus eget
        fringilla. Integer ut arcu velit. Duis dignissim metus in risus
        tincidunt accumsan. Proin dictum ultricies tincidunt. Maecenas
        condimentum cursus elit, fermentum fermentum leo. Sed et condimentum
        ligula. Donec scelerisque accumsan eros, sed vehicula metus accumsan et.
        Curabitur quis porttitor arcu, ac molestie nisi. Proin tincidunt purus
        id elit porta tempus. Mauris in ante eu enim gravida viverra id et
        risus. Vivamus rhoncus auctor viverra. Ut rhoncus risus at luctus
        pellentesque. Vivamus egestas eros id lacus venenatis, vitae bibendum mi
        iaculis. Nulla pretium vestibulum ante ac efficitur. Donec interdum
        blandit dolor, in aliquam felis feugiat non. Cras arcu urna.
      </Content>
    </>
  );
};
export default AboutProject;
