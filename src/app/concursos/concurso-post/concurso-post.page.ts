import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ContestService } from 'src/app/services/contest.service';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Contest } from 'src/app/models/contest.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-concurso-post',
  templateUrl: './concurso-post.page.html',
  styleUrls: ['./concurso-post.page.scss'],
})
export class ConcursoPostPage extends ApiConsumer implements OnInit {

  concurso: Contest = this.contestService.template;
  public posting: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private contestService: ContestService,
    private router: Router,
    alertCtrl: AlertController
  ) { 
    super(alertCtrl)
  }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      const id = paramMap.get('id');

      if (id != null) {
        super.fetch<Contest>(() => 
          this.contestService.get(parseInt(id))
        ).subscribe(c => {
          c.start_date = this.contestService.formatearFechaParaHTML(c.start_date);
          c.end_date = this.contestService.formatearFechaParaHTML(c.end_date);
          this.concurso = c
        })
      }
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
      const model = {
        ...f.value,
        start_date: this.contestService.formatearFechaParaBD(f.value.start_date),
        end_date: this.contestService.formatearFechaParaBD(f.value.end_date)
      }
      console.log('posting concurso', model, this.concurso.id)
      this.posting = true
      super.fetch<Contest>(() =>
        this.contestService.post(model, this.concurso.id)
      ).subscribe(
        c => {
          this.posting = false
          console.log('posteado', c)
          this.router.navigate(['/concursos/', c.id]);
        },
        async err => {
          this.posting = false;
          (await this.alertCtrl.create({
            header: 'Error',
            message: (err.error as []).map(e => (e as any).message).join('<br>'),
            buttons: [{
              text: 'Ok',
              role: 'cancel'
            }]
          })).present()
        },
      )
      // this.router.navigate(['/concursos/' + id]);
    }
    else {
      console.log('Form concurso no valido:', f.value);
    }
  }
}
