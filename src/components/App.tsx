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
import Messenger, { emit, messenger } from "../messenger";
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
import { SettingsPanel } from "./setting-components/SettingsPanel";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import properCase from "../common/proper-case";
import { ApplicationSettings } from "../default-settings";

import SaveDialog from "./SaveDialog";
import OpenWarning from "./OpenWarning";

import { NavBarComponent } from "./NavBarComponent";

import TreeViewComponent from "../components/TreeViewComponent";


import {ResultsPanel} from './ResultsPanel';
import { MaterialSearch } from "./MaterialSearch";

const AppToaster = Toaster.create({
  className: "app-toaster",
  position: Position.TOP,
  maxToasts: 5
});

FocusStyleManager.onlyShowFocusOnTabs();

export interface AppProps {
  containers: KeyValuePair<Container>;
  settings: ApplicationSettings;
  browser: Report;
  rightPanelTopInitialSize: number;
  bottomPanelInitialSize: number;
  rightPanelInitialSize: number;
  leftPanelInitialSize: number;
}

type AppState = {
  rendererStatsVisible: boolean;
  importDialogVisible: boolean;
  containers: KeyValuePair<Container>;
  selectedObject: Container;

  saveDialogVisible: boolean;
  projectName: string;

  openWarningVisible: boolean;
  openAfterSave: boolean;

  settingsDrawerVisible: boolean;
  settings: ApplicationSettings;
  mode: EditorModes;
  // process: Process;
  solvers: KeyValuePair<Solver>;
  tool: ToolNames;
  simulationRunning: boolean;
  darkmode: boolean;
  stats: Stat[];
  lastUpdateReason: string;
  treeViewData: treeitem[];
  chartData?: {
    label: string;
    x: number[];
    y: number[];
  }[];
  materialDrawerOpen: boolean;
  terminalOpen: boolean;
  newWarningVisible: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canDuplicate: boolean;
  selectedSettingsDrawerTab: number;
};

type treeitem = {
  id: string | number;
  name: string;
  isExpanded?: boolean;
  isChecked?: boolean;
  children?: treeitem[];
};

