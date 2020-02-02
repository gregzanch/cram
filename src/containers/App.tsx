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
	AnchorButton
} from "@blueprintjs/core";
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
import { Setting } from "../common/setting";
import { Report } from "../common/browser-report";

import "../css";
import { ToolName } from "../constants/tool-names";
import { EditorMode } from "../constants/editor-modes";
// import { Process, Task } from "../common/process";
import SettingsDrawerCheckBox from "../components/setting-components/SettingsDrawerCheckbox";
import Solver from "../compute/solver";

FocusStyleManager.onlyShowFocusOnTabs();

export interface AppProps {
	messenger: Messenger;
	containers: KeyValuePair<Container>;
	settings: KeyValuePair<any>;
	browser: Report;
}



interface AppState {
	importDialogVisible: boolean;
	containers: KeyValuePair<Container>;
	selectedObject: Container;
	settingsDrawerVisible: boolean;
	settings: KeyValuePair<any>;
	mode: EditorMode;
	// process: Process;
	solvers: KeyValuePair<Solver>;
	tool: ToolName;
	simulationRunning: boolean;
}

export default class App extends React.Component<AppProps, AppState> {
	state: AppState;
	canvas: React.RefObject<HTMLCanvasElement>;
	prog: any;
	constructor(props: AppProps) {
		super(props);
		this.state = {
			solvers: {} as KeyValuePair<Solver>,
			simulationRunning: false,
			importDialogVisible: false,
			containers: {} as KeyValuePair<Container>,
			selectedObject: {} as Container,
			settingsDrawerVisible: false,
			settings: props.settings,
			mode: "EDIT",
			tool: "SELECT",
			// process: new Process({name: "base", steps: [] as Task[]})
			
		};
		this.setupMessageHandlers = this.setupMessageHandlers.bind(this);
		this.setupMessageHandlers();

		this.canvas = React.createRef<HTMLCanvasElement>();
		this.showImportDialog = this.showImportDialog.bind(this);
		this.handleImportDialogClose = this.handleImportDialogClose.bind(this);
		this.handleObjectViewClick = this.handleObjectViewClick.bind(this);
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
		this.handleSettingChange = this.handleSettingChange.bind(this);
	}

