import React from "react";
import SplitterLayout from "react-splitter-layout";
import {
  FocusStyleManager,
  Navbar,
  Button,
  Menu,
  MenuItem,
  Popover,
  ButtonGroup,
  Position,
  MenuDivider,
  Drawer,
  Colors,
  Alert,
  Intent,
  Toaster,
  IToastProps
} from "@blueprintjs/core";
import MenuItemText from './menu-item-text/MenuItemText';
import { ItemListRenderer, IItemListRendererProps } from "@blueprintjs/select";
import ContextMenu from "./context-menu/ContextMenu";
import ImportDialog from "./import-dialog/ImportDialog";

import ObjectView from "./object-view/ObjectView";
// import ObjectTreeView from "./object-view/ObjectTreeView";

import ConstructionsView from "./ConstructionsView";
import Container from "../objects/container";
import PanelContainer from "./panel-container/PanelContainer";
import ObjectProperties from "./ObjectProperties/index";
import Messenger from "../state/messenger";
import { KeyValuePair } from "../common/key-value-pair";
import SettingsDrawer from "./settings-drawer/SettingsDrawer";
import { Setting } from "../setting";
import { Report } from "../common/browser-report";

import "../css";
import "./App.css";

import { ToolNames } from "../constants/tool-names";
import { EditorModes } from "../constants/editor-modes";
import { Characters } from "../constants/characters";
import Solver from "../compute/solver";

import ParameterConfig from './parameter-config/ParameterConfig';
import { Stat } from "./parameter-config/Stats";
import { ObjectPropertyInputEvent } from "./ObjectProperties";
import Surface from "../objects/surface";
import { AcousticMaterial } from "../db/acoustic-material";
import MaterialDrawer from "./material-drawer/MaterialDrawer";
import { SettingsPanel } from "./setting-components/SettingsPanel";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import properCase from "../common/proper-case";
import { ApplicationSettings } from "../default-settings";
import Gutter from "./gutter/Gutter";
import NavbarMenuItemLabel from "./NavbarMenuItemLabel";
import SaveDialog from "./SaveDialog";
import OpenWarning from "./OpenWarning";

import { NavBarComponent } from './NavBarComponent';
import { Actions, StateAction } from "../state/actions";


const AppToaster = Toaster.create({
  className: "app-toaster",
  position: Position.TOP,
  maxToasts: 5
});


FocusStyleManager.onlyShowFocusOnTabs();



export interface AppProps {
  messenger: Messenger;
  containers: KeyValuePair<Container>;
  settings: ApplicationSettings;
  browser: Report;
  rightPanelTopInitialSize: number;
  bottomPanelInitialSize: number;
  rightPanelInitialSize: number;
  leftPanelInitialSize: number;
}

interface AppState {
  rightPanelTopSize: number;
  bottomPanelSize: number;
  rightPanelSize: number;
  leftPanelSize: number;
  
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
  
  constructions: KeyValuePair<Container>;
  
}

