import React, { useState } from "react";
import {
	makeStyles,
	createStyles
} from "@material-ui/core/styles";


import { SvgIcon } from '@material-ui/core';

import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

import TimelineIcon from '@material-ui/icons/Timeline';
import HomeIcon from '@material-ui/icons/Home';
import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import TreeItem from "@material-ui/lab/TreeItem";
import Source from "../objects/source";
import Receiver from "../objects/receiver";

import { KeyValuePair } from "../common/key-value-pair";
import Container from "../objects/container";
import Surface from "../objects/surface";
import Solver from "../compute/solver";
import { Colors } from "@blueprintjs/core";



function NodesIcon(props) {
	return (
		<SvgIcon {...props}>
		 <svg width="24" height="24" viewBox="-4 -4 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M4 12C4 13.1046 3.10457 14 2 14C0.89543 14 0 13.1046 0 12C0 10.8954 0.89543 10 2 10C3.10457 10 4 10.8954 4 12Z" fill="black"/>
			<path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="black"/>
			<path d="M9 2C9 3.10457 8.10457 4 7 4C5.89543 4 5 3.10457 5 2C5 0.89543 5.89543 0 7 0C8.10457 0 9 0.89543 9 2Z" fill="black"/>
			<path d="M7 2L2 12H12L7 2Z" stroke="black"/>
			</svg>

		</SvgIcon>
	);
}



function RayTracerIcon(props) {
	return (
		<TimelineIcon {...props}/>
	)
}

function FDTDIcon(props) {
	return (
		<SvgIcon {...props}>
			<path id="a" d="M0 0h24v24H0V0z"></path>
			<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM8.5 15H7.3l-2.55-3.5V15H3.5V9h1.25l2.5 3.5V9H8.5v6zm5-4.74H11v1.12h2.5v1.26H11v1.11h2.5V15h-4V9h4v1.26zm7 3.74c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1V9h1.25v4.51h1.13V9.99h1.25v3.51h1.12V9h1.25v5z"></path>
		</SvgIcon>
		)
}

function RoomIcon(props) {
	return (
		<SvgIcon {...props}>
<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 31 28">
    <polygon points="6.473 10.456 15.492 5.332 24.524 10.455 15.485 15.865 6.473 10.456" fill="#ebebeb"/>
    <polygon points="6.473 10.456 15.489 15.866 15.492 26.635 6.472 21.259 6.473 10.456" fill="#90908f"/>
    <polygon points="24.524 10.455 24.528 21.305 15.492 26.635 15.492 15.866 24.524 10.455" fill="#c6c7c8"/>
    <path d="M24.49414,9.897l-8.5-4.83105a1.00013,1.00013,0,0,0-.98828,0l-8.5,4.83105A1.00006,1.00006,0,0,0,6,10.76642V20.99231a.99993.99993,0,0,0,.48816.85907L14.989,26.91681a1,1,0,0,0,1.021.00159l8.49915-5.02747A1.0001,1.0001,0,0,0,25,21.03027V10.76642A1.00006,1.00006,0,0,0,24.49414,9.897ZM15.5,5.93555l8.17548,4.6466L15.501,15.419l-8.14533-4.8545ZM7,20.99219V11.51678l8,4.76691V25.76Zm9,4.77118V16.28473l8-4.73181v9.47735Z" fill="#535353"/>
</svg>



		</SvgIcon>
	)
}

export function SurfaceIcon(props) {
	return (
		<SvgIcon {...props}>
			<svg fill="none" {...props}>
				<path
					fill="#C0C1C1"
					stroke="#303030"
					d="M4.6 4.6h13.8v13.8H4.6z"
				/>
				<circle cx={4.6} cy={4.6} r={1.84} fill="#303030" />
				<circle cx={18.4} cy={4.6} r={1.84} fill="#303030" />
				<circle cx={18.4} cy={18.4} r={1.84} fill="#303030" />
				<circle cx={4.6} cy={18.4} r={1.84} fill="#303030" />
			</svg>
		</SvgIcon>
	);
}
export function SourceIcon(props) {
	return (
		<SvgIcon {...props}>
			<svg
				width="20"
				height="20"
				viewBox="-8 -8 32 32"
				fill="none"
				xmlns="http://www.w3.org/2000/svg">
				<path
					d="M1 1V7M1 1H7M1 1L9 9M20 1H14M20 1V7M20 1L12 9M20 20V14M20 20H14M20 20L12 12M1 20H7M1 20V14M1 20L9 12"
					stroke="black"
				/>
				<circle cx="10.5" cy="10.5" r="3.5" fill="black" />
			</svg>
		</SvgIcon>
	);
}

