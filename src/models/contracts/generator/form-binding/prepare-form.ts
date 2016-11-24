import { FormGroup, FormControl } from '@angular/forms'

import { FormInputBind } from './form-input-bind';
import { FormGroupArrays } from './form-array';

import { MAX_LENGTH_FIELD_NAME, PREFIX } from '../../consts';

export function prepareForm(form: FormGroup, arr: FormInputBind[] = [], path: string = '', ): FormInputBind[] {

    for (let p in form.controls) {
        let c = form.controls[p];
        if (c instanceof FormGroup) {
            prepareForm(c, arr, p + '.');
        } else {
            arr.push({
                length: parseInt(c[PREFIX + MAX_LENGTH_FIELD_NAME]),
                name: p
            });
        }
    }

    return arr;
}


export function prepareFormArrays(arrays: FormGroupArrays): FormInputBind[] {
    let arr: FormInputBind[] = []
    for (let p in arrays) {
        let form = arrays[p];
        let c = prepareForm(form, [], p + '[0].'); // for every
        arr = arr.concat(c);
    }
    return arr;
}