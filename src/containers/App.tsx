import React from "react";
import SplitterLayout from "react-splitter-layout";
import {
  FocusStyleManager,
  Navbar,
  Alignment,
  Button,
  Menu,
  MenuItem,
  Popover,
  ButtonGroup,
  Position,
  MenuDivider,
  Drawer,
  Classes,
  Colors,
  AnchorButton,
  Overlay,
  Alert,
  Intent,
  Toaster,
  IToastProps,
} from "@blueprintjs/core";
import MenuItemText from '../components/MenuItemText';
import { ItemListRenderer, IItemListRendererProps } from "@blueprintjs/select";
import MaterialBar from '../components/MaterialBar';
import { Characters, EditorModes, ToolNames } from "../constants";
import ImportDialog from "../components/ImportDialog";
import ObjectView from "../components/ObjectView";
import resolve_svg from "../svg/resolve.svg";
import { set } from "../common/set-at";
import Container from "../objects/container";
import PanelContainer from "./PanelContainer";
import ObjectProperties from "../components/ObjectProperties/index";
import Messenger from "../messenger";
import Renderer from "../render/renderer";
import Receiver from "../objects/receiver";
import Source from "../objects/source";
import { KeyValuePair } from "../common/key-value-pair";
import SettingsDrawer from "../components/SettingsDrawer";
import { Setting } from "../setting";
import { Report } from "../common/browser-report";

import "../css";
import "./App.css";
import { ToolName } from "../constants/tool-names";
import { EditorMode } from "../constants/editor-modes";
// import { Process, Task } from "../common/process";
import SettingsDrawerCheckBox from "../components/setting-components/SettingsDrawerCheckbox";
import Solver from "../compute/solver";
import RayTracer from "../compute/raytracer";

import Gutter from '../components/Gutter/Gutter';
import { Stat } from "../components/Gutter/Stats";
import { ObjectPropertyInputEvent } from "../components/NumberInput";
import Surface from "../objects/surface";
import { AcousticMaterial } from "..";
import { Searcher } from "fast-fuzzy";
import MaterialDrawer from "../components/MaterialDrawer";
import { SettingsPanel } from "../components/setting-components/SettingsPanel";
import Results from "../components/Gutter/Results";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import properCase from "../common/proper-case";
import { ApplicationSettings } from "../default-settings";


const AppToaster = Toaster.create({
  className: "app-toaster",
  position: Position.TOP,
  
});


FocusStyleManager.onlyShowFocusOnTabs();




export interface AppProps {
  messenger: Messenger;
  containers: KeyValuePair<Container>;
  settings: ApplicationSettings;
  browser: Report;
}





interface AppState {
	importDialogVisible: boolean;
	containers: KeyValuePair<Container>;
  selectedObject: Container;
  
	settingsDrawerVisible: boolean;
	settings: ApplicationSettings;
	mode: EditorMode;
	// process: Process;
	solvers: KeyValuePair<Solver>;
	tool: ToolName;
	simulationRunning: boolean;
	darkmode: boolean;
	stats: Stat[];
	lastUpdateReason: string;
	chartData?: {
		label: string;
		x: number[];
		y: number[];
	}[];
	materialDrawerOpen: boolean;
	terminalOpen: boolean;
  newWarningVisible: boolean;
  isGutterSplit: boolean;
  canUndo: boolean;
  canRedo: boolean;
  selectedSettingsDrawerTab: number;
}

