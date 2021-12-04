export interface IKeyValueRecord<T = string> {
  key: string;
  value: {
    v: T;
  };
}
