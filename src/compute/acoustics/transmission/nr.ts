/**
 * @interface NRARgs Args to NR function
 */
interface NRArgs {
  /**
   * @property {TL} number Transmission Loss between two spaces
   */
  TL?: number;
  /**
   * @property {absorption} number Transmission Loss between two spaces
   */
  absorption?: number;
  /**
   * @property {area} number surface area of target
   */
  area?: number;
  /**
   *  @property {Lsource} number Source sound pressure level
   */
  Lsource?: number;
  /**
   * @property {Lreciever} number Reciever sound pressure level
   */
  Lreciever?: number;
}

/**
 * @description Returns the noise reduction between two spaces
 * @param {} args function arguments
 */
export function NR(args: NRArgs): number {
  if (args.Lsource && args.Lreciever) {
    return args.Lsource - args.Lreciever;
  } else if (args.TL && args.area && args.absorption) {
    return args.TL + 10 * Math.log10(args.absorption / args.area);
  } else {
    throw 'Not enough input parameters';
  }
}
