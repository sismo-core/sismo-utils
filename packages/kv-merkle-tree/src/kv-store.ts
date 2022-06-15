export class KV {
  public store: any;
  constructor() {
    this.store = {};
  }

  public put(key: string, value: any) {
    this.store[key] = value;
  }

  public patch(key: string, value: any) {
    this.store[key] = { ...this.store[key], ...value };
  }

  public get(key: string) {
    return this.store[key];
  }

  public toJson() {
    return JSON.stringify(this.store);
  }

  public toDict() {
    return this.store;
  }

  public importJson(json: any) {
    this.store = json;
  }

  public isEmpty() {
    return Object.keys(this.store).length === 0;
  }
}