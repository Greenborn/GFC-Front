import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { User, UserLogged } from 'src/app/models/user.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestResultService } from 'src/app/services/contest-result.service';
import { ProfileContestService } from 'src/app/services/profile-contest.service';
import { ProfileService } from 'src/app/services/profile.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolificadorService {

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private profileService: ProfileService,
    private contestResultService: ContestResultService,
    private profileContestService: ProfileContestService,
    private  config: ConfigService,
  ) { }


  getNombreUsuarios(role_id: number): string {
    return role_id == 1 ? 'Usuarios' : 'Autores'
  }

  isAdmin(u: User): boolean {
    return u.role_id === 1
  }
  esDelegado(u: User): boolean {
    return u.role_id === 2
  }
  esConcursante(u: User): boolean {
    return u.role_id === 3
  }
  esJuez(u: User): boolean {
    return u.role_id === 4
  }

  isNotPrivilegies(u: User): boolean {
    return u.role_id === 3 || u.role_id > 4
  }

  // getUsers(u: UserLogged): Observable<User[]> {
  //   return this.userService.getAll().pipe(
  //     map(users => users.filter(user => {
  //       let r = true
  //       if (user.id == u.id) r = false
  //       else if (u.role_id != 1) {
  //         r = user.role_id == 3
  //       }
  //       return r
  //     }))
  //   )
  // }
  getMiembros(u: UserLogged): Observable<ProfileExpanded[]> {
    return this.profileService.getAll<ProfileExpanded>("expand=user" + (!this.isAdmin(u) ? `&filter[fotoclub_id]=${u.profile.fotoclub_id}` : '')).pipe(
      map(profiles => {
        // console.log('mapeando perfiles', profiles)
        return profiles.filter(p => p.id == u.profile_id ? false : (this.isAdmin(u) ? true : p.user.role_id == 3))
      })
    )
  }
  getMiembro(u: UserLogged, n: number): Observable<ProfileExpanded> {
    return this.profileService.get<ProfileExpanded>(n, `expand=user,fotoclub,user.role`)
    // return this.profileService.getAll<ProfileExpanded>(`${this.config.apiUrl('profile')}/${n}/expand=user` + (!this.isAdmin(u) ? `&filter[fotoclub_id]=${u.profile.fotoclub_id}` : '')).pipe(
  }

  getConcursantes(u: UserLogged): Observable<ProfileExpanded[]> {
    return this.profileService.getAll<ProfileExpanded>("expand=user,fotoclub" + (!this.isAdmin(u) ? `&filter[fotoclub_id]=${u.profile.fotoclub_id}` : '')).pipe(
      map(profiles => {
        // console.log('mapeando perfiles', profiles)
        return profiles.filter(p => (p.id == u.profile_id || p.user.role_id != 3) ? false : (this.isAdmin(u) ? true : p.fotoclub_id == u.profile.fotoclub_id))
      })
    )
  }
  getConcursantesInscriptos(u: UserLogged, contest_id: number): Observable<ProfileContestExpanded[]> {
    return this.profileContestService.getAll<ProfileContestExpanded>(`expand=profile,profile.user,profile.fotoclub&filter[contest_id]=${contest_id}`).pipe(
      map(inscriptos => {
        // console.log('mapeando perfiles', profiles)
        return inscriptos.filter(i => (i.profile.id == u.profile_id || i.profile.user.role_id != 3) ? false : (this.isAdmin(u) ? true : i.profile.fotoclub_id == u.profile.fotoclub_id))
      })
    )
  }


}
