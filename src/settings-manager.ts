import { Setting } from "./setting";
import Messenger from "./messenger";
import { KeyValuePair } from "./common/key-value-pair";

export interface StoredSetting {
  value: any;
  default_value: any;
  id: string;
}

class SettingsManager {
  DBOpenRequest: IDBOpenDBRequest;
  category: string;
  db!: IDBDatabase;
  defaults: KeyValuePair<Setting<number | string | boolean>>;
  constructor(
    category: string,
    defaults: KeyValuePair<Setting<number | string | boolean>>,
    onOpen: (settingsManager: SettingsManager, ...args) => void,
    onError: (...args) => void
  ) {
    this.category = category;
    this.defaults = defaults;
    this.DBOpenRequest = this.indexedDB.open(category);

    this.errorHandler = this.errorHandler.bind(this);
    this.DBOpenRequest.onerror = (event) => {
      this.errorHandler(event);
      onError(event);
    };

    this.successHandler = this.successHandler.bind(this);
    this.DBOpenRequest.onsuccess = (event) => {
      this.successHandler(event);
      onOpen(this, event);
    };

    this.upgradeNeededHandler = this.upgradeNeededHandler.bind(this);
    this.DBOpenRequest.onupgradeneeded = this.upgradeNeededHandler;
  }
  update(settings: Setting<string | number | boolean>[], successCallback?: () => void, errorCallback?: () => void) {
    let transaction = this.db.transaction([this.category], "readwrite");

    // report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function () {
      console.log("transaction complete");
      successCallback && successCallback();
    };

    transaction.onerror = function () {
      console.error(transaction.error);
      errorCallback && errorCallback();
    };
    for (let i = 0; i < settings.length; i++) {
      // call an object store that's already been added to the database
      let objectStore = transaction.objectStore(this.category);
      console.log(objectStore.indexNames);
      console.log(objectStore.keyPath);
      console.log(objectStore.name);
      console.log(objectStore.transaction);
      console.log(objectStore.autoIncrement);

      // Make a request to add our newItem object to the object store
      let objectStoreRequest = objectStore.put({
        value: settings[i].value,
        default_value: settings[i].default_value,
        id: settings[i].id
      });
      objectStoreRequest.onsuccess = function (event) {
        console.log(event);
      };
    }
  }
  async read() {
    return new Promise((resolve, reject) => {
      const settings = [] as StoredSetting[];
      let objectStore = this.db.transaction(this.category).objectStore(this.category);
      const openCursor = objectStore.openCursor();
      openCursor.onsuccess = function (event) {
        let cursor = event.target!["result"] || false;
        if (cursor) {
          const setting = cursor.value;
          settings.push(setting);
          cursor.continue();
        } else {
          resolve(settings);
        }
      };
      openCursor.onerror = function (event) {
        reject(event);
      };
    });
  }
  errorHandler(event) {
    console.error(event);
  }
  successHandler(event) {
    console.log("settings database initialized");
    this.db = this.DBOpenRequest.result;
  }
  upgradeNeededHandler(event) {
    let db = event.target.result as IDBDatabase;
    db.onerror = this.errorHandler;
    let objectStore = db.createObjectStore(this.category, { keyPath: "id" });
    objectStore.createIndex("value", "value", { unique: false });
    objectStore.createIndex("default_value", "default_value", { unique: false });
    const keys = Object.keys(this.defaults);
    for (let i = 0; i < keys.length; i++) {
      const obj = {
        value: this.defaults[keys[i]].value,
        default_value: this.defaults[keys[i]].default_value,
        id: keys[i]
      };
      objectStore.put(obj);
    }
  }
  get indexedDB() {
    return window["indexedDB"] || window["mozIndexedDB"] || window["webkitIndexedDB"] || window["msIndexedDB"];
  }
}
export {
  SettingsManager
}
export default SettingsManager;