export default class App extends React.Component<AppProps, AppState> {
	state: AppState;
  canvas: React.RefObject<HTMLCanvasElement>;
  canvasOverlay: React.RefObject<HTMLDivElement>;
	statsCanvas: React.RefObject<HTMLCanvasElement>;
	prog: any;
	constructor(props: AppProps) {
		super(props);
    this.state = {
      isGutterSplit: false,
			terminalOpen: false,
			newWarningVisible: false,
			materialDrawerOpen: false,
      lastUpdateReason: "",
      solvers: {} as KeyValuePair<Solver>,
      simulationRunning: false,
      importDialogVisible: false,
      containers: {} as KeyValuePair<Container>,
      selectedObject: {} as Container,
      settingsDrawerVisible: false,
      settings: props.settings,
      mode: "EDIT",
      tool: "SELECT",
      darkmode: false,
      stats: [] as Stat[],
      canUndo: false,
      canRedo: false,
			chartData: [{
				label: "a",
				x: [0],
				y: [0]
      }],
      selectedSettingsDrawerTab: 1
      // process: new Process({name: "base", steps: [] as Task[]})
    };
		this.setupMessageHandlers = this.setupMessageHandlers.bind(this);
		this.setupMessageHandlers();

    this.canvas = React.createRef<HTMLCanvasElement>();
    this.canvasOverlay = React.createRef<HTMLDivElement>();
		this.statsCanvas = React.createRef<HTMLCanvasElement>();
		this.showImportDialog = this.showImportDialog.bind(this);
		this.handleImportDialogClose = this.handleImportDialogClose.bind(this);
		this.handleObjectViewClick = this.handleObjectViewClick.bind(this);
		this.handleObjectViewDelete = this.handleObjectViewDelete.bind(this);
		this.handleObjectPropertyChange = this.handleObjectPropertyChange.bind(
			this
		);
		this.handleObjectPropertyValueChangeAsNumber = this.handleObjectPropertyValueChangeAsNumber.bind(
			this
		);
		this.handleObjectPropertyValueChangeAsString = this.handleObjectPropertyValueChangeAsString.bind(
			this
		);
		this.handleSettingsButtonClick = this.handleSettingsButtonClick.bind(
			this
		);
		this.handleMaterialBarClose = this.handleMaterialBarClose.bind(this);
		this.handleMaterialBarItemSelect = this.handleMaterialBarItemSelect.bind(this);
		this.handleSettingChange = this.handleSettingChange.bind(this);
		this.handleObjectPropertyButtonClick = this.handleObjectPropertyButtonClick.bind(this);
    this.addMessageHandler = this.addMessageHandler.bind(this);
    this.handleSettingsTabChange = this.handleSettingsTabChange.bind(this);
	}
	addMessageHandler(message: string, handler: (acc, ...args) => KeyValuePair<any>, cb?: ()=>void) {
		this.props.messenger.addMessageHandler(message, (acc, ...args) => {
			const nextState = handler(acc, ...args);
			this.setState({
				lastUpdateReason: message,
				...nextState
			}, cb || (()=> {}))
		})
	}
  setupMessageHandlers() {
    
    
    this.addMessageHandler("UNDO", (acc, ...args) => {
      const [canUndo, canRedo] = acc[0];
      return {
        canUndo,
        canRedo
      }
    })
    this.addMessageHandler("REDO", (acc, ...args) => {
      const [canUndo, canRedo] = acc[0];
      return {
        canUndo,
        canRedo
      }
    })
    this.addMessageHandler("NEW", () => {
      return {
        selectedObject: {} as Container,
        containers: {} as KeyValuePair<Container>,
        lastUpdateReason: "NEW"
      }
    });
    this.addMessageHandler("DESELECT_ALL_OBJECTS", () => {
      return {
        selectedObject: {} as Container,
        lastUpdateReason: "DESELECT_ALL_OBJECTS"
      }
    });
    
    this.addMessageHandler("SET_SELECTION", (acc, objects) => {
      if (objects instanceof Array) {
        return {
          selectedObject: objects[objects.length - 1],
          lastUpdateReason: "SET_SELECTION"
        };
      }
      else return {}
    })
    
    this.addMessageHandler("APPEND_SELECTION", (acc, objects) => {
      if (objects instanceof Array) {
        return {
          selectedObject: objects[objects.length - 1],
          lastUpdateReason: "APPEND_SELECTION"
        };
      } else return {};
    })
    
    this.addMessageHandler("SET_OBJECT_VIEW", (acc, object) => {
      if (!object.uuid) {
        return {}
      }
      else {
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
    
		this.addMessageHandler("SHOW_NEW_WARNING",
			() => {
				return ({
					newWarningVisible: true
			})
		});
		this.addMessageHandler("SHOW_TERMINAL",
			() => {
			return ({
				terminalOpen: true
			});
		});
		this.addMessageHandler("TOGGLE_TERMINAL",
			() => {
      return {
        terminalOpen: !this.state.terminalOpen
      };
    });
		this.addMessageHandler("OPEN_MATERIAL_SEARCH",
			(acc, ...args) => {
			return ({
				materialDrawerOpen: true
			});
		});
    

		// this.addMessageHandler("ASSIGN_MATERIAL",
    //   (acc, material, id) => {
    //     if (id) {
    //       const surface = this.props.messenger.postMessage("FETCH_SURFACE", id)[0] as Surface;
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
		
		this.addMessageHandler("TOGGLE_MATERIAL_SEARCH",
			(acc, ...args) => {
      return {
        materialDrawerOpen: !this.state.materialDrawerOpen
      };
    });
		this.addMessageHandler("UPDATE_CHART_DATA",
			(acc, ...args) => {
			return ({
				chartData: args[0]
			})
		})
		this.addMessageHandler("SHOW_IMPORT_DIALOG",
			(acc, ...args) => {
			return {
				importDialogVisible: !this.state.importDialogVisible,
			};
		});
		this.addMessageHandler("SHOW_IMPORT_DIALOG",
			(acc, ...args) => {
				return ({
          importDialogVisible: !this.state.importDialogVisible,
        });
			}
    );
    
    this.addMessageHandler("SHOULD_REMOVE_CONTAINER",
      (acc, ...args) => {
      if (args[0] && this.state.containers[args[0]]) {
        const containers = { ...this.state.containers };
        const selectedObject = this.state.selectedObject;
        delete containers[args[0]];
        return {
          selectedObject: selectedObject && selectedObject.uuid === args[0] ? {} as Container : selectedObject,
          containers,
          lastUpdateReason: "SHOULD_REMOVE_CONTAINER"
        }
      }
      else {
        return {}
      }
    })
		this.addMessageHandler("SHOULD_ADD_SOURCE",
			(acc, ...args) => {
				const containers = { ...this.state.containers };
				containers[acc[0].uuid] = acc[0];
				return ({
          containers,
          lastUpdateReason: "SHOULD_ADD_SOURCE"
        });
			}
		);
		this.addMessageHandler("SHOULD_ADD_RECEIVER",
			(acc, ...args) => {
				const containers = { ...this.state.containers };
				containers[acc[0].uuid] = acc[0];
				return ({ containers });
			}
		);
		this.addMessageHandler("SHOULD_ADD_RAYTRACER",
			(acc, ...args) => {
				const solvers = { ...this.state.solvers };
				solvers[acc[0].uuid] = acc[0];
				return ({ solvers });
			}
    );
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
      }
      else {
        return {}
      }
    });
		this.addMessageHandler("SHOULD_ADD_RT60",
      (acc, ...args) => {
        if (acc && acc[0]) {
          const solvers = { ...this.state.solvers };
          solvers[acc[0].uuid] = acc[0];
          return ({ solvers });
        }
        else {
          return ({});
        }
			}
		);
		this.addMessageHandler("SHOULD_ADD_FDTD",
			(acc, ...args) => {
				const solvers = { ...this.state.solvers };
				solvers[acc[0].uuid] = acc[0];
				return ({ solvers });
			}
		);		

    this.addMessageHandler("SHOULD_ADD_FDTD_2D",
			(acc, ...args) => {
				const solvers = { ...this.state.solvers };
				solvers[acc[0].uuid] = acc[0];
				return ({ solvers });
			}
		);		

		this.addMessageHandler("ADDED_ROOM",
			(acc, ...args) => {
			const containers = { ...this.state.containers };
			containers[args[0].uuid] = args[0];
			return ({ containers });
		});
		this.addMessageHandler("IMPORT_FILE",
			(acc, ...args) => {
				// console.log(acc);
				return {}
			}
		);
		this.addMessageHandler("SIMULATION_DID_PLAY",
			(acc, ...args) => {
			return ({
				simulationRunning: true
			})
		});
		this.addMessageHandler("SIMULATION_DID_PAUSE",
			(acc, ...args) => {
			return({
				simulationRunning: false
			})
		});
		this.addMessageHandler("STATS_SETUP",
			(acc, ...args) => {
			return({
				stats: Object.keys(args[0]).map(x => args[0][x]) as Stat[]
			});
		});
		this.addMessageHandler("STATS_UPDATE",
			(acc, ...args) => {
			return({
				stats: Object.keys(args[0]).map(x => args[0][x]) as Stat[]
			});
    });
	}

