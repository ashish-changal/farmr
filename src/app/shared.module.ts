import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SpecialcharacterPipe } from './specialcharacter.pipe';
import { InputMask } from './directives/inputmask';

@NgModule({
  declarations: [ 
    SpecialcharacterPipe,
    InputMask
  ],
  exports: [
    TranslateModule,
    FormsModule,
    MyDatePickerModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    SpecialcharacterPipe,
    InputMask
  ]
})

export class SharedModule { }