import { Component, Input } from '@angular/core';

@Component({
    selector: 'year-picker',

    template: `
    <div>
    <select class="form-control" [(ngModel)] = "year" [disabled] = "dis" required>
    <option value = "0" selected>Expiry Year</option>
            <option  *ngFor="let y of years">{{y}}</option>    
    </select>
    </div>`
})

export class YearPicker {
    @Input() year: number;
    @Input() dis: boolean;
    public years: number[] = [];
    public yy: number;

    ngOnInit() {
        this.getYear();
    }

    getYear() {
        var today = new Date();
        this.yy = today.getFullYear();
        //this.year = this.yy;
        for (var i = this.yy; i <= (this.yy + 50); i++) {
            this.years.push(i);
        }
    }
}