import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
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
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { CreateUserService } from 'src/app/services/create-user.service';
import { ConfirmUserComponent } from './confirm-user/confirm-user.component';
import { Subject } from 'rxjs';
import { ComparePassword } from 'src/app/modules/auth/validators/password.validator';

@Component({
  selector: 'app-usuario-post',
  templateUrl: './usuario-post.page.html',
  styleUrls: ['./usuario-post.page.scss'],
})
export class UsuarioPostPage extends ApiConsumer implements OnInit {


  @ViewChild('sFotoclub') selectFotoclub: HTMLIonSelectElement;
  @ViewChild('ProfileImageUpload', { read: ElementRef, static:false }) profileImageUpload: ElementRef;
  @ViewChild('sRol') selectRol: HTMLIonSelectElement;
  @ViewChild('f') formUsuario: HTMLFormElement;

  public usuario: User = this.userService.template;
  public profile: Profile = this.profileService.template;
  public fotoclubes: Fotoclub[] = []
  public roles: Role[] = []
  public usernameFocus = false
  public passFocus = false
  public isPost: boolean = true;
  public isUserSignUp:boolean = false;
  public submitBtnText:string = "Guardar";
  public posting: boolean = false;
  public userLogged: User;
  public updatingSelect: boolean = false
  public file: File;
  public img_url: string;
  public ImageChangeClick:Subject<any> = new Subject();

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
    public configService: ConfigService,
    private UIUtilsService: UiUtilsService,
    private formBuilder: FormBuilder,
    private createUserService: CreateUserService,
  ) { 
    super(alertCtrl)
  }

  // userIsAdmin(){ //agregado para evitar error de que auth no es publico
  //   // return this.auth.isAdmin();
  //   return this.user == undefined ? false : this.user.role_id == 1;
  // }

  isLogged():boolean{
    return this.auth.loggedIn
  }

  json_errors(){
      return JSON.stringify(this.form.get('password').errors);
  }

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

  get usuarioLogueado(): boolean {
    return this.userLogged == undefined ? false : true
  }
  get isUserProfile(): boolean {
    if (this.userLogged == undefined) return false
    return this.usuario.id == this.userLogged.id
  }

  form: FormGroup;
  async ngOnInit() {
    this.ImageChangeClick.subscribe({  next: ( response: any ) => {
      this.profileImageUpload.nativeElement.querySelector('input').click();
    }});

    let formControls = {
        name:           new FormControl({ value: '', disabled: false }),
        last_name:      new FormControl({ value: '', disabled: false }),
        fotoclub_id:    new FormControl({ value: '', disabled: false }),
        //executive:  new FormControl('')
        //executive_rol: new FormControl(''),
        username:       new FormControl({ value: '', disabled: false }),
        email:          new FormControl({ value: '', disabled: false }),
        password:       new FormControl({ value: '', disabled: false }, Validators.compose([
            Validators.required,
          ])),
        passwordRepeat: new FormControl({ value: '', disabled: false } ),
       // role_id:        new FormControl(''),
    };

    this.form = this.formBuilder.group( formControls, {
        validator: ComparePassword("password", "passwordRepeat")
    } );
    
    const dataPromises: Promise<boolean>[] = [];
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Cargando...'
    })
    await loading.present();

    //si se está en pagina de registro, se mopdifica el texto del botòn
    this.isUserSignUp = this.router.url == '/registro';
    if (this.isUserSignUp){
      this.submitBtnText = "Siguiente";
    }

    if(this.isLogged()){
      dataPromises.push(
        new Promise(resolve => super.fetch<Role[]>(() => this.roleService.getAll()).subscribe(r => {
          this.roles = r
          this.roles = this.roles.filter(function(rol) {
            return rol.type !== 'Administrador'; 
        });
        this.roles = this.roles.filter(function(rol) {
          return rol.id !== 1; 
      });
          resolve(true)
        }))
      )
    } else {
      this.usuario.role_id = 3
    }
    dataPromises.push(
      new Promise(resolve => super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(r => {
        this.fotoclubes = r
        this.fotoclubes.unshift({id: 0, name: "Ninguno"})
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
              this.img_url = p.img_url != null ? this.configService.apiUrl(p.img_url) : ''
              // loading.dismiss()
              resolve(true)
            })
          }))
        )
        
        
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
    if(this.isLogged()){

      // super.fetch<User[]>(() => this.userService.getAll()).subscribe(r => this.users = r)
      this.auth.user.then(u => {
        this.userLogged = u
        if (this.isPost) {
          // this.updatingSelect = true
          // console.log('si')
          this.usuario.role_id = 3 // los no admin cargan delegados (select rol desactivado)
          if (u.role_id != 1) {
            this.profile.fotoclub_id = u.profile.fotoclub_id
            
          } else {
            this.profile.fotoclub_id = 0;
          }
          // setTimeout(() => this.updatingSelect = false, 420)
        }
      })
    }
  }

  datosCargados() {
    // console.log(f.valid)
    const sin_cargar = this.selectFotoclub == undefined || this.selectRol == undefined
    const res = sin_cargar ? false : 
    this.formUsuario.valid && this.selectFotoclub.value != undefined && this.selectRol.value != undefined
    return res
  }

  async postUsuario() {
      let f = this.form;
      if (f.valid) {
        if((this.usuario.role_id == 3 || this.usuario.role_id == 2 )) {

          if (this.selectFotoclub.value == 0) {
              this.selectFotoclub.value = undefined
            }

          // if (f.value.excecutive == false) {
          //   this.profile.executive = 0
          // } else {
          //   this.profile.executive = 1
          // }
        }
        //En caso de que se trate de un formulario de registro de usuario
      if (this.isUserSignUp){
        //se comprueba que la contraseña corresponda con su repeticion
        if (this.usuario.passwordRepeat !== this.usuario.password){
          super.displayAlert("Las contraseñas no coinciden.");
          return;
        }

        //hacer peticiòn para registrar usuario
        await this.UIUtilsService.presentLoading();
        this.createUserService.post({userData:this.usuario, profileData:this.profile}).subscribe(
          ok => {
            this.UIUtilsService.dismissLoading();
            if (ok['success'] == false){
              super.displayAlert(this.errorFilter(ok['error']));
            } else {
              let profileConfirm  = this.UIUtilsService.mostrarModal(ConfirmUserComponent, { 
                "signUpVerifToken": ok['sign_up_verif_token']
               });
            }
          },
          err => {
            this.UIUtilsService.dismissLoading();       
            super.displayAlert("Ocurrió un error al intentar realizar la petición de registro de usuario.");
          }
        );

        //redirigir a siguiente pàgina
        console.log("hacer peticion de registro");
        return;
      }

      //En caso de que se trate de un formulario de ediciòn de usuarios
      let pm: any = {
        name: f.value.name, 
        last_name: f.value.last_name, 
        executive: f.value.executive == undefined || f.value.executive == null ? false : f.value.executive,
        executive_rol: f.value.executive_rol == undefined || (f.value.executive == undefined || f.value.executive == null) ? '' : f.value.executive_rol
        // fotoclub_id: f.value.fotoclub_id
        // fotoclub_id: fotoclub
      }
      
      if ((this.usuario.role_id == 3 || this.usuario.role_id == 2 ) && !this.selectFotoclub.value == undefined){
        pm = {
          name: f.value.name, 
          last_name: f.value.last_name, 
          executive: f.value.executive == undefined || f.value.executive == null ? false : f.value.executive,
          executive_rol: f.value.executive_rol == undefined || (f.value.executive == undefined || f.value.executive == null) ? '' : f.value.executive_rol,
          // fotoclub_id: f.value.fotoclub_id
          fotoclub_id: this.selectFotoclub.value
        }
      }

      
      if (this.file != undefined) {
        pm.image_file = this.file
      }
      
      this.posting = true
      
      super.fetch<any>(() => this.profileService.postFormData<any>(pm, this.profile.id)).subscribe(
        p => {
          // console.log('posteado perfil', p)
          let rol;
          if (this.isAdmin) {
            rol = this.selectRol.value
          } else if (! this.isLogged){
            rol = 3
          } else {
            rol = this.usuario.role_id
          }
          const um: User = {
            username: f.value.username,
            // role_id: this.isAdmin ? this.selectRol.value : this.usuario.role_id,
            role_id: rol,
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
            super.displayAlert(`No se pudo ${this.usuario.id == undefined ? 'agregar' : 'editar'} el usuario. ${this.errorFilter(err.statusText)}`)
            super.fetch<void>(() => this.profileService.delete(p.id)).subscribe(_ => {
              console.log(`Perfil ${p.id} eliminado`)
            })
            }
          )
        },
        err => {
          this.posting = false
          console.log('error post profile', err)
          super.displayAlert(this.errorFilter(err.error[0].message))
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
