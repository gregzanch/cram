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
	Colors
} from "@blueprintjs/core";
import { Characters } from "../constants";
import ImportDialog from "../components/ImportDialog";
import ObjectView from "../components/ObjectView";
import resolve_svg from "../svg/resolve.svg";
import { set } from "../common/set-at";
import Container from "../objects/container";
import PanelContainer from "./PanelContainer";
import ObjectProperties from "../components/ObjectProperties";
import Messenger from "../messenger";
import Renderer from "../render/renderer";
import Receiver from "../objects/receiver";
import Source from "../objects/source";
import { KeyValuePair } from "../common/key-value-pair";
import SettingsDrawer from "../components/SettingsDrawer";
import { Setting } from "../common/setting";
import { Report } from "../common/browser-report";

import "../css";

FocusStyleManager.onlyShowFocusOnTabs();

export interface AppProps {
	messenger: Messenger;
	containers: KeyValuePair<Container>;
	settings: KeyValuePair<Setting<any>>;
	browser: Report;
}

interface AppState {
	importDialogVisible: boolean;
	containers: KeyValuePair<Container>;
	selectedObject: Container;
	settingsDrawerVisible: boolean;
	settings: KeyValuePair<Setting<any>>;
}

export default class App extends React.Component<AppProps, AppState> {
	state: AppState;
	canvas: React.RefObject<HTMLCanvasElement>;
	prog: any;
	constructor(props: AppProps) {
		super(props);
		this.state = {
			importDialogVisible: false,
			containers: {} as KeyValuePair<Container>,
			selectedObject: {} as Container,
			settingsDrawerVisible: false,
			settings: props.settings
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
			"ADD_SOURCE_BUTTON_PRESSED",
			(acc, ...args) => {
				const containers = { ...this.state.containers };
				containers[acc[0].uuid] = acc[0];
				return this.setState({ containers });
			}
		);

		this.props.messenger.addMessageHandler(
			"ADD_RECEIVER_BUTTON_PRESSED",
			(acc, ...args) => {
				const containers = { ...this.state.containers };
				containers[acc[0].uuid] = acc[0];
				return this.setState({ containers });
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
													<div
														style={{
															display: "flex",
															justifyContent:
																"space-between"
														}}>
														<div>Source</div>
														<div
															style={{
																color:
																	Colors.LIGHT_GRAY1
															}}>
															{Characters.COMMAND}
														</div>
													</div>
												}
												onClick={() =>
													this.props.messenger.postMessage(
														"ADD_SOURCE_BUTTON_PRESSED"
													)
												}></MenuItem>
											<MenuItem
												text="Receiver"
												onClick={() =>
													this.props.messenger.postMessage(
														"ADD_RECEIVER_BUTTON_PRESSED"
													)
												}></MenuItem>
										</Menu>
									</Popover>
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
					onClose={this.handleSettingsButtonClick}
					settings={this.state.settings}
					onSettingChange={this.handleSettingChange}
					isOpen={this.state.settingsDrawerVisible}
				/>
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
								onClick={this.handleObjectViewClick}
							/>
						</PanelContainer>
						<PanelContainer className="panel full-bottom">
							{Object.keys(this.state.selectedObject).length >
								0 && (
								<ObjectProperties
									object={this.state.selectedObject}
									onPropertyChange={
										this.handleObjectPropertyChange
									}
									onPropertyValueChangeAsNumber={
										this
											.handleObjectPropertyValueChangeAsNumber
									}
									onPropertyValueChangeAsString={
										this
											.handleObjectPropertyValueChangeAsString
									}
								/>
							)}
						</PanelContainer>
					</SplitterLayout>
					<div className="webgl-canvas">
						<div className="float-controls"></div>
						<canvas ref={this.canvas} />
					</div>
				</SplitterLayout>
			</div>
		);
	}
}
