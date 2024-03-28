import { TestBed } from '@angular/core/testing';

import { RxDBSchema, StorageService } from './storage.service';
import { isRxCollection, isRxDatabase } from 'rxdb';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  describe('Local Storage', () => {
    beforeEach(() => {
      localStorage.clear();
    });
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should write to storage', () => {
      const testObject = { key: 1 };
      const testKey = 'key';

      service.writeToStorage(testKey, testObject);

      let storedItem = localStorage.getItem(testKey);
      let parsedItem: any = undefined;
      if (storedItem) parsedItem = JSON.parse(storedItem);

      expect(parsedItem).toBeDefined();
      expect(parsedItem['key']).toEqual(testObject['key']);
    });

    it('should read from storage', () => {
      const testObject = { key: 1 };
      const testKey = 'key';

      localStorage.setItem(testKey, JSON.stringify(testObject));

      let readItem = service.readFromStorage(testKey);

      expect(readItem).not.toBeNull();
      expect(readItem).not.toBeUndefined();
      expect(readItem['key']).toEqual(testObject['key']);
    });

    it('should delete an item', () => {
      const testObject = { key: 1 };
      const testKey = 'key';

      localStorage.setItem(testKey, JSON.stringify(testObject));

      service.delete(testKey);

      let storedItem = localStorage.getItem(testKey);
      let parsedItem: any = undefined;
      if (storedItem) parsedItem = JSON.parse(storedItem);

      expect(storedItem).toBeNull();
      expect(parsedItem).toBeUndefined();
    });
  });

  describe('RXDB', () => {
    describe('createRxDatabase()', () => {
      it('should initialize on service initialization', () => {
        expect(isRxDatabase(service._database)).toBeDefined;
        expect(isRxDatabase(service._database)).toEqual(true);
      });
    });
    describe('createRxCollection()', () => {
      it('should create a collection', async () => {
        const testName = 'test';
        const testSchema: RxDBSchema = {
          version: 0,
          primaryKey: testName,
          type: 'string',
          properties: {
            [testName]: {
              type: 'string',
            },
          },
          required: [testName],
        };

        const collections = await service.createRxCollection(
          testName + '-collection',
          testSchema
        );
        console.log(collections);
        const retrievedCollection =
          service._database?.[testName + '-collection'];

        expect(retrievedCollection).toBeDefined();
        expect(isRxCollection(retrievedCollection)).toEqual(true);
        expect(collections?.[testName + '-collection']).toEqual(
          retrievedCollection
        );
      });
    });
  });
});
