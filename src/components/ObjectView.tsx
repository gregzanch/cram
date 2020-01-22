import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import Source from "../objects/source";
import Receiver from "../objects/receiver";

import { KeyValuePair } from "../common/key-value-pair";
import Container from "../objects/container";

const useStyles = makeStyles({
	root: {
		height: 216,
		flexGrow: 1,
		maxWidth: 400
	}
});


export function GeometryTreeNode(props) {
	return <TreeItem nodeId={props.id}></TreeItem>;
}
export interface ObjectViewProps{
	containers: KeyValuePair<Container>
}
export default function ObjectView(props) {
	const classes = useStyles();
	return (
		<TreeView
			className={classes.root}
			defaultCollapseIcon={<ExpandMoreIcon />}
			defaultExpandIcon={<ChevronRightIcon />}
		>
			<TreeItem nodeId="containers" label="Containers">
				{Object.keys(props.containers).map((x: string|number) => {
					return (
						<TreeItem
							nodeId={props.containers[x].uuid}
							label={props.containers[x].name}
							key={x}
							onClick={e => props.onClick(props.containers[x], e)}></TreeItem>
					);
				})}
			</TreeItem>

		</TreeView>
	);
}
