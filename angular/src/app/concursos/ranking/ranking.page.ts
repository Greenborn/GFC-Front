import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RankingService } from '../../services/ranking.service';
import { RankingDetalleModalComponent } from './ranking-detalle-modal/ranking-detalle-modal.component';
import { ContestResultService } from '../../services/contest-result.service';
import { LoadingService } from '../../services/ui/loading.service';
import { AlertService } from '../../services/ui/alert.service';
import { UiUtilsService } from '../../services/ui/ui-utils.service';
import { ConfigService } from '../../services/config/config.service';

@Component({
  standalone: false,
  selector: 'app-ranking',
  templateUrl: './ranking.page.html',
  styleUrls: ['./ranking.page.scss'],
})
export class RankingPage implements OnInit {

  constructor(
    private rankingService: RankingService,
    public loadingService: LoadingService,
    private alertController: AlertService,
    private contestResultService: ContestResultService,
    private UIUtilsService: UiUtilsService,
    public configService: ConfigService,
  ) { 
    this.cargarRanking()
  }

  public ranking:any = {}
  public sentido_orden:number = -1
  public anio:number = new Date().getFullYear()
  public expandedCategories: boolean[] = []
  public fotoclubExpanded: boolean = true

  async ngOnInit() {
    
  }

  obtener_filas( categoria ){
    if (categoria.pestania_seccion == -1){
      return categoria.profiles;
    }

    return categoria.ranks_seccion[ categoria.pestania_seccion ].profiles
  }

  isHabilitado(rg: any, r: any): boolean {
    if (r.nombre_categoria !== 'Estímulo' || r.pestania_seccion != -1) return false;
    const generalProfile = r.profiles.find(p => p.profile_id === rg.profile_id);
    return generalProfile && generalProfile.score_total >= 240;
  }

  toggleCategory(i: number) {
    this.expandedCategories[i] = !this.expandedCategories[i];
  }

  toggleFotoclub() {
    this.fotoclubExpanded = !this.fotoclubExpanded;
  }

