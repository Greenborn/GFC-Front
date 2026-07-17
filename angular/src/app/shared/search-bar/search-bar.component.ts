import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

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
  standalone: false,
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit, OnChanges {

  @ViewChild('atributoSelect') atributoSelect: ElementRef;
  @ViewChild('queryInput') queryInput: any;
  @Input() atributos: string[] = undefined;
  @Input() atributosObj: SearchBarComponentAtributo[] = undefined;
  @Input() data: any[];
  @Input() innerSelect: boolean = false;
  @Input() hideFieldSelector: boolean = false;

  @Output() dataChange = new EventEmitter<any[]>()
  @Output() buscar = new EventEmitter<SearchBarComponentParams>()
  
  private origData: any[];
  private dataFiltered: any[];
  public atributoSelected: string = '';
  private searchSubject = new Subject<{ atributo: string; query: string }>();

  constructor() { }

  getCancelbuttonStatus() {
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
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev.query === curr.query && prev.atributo === curr.atributo)
    ).subscribe(params => {
      this.executeSearch(params.atributo, params.query);
    });
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.data && changes.data.currentValue != this.dataFiltered) {
      this.origData = changes.data.currentValue
      if (this.queryInput != undefined) {
        this.queryInput.value = ''
      }
      if (this.atributosPasados?.length === 1) {
        this.atributoSelected = this.getAtributoValor(this.atributosPasados[0])
      }
    }
  } 

  output() {
    if (this.origData == undefined && this.data != undefined) {
      this.origData = [...this.data]
    }
    if (!this.atributoSelected && this.atributosPasados?.length === 1) {
      this.atributoSelected = this.getAtributoValor(this.atributosPasados[0])
    }
    let atributo: string = this.atributoSelected;
    let query: string = this.queryInput?.value ?? '';
    this.searchSubject.next({ atributo, query });
  }

  private executeSearch(atributo: string, query: string) {
    let atributoObj: SearchBarComponentAtributo = (this.atributosObj ?? []).find(a => atributo == a.valor)
    let filterCallback: Function;
    if (atributoObj != undefined && atributoObj.callback != undefined) {
      filterCallback = atributoObj.callback
    } else if (atributo != '') {
      filterCallback = (e: any, q: string) => {
        return e[atributo] != undefined ? String(e[atributo]).includes(q) : false
      } 
    } else {
      filterCallback = (e: any, q: string) => this.atributosObj.map(o => o.callback(e, q)).reduce((acc, v) => acc || v)
    }
    this.buscar.emit({ atributo, query });
    if (this.origData != undefined) {
      this.dataFiltered = this.origData.filter(e => filterCallback(e, query))
      this.dataChange.emit(this.dataFiltered)
    }
  }

  changeRadio(atributoValue: string | EventTarget = '') {
    if (typeof atributoValue != 'string') {
      atributoValue = (atributoValue as any).value
    }
    this.atributoSelected = atributoValue as string
    this.output()
  }

}
