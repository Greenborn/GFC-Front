import { Component, OnInit } from '@angular/core';

import { ConcursoService } from './concurso.service';
import { Concurso } from './concurso.model';

@Component({
  selector: 'app-concursos',
  templateUrl: './concursos.page.html',
  styleUrls: ['./concursos.page.scss'],
})
export class ConcursosPage implements OnInit {

  private concursos: Concurso[] = [];
  private searchQuery: string = '';

  constructor(
    private db: ConcursoService
  ) { }

  get concursosFiltrados(): Concurso[] {
    const q = this.searchQuery;
    return this.concursos.filter(c => c.name.substr(0, q.length) == q)
  }

  async ngOnInit() {
    this.concursos = await this.db.getConcursos()
  }

  async ionViewWillEnter() {
    this.concursos = await this.db.getConcursos()
  }

  // para implementar busqueda con la api (sobrescribe variable de concursos)
  // async buscarConcursos(searchQuery) {
  //   console.log(searchQuery)
  // }
}