export default class App extends React.Component<AppProps, AppState> {
  state: AppState;
  canvas: React.RefObject<HTMLCanvasElement>;
  canvasOverlay: React.RefObject<HTMLDivElement>;
  orientationOverlay: React.RefObject<HTMLDivElement>;
  responseOverlay: React.RefObject<HTMLDivElement>;
  //clfViewerOverlay: React.RefObject<HTMLDivElement>;
  statsCanvas: React.RefObject<HTMLCanvasElement>;
  prog: any;
  rightPanelTopSize = this.props.rightPanelTopInitialSize;
  bottomPanelSize = this.props.bottomPanelInitialSize;
  rightPanelSize = this.props.rightPanelInitialSize;
  leftPanelSize = this.props.leftPanelInitialSize;
  constructor(props: AppProps) {
    super(props);
    this.state = {
      canDuplicate: false,
      rendererStatsVisible: true,
      saveDialogVisible: false,
      projectName: messenger.postMessage("GET_PROJECT_NAME")[0],
      openWarningVisible: false,
      terminalOpen: false,
      newWarningVisible: false,
      openAfterSave: false,
      materialDrawerOpen: false,
      lastUpdateReason: "",
      solvers: {} as KeyValuePair<Solver>,
      simulationRunning: false,
      importDialogVisible: false,
      containers: {} as KeyValuePair<Container>,
      selectedObject: {} as Container,
      settingsDrawerVisible: false,
      settings: props.settings,
      mode: EditorModes.OBJECT,
      tool: ToolNames.SELECT,
      darkmode: false,
      stats: [] as Stat[],
      canUndo: false,
      canRedo: false,
      treeViewData: [],
      chartData: [
        {
          label: "a",
          x: [0],
          y: [0]
        }
      ],
      selectedSettingsDrawerTab: 1
      // process: new Process({name: "base", steps: [] as Task[]})
    };
    this.setupMessageHandlers = this.setupMessageHandlers.bind(this);
    this.setupMessageHandlers();

    this.canvas = React.createRef<HTMLCanvasElement>();
    this.responseOverlay = React.createRef<HTMLDivElement>();
    //this.clfViewerOverlay = React.createRef<HTMLDivElement>();
    this.canvasOverlay = React.createRef<HTMLDivElement>();
    this.orientationOverlay = React.createRef<HTMLDivElement>();
    this.statsCanvas = React.createRef<HTMLCanvasElement>();

    this.showImportDialog = this.showImportDialog.bind(this);
    this.handleImportDialogClose = this.handleImportDialogClose.bind(this);
    this.handleObjectPropertyValueChangeAsNumber = this.handleObjectPropertyValueChangeAsNumber.bind(this);
    this.handleObjectPropertyValueChangeAsString = this.handleObjectPropertyValueChangeAsString.bind(this);
    this.handleSettingsButtonClick = this.handleSettingsButtonClick.bind(this);
    this.handleMaterialDrawerClose = this.handleMaterialDrawerClose.bind(this);
    this.handleMaterialDrawerItemSelect = this.handleMaterialDrawerItemSelect.bind(this);
    this.handleSettingChange = this.handleSettingChange.bind(this);
    this.addMessageHandler = this.addMessageHandler.bind(this);
    this.handleSettingsTabChange = this.handleSettingsTabChange.bind(this);
    this.saveLayout = this.saveLayout.bind(this);
  }
  addMessageHandler(message: string, handler: (acc, ...args) => KeyValuePair<any>, cb?: () => void) {
    messenger.addMessageHandler(message, (acc, ...args) => {
      const nextState = handler(acc, ...args);
      this.setState(
        {
          lastUpdateReason: message,
          ...nextState
        },
        cb || (() => {})
      );
    });
  }
  setupMessageHandlers() {
    messenger.addMessageHandler("CAN_DUPLICATE", () => {
      return this.state.canDuplicate;
    });

    this.addMessageHandler("UNDO", (acc) => {
      const [canUndo, canRedo] = acc[0];
      return {
        canUndo,
        canRedo
      };
    });
    this.addMessageHandler("REDO", (acc) => {
      const [canUndo, canRedo] = acc[0];
      return {
        canUndo,
        canRedo
      };
    });
    this.addMessageHandler("NEW", () => {
      return {
        selectedObject: {} as Container,
        containers: {} as KeyValuePair<Container>,
        lastUpdateReason: "NEW"
      };
    });
    this.addMessageHandler("DESELECT_ALL_OBJECTS", () => {
      return {
        canDuplicate: false,
        selectedObject: {} as Container,
        lastUpdateReason: "DESELECT_ALL_OBJECTS"
      };
    });

    this.addMessageHandler("SET_SELECTION", (acc, objects) => {
      if (objects instanceof Array) {
        return {
          canDuplicate: objects.filter((x) => ["source", "receiver"].includes(x.kind)).length == objects.length,
          selectedObject: objects[objects.length - 1],
          lastUpdateReason: "SET_SELECTION"
        };
      } else return {};
    });

    this.addMessageHandler("APPEND_SELECTION", (acc, objects) => {
      if (objects instanceof Array) {
        return {
          selectedObject: objects[objects.length - 1],
          lastUpdateReason: "APPEND_SELECTION"
        };
      } else return {};
    });

    this.addMessageHandler("SET_OBJECT_VIEW", (acc, object) => {
      if (!object.uuid) {
        return {};
      } else {
        return {
          selectedObject: object,
          lastUpdateReason: "SET_OBJECT_VIEW"
        };
      }
    });

    this.addMessageHandler("SHOW_TOAST", (acc, toastProps: IToastProps) => {
      AppToaster.show(toastProps);
      return {};
    });

    this.addMessageHandler("SHOW_NEW_WARNING", () => {
      return {
        newWarningVisible: true
      };
    });

    this.addMessageHandler("SHOW_OPEN_WARNING", () => {
      return {
        openWarningVisible: true
      };
    });

    this.addMessageHandler("SHOW_TERMINAL", () => {
      return {
        terminalOpen: true
      };
    });
    this.addMessageHandler("TOGGLE_TERMINAL", () => {
      return {
        terminalOpen: !this.state.terminalOpen
      };
    });
    this.addMessageHandler("OPEN_MATERIAL_SEARCH", () => {
      return {
        materialDrawerOpen: true
      };
    });
    this.addMessageHandler("SHOW_SETTINGS_DRAWER", () => {
      return {
        settingsDrawerVisible: true
      };
    });

    // this.addMessageHandler("ASSIGN_MATERIAL",
    //   (acc, material, id) => {
    //     if (id) {
    //       const surface = messenger.postMessage("FETCH_SURFACE", id)[0] as Surface;
    //       surface.acousticMaterial = material;
    //     }
    //     else if ((this.state.selectedObject) && (this.state.selectedObject instanceof Surface)) {
    // 		// this.state.selectedObject.acousticMaterial = material;
    // 		const { selectedObject } = this.state;
    // 		selectedObject.acousticMaterial = material;
    // 		return ({
    // 			selectedObject,
    // 			materialDrawerOpen: false
    // 		})
    // 	}
    // 	return ({
    // 		selectedObject: this.state.selectedObject
    // 	})
    // });

    this.addMessageHandler("TOGGLE_MATERIAL_SEARCH", () => {
      return {
        materialDrawerOpen: !this.state.materialDrawerOpen
      };
    });
    this.addMessageHandler("UPDATE_CHART_DATA", (acc, ...args) => {
      return {
        chartData: args[0]
      };
    });
    this.addMessageHandler("SHOW_IMPORT_DIALOG", () => {
      return {
        importDialogVisible: !this.state.importDialogVisible
      };
    });

    this.addMessageHandler("SHOULD_REMOVE_CONTAINER", (acc, ...args) => {
      if (args[0] && this.state.containers[args[0]]) {
        const containers = { ...this.state.containers };
        const selectedObject = this.state.selectedObject;
        delete containers[args[0]];
        return {
          selectedObject: selectedObject && selectedObject.uuid === args[0] ? ({} as Container) : selectedObject,
          containers,
          lastUpdateReason: "SHOULD_REMOVE_CONTAINER"
        };
      } else {
        return {};
      }
    });
    this.addMessageHandler("SHOULD_ADD_SOURCE", () => {
      const containers = messenger.postMessage("GET_CONTAINERS")[0];
      // containers[acc[0].uuid] = acc[0];
      return {
        containers,
        lastUpdateReason: "SHOULD_ADD_SOURCE"
      };
    });
    this.addMessageHandler("SHOULD_ADD_RECEIVER", () => {
      const containers = messenger.postMessage("GET_CONTAINERS")[0];
      // containers[acc[0].uuid] = acc[0];
      return {
        containers,
        lastUpdateReason: "SHOULD_ADD_RECEIVER"
      };
    });
    this.addMessageHandler("SHOULD_ADD_RAYTRACER", (acc) => {
      const solvers = { ...this.state.solvers };
      solvers[acc[0].uuid] = acc[0];
      return { solvers };
    });
    this.addMessageHandler("SHOULD_ADD_IMAGE_SOURCE", (acc) => {
      const solvers = { ...this.state.solvers };
      solvers[acc[0].uuid] = acc[0];
      return { solvers };
    });
    this.addMessageHandler("SHOULD_ADD_RT60", (acc) => {
      const solvers = { ...this.state.solvers };
      solvers[acc[0].uuid] = acc[0];
      return { solvers };
    });
    this.addMessageHandler("SHOULD_ADD_ENERGYDECAY", (acc) => {
      const solvers = { ...this.state.solvers };
      solvers[acc[0].uuid] = acc[0];
      return { solvers };
    });
    this.addMessageHandler("SHOULD_REMOVE_SOLVER", (acc, ...args) => {
      if (args[0] && this.state.solvers[args[0]]) {
        const solvers = { ...this.state.solvers };
        const selectedObject = this.state.selectedObject;
        delete solvers[args[0]];
        return {
          selectedObject: selectedObject && selectedObject.uuid === args[0] ? ({} as Container) : selectedObject,
          solvers,
          lastUpdateReason: "SHOULD_REMOVE_SOLVER"
        };
      } else {
        return {};
      }
    });
    this.addMessageHandler("SHOULD_ADD_RT60", (acc) => {
      if (acc && acc[0]) {
        const solvers = { ...this.state.solvers };
        solvers[acc[0].uuid] = acc[0];
        return { solvers };
      } else {
        return {};
      }
    });
    this.addMessageHandler("SHOULD_ADD_ENERGYDECAY", (acc) => {
      if (acc && acc[0]) {
        const solvers = { ...this.state.solvers };
        solvers[acc[0].uuid] = acc[0];
        return { solvers };
      } else {
        return {};
      }
    });
    this.addMessageHandler("SHOULD_ADD_FDTD", (acc) => {
      const solvers = { ...this.state.solvers };
      solvers[acc[0].uuid] = acc[0];
      return { solvers };
    });

    this.addMessageHandler("SHOULD_ADD_FDTD_2D", (acc) => {
      const solvers = { ...this.state.solvers };
      solvers[acc[0].uuid] = acc[0];
      return { solvers };
    });

    this.addMessageHandler("ADDED_ROOM", (acc, ...args) => {
      const containers = { ...this.state.containers };
      containers[args[0].uuid] = args[0];
      return { containers };
    });
    this.addMessageHandler("ADDED_MODEL", (acc, ...args) => {
      const containers = { ...this.state.containers };
      containers[args[0].uuid] = args[0];
      return { containers };
    });
    this.addMessageHandler("IMPORT_FILE", () => {
      // console.log(acc);
      return {};
    });
    this.addMessageHandler("SIMULATION_DID_PLAY", () => {
      return {
        simulationRunning: true
      };
    });
    this.addMessageHandler("SIMULATION_DID_PAUSE", () => {
      return {
        simulationRunning: false
      };
    });
    this.addMessageHandler("STATS_SETUP", (acc, ...args) => {
      return {
        stats: Object.keys(args[0]).map((x) => args[0][x]) as Stat[]
      };
    });
    this.addMessageHandler("STATS_UPDATE", (acc, ...args) => {
      return {
        stats: Object.keys(args[0]).map((x) => args[0][x]) as Stat[]
      };
    });
    this.addMessageHandler("SHOW_SAVE_DIALOG", () => {
      return {
        saveDialogVisible: true
      };
    });
    this.addMessageHandler("SHOW_SAVE_DIALOG_THEN_OPEN", () => {
      return {
        saveDialogVisible: true,
        openAfterSave: true
      };
    });
    this.addMessageHandler("SET_PROJECT_NAME", (acc, ...args) => {
      return {
        projectName: (args && args[0]) || this.state.projectName
      };
    });

    this.addMessageHandler("ADD_CONSTRUCTION", () => {
      return {
        constructions: messenger.postMessage("GET_CONSTRUCTIONS")[0]
      };
    });

    this.addMessageHandler("REMOVE_CONSTRUCTION", () => {
      return {
        constructions: messenger.postMessage("GET_CONSTRUCTIONS")[0]
      };
    });
  }

