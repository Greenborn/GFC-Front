import { Component, OnInit } from '@angular/core';

import { ConcursoService } from './concurso.service';
import { Concurso } from './concurso.model';

@Component({
  selector: 'app-concursos',
  templateUrl: './concursos.page.html',
  styleUrls: ['./concursos.page.scss'],
})
export class ConcursosPage implements OnInit {

  private concursos: Concurso[] = []

  constructor(
    private db: ConcursoService
  ) { }

  async ngOnInit() {
    this.concursos = await this.db.getConcursos()
  }

  async ionViewWillEnter() {
    this.concursos = await this.db.getConcursos()
  }
}
