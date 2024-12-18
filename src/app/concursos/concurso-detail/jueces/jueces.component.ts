import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Contest } from 'src/app/models/contest.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { UserLogged } from 'src/app/models/user.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestService } from 'src/app/services/contest.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { MenuAccionesComponentAccion } from 'src/app/shared/menu-acciones/menu-acciones.component';
import { SearchBarComponentAtributo } from 'src/app/shared/search-bar/search-bar.component';
import { ConcursoDetailService } from '../concurso-detail.service';

@Component({
  selector: 'app-jueces',
  templateUrl: './jueces.component.html',
  styleUrls: ['./jueces.component.scss'],
})
export class JuecesComponent implements OnInit {

  
  mostrarFiltro: boolean = false
  inscriptos: ProfileContestExpanded[] = [];
  concurso: Contest = this.contestService.template;
  user: UserLogged;
  jueces: ProfileExpanded[] = [];
  
  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { 
      valor: 'nombre', 
      valorMostrado: 'Nombre',  
      callback: (p: ProfileContestExpanded, query: string) => p.profile.name.match(new RegExp(`^${query}`, 'i'))
    },
    { 
      valor: 'apellido', 
      valorMostrado: 'Apellido', 
      callback: (p: ProfileContestExpanded, query: string) => p.profile.last_name.match(new RegExp(`^${query}`, 'i'))
    }
  ];

  constructor(public UIUtilsService: UiUtilsService, public concursoDetailService: ConcursoDetailService, public rolificador: RolificadorService,
    public auth: AuthService,
    public contestService: ContestService,
    public configService: ConfigService, private router: Router,) { }

  async ngOnInit() {
    if (this.concurso.id == undefined) {
      await this.UIUtilsService.presentLoading()
    }
    
    this.auth.user.then(u => this.user = u)
    this.subsc() 
  }

  public subs = []
  subsc() {
    this.subs.push(this.concursoDetailService.jueces.subscribe(cs => this.jueces = cs))
    this.subs.push(this.concursoDetailService.inscriptosJueces.subscribe(cs => this.inscriptos = cs))
    this.subs.push(
      this.concursoDetailService.inscriptosJueces.subscribe(is => {
        this.inscriptos = is
        this.UIUtilsService.dismissLoading()
        setTimeout(() => {
  
        }, 500)
        console.log("jueces ionscriptos: ", this.inscriptos);
      })
    )
    this.subs.push(
      this.concursoDetailService.concurso.subscribe({
        next: c => {
          this.concurso = c
        } 
      })
    )
  }

  unsuscribes(){
    for (let i=0; i < this.subs.length; i++){
      this.subs[i].unsubscribe()
    }
    this.subs = []
  }

  ngOnDestroy() {
    this.unsuscribes()
  }


  inscribirJuez() {
    this.concursoDetailService.inscribirJuez()
  }
  
  get isAdmin() {
    return (this.user != undefined ? (this.rolificador.isAdmin(this.user) || this.rolificador.esDelegado(this.user)) : false)
  }
  
  get checkPermissions() {
    //TODO: no agarra el concurso
    if (this.contestService.isActive(this.concurso) && 
      (this.user != undefined)){
      return ((this.rolificador.esDelegado(this.user)) || (this.rolificador.isAdmin(this.user) ));
        }else {
          return false;
        }
  }

  ordenarPorApellido(e1: ProfileContestExpanded, e2: ProfileContestExpanded, creciente: boolean) {
    const n1 = e1.profile.last_name
    const n2 = e2.profile.last_name;
    
    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }

}
