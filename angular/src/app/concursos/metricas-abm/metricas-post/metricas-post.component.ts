import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Metric } from 'src/app/models/metric.model';
import { MetricAbmService } from 'src/app/services/metric-abm.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { AlertService } from 'src/app/services/ui/alert.service';

@Component({
  standalone: false,
  selector: 'app-metricas-post',
  templateUrl: './metricas-post.component.html',
  styleUrls: ['./metricas-post.component.scss'],
})
export class MetricasPostComponent extends ApiConsumer implements OnInit {

  @Input() modalController: any;
  @Input() parentSections: Metric[]
  @Input() metric: Metric

  public posting: boolean = false;

  constructor(
    alertService: AlertService,
    public responsiveService: ResponsiveService,
    private metricAbmService: MetricAbmService,
    private UIUtilsService: UiUtilsService
  ) { 
    super(alertService)
    this.metric = this.metricAbmService.template
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
      super.fetch<Metric>(() => this. metricAbmService.post(model, this.metric.id)).subscribe(
        async metric => {
          this.posting = false
          try { await this.modalController.dismiss({ metric }); } catch {}
        },
        err => {
          console.log('error post metric', err)
          this.posting = false
          this.UIUtilsService.mostrarError({ message: this.errorFilter(err.error['error-info'][2]) })
        }
      )
      // console.log('posting', model, this.section.id)

    }
  }

}
