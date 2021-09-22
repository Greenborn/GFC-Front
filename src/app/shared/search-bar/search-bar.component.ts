import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

export interface SearchBarComponentParams {
  atributo: string;
  query: string;
}
export interface SearchBarComponentAtributo {
  valor: string;
  valorMostrado: string;
}

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {

  @ViewChild('atributoSelect') atributoSelect: ElementRef;
  @ViewChild('queryInput') queryInput: ElementRef;
  @Input() atributos: string[] = undefined;
  @Input() atributosObj: SearchBarComponentAtributo[] = undefined;
  @Output() buscar = new EventEmitter<SearchBarComponentParams>()

  constructor() { }

  get cancelbuttonStatus() {
    if (this.queryInput) {
      return this.queryInput.nativeElement.value == '' ? 'never' : 'always'
    } else {
      return 'never'
    }
  }

  get atributosPasados() {
    return this.atributos != undefined ? this.atributos : this.atributosObj;
  }

  getAtributoValor(a: string | SearchBarComponentAtributo) {
    return typeof a === 'string' ? a : a.valor
  }
  getAtributoValorMostrado(a: string | SearchBarComponentAtributo) {
    return typeof a === 'string' ? a[0].toUpperCase() + a.substr(1) : a.valorMostrado;
  }

  ngOnInit() {}

  output() {
    let atributo: string = this.atributoSelect.nativeElement.value;
    let query: string = this.queryInput.nativeElement.value;
    // console.log('Buscando ', query, ' atributo: ', this.atributoSelect.nativeElement.value)
    this.buscar.emit({
      query,
      atributo
    });
  }

}
