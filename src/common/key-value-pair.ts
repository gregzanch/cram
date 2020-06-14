export type KeyValuePair<T> = {
  [key in number | string]: T;
};

export type KVP<T> = KeyValuePair<T>;