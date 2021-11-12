import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from '../models/ApiConsumer';
import { InfoCentro } from '../models/info_centro.model';
import { InfoCentroService } from '../services/info-centro.service';
import { ResponsiveService } from '../services/ui/responsive.service';
import { UiUtilsService } from '../services/ui/ui-utils.service';
import { MenuAccionesComponentAccion } from '../shared/menu-acciones/menu-acciones.component';
import { InfoCentroPostComponent } from './info-centro-post/info-centro-post.component';

@Component({
  selector: 'app-info-centro',
  templateUrl: './info-centro.page.html',
  styleUrls: ['./info-centro.page.scss'],
})
export class InfoCentroPage extends ApiConsumer implements OnInit {

  public parrafos: InfoCentro[] = [];

  constructor(
    private infoCentroService: InfoCentroService,
    alertController: AlertController,
    public UIUtilsService: UiUtilsService,
    public responsiveService: ResponsiveService
  ) {
    super(alertController)
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    super.fetch<InfoCentro[]>(
      () => this.infoCentroService.getAll()
    )
    .subscribe(info => {
      this.parrafos = info
    })
  }

  async postParrafo(p: InfoCentro = undefined) {
    const { parrafo } = await this.UIUtilsService.mostrarModal(InfoCentroPostComponent, { parrafo: {...p} })
    // console.log('Dismissed modal post fotoclub. Recibido ', f)
    if (parrafo == undefined) return;
    if (p != undefined) {
      this.parrafos.splice(this.parrafos.findIndex(p1 => p1.id == p.id), 1, parrafo)
    } else {
      this.parrafos.push(parrafo)
    }
  }

  async deleteParrafo(p: InfoCentro) {
    const id = p.id

    const alert = await this.UIUtilsService.mostrarAlert({
      header: `Confirmar borrado`,
      message: 'No se podrá eliminar si tiene usuarios asociados.'
      }, 
      async () => {
        super.fetch<void>(() => this.infoCentroService.delete(id)).subscribe(
          _ => this.parrafos.splice(this.parrafos.findIndex(p => p.id == id), 1)
        )
        // this.UIUtilsService.mostrarError({ message: 'Falta implementar la restricción de borrado' })
      }
    )
  }

  async mostrarAcciones(ev: any, p: InfoCentro) {
    const acciones: MenuAccionesComponentAccion[] = [
      {
        accion: (params: string[]) => this.postParrafo(p),
        params: [],
        icon: 'create',
        label: 'Editar'
      },
      {
        accion: (params: number[]) => this.deleteParrafo(p),
        params: [],
        icon: 'trash',
        label: 'Borrar'
      }
    ]
    this.UIUtilsService.mostrarMenuAcciones(acciones, ev)
  }

}
