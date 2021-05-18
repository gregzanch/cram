import React from "react";
import styled from 'styled-components';

const EditorContainer = styled.div`
    /* width: calc(100% - 1em); */
    /* height: calc(100% - 1em); */
    /* margin: .5em .5em; */
    height: 100%;
    width: 100%;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
`;

EditorContainer.defaultProps = {
  id: "editor-container"
};

export default EditorContainer;

