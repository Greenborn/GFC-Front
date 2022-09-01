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

  obtener_filas( categoria ){
    if (categoria.pestania_seccion == -1){
      return categoria.profiles;
    }

    return categoria.ranks_seccion[ categoria.pestania_seccion ].profiles
  }

  procesar_ranking( r ){
    let ranks = { 'profiles': [], 'fotoclubs': r.fotoclubs }
    let cats  = {}
    let sects = {}

    //se crea estructura de ranking a partir de categorias
    for (let c=0; c < r.Category.length; c++){
      cats[r.Category[c].id] = r.Category[c]
      ranks.profiles.push({
        nombre_categoria: r.Category[c].name,
        id_categoria: r.Category[c].id,
        profiles: [],
        pestania_seccion: -1,
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
      perfil.premios_temporada = JSON.parse( perfil.premios_temporada )
      perfil['posicion_temporada'] = 0
      if (perfil.puntaje_temporada > 0){
        //se asigna un perfil al ranking de la categoria que el corresponde
        for (let i=0; i < ranks.profiles.length; i++){
          if (ranks.profiles[i].id_categoria == perfil.category_id){
            //si existe el perfil se suman los puntos, caso contrario se inserta registro nuevo
            let encontrado = false
            for (let j=0; j < ranks.profiles[i].profiles.length; j++){
              if (ranks.profiles[i].profiles[j].profile_id == perfil.profile_id ){
                ranks.profiles[i].profiles[j].puntaje_temporada += perfil.puntaje_temporada
                ranks.profiles[i].profiles[j].score_total       += perfil.score_total
                ranks.profiles[i].profiles[j].premios_temporada = this.sumar_premios( ranks.profiles[i].profiles[j].premios_temporada, perfil.premios_temporada )
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
        obj1[ks[c]] += obj2[ks[c]]
      } else {
        obj1[ks[c]] = obj2[ks[c]]
      }
    }
    
    return obj1;
  }

  arreglo_premios( obj ){
    let arr = []
    
    let ks = Object.keys(obj)
    for (let c=0; c < ks.length; c++){
      if (ks[c] != '0' && ks[c] != 'RECHAZADA')
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
 
  cargarRanking() {
    this.rankingService.getAll().subscribe(r => {
      this.ranking = this.procesar_ranking( r )
    })
  }
}
