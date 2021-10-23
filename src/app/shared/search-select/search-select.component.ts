import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';


export interface SearchSelectOption {
  value: string;
  title: string;
}

export interface SearchSelectOptions {
  // data: any[];
  valueProp: string;
  queryParam : string;
  titleProp: string;
}

@Component({
  selector: 'app-search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss'],
})
export class SearchSelectComponent implements OnInit, OnChanges {


  @Input() title: string;
  // @Input() data: any[];
  @Input() optionsProps: SearchSelectOptions;
  @Input() optionsData: any[];
  // @Input() filterCallback: Function; // (obj: any, atributoValue: string) => boolean
  @Input() interface: string;

  // @Output() dataChange = new EventEmitter<any[]>()
  
  private origData: any[];
  private dataFiltered: any[];
  public atributoSelected: string = '';
  public queryParams: Params;
  public updatingSelect: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  get atributoSelectedAsInt() {
    return parseInt(this.atributoSelected)
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.queryParams = {...params}
      const selected = params[this.optionsProps.queryParam]
      // console.log('detecting selected quer yparam', selected)
      this.updatingSelect = true
      if (selected != undefined) {
        this.atributoSelected = selected
      } else {
        this.atributoSelected = ''
      }
      // console.log('updated atributoSelected', this.atributoSelected)
      setTimeout(() => this.updatingSelect = false, 100)
      // this.output()
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log('changed', changes.data.currentValue, 'from', changes.data.previousValue, 'selected', this.selected, 'sorted', this.dataSorted)
    // if (this.selected) {
    //   const equals = JSON.stringify(this.dataSorted) === JSON.stringify(changes.data.currentValue)
    //   if (!equals) {
    //     this.selected = false
    //     this.dataSorted = undefined
    //   }
    // }
    // if ((changes.data.currentValue ?? []).length != (this.dataFiltered ?? []).length) {
      // this.updateOrigData(changes.data.currentValue)
    // }
  }

  // updateOrigData(data: any[]) {
  //   this.origData = [...data]
  //   console.log('updating data', [...this.origData])
  // }

  // output() {
  //   if (this.origData == undefined) {
  //     this.origData = [...this.data]
  //   }

  //   let atributoValue: string = this.atributoSelected;
  //   if (atributoValue == '') {
  //     this.dataFiltered = [...this.origData]
  //     this.dataChange.emit([...this.origData])
  //   } else {
  //     this.dataFiltered = this.data.filter(e => this.filterCallback(e, atributoValue))
  //     this.dataChange.emit(
  //       [...this.dataFiltered]
  //     )
  //   }
  // }

  public changeQuery(value: string | EventTarget = '') {
    // if (typeof value != 'string') {
    if (!['string', 'number'].includes(typeof value)) {
      // console.log('changing query from select element', value)
      value = (value as HTMLIonSelectElement).value
    }
    // const queryParams: Params = { myParam: 'myNewValue' };
    // const queryParams: Params = {...this.queryParams};
    const queryParams: Params = this.queryParams;
    if (value != '') {
      // console.log('updating query', this.optionsProps.queryParam, value)
      queryParams[this.optionsProps.queryParam] = value
    } else {
      // console.log('resetting query')
      delete queryParams[this.optionsProps.queryParam]
    }
    // console.log('changing query', queryParams)
    this.router.navigate(
      [], 
      {
        relativeTo: this.route,
        queryParams, 
        // queryParamsHandling: 'merge', // remove to replace all query params by provided
      }
    );
    // this.output()
  }
}
