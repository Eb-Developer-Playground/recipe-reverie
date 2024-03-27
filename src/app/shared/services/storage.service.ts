import { Injectable, OnInit } from '@angular/core';
import { RxDatabase, addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
addRxPlugin(RxDBDevModePlugin);

import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

@Injectable({
  providedIn: 'root',
})
export class StorageService implements OnInit {
  constructor() {}

  private database?: RxDatabase;

  async ngOnInit() {
    this.database = await this.createRxDatabase();
  }

  writeToStorage(key: string, item: any) {
    // Don't JSON stringigy data that is already a string
    if (typeof item == 'string') return localStorage.setItem(key, item);

    return localStorage.setItem(key, JSON.stringify(item));
  }

  readFromStorage(key: string) {
    let item = localStorage.getItem(key);
    let parsed: any;
    try {
      if (item) {
        parsed = JSON.parse(item);
        return parsed;
      } else return null;
    } catch (error) {
      // If stored item was a string and not stringified JSON, return that string directly
      if (error instanceof SyntaxError) {
        try {
          return item;
        } catch (error) {
          throw error;
        }
      } else throw error;
    }
  }

  delete(key: string) {
    return localStorage.removeItem(key);
  }

  clear() {
    return localStorage.clear();
  }

  /*
  RXDB CODE
  */

  private createRxDatabase(name: string = 'recipe-reverie') {
    return createRxDatabase({
      name: name,
      storage: getRxStorageDexie(),
    });
  }

  // Collection CRUD

  createRxCollection(collectionName: string, collectionSchema: RxDBSchema) {
    return this.database?.addCollections({
      [collectionName]: {
        schema: collectionSchema,
      },
    });
  }

  getRxCollection(name: string) {
    return this.database?.[name];
  }

  // Document CRUD
  async createDocument(collectionName: string, document: any) {
    return this.database?.[collectionName].insert(document);
  }

  async createManyDocuments(collectionName: string, documents: any[]) {
    return this.database?.[collectionName].bulkInsert(documents);
  }

  readDocument(collectionName: string, primaryKeyValue: string) {
    const collection = this.getRxCollection(collectionName);
    if (!collection) throw new Error('Collection does not exist');
    return collection.findByIds([primaryKeyValue]);
  }
}

export interface RxDBSchema {
  version: number;
  primaryKey: string;
  type: string;
  properties: {
    [keys: string]: {
      type: string;
      [keys: string]: any;
    };
  };
  required: string[];
}
