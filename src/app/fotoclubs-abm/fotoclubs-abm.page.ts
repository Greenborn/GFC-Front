import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from '../models/ApiConsumer';
import { Fotoclub } from '../models/fotoclub.model';
import { ConfigService } from '../services/config/config.service';
import { FotoclubService } from '../services/fotoclub.service';
import { UiUtilsService } from '../services/ui/ui-utils.service';
import { MenuAccionesComponentAccion } from '../shared/menu-acciones/menu-acciones.component';
import { SearchBarComponentAtributo } from '../shared/search-bar/search-bar.component';
import { FotoclubPostComponent } from './fotoclub-post/fotoclub-post.component';

@Component({
  selector: 'app-fotoclubs-abm',
  templateUrl: './fotoclubs-abm.page.html',
  styleUrls: ['./fotoclubs-abm.page.scss'],
})
export class FotoclubsAbmPage extends ApiConsumer implements OnInit {

  public mostrarFiltro: boolean = false;
  public funcionesOrdenamiento: Function[] = [];
  public fotoclubs: Fotoclub[] = [];
  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { 
      valor: 'name', 
      valorMostrado: 'Nombre', 
      // callback: (c: ContestResultExpanded, query: string) => c.image.title.toLowerCase().includes(query.toLowerCase())      
      callback: (f: Fotoclub, query: string) => `${f.name}`.match(new RegExp(`${query}`, 'i')) 
    }
  ];

  constructor(
    alertCtrl: AlertController,
    public UIUtilsService: UiUtilsService,
    private fotoclubService: FotoclubService,
    public configService: ConfigService,
  ) {
    super(alertCtrl)
    this.funcionesOrdenamiento['fotoclub'] = (e1: Fotoclub, e2: Fotoclub, creciente: boolean) => {
      const n1 = e1.name
      const n2 = e2.name
      
      return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
        (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
    }
   }

   get aspecto() {
    return document.body.classList.contains("dark")
   }

  async ngOnInit() {
    await this.UIUtilsService.presentLoading()
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(fs => {
      this.fotoclubs = fs
      this.UIUtilsService.dismissLoading()
    })
  }

  async postFotoclub(f: Fotoclub = undefined) {
    const { fotoclub } = await this.UIUtilsService.mostrarModal(FotoclubPostComponent, { fotoclub: {...f} })
    // console.log('Dismissed modal post fotoclub. Recibido ', f)
    if (fotoclub == undefined) return;
    if (f != undefined) {
      this.fotoclubs.splice(this.fotoclubs.findIndex(f1 => f1.id == f.id), 1, fotoclub)
    } else {
      this.fotoclubs.push(fotoclub)
    }
  }

  async deleteFotoclub(f: Fotoclub) {
    const id = f.id

    const alert = await this.UIUtilsService.mostrarAlert({
      header: `Confirmar borrado`,
      message: 'No se podrá eliminar si tiene usuarios asociados.'
      }, 
      async () => {
        super.fetch<void>(() => this.fotoclubService.delete(id)).subscribe(
          _ => this.fotoclubs.splice(this.fotoclubs.findIndex(f => f.id == id), 1), 
          async err => {
            this.UIUtilsService.mostrarError({ message: err.error['error-info'][2] })
          }
        )
        // this.UIUtilsService.mostrarError({ message: 'Falta implementar la restricción de borrado' })
      }
    )
  }

  async mostrarAcciones(ev: any, f: Fotoclub) {
    const acciones: MenuAccionesComponentAccion[] = [
      {
        accion: (params: string[]) => this.postFotoclub(f),
        params: [],
        icon: 'create',
        label: 'Editar'
      },
      {
        accion: (params: number[]) => this.deleteFotoclub(f),
        params: [],
        icon: 'trash',
        label: 'Borrar'
      }
    ]
    this.UIUtilsService.mostrarMenuAcciones(acciones, ev)
  }
}