export default class App extends React.Component<AppProps, AppState> {
	state: AppState;
  canvas: React.RefObject<HTMLCanvasElement>;
  canvasOverlay: React.RefObject<HTMLDivElement>;
  orientationOverlay: React.RefObject<HTMLDivElement>;
  responseOverlay: React.RefObject<HTMLDivElement>;
	statsCanvas: React.RefObject<HTMLCanvasElement>;
	prog: any;
	constructor(props: AppProps) {
		super(props);
    this.state = {
      canDuplicate: false,
      rightPanelTopSize: this.props.rightPanelTopInitialSize,
      bottomPanelSize: this.props.bottomPanelInitialSize,
      rightPanelSize: this.props.rightPanelInitialSize,
      leftPanelSize: this.props.leftPanelInitialSize,
      rendererStatsVisible: true,
      saveDialogVisible: false,
      projectName: this.props.messenger.postMessage(Actions.GET_PROJECT_NAME) || "",
      constructions: this.props.messenger.postMessage(Actions.GET_CONSTRUCTIONS) || {},
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
    this.canvasOverlay = React.createRef<HTMLDivElement>();
    this.orientationOverlay = React.createRef<HTMLDivElement>();
    this.statsCanvas = React.createRef<HTMLCanvasElement>();
    
		this.showImportDialog = this.showImportDialog.bind(this);
		this.handleImportDialogClose = this.handleImportDialogClose.bind(this);
		this.handleObjectViewClick = this.handleObjectViewClick.bind(this);
		this.handleObjectViewDelete = this.handleObjectViewDelete.bind(this);
		this.handleObjectPropertyChange = this.handleObjectPropertyChange.bind(this);
		this.handleObjectPropertyValueChangeAsNumber = this.handleObjectPropertyValueChangeAsNumber.bind(this);
		this.handleObjectPropertyValueChangeAsString = this.handleObjectPropertyValueChangeAsString.bind(this);
		this.handleSettingsButtonClick = this.handleSettingsButtonClick.bind(this);
		this.handleMaterialDrawerClose = this.handleMaterialDrawerClose.bind(this);
		this.handleMaterialDrawerItemSelect = this.handleMaterialDrawerItemSelect.bind(this);
		this.handleSettingChange = this.handleSettingChange.bind(this);
		this.handleObjectPropertyButtonClick = this.handleObjectPropertyButtonClick.bind(this);
    this.addMessageHandler = this.addMessageHandler.bind(this);
    this.handleSettingsTabChange = this.handleSettingsTabChange.bind(this);
    this.saveLayout = this.saveLayout.bind(this);
	}
	addMessageHandler(message: StateAction, handler: (acc, ...args) => KeyValuePair<any>, cb?: ()=>void) {
		this.props.messenger.addMessageHandler(message, (acc, ...args) => {
			const nextState = handler(acc, ...args);
			this.setState({
				lastUpdateReason: message,
				...nextState
			}, cb || (()=> {}))
		})
	}
  setupMessageHandlers() {
    
    this.props.messenger.addMessageHandler(Actions.CAN_DUPLICATE, () => {
      return this.state.canDuplicate;
    })
    
    this.addMessageHandler(Actions.UNDO, (acc, ...args) => {
      const [canUndo, canRedo] = acc[0];
      return {
        canUndo,
        canRedo
      }
    })
    this.addMessageHandler(Actions.REDO, (acc, ...args) => {
      const [canUndo, canRedo] = acc[0];
      return {
        canUndo,
        canRedo
      }
    })
    this.addMessageHandler(Actions.NEW, () => {
      return {
        selectedObject: {} as Container,
        containers: {} as KeyValuePair<Container>,
        lastUpdateReason: Actions.NEW
      }
    });
    this.addMessageHandler(Actions.DESELECT_ALL_OBJECTS, () => {
      return {
        canDuplicate: false,
        selectedObject: {} as Container,
        lastUpdateReason: Actions.DESELECT_ALL_OBJECTS
      };
    });
    
    this.addMessageHandler(Actions.SET_SELECTION, (acc, objects) => {
      if (objects instanceof Array) {
        return {
          canDuplicate: objects.filter(x=>["source", "receiver"].includes(x.kind)).length == objects.length,
          selectedObject: objects[objects.length - 1],
          lastUpdateReason: Actions.SET_SELECTION
        };
      }
      else return {}
    })
    
    this.addMessageHandler(Actions.APPEND_SELECTION, (acc, objects) => {
      if (objects instanceof Array) {
        return {
          selectedObject: objects[objects.length - 1],
          lastUpdateReason: Actions.APPEND_SELECTION
        };
      } else return {};
    })
    
    this.addMessageHandler(Actions.SET_OBJECT_VIEW, (acc, object) => {
      if (!object.uuid) {
        return {}
      }
      else {
        return {
          selectedObject: object,
          lastUpdateReason: Actions.SET_OBJECT_VIEW
        };
      }
    });
        
    this.addMessageHandler(Actions.SHOW_TOAST, (acc, toastProps: IToastProps) => {
      AppToaster.show(toastProps);
      return {};
    });
    
		this.addMessageHandler(Actions.SHOW_NEW_WARNING,
			() => {
				return ({
					newWarningVisible: true
			})
    });

    this.addMessageHandler(Actions.SHOW_OPEN_WARNING,
			() => {
				return ({
					openWarningVisible: true
			})
    });
    
		this.addMessageHandler(Actions.SHOW_TERMINAL,
			() => {
			return ({
				terminalOpen: true
			});
		});
		this.addMessageHandler(Actions.TOGGLE_TERMINAL,
			() => {
      return {
        terminalOpen: !this.state.terminalOpen
      };
    });
		this.addMessageHandler(Actions.OPEN_MATERIAL_SEARCH,
			(acc, ...args) => {
			return {
        materialDrawerOpen: true
      };
    });
    this.addMessageHandler(Actions.SHOW_SETTINGS_DRAWER, () => {
      return {
        settingsDrawerVisible: true
      };
    });
    

		// this.addMessageHandler(Actions.ASSIGN_MATERIAL,
    //   (acc, material, id) => {
    //     if (id) {
    //       const surface = this.props.messenger.postMessage(Actions.FETCH_SURFACE, id)[0] as Surface;
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

		this.addMessageHandler(Actions.TOGGLE_MATERIAL_SEARCH,
			(acc, ...args) => {
      return {
        materialDrawerOpen: !this.state.materialDrawerOpen
      };
    });
		this.addMessageHandler(Actions.UPDATE_CHART_DATA,
			(acc, ...args) => {
			return ({
				chartData: args[0]
			})
		})
		this.addMessageHandler(Actions.SHOW_IMPORT_DIALOG,
			(acc, ...args) => {
			return {
				importDialogVisible: !this.state.importDialogVisible,
			};
		});
		this.addMessageHandler(Actions.SHOW_IMPORT_DIALOG,
			(acc, ...args) => {
				return ({
          importDialogVisible: !this.state.importDialogVisible,
        });
			}
    );
    
    this.addMessageHandler(Actions.SHOULD_REMOVE_CONTAINER,
      (acc, ...args) => {
      if (args[0] && this.state.containers[args[0]]) {
        const containers = { ...this.state.containers };
        const selectedObject = this.state.selectedObject;
        delete containers[args[0]];
        return {
          selectedObject: selectedObject && selectedObject.uuid === args[0] ? {} as Container : selectedObject,
          containers,
          lastUpdateReason: Actions.SHOULD_REMOVE_CONTAINER
        }
      }
      else {
        return {}
      }
    })
		this.addMessageHandler(Actions.SHOULD_ADD_SOURCE,
			(acc, ...args) => {
				const containers = this.props.messenger.postMessage(Actions.GET_CONTAINERS);
				// containers[acc[0].uuid] = acc[0];
				return ({
          containers,
          lastUpdateReason: Actions.SHOULD_ADD_SOURCE
        });
			}
		);
		this.addMessageHandler(Actions.SHOULD_ADD_RECEIVER,
			(acc, ...args) => {
        const containers = this.props.messenger.postMessage(Actions.GET_CONTAINERS);
				// containers[acc[0].uuid] = acc[0];
        return ({
          containers,
          lastUpdateReason: Actions.SHOULD_ADD_RECEIVER
        });
			}
		);
		this.addMessageHandler(Actions.SHOULD_ADD_RAYTRACER,
      ({ props }) => {
				const solvers = { ...this.state.solvers };
				solvers[props.uuid] = props;
				return ({ solvers });
			}
    );
    this.addMessageHandler(Actions.SHOULD_REMOVE_SOLVER, (acc, ...args) => {
      if (args[0] && this.state.solvers[args[0]]) {
        const solvers = { ...this.state.solvers };
        const selectedObject = this.state.selectedObject;
        delete solvers[args[0]];
        return {
          selectedObject: selectedObject && selectedObject.uuid === args[0] ? ({} as Container) : selectedObject,
          solvers,
          lastUpdateReason: Actions.SHOULD_REMOVE_SOLVER
        };
      }
      else {
        return {}
      }
    });
		this.addMessageHandler(Actions.SHOULD_ADD_RT60,
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
		this.addMessageHandler(Actions.SHOULD_ADD_FDTD,
			(acc, ...args) => {
				const solvers = { ...this.state.solvers };
				solvers[acc[0].uuid] = acc[0];
				return ({ solvers });
			}
		);		

    this.addMessageHandler(Actions.SHOULD_ADD_FDTD_2D,
			(acc, ...args) => {
				const solvers = { ...this.state.solvers };
				solvers[acc[0].uuid] = acc[0];
				return ({ solvers });
			}
		);		

		this.addMessageHandler(Actions.ADDED_ROOM,
      ({ room }) => {
			const containers = { ...this.state.containers };
			containers[room.uuid] = room;
			return ({ containers });
		});
		this.addMessageHandler(Actions.IMPORT_FILE,
			(acc, ...args) => {
				// console.log(acc);
				return {}
			}
		);
		this.addMessageHandler(Actions.STATS_SETUP,
      ({ stats }) => {
			return {
        stats: Object.keys(stats).map(x => stats[x]) as Stat[]
      };
		});
		this.addMessageHandler(Actions.STATS_UPDATE,
			({ stats }) => {
			return {
        stats: Object.keys(stats).map(x => stats[x]) as Stat[]
      };
    });
    this.addMessageHandler(Actions.SHOW_SAVE_DIALOG, (acc, ...args) => {
      return ({
        saveDialogVisible: true
      })
    })
    this.addMessageHandler(Actions.SHOW_SAVE_DIALOG_THEN_OPEN, (acc, ...args) => {
      return ({
        saveDialogVisible: true,
        openAfterSave: true
      })
    })
    this.addMessageHandler(Actions.SET_PROJECT_NAME, (acc, ...args) => {
      return {
        projectName: (args && args[0]) || this.state.projectName
      };
    })

    this.addMessageHandler(Actions.ADD_CONSTRUCTION, (acc, ...args) => {
      return {
        constructions: this.props.messenger.postMessage(Actions.GET_CONSTRUCTIONS)
      };
    })

    this.addMessageHandler(Actions.REMOVE_CONSTRUCTION, (acc, ...args) => {
      return {
        constructions: this.props.messenger.postMessage(Actions.GET_CONSTRUCTIONS)
      };
    })

	}

	componentDidMount() {
		this.canvas.current &&
			this.props.messenger.postMessage(
				Actions.APP_MOUNTED,
				{canvas: this.canvas.current}
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
    console.log(e.currentTarget);
    if (object instanceof Container && object['kind']!=="room") {
      if (e.shiftKey) {
        this.props.messenger.postMessage(Actions.APPEND_SELECTION, { objects: [object] })
      }
      else {
        this.props.messenger.postMessage(Actions.SET_SELECTION, { objects: [object] });
      }
    }
  }
  handleObjectViewDelete(object: Container) {
    if (object instanceof Container) {
      this.props.messenger.postMessage(Actions.SHOULD_REMOVE_CONTAINER, { id: object.uuid });
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
			case "select":
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
        this.props.messenger.postMessage(Actions.SETTING_CHANGE, {
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
	
	handleMaterialDrawerClose(e) {
		this.setState({
			materialDrawerOpen: false
		})
	}
	handleMaterialDrawerItemSelect(e) {
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
  
  saveLayout() {
    const layout = {
      bottomPanelInitialSize: this.state.bottomPanelSize,
      rightPanelInitialSize: this.state.rightPanelSize,
      leftPanelInitialSize: this.state.leftPanelSize,
      rightPanelTopInitialSize: this.state.rightPanelTopSize
    };
    localStorage.setItem("layout", JSON.stringify(layout));
  }
  
	render() {
		return (
      <div>
        <NavBarComponent
          canUndo={this.state.canUndo}
          canRedo={this.state.canRedo}
          canDuplicate={this.state.canDuplicate}
          projectName={this.state.projectName}
          rendererStatsVisible={this.state.rendererStatsVisible}
        />
        <Alert
          isOpen={this.state.newWarningVisible}
          transitionDuration={100}
          canOutsideClickCancel
          canEscapeKeyCancel
          cancelButtonText="No, cancel"
          confirmButtonText="Yes, start over"
          intent={Intent.DANGER}
          onConfirm={(e) => {
            this.props.messenger.postMessage(Actions.NEW);
            this.setState({
              newWarningVisible: false
            });
          }}
          onCancel={(e) => {
            this.setState({
              newWarningVisible: false
            });
          }}
        >
          Are you sure you want to start over?
        </Alert>
        <OpenWarning
          isOpen={this.state.openWarningVisible}
          onDiscard={(e) => {
            this.setState(
              {
                openWarningVisible: false
              },
              () => this.props.messenger.postMessage(Actions.OPEN)
            );
          }}
          onSave={(e) => {
            this.setState(
              {
                openWarningVisible: false
              },
              () => {
                this.props.messenger.postMessage(Actions.SHOW_SAVE_DIALOG_THEN_OPEN);
              }
            );
          }}
          onCancel={(e) => {
            this.setState({
              openWarningVisible: false
            });
          }}
        />
        <SaveDialog
          messenger={this.props.messenger}
          isOpen={this.state.saveDialogVisible}
          filename={this.props.messenger.postMessage(Actions.GET_PROJECT_NAME)||""}
          onCancel={() => this.setState({ saveDialogVisible: false })}
          onSave={(e) => {
            let openAfterSaveCallback = () => {
              this.setState(
                {
                  openAfterSave: false
                },
                () => this.props.messenger.postMessage(Actions.OPEN)
              );
            };
            openAfterSaveCallback = openAfterSaveCallback.bind(this);
            const callback = this.state.openAfterSave ? openAfterSaveCallback : () => {};
            this.setState(
              {
                projectName: e.filename,
                saveDialogVisible: false
              },
              () => {
                this.props.messenger.postMessage(Actions.SAVE, {
                  filename: this.state.projectName,
                  callback
                });
              }
            );
          }}
        />
        <SettingsDrawer
          size={"55%"}
          onClose={this.handleSettingsButtonClick}
          isOpen={this.state.settingsDrawerVisible}
          onSubmit={() => {
            this.setState({
              settings: this.props.messenger.postMessage(Actions.SUBMIT_ALL_SETTINGS)!
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
          onClose={this.handleMaterialDrawerClose}
          canOutsideClickClose={true}
          canEscapeKeyClose={true}
          isCloseButtonShown={true}
          title="Material Selection"
          isOpen={this.state.materialDrawerOpen}
        >
          <MaterialDrawer
            messenger={this.props.messenger}
            object={
              this.state.selectedObject && this.state.selectedObject instanceof Surface
                ? this.state.selectedObject
                : undefined
            }
          />
        </Drawer>

        <ImportDialog
          onImport={(file) => {
            this.props.messenger.postMessage(Actions.IMPORT_FILE, file);
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
            this.props.messenger.postMessage(Actions.IMPORT_FILE, file);
          }}
        />

        <SplitterLayout
          secondaryMinSize={5}
          primaryMinSize={50}
          secondaryInitialSize={this.props.leftPanelInitialSize}
          primaryIndex={1}
          customClassName="modified-splitter-layout"
          onDragStart={() => {
            this.props.messenger.postMessage(Actions.SET_RENDERER_SHOULD_ANIMATE, {animate: true});
          }}
          onDragEnd={() => {
            this.props.messenger.postMessage(Actions.SET_RENDERER_SHOULD_ANIMATE, {animate: false});
            this.saveLayout();
          }}
          onSecondaryPaneSizeChange={(value: number) => {
            this.setState({ leftPanelSize: value });
          }}
        >
          {/* object view */}
          <PanelContainer>
            <ObjectView
              containers={this.state.containers}
              solvers={this.state.solvers}
              onClick={this.handleObjectViewClick}
              onDelete={this.handleObjectViewDelete}
              messenger={this.props.messenger}
            />
            {/* <ObjectTreeView containers={this.state.containers} /> */}
            <ConstructionsView constructions={this.state.constructions} messenger={this.props.messenger} />
          </PanelContainer>

          {/* center and right */}
          <SplitterLayout
            secondaryMinSize={0}
            primaryMinSize={50}
            secondaryInitialSize={this.props.rightPanelInitialSize}
            primaryIndex={0}
            onDragStart={() => {
              this.props.messenger.postMessage(Actions.SET_RENDERER_SHOULD_ANIMATE, {animate: true});
            }}
            onDragEnd={() => {
              this.props.messenger.postMessage(Actions.SET_RENDERER_SHOULD_ANIMATE, { animate: false});
              this.saveLayout();
            }}
            onSecondaryPaneSizeChange={(value: number) => {
              this.setState({ rightPanelSize: value });
            }}
          >
            {/* webgl canvas & gutter*/}
            {/* <SplitterLayout
              vertical={true}
              primaryMinSize={100}
              secondaryMinSize={1}
              secondaryInitialSize={this.props.bottomPanelInitialSize}
              customClassName="canvas-parameter-config"
              onDragStart={() => {
                this.props.messenger.postMessage(Actions.SET_RENDERER_SHOULD_ANIMATE, true);
              }}
              onDragEnd={() => {
                this.props.messenger.postMessage(Actions.SET_RENDERER_SHOULD_ANIMATE, false);
                this.saveLayout();
              }}
              onSecondaryPaneSizeChange={(value: number) => {
                this.setState({ bottomPanelSize: value });
              }}
            >
              <div className="webgl-canvas">
                <div
                  id="response-overlay"
                  className={"response_overlay response_overlay-hidden"}
                  ref={this.responseOverlay}
                ></div>
                <div id="canvas_overlay" ref={this.canvasOverlay}></div>
                <div id="orientation-overlay" ref={this.orientationOverlay}></div>
                <canvas id="renderer-canvas" ref={this.canvas} />
              </div>

              <PanelContainer className="panel full-bottom gutter-panel" margin>
                <Gutter messenger={this.props.messenger} />
              </PanelContainer>
            </SplitterLayout> */}

              <div className="webgl-canvas">
                <div
                  id="response-overlay"
                  className={"response_overlay response_overlay-hidden"}
                  ref={this.responseOverlay}
                ></div>
                <div id="canvas_overlay" ref={this.canvasOverlay}></div>
                <div id="orientation-overlay" ref={this.orientationOverlay}></div>
                <canvas id="renderer-canvas" ref={this.canvas} />
              </div>

            <SplitterLayout
              vertical={true}
              primaryMinSize={40}
              secondaryMinSize={1}
              secondaryInitialSize={this.props.rightPanelTopInitialSize}
              customClassName="canvas-parameter-config"
              onDragEnd={() => {
                this.saveLayout();
              }}
              onSecondaryPaneSizeChange={(value: number) => {
                this.setState({ rightPanelTopSize: value });
              }}
            >
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
              <PanelContainer className="panel full parameter-config-panel">
                <ParameterConfig
                  messenger={this.props.messenger}
                  solvers={this.state.solvers}
                  key={"parameter-config-panel"}
                />
              </PanelContainer>
            </SplitterLayout>
          </SplitterLayout>
        </SplitterLayout>
      </div>
    );
	}
}
