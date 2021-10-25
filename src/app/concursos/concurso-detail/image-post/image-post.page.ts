import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Image } from 'src/app/models/image.model';
import { Profile } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { Section } from 'src/app/models/section.model';

import { ImageService } from 'src/app/services/image.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';

export interface ImagePostParams {
  image?: Image;
  section_id?: number;
  category_id?: number;
}

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
  @Input() profiles: ProfileContestExpanded[];
  @Input() secciones: Section[];

  @Input() section_id: number = undefined;
  
  // @ViewChild('s') selectConcursante: ElementRef;
  // @ViewChild('formImage') formImage: HTMLFormElement;

  // public profiles: Profile[];
  public posting: boolean = false; 

  constructor(
    // private userSvc: UsuarioService,
    // private contestSvc: ConcursoService,
    private imageService: ImageService,
    // private profileService: ProfileService,
    alertCtrl: AlertController,
    public responsiveService: ResponsiveService
  ) { 
    super(alertCtrl)
  }

  get categoryId(): number {
    const p = this.profiles.find(p => p.profile_id == this.image.profile_id)
    return p != undefined ? p.category_id : undefined
  }
  get code(): string {
    return `#c${this.categoryId ?? ''}s${this.section_id ?? ''}p${this.image.profile_id ?? ''}-${(this.image.title ?? '').replace(/ /g, '_').toLowerCase().normalize()}`
  }

  get formTitle(): string {
    return (this.image.id != undefined ? 'Editar' : 'Agregar') + ` imagen a ${this.concurso}`
  }

  async ngOnInit() {
    // window.onresize = this.actualizarWidth;
  }

  async postImage() {
    if (this.datosCargados()) {
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
      // console.log('posting', {...this.image})
      super.fetch<Image>(() =>
        this.imageService.post({
          title: this.image.title,
          code: this.code,
          profile_id: this.image.profile_id
        }, this.image.id)
      ).subscribe(
        // image => this.dismiss(image),
        image => {
          this.posting = false
          i = image
          this.dismiss(i, this.section_id)
        },
        async err => {
          super.displayAlert(err.error['error-info'][2])
          this.posting = false
        },
        // () => { // on complete.. pero no cacha el error
          // console.log(i)
          // this.posting = false
          
        // })
      )
      // console.log('posted img con id', id)
      // this.dismiss(id)
    }
  }

  datosCargados() {
    //return this.image.code !=  undefined 
    return this.image.title !=  undefined 
        && this.image.profile_id != undefined
        && this.section_id != undefined
  }
  
  dismiss(image: Image = undefined, section_id: number) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      image,
      section_id
    });
  }
}
