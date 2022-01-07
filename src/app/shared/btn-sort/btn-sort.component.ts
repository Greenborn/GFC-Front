import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-btn-sort',
  templateUrl: './btn-sort.component.html',
  styleUrls: ['./btn-sort.component.scss'],
})
export class BtnSortComponent implements OnInit, OnChanges {

  @Input() sortFn: Function;
  @Input() data: any[];
  @Input() disabled: boolean = false;
  @Output() sorted = new EventEmitter<any[]>()

  public ordenamientoCreciente: boolean = true
  public dataSorted: any[];
  public selected: boolean = false;

  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    // console.log('changed', changes.data.currentValue, 'from', changes.data.previousValue, 'selected', this.selected, 'sorted', this.dataSorted)
    if (this.selected) {
      const equals = JSON.stringify(this.dataSorted) === JSON.stringify(changes.data.currentValue)
      if (!equals) {
        this.selected = false
        this.dataSorted = undefined
      }
    }
  }

  get ordenamientoTitle(): string {
    return this.ordenamientoCreciente ? 'Decreciente' : 'Creciente'
  }
  get ordenamientoStyle(): string {
    return this.ordenamientoCreciente ? '' : 'transform: rotateY(180deg)'
  }
  get ordenamientoFill(): string {
    return this.selected ? 'fill' : 'clear'
  }

  // get selected(): boolean {
  //   return JSON.stringify(this.dataSorted) === JSON.stringify(this.data)
  //   // return this.dataSorted == undefined ? false : 
  //   //   (this.data[0] == this.dataSorted[0])
  // }

  ordenar() {
    this.ordenamientoCreciente = !this.ordenamientoCreciente
    this.dataSorted = [...this.data.sort((c1, c2) => this.sortFn(c1, c2, this.ordenamientoCreciente))]
    this.sorted.emit([...this.dataSorted])
    this.selected = true
  }
}
