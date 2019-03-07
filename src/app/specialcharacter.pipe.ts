import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'specialcharacter'
})
export class SpecialcharacterPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(value != undefined && value != null){
      var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
      if(value.search(format) == -1){
        return value;
      }
    }
  }

}
