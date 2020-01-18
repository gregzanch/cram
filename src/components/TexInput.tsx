import expose from '../common/expose';
import React from 'react'
import MathQuill, { addStyles as addMathquillStyles } from 'react-mathquill'
import math from 'mathjs';
import diff from '../common/diff';

expose({ diff });





// inserts the required css to the <head> block.
// You can skip this, if you want to do that by your self.
// addMathquillStyles();
import "../css/mathquill.css";
 

export interface TexChangeObject{
    id: string;
    text: string;
    latex: string;
    prefix?: string;
    errorMessage?: string;
    error: boolean;
}

export interface TexInputProps{
    latex?: string;
    text?: string;
    prefix?: string;
    onChange: (e: TexChangeObject) => void;
    id: string;
}

export interface TexInputState{
    latex: string;
    text: string;
    error: boolean;
    errorMessage: string;
}

export default class TexInput extends React.Component<TexInputProps, TexInputState> {
    constructor(props: TexInputProps) {
        super(props);
        this.state = {
			latex: this.props.latex || "",
            text: '',
            error: false,
            errorMessage: ""
        };
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(mathField) {
        let text = mathField.text().replace(/\=+/gmi, "==");
        this.setState({
            error: false,
            latex: mathField.latex(),
            text
        },
            () => {
                this.props.onChange({
                    id: this.props.id,
                    text: this.state.text,
                    latex: this.state.latex,
                    error: this.state.error,
                    errorMessage: this.state.errorMessage
                });
            });
    }
  
    render() {
        return (
            
            <MathQuill
                id={this.props.id}
                latex={this.state.latex} 
                config={{
                    spaceBehavesLikeTab: true,
                    leftRightIntoCmdGoes: 'up',
                    restrictMismatchedBrackets: true,
                    sumStartsWithNEquals: true,
                    supSubsRequireOperand: true,
                    charsThatBreakOutOfSupSub: '+-=<>',
                    autoSubscriptNumerals: true,
                    autoCommands: 'pi theta sqrt sum int prod',
                    autoOperatorNames: 'sin cos tan sinh cosh tanh',
                    maxDepth: 10,
                }}
                    onChange={this.handleChange}
            />
        );
    }
}