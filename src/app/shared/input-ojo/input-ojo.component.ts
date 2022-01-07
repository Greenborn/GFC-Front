import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ojo',
  templateUrl: './input-ojo.component.html',
  styleUrls: ['./input-ojo.component.scss'],
})
export class InputOjoComponent implements OnInit {

  @Input('inputId') inputId:string;
  public visibility: boolean = false;
  public passwordInput: HTMLIonInputElement;
  constructor() { }

  ngOnInit() {
    this.passwordInput = document.querySelector(`#${this.inputId}`);

  }

  toggleVisibility(){
    let elem = this.passwordInput
    // console.log(elem)
    let tipo = elem.getAttribute('type');
    if (tipo == "password"){
      elem.setAttribute('type','text');
      this.visibility = true;
    } else {
      elem.setAttribute('type','password');
      this.visibility = false;
    }
  }
}
