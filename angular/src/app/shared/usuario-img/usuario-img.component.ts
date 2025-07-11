import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-usuario-img',
  templateUrl: './usuario-img.component.html',
  styleUrls: ['./usuario-img.component.scss'],
  inputs: ['src']
})
export class UsuarioImgComponent implements OnInit {

  @Input() src: string;
  @Input() imageChangeClick:Subject<any> = new Subject();
  @Input() imageChangeEnabled:Boolean = false;

  constructor() { }

  ngOnInit() {
    
  }

  imageClick(){
    this.imageChangeClick.next();
  }

 
}
