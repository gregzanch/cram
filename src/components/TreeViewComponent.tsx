/** This is an adaptation of `azizali/react-tree-view`
 * @see https://github.com/azizali/react-tree-view
 */

import React, { Component } from "react";

import equal from "fast-deep-equal";
import cloneDeep from "../common/clone-deep";
import { TransitionGroup, CSSTransition } from "react-transition-group";

function isNil(value) {
  return value == null;
}

function isEqual(value, other) {
  return equal(value, other);
}

import "./TreeViewComponent.css";
import { find, get, isEmpty } from "lodash";

Object.assign(window, { find, get });

type Props = {
  data: any[];
  onUpdateCb: (updatedData, depth: number) => void;
  depth?: number;
  deleteElement?: JSX.Element;
  getStyleClassCb?: (node, depth: number) => string;
  isCheckable?: (node, depth: number) => boolean;
  isDeletable?: (node, depth: number) => boolean;
  isExpandable?: (node, depth: number) => boolean;
  keywordChildren?: string;
  keywordChildrenLoading?: string;
  keywordLabel?: string;
  keywordKey?: string;
  loadingElement?: JSX.Element;
  noChildrenAvailableMessage?: string;
  onCheckToggleCb?: (nodes, depth: number) => void;
  onDeleteCb?: (node, updatedData, depth: number) => boolean;
  onExpandToggleCb?: (node, depth: number) => void;
  transitionEnterTimeout?: number;
  transitionExitTimeout?: number;
};

const defaultProps = {
  depth: 0,

  deleteElement: <div>(X)</div>,

  getStyleClassCb: (/* node, depth */) => {
    return "";
  },
  isCheckable: (/* node, depth */) => {
    return true;
  },
  isDeletable: (/* node, depth */) => {
    return true;
  },
  isExpandable: (/* node, depth */) => {
    return true;
  },

  keywordChildren: "children",
  keywordChildrenLoading: "isChildrenLoading",
  keywordLabel: "name",
  keywordKey: "id",

  loadingElement: <div>loading...</div>,

  noChildrenAvailableMessage: "No data found",

  onCheckToggleCb: (/* Array of nodes, depth */) => {},
  onDeleteCb: (/* node, updatedData, depth */) => {
    return true;
  },
  onExpandToggleCb: (/* node, depth */) => {},
  onUpdateCb: (/* updatedData, depth */) => {},

  transitionEnterTimeout: 120,
  transitionExitTimeout: 120
};

type State = {
  data: any;
  lastCheckToggledNodeIndex: any;
};

