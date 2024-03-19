import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  writeToStorage(key: string, item: any) {
    if (typeof item == 'string') return localStorage.setItem(key, item);
    return localStorage.setItem(key, JSON.stringify(item));
  }

  readFromStorage(key: string) {
    let item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
    else return null;
  }

  delete(key: string) {
    return localStorage.removeItem(key);
  }

  clear() {
    return localStorage.clear();
  }
}
