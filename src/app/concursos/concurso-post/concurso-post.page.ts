import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ConcursoService } from '../../services/concurso.service';
import { Concurso } from '../concurso.model';

@Component({
  selector: 'app-concurso-post',
  templateUrl: './concurso-post.page.html',
  styleUrls: ['./concurso-post.page.scss'],
})
export class ConcursoPostPage implements OnInit {

  concurso: Concurso;

  constructor(
    private activatedRoute: ActivatedRoute,
    private db: ConcursoService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      const id = paramMap.get('id');

      let c = ConcursoService.concursoTemplate();
      this.concurso = c;
      if (id != null) {
        c = await this.db.getConcurso(parseInt(id));
        c.start_date = ConcursoService.formatearFechaParaHTML(c.start_date);
        c.end_date = ConcursoService.formatearFechaParaHTML(c.end_date);
      }

      this.concurso = c;
    })
  }

  get formTitle(): string {
    const c = this.concurso;
    return (c.id != null ? 'Editar' : 'Agregar') + ' concurso'
  }
  get backUrl(): string {
    const c = this.concurso 
    return '/concursos' + (c.id != null ? `/${c.id}` : '')
  }

  async postConcurso(f: NgForm) {
    if (f.valid) {
      // console.log(f.value);
      const c = {
        id: this.concurso.id,
        ...f.value,
        start_date: ConcursoService.formatearFechaParaBD(f.value.start_date),
        end_date: ConcursoService.formatearFechaParaBD(f.value.end_date)
      };
      // console.log('Posteando concurso: ', c);
      const id = await this.db.postConcurso(c);
      this.router.navigate(['/concursos/' + id]);
    }
    else {
      console.log('Form concurso no valido:', f.value);
    }
  }
}
