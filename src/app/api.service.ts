import { ApplicationInitStatus, Injectable } from '@angular/core';

import { Concurso } from './concursos/concurso.model';
import { Usuario } from './usuario/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class Api {

  private constructor() { }
  
  private static usuarios: Usuario[] = [
    {
      id: 0,
      username: 'admin',
      email: 'admin@admin',
      rol_id: 0,
      img_url: 'https://gravatar.com/avatar/dba6bae8c566d4041fb9cd9ada7741?d=identicon&f=y',
      name: 'Luis',
      last_name: 'Lu',
      dni: "1455123",
      fotoclub_id: 0
    },
    {
      id: 1,
      username: 'd1',
      rol_id: 1,
      email: 'admin2@admin2',
      img_url: 'https://gravatar.com/avatar/dba6bae8c566f9ssdd4041fb9cd9ada7741?d=identicon&f=y',
      name: 'Laura',
      last_name: 'Lu',
      dni: "4112321",
      fotoclub_id: 0
    },
    {
      id: 2,
      username: 'd2',
      rol_id: 1,
      email: 'admin2@admin2',
      img_url: 'https://gravatar.com/avatar/dba6bae8c12522fb9cd9ada7741?d=identicon&f=y',
      name: 'Migujel',
      last_name: 'Lu',
      dni: "4112321",
      fotoclub_id: 1
    },
    {
      id: 3,
      username: 'c1',
      rol_id: 2,
      email: 'admin2@admin2',
      img_url: 'https://gravatar.com/avatar/dba6bae8c566f1424041fb9cd9ada7741?d=identicon&f=y',
      name: 'Maria',
      last_name: 'Lu',
      dni: "4112321",
      fotoclub_id: 0
    },
    {
      id: 4,
      username: 'c2',
      rol_id: 2,
      email: 'admin2@admin2',
      img_url: 'https://gravatar.com/avatar/dba6bae8c566f1421452b9cd9ada7741?d=identicon&f=y',
      name: 'Lucas',
      last_name: 'Lu',
      dni: "4112321",
      fotoclub_id: 1
    },
  ];

  private static concursos: Concurso[] = [
    {
        "id": 1,
        "name": "concurso prueba 1",
        "description": "Esta es la descripción de un concurso de prueba,  magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam",
        "start_date": "1630355013",
        "end_date": "1630355013"
    },
    {
        "id": 2,
        "name": "concurso prueba 2",
        "description": "Esta es la descripción de un concurso de prueba,  magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam",
        "start_date": "1630355013",
        "end_date": "1630355013"
    }
  ];
  
  private static fotoclubes = [
    {
      id: 0,
      name: 'El Portal'
    },
    {
      id: 1,
      name: 'Olavarria'
    },
    {
      id: 2,
      name: 'Necochea'
    },
  ];

  private static roles = [
    {
      id: 0,
      type: 'Administrador'
    },
    {
      id: 1,
      type: 'Delegado de fotoclub'
    },
    {
      id: 2,
      type: 'Concursante'
    },
  ];


  static async get(recurso: string, id: number): Promise<any> {
     const data = await Api.getAll(recurso);
     return data.find(e => e.id == id)
  }
  static async getAll(recurso: string): Promise<any[]> {
    return [ ...Api.getRecursoData(recurso) ];

    // return fetch('https://grupofotografico.api.greenborn.com.ar/contest').then(r => r.json()).then(j => {
    //   return j.items
    // })
  }

  static async post(recurso: string, obj: any): Promise<number> {
    const d = Api.getRecursoData(recurso);
    if (obj.id == undefined) { // post
      let id = Math.floor(Math.random()*10**7);
      obj.id = id;
      d.push({ ...obj });
    }
    else { // put
      d[d.findIndex(e => obj.id == e.id)] = { ...obj };
    }
    // console.log('post', obj);
    return obj.id;
  }

  static async delete(recurso: string, id: number): Promise<boolean> {
    const d = Api.getRecursoData(recurso);
    d.splice(d.findIndex(e => e.id == id), 1);
    return true;
  }

  private static getRecursoData(r: string): any[] {
    switch(r) {
      case 'concurso':  return Api.concursos;
      case 'usuario':   return Api.usuarios;
      case 'fotoclub':  return Api.fotoclubes;
      case 'rol':       return Api.roles;
      default:          return [];
    }
  }

}
