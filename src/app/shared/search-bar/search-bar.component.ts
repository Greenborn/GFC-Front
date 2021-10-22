import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

export interface SearchBarComponentParams {
  atributo: string;
  query: string;
}
export interface SearchBarComponentAtributo {
  valor: string;
  valorMostrado: string;
  callback?: Function;
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
  @Input() data: any[];
  @Input() innerSelect: boolean = false;

  @Output() dataChange = new EventEmitter<any[]>()
  @Output() buscar = new EventEmitter<SearchBarComponentParams>()
  
  private origData: any[];
  public atributoSelected: string = '';

  constructor() { }

  get cancelbuttonStatus() {
    if (this.queryInput) {
      return this.queryInput.nativeElement.value == '' ? 'never' : 'always'
    } else {
      return 'never'
    }
  }

  get atributosPasados():Array<any> {
    return this.atributos != undefined ? this.atributos : this.atributosObj;
  }

  getAtributoValor(a: string | SearchBarComponentAtributo) {
    return typeof a === 'string' ? a : a.valor
  }
  getAtributoValorMostrado(a: string | SearchBarComponentAtributo) {
    return typeof a === 'string' ? a[0].toUpperCase() + a.substr(1) : a.valorMostrado;
  }

  ngOnInit() {
  }

  output() {
    if (this.origData == undefined) {
      this.origData = [...this.data]
    }
    // let atributo: string = this.atributoSelect.nativeElement.value;
    let atributo: string = this.atributoSelected;
    let query: string = this.queryInput.nativeElement.value;

    let atributoObj: SearchBarComponentAtributo = (this.atributosObj ?? []).find(a => atributo == a.valor)
    let filterCallback: Function;
    if (atributoObj != undefined && atributoObj.callback != undefined) {
      filterCallback = atributoObj.callback
    } else if (atributo != '') {
      filterCallback = (e: any, q: string) => {
        console.log(e[atributo])
        return e[atributo].includes(q)
      } 
    } else {
      console.log('TODO: Filtrando por todos los callbacks y atributos...')
      filterCallback = () => true
    }
    // console.log('Buscando ', query, ' atributo: ', this.atributoSelect.nativeElement.value)
    // this.buscar.emit({
    //   query,
    //   atributo
    // });
    // console.log('searching', atributo, query, this.atributoSelect.nativeElement)
    this.dataChange.emit(
      this.origData.filter(e => filterCallback(e, query))
    )
  }

  changeRadio(atributoValue: string = '') {
    // console.log('changing radio', ev.target.value)
    this.atributoSelected = atributoValue
    this.output()
  }

}