export function GeometryTreeNode(props) {
	return <TreeItem nodeId={props.id}></TreeItem>;
}
export interface ObjectViewProps {
	containers: KeyValuePair<Container>;
	solvers: KeyValuePair<Solver>;
}


const useStyles = makeStyles(
	createStyles({
		root: {
			height: 264,
			flexGrow: 1,
			maxWidth: 400
		}
	})
);


interface TreeItemLabelProps{
	label: React.ReactNode,
	meta?: React.ReactNode
	icon?: React.ReactNode
}

export function TreeItemLabel(props: TreeItemLabelProps) {
	return (
		<div className="tree-item-label-container">
			<div className="tree-item-label-label">
				{props.icon && <div className="tree-item-label-icon">{props.icon || ""}</div>}
				{props.label}
			</div>
			<div className="tree-item-label-meta">{props.meta || ""}</div>
		</div>
	);
}


export default function ObjectView(props) {
	function mapchildren(container: Container | THREE.Object3D) {
		if (container["kind"]) {
			switch (container["kind"]) {
				
				case "surface":
					return (<TreeItem
						defaultChecked
						icon={<NodesIcon />}
						draggable={true}
						nodeId={container.uuid}
						label={<TreeItemLabel label={container.name || "untitled"} meta={"Surface"}/>}
						key={container.uuid}
						onClick={e => props.onClick(container, e)}
					/>);
				
				
				case "source":
					return (<TreeItem
						draggable={true}
						icon={<SourceIcon />}
						nodeId={container.uuid}
						label={<TreeItemLabel label={container.name || "untitled"} meta={"Source"}/>}
						key={container.uuid}
						onClick={e => props.onClick(container, e)}
					/>);
				
				
				case "receiver":
					return (<TreeItem
						draggable={true}
						nodeId={container.uuid}
						label={<TreeItemLabel label={container.name || "untitled"} meta={"Receiver"}/>}
						key={container.uuid}
						onClick={e => props.onClick(container, e)}
					/>);
				
				
				case "room":
					return (
						<TreeItem
							draggable={true}
							nodeId={container.uuid}
							label={
								<TreeItemLabel
									icon={<RoomIcon fontSize="small" />}
									label={container.name || "untitled"}
									meta={"Room"}
								/>
							}
							collapseIcon={
								<ExpandMoreIcon
									onClick={e =>setExpanded(expanded.filter(x => x !== container.uuid))}
									fontSize="small"
								/>
							}
							expandIcon={
								<ChevronRightIcon
									onClick={e =>setExpanded(expanded.concat(container.uuid))}
									fontSize="small"
								/>
							}
							key={container.uuid}
							onClick={e => props.onClick(container, e)}>
							{container.children.map(x => mapchildren(x))}
						</TreeItem>
					);

				case "fdtd":
					return (
						<TreeItem
							draggable={true}
							nodeId={container.uuid}
							label={
								<TreeItemLabel
									icon={<NodesIcon fontSize="small" />}
									label={container.name || "untitled"}
									meta={"FDTD"}
								/>
							}
							collapseIcon={
								<ExpandMoreIcon
									onClick={e =>setExpanded(expanded.filter(x => x !== container.uuid))}
									fontSize="small"
								/>
							}
							expandIcon={
								<ChevronRightIcon
									onClick={e =>setExpanded(expanded.concat(container.uuid))}
									fontSize="small"
								/>
							}
							key={container.uuid}
							onClick={e => props.onClick(container, e)}>
							{ container.children && container.children.map(x => mapchildren(x))}
						</TreeItem>
					);
				
				
				
				case "container":
					return (
						<TreeItem
							draggable={true}
							nodeId={container.uuid}
							label={
								<TreeItemLabel
									icon={<SurfaceIcon fontSize="small" />}
									label={container.name || "untitled"}
									meta={"Container"}
								/>
							}
							key={container.uuid}
							collapseIcon={
								<ExpandMoreIcon
									onClick={e =>
										setExpanded(
											expanded.filter(
												x => x !== container.uuid
											)
										)
									}
									fontSize="small"
								/>
							}
							expandIcon={
								<ChevronRightIcon
									onClick={e =>
										setExpanded(
											expanded.concat(container.uuid)
										)
									}
									fontSize="small"
								/>
							}
							onClick={e => props.onClick(container, e)}>
							{container.children.map(x => mapchildren(x))}
						</TreeItem>
					);
			
			
			
				default:
					return (
						<TreeItem
							nodeId={container.uuid}
							label={
								<TreeItemLabel
									label={container.name || "untitled"}
									meta={container["kind"] || container.type}
								/>
							}
							key={container.uuid}
							draggable={true}
							collapseIcon={
								<ExpandMoreIcon
									onClick={e =>
										setExpanded(
											expanded.filter(
												x => x !== container.uuid
											)
										)
									}
									fontSize="small"
								/>
							}
							expandIcon={
								<ChevronRightIcon
									onClick={e =>
										setExpanded(
											expanded.concat(container.uuid)
										)
									}
									fontSize="small"
								/>
							}
							onClick={e => props.onClick(container, e)}>
							{container.children instanceof Array && container.children.map(x => mapchildren(x))}
						</TreeItem>
					);
			}
		}
		return (<TreeItem
			nodeId={container.uuid}
			label={<TreeItemLabel label={container.name || "untitled"} meta={container.type}/>}
			key={container.uuid}
			draggable={true}
			onClick={e => props.onClick(container, e)}>
			{container.children.map(x => mapchildren(x))}
		</TreeItem>);
	}
	
	function mapsolver(solver: Solver) {
		switch (solver.kind) {
			case "ray-tracer":
				return (<TreeItem
					defaultChecked
					icon={<RayTracerIcon />}
					draggable={true}
					nodeId={solver.uuid}
					label={<TreeItemLabel label={solver.name || ("untitled" + solver.kind)} meta={solver.kind} />}
					key={solver.name}
					onClick={e => props.onClick(solver, e)}
				/>);
			case "fdtd":
				return (<TreeItem
					defaultChecked
					icon={<FDTDIcon />}
					draggable={true}
					nodeId={solver.uuid}
					label={<TreeItemLabel label={solver.name || ("untitled" + solver.kind)} meta={solver.kind} />}
					key={solver.name}
					onClick={e => props.onClick(solver, e)}
				/>);
				break;
			default:
				return (
					<TreeItem
						defaultChecked
						icon={<NodesIcon />}
						draggable={true}
						nodeId={solver.uuid}
						label={<TreeItemLabel label={solver.name || ("untitled" + solver.kind)} meta={solver.kind} />}
						key={solver.name}
						onClick={e => props.onClick(solver, e)}
					/>);
								break;
				break;
		}
	}
	
	const [expanded, setExpanded] = useState(["containers"]);

	const classes = useStyles();
	return (
		<TreeView
			expanded={expanded}
			className={classes.root}
			defaultExpanded={["containers"]}
			defaultCollapseIcon={<ExpandMoreIcon onClick={e => console.log(e)} fontSize="small"/>}
			defaultExpandIcon={<ChevronRightIcon onClick={e => console.log(e)} fontSize="small"/>}>
			<TreeItem
				nodeId="solvers"
				unselectable={Object.keys(props.containers).length == 0 ? "on" : "off"}
				collapseIcon={<ExpandMoreIcon onClick={e => setExpanded(expanded.filter(x => x !== "solvers"))} fontSize="small" />}
				expandIcon={<ChevronRightIcon onClick={e => setExpanded(expanded.concat("solvers"))} fontSize="small"/>}
				label={<TreeItemLabel label={<div style={{ fontWeight: 400,color: Object.keys(props.containers).length == 0 ? Colors.LIGHT_GRAY3 : "#182026" }}>Solvers</div>} />}>
				
				{Object.keys(props.solvers).map((x: string) => mapsolver(props.solvers[x]))}
			</TreeItem>
			<TreeItem
				nodeId="containers"
				unselectable={Object.keys(props.containers).length == 0 ? "on" : "off"}
				collapseIcon={<ExpandMoreIcon onClick={e => setExpanded(expanded.filter(x => x !== "containers"))} fontSize="small" />}
				expandIcon={<ChevronRightIcon onClick={e => setExpanded(expanded.concat("containers"))} fontSize="small"/>}
				label={<TreeItemLabel label={<div style={{ fontWeight: 400, color: Object.keys(props.containers).length == 0 ? Colors.LIGHT_GRAY3 : "#182026" }}>Objects</div>}/>}>
				{Object.keys(props.containers).map((x: string) =>
					mapchildren(props.containers[x])
				)}
			</TreeItem>
		</TreeView>
	);
}
