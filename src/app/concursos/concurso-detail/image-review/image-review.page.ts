import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

import { Image } from 'src/app/models/image.model';
import { ContestResult } from 'src/app/models/contest_result.model';
import { Metric } from 'src/app/models/metric.model';
import { ConcursoService } from 'src/app/services/concurso.service';

@Component({
  selector: 'app-image-review',
  templateUrl: './image-review.page.html',
  styleUrls: ['./image-review.page.scss'],
})
export class ImageReviewPage implements OnInit {

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
  
  constructor(
    private contestSvc: ConcursoService
  ) { }

  ngOnInit() {
  }

  async postReview(f: NgForm) {
    if (f.valid) {
      const metric = {
        id: this.review.id,
        ...f.value
      }
      console.log('posting review', metric, 'de', this.contestResult.contest_id)
      await this.contestSvc.postMetric(metric)
      this.dismiss(metric)
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