  componentDidMount() {
    this.canvas.current && messenger.postMessage("APP_MOUNTED", this.canvas.current);
  }

  showImportDialog() {
    this.setState({
      importDialogVisible: !this.state.importDialogVisible,
      lastUpdateReason: "showImportDialog"
    });
  }
  handleImportDialogClose() {
    this.setState({
      importDialogVisible: !this.state.importDialogVisible,
      lastUpdateReason: "handleImportDialogClose"
    });
  }
  handleSettingsButtonClick() {
    this.setState({
      settingsDrawerVisible: !this.state.settingsDrawerVisible,
      lastUpdateReason: "handleSettingsButtonClick"
    });
  }



  handleObjectPropertyValueChangeAsNumber(prop: string, valueAsNumber: number) {
    const { selectedObject } = this.state;
    selectedObject[prop] = valueAsNumber;
    this.setState({
      selectedObject,
      lastUpdateReason: "handleObjectPropertyValueChangeAsNumber"
    });
  }
  handleObjectPropertyValueChangeAsString(prop: string, valueAsString: string) {
    const { selectedObject } = this.state;
    selectedObject[prop] = valueAsString;
    this.setState({
      selectedObject,
      lastUpdateReason: "handleObjectPropertyValueChangeAsString"
    });
  }


  handleSettingChange(e: React.ChangeEvent<HTMLInputElement>) {
    const settings = { ...this.state.settings };
    const id = e.currentTarget.id;
    settings[id].value = e.currentTarget.type === "checkbox" ? e.currentTarget.checked : e.currentTarget.value;
    this.setState(
      {
        settings,
        lastUpdateReason: "handleSettingChange"
      },
      () => {
        messenger.postMessage("SETTING_CHANGE", {
          setting: id,
          value: settings[id].value
        });
      }
    );
  }

