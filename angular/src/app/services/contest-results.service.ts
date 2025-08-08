
import axios from "axios"
import { BehaviorSubject } from 'rxjs';

import { LoadingController } from '@ionic/angular';
import { CONFIG, ConfigService } from './config/config.service';

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
            params +=  (attr?.concursante_id) ? ('&filter[profile_id]=' + attr.concursante_id) : ''
            
            const loadingCtrl = new LoadingController()
            const loading = await loadingCtrl.create({ message: 'Cargando Resultados' });
            if (attr?.present_loading)
                await loading.present()
            
                const configService = new ConfigService();
                let res = await axios.get(configService.nodeApiBaseUrl+'contest-result?'+params, {
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