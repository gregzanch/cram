import React from 'react';
import Surface from '../objects/surface';
import Messenger from '../messenger';
import { AcousticMaterial } from '..';
import { uuid } from 'uuidv4';
import { absorptionGradient } from './AbsorptionGradient';
import MaterialSliders from './MaterialSliders';
import { clamp } from '../common/clamp';
import { Icon, Tag, IToaster } from '@blueprintjs/core';
import { ButtonGroup, Button } from '@blueprintjs/core';
import Room from '../objects/room';
import ObjectView from './ObjectView';
import { KeyValuePair } from '../common/key-value-pair';
import Container from '../objects/container';


const max = (a: number, b: number) => (a > b ? a : b);
const min = (a: number, b: number) => (a < b ? a : b);

export interface MaterialDrawerProps {
  object?: Surface;
  bufferLength?: number;
  messenger: Messenger;
}

export interface MaterialDrawerState {
  query: string;
  selected_item: AcousticMaterial;
  bufferLength: number;
  selected_object: Surface;
}

export default class MaterialDrawer extends React.Component<MaterialDrawerProps, MaterialDrawerState> {
  listref: React.RefObject<HTMLDivElement>;
  listScroll: number;
  constructor(props: MaterialDrawerProps) {
    super(props);
    this.state = {
      bufferLength: props.bufferLength || 30,
      query: props.object ? props.object.acousticMaterial.material : "",
      selected_item: props.object ? props.object.acousticMaterial : {} as AcousticMaterial,
      selected_object: {} as Surface
    };
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleObjectViewClick = this.handleObjectViewClick.bind(this);
    this.handleListItemDoubleClick = this.handleListItemDoubleClick.bind(this);
    this.listref = React.createRef<HTMLDivElement>();
    this.listScroll = 0;
  }
  handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      query: e.currentTarget.value
    });
  }
  handleInput(event: React.FormEvent<HTMLInputElement>) {
    // console.log(event);
    
  }
  componentWillUpdate(nextProps, nextState, nextContext) {
    if (this.listref.current) {
      this.listScroll = this.listref.current.scrollTop;
    }
  }
  componentDidUpdate() {
    if (this.listref.current) {
      this.listref.current.scrollTop = this.listScroll;
      this.listref.current.focus();
    }
  }
  handleListItemClick(item: AcousticMaterial) {
    
    this.setState({
      selected_item: item
    })
  }
  handleListItemDoubleClick(item: AcousticMaterial) {
    console.log(item);
  }
  handleObjectViewClick(object, e: React.MouseEvent) {
  if (object instanceof Container && object['kind']!=="room") {
    if (e.shiftKey) {
      this.props.messenger.postMessage("APPEND_SELECTION", [object])
    }
    else {
      this.props.messenger.postMessage("SET_SELECTION", [object]);
    }
    if (object instanceof Surface) {
      console.log(object);
      this.setState({
        query: object.acousticMaterial.name,
        selected_object: object as Surface
      });
    }
  }
}
  // handleObjectViewClick(e) {
  //   console.log(e);
  //   if (e instanceof Surface) {
  //     this.setState({
  //       query: e.acousticMaterial.name,
  //       selected_object: e as Surface
  //     });
  //   }
  // }
  render() {
    const filteredItems = this.state.query.length > 0
      ? this.props.messenger.postMessage("SEARCH_ALL_MATERIALS", this.state.query)[0] as AcousticMaterial[]
      : this.props.messenger.postMessage("FETCH_ALL_MATERIALS")[0] as AcousticMaterial[];
    
    const MaterialDrawerList = () => {
      if (filteredItems && filteredItems.length > 0) {
        const MaterialDrawerListArray = [] as React.ReactNode[];
        for (let i = 0; i < min(this.state.bufferLength,filteredItems.length); i++) {
          
          const isSelected =
            this.state.selected_item &&
            this.state.selected_item._id &&
            filteredItems[i]._id === this.state.selected_item._id;
          const selectedClassname = "material_drawer-list_item-selected";
          const normalClassname = "material_drawer-list_item-container";
          const containerProps = {
            className: isSelected ? selectedClassname : normalClassname,
            onClick: e => this.handleListItemClick(filteredItems[i]),
            onDoubleClick: e => console.log(filteredItems[i]),
            key: filteredItems[i]._id
          };
          MaterialDrawerListArray.push(
            <div {...containerProps}>
              <div
                className="material_drawer-list_item-material"
                key={filteredItems[i]._id + "mat"}
                onDoubleClick={containerProps.onDoubleClick}>
                {filteredItems[i].material}
              </div>
              <div className="material_drawer-list_item-right">
                {/* <div className="material_drawer-list_item-tags">
                  {filteredItems[i].tags.map(x => (
                    <span key={uuid()} className="bp3-tag bp3-minimal material_drawer-list_item-tag">
                      {x}
                    </span>
                  ))}
                </div> */}
                <div
                  className="material_drawer-list_item-absorption"
                  key={filteredItems[i]._id + "grad"}
                  onDoubleClick={containerProps.onDoubleClick}
                  style={{
                    background: `${absorptionGradient(
                      filteredItems[i].absorption
                    )}`
                  }}
                />
              </div>
            </div>
          );
        }
        return MaterialDrawerListArray;
      }
      else return <div></div>;
    }
    const absorptionKeys =
      this.state.selected_item &&
      this.state.selected_item.absorption &&
      Object.keys(this.state.selected_item.absorption);
    
    const rooms = this.props.messenger.postMessage("FETCH_ROOMS")[0];
    
    return (
      <div className="material_drawer-grid">
        <div className="material_drawer-surface-container">
          {rooms && (
            <ObjectView
              solvers={{}}
              containers={rooms.reduce((a, b) => {
                a[b.uuid] = b;
                return a;
              }, {} as KeyValuePair<Room>)}
              onClick={this.handleObjectViewClick}
            />
          )}
        </div>
        <div className="material_drawer-container">
          <div className="material_drawer-searchbar-container">
            <div className="material_drawer-searchbar-input_container">
              <Icon icon="search" iconSize={14} color="darkgray" className="material_drawer-search_icon" />
              <input
                type="text"
                className="material_drawer-searchbar-input"
                value={this.state.query}
                onChange={this.handleQueryChange}
                onInput={this.handleInput}
              />
            </div>
          </div>
          <div className="material_drawer-list" ref={this.listref} key={uuid()}>
            {MaterialDrawerList()}
          </div>
          <div>
            <a
              className="show-more"
              onClick={e =>
                this.setState({
                  bufferLength: clamp(15 + this.state.bufferLength, 1, filteredItems.length)
                })
              }>
              show more...
            </a>
          </div>
          <div className={"material_drawer-display-container"}>
            <div className={"material_drawer-display-material_name"}>
              {this.state.selected_item && this.state.selected_item.name && <span>{this.state.selected_item.name}</span>}
            </div>
            <div className={"material_drawer-display-material_material"}>
              {this.state.selected_item && this.state.selected_item.material && <em>{this.state.selected_item.material}</em>}
            </div>
            <div className={"material_drawer-display-material_absorption"}>
              {this.state.selected_item &&
                this.state.selected_item.absorption &&
                absorptionKeys.map(x => {
                  return (
                    <div key={uuid()}>
                      <div className="material_drawer-display-material_absorption-header">{x}Hz</div>
                      <div className="material_drawer-display-material_absorption-value">{this.state.selected_item.absorption[x]}</div>
                    </div>
                  );
                })}
            </div>
            {
              <div className={"material_drawer-display-assign_button"}>
                <Button
                  intent="success"
                  text={"assign"}
                  icon={"tick"}
                  disabled={!this.state.selected_item || typeof this.state.selected_item._id === "undefined"}
                  onClick={e => {
                    this.props.messenger.postMessage("ASSIGN_MATERIAL", this.state.selected_item, this.state.selected_object.uuid || false);
                    }
                  }
                />
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

