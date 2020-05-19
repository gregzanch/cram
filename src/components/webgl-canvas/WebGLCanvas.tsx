import React, { Component } from "react";
import PropTypes from "prop-types";
import { findDOMNode } from "react-dom";
import raf from "raf";
import omit from "lodash/omit";
import keys from "lodash/keys";

export function clearGlScene(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
}

const styles = {
  canvas: {
    width: "100%",
    height: "100%"
  }
};

export interface WebGLCanvasProps {
  onSceneInitialized;
  onSceneRender;
  dimensions: {
    width;
    height;
  };
  clearColor;
}
export interface WebGLCanvasState{
  
}

export default class WebGLCanvas extends Component<WebGLCanvasProps,WebGLCanvasState> {
  static propTypes = {
    onSceneInitialized: PropTypes.func.isRequired,
    onSceneRender: PropTypes.func.isRequired,
    dimensions: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number
    }),
    clearColor: PropTypes.arrayOf(PropTypes.number)
  };

  static defaultProps = {
    clearColor: [0, 0, 0, 0],
    dimensions: {
      width: 100,
      height: 100
    }
  };
  _handleGlContextLost: any;
  _handleGlContextRestored: any;
  gl: any;

  constructor(props) {
    super(props);
    this._handleGlContextLost = this.handleGlContextLost.bind(this);
    this._handleGlContextRestored = this.initializeGlScene.bind(this);
  }

  componentDidMount() {
    this.initializeGlScene();
    window.addEventListener("webglcontextlost", this._handleGlContextLost);
    window.addEventListener(
      "webglcontextrestored",
      this._handleGlContextRestored
    );
  }

  componentWillUnmount() {
    raf.cancel(this.rafHandle);
    window.removeEventListener("webglcontextlost", this._handleGlContextLost);
    window.removeEventListener(
      "webglcontextrestored",
      this._handleGlContextRestored
    );
  }
  rafHandle () {
    throw new Error("Method not implemented.");
  }

  componentDidUpdate(prevProps) {
    if (prevProps.dimensions != this.props.dimensions) {
      this.resizeViewport();
    }
  }

  handleGlContextLost(e) {
    e.preventDefault();
    raf.cancel(this.rafHandle);
  }

  initializeGlScene () {

    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    console.log(canvas);
    this.gl = canvas.getContext("webgl", {
      preserveDrawingBuffer: true,
      antialias: true
    });
    this.gl.clearColor(...this.props.clearColor);
    this.resizeViewport();
    this.setGlFeatures(this.gl);
    this.props.onSceneInitialized(this.gl);
    this.rafHandle = raf(this.renderGlScene.bind(this, this.gl));
  }

  setGlFeatures(gl) {
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  resizeViewport() {
    const { width, height } = this.props.dimensions;
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    // canvas.width = width;
    // canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  renderGlScene(gl, programs) {
    clearGlScene(gl);
    this.props.onSceneRender(gl);
    this.rafHandle = raf(this.renderGlScene.bind(this, gl, programs));
  }

  render() {
    const canvasProps = omit(this.props, keys(WebGLCanvas.propTypes));
    return <canvas style={styles.canvas} {...canvasProps} />;
  }
}
