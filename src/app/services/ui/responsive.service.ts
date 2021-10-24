import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {

  constructor() { }

  public get tamWidth() {
    return window.innerWidth
  }

  public get isDesktop() {
    return this.tamWidth > 768
  }
}
