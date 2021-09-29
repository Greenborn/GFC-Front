import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

import { Image } from 'src/app/models/image.model';
import { ContestResult } from 'src/app/models/contest_result.model';

@Component({
  selector: 'app-image-review',
  templateUrl: './image-review.page.html',
  styleUrls: ['./image-review.page.scss'],
})
export class ImageReviewPage implements OnInit {

  @Input() concurso: string;
  @Input() modalController: ModalController;
  @Input() image: Image;
  // = {
  //   id: null,
  //   title: undefined,
  //   code: undefined,
  //   profile_id: undefined
  // };
  @Input() contestResult: ContestResult;
  
  // @ViewChild('formReview') formReview: HTMLFormElement;
  
  constructor() { }

  ngOnInit() {
  }

  async postReview(f: NgForm) {
    console.log('posting review', f.valid, f.value, 'de', this.contestResult.contest_id)
    this.dismiss()
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      // 'image_id': id
    });
  }
}
