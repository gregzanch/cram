import Parameter, {ParameterList} from '../common/parameter';



export interface BeamParams extends ParameterList {
	length: Parameter;
	width: Parameter;
	height: Parameter;
	modulus: Parameter;
	resolution: Parameter;
	density: Parameter;
	mass: Parameter;
}