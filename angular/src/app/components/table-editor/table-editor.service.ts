import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { lastValueFrom } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class TableEditorService {
  constructor(private http: HttpClient) {}

  async list(api: (params: any) => Promise<any>, params: any): Promise<any> {
    return api(params)
  }
}
