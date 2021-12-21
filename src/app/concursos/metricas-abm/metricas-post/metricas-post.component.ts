import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Metric } from 'src/app/models/metric.model';
import { MetricService } from 'src/app/services/metric.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Component({
  selector: 'app-metricas-post',
  templateUrl: './metricas-post.component.html',
  styleUrls: ['./metricas-post.component.scss'],
})
export class MetricasPostComponent extends ApiConsumer implements OnInit {

  @Input() modalController: ModalController;
  @Input() parentSections: Metric[]
  @Input() metric: Metric = this.metricService.template
  // @Input() typeSubsection: boolean;

  public posting: boolean = false;

  constructor(
    alertCtrl: AlertController,
    public responsiveService: ResponsiveService,
    private metricService: MetricService,
    private UIUtilsService: UiUtilsService
  ) { 
    super(alertCtrl)
  }

  get formTitle(): string {
    return (this.metric.id != undefined ? 'Editar' : 'Agregar') + ' metrica'
      // ((this.typeSubsection) ? ' subsección' : ` seccion`)
  }

  ngOnInit() {
    // this.typeSubsection = this.section.parent_id != null
  }

  datosCargados(form: NgForm): boolean {
    return form.valid
  }

  post(f: NgForm) {
    if (f.valid) {
      let model = f.value;
      // if (model.parent_id == undefined) {
      //   model.parent_id = null
      // }
      // model.parent_id = this.typeSubsection ? this.section.parent_id : null
      console.log('posting', model)
      this.posting = true
      super.fetch<Metric>(() => this.metricService.post(model, this.metric.id)).subscribe(
        metric => {
          this.posting = false
          this.modalController.dismiss({ metric })
        },
        err => {
          console.log('error post metric', err)
          this.posting = false
          this.UIUtilsService.mostrarError({ message: err.statusText })
        }
      )
      // console.log('posting', model, this.section.id)

    }
  }

}
