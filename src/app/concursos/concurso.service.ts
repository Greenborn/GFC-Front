import { Injectable } from '@angular/core';

import { Concurso } from './concurso.model';

@Injectable({
  providedIn: 'root'
})
export class ConcursoService {

  private concursos: Concurso[] = [
    {
        "id": 1,
        "name": "concurso prueba 1",
        "description": "Reglas?",
        "start_date": "1630355013",
        "end_date": "1630355013"
    },
    {
        "id": 2,
        "name": "concurso prueba 2",
        "description": "Reglas? no, no hay eso acá",
        "start_date": "1630355013",
        "end_date": "1630355013"
    }
]

  constructor() { }

  async getConcursos(): Promise<Concurso[]> {
    return [ ...this.concursos ]
    // return fetch('https://grupofotografico.api.greenborn.com.ar/contest').then(r => r.json()).then(j => {
    //   return j.items
    // })
  }

  async getConcurso(id: number): Promise<Concurso> {
    return { ...this.concursos.find(c => c.id == id) }
  }

  async postConcurso(c: Concurso): Promise<number> {
    if (c.id == undefined) { // post
      let id = Math.floor(Math.random()*10**10);
      c.id = id;
      this.concursos.push({ ...c });
    }
    else { // put
      this.concursos[this.concursos.findIndex(c1 => c.id == c1.id)] = { ...c };
    }
    // console.log(c);
    return c.id;
  }

  async deleteConcurso(id: number) {
    this.concursos.splice(this.concursos.findIndex(c => c.id == id), 1)
  }

  static concursoTemplate(): Concurso {
    return {
      id: undefined,
      name: undefined,
      description: undefined,
      start_date: undefined,
      end_date: undefined
    };
  }
  static formatearFechaParaHTML(fecha: string): string {
    const d = new Date(parseInt(fecha));
    let anio = d.getFullYear().toString();
    let mes = (d.getMonth()+1).toString();
    if (mes.length == 1) mes = '0' + mes;
    let dia = d.getDate().toString();
    if (dia.length == 1) dia = '0' + dia;
    return `${anio}-${mes}-${dia}`;
  }
  static formatearFechaParaBD(fecha: string): string {
    return Date.parse(fecha).toString();
  }
}
