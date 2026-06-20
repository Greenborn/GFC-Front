
import axios from "axios"
import { BehaviorSubject } from 'rxjs';

import { LoadingController } from '@ionic/angular';
import { CONFIG } from './config/config.service';

let result_data:any = null

export const resultadosConcursoGeted = new BehaviorSubject<any>({ items: []});

export const get_all = async (attr, reload = true) => {
    return new Promise(async (resolve, reject) => {
        if (!reload && result_data !== null)
            return resolve(result_data)

        try {
            if (!attr?.contest_id)
                return resolve(null)

            let params:string = '';
            params +=  'expand=profile,profile.user,profile.fotoclub,image.profile,image.thumbnail'
            params +=  '&filter[contest_id]='+attr.contest_id
            params +=  (attr?.page) ? '&page='+attr.page : ''
            params +=  (attr?.perPage) ? '&per-page='+attr.perPage : ''
            params +=  (attr?.concursante_id) ? ('&filter[profile_id]=' + attr.concursante_id) : ''
            params +=  (attr?.search) ? '&search='+encodeURIComponent(attr.search) : ''
            params +=  (attr?.sort) ? '&sort='+attr.sort : ''
            params +=  (attr?.sort_dir) ? '&sort_dir='+attr.sort_dir : ''
            params +=  (attr?.author) ? '&filter[author]='+encodeURIComponent(attr.author) : ''
            params +=  (attr?.code) ? '&filter[code]='+encodeURIComponent(attr.code) : ''
            if (attr?.section_ids?.length) {
              attr.section_ids.forEach(id => {
                params += '&filter[section_id]='+id
              })
            }
            if (attr?.category_ids?.length) {
              attr.category_ids.forEach(id => {
                params += '&filter[category_id]='+id
              })
            }
            if (attr?.prizes?.length) {
              attr.prizes.forEach(p => {
                params += '&filter[prize]='+encodeURIComponent(p)
              })
            }
            
            const loadingCtrl = new LoadingController()
            const loading = await loadingCtrl.create({ message: 'Cargando Resultados' });
            if (attr?.present_loading)
                await loading.present()
            
            const uniqueId = localStorage.getItem('sso_client_unique_id');
            if (uniqueId) {
              params += '&unique_id=' + encodeURIComponent(uniqueId);
            }

            let res = await axios.get(CONFIG.nodeApiBaseUrl+'contest-result?'+params, {
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem(CONFIG.appName + 'token' ),
                    'Content-Type':  'application/json'
                }
            })
            console.log('attr_', attr.contest_id)
            if (res?.data){
                if (attr?.present_loading)
                    await loading.dismiss();
                result_data = res.data
                if (!attr?.skipPublish)
                  resultadosConcursoGeted.next(result_data)
                return resolve(result_data)
            } else {
                if (attr?.present_loading)
                    await loading.dismiss(); 
                return resolve(null)
            }
        } catch (error) {
            console.log(error)
            return resolve(null)
        }
    })
}