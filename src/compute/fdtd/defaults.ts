import { FDTDParams } from './';
import Room from '../../objects/room';
import Receiver from '../../objects/receiver';
import Source from '../../objects/source';

const defaults = {
  room: {} as Room,
  gain: 500,
  threshold: 0.001,
  dx: 1,
  dt: 1,
  sources: [] as Source[],
  receivers: [] as Receiver[],
  q: 0.343,
  r: 1.32,
} as FDTDParams;

export default defaults