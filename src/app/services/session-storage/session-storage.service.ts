import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setItem(key: string, value: any): void {
    if(!isPlatformBrowser(this.platformId))
      return
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key: string): any {
    if(!isPlatformBrowser(this.platformId))
      return null
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  removeItem(key: string): void {
    if(!isPlatformBrowser(this.platformId))
      return
    sessionStorage.removeItem(key);
  }

  clear(): void {
    if(!isPlatformBrowser(this.platformId))
      return
    sessionStorage.clear();
  }

  restart(): void {
    if(!isPlatformBrowser(this.platformId))
      return
    sessionStorage.clear();
  }

}