import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Metric } from 'src/app/models/metric.model';
import { MetricService } from 'src/app/services/metric.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { SearchBarComponentAtributo } from 'src/app/shared/search-bar/search-bar.component';
import { MetricasPostComponent } from './metricas-post/metricas-post.component';

@Component({
  selector: 'app-metricas-abm',
  templateUrl: './metricas-abm.page.html',
  styleUrls: ['./metricas-abm.page.scss'],
})
export class MetricasAbmPage extends ApiConsumer implements OnInit {

  public metricas: Metric[] = [];
  
  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { 
      valor: 'name', 
      valorMostrado: 'Nombre', 
      // callback: (c: ContestResultExpanded, query: string) => c.image.title.toLowerCase().includes(query.toLowerCase())      
      callback: (s: Metric, query: string) => s.prize.match(new RegExp(`^${query}`, 'i'))
    }
  ];

  public mostrarFiltro: boolean = false;

  constructor(
    alertCtrl: AlertController,
    public metricService: MetricService,
    private UIUtilsService: UiUtilsService
  ) { 
    super(alertCtrl)
  }

  async ngOnInit() {
    await this.UIUtilsService.presentLoading()
    super.fetch<Metric[]>(() => this.metricService.getAll()).subscribe(s => {
      this.metricas = s
      this.UIUtilsService.dismissLoading()
    })
  }

  async post(metric: Metric = undefined) {
    const componentProps: any = metric != undefined ? { metric } : {}
    // componentProps.parentSections = this.sections.filter(s => s.parent_id == null && (section ? s.id != section.id : true))
    // componentProps.parentSections = this.getParentSections(section ? section.id : undefined)
    componentProps.parentSections = this.metricas
    console.log('post section props', componentProps)
    // const data = await this.UIUtilsService.mostrarModal(SeccionPostComponent, componentProps)
    // if (data != undefined) {
      // const { s } = data
    const { section: s } = await this.UIUtilsService.mostrarModal(MetricasPostComponent, componentProps)
    console.log('received', metric)
    if (s) {
      const i = this.metricas.findIndex(s1 => s1.id == s.id)
      if (i > -1) {
        this.metricas[i] = s
      } else {
        this.metricas.push(s)
      }
    }
  }

  delete(metric: Metric) {
    this.UIUtilsService.mostrarAlert({
      header: 'Confirmar borrado',
      message: 'No se podrá eliminar si tiene concursos asociados.'
      // message: 'No se podrá eliminar si tiene imagenes, concursos o subsecciones asociadas.'
      }, async () => {
      
          this.fetch<void>(() => 
            this.metricService.delete(metric.id)
          ).subscribe(
            _ => {
              console.log('deleted section', metric.id, _)
              this.metricas.splice(this.metricas.findIndex(s => s.id == metric.id), 1)
              // this.router.navigate(['/concursos']);
            }, 
            async err => this.UIUtilsService.mostrarError({ message: err.error['error-info'][2] })
          )
        // }
    })
  }

  async mostrarAcciones(ev: any, metric: Metric) {
    const acciones = [
      // {
      //   accion: () => this.postSubSection(section),
      //   icon: 'add-outline',
      //   label: 'Agregar subsección'
      // },
      {
        accion: () => this.post(metric),
        icon: 'create',
        label: 'Editar'
      },
      {
        accion: () => this.delete(metric),
        params: [],
        icon: 'trash',
        label: 'Borrar'
      }
    ]

    // this.openPopup.emit(options)
    this.UIUtilsService.mostrarMenuAcciones(acciones, ev)
  }

  ordenarPorPremio(e1: Metric, e2: Metric, creciente: boolean) {
    const n1 = e1.prize
    const n2 = e2.prize

    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }

  ordenarPorPuntage(e1: Metric, e2: Metric, creciente: boolean) {
    const n1 = e1.score
    const n2 = e2.score

    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }


}


