import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-usuario-img',
  templateUrl: './usuario-img.component.html',
  styleUrls: ['./usuario-img.component.scss'],
  inputs: ['src']
})
export class UsuarioImgComponent implements OnChanges {

  @Input() src: string;
  @Input() imageChangeClick:Subject<any> = new Subject();
  @Input() imageChangeEnabled:Boolean = false;

  imgError = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['src'] && changes['src'].currentValue !== changes['src'].previousValue) {
      this.imgError = false;
    }
  }

  imageClick(){
    this.imageChangeClick.next(true);
  }

 
}
