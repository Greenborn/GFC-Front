import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BtnSortComponent } from '../btn-sort/btn-sort.component';

@Component({
  standalone: true,
  imports: [CommonModule, BtnSortComponent],
  selector: 'app-th-sort',
  templateUrl: './th-sort.component.html',
  styleUrls: ['./th-sort.component.scss'],
})
export class ThSortComponent implements OnInit {

  @Input() data: any[];
  @Input() sortFn: Function;
  @Input() title: string;

  @Output() dataChange = new EventEmitter<any[]>()

  constructor() { }

  ngOnInit() {}

}
