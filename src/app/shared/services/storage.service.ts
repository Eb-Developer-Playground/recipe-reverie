import { Injectable, OnInit } from '@angular/core';

import { RxDatabase, addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';

import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

@Injectable({
  providedIn: 'root',
})
export class StorageService implements OnInit {
  constructor() {}

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

  _database?: RxDatabase;

  async ngOnInit() {
    addRxPlugin(RxDBAttachmentsPlugin);
    addRxPlugin(RxDBDevModePlugin);
    this._database = await this.createRxDatabase();
  }

  writeToStorage(key: string, item: any) {
    // Don't JSON stringigy data that is already a string
    if (typeof item == 'string') return localStorage.setItem(key, item);

    return localStorage.setItem(key, JSON.stringify(item));
  }

  private readonly DOCUMENT_NOT_FOUND = 'Document not found';
  private readonly COLLECTION_NOT_FOUND = 'Collection not found';

  private createRxDatabase(name: string = 'recipe-reverie') {
    return createRxDatabase({
      name: name,
      storage: getRxStorageDexie(),
    });
  }

  // Collection CRUD

  createRxCollection(
    collectionName: string,
    collectionSchema: RxDBSchema | RxDBWithAttachmentsSchema
  ) {
    return this._database?.addCollections({
      [collectionName]: {
        schema: collectionSchema,
      },
    });
  }

  private _getRxCollection(name: string) {
    return this._database?.[name];
  }

  getCollection(name: string) {
    return this._getRxCollection(name);
  }
  getCollection$(name: string) {
    return this.getCollection(name)?.$;
  }

  deleteCollection(name: string) {
    return this._getRxCollection(name)?.remove();
  }

  // Document CRUD
  createDocument(collectionName: string, document: any) {
    return this._getRxCollection(collectionName)?.insert(document);
  }

  createManyDocuments(collectionName: string, documents: any[]) {
    return this._getRxCollection(collectionName)?.bulkInsert(documents);
  }

  getDocument(collectionName: string, primaryKeyValue: DocumentIndexType) {
    const collection = this._getRxCollection(collectionName);
    if (!collection) throw new Error(this.COLLECTION_NOT_FOUND);

    if (typeof primaryKeyValue == 'string') {
      return collection.findOne(primaryKeyValue);
      // return collection.findByIds([primaryKeyValue]);
    } else {
      const id = collection.schema.getPrimaryOfDocumentData(primaryKeyValue);
      return collection.findOne(id);
    }
  }

  getDocument$(collectionName: string, primaryKeyValue: string) {
    return this.getDocument(collectionName, primaryKeyValue).$;
  }

  updateDocument(
    collectionName: string,
    primaryKeyValue: string,
    updates: SchemaPrimaryKey
  ) {
    const doc = this.getDocument(collectionName, primaryKeyValue);
    if (!doc || !doc.exists) throw new Error(this.DOCUMENT_NOT_FOUND);
    return doc.update(updates);
  }

  deleteManyDocuments(collectionName: string, keys: string[]) {
    return this._getRxCollection(collectionName)?.bulkRemove(keys);
  }

  deleteDocument(collectionName: string, primaryKeyValue: string) {
    return this.getDocument(collectionName, primaryKeyValue).remove();
  }
}

// Interfaces and types for RxDB

export interface RxDBSchema {
  version: number;
  primaryKey: SchemaPrimaryKey;
  type: string;
  properties: {
    [keys: string]: {
      type: string;
      [keys: string]: any;
    };
  };
  required: string[];
}
export interface RxDBWithAttachmentsSchema extends RxDBSchema {
  attachments: {
    encrypted: boolean;
  };
}

type SchemaPrimaryKey =
  | string
  | { key: string; fields: string[]; separator: string };

type DocumentIndexType = string | { [keys: string]: any };

export interface RxDBDocUpdateOperators {
  // Fields operators
  $currentDate?: {
    [keys: string]: boolean | { $type: 'timestamp' } | { $type: 'date' };
  };
  $inc?: {
    [keys: string]: number;
  };
  $min?: {
    [keys: string]: any;
  };
  $max?: {
    [keys: string]: any;
  };
  $mul?: {
    [keys: string]: number;
  };
  $rename?: {
    [keys: string]: string;
  };
  $set?: {
    [keys: string]: any;
  };
  $setOnInsert?: {
    [keys: string]: any;
  };
  $unset?: {
    [keys: string]: any;
  };
}

export interface documentAttachment {
  id: string;
  data: string | Blob;
  type: string;
}
