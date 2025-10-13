import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';

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
export class SearchBarComponent implements OnInit, OnChanges {

  @ViewChild('atributoSelect') atributoSelect: ElementRef;
  @ViewChild('queryInput') queryInput: IonSearchbar;
  @Input() atributos: string[] = undefined;
  @Input() atributosObj: SearchBarComponentAtributo[] = undefined;
  @Input() data: any[];
  @Input() innerSelect: boolean = false;

  @Output() dataChange = new EventEmitter<any[]>()
  @Output() buscar = new EventEmitter<SearchBarComponentParams>()
  
  private origData: any[];
  private dataFiltered: any[];
  public atributoSelected: string = '';

  constructor() { }

  getCancelbuttonStatus() {
    // console.log(q.value)
    if (!this.queryInput) return 'never';
    const empty = this.queryInput.value == undefined || this.queryInput.value == '' 
    return empty ? 'never' : 'always'
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

  async ngOnChanges(changes: SimpleChanges) {
    // console.log('detectomg data change', changes.data?.currentValue)
    if (changes.data && changes.data.currentValue != this.dataFiltered) {
      this.origData = changes.data.currentValue
      this.atributoSelected = ''
      // this.searchQuery = ''
      if (this.queryInput != undefined) {
        // const q = await this.queryInput.getInputElement()
        // q.value = ''
        this.queryInput.value = ''
      }
    }
  } 

  output() {
    if (this.origData == undefined) {
      this.origData = [...this.data]
    }
    // let atributo: string = this.atributoSelect.nativeElement.value;
    let atributo: string = this.atributoSelected;
    let query: string = this.queryInput.value;
    // let query: string = this.queryInput.value;

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
      // console.log('TODO: Filtrando por todos los callbacks y atributos...')
      filterCallback = (e: any, q: string) => this.atributosObj.map(o => o.callback(e, q)).reduce((acc, v) => acc || v)
    }
    // console.log('Buscando ', query, ' atributo: ', this.atributoSelect.nativeElement.value)
    // this.buscar.emit({
    //   query,
    //   atributo
    // });
    // console.log('searching', atributo, query, this.atributoSelect.nativeElement)
    this.dataFiltered = this.origData.filter(e => filterCallback(e, query))
    this.dataChange.emit(
      this.dataFiltered
    )
  }

  changeRadio(atributoValue: string | EventTarget = '') {
    if (typeof atributoValue != 'string') {
      atributoValue = (atributoValue as HTMLIonRadioGroupElement).value
    }
    // console.log('changing radio', ev.target.value)
    this.atributoSelected = atributoValue as string
    this.output()
  }

}