	setupMessageHandlers() {
		this.props.messenger.addMessageHandler(
			"SHOW_IMPORT_DIALOG",
			(acc, ...args) => {
				this.setState({
					importDialogVisible: !this.state.importDialogVisible
				});
			}
		);

		this.props.messenger.addMessageHandler(
			"SHOULD_ADD_SOURCE",
			(acc, ...args) => {
				const containers = { ...this.state.containers };
				containers[acc[0].uuid] = acc[0];
				return this.setState({ containers });
			}
		);

		this.props.messenger.addMessageHandler(
			"SHOULD_ADD_RECEIVER",
			(acc, ...args) => {
				const containers = { ...this.state.containers };
				containers[acc[0].uuid] = acc[0];
				return this.setState({ containers });
			}
		);
		this.props.messenger.addMessageHandler(
			"SHOULD_ADD_RAYTRACER",
			(acc, ...args) => {
				const solvers = { ...this.state.solvers };
				solvers[acc[0].uuid] = acc[0];
				return this.setState({ solvers });
			}
		);

		this.props.messenger.addMessageHandler(
			"SHOULD_ADD_FDTD",
			(acc, ...args) => {
				const solvers = { ...this.state.solvers };
				solvers[acc[0].uuid] = acc[0];
				return this.setState({ solvers });
			}
		);

		
		this.props.messenger.addMessageHandler("ADDED_ROOM", (acc, ...args) => {
			const containers = { ...this.state.containers };
			containers[args[0].uuid] = args[0];
			return this.setState({ containers });
		});

		this.props.messenger.addMessageHandler(
			"IMPORT_FILE",
			(acc, ...args) => {
				console.log(acc);
			}
		);
		this.props.messenger.addMessageHandler("SIMULATION_DID_PLAY", (acc, ...args) => {
			this.setState({
				simulationRunning: true
			},()=>console.log("SIMULATION_DID_PLAY"));
		})
			this.props.messenger.addMessageHandler("SIMULATION_DID_PAUSE", (acc, ...args) => {
			this.setState({
				simulationRunning: false
			},()=>console.log("SIMULATION_DID_PAUSE"));
		})
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
			importDialogVisible: !this.state.importDialogVisible
		});
	}
	handleImportDialogClose(e?) {
		this.setState({
			importDialogVisible: !this.state.importDialogVisible
		});
	}
	handleSettingsButtonClick(e?) {
		this.setState({
			settingsDrawerVisible: !this.state.settingsDrawerVisible
		});
	}

	handleObjectViewClick(object, e: React.MouseEvent) {
		console.log(object);
		this.setState({
			selectedObject: object
		});
	}

	handleObjectPropertyValueChangeAsNumber(
		id: string,
		prop: string,
		valueAsNumber: number
	) {
		const { selectedObject } = this.state;
		selectedObject[prop] = valueAsNumber;
		this.setState({
			selectedObject
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
			selectedObject
		});
	}

	handleObjectPropertyChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { selectedObject } = this.state;
		const prop = e.currentTarget.name;
		switch (e.currentTarget.type) {
			case "checkbox":
				selectedObject[prop] = e.currentTarget.checked;
				break;
			case "text":
				selectedObject[prop] = e.currentTarget.value;
				break;
			case "number":
				selectedObject[prop] = Number(e.currentTarget.value);
				break;
			default:
				selectedObject[prop] = e.currentTarget.value;
				break;
		}
		this.setState({
			selectedObject
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
				settings
			},
			() => {
				this.props.messenger.postMessage("SETTING_CHANGE", {
					setting: id,
					value: settings[id].value
				});
			}
		);
	}

	render() {
		return (
			<div>
				<div>
					<Navbar>
						<Navbar.Group align={Alignment.LEFT}>
							<Navbar.Group
								style={{
									fontSize: "16pt",
									verticalAlign: "text-top",
									margin: "0 0 .25em"
								}}>
								{/* <img src={resolve_svg} alt="resolve" /> */}
								cram.ui
							</Navbar.Group>
							<Navbar.Divider />

							<Menu>
								<ButtonGroup minimal={true}>
									<Popover
										minimal={true}
										transitionDuration={50}
										position={Position.BOTTOM_LEFT}>
										<Button text="File" />
										<Menu>
											<MenuItem
												text="New"
												disabled></MenuItem>
											<MenuItem
												text="Open"
												disabled></MenuItem>
											<MenuItem
												text="Save"
												disabled></MenuItem>
											<MenuDivider />
											<MenuItem
												text="Import"
												onClick={
													this.showImportDialog
												}></MenuItem>
											<MenuItem
												text="Export"
												disabled></MenuItem>
										</Menu>
									</Popover>
									<Popover
										minimal={true}
										transitionDuration={50}
										position={Position.BOTTOM_LEFT}>
										<Button text="Edit" />
										<Menu>
											<MenuItem
												text="Undo"
												disabled></MenuItem>
											<MenuItem
												text="Redo"
												disabled></MenuItem>
											<MenuDivider />
											<MenuItem
												text="Cut"
												disabled></MenuItem>
											<MenuItem
												text="Copy"
												disabled></MenuItem>
											<MenuItem
												text="Paste"
												disabled></MenuItem>
										</Menu>
									</Popover>
									<Popover
										minimal={true}
										transitionDuration={50}
										position={Position.BOTTOM_LEFT}>
										<Button text="Add" />
										<Menu>
											<MenuItem
												text={
													<div style={{display: "flex", justifyContent: "space-between" }}>
														<div>Source</div>
														<div style={{color:Colors.LIGHT_GRAY1}}>{Characters.COMMAND}</div>
													</div>
												}
												onClick={() =>
													this.props.messenger.postMessage(
														"SHOULD_ADD_SOURCE"
													)
												}/>
											<MenuItem
												text="Receiver"
												onClick={() =>
													this.props.messenger.postMessage(
														"SHOULD_ADD_RECEIVER"
													)
												}></MenuItem>
											<MenuDivider />
											<MenuItem
												text={
													<div style={{display: "flex", justifyContent: "space-between" }}>
														<div>Ray Tracer</div>
														<div style={{color:Colors.LIGHT_GRAY1}}>{Characters.COMMAND}</div>
													</div>
												}
												onClick={() =>
													this.props.messenger.postMessage(
														"SHOULD_ADD_RAYTRACER"
													)
												}/>
										</Menu>
									</Popover>
									<Button
										icon={this.state.simulationRunning ? "pause" : "play"} 
										onClick={e => {
											this.props.messenger.postMessage(this.state.simulationRunning ? "SIMULATION_SHOULD_PAUSE" : "SIMULATION_SHOULD_PLAY");
										}} />
									
									<Button
										icon={"refresh"} 
										onClick={e => {
											this.props.messenger.postMessage("SIMULATION_SHOULD_CLEAR");
										}} />
									
								</ButtonGroup>
							</Menu>
						</Navbar.Group>
						<Navbar.Group align={Alignment.RIGHT}>
							<Button
								icon="cog"
								minimal={true}
								onClick={
									this.handleSettingsButtonClick
								}></Button>
						</Navbar.Group>
					</Navbar>
				</div>
				<SettingsDrawer
					size={"35%"}
					onClose={this.handleSettingsButtonClick}
					isOpen={this.state.settingsDrawerVisible}
				>
					<input name="background" type="color" onChange={e => this.props.messenger.postMessage("renderer-should-change-background", e.currentTarget.value)} />
					<input name="fogColor" type="color" onChange={e => this.props.messenger.postMessage("renderer-should-change-fogColor", e.currentTarget.value)} />
				</SettingsDrawer>
				<ImportDialog
					onImport={file => {
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
					onDrop={file => {
						this.props.messenger.postMessage("IMPORT_FILE", file);
					}}
				/>
				<SplitterLayout
					secondaryMinSize={50}
					primaryMinSize={50}
					secondaryInitialSize={250}
					primaryIndex={1}
					customClassName="modified-splitter-layout">
					<SplitterLayout
						vertical={true}
						primaryMinSize={10}
						secondaryMinSize={10}
						percentage={true}>
						<PanelContainer>
							<ObjectView
								containers={this.state.containers}
								solvers={this.state.solvers}
								onClick={this.handleObjectViewClick}
							/>
						</PanelContainer>
						<PanelContainer className="panel full-bottom">
							{(Object.keys(this.state.selectedObject).length > 0) && (
								<ObjectProperties
									object={this.state.selectedObject}
									onPropertyChange={this.handleObjectPropertyChange}
									onPropertyValueChangeAsNumber={this.handleObjectPropertyValueChangeAsNumber}
									onPropertyValueChangeAsString={this.handleObjectPropertyValueChangeAsString}
								/>
							)}
						</PanelContainer>
					</SplitterLayout>
					<div className="webgl-canvas">
						<FloatControls />
						<canvas ref={this.canvas} />
					</div>
				</SplitterLayout>
			</div>
		);
	}
}

export function FloatButton(props) {
	return (
		<div className="float-button">{props.children}</div>
	)
}

export function FloatControls(props) {
	return (
		<div className="float-controls">
			<ButtonGroup vertical>
				<Button small active={true} icon="select" />
				<Button small active={false} icon="move" />
				<Button small active={false} icon="refresh" />
				<Button small active={false} icon="maximize" />
			</ButtonGroup>
		</div>
	);
}


function SelectIcon(props) {
	return (
		<svg
			width="42"
			height="42"
			viewBox="-4 -4 45 45"
			fill="none"
			xmlns="http://www.w3.org/2000/svg">
			<path
				d="M1 1H36V36H1V1Z"
				stroke="#999A9C"
				stroke-width="2"
				stroke-linejoin="round"
				stroke-dasharray="6 2"
			/>
			<path
				d="M13.3036 28.1857L12.84 9.14134L26.9837 21.9031L18.2498 21.0481L13.3036 28.1857Z"
				fill="#ECECEC"
				stroke="#7C7C7C"
			/>
		</svg>
	);

}