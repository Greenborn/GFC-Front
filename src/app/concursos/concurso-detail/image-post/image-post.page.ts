import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Image } from 'src/app/models/image.model';
import { Profile } from 'src/app/models/profile.model';
import { ConcursoService } from 'src/app/services/concurso.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-image-post',
  templateUrl: './image-post.page.html',
  styleUrls: ['./image-post.page.scss'],
})
export class ImagePostPage implements OnInit {

  @Input() concurso: string;
  @Input() modalController: ModalController;
  // @Input() contestResult: ContestResult;
  @Input() image: Image = {
    id: null,
    title: undefined,
    code: undefined,
    profile_id: undefined
  };
  
  @ViewChild('s') selectConcursante: HTMLIonSelectElement;
  // @ViewChild('formImage') formImage: HTMLFormElement;

  public profiles: Profile[];
  public loading: boolean = true; 

  constructor(
    private userSvc: UsuarioService,
    private contestSvc: ConcursoService
  ) { }

  async ngOnInit() {
    this.loading = true
    this.profiles = await this.userSvc.getProfiles()
    this.loading = false
  }

  async postImage(f: NgForm) {
    // console.log({
    //   ...this.formImage.value,
    //   profile_id: this.selectConcursante.value
    // })
    const id = await this.contestSvc.postImage({
      id: this.image.id,
      ...f.value,
      profile_id: this.selectConcursante.value
    })
    // console.log('posted img con id', id)
    this.dismiss(id)
  }

  datosCargados(f: NgForm) {
    // console.log(f.valid)
    const sin_cargar = this.selectConcursante == undefined || f == undefined
    const res = sin_cargar ? false : 
      f.valid && this.selectConcursante.value != undefined
      // this.formImage.valid && this.selectConcursante.value != undefined
    // if (this.formImage != undefined) {
    //   console.log(this.formImage.valid)
    // }
      
    return res
  }
  
  dismiss(id: number = undefined) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'image_id': id
    });
  }
}
