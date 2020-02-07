type dB = number;

/**
 * @interface TLArgs Args to TL function
 */
interface TLArgs {
  /**
   * @property {tau} number Transmission Coefficient (dB)
   */
  tau?: number;
  /**
   * @property {NR} number Noise Reduction in (dB) (i.e. Lsource-Lreciever)
   */
  NR?: number;
  /**
   * @property {area} number surface area of test wall (m^2)
   */
  area?: number;
  /**
   *  @property {absorption} number total absorption of reciever room (sabins)
   */
  absorption?: number;
  /**
   * @property {m} number surface density of wall (density * thickness) (if metric, specify the units "metric")
   */
  m?: number;
  /**
   * @property {f} number frequency
   */
  f?: number;
  /**
   * @property {units} string can be either "english" or "metric"
   */
  units?: string;
}

export function TL(args: TLArgs): dB {
  if (args.tau) return 10 * Math.log10(1 / args.tau);
  else if (args.NR && args.area && args.absorption)
    return args.NR + 10 * Math.log10(args.area / args.absorption);
  else if (args.m && args.f) {
    const offset: number =
      args.units === 'metric' ? 47 : args.units === 'english' ? 33 : 33;
    return 20 * Math.log10(args.m) + 20 * Math.log10(args.f) - offset;
  } else throw 'Not enough input parameters';
}
