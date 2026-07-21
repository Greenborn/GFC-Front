import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { BtnPostComponent } from 'src/app/shared/btn-post/btn-post.component';

import { Image } from 'src/app/models/image.model';
import { ContestResult } from 'src/app/models/contest_result.model';
import { Metric } from 'src/app/models/metric.model';
import { MetricService } from 'src/app/services/metric.service';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { MetricAbmService } from 'src/app/services/metric-abm.service';
import { AlertService } from 'src/app/services/ui/alert.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, BtnPostComponent],
  selector: 'app-image-review',
  templateUrl: './image-review.page.html',
  styleUrls: ['./image-review.page.scss'],
})
export class ImageReviewPage extends ApiConsumer implements OnInit {

  @Input() concurso: string;
  @Input() modalController: any;
  @Input() image: Image;
  @Input() review: Metric;
  @Input() contestResult: ContestResult;
  
  public posting: boolean = false;
  public metricas: Metric[] = [];
  public elegida: Metric;
  
  constructor(
    private metricService: MetricService,
    private metricAbmService: MetricAbmService,
    alertService: AlertService,
    public responsiveService: ResponsiveService,
    private configService: ConfigService,
    private UIUtilsService: UiUtilsService
  ) { 
    super(alertService)
  }

  get imgSource(): string {
    return this.configService.imageUrl(this.image.url)
  }

  ngOnInit() {
    super.fetch<Metric[]>(() => this.metricAbmService.getAll()).subscribe(s => {
      this.metricas = s
    })
  }

  async postReview(f: NgForm) {
    if (f.valid) {

      this.posting = true

      const metric: Metric = {
        id: this.review.id,
        prize: f.value.elegida.prize,
        score: f.value.elegida.score
      }
      metric.id = this.review.id
      
      super.fetch<Metric>(() => this.metricService.post(metric, this.review.id)).subscribe(
        m => this.dismiss(m),
        err => {
          this.UIUtilsService.mostrarError({ message: this.errorFilter(err.error?.message || err.error?.['error-info']?.[2]) });
        },
        () => this.posting = false
      )

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
