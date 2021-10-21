import { Component, Input, OnInit } from '@angular/core';
import { Contest } from 'src/app/models/contest.model';
import { ContestService } from 'src/app/services/contest.service';

@Component({
  selector: 'app-contest-status-chip',
  templateUrl: './contest-status-chip.component.html',
  styleUrls: ['./contest-status-chip.component.scss'],
})
export class ContestStatusChipComponent implements OnInit {

  @Input() contest: Contest;

  constructor(
    private contestService: ContestService
  ) { }

  ngOnInit() {}

  isActive(c: Contest) {
    return this.contestService.isActive(c)
  }
}
