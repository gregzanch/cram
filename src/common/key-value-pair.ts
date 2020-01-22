export type KeyValuePair<T> = {
  [key in number | string]: T;
};