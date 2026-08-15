import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AlertService } from 'src/app/services/ui/alert.service';
import { LoadingService } from 'src/app/services/ui/loading.service';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { SSOAuthService } from 'angular-greenborn-sso-front';
import { ConfigService } from 'src/app/services/config/config.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { CreateUserService } from 'src/app/services/create-user.service';
import { ConfirmUserComponent } from 'src/app/usuario/usuarios-abm/usuario-post/confirm-user/confirm-user.component';
import { ComparePassword } from 'src/app/modules/auth/validators/password.validator';
import { BtnPostComponent } from 'src/app/shared/btn-post/btn-post.component';
import { UsuarioImgComponent } from 'src/app/shared/usuario-img/usuario-img.component';
import { InputOjoComponent } from 'src/app/shared/input-ojo/input-ojo.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, BtnPostComponent, UsuarioImgComponent, InputOjoComponent],
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage extends ApiConsumer implements OnInit {

  public fotoclubes: Fotoclub[] = []
  public usernameFocus = false
  public submitBtnText: string = "Siguiente";
  public posting: boolean = false;
  public file: File;
  public img_url: string;

  form: FormGroup;

  constructor(
    private router: Router,
    private auth: AuthService,
    private fotoclubService: FotoclubService,
    alertCtrl: AlertService,
    public loadingService: LoadingService,
    public configService: ConfigService,
    private UIUtilsService: UiUtilsService,
    private formBuilder: FormBuilder,
    private createUserService: CreateUserService,
    private ssoAuth: SSOAuthService
  ) {
    super(alertCtrl)
  }

  get hasChanges(): boolean {
    return true;
  }

  async ngOnInit() {
    this.form = this.formBuilder.group(
      {
        name:           new FormControl('', Validators.required),
        last_name:      new FormControl('', Validators.required),
        dni:            new FormControl('', Validators.required),
        fotoclub_id:    new FormControl(null, Validators.required),
        username:       new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{1,20}$/)]),
        email:          new FormControl('', Validators.required),
        password:       new FormControl('', Validators.required),
        passwordRepeat: new FormControl('', Validators.required),
      },
      {
        validator: ComparePassword("password", "passwordRepeat")
      }
    );

    await this.loadingService.present('Cargando...');

    const email = this.router.parseUrl(this.router.url).queryParamMap.get('email');
    if (email) {
      this.form.patchValue({ email });
    }

    await new Promise<boolean>(resolve => super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(r => {
      this.fotoclubes = r;
      this.fotoclubes.sort((a, b) => a.name.localeCompare(b.name));
      resolve(true)
    }));

    this.loadingService.dismiss();
  }

  async postRegistro() {
    if (this.posting) return;
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      super.displayAlert('Completa todos los campos.');
      return;
    }

    const isSSO = this.ssoAuth.isSSOSession();

    const email = this.form.get('email')?.value;
    const username = this.form.get('username')?.value;
    const name = `${this.form.get('name')?.value ?? ''} ${this.form.get('last_name')?.value ?? ''}`.trim() || username;

    const body: any = { email, username, name };

    let headers: Record<string, string> = {};

    if (isSSO) {
      body.sso = true;
      body.unique_id = this.ssoAuth.getUniqueId();
      const token = this.ssoAuth.getToken();
      if (token) {
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
      }
    } else {
      const password = this.form.get('password')?.value;
      const passwordRepeat = this.form.get('passwordRepeat')?.value;

      if (passwordRepeat !== password) {
        super.displayAlert("Las contraseñas no coinciden.");
        return;
      }

      body.password = password;
    }

    body.img_perfil_b64 = this.file ? await this.resizeImageToBase64(this.file) : null;

    this.posting = true;
    await this.UIUtilsService.presentLoading();
    this.createUserService.post(body, undefined, '', headers).subscribe(
      ok => {
        this.UIUtilsService.dismissLoading();
        this.posting = false;
        if (ok['success'] == false) {
          super.displayAlert(this.errorFilter(ok['error']));
        } else if (isSSO) {
          const token = this.ssoAuth.getToken();
          if (token) {
            this.auth.token = token;
          }
          this.auth.userId = ok['user']?.id;
          this.auth.updateUser();
          this.router.navigateByUrl('/');
        } else {
          this.UIUtilsService.mostrarModal(ConfirmUserComponent, {
            "signUpVerifToken": ok['sign_up_verif_token']
          });
        }
      },
      err => {
        this.UIUtilsService.dismissLoading();
        this.posting = false;
        super.displayAlert("Ocurrió un error al intentar realizar la petición de registro de usuario.");
      }
    );
  }

  async openProfileImageModal() {
    const { ProfileImageModalComponent } = await import('src/app/shared/profile-image-modal/profile-image-modal.component');

    const isMobile = window.innerWidth <= 768;
    const result = await this.UIUtilsService.mostrarModal(
      ProfileImageModalComponent,
      {},
      isMobile
    );

    if (!result?.file) return;

    this.file = result.file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.img_url = e.target?.result as string;
    };
    reader.readAsDataURL(result.file);
  }

  private resizeImageToBase64(file: File): Promise<string | null> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const MAX = 1024;
          if (width > MAX || height > MAX) {
            if (width > height) {
              height = Math.round(height * MAX / width);
              width = MAX;
            } else {
              width = Math.round(width * MAX / height);
              height = MAX;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = () => resolve(null);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

}
