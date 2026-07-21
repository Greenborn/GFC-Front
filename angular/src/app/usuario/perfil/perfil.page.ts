import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { ApiConsumer } from "src/app/models/ApiConsumer";
import { AlertService } from "src/app/services/ui/alert.service";
import { Stadistics } from "src/app/models/stadistics.model";
import { AuthService } from "src/app/modules/auth/services/auth.service";
import { ConfigService } from "src/app/services/config/config.service";
import { ProfileService } from "src/app/services/profile.service";
import { StadisticsService } from "src/app/services/stadistics.service";
import { UserService } from "src/app/services/user.service";
import { ProfileExpanded } from "src/app/models/profile.model";
import { RolificadorService } from "src/app/modules/auth/services/rolificador.service";
import { UsuarioImgComponent } from "src/app/shared/usuario-img/usuario-img.component";

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, UsuarioImgComponent],
  selector: "app-perfil",
  templateUrl: "./perfil.page.html",
  styleUrls: ["./perfil.page.scss"],
})
export class PerfilPage extends ApiConsumer implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    alertCtrl: AlertService,
    public authService: AuthService,
    private userService: UserService,
    public profileService: ProfileService,
    public stadisticsService: StadisticsService,
    public configService: ConfigService,

    public rolificador: RolificadorService
  ) {
    super(alertCtrl);
  }

  public estadisticas: Stadistics = null;
  public miembro: ProfileExpanded = null;
  public userId = null;
  // public estadisticas: Stadistics = this.stadisticsService.template;
  // public miembro: ProfileExpanded = this.profileService.template;

  get isActive() {
    return this.estadisticas != null && this.miembro != null;
  }

  get name() {
    if (this.isActive) {
      let name = this.miembro.name != undefined ? this.miembro.name : null;
      let surname = this.miembro != undefined ? this.miembro.last_name : null;
      return name + surname;
    }
    return null;
  }

  get imgUrl() {
    if (this.isActive) {
      return this.miembro.img_url != undefined ? this.miembro.img_url : null;
    }
    return null;
  }

  get fotoclub() {
    if (this.isActive && this.miembro.fotoclub != null) {
      return this.miembro.fotoclub.name != undefined &&
        (this.miembro.user.role_id == 3 || this.miembro.user.role_id == 2)
        ? this.miembro.fotoclub.name
        : "Ninguna";
    }
    return "Ninguna";
  }

  get username() {
    if (this.isActive) {
      return this.miembro.user.username != undefined
        ? this.miembro.user.username
        : null;
    }
    return null;
  }

  get role() {
    if (this.isActive) {
      return this.miembro.user.role.type != undefined
        ? this.miembro.user.role.type
        : null;
    }
    return null;
  }

  async ngOnInit() {
    // The route can be visited again after editing a profile, so the data should be refreshed
    // every time the page becomes active.
  }

  async ionViewWillEnter() {
    const id = parseInt(this.activatedRoute.snapshot.paramMap.get("id"));
    if (!isNaN(id)) {
      await this.loadPerfil(id);
    }
  }

  private async loadPerfil(id: number) {
    this.estadisticas = null;
    this.miembro = null;

    super
      .fetch<Stadistics>(() => this.stadisticsService.getAll(`filter[id]=${id}`))
      .subscribe((r) => {
        this.estadisticas = r[0];
      });

    this.authService.user.then((u) => {
      super
        .fetch<ProfileExpanded>(() => this.rolificador.getMiembro(u, id))
        .subscribe((m) => {
          this.miembro = m;
          this.userId = m.user.id;
        });
    });
  }

  async privilegies() {
    let usuario = this.authService.user;
    let myFotoclub = (await usuario).profile.fotoclub_id;
    if ((await usuario).id == this.miembro.user.id) {
        return true
    } else {

      if (this.rolificador.esDelegado(await usuario)) {
        return myFotoclub == this.miembro.fotoclub_id
      }
      return ( this.rolificador.isAdmin(await usuario) )
    }
  }
}
