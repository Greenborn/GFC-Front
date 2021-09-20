import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';


import { ConcursoService } from '../concurso.service';
import { Concurso } from '../concurso.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-concurso-detail',
  templateUrl: './concurso-detail.page.html',
  styleUrls: ['./concurso-detail.page.scss'],
})
export class ConcursoDetailPage implements OnInit {

  concurso: Concurso;

  constructor(
    private activatedRoute: ActivatedRoute,
    private db: ConcursoService,
    private router: Router,
    private alertCtrl: AlertController,
    // private loadingCtrl: LoadingController,
    private auth: AuthService
  ) { }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      // let loading = await this.loadingCtrl.create({
      //   message: 'Please wait...'
      // });
    
      // loading.present();
      this.concurso = ConcursoService.concursoTemplate();
      this.concurso = await this.db.getConcurso(parseInt(paramMap.get('id')));
      // loading.dismiss();
    })
  }
  
  get fechaInicio(): string {
    return ConcursoService.formatearFechaParaHTML(this.concurso.start_date);
  }
  get fechaFin(): string {
    return ConcursoService.formatearFechaParaHTML(this.concurso.end_date);
  }

  async deleteConcurso() {

    const alert = await this.alertCtrl.create({
      header: 'Confirmar borrado',
      message: 'Cuidado',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Confirmar',
          handler: async () => {
            await this.db.deleteConcurso(this.concurso.id);
            this.router.navigate(['/concursos']);
          }
        }
      ]
    });

    await alert.present();
  }
}
