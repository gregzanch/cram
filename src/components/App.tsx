import React from "react";
import SplitterLayout from "react-splitter-layout";
import { FocusStyleManager, Position, Drawer, Alert, Intent, Toaster, IToastProps } from "@blueprintjs/core";
import { ItemListRenderer, IItemListRendererProps } from "@blueprintjs/select";
import ImportDialog from "./ImportDialog";
import ObjectView from "./object-view/ObjectView";
// import ConstructionsView from "./ConstructionsView";
import Container from "../objects/container";
import PanelContainer from "./panel-container/PanelContainer";
import ObjectProperties from "./ObjectProperties";
import Messenger, { emit, messenger, on } from "../messenger";
import { KeyValuePair } from "../common/key-value-pair";
import SettingsDrawer from "./settings-drawer/SettingsDrawer";
import { Report } from "../common/browser-report";

import "../css";
import "./App.css";

import { ToolNames } from "../constants/tool-names";
import { EditorModes } from "../constants/editor-modes";
import Solver from "../compute/solver";

import { ParameterConfig } from "./parameter-config/ParameterConfig";
import { Stat } from "./parameter-config/Stats";

import Surface from "../objects/surface";
import { AcousticMaterial } from "../db/acoustic-material";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import properCase from "../common/proper-case";

import SaveDialog from "./SaveDialog";
import OpenWarning from "./OpenWarning";

import { NavBarComponent } from "./NavBarComponent";

import TreeViewComponent from "../components/TreeViewComponent";


import {ResultsPanel} from './ResultsPanel';
import { MaterialSearch } from "./MaterialSearch";
import EditorContainer from "./EditorContainer";

const AppToaster = Toaster.create({
  className: "app-toaster",
  position: Position.TOP,
  maxToasts: 5
});

FocusStyleManager.onlyShowFocusOnTabs();

export interface AppProps {
  rightPanelTopInitialSize: number;
  bottomPanelInitialSize: number;
  rightPanelInitialSize: number;
  leftPanelInitialSize: number;
}

type AppState = {
  stats: Stat[];
};


export default class App extends React.Component<AppProps, AppState> {
  state: AppState;
  canvas: React.RefObject<HTMLCanvasElement>;
  canvasOverlay: React.RefObject<HTMLDivElement>;
  orientationOverlay: React.RefObject<HTMLDivElement>;
  responseOverlay: React.RefObject<HTMLDivElement>;
  statsCanvas: React.RefObject<HTMLCanvasElement>;
  rightPanelTopSize = this.props.rightPanelTopInitialSize;
  bottomPanelSize = this.props.bottomPanelInitialSize;
  rightPanelSize = this.props.rightPanelInitialSize;
  leftPanelSize = this.props.leftPanelInitialSize;
  editorResultSplitterRef: React.RefObject<SplitterLayout>;
  constructor(props: AppProps) {
    super(props);
    this.state = {
      stats: [] as Stat[],
    };

    this.canvas = React.createRef<HTMLCanvasElement>();
    this.responseOverlay = React.createRef<HTMLDivElement>();
    //this.clfViewerOverlay = React.createRef<HTMLDivElement>();
    this.canvasOverlay = React.createRef<HTMLDivElement>();
    this.orientationOverlay = React.createRef<HTMLDivElement>();
    this.statsCanvas = React.createRef<HTMLCanvasElement>();
    this.editorResultSplitterRef = React.createRef<SplitterLayout>();
    this.saveLayout = this.saveLayout.bind(this);
  }


