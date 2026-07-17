import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-btn-sort',
  templateUrl: './btn-sort.component.html',
  styleUrls: ['./btn-sort.component.scss'],
})
export class BtnSortComponent implements OnChanges {

  @Input() sortFn: Function;
  @Input() data: any[];
  @Input() disabled: boolean = false;
  @Output() sorted = new EventEmitter<any[]>()

  public ordenamientoCreciente: boolean = true
  public dataSorted: any[];
  public selected: boolean = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
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

  ordenar() {
    this.ordenamientoCreciente = !this.ordenamientoCreciente
    this.dataSorted = [...this.data.sort((c1, c2) => this.sortFn(c1, c2, this.ordenamientoCreciente))]
    this.sorted.emit([...this.dataSorted])
    this.selected = true
  }
}
