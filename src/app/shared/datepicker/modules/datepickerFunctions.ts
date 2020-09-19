import { Injectable } from '@angular/core';
import {
    ICalendarVM,
    eDateType,
    IDateVM
} from '../models/datepickerVM'; 

import { DatePickerService } from '../modules/datePickerService';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable({ providedIn: 'root'})
export class DatePickerFunctions extends DatePickerService {

    getDateByYearMonthChange(dateType: number, year: number, month: number, day: number, minDate?: Date, maxDate?: Date): ICalendarVM {
        let cModel: ICalendarVM = <ICalendarVM>{};
        let date: Date;

        cModel = this.DateByYearMonthChange(dateType, year, month);
        cModel.DateType = dateType;

        if (cModel.DateType == eDateType.DateTypeAD) {
            date = new Date(year, month - 1, day);
        } else {
            let DateBS: string = this.GetDate(dateType, year, month, day).DateBS;
            let days: number = this.GetBSDay(DateBS);

            try {
                date = this.GetDateAD(year, month, days);
            }
            catch (err) {
                let daysInMonth: number = this.GetDaysInMonthByYearAndMonth(year, month);
                date = this.GetDateAD(year, month, Number(daysInMonth));
            }
        }

        cModel.MinDays = [];
        cModel.MaxDays = [];

        if (minDate)
            cModel.MinDays = this.MinDate(minDate, date, dateType);
        if (maxDate)
            cModel.MaxDays = this.MaxDate(maxDate, date, dateType);
        return cModel;
    }

    public getDate(year: number, month: number, day: number, dateType?: number): IDateVM {
        if (!dateType)
            dateType = Number(localStorage.getItem('Param.DateType'));

        let dtModel: IDateVM = this.GetDate(dateType, year, month, day);
        return dtModel;
    }

    public getBSYear(bsDate: string): number {
        return Number(this.GetBSYear(bsDate)) || null;
    }

}
