import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-concurso-tabs',
  templateUrl: './concurso-tabs.component.html',
  styleUrls: ['./concurso-tabs.component.scss'],
})
export class ConcursoTabsComponent implements OnInit {

  @Input() totConcursantes: number;

  constructor() { }

  ngOnInit() {}

}