  componentDidMount() {
    this.canvas.current && messenger.postMessage("APP_MOUNTED", this.canvas.current);
    let lastPanelSize = 50;
    if(this.editorResultSplitterRef.current){
      //@ts-ignore
      lastPanelSize = this.editorResultSplitterRef.current.state.secondaryPaneSize || 50;
    }
    const openPanel = () => {
      if(lastPanelSize == 0){
        lastPanelSize = 50;
      }
      this.editorResultSplitterRef.current!.setState({ secondaryPaneSize: lastPanelSize }, () => emit("RENDERER_SHOULD_ANIMATE", false));
    }
    const closePanel = () => {
      //@ts-ignore
      lastPanelSize = this.editorResultSplitterRef.current!.state.secondaryPaneSize;
      this.editorResultSplitterRef.current!.setState({ secondaryPaneSize: 0 }, () => emit("RENDERER_SHOULD_ANIMATE", false));
    }

    on("TOGGLE_RESULTS_PANEL", (open) => {
      console.log(this.editorResultSplitterRef.current);

      if(this.editorResultSplitterRef.current){
        emit("RENDERER_SHOULD_ANIMATE", true);
        //@ts-ignore
        if(this.editorResultSplitterRef.current.state.secondaryPaneSize == 0 || open){
          openPanel();
        } else {
          closePanel();
        }
      }
    })
  }

  saveLayout() {
    const layout = {
      bottomPanelInitialSize: this.bottomPanelSize,
      rightPanelInitialSize: this.rightPanelSize,
      leftPanelInitialSize: this.leftPanelSize,
      rightPanelTopInitialSize: this.rightPanelTopSize
    };
    localStorage.setItem("layout", JSON.stringify(layout));
  }

  render() {
    const ObjectViewPanel = (
      <PanelContainer>
        <ObjectView />
      </PanelContainer>
    );

    const Editor = (
        <EditorContainer>
              <div id="response-overlay" className={"response_overlay response_overlay-hidden"} ref={this.responseOverlay} />
              <div id="canvas_overlay" ref={this.canvasOverlay}/>
              <div id="orientation-overlay" ref={this.orientationOverlay}/>
              <canvas id="renderer-canvas" ref={this.canvas} />
          </EditorContainer>
    )

    return (
      <div>
        <NavBarComponent />
        {/* <SettingsDrawer /> */}

        
        <MaterialSearch />


        <ImportDialog />
        <SaveDialog />
      {/* center and right */}
      <SplitterLayout
            secondaryMinSize={0}
            primaryMinSize={50}
            customClassName={"modified-splitter-layout"}
            secondaryInitialSize={this.props.rightPanelInitialSize}
            primaryIndex={0}
            onDragStart={() => {
              emit("RENDERER_SHOULD_ANIMATE", true);
            }}
            onDragEnd={() => {
              emit("RENDERER_SHOULD_ANIMATE", false);
              this.saveLayout();
            }}
            onSecondaryPaneSizeChange={(value: number) => {
              this.rightPanelSize = value;
              // this.setState({ rightPanelSize: value });
            }}
          >
            <SplitterLayout 
              vertical 
              percentage
              secondaryInitialSize={0}
              onDragStart={() => {emit("RENDERER_SHOULD_ANIMATE", true);}}
              onDragEnd={() => {emit("RENDERER_SHOULD_ANIMATE", false);}}
              ref={this.editorResultSplitterRef}
            >
              {Editor}
              <PanelContainer>
                <ResultsPanel />
              </PanelContainer>
            </SplitterLayout>

            <SplitterLayout
              vertical
              primaryMinSize={40}
              secondaryMinSize={1}
              secondaryInitialSize={this.props.rightPanelTopInitialSize}
              customClassName="canvas-parameter-config"
              onDragEnd={() => {
                this.saveLayout();
              }}
              onSecondaryPaneSizeChange={(value: number) => {
                this.rightPanelTopSize = value;
                // this.setState({ rightPanelTopSize: value });
              }}
            >
              <PanelContainer>
                <>{ObjectViewPanel}</>
              </PanelContainer>

              <PanelContainer className="panel full parameter-config-panel">
                <ParameterConfig />
              </PanelContainer>
            </SplitterLayout>
          </SplitterLayout>
      </div>
    );
  }
}

declare global {
  interface EventTypes {
    TOGGLE_RESULTS_PANEL: any
  }
}