  procesar_ranking( r ){
    let ranks = { 'profiles': [], 'fotoclubs': r.fotoclubs }
    let cats  = {}
    let sects = {}
    let profileIndexMaps: { [categoryId: number]: { [profileId: string]: number } } = {}
    let sectionIndexMaps: { [categoryId: number]: { [sectionId: string]: { [profileId: string]: number } } } = {}

    //se crea estructura de ranking a partir de categorias
    for (let c=0; c < r.Category.length; c++){
      const categoryId = r.Category[c].id
      cats[categoryId] = r.Category[c]
      ranks.profiles.push({
        nombre_categoria: r.Category[c].name,
        id_categoria: categoryId,
        profiles: [],
        pestania_seccion: -1,
        ranks_seccion: []
      })
      profileIndexMaps[categoryId] = {}
      sectionIndexMaps[categoryId] = {}
    }

    //se crea estructura de rankings de secciones
    for (let c=0; c < r.Section.length; c++){
      const sectionId = r.Section[c].id
      sects[sectionId] = r.Section[c] 

      for (let i=0; i < ranks.profiles.length; i++){
        const categoryId = ranks.profiles[i].id_categoria
        ranks.profiles[i].ranks_seccion.push({
          nombre_seccion: sects[sectionId].name,
          id_seccion: sectionId,
          profiles: []
        })
        sectionIndexMaps[categoryId][sectionId] = {}
      }
    }

    //se asignan los perfiles a los rankings
    for (let c=0; c < r.profiles.length; c++){
      let perfil = r.profiles[c]
      perfil.premios_temporada = JSON.parse( perfil.premios_temporada )
      perfil['posicion_temporada'] = 0
      if (perfil.puntaje_temporada > 0){
        //se asigna un perfil al ranking de la categoria que el corresponde
        for (let i=0; i < ranks.profiles.length; i++){
          if (ranks.profiles[i].id_categoria == perfil.category_id){
            const categoryId = ranks.profiles[i].id_categoria
            const profileKey = String(perfil.profile_id)
            let profileIdx = profileIndexMaps[categoryId][profileKey]

            if (profileIdx === undefined){
              profileIdx = ranks.profiles[i].profiles.length
              profileIndexMaps[categoryId][profileKey] = profileIdx
              ranks.profiles[i].profiles.push( {...perfil} )
            } else {
              const existingProfile = ranks.profiles[i].profiles[profileIdx]
              existingProfile.puntaje_temporada += perfil.puntaje_temporada
              existingProfile.score_total       += perfil.score_total
              existingProfile.premios_temporada = this.sumar_premios( existingProfile.premios_temporada, perfil.premios_temporada )
            }

            //se asigna el perfil al sub-ranking de la sección
            for (let j=0; j < ranks.profiles[i].ranks_seccion.length; j++){
              if (ranks.profiles[i].ranks_seccion[j].id_seccion == perfil.section_id){
                const sectionId = ranks.profiles[i].ranks_seccion[j].id_seccion
                const sectionKey = String(perfil.profile_id)
                let sectionIdx = sectionIndexMaps[categoryId][sectionId][sectionKey]

                if (sectionIdx === undefined){
                  sectionIdx = ranks.profiles[i].ranks_seccion[j].profiles.length
                  sectionIndexMaps[categoryId][sectionId][sectionKey] = sectionIdx
                  ranks.profiles[i].ranks_seccion[j].profiles.push( {...perfil} )
                } else {
                  const existingSectionProfile = ranks.profiles[i].ranks_seccion[j].profiles[sectionIdx]
                  existingSectionProfile.puntaje_temporada += perfil.puntaje_temporada
                  existingSectionProfile.score_total       += perfil.score_total
                  existingSectionProfile.premios_temporada = this.sumar_premios( existingSectionProfile.premios_temporada, perfil.premios_temporada )
                }
                break;
              }
            }
            break;
          }
        }
      }
    }

    //se ordenan los perfiles en los rankings
    for (let c=0; c < ranks.profiles.length; c++){
      ranks.profiles[c].profiles.sort( (item1, item2) => {
          if (item1.puntaje_temporada < item2.puntaje_temporada ) {
            return -1 * this.sentido_orden;
          }
          if (item1.puntaje_temporada > item2.puntaje_temporada) {
            return 1 * this.sentido_orden;
          }
          return 0;
        })
      
      for (let i=0; i < ranks.profiles[c].ranks_seccion.length; i++){
        ranks.profiles[c].ranks_seccion[i].profiles.sort( (item1, item2) => {
          if (item1.puntaje_temporada < item2.puntaje_temporada ) {
            return -1 * this.sentido_orden;
          }
          if (item1.puntaje_temporada > item2.puntaje_temporada) {
            return 1 * this.sentido_orden;
          }
          return 0;
        })

      }
    }

    //Se asignan los numeros de posición
    for (let c=0; c < ranks.profiles.length; c++){
      let pos_categoria = 1;
      for(let i=0; i < ranks.profiles[c].profiles.length; i++){
        ranks.profiles[c].profiles[i].posicion_temporada = pos_categoria
        ranks.profiles[c].profiles[i].premios_temporada = this.arreglo_premios( ranks.profiles[c].profiles[i].premios_temporada )
        if ((i+1 < ranks.profiles[c].profiles.length) && (ranks.profiles[c].profiles[i].puntaje_temporada != ranks.profiles[c].profiles[i+1].puntaje_temporada)){
          pos_categoria += 1
        }
      }

      for (let i=0; i < ranks.profiles[c].ranks_seccion.length; i++){
        let pos_seccion = 1;
        for(let j=0; j< ranks.profiles[c].ranks_seccion[i].profiles.length; j++ ){
          ranks.profiles[c].ranks_seccion[i].profiles[j].posicion_temporada = pos_seccion
          ranks.profiles[c].ranks_seccion[i].profiles[j].premios_temporada = this.arreglo_premios( ranks.profiles[c].ranks_seccion[i].profiles[j].premios_temporada )
          if ((j+1 < ranks.profiles[c].ranks_seccion[i].profiles.length) && (ranks.profiles[c].ranks_seccion[i].profiles[j].puntaje_temporada != ranks.profiles[c].ranks_seccion[i].profiles[j+1].puntaje_temporada)){
            pos_seccion += 1
          }
        }
      }
    }

    //Se ordenan los fotoclubes
    ranks.fotoclubs.sort( (item1, item2) => {
      if (item1.puntaje_temporada < item2.puntaje_temporada ) {
        return -1 * this.sentido_orden;
      }
      if (item1.puntaje_temporada > item2.puntaje_temporada) {
        return 1 * this.sentido_orden;
      }
      return 0;
    })

    //se asignan los numeros de posicion
    let pos_temporada = 1
    for (let c=0; c < ranks.fotoclubs.length; c++){
      ranks.fotoclubs[c]['posicion_temporada'] = pos_temporada
      ranks.fotoclubs[c].porc_efectividad_anual = JSON.parse(ranks.fotoclubs[c].porc_efectividad_anual)
      ranks.fotoclubs[c].premios_temporada = this.arreglo_premios(JSON.parse(ranks.fotoclubs[c].premios_temporada))

      if (c+1 < ranks.fotoclubs.length && ranks.fotoclubs[c+1].puntaje_temporada != ranks.fotoclubs[c].puntaje_temporada){
        pos_temporada += 1
      }
    }

    // eliminar secciones vacías para que no se muestren botones sin ranking
    for (let c=0; c < ranks.profiles.length; c++){
      ranks.profiles[c].ranks_seccion = ranks.profiles[c].ranks_seccion.filter(
        seccion => seccion.profiles && seccion.profiles.length > 0
      )
      if (ranks.profiles[c].pestania_seccion >= ranks.profiles[c].ranks_seccion.length) {
        ranks.profiles[c].pestania_seccion = -1
      }
    }

    return ranks;
  }

