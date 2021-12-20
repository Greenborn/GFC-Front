import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import {Location} from '@angular/common';

import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Role } from 'src/app/models/role.model';
import { RoleService } from 'src/app/services/role.service';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { ProfileService } from 'src/app/services/profile.service';
import { Profile } from 'src/app/models/profile.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ConfigService } from 'src/app/services/config/config.service';

@Component({
  selector: 'app-usuario-post',
  templateUrl: './usuario-post.page.html',
  styleUrls: ['./usuario-post.page.scss'],
})
export class UsuarioPostPage extends ApiConsumer implements OnInit {


  @ViewChild('sFotoclub') selectFotoclub: HTMLIonSelectElement;
  @ViewChild('sRol') selectRol: HTMLIonSelectElement;
  @ViewChild('f') formUsuario: HTMLFormElement;

  public usuario: User = this.userService.template;
  public profile: Profile = this.profileService.template;
  public fotoclubes: Fotoclub[] = []
  public roles: Role[] = []
  public usernameFocus = false
  public passFocus = false

  public isPost: boolean = true;
  public posting: boolean = false;
  public userLogged: User;
  public updatingSelect: boolean = false
  public file: File;
  public img_url: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private userService: UserService,
    private profileService: ProfileService,
    private roleService: RoleService,
    private fotoclubService: FotoclubService,
    alertCtrl: AlertController,
    private location: Location,
    public loadingController: LoadingController,
    public modalController: ModalController,
    public configService: ConfigService
  ) { 
    super(alertCtrl)
  }

  // userIsAdmin(){ //agregado para evitar error de que auth no es publico
  //   // return this.auth.isAdmin();
  //   return this.user == undefined ? false : this.user.role_id == 1;
  // }

  get formTitle(): string {
    if (this.userLogged == undefined) return ''
    const c = this.usuario;
    return  (c.id != null ? 'Editar ' : 'Agregar ') + 
              (this.isUserProfile ? 'perfil' : 
              // (c.id == this.userLogged.id ? 'perfil' : 
              (this.userLogged.role_id == 0 ? 'miembro' : 'concursante'))
  }
  get isAdmin(): boolean {
    return this.userLogged == undefined ? false : this.userLogged.role_id == 1
  }
  get isUserProfile(): boolean {
    if (this.userLogged == undefined) return false
    return this.usuario.id == this.userLogged.id
  }

  async ngOnInit() {
    const dataPromises: Promise<boolean>[] = [];
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Cargando...'
    })
    await loading.present();

    dataPromises.push(
      new Promise(resolve => super.fetch<Role[]>(() => this.roleService.getAll()).subscribe(r => {
        this.roles = r
        resolve(true)
      }))
    )
    dataPromises.push(
      new Promise(resolve => super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(r => {
        this.fotoclubes = r
        resolve(true)
      }))
    )
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      const id = paramMap.get('id');
      if (id != null) {
        this.isPost = false
        dataPromises.push(
          new Promise(resolve => super.fetch<User>(() => this.userService.get(parseInt(id))).subscribe(u => {
            this.usuario = u
            super.fetch<Profile>(() => this.profileService.get(u.profile_id)).subscribe(p => {
              this.profile = p
              this.img_url = this.configService.apiUrl(p.img_url)
              // loading.dismiss()
              resolve(true)
            })
          }))
        )
        // super.fetch<User>(() => this.userService.get(parseInt(id))).subscribe(u => {
        //   this.usuario = u
        //   super.fetch<Profile>(() => this.profileService.get(u.profile_id)).subscribe(p => {
        //     this.profile = p
        //     loading.dismiss()
        //   })
        // })
        
      } else {
        this.isPost = true
      }
      Promise.all(dataPromises).then(r => {
        this.updatingSelect = true // pq no se actualizan los select
        setTimeout(() => this.updatingSelect = false)
        loading.dismiss()
      })
    })
  }
  
  ionViewWillEnter() {
    // super.fetch<User[]>(() => this.userService.getAll()).subscribe(r => this.users = r)
    this.auth.user.then(u => {
      this.userLogged = u
      if (this.isPost) {
        // this.updatingSelect = true
        // console.log('si')
        this.usuario.role_id = 3 // los no admin cargan delegados (select rol desactivado)
        this.profile.fotoclub_id = u.profile.fotoclub_id
        // setTimeout(() => this.updatingSelect = false, 420)
      }
    })
  }

  datosCargados() {
    // console.log(f.valid)
    const sin_cargar = this.selectFotoclub == undefined || this.selectRol == undefined
    const res = sin_cargar ? false : 
    this.formUsuario.valid && this.selectFotoclub.value != undefined && this.selectRol.value != undefined
    return res
  }

  async postUsuario(f: NgForm) {
    if (f.valid) {
      // console.log('posteando form', f.value, this.selectRol.value, this.selectFotoclub.value)
      let fotoclub = undefined;
      if (this.selectRol.value == 2 || this.selectRol.value == 3){
        fotoclub = this.selectFotoclub.value
      }
      const pm: any = {
        name: f.value.name, 
        last_name: f.value.last_name, 
        // fotoclub_id: f.value.fotoclub_id
        fotoclub_id: fotoclub
      }

      
      if (this.file != undefined) {
        pm.image_file = this.file
      }
      
      this.posting = true
      
      super.fetch<any>(() => this.profileService.postFormData<any>(pm, this.profile.id)).subscribe(
        p => {
          // console.log('posteado perfil', p)
          const um: User = {
            username: f.value.username,
            role_id: this.isAdmin ? this.selectRol.value : this.usuario.role_id,
            password: f.value.password,
            // role_id: f.value.role_id,
            profile_id: p.id
          }
          super.fetch<User>(() => this.userService.post(um, this.usuario.id)).subscribe(
            u => {
              this.posting = false
              console.log('exito post user', u)
              if (this.isUserProfile) {
                this.auth.updateUser()
              }
              this.location.back()
              // this.router.navigate(['/usuarios']);
            },
            err => {
              this.posting = false
          //     console.log('posteado perfil', p)
            super.displayAlert(`No se pudo ${this.usuario.id == undefined ? 'agregar' : 'editar'} el usuario. ${err.statusText}`)
            super.fetch<void>(() => this.profileService.delete(p.id)).subscribe(_ => {
              console.log(`Perfil ${p.id} eliminado`)
            })
            }
          )
        },
        err => {
          this.posting = false
          console.log('error post profile', err)
          super.displayAlert(err.error[0].message)
        }
      )
    }
    else {
      console.log('Form usuario no valido:', f.value);
    }
  }

  async changePassword() {
    // console.log('change password')

    const modal = await this.modalController.create({
      component: ChangePasswordComponent,
      cssClass: 'auto-width',
      componentProps: {
        "modalController": this.modalController,
        "userId": this.userLogged.id
      }
    });
    await modal.present()

    // const { data } = await modal.onWillDismiss();

    // console.log('inscribiendo concursante', data)
    // const { profileContest } = data ?? {}
    // if (profileContest != undefined) {
    //   this.inscriptos.push(profileContest)
    //   this.concursoDetailService.inscriptos.emit(this.inscriptos)  
    // }
  }

    // https://medium.com/@danielimalmeida/creating-a-file-upload-component-with-angular-and-rxjs-c1781c5bdee
    // fileUpload(event: FileList) {
    fileUpload(event: EventTarget) {
      
      const file = (event as HTMLInputElement).files.item(0)
  
      if (!file) return;
  
      if (file.type.split('/')[0] !== 'image') { 
        console.log('File type is not supported!')
        return;
      }
  
      // this.isImgUploading = true;
      // this.isImgUploaded = false;
  
      // this.FileName = file.name;
      // console.log('uploaded', file)
      this.file = file
  
      const fileReader = new FileReader();
      const { type, name } = file;
      // return new Observable((observer: Observer<IUploadedFile>) => {
        // this.validateSize(file, observer);
        fileReader.readAsDataURL(file);
        fileReader.onload = event => {
  
          // if (this.isImage(type)) {
            const image = new Image();
            image.onload = (i) => {
              const imageData = (i.target as HTMLImageElement).src
              // this.imageData = imageData
              this.img_url = imageData
            };
            image.onerror = () => {
            };
            image.src = fileReader.result as string;
          }
  
    }
}
