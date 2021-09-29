import { Injectable } from '@angular/core';

import { Api } from '../api.service';
import { Concurso } from '../concursos/concurso.model';
import { Image } from 'src/app/models/image.model'
import { ContestResult } from '../models/contest_result.model';
@Injectable({
  providedIn: 'root'
})
export class ConcursoService {

  constructor() { }

  async getConcursos(): Promise<Concurso[]> {
    return Api.getAll('concurso');
  }

  async getConcurso(id: number): Promise<Concurso> {
    return Api.get('concurso', id);
  }

  async postConcurso(c: Concurso): Promise<number> {
    return Api.post('concurso', c);
  }

  async deleteConcurso(id: number) {
    return Api.delete('concurso', id);
  }

  async getContestResults(contest_id: number): Promise<ContestResult[]> {
    return (await Api.getAll('contest-result')).filter(r => r.contest_id == contest_id)
  }
  async postContestResult(r: ContestResult) {
    return Api.post('contest-result', r)
  }
  async getImage(id: number): Promise<Image> {
    return await Api.get('image', id)
  }
  async postImage(i: Image): Promise<number> {
    return Api.post('image', i)
  }
  async deleteImage(id: number) {
    return true
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
