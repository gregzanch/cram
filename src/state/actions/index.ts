import * as Actions from './actions';

export type StateAction = keyof typeof Actions;
export { Actions }
export default Actions;