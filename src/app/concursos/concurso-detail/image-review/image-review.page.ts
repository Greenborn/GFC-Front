import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

import { Image } from 'src/app/models/image.model';
import { ContestResult } from 'src/app/models/contest_result.model';
import { Metric } from 'src/app/models/metric.model';
// import { ConcursoService } from 'src/app/services/concurso.service';
import { MetricService } from 'src/app/services/metric.service';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { MetricAbmService } from 'src/app/services/metric-abm.service';

@Component({
  selector: 'app-image-review',
  templateUrl: './image-review.page.html',
  styleUrls: ['./image-review.page.scss'],
})
export class ImageReviewPage extends ApiConsumer implements OnInit {

  @Input() concurso: string;
  @Input() modalController: ModalController;
  @Input() image: Image;
  @Input() review: Metric;
  // = {
  //   id: null,
  //   title: undefined,
  //   code: undefined,
  //   profile_id: undefined
  // };
  @Input() contestResult: ContestResult;
  
  // @ViewChild('formReview') formReview: HTMLFormElement;
  public posting: boolean = false;
  public metricas: Metric[] = [];
  public elegida: Metric;
  
  constructor(
    // private contestSvc: ConcursoService,
    private metricService: MetricService,
    private metricAbmService: MetricAbmService,
    alertCtrl: AlertController,
    public responsiveService: ResponsiveService,
    private configService: ConfigService
  ) { 
    super(alertCtrl)
  }

  get imgSource(): string {
    return this.configService.apiUrl(this.image.url)
  }

  ngOnInit() {
    super.fetch<Metric[]>(() => this.metricAbmService.getAll()).subscribe(s => {
      this.metricas = s
    })
  }

  async postReview(f: NgForm) {
    if (f.valid) {
// this.review.prize = this.elegida.prize
// this.review.score = this.elegida.score
      
      this.posting = true
      // const metric: Metric = {
      //   // id: this.review.id,
      //   ...f.value
      // }
      const metric: Metric = {
        id: this.review.id,
        prize: f.value.elegida.prize,
        score: f.value.elegida.score
      }
      metric.id = this.review.id
      
      console.log("metric n:",metric, f.value )
      super.fetch<Metric>(() => this.metricService.post(metric, this.review.id)).subscribe(
        m => this.dismiss(m),
        async err => {
          (await this.alertCtrl.create({
            header: 'Error',
            message: err.error['error-info'][2],
            buttons: [{
              text: 'Ok',
              role: 'cancel'
            }]
          })).present()
        },
        () => this.posting = false
      )
      
      // console.log('posting review', metric, 'de', this.contestResult.contest_id)
      // await this.contestSvc.postMetric(metric)
      // this.dismiss(metric)
    }
  }

  dismiss(metric: Metric = undefined) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      metric
      // 'image_id': id
    });
  }
}
