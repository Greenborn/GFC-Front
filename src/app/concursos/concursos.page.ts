import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';

import { ConcursoService } from '../services/concurso.service';
import { Concurso } from './concurso.model';
import { NotificacionesPage } from '../notificaciones/notificaciones.page';
import { UsuarioPage } from '../usuario/usuario.page';
import { AuthService } from '../services/auth/auth.service';
import { SearchBarComponentAtributo, SearchBarComponentParams } from '../shared/search-bar/search-bar.component';

@Component({
  selector: 'app-concursos',
  templateUrl: './concursos.page.html',
  styleUrls: ['./concursos.page.scss'],
})
export class ConcursosPage implements OnInit {

  public concursos: Concurso[] = [];
  public searchParams: SearchBarComponentParams;
  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { valor: 'name', valorMostrado: 'Nombre' },
    { valor: 'description', valorMostrado: 'Descripcion' }
  ];

  constructor(
    private db: ConcursoService,
    public popoverController: PopoverController,
    private router: Router,
    private auth: AuthService
  ) { }

  // get concursosFiltrados(): Concurso[] {
  //   const q = this.searchQuery;
  //   return this.concursos.filter(c => c.name.substr(0, q.length) == q)
  // }
  async filtrarConcursos(output: SearchBarComponentParams) {
    if (output != undefined) {
      // console.log('buscando', output)
      let { atributo, query } = output;
      this.searchParams = output;
      this.concursos = (await this.db.getConcursos()).filter(u => {
        // console.log('buscando', atributo, query)
        switch (atributo) {
          case 'description': return u[atributo].search(new RegExp(query, 'i')) > -1;
          default: return u[atributo].search(new RegExp(`^${query}`, 'i')) > -1
        }
      });
    }
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



  // popover
  async openPopover( ev:any, ctrl: any, url: string ){
    if (window.innerWidth > 767) {
      const popover = await this.popoverController.create({
        component: ctrl, //componente a mostrar
        cssClass: 'my-custom-class',
        event: ev,
        translucent: true,
        // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
      });
      await popover.present();
      // this.router.events.subscribe() // dismiss popover cuando cambie de ruta

      const { role } = await popover.onDidDismiss();
      // console.log('onDidDismiss resolved with role', role);
    }
    else {
      this.router.navigate([url]);
    }
  }
  async mostrarPerfil( ev:any ){
    this.openPopover(ev, UsuarioPage, '/perfil');
  }
  async mostrarNotificaciones( ev:any ) {
    this.openPopover(ev, NotificacionesPage, '/notificaciones');
  }
}
