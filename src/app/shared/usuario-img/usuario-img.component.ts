import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-usuario-img',
  templateUrl: './usuario-img.component.html',
  styleUrls: ['./usuario-img.component.scss'],
  inputs: ['src']
})
export class UsuarioImgComponent implements OnInit, OnChanges {
// export class UsuarioImgComponent implements OnInit {

  @Input() src: string;
  @ViewChild('img') img: HTMLIonImgElement;
  public yepImg: boolean = true;

  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.yepImg = true;
    // console.log('cambiando img component', this.img, changes);
    if (this.img && changes.src) {
      // console.log('cambiando src')
      this.img.src = changes.src.currentValue;
    }
  }
  
  // falsear(ev: any){
  //   if(ev) {
  //     this.yepImg = false;
  //   }
  // }

  mostrarIcono(e: any, mostrar: boolean) {
    // console.log('toggle icono', e.target.src)
    if (mostrar) {
      // console.log('mostrando icono y reseteando src')
      e.target.src = ''
    } else {
      // console.log('mostrando imagen')
    }
    this.yepImg = !mostrar;
  }

  change() {
    // console.log('cambiando src')
  }
}
