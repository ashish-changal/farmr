import { Component, Input } from '@angular/core';

@Component({
    selector: 'month-picker',

    template: `
    <div>    
    <select class="form-control" [(ngModel)] = "month" [disabled] = "dis" required>
            <option value = "0" selected>Expiry Month</option>
            <option  *ngFor="let p of months" [value]="p.val">{{p.name}}</option>    
    </select>
    </div>`
})

export class MonthPicker {

public mm : string ;
@Input() month: number;
@Input() dis: boolean;
months = [
        { val: 1, name: 'Jan' },
        { val: 2,  name: 'Feb' },
        { val: 3,  name: 'Mar' },
        { val: 4,  name: 'Apr' },
        { val: 5,  name: 'May' },
        { val: 6,  name: 'Jun' },
        { val: 7,  name: 'Jul' },
        { val: 8,  name: 'Aug' },
        { val: 9,  name: 'Sep' },
        { val: 10,  name: 'Oct' },
        { val: 11,  name: 'Nov' },
        { val: 12,  name: 'Dec' }
    ];

    ngOnInit() {  this.getMonth(); 
    }  

    getMonth(){
    var today = new Date();
   //this.month = today.getMonth()+1;     
    }
}