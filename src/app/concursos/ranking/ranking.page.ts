import { Component, OnInit } from '@angular/core';

import { RankingService } from '../../services/ranking.service';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.page.html',
  styleUrls: ['./ranking.page.scss'],
})
export class RankingPage implements OnInit {

  constructor(
   private rankingService: RankingService
  ) { 
    this.cargarRanking()
  }

  public ranking:any = {}
  public sentido_orden:number = -1
  public anio:number = new Date().getFullYear()

  async ngOnInit() {
    
  }

  procesar_ranking( r ){
    let ranks = { 'profiles': [], 'fotoclubs': [] }
    let cats  = {}
    let sects = {}

    //se crea estructura de ranking a partir de categorias
    for (let c=0; c < r.Category.length; c++){
      cats[r.Category[c].id] = r.Category[c]
      ranks.profiles.push({
        nombre_categoria: r.Category[c].name,
        id_categoria: r.Category[c].id,
        profiles: [],
        ranks_seccion: []
      })
    }

    //se crea estructura de rankings de secciones
    for (let c=0; c < r.Section.length; c++){
      sects[r.Section[c].id] = r.Section[c] 

      for (let i=0; i < ranks.profiles.length; i++){
        ranks.profiles[i].ranks_seccion.push({
          nombre_seccion: sects[r.Section[c].id].name,
          id_seccion: r.Section[c].id,
          profiles: []
        })
      }
    }

    //se asignan los perfiles a los rankings
    for (let c=0; c < r.profiles.length; c++){
      let perfil = r.profiles[c]
      perfil['posicion_temporada'] = 0
      if (perfil.puntaje_temporada > 0){
        //se asigna un perfil al ranking de la categoria que el corresponde
        for (let i=0; i < ranks.profiles.length; i++){
          if (ranks.profiles[i].id_categoria == perfil.category_id){
            //si existe el perfil se suman los puntos, caso contrario se inserta registro nuevo
            let encontrado = false
            for (let j=0; j < ranks.profiles[i].profiles.length; j++){
              if (ranks.profiles[i].profiles[j].id == perfil.id ){
                ranks.profiles[i].profiles[j].puntaje_temporada += perfil.puntaje_temporada
                encontrado = true
                break;
              }
            }
            if (!encontrado)
              ranks.profiles[i].profiles.push( {...perfil} )
            
            //se asigna el perfil al sub-ranking de la sección
            for (let j=0; j < ranks.profiles[i].ranks_seccion.length; j++){
              if (ranks.profiles[i].ranks_seccion[j].id_seccion == perfil.section_id){
                ranks.profiles[i].ranks_seccion[j].profiles.push( {...perfil} )
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
        if ((i+1 < ranks.profiles[c].profiles.length) && (ranks.profiles[c].profiles[i].puntaje_temporada != ranks.profiles[c].profiles[i+1].puntaje_temporada)){
          pos_categoria += 1
        }
      }

      let pos_seccion = 1;
      for (let i=0; i < ranks.profiles[c].ranks_seccion.length; i++){
        console.log(ranks.profiles[c].ranks_seccion[i])

      }
    }

    console.log(ranks)
/**
 * 
 * this.ranking.profiles = this.ranking.profiles.sort(
        (item1, item2) => {
          if (item1.score < item2.score ) {
            return -1 * this.sentido_orden;
          }
          if (item1.score > item2.score) {
            return 1 * this.sentido_orden;
          }
          return 0;
        })

      this.ranking.fotoclubs = this.ranking.fotoclubs.sort(
        (item1, item2) => {
          if (item1.score < item2.score ) {
            return -1 * this.sentido_orden;
          }
          if (item1.score > item2.score) {
            return 1 * this.sentido_orden;
          }
          return 0;
        }) 
 */

    return ranks;
  }
 
  cargarRanking() {
    this.rankingService.getAll().subscribe(r => {
      this.ranking = this.procesar_ranking( r )
    })
  }
}
