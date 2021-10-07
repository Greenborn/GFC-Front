import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Image } from 'src/app/models/image.model';
import { Profile } from 'src/app/models/profile.model';

import { ImageService } from 'src/app/services/image.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-image-post',
  templateUrl: './image-post.page.html',
  styleUrls: ['./image-post.page.scss'],
})
export class ImagePostPage extends ApiConsumer implements OnInit {

  @Input() concurso: string;
  @Input() modalController: ModalController;
  // @Input() contestResult: ContestResult;
  @Input() image: Image = this.imageService.template;
  @Input() profiles: Profile[];
  public tamWidth = window.screen.width;
  
  // @ViewChild('s') selectConcursante: ElementRef;
  // @ViewChild('formImage') formImage: HTMLFormElement;

  // public profiles: Profile[];
  public posting: boolean = false; 

  constructor(
    // private userSvc: UsuarioService,
    // private contestSvc: ConcursoService,
    private imageService: ImageService,
    // private profileService: ProfileService,
    alertCtrl: AlertController
  ) { 
    super(alertCtrl)
  }

  get formTitle(): string {
    return (this.image.id != undefined ? 'Editar' : 'Agregar') + ` imagen a ${this.concurso}`
  }

  async ngOnInit() {
    window.onresize = this.actualizarWidth;
  }
  actualizarWidth(){
    this.tamWidth = window.screen.width;
  }

  async postImage() {
    // console.log({
    //   ...this.formImage.value,
    //   profile_id: this.selectConcursante.value
    // })
    // const id = await this.contestSvc.postImage({
    //   id: this.image.id,
    //   ...f.value,
    //   profile_id: this.selectConcursante.value
    // })
    this.posting = true
    let i: Image;
    super.fetch<Image>(() =>
      this.imageService.post({
        title: this.image.title,
        code: this.image.code,
        profile_id: this.image.profile_id
      }, this.image.id)
    ).subscribe(
      // image => this.dismiss(image),
      image => i = image,
      async err => super.displayAlert(err.error['error-info'][2]),
      () => { // on complete.. pero no cacha el error
        // console.log(i)
        this.posting = false
        this.dismiss(i)
      })
    // console.log('posted img con id', id)
    // this.dismiss(id)
  }

  datosCargados() {
    return this.image.code !=  undefined && this.image.title !=  undefined && this.image.profile_id != undefined
  }
  
  dismiss(image: Image = undefined) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      image
    });
  }
}
