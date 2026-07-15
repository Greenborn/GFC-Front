import { Component, Input, OnInit } from '@angular/core';
import { Contest } from 'src/app/models/contest.model';

@Component({
  standalone: false,
  selector: 'app-contest-status-chip',
  templateUrl: './contest-status-chip.component.html',
  styleUrls: ['./contest-status-chip.component.scss'],
})
export class ContestStatusChipComponent implements OnInit {

  @Input() contest: Contest;

  constructor() { }

  ngOnInit() {}
}