	componentDidMount() {
		this.canvas.current &&
			this.props.messenger.postMessage(
				"APP_MOUNTED",
				this.canvas.current
			);
	}

	showImportDialog() {
		this.setState({
			importDialogVisible: !this.state.importDialogVisible,
			lastUpdateReason: "showImportDialog"
		});
	}
	handleImportDialogClose(e?) {
		this.setState({
      importDialogVisible: !this.state.importDialogVisible,
      lastUpdateReason: "handleImportDialogClose"
    });
	}
	handleSettingsButtonClick(e?) {
		this.setState({
      settingsDrawerVisible: !this.state.settingsDrawerVisible,
      lastUpdateReason: "handleSettingsButtonClick"
    });
	}

  handleObjectViewClick(object, e: React.MouseEvent) {
    if (object instanceof Container && object['kind']!=="room") {
      if (e.shiftKey) {
        this.props.messenger.postMessage("APPEND_SELECTION", [object])
      }
      else {
        this.props.messenger.postMessage("SET_SELECTION", [object]);
      }
    }
    else if (object instanceof Solver) {
      this.props.messenger.postMessage("SET_OBJECT_VIEW", object)
    }
  }
  handleObjectViewDelete(object: Container | Solver) {
    if (object instanceof Container) {
      this.props.messenger.postMessage("SHOULD_REMOVE_CONTAINER", object.uuid);
    }
    else if (object instanceof Solver) {
      this.props.messenger.postMessage("SHOULD_REMOVE_SOLVER", object.uuid);
    }
  }
	handleObjectPropertyButtonClick(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {

	}
	handleObjectPropertyValueChangeAsNumber(
		id: string,
		prop: string,
		valueAsNumber: number
	) {
		const { selectedObject } = this.state;
		selectedObject[prop] = valueAsNumber;
		this.setState({
			selectedObject,
			lastUpdateReason: "handleObjectPropertyValueChangeAsNumber"
			
		});
	}
	handleObjectPropertyValueChangeAsString(
		id: string,
		prop: string,
		valueAsString: string
	) {
		const { selectedObject } = this.state;
		selectedObject[prop] = valueAsString;
		this.setState({
      selectedObject,
      lastUpdateReason: "handleObjectPropertyValueChangeAsString"
    });
	}

	handleObjectPropertyChange(e: ObjectPropertyInputEvent) {
		const { selectedObject } = this.state;
		const prop = e.name;
		switch (e.type) {
			case "checkbox":
				selectedObject[prop] = e.value;
				break;
			case "text":
				selectedObject[prop] = e.value;
				break;
			case "number":
				selectedObject[prop] = Number(e.value);
				break;
			default:
				selectedObject[prop] = e.value;
				break;
		}
		this.setState({
      selectedObject,
      lastUpdateReason: "handleObjectPropertyChange"
    });
	}
	handleSettingChange(e: React.ChangeEvent<HTMLInputElement>) {
		const settings = { ...this.state.settings };
		const id = e.currentTarget.id;
		settings[id].value =
			e.currentTarget.type === "checkbox"
				? e.currentTarget.checked
				: e.currentTarget.value;
		this.setState(
      {
        settings,
        lastUpdateReason: "handleSettingChange"
      },
      () => {
        this.props.messenger.postMessage("SETTING_CHANGE", {
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
	
	handleMaterialBarClose(e) {
		this.setState({
			materialDrawerOpen: false
		})
	}
	handleMaterialBarItemSelect(e) {
	}
	
	MaterialOptionListRenderer: ItemListRenderer<AcousticMaterial> = (props: IItemListRendererProps<AcousticMaterial>) => {
		
		return (
			<div>
			{props.filteredItems.map((x, i) => {
				return (
					<div key={i}>
						{x.material}
					</div>
					)
				
			})}
			</div>
		)
  };
  
  handleSettingsTabChange(index: number) {
    this.setState({
      selectedSettingsDrawerTab: index
    });
  }
	
	render() {
		return (
      <div>
        <div>
          <Navbar className="main-nav_bar">
            <Navbar.Group align={Alignment.LEFT} className="main-nav_bar-left_group">
              <Navbar.Group className="main-nav_bar-logo_text">cram.ui</Navbar.Group>
              <Navbar.Divider />
              <Menu className="main-nav_bar-left_menu">
                <ButtonGroup minimal={true}>
                  {/* FILE */}
                  <Popover minimal={true} transitionDuration={10} position={Position.BOTTOM_LEFT} className="main-nav_bar-left_menu-popover-file">
                    <Button text="File" className={"main-nav_bar-left_menu-button"} />
                    <Menu>
                      <MenuItem
                        text={<MenuItemText text="New" hotkey={Characters.SHIFT + "N"} />}
                        onClick={(e) => this.setState({ newWarningVisible: true })}
                      />
                      <MenuItem text="Save" disabled></MenuItem>
                      <MenuDivider />
                      <MenuItem text="Import" onClick={this.showImportDialog}></MenuItem>
                    </Menu>
                  </Popover>

                  {/* EDIT */}
                  <Popover minimal={true} transitionDuration={10} position={Position.BOTTOM_LEFT}>
                    <Button text="Edit" className={"main-nav_bar-left_menu-button"} />
                    <Menu>
                      <MenuItem
                        text={<MenuItemText text="Undo" hotkey={Characters.COMMAND + "Z"} />}
                        onClick={(e) => {
                          this.props.messenger.postMessage("UNDO");
                        }}
                        disabled={!this.state.canUndo}
                      />
                      <MenuItem
                        text={<MenuItemText text="Redo" hotkey={Characters.SHIFT + Characters.COMMAND + "Z"} />}
                        onClick={(e) => {
                          this.props.messenger.postMessage("REDO");
                        }}
                        disabled={!this.state.canRedo}
                      />
                      <MenuDivider />
                      <MenuItem text="Cut" disabled></MenuItem>
                      <MenuItem text="Copy" disabled></MenuItem>
                      <MenuItem text="Paste" disabled></MenuItem>
                    </Menu>
                  </Popover>

                  {/* ADD */}
                  <Popover minimal={true} transitionDuration={10} position={Position.BOTTOM_LEFT}>
                    <Button text="Add" className={"main-nav_bar-left_menu-button"} />
                    <Menu>
                      <MenuItem
                        text={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between"
                            }}>
                            <div>Source</div>
                            <div style={{ color: Colors.LIGHT_GRAY1 }}></div>
                          </div>
                        }
                        onClick={() => this.props.messenger.postMessage("SHOULD_ADD_SOURCE")}
                      />
                      <MenuItem text="Receiver" onClick={() => this.props.messenger.postMessage("SHOULD_ADD_RECEIVER")}></MenuItem>
                      <MenuDivider />
                      <MenuItem
                        text={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between"
                            }}>
                            <div>Ray Tracer</div>
                            <div style={{ color: Colors.LIGHT_GRAY1 }}></div>
                          </div>
                        }
                        onClick={() => this.props.messenger.postMessage("SHOULD_ADD_RAYTRACER")}
                      />

                      <MenuItem
                        text={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between"
                            }}>
                            <div>2D-FDTD</div>
                            <div style={{ color: Colors.LIGHT_GRAY1 }}></div>
                          </div>
                        }
                        onClick={() => this.props.messenger.postMessage("SHOULD_ADD_FDTD_2D")}
                      />
                      <MenuItem
                        text={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between"
                            }}>
                            <div>RT60</div>
                            <div style={{ color: Colors.LIGHT_GRAY1 }}></div>
                          </div>
                        }
                        onClick={() => this.props.messenger.postMessage("SHOULD_ADD_RT60")}
                      />
                    </Menu>
                  </Popover>

