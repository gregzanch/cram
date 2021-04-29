import shoebox from '../res/saves/shoebox.json';
import concord from '../res/saves/concord.json';
import auditorium from '../res/saves/auditorium.json';

import "./events";

export const examples = { 
  shoebox,
  concord,
  auditorium
};

export default examples;

export type Example = keyof typeof examples;