  // shouldComponentUpdate(nextProps, nextState, nextContext) {
  // 	console.log("shouldComponentUpdate::nextState", nextState);
  // 	return true;
  // }

  handleMaterialDrawerClose() {
    this.setState({
      materialDrawerOpen: false
    });
  }
  handleMaterialDrawerItemSelect() {}

  MaterialOptionListRenderer: ItemListRenderer<AcousticMaterial> = (
    props: IItemListRendererProps<AcousticMaterial>
  ) => {
    return (
      <div>
        {props.filteredItems.map((x, i) => {
          return <div key={i}>{x.material}</div>;
        })}
      </div>
    );
  };

  handleSettingsTabChange(index: number) {
    this.setState({
      selectedSettingsDrawerTab: index
    });
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

    const ObjectViewPanel2 = (
      <PanelContainer>
        <TreeViewComponent
          {...TreeViewComponent.defaultProps}
          data={this.state.treeViewData}
          onUpdateCb={(updatedData) => {
            this.setState({ treeViewData: updatedData });
          }}
        />
      </PanelContainer>
    );

    // const ObjectPropertiesPanel = (
    //   <PanelContainer>
    //     {(() => {
    //       if (Object.keys(this.state.selectedObject).length > 0) {
    //         return (
    //           <ObjectProperties
    //             messenger={messenger}
    //             object={this.state.selectedObject}
    //             onPropertyChange={this.handleObjectPropertyChange}
    //             onPropertyValueChangeAsNumber={(id: string, prop: string, value: number) =>
    //               this.handleObjectPropertyValueChangeAsNumber(prop, value)
    //             }
    //             onPropertyValueChangeAsString={this.handleObjectPropertyValueChangeAsString}
    //             onButtonClick={()=>{}}
    //           />
    //         );
    //       }
    //     })()}
    //   </PanelContainer>
    // );



    const Editor = (
      <div className="webgl-canvas">
              <div
                id="response-overlay"
                className={"response_overlay response_overlay-hidden"}
                ref={this.responseOverlay}
              ></div>
              {/* {<div
                id="clf_viewer_overaly"
                className={"clf_viewer_overlay clv_viewer_overlay-hidden"}
                ref={this.clfViewerOverlay}
              ></div>} */}
              <div id="canvas_overlay" ref={this.canvasOverlay}></div>
              <div id="orientation-overlay" ref={this.orientationOverlay}></div>
              <canvas id="renderer-canvas" ref={this.canvas} />
            </div>
    )

    return (
      <div>
        <NavBarComponent />

        <SettingsDrawer
          size={"55%"}
          onClose={this.handleSettingsButtonClick}
          isOpen={this.state.settingsDrawerVisible}
          onSubmit={() => {
            this.setState({
              settings: messenger.postMessage("SUBMIT_ALL_SETTINGS")[0]
            });
          }}
        >
          <Tabs selectedIndex={this.state.selectedSettingsDrawerTab} onSelect={this.handleSettingsTabChange}>
            <TabList>
              <Tab disabled />
              {Object.keys(this.state.settings).map((key) => {
                return <Tab key={"settings-tabname-" + key}>{properCase(key)}</Tab>;
              })}
            </TabList>
            <TabPanel />
            {Object.keys(this.state.settings).map((key) => {
              return (
                <TabPanel key={"settings-tabpanel-" + key}>
                  <SettingsPanel messenger={messenger} category={key} />
                </TabPanel>
              );
            })}
          </Tabs>
        </SettingsDrawer>
        
        <MaterialSearch />


        <ImportDialog />
        <SaveDialog />

        <SplitterLayout
          secondaryMinSize={5}
          primaryMinSize={50}
          secondaryInitialSize={this.props.leftPanelInitialSize}
          primaryIndex={1}
          customClassName="modified-splitter-layout"
          onDragStart={() => {
            messenger.postMessage("SET_RENDERER_SHOULD_ANIMATE", true);
          }}
          onDragEnd={() => {
            messenger.postMessage("SET_RENDERER_SHOULD_ANIMATE", false);
            this.saveLayout();
          }}
          onSecondaryPaneSizeChange={(value: number) => {
            this.leftPanelSize = value;
            // this.setState({ leftPanelSize: value });
          }}
        >
          {
            <>
              {ObjectViewPanel}
              {/* {ObjectViewPanel2} */}
            </>
          }

          {/* center and right */}
          <SplitterLayout
            secondaryMinSize={0}
            primaryMinSize={50}
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
              onDragStart={() => {emit("RENDERER_SHOULD_ANIMATE", true);}}
              onDragEnd={() => {emit("RENDERER_SHOULD_ANIMATE", false);}}
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
                <ObjectProperties />
              </PanelContainer>

              <PanelContainer className="panel full parameter-config-panel">
                <ParameterConfig />
              </PanelContainer>
            </SplitterLayout>
          </SplitterLayout>
        </SplitterLayout>
      </div>
    );
  }
}