class TreeViewComponent extends Component<Props, State> {
  static defaultProps = {
    depth: 0,

    deleteElement: <div>(X)</div>,

    getStyleClassCb: (/* node, depth */) => {
      return "";
    },
    isCheckable: (/* node, depth */) => {
      return true;
    },
    isDeletable: (/* node, depth */) => {
      return true;
    },
    isExpandable: (/* node, depth */) => {
      return true;
    },

    keywordChildren: "children",
    keywordChildrenLoading: "isChildrenLoading",
    keywordLabel: "name",
    keywordKey: "id",

    loadingElement: <div>loading...</div>,

    noChildrenAvailableMessage: "No data found",

    onCheckToggleCb: (/* Array of nodes, depth */) => {},
    onDeleteCb: (/* node, updatedData, depth */) => {
      return true;
    },
    onExpandToggleCb: (/* node, depth */) => {},
    onUpdateCb: (/* updatedData, depth */) => {},

    transitionEnterTimeout: 0,
    transitionExitTimeout: 0
  };
  constructor(props) {
    super(props);
    this.state = {
      data: cloneDeep(this.props.data, true),
      lastCheckToggledNodeIndex: null
    };

    this.handleUpdate = this.handleUpdate.bind(this);

    this.printNodes = this.printNodes.bind(this);
    this.printChildren = this.printChildren.bind(this);

    this.printCheckbox = this.printCheckbox.bind(this);
    this.printDeleteButton = this.printDeleteButton.bind(this);
    this.printExpandButton = this.printExpandButton.bind(this);
    this.printNoChildrenMessage = this.printNoChildrenMessage.bind(this);

    this.handleCheckToggle = this.handleCheckToggle.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleExpandToggle = this.handleExpandToggle.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.data, this.props.data)) {
      this.setState({ data: cloneDeep(nextProps.data, true) });
    }
  }

  handleUpdate(updatedData) {
    const { depth, onUpdateCb } = this.props;

    onUpdateCb(updatedData, depth!);
  }

  handleCheckToggle(node, e) {
    const { onCheckToggleCb, depth } = this.props;
    const { lastCheckToggledNodeIndex } = this.state;
    const data = cloneDeep(this.state.data, true);
    const currentNode = find(data, node) as typeof node;
    const currentNodeIndex = data.indexOf(currentNode);
    const toggledNodes = [] as any[];
    if (e.shiftKey && !isNil(lastCheckToggledNodeIndex)) {
      const rangeStart = Math.min(currentNodeIndex, lastCheckToggledNodeIndex);
      const rangeEnd = Math.max(currentNodeIndex, lastCheckToggledNodeIndex);

      const nodeRange = data.slice(rangeStart, rangeEnd + 1);

      nodeRange.forEach((node) => {
        node.isChecked = e.target.checked;
        toggledNodes.push(node);
      });
    } else {
      try {
        currentNode.isChecked = e.target.checked;
      } catch (err) {
        console.log(err);
        console.log(currentNode);
      }
      toggledNodes.push(currentNode);
    }

    onCheckToggleCb!(toggledNodes, depth!);
    this.setState({ lastCheckToggledNodeIndex: currentNodeIndex });
    this.handleUpdate(data);
  }

  handleDelete(node) {
    const { onDeleteCb, depth } = this.props;
    const data = cloneDeep(this.state.data, true);

    const newData = data.filter((nodeItem) => {
      return !isEqual(node, nodeItem);
    });

    onDeleteCb!(node, newData, depth!) && this.handleUpdate(newData);
  }

  handleExpandToggle(node) {
    const { onExpandToggleCb, depth } = this.props;
    const data = cloneDeep(this.state.data, true);
    const currentNode = find(data, node) as typeof node;

    currentNode.isExpanded = !currentNode.isExpanded;

    onExpandToggleCb!(currentNode, depth!);
    this.handleUpdate(data);
  }

  printCheckbox(node, ...args) {
    const { isCheckable, keywordLabel, depth } = this.props;

    if (isCheckable!(node, depth!)) {
      return (
        <input
          type="checkbox"
          name={node[keywordLabel!]}
          onClick={(e) => {
            this.handleCheckToggle(node, e);
          }}
          onChange={(e) => {
            this.handleCheckToggle(node, e);
          }}
          checked={!!node.isChecked}
          id={node.id}
        />
      );
    }
  }

  printDeleteButton(node, ...args) {
    const { isDeletable, depth, deleteElement } = this.props;

    if (isDeletable!(node, depth!)) {
      return (
        <div
          className="delete-btn"
          onClick={() => {
            this.handleDelete(node);
          }}
        >
          {deleteElement}
        </div>
      );
    }
  }

  printExpandButton(node, ...args) {
    const className = node.isExpanded ? "tree-view-triangle-btn-down" : "tree-view-triangle-btn-right";
    const { isExpandable, depth } = this.props;

    if (isExpandable!(node, depth!)) {
      return (
        <div
          className={`tree-view-triangle-btn ${className}`}
          onClick={() => {
            this.handleExpandToggle(node);
          }}
        />
      );
    } else {
      return <div className={`tree-view-triangle-btn tree-view-triangle-btn-none`} />;
    }
  }

  printNoChildrenMessage() {
    const { transitionExitTimeout, noChildrenAvailableMessage } = this.props;
    const noChildrenTransitionProps = {
      classNames: "tree-view-no-children-transition",
      key: "tree-view-no-children",
      style: {
        transitionDuration: `${transitionExitTimeout}ms`,
        transitionDelay: `${transitionExitTimeout}ms`
      },
      timeout: {
        enter: transitionExitTimeout
      },
      exit: false
    };

    return (
      <CSSTransition {...noChildrenTransitionProps}>
        <div className="tree-view-no-children">
          <div className="tree-view-no-children-content">{noChildrenAvailableMessage}</div>
        </div>
      </CSSTransition>
    );
  }

  printNodes(nodeArray) {
    const {
      keywordKey,
      keywordLabel,
      depth,
      transitionEnterTimeout,
      transitionExitTimeout,
      getStyleClassCb
    } = this.props;
    const { printExpandButton, printCheckbox, printDeleteButton, printChildren } = this;
    console.log(keywordLabel);
    const nodeTransitionProps = {
      classNames: "tree-view-node-transition",
      style: {
        transitionDuration: `${transitionEnterTimeout}ms`
      },
      timeout: {
        enter: transitionEnterTimeout,
        exit: transitionExitTimeout
      }
    };

    return (
      <TransitionGroup>
        {nodeArray.length == 0
          ? this.printNoChildrenMessage()
          : nodeArray.map((node, index) => {
              const nodeText = get(node, keywordLabel!, "");

              return (
                <CSSTransition {...nodeTransitionProps} key={node[keywordKey!] || index}>
                  <div className={"tree-view-node" + getStyleClassCb!(node, depth!)}>
                    <div className="tree-view-node-content">
                      {printExpandButton(node, depth)}
                      {printCheckbox(node, depth)}
                      <label htmlFor={node.id} title={nodeText} className="tree-view-text">
                        {nodeText}
                      </label>
                      {printDeleteButton(node, depth)}
                    </div>
                    {printChildren(node)}
                  </div>
                </CSSTransition>
              );
            })}
      </TransitionGroup>
    );
  }

  printChildren(node) {
    if (!node.isExpanded) {
      return null;
    }

    const { keywordChildren, keywordChildrenLoading, depth } = this.props;
    const isChildrenLoading = get(node, keywordChildrenLoading!, false);
    let childrenElement;

    if (isChildrenLoading) {
      childrenElement = get(this.props, "loadingElement");
    } else {
      childrenElement = (
        <TreeViewComponent
          {...this.props}
          data={node[keywordChildren!] || []}
          depth={depth! + 1}
          onUpdateCb={onChildrenUpdateCb.bind(this)}
        />
      );
    }

    return <div className="tree-view-children-container">{childrenElement}</div>;

    function onChildrenUpdateCb(updatedData) {
      const data = cloneDeep(this.state.data, true);
      const currentNode = find(data, node) as typeof node;

      currentNode[keywordChildren!] = updatedData;
      this.handleUpdate(data);
    }
  }

  render() {
    return <div className="tree-view">{this.printNodes(this.state.data)}</div>;
  }
}

export default TreeViewComponent;
