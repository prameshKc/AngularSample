import { Component, Injectable, Input, SimpleChange } from '@angular/core';
import { IDateVM, IInputDateVM } from '../datepicker/models/datepickerVM';
import { DatePickerFunctions } from '../datepicker/modules/datepickerFunctions';
import { ParamService } from '../../services/BaseService';
import { IParam } from '../../models/Models';

@Component({
    selector: 'date-view',
    template: "<span>{{newDate}}</span>"
})
export class DateViewComponent {
    @Input() inputDate: any;

    newDate: string = '';

    defaultDateType: number;
    defaultADFormat: number;
    defaultBSFormat: number;

    constructor(
        public datePickerService: DatePickerFunctions,
        public paramService: ParamService
    ) {
        if (
            localStorage.getItem('Param.DateType') == null ||
            localStorage.getItem('Param.DefaultFormatAD') == null ||
            localStorage.getItem('Param.DefaultFormatBS') == null
        ) {
            this.paramService.getAll('$expand=ParamValue&$filter=PId eq 12 or PId eq 13 or PId eq 14').subscribe((data: IParam[]) => {
                if (data.length != 0) {
                    localStorage.setItem('Param.DateType', data.filter(x => x.PId == 12)[0].ParamValue.PValue);
                    localStorage.setItem('Param.DefaultFormatAD', data.filter(x => x.PId == 13)[0].ParamValue.PValue);
                    localStorage.setItem('Param.DefaultFormatBS', data.filter(x => x.PId == 14)[0].ParamValue.PValue);
                }
            });
        }
    }

    ngOnInit() {
    }


    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        this.getDate();
    }

    _isValidDate(value) {
        var dateWrapper = new Date(value);
        return !isNaN(dateWrapper.getDate());
    }

    getDate() {
        let newdate: Date;
        let x = this.inputDate;
        if (this._isValidDate(this.inputDate)) {
            newdate = new Date(this.inputDate);
        } else {
            newdate = new Date(this.inputDate.Year, this.inputDate.Month - 1, this.inputDate.Date);
        }

        let givenDate: Date = new Date(newdate);
        let date: IDateVM = this.datePickerService.getDate(givenDate.getFullYear(), givenDate.getMonth() + 1, givenDate.getDate(), 1);

        if (localStorage.getItem('Param.DateType') != null) {
            if (Number(localStorage.getItem('Param.DateType')) == 2) {
                this.newDate = date.DateBS + ` (${date.DateAD})`;
            } else {
                this.newDate = date.DateAD + ` (${date.DateBS})`;
            }
        } else {
            this.newDate = date.DateAD + ` (${date.DateBS})`;
        }
    }
}