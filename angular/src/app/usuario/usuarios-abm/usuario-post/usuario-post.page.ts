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
  public originalUsuario: User;
  public profile: Profile = this.profileService.template;
  public originalProfile: Profile;
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

  public contest_type_selected:Boolean = false

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
    private createUserService: CreateUserService
  ) { 
    super(alertCtrl)
  }


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
        name:           new FormControl(),
        last_name:      new FormControl(),
        fotoclub_id:    new FormControl(),
        executive:      new FormControl(false),
        executive_rol:  new FormControl(''),
        username:       new FormControl(),
        email:          new FormControl(),
        password:       new FormControl(),
        passwordRepeat: new FormControl(),
        role_id:        new FormControl(),
        dni:            new FormControl(),
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
      this.form.patchValue({ role_id: 3 });
    }
    dataPromises.push(
      new Promise(resolve => super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(r => {
        this.fotoclubes = r
        this.fotoclubes.sort((a, b) => a.name.localeCompare(b.name));
        //this.fotoclubes.unshift({id: 0, name: "Ninguno"})
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
            this.originalUsuario = JSON.parse(JSON.stringify(u));
            super.fetch<Profile>(() => this.profileService.get(u.profile_id)).subscribe(p => {
              this.profile = p
              this.profile.dni = this.usuario.dni
              this.originalProfile = JSON.parse(JSON.stringify(this.profile));
              this.img_url = p.img_url != null ? this.configService.imageUrl(p.img_url) : ''
              this.form.patchValue({
                name: this.profile.name,
                last_name: this.profile.last_name,
                fotoclub_id: this.profile.fotoclub_id,
                executive: this.profile.executive,
                executive_rol: this.profile.executive_rol,
                username: this.usuario.username,
                email: this.usuario.email,
                role_id: this.usuario.role_id,
                dni: this.usuario.dni,
              });
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

      this.auth.user.then(u => {
        this.userLogged = u
        if (this.isPost) {

          this.usuario.role_id = 3 // los no admin cargan delegados (select rol desactivado)
          if (u.role_id != 1) {
            this.profile.fotoclub_id = u.profile.fotoclub_id
            this.form.patchValue({ fotoclub_id: u.profile.fotoclub_id });
          } else {
            this.profile.fotoclub_id = 0;
            this.form.patchValue({ fotoclub_id: 0 });
          }
        }

        const roleControl = this.form.get('role_id');
        if (roleControl) {
          if (!this.isAdmin) {
            roleControl.disable();
          } else {
            roleControl.enable();
          }
        }
      })
    }
  }

  profileExecutive(){
    return Boolean(this.form.get('executive')?.value) === true
  }

  datosCargados() {
    // console.log(f.valid)
    const sin_cargar = this.selectFotoclub == undefined || this.selectRol == undefined
    const res = sin_cargar ? false : 
    this.formUsuario.valid && this.selectFotoclub.value != undefined && this.selectRol.value != undefined
    return res
  }

  private getChangedFields(original: any, current: any): any {
    const diff: any = {};
    for (const key of Object.keys(current)) {
      const originalValue = original ? original[key] : undefined;
      const currentValue = current[key];
      if (currentValue === undefined && originalValue === undefined) {
        continue;
      }
      if (currentValue !== originalValue) {
        diff[key] = currentValue;
      }
    }
    return diff;
  }

  private getCurrentProfileState(): any {
    return {
      name: this.form.get('name')?.value,
      last_name: this.form.get('last_name')?.value,
      executive: this.form.get('executive')?.value == undefined || this.form.get('executive')?.value == null ? false : Boolean(this.form.get('executive')?.value),
      executive_rol: this.form.get('executive_rol')?.value ?? '',
      fotoclub_id: this.form.get('fotoclub_id')?.value,
    };
  }

  private getCurrentUserState(): any {
    return {
      username: this.form.get('username')?.value,
      email: this.form.get('email')?.value,
      role_id: this.form.get('role_id')?.value,
      dni: this.form.get('dni')?.value,
      password: this.form.get('password')?.value || undefined,
    };
  }

  async postUsuario() {
      let f = this.form;
    //if (f.valid) {
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
        const password = this.form.get('password')?.value;
        const passwordRepeat = this.form.get('passwordRepeat')?.value;

        //se comprueba que la contraseña corresponda con su repeticion
        if (passwordRepeat !== password){
          super.displayAlert("Las contraseñas no coinciden.");
          return;
        }

        const profileData: any = {
          ...this.profile,
          name: this.form.get('name')?.value,
          last_name: this.form.get('last_name')?.value,
          dni: this.form.get('dni')?.value,
          fotoclub_id: this.form.get('fotoclub_id')?.value,
          executive: this.form.get('executive')?.value,
          executive_rol: this.form.get('executive_rol')?.value,
        };

        const userData: any = {
          ...this.usuario,
          username: this.form.get('username')?.value,
          email: this.form.get('email')?.value,
          password,
          role_id: this.form.get('role_id')?.value,
          dni: this.form.get('dni')?.value,
        };

        //hacer peticiòn para registrar usuario
        await this.UIUtilsService.presentLoading();
        this.createUserService.post({userData, profileData}).subscribe(
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
      const profilePayload: any = this.getChangedFields(this.originalProfile, this.getCurrentProfileState());

      if (this.file != undefined) {
        profilePayload.image_file = this.file;
      }

      const userPayload: any = this.getChangedFields(this.originalUsuario, this.getCurrentUserState());

      if (this.isUserProfile) {
        delete userPayload.role_id;
      }

      if (!this.originalProfile || !this.originalUsuario) {
        super.displayAlert('No se pudieron comparar los datos originales. Intente recargar la página.');
        return;
      }

      if (Object.keys(profilePayload).length === 0 && Object.keys(userPayload).length === 0) {
        super.displayAlert('No hay cambios para guardar.');
        return;
      }

      this.posting = true

      const updateProfile = async () => {
        if (Object.keys(profilePayload).length === 0) {
          return { id: this.profile.id };
        }
        return super.fetch<any>(() => this.profileService.postFormData<any>(profilePayload, this.profile.id)).toPromise();
      }

      const updateUser = async (profileResultId?: number) => {
        if (Object.keys(userPayload).length === 0) {
          return null;
        }

        const um: any = { ...userPayload };
        return super.fetch<User>(() => this.userService.post(um, this.usuario.id)).toPromise();
      }

      try {
        const profileResult = await updateProfile();
        const userResult = await updateUser(profileResult?.id);

        this.posting = false
        if (this.isUserProfile) {
          // Invalidate the cached logged-in user so the menu and profile popovers
          // reload the latest profile image and name after a self-edition.
          this.auth.updateUser()
        }

        this.location.back()
      } catch (err: any) {
        this.posting = false
        console.log('error updating user/profile', err)
        if (err?.error?.message) {
          super.displayAlert(this.errorFilter(err.error.message))
        } else if (Array.isArray(err?.error) && err.error[0]?.message) {
          super.displayAlert(this.errorFilter(err.error[0].message))
        } else {
          super.displayAlert(`No se pudo ${this.usuario.id == undefined ? 'agregar' : 'editar'} el usuario. ${this.errorFilter(err.statusText || err.message || '')}`)
        }
      }
    //}
    //else {
    //  console.log('Form usuario no valido:', f);
    //}
  }

  async changePassword() {
    const modal = await this.modalController.create({
      component: ChangePasswordComponent,
      cssClass: 'auto-width',
      componentProps: {
        modalController: this.modalController,
        userId: this.usuario?.id ?? this.userLogged?.id,
        requireOldPassword: this.isUserProfile
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
