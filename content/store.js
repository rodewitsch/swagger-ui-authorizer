/* eslint-disable no-redeclare */
class Store {
  constructor() {
    this._store = {
      authorizations: {
        value: null,
        subscriptions: new Map()
      },
    };
  }

  get authorizations() {
    return this._store.authorizations.value;
  }

  set authorizations(value) {
    this._store.authorizations.value = value;
    this._executeSubscriptions('authorizations', value);
  }

  _executeSubscriptions(key, value) {
    if (this._store[key].subscriptions.size) {
      this._store[key].subscriptions.forEach((subscription) => subscription(value));
    }
  }

  cleanStore() {
    this._store = {
      authorization: {
        value: null,
        subscriptions: new Map()
      }
    };
  }

  subscribe(key, listener) {
    if (!this._store[key]) throw new Error(`Cannot subscribe. Key "${key}" is not registered`);
    const listenerIdentifier = Symbol();
    this._store[key].subscriptions.set(listenerIdentifier, listener);
    return { key, listenerIdentifier };
  }

  unsubscribe({ key, listenerIdentifier }) {
    if (!this._store[key]) throw new Error(`Cannot subscribe. Key "${key}" is not registered`);
    this._store[key].subscriptions.delete(listenerIdentifier);
  }
}

// eslint-disable-next-line no-unused-vars
const ExtStore = new Store();
