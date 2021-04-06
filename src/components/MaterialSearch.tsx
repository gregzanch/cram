import React, { useMemo, useRef, useState } from 'react';
import Surface from '../objects/surface';
import Messenger, { emit } from '../messenger';
import { AcousticMaterial } from '../db/acoustic-material';
import { uuid } from 'uuidv4';
import { absorptionGradient } from './AbsorptionGradient';
import { clamp } from '../common/clamp';
import { Drawer, Icon, Position } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';
import ObjectView from './object-view/ObjectView';
import Container from '../objects/container';
import { useAppStore, useContainer, useMaterial } from '../store';
import { pickProps } from '../common/helpers';

import "./MaterialSearch.css";



const min = (a: number, b: number) => (a < b ? a : b);

type MaterialDrawerListItemProps = {
  item: AcousticMaterial;
}

const MaterialDrawerListItem = ({ item }: MaterialDrawerListItemProps) => {
  const {set, selectedMaterial } = useMaterial(state => pickProps(["set", "selectedMaterial"], state));

  const onClick = () => set(store=>{
    store.selectedMaterial = item.uuid
  })

  return (
    <div 
      className={`material_drawer-list_item-${selectedMaterial===item.uuid?"selected":"container"}`} 
      onClick={onClick}>
      <div className="material_drawer-list_item-material">{item.material}</div>
      <div className="material_drawer-list_item-right">
        <div className="material_drawer-list_item-absorption" style={{background: `${absorptionGradient(item.absorption)}`}} />
      </div>
    </div>
  )
};



const Absorption = ({absorption}: {absorption: AcousticMaterial["absorption"]}) => {
  return (
    <div className={"material_drawer-display-material_absorption"}>
      {
        Object.keys(absorption).map((frequency) => (
          <div key={`${frequency}-${absorption[frequency]}`}>
            <div className="material_drawer-display-material_absorption-header">{frequency}Hz</div>
            <div className="material_drawer-display-material_absorption-value">{absorption[frequency]}</div>
          </div>
        ))
      }
    </div>
  )
}

const MaterialProperties = () => {

  const {selectedMaterial, material} = useMaterial(state => ({
    selectedMaterial: state.selectedMaterial,
    material: state.materials.get(state.selectedMaterial)
  }));
  return material ? (
    <div>
    <div className={"material_drawer-display-material_name"}><span>{material.name}</span></div>
    <div className={"material_drawer-display-material_material"}>
      <span>{material.material}</span>
      <span className="muted-text" style={{ textAlign: "right" }}>{material.uuid}</span>
    </div>
    <Absorption absorption={material.absorption}/>
  </div>
  ) : <div>Nothing Selected</div>
}

const MaterialList = () => {
  const { bufferLength, query, search} = useMaterial(state=>pickProps(["bufferLength", "query", "search"], state));
  const filteredItems = useMemo(()=>search(query), [query]);
  return (
    <div className="material_drawer-list" >
      {filteredItems.slice(0, min(bufferLength, filteredItems.length)).map(item => <MaterialDrawerListItem item={item} key={`item-${item.uuid}`} />)}
    </div>
  );
}

const MaterialAssignButton = () => {
  const selectedSurfaces = useContainer(state=>[...state.selectedObjects].filter(x=>x.kind==="surface")) as Surface[];
  const selectedMaterial = useMaterial(state => state.materials.get(state.selectedMaterial));
  return (
    <div className={"material_drawer-display-assign_button"}>
      <Button
        intent="success"
        text="assign"
        icon="tick"
        disabled={selectedSurfaces.length == 0}
        onClick={(e) => {
          if(selectedMaterial){
            emit("ASSIGN_MATERIAL", {
              material: selectedMaterial as AcousticMaterial,
              target: selectedSurfaces
            });
          }
        }}
      />
    </div>
  )
}

export const MaterialSearch = () => {
  const listref = useRef<HTMLDivElement>();
  const listScroll = 0;
  const { bufferLength, query, search, set } = useMaterial(state=>pickProps(["bufferLength", "query", "search", "set"], state));
  const {materialDrawerOpen, set: setAppStore} = useAppStore(state=>pickProps(["materialDrawerOpen", "set"], state));

  const setQuery = (query: string) => set(store=>{ store.query = query });


  return (
    <Drawer
    position={Position.RIGHT}
    size="100%"
    autoFocus={true}
    enforceFocus={true}
    hasBackdrop={true}
    onClose={()=>setAppStore(draft=>{ draft.materialDrawerOpen = false })}
    canOutsideClickClose={true}
    canEscapeKeyClose={true}
    isCloseButtonShown={true}
    title="Material Selection"
    isOpen={materialDrawerOpen}
  >
  
    <div className="material_drawer-grid">
      <div className="material_drawer-surface-container">
          <ObjectView />
      </div>
      <div className="material_drawer-container">
        <div className="material_drawer-searchbar-container">
          <div className="material_drawer-searchbar-input_container">
            <Icon icon="search" iconSize={14} color="darkgray" className="material_drawer-search_icon" />
            <input
              type="text"
              className="material_drawer-searchbar-input"
              value={query}
              onChange={e=>setQuery(e.currentTarget.value)}
            />
          </div>
        </div>
        <MaterialList />
        <div>
          <a
            className="show-more"
            onClick={() => set(store=> { store.bufferLength = store.bufferLength + 15 })}
          >
            show more...
          </a>
        </div>
        <div className={"material_drawer-display-container"}>
          <MaterialProperties />
          <MaterialAssignButton />
        </div>
      </div>
    </div>
    </Drawer>
  );
}

