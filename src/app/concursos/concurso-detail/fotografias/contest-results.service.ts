
import axios from "axios"

import { CONFIG } from '../../../services/config/config.service';

export const get_all = async (attr) => {
    return new Promise(async (resolve, reject) => {
        try {
            let params:string = '';
            params +=   'expand=profile,profile.user,profile.fotoclub,image.profile,image.thumbnail'
            params +=   '&filter[contest_id]='+attr.contest_id
            params +=   attr?.page ? '&page='+attr.page : ''
            params +=  (attr?.concursante_id) ? ('&filter[profile_id]=' + attr.concursante_id) : ''
            let res = await axios.get(CONFIG.apiBaseUrl+'contest-result?'+params, {
                headers: {
                    'Authorization': 'Bearer '+localStorage.getItem(CONFIG.appName + 'token' ),
                    'Content-Type':  'application/json'
                }
            })
            console.log('attr_', attr.contest_id)
            if (res?.data){
                return resolve(res.data)
            } else 
                return resolve(null)
        } catch (error) {
            console.log(error)
            return resolve(null)
        }
    })
}