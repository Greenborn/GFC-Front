import { Injectable } from '@angular/core';
import { Api } from '../api.service';
import { Fotoclub } from '../models/fotoclub.model';

@Injectable({
  providedIn: 'root'
})
export class FotoclubService {

  constructor() { }

  async getFotoclubs(): Promise<Fotoclub[]> {
    const d = await Api.getAll('fotoclub')
    return d
  }
  async getFotoclub(id: number): Promise<Fotoclub> {
    const f = await Api.get('fotoclub', id)
    return f
  }
}