  sumar_premios( obj1, obj2 ){
    if (typeof obj1 == 'string'){
      obj1 = JSON.parse( obj1 )
    }
    if (typeof obj2 == 'string'){
      obj2 = JSON.parse( obj2 )
    }
    let salida = {...obj1}

    let ks = Object.keys(obj2)
    for (let c=0; c < ks.length; c++){
      if (obj1.hasOwnProperty( ks[c] )){
        salida[ks[c]] = obj1[ks[c]] + obj2[ks[c]]
      } else {
        salida[ks[c]] = obj2[ks[c]]
      }
    }
    
    return salida;
  }

  arreglo_premios( obj ){
    let arr = []
    
    let ks = Object.keys(obj)
    for (let c=0; c < ks.length; c++){
      if (ks[c] != '0' && ks[c] != 'RECHAZADA' && ks[c] != 'FUERA DE REGLAMENTO')
        arr.push({ 'nombre': ks[c], 'cantidad': obj[ks[c]] })
    }

    arr.sort( (item1, item2) => {
      if (item1.cantidad < item2.cantidad ) {
        return -1 * this.sentido_orden;
      }
      if (item1.cantidad > item2.cantidad) {
        return 1 * this.sentido_orden;
      }
      return 0;
    })

    return arr;
  }
 
  async cargarRanking() {
    await this.loadingService.present('Cargando...')
    this.rankingService.getAll(`year=${this.anio}`).subscribe(r => {
      this.ranking = this.procesar_ranking( r )
      this.expandedCategories = this.ranking.profiles?.map(() => true) ?? []

      // Collect unique profile IDs from the general ranking
      const profileIdSet: Set<number> = new Set()
      for (const cat of this.ranking.profiles) {
        for (const p of cat.profiles) {
          profileIdSet.add(p.profile_id)
        }
      }

      const profileIds = Array.from(profileIdSet)
      if (profileIds.length === 0) {
        this.loadingService.dismiss()
        return
      }

      // Fetch correct season totals from the Node API for each profile in parallel
      const detailRequests = profileIds.map(profile_id =>
        this.rankingService.getDetalleRanking(profile_id, undefined, this.anio).pipe(
          catchError(() => of(null))
        )
      )

      forkJoin(detailRequests).subscribe(details => {
        // Build map: profile_id -> correct total score
        const scoreMap: { [profile_id: number]: number } = {}
        const imgUrlMap: { [profile_id: number]: string } = {}
        details.forEach((detail, idx) => {
          if (detail) {
            const pid = profileIds[idx]
            const total = (detail.items ?? []).reduce(
              (acc: number, it: any) => acc + (it?.ranking?.total_score ?? 0), 0
            )
            scoreMap[pid] = total
            if (detail.profile?.img_url) {
              imgUrlMap[pid] = detail.profile.img_url
            }
          }
        })

        // Update general ranking scores with Node API totals and re-sort
        for (const cat of this.ranking.profiles) {
          for (const p of cat.profiles) {
            if (scoreMap[p.profile_id] !== undefined) {
              p.puntaje_temporada = scoreMap[p.profile_id]
              p.score_total = scoreMap[p.profile_id]
            }
            if (imgUrlMap[p.profile_id]) {
              p.img_url = imgUrlMap[p.profile_id]
            }
          }

          cat.profiles.sort((a: any, b: any) => {
            if (a.puntaje_temporada < b.puntaje_temporada) return -1 * this.sentido_orden
            if (a.puntaje_temporada > b.puntaje_temporada) return 1 * this.sentido_orden
            return 0
          })

          let pos = 1
          for (let i = 0; i < cat.profiles.length; i++) {
            cat.profiles[i].posicion_temporada = pos
            if (i + 1 < cat.profiles.length &&
                cat.profiles[i].puntaje_temporada !== cat.profiles[i + 1].puntaje_temporada) {
              pos++
            }
          }
        }

        this.loadingService.dismiss()
      })
    })
  }

  async verDetalle(rg: any, categoria: any) {
    const profile_id = rg.profile_id;
    const contest_id = rg.last_contest_id ?? rg.contest_id ?? null;
    const year = contest_id ? undefined : this.anio;

    let section_id: number | undefined;
    let seccionNombre = 'General';
    if (categoria && categoria.pestania_seccion != -1) {
      const seccion = categoria.ranks_seccion[categoria.pestania_seccion];
      if (seccion) {
        section_id = seccion.id_seccion;
        seccionNombre = seccion.nombre_seccion;
      }
    }

    await this.loadingService.present('Cargando...');
    this.rankingService.getDetalleRanking(profile_id, contest_id ?? undefined, year, section_id).subscribe({
      next: async detalle => {
        this.loadingService.dismiss();
        await this.UIUtilsService.mostrarModal(RankingDetalleModalComponent, {
          detalle,
          categoriaNombre: categoria?.nombre_categoria || '',
          seccionNombre
        });
      },
      error: async _err => {
        this.loadingService.dismiss();
        await this.UIUtilsService.mostrarAlert({
          header: 'Error',
          message: 'No se pudo obtener el detalle de ranking.'
        })
      }
    });
  }
}
