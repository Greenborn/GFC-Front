import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
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
