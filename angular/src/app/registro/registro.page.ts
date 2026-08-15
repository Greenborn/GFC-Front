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
  public posting: boolean = false;
  public file: File;
  public img_url: string;

  public step: number = 1;
  public readonly maxSteps: number = 3;

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

  get stepTitles(): string[] {
    return ['Datos del perfil', 'Datos de cuenta', 'Imagen de perfil'];
  }

  get isLastStep(): boolean {
    return this.step === this.maxSteps;
  }

  async ngOnInit() {
    this.form = this.formBuilder.group(
      {
        name:           new FormControl('', Validators.required),
        last_name:      new FormControl('', Validators.required),
        dni:            new FormControl('', Validators.required),
        fotoclub_id:    new FormControl(null, Validators.required),
        username:       new FormControl('', [Validators.pattern(/^[a-zA-Z0-9_]{1,20}$/)], [this.usernameAsyncValidator.bind(this)]),
        email:          new FormControl('', Validators.required),
        password:       new FormControl('', [Validators.minLength(8)]),
        passwordRepeat: new FormControl(''),
      },
      {
        validator: ComparePassword("password", "passwordRepeat")
      }
    );

    await this.loadingService.present('Cargando...');

    const ssoUser = this.ssoAuth.getUser();
    const urlEmail = this.router.parseUrl(this.router.url).queryParamMap.get('email');
    const email = urlEmail || ssoUser?.email || '';
    if (email) {
      this.form.patchValue({ email });
    }

    if (ssoUser?.photo || ssoUser?.['profile_img_base64']) {
      this.img_url = ssoUser['profile_img_base64'] || ssoUser['photo'] as string;
    }

    await new Promise<boolean>(resolve => super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(r => {
      this.fotoclubes = r;
      this.fotoclubes.sort((a, b) => a.name.localeCompare(b.name));
      resolve(true)
    }));

    this.loadingService.dismiss();
  }

  private validateStep(targetStep: number): boolean {
    const controls: string[] = [];
    if (targetStep === 1) {
      controls.push('name', 'last_name', 'dni', 'fotoclub_id');
    } else if (targetStep === 2) {
      controls.push('email');
    }

    let valid = true;
    controls.forEach(key => {
      const ctrl = this.form.get(key);
      ctrl?.markAsTouched();
      if (ctrl?.invalid) valid = false;
    });

    return valid;
  }

  private normalizeUsername(name: string, last_name: string): string {
    const base = `${name ?? ''} ${last_name ?? ''}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 20);
    return base || 'usuario';
  }

  private async usernameDisponible(username: string): Promise<boolean> {
    try {
      const url = `${this.configService.nodeApiBaseUrl}auth/check-username?username=${encodeURIComponent(username)}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) return false;
      const data = await res.json();
      return !data?.exists;
    } catch (err) {
      console.error('[Registro] Error al verificar username', err);
      return false;
    }
  }

  private async generarUsernameUnico(name: string, last_name: string): Promise<string> {
    const base = this.normalizeUsername(name, last_name);
    if (await this.usernameDisponible(base)) return base;
    for (let i = 2; i <= 99; i++) {
      const candidato = `${base}${i}`.slice(0, 20);
      if (await this.usernameDisponible(candidato)) return candidato;
    }
    return `${base}${Date.now() % 1000}`;
  }

  private async usernameAsyncValidator(control: any): Promise<any> {
    const value = control?.value;
    if (!value) return null;
    const disponible = await this.usernameDisponible(value);
    return disponible ? null : { usernameTaken: true };
  }

  async onNameBlur(): Promise<void> {
    const usernameCtrl = this.form.get('username');
    if (usernameCtrl?.value) return;
    const name = this.form.get('name')?.value;
    const last_name = this.form.get('last_name')?.value;
    if (!name) return;
    const unico = await this.generarUsernameUnico(name, last_name);
    if (usernameCtrl && !usernameCtrl.value) {
      usernameCtrl.setValue(unico);
    }
  }

  nextStep(): void {
    if (!this.validateStep(this.step)) return;
    if (this.step < this.maxSteps) {
      this.step++;
    }
  }

  skipStep2(): void {
    this.step++;
  }

  prevStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  goToStep(step: number): void {
    if (step < this.step) {
      this.step = step;
      return;
    }
    for (let s = this.step; s < step; s++) {
      if (!this.validateStep(s)) return;
    }
    this.step = step;
  }

  async postRegistro() {
    if (this.posting) return;

    const email = this.form.get('email')?.value;
    if (!email) {
      super.displayAlert('Completa el email.');
      return;
    }

    const isSSO = this.ssoAuth.isSSOSession();
    if (!isSSO) {
      super.displayAlert('Debes iniciar sesión con Google para registrarte.');
      return;
    }

    const username = this.form.get('username')?.value;
    const name = this.form.get('name')?.value;
    const last_name = this.form.get('last_name')?.value;
    const dni = this.form.get('dni')?.value;
    const fotoclub_id = this.form.get('fotoclub_id')?.value;

    let finalUsername = username;
    if (!finalUsername) {
      finalUsername = await this.generarUsernameUnico(name, last_name);
      this.form.get('username')?.setValue(finalUsername);
    } else if (this.form.get('username')?.errors?.['usernameTaken']) {
      const sugerido = await this.generarUsernameUnico(name, last_name);
      finalUsername = sugerido;
      this.form.get('username')?.setValue(sugerido);
    }

    const body: any = {
      email,
      name,
      last_name,
      dni,
      fotoclub_id,
      username: finalUsername,
      profile_completed: true,
      sso: true,
      unique_id: this.ssoAuth.getUniqueId()
    };

    const password = this.form.get('password')?.value;
    if (password) {
      const passwordRepeat = this.form.get('passwordRepeat')?.value;

      if (password.length < 8) {
        super.displayAlert("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (passwordRepeat !== password) {
        super.displayAlert("Las contraseñas no coinciden.");
        return;
      }
      body.password = password;
    }

    body.img_perfil_b64 = this.file ? await this.resizeImageToBase64(this.file) : null;

    const token = this.ssoAuth.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    this.posting = true;
    await this.UIUtilsService.presentLoading();
    this.createUserService.post(body, undefined, '', headers).subscribe(
      ok => {
        this.UIUtilsService.dismissLoading();
        this.posting = false;
        if (ok['success'] == false) {
          super.displayAlert(this.errorFilter(ok['error']));
        } else {
          if (token) {
            this.auth.token = token;
          }
          this.auth.userId = ok['user']?.id;
          this.auth.updateUser();
          this.router.navigateByUrl('/');
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
