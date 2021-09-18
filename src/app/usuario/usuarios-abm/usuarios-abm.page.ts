import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '../usuario.model';
import { UsuarioService } from '../usuario.service';

import { TablaUsuariosComponent } from '../../tabla-usuarios/tabla-usuarios.component'
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-usuarios-abm',
  templateUrl: './usuarios-abm.page.html',
  styleUrls: ['./usuarios-abm.page.scss'],
})
export class UsuariosAbmPage implements OnInit {
  @ViewChild("tabla-usuarios") tablaUsuariosComponent:TablaUsuariosComponent;

  usuarios: Usuario[] = [];
  public searchQuery: string = '';

  constructor(
    private db: UsuarioService,
    private alertCtrl: AlertController
  ) { }

  get usuariosFiltrados() {
    // return [ ...this.usuarios ];
    const q = this.searchQuery;
    return this.usuarios.filter(u => u.username.substr(0, q.length) == q)
  }
  get usuarioProps() {
    return Object.keys(this.usuarios[0]);
  }

  async deleteUsuario(id: number) {

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
            const r = await this.db.deleteUsuario(id);
            if (r) {
              this.refresh();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async ngOnInit() {
    this.refresh();
  }

  async ionViewWillEnter() {
    this.refresh();
  }

  async refresh() {
    this.usuarios = await this.db.getUsuarios();
  }

  // para implementar busqueda con la api (sobrescribe variable de usuarios)
  // async buscarUsuarios(searchQuery) {
  //   console.log(searchQuery)
  // }
}