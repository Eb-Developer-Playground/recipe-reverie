import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

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
}
