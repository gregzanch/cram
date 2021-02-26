import React, {useState} from 'react';
import {useAppStore} from '../store'
import { pickProps } from '../common/helpers';
import { NavBarComponent } from './NavBarComponent';

const ProjectName = () => {
  const { set, projectName } = useAppStore(state=>pickProps(["projectName", "set"], state));
  return (
    <input type="text" onChange={(e)=>{
      set((state)=>{
        state.projectName = e.currentTarget.value
      });
    }} value={projectName} />
  );
}


type AppProps = {}

export default function App2(props: AppProps){
  return (
    <div>
      <NavBarComponent />
      <ProjectName />
    </div>
  )
}