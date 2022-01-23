import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-usuario-img',
  templateUrl: './usuario-img.component.html',
  styleUrls: ['./usuario-img.component.scss'],
  inputs: ['src']
})
export class UsuarioImgComponent implements OnInit {
// export class UsuarioImgComponent implements OnInit {

  @Input() src: string;
  @ViewChild('img') img: HTMLIonImgElement;
  public yepImg: boolean = true;

  constructor() { }

  ngOnInit() {
    
  }

 
}
