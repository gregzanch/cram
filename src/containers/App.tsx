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

} from "@blueprintjs/core";

import ImportDialog from "../components/ImportDialog";

import ObjectView from "../components/ObjectView";

import resolve_svg from "../svg/resolve.svg";

import { set } from '../common/set-at';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

import "../css/split-container.css";
import "../css/styles.css";
import "../css/panel.css";
import "../css/tree.css";
import "../css/table.css";

import "../res/file-type-icons/styles.css";
import "../css/drop-zone.css";

import Container from '../objects/container';

import PanelContainer from "./PanelContainer";
import ObjectProperties from '../components/ObjectProperties';

import Messenger from "../messenger";
import Renderer from "../render/renderer";
import Receiver from "../objects/receiver";
import Source from "../objects/source";

import { KeyValuePair } from "../common/key-value-pair";

FocusStyleManager.onlyShowFocusOnTabs();




export interface AppProps {
	messenger: Messenger;
	renderer: Renderer;
	containers: KeyValuePair<Container>;
	geometry;
}

interface AppState {
	importDialogVisible: boolean;
	containers: KeyValuePair<Container>
	selectedObject: Container | undefined;
}

export default class App extends React.Component<AppProps,AppState> {
	state: AppState;
	canvas: React.RefObject<HTMLCanvasElement>;
	prog: any;
	renderer: Renderer;
	constructor(props: AppProps) {
		super(props);
		this.state = {
			importDialogVisible: false,
			containers: {} as KeyValuePair<Container>,
			selectedObject: undefined
		};
		this.renderer = props.renderer
		this.setupMessageHandlers = this.setupMessageHandlers.bind(this);
		this.setupMessageHandlers();
		
		this.canvas = React.createRef<HTMLCanvasElement>();
		this.showImportDialog = this.showImportDialog.bind(this);
		this.handleImportDialogClose = this.handleImportDialogClose.bind(this);
		this.handleObjectViewClick = this.handleObjectViewClick.bind(this);
		this.handleObjectPropertyChange = this.handleObjectPropertyChange.bind(this);
	}
	
	setupMessageHandlers() {
		
		this.props.messenger.addMessageHandler("SHOW_IMPORT_DIALOG",
			(res, ...args) => {
			this.setState({
				importDialogVisible: !this.state.importDialogVisible
			});
		})
		
		this.props.messenger.addMessageHandler("ADD_SOURCE_BUTTON_PRESSED",
			(res, ...args) => {
				const containers = { ...this.state.containers };
				containers[res[0].uuid] = res[0];
				return this.setState({containers});
			}
		);
		
		this.props.messenger.addMessageHandler("ADD_RECEIVER_BUTTON_PRESSED",
			(res, ...args) => {
				const containers = { ...this.state.containers };
				containers[res[0].uuid] = res[0];
				return this.setState({ containers });
			}
		);
		
		this.props.messenger.addMessageHandler("IMPORT_FILE",
			(res, ...args) => {
				console.log(res);
			}
		);
	}

	componentDidMount() {
		this.canvas.current &&
			(this.renderer.init(this.canvas.current));
		Object.assign(window, { r: this.renderer });
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
	
	handleObjectViewClick(object, e: React.MouseEvent) {
		console.log(object);
		this.setState({
			selectedObject: object
		})
	}
	
	handleObjectPropertyChange(e: React.ChangeEvent<HTMLInputElement>) {
		const containers = { ...this.state.containers };
		const splits = e.currentTarget.id.split(".");
		const id = splits[0];
		const prop = splits.slice(1)
		
		set(
			containers[id],
			prop,
			e.currentTarget.value
		);
			this.setState({
				containers
			})
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
								cram
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
											<MenuItem text="New..."></MenuItem>
											<MenuItem text="Open..."></MenuItem>
											<MenuDivider />
											<MenuItem text="Save"></MenuItem>
											<MenuItem text="Save As..."></MenuItem>
											<MenuDivider />
											<MenuItem
												text="Import"
												onClick={
													this.showImportDialog
												}></MenuItem>
											<MenuItem text="Export"></MenuItem>
										</Menu>
									</Popover>
									<Popover
										minimal={true}
										transitionDuration={50}
										position={Position.BOTTOM_LEFT}>
										<Button text="Edit" />
										<Menu>
											<MenuItem text="Undo"></MenuItem>
											<MenuItem
												text="Redo"
												disabled></MenuItem>
											<MenuDivider />
											<MenuItem
												text="Cut"
												disabled></MenuItem>
											<MenuItem text="Copy"></MenuItem>
											<MenuItem text="Paste"></MenuItem>
										</Menu>
									</Popover>
									<Popover
										minimal={true}
										transitionDuration={50}
										position={Position.BOTTOM_LEFT}>
										<Button text="Add" />
										<Menu>
											<MenuItem
												text="Source"
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
					</Navbar>
				</div>
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
							{this.state.selectedObject && 	<ObjectProperties
								object={this.state.selectedObject}
								onPropertyChange={this.handleObjectPropertyChange}
							/>}
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