                  {/* VIEW */}
                  <Popover minimal={true} transitionDuration={10} position={Position.BOTTOM_LEFT}>
                    <Button text="View" className={"main-nav_bar-left_menu-button"} />
                    <Menu>
                      <MenuItem
                        text={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between"
                            }}>
                            <div style={{ color: Colors.LIGHT_GRAY1 }}>{this.state.isGutterSplit ? "✓" : ""}</div>
                            <div>Split Gutter</div>
                          </div>
                        }
                        onClick={() =>
                          this.setState({
                            isGutterSplit: !this.state.isGutterSplit
                          })
                        }
                      />
                    </Menu>
                  </Popover>
                </ButtonGroup>
              </Menu>
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT} className="main-nav_bar-right_group">
              <Button icon="cog" minimal={true} className={"main-nav_bar-right_menu-button"} onClick={this.handleSettingsButtonClick}></Button>
            </Navbar.Group>
          </Navbar>
        </div>
        <Alert
          isOpen={this.state.newWarningVisible}
          transitionDuration={100}
          canOutsideClickCancel
          canEscapeKeyCancel
          cancelButtonText="No, cancel"
          confirmButtonText="Yes, start over"
          intent={Intent.DANGER}
          onConfirm={(e) => {
            this.props.messenger.postMessage("NEW");
            this.setState({
              newWarningVisible: false
            });
          }}
          onCancel={(e) => {
            this.setState({
              newWarningVisible: false
            });
          }}>
          Are you sure you want to start over?
        </Alert>
        <SettingsDrawer
          size={"55%"}
          onClose={this.handleSettingsButtonClick}
          isOpen={this.state.settingsDrawerVisible}
          onSubmit={() => {
            this.setState({
              settings: this.props.messenger.postMessage("SUBMIT_ALL_SETTINGS")[0]
            });
          }}>
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
                <TabPanel key={"settings-tabpanel-"+key}>
                  <SettingsPanel messenger={this.props.messenger} category={key} />
                </TabPanel>
              );
            })}
          </Tabs>
        </SettingsDrawer>

        <Drawer
          position={Position.RIGHT}
          size="100%"
          autoFocus={true}
          enforceFocus={true}
          hasBackdrop={true}
          onClose={this.handleMaterialBarClose}
          canOutsideClickClose={true}
          canEscapeKeyClose={true}
          isCloseButtonShown={true}
          title="Material Selection"
          isOpen={this.state.materialDrawerOpen}>
          <MaterialDrawer
            messenger={this.props.messenger}
            object={this.state.selectedObject && this.state.selectedObject instanceof Surface ? this.state.selectedObject : undefined}
          />
        </Drawer>

        <ImportDialog
          onImport={(file) => {
            this.props.messenger.postMessage("IMPORT_FILE", file);
            this.handleImportDialogClose();
          }}
          isOpen={this.state.importDialogVisible}
          autoFocus={true}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          enforceFocus={false}
          usePortal={true}
          data={{ themeName: "dark" }}
          onClose={this.handleImportDialogClose}
          onDrop={(file) => {
            this.props.messenger.postMessage("IMPORT_FILE", file);
          }}
        />

        <SplitterLayout secondaryMinSize={5} primaryMinSize={50} secondaryInitialSize={200} primaryIndex={1} customClassName="modified-splitter-layout">
          {/* object view */}
          <PanelContainer>
            <ObjectView
              containers={this.state.containers}
              solvers={this.state.solvers}
              onClick={this.handleObjectViewClick}
              onDelete={this.handleObjectViewDelete}
            />
          </PanelContainer>

          {/* center and right */}
          <SplitterLayout secondaryMinSize={0} primaryMinSize={50} secondaryInitialSize={250} primaryIndex={0}>
            {/* webgl canvas & gutter*/}
            <SplitterLayout vertical={true} primaryMinSize={40} secondaryMinSize={1} secondaryInitialSize={window.innerHeight/6} customClassName="canvas-gutter">
              <div className="webgl-canvas">
                <div id="canvas_overlay" ref={this.canvasOverlay}></div>
                <canvas id="renderer-canvas" ref={this.canvas} />
              </div>

              <SplitterLayout primaryIndex={0}>
                <PanelContainer className="panel full-bottom gutter-panel">
                  <Gutter messenger={this.props.messenger} solvers={this.state.solvers} key={"gutter-panel"} />
                </PanelContainer>
                {this.state.isGutterSplit ? (
                  <PanelContainer className="panel full-bottom gutter-panel">
                    <Results messenger={this.props.messenger} solvers={this.state.solvers} key={"results-panel"} />
                  </PanelContainer>
                ) : null}
              </SplitterLayout>
            </SplitterLayout>

            <PanelContainer>
              {(() => {
                if (Object.keys(this.state.selectedObject).length > 0) {
                  return (
                    <ObjectProperties
                      messenger={this.props.messenger}
                      object={this.state.selectedObject}
                      onPropertyChange={this.handleObjectPropertyChange}
                      onPropertyValueChangeAsNumber={this.handleObjectPropertyValueChangeAsNumber}
                      onPropertyValueChangeAsString={this.handleObjectPropertyValueChangeAsString}
                      onButtonClick={this.handleObjectPropertyButtonClick}
                    />
                  );
                }
              })()}
            </PanelContainer>
          </SplitterLayout>
        </SplitterLayout>
      </div>
    );
	}
}
