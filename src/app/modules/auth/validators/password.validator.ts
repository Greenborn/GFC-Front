import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class PasswordValidator {

    constructor() { }
    
    passEquals(control1: FormControl, control2: FormControl) {
        return new Promise(resolve => {
            const pattern = /[0-9]/;
            if (pattern.test(control1.value)) {
                resolve({ InvalidName: true });
            }
            resolve(null);
        });
    }
}