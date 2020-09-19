import {
    ICalendarViewVM,
    ICalendarVM,
    ICountDaysVM,
    IDateVM,
    eDateFormat,
    eDateType,
    IInputDateVM
} from '../models/datepickerVM';
import { ScalarFunction } from './scalarFunctions';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DatePickerService extends ScalarFunction {
    public GetYearMonthList(dDate: Date, dateType: number): ICalendarViewVM {
        let cViewModel: ICalendarViewVM = <ICalendarViewVM>{};
        cViewModel.Calendar = this.GetCalendar(dDate, dateType);
         
        return cViewModel;
    }

    getInputDate(date: Date): IInputDateVM {
        return <IInputDateVM>{
            Year: date.getFullYear(),
            Month: date.getMonth() + 1,
            Date: date.getDate()
        };
    }

    public DateByYearMonthChange(dateType: number, year: number, month: number, day?: number): ICalendarVM {
        let DType: eDateType = dateType;
        let dDate: Date;

        if (day == null) {
            day = 1
        }

        if (DType == eDateType.DateTypeAD) {
            dDate = new Date(year, month - 1, day);
        }
        else {
            dDate = this.GetDateAD(year, month, day);
        }
        let DTO: ICalendarVM = this.GetCalendar(dDate, dateType);
        return DTO;
    }

    public MinDate(minDate: Date, currentDate: Date, dateType: number): ICountDaysVM[] {
        let dlist: ICountDaysVM[] = [];
        let CurrentDay: number = 0;
        let cModel: ICalendarVM = <ICalendarVM>{};

        cModel.DateType = dateType;

        if (cModel.DateType == eDateType.DateTypeAD) {
            if (currentDate > minDate) {
                CurrentDay = minDate.getDate();
                if (minDate.getMonth() == currentDate.getMonth() && minDate.getFullYear() == currentDate.getFullYear()) {
                    for (let i = CurrentDay - 1; i >= 1; i--) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
            }
            else {

                if (minDate.getMonth() == currentDate.getMonth() && minDate.getFullYear() == currentDate.getFullYear()) {
                    CurrentDay = minDate.getDate();
                    for (let i = CurrentDay - 1; i >= 1; i--) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
                else {

                    let month: number = currentDate.getMonth() + 1;
                    let year: number = currentDate.getFullYear();
                    let days: number = new Date(year, month, 0).getDate();
                    //  CurrentDay = minDate.Day;
                    for (let i = CurrentDay - 1; i >= 1; i--) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
            }
            return dlist;
        }
        else {
            if (currentDate > minDate) {

                let DateBS: string = this.GetDateBS(minDate);
                CurrentDay = this.GetBSDay(DateBS);
                for (let i = CurrentDay - 1; i >= 1; i--) {
                    let d: ICountDaysVM = <ICountDaysVM>{};
                    d.days = i;
                    dlist.push(d);
                }
            }
            else {

                if (minDate.getMonth() == currentDate.getMonth() && minDate.getFullYear() == currentDate.getFullYear()) {
                    let DateBS: string = this.GetDateBS(minDate);
                    CurrentDay = this.GetBSDay(DateBS);
                    for (let i = CurrentDay - 1; i >= 1; i--) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
                else {
                    let DateBS: string = this.GetDateBS(currentDate);
                    CurrentDay = this.GetDaysInMonthBS(DateBS);
                    for (let i = CurrentDay - 1; i >= 1; i--) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
            }

            return dlist;
        }
    }

    public MaxDate(maxDate: Date, currentDate: Date, dateType: number): ICountDaysVM[] {
        let dlist: ICountDaysVM[] = [];
        let CurrentDay: number = 0;
        let cModel: ICalendarVM = <ICalendarVM>{};
        cModel.DateType = dateType;
        let days: number;

        if (cModel.DateType == eDateType.DateTypeAD) {
            let month: number = maxDate.getMonth();
            let year: number = maxDate.getFullYear();
            CurrentDay = maxDate.getDate();
            days = new Date(year, month + 1, 0).getDate();

            if (currentDate < maxDate) {
                if (maxDate.getMonth() == currentDate.getMonth() && maxDate.getFullYear() == currentDate.getFullYear()) {
                    for (let i = CurrentDay + 1; i <= days; i++) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
            }
            else {
                if (maxDate.getMonth() == currentDate.getMonth() && maxDate.getFullYear() == currentDate.getFullYear()) {
                    for (let i = CurrentDay + 1; i <= days; i++) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
                else {
                    let month: number = currentDate.getMonth() + 1;
                    let year: number = currentDate.getFullYear();
                    CurrentDay = new Date(year, month, 0).getDate();
                    for (let i = CurrentDay; i >= 1; i--) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
            }
        }
        else {
            let DateBS: string = this.GetDateBS(maxDate);
            CurrentDay = this.GetBSDay(DateBS);
            days = this.GetDaysInMonthBS(DateBS);
            //maxDate = this.GetDateBS(maxDate);

            if (currentDate < maxDate) {
                if (maxDate.getMonth() == currentDate.getMonth() && maxDate.getFullYear() == currentDate.getFullYear()) {
                    //  CurrentDay = minDate.Day;
                    for (let i = CurrentDay + 1; i <= days; i++) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
            }
            else {
                if (maxDate.getMonth() == currentDate.getMonth() && maxDate.getFullYear() == currentDate.getFullYear()) {
                    for (let i = CurrentDay + 1; i <= days; i++) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
                else {
                    DateBS = this.GetDateBS(currentDate);
                    CurrentDay = this.GetDaysInMonthBS(DateBS);
                    for (let i = CurrentDay; i >= 1; i--) {
                        let d: ICountDaysVM = <ICountDaysVM>{};
                        d.days = i;
                        dlist.push(d);
                    }
                }
            }
        }
        return dlist;
    }

    public GetCalendar(dDate: Date, dateType: number): ICalendarVM {
        let cModel: ICalendarVM = <ICalendarVM>{};
        let DateBS: string = '';

        cModel.Date = dDate;
        cModel.DateType = dateType;
        if (cModel.DateType == eDateType.DateTypeAD) {
            cModel.CurrentDay = dDate.getDate();
            cModel.CurrentMonth = dDate.getMonth() + 1;
            cModel.CurrentYear = dDate.getFullYear();
        }
        else {
            DateBS = this.GetDateBS(dDate);
            cModel.CurrentDay = this.GetBSDay(DateBS);
            cModel.CurrentMonth = this.GetBSMonth(DateBS);
            cModel.CurrentYear = this.GetBSYear(DateBS);
        }
        cModel.FirstDayOfWeek = this.GetFirstWeekDayOfMonth(dDate, cModel.DateType);
        cModel.NoOfDays = this.GetDaysInMonth(dDate, cModel.DateType);
        cModel.NoOfWeeks = this.GetDisplayWeek(dDate, cModel.DateType);

        return cModel;
    }

    // Start: Date BS
    public GetDateBS(dDate: Date): string {
        let bsDate: string = this.FGetDateBS(dDate);
        return bsDate;
    }

    public GetBSYear(dateBS: string): number {
        let bsYear: number = this.FGetBSYear(dateBS);
        return bsYear;
    }

    public GetBSMonth(dateBS: string): number {
        let bsMonth: number = this.FGetBSMonth(dateBS);
        return bsMonth;
    }

    public GetBSDay(dateBS: string): number {
        let bsDay: number = this.FGetBSDay(dateBS);
        return bsDay;
    }

    // Get Days In month And WeekDays
    public GetDisplayWeek(dDateAd: Date, dateType: eDateType): number {
        let DaysInMonth: number;
        let WeekDay: number;
        if (dateType == eDateType.DateTypeAD) {
            DaysInMonth = this.GetDaysInMonth(dDateAd, eDateType.DateTypeAD);
        }
        else {
            DaysInMonth = this.GetDaysInMonth(dDateAd, eDateType.DateTypeBS);
        }
        WeekDay = this.GetFirstWeekDayOfMonth(dDateAd, dateType);
        let Week: number = Number((((DaysInMonth + WeekDay - 1) % 7) == 0) ? (DaysInMonth + WeekDay - 1) / 7 : (((DaysInMonth + WeekDay - 1) / 7) + 1));

        return Week;
    }

    public GetDaysInMonth(dDateAD: Date, dateType: eDateType): number {
        let DateBS: string;
        if (dateType == eDateType.DateTypeBS) {
            DateBS = this.GetDateBS(dDateAD);
            return this.GetDaysInMonthBS(DateBS);
        }
        else {
            return new Date(dDateAD.getFullYear(), dDateAD.getMonth() + 1, 0).getDate();
        }
    }

    public GetDaysInMonthBS(dateBS: string): number {
        let year: number;
        let month: number;

        year = this.GetBSYear(dateBS);
        month = this.GetBSMonth(dateBS);
        return this.GetDaysInMonthByYearAndMonth(year, month);

    }

    public GetDaysInMonthByYearAndMonth(year: number, month: number): number {
        let daysInMonth: number = this.FGetDaysInMonth(year, month);
        return daysInMonth;
    }

    public GetFirstWeekDayOfMonth(dDateAD: Date, dateType: eDateType): number {
        let DateBS: string;
        let year: number;
        let month: number;

        if (dateType == eDateType.DateTypeAD) {
            dDateAD = new Date(dDateAD.getFullYear(), dDateAD.getMonth(), 1);
        }
        else {
            DateBS = this.GetDateBS(dDateAD);
            year = this.GetBSYear(DateBS);
            month = this.GetBSMonth(DateBS);
            dDateAD = this.GetDateAD(year, month, 1);
        }
        let DOfWeek: number = dDateAD.getDay() + 1;
        return DOfWeek;
    }

    // Get valid date
    public GetDateAD(year: number, month: number, day: number): Date {
        let dateAd: Date;
        dateAd = this.FGetDateAD(year, month, day);
        return dateAd;
    }

    public GetDateBSAndAD(dDate: Date): IDateVM {
        let dModel: IDateVM = <IDateVM>{
            Date: dDate.toString(),
            DateAD: this.GetFormatedDateAd(dDate),
            DateBS: this.GetDateBS(dDate)
        };
        return dModel;
    }

    public GetDate(dateType: number, year: number, month: number, day: number): IDateVM {
        let dModel: IDateVM = <IDateVM>{};
        let DType: eDateType = dateType;
        let dDate: Date;
        if (DType == eDateType.DateTypeAD) {
            dDate = new Date(year, month - 1, day);
        }
        else {
            dDate = this.GetDateAD(year, month, day);
        }

        dModel.Date = dDate.toString();
        dModel.DateAD = this.GetFormatedDateAd(dDate);
        dModel.DateBS = this.GetDateBS(dDate);
        return dModel;
    }

    public CheckDate(dtString: string, dtType: eDateType): IDateVM {
        let date: string[] = dtString.split('-');
        let year: number = 0;
        let month: number = 0;
        let day: number = 0;
        let dModel: IDateVM = <IDateVM>{};

        if (date.length == 3) {
            if (dtType == eDateType.DateTypeAD) {
                if (Number(localStorage.getItem('Param.DefaultFormatAD')) == eDateFormat['dd-MM-yyyy']) {
                    day = Number(date[0]);
                    month = Number(date[1]);
                    year = Number(date[2]);
                }
                else if (Number(localStorage.getItem('Param.DefaultFormatAD')) == eDateFormat['MM-dd-yyyy']) {
                    month = Number(date[0]);
                    day = Number(date[1]);
                    year = Number(date[2]);
                }
                else if (Number(localStorage.getItem('Param.DefaultFormatAD')) == eDateFormat['yyyy-dd-MM']) {
                    year = Number(date[0]);
                    day = Number(date[1]);
                    month = Number(date[2]);
                }
                else if (Number(localStorage.getItem('Param.DefaultFormatAD')) == eDateFormat['yyyy-MM-dd']) {
                    year = Number(date[0]);
                    month = Number(date[1]);
                    day = Number(date[2]);
                }
            }
            else {
                if (dtType == eDateType.DateTypeBS) {
                    if (Number(localStorage.getItem('Param.DefaultFormatBS')) == eDateFormat['dd-MM-yyyy']) {
                        day = Number(date[0]);
                        month = Number(date[1]);
                        year = Number(date[2]);
                    }
                    else if (Number(localStorage.getItem('Param.DefaultFormatBS')) == eDateFormat['MM-dd-yyyy']) {
                        month = Number(date[0]);
                        day = Number(date[1]);
                        year = Number(date[2]);
                    }
                    else if (Number(localStorage.getItem('Param.DefaultFormatBS')) == eDateFormat['yyyy-dd-MM']) {
                        year = Number(date[0]);
                        day = Number(date[1]);
                        month = Number(date[2]);
                    }
                    else if (Number(localStorage.getItem('Param.DefaultFormatBS')) == eDateFormat['yyyy-MM-dd']) {
                        year = Number(date[0]);
                        month = Number(date[1]);
                        day = Number(date[2]);
                    }
                }
            }

            try {
                dModel = this.GetDate(Number(dtType), year, month, day);
            }
            catch (err) {
                dModel = this.GetDate(Number(eDateType.DateTypeAD), new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
            }
            return dModel;
        }
    }

    // Formated Date
    public GetFormatedDateAd(dDateAD: Date): string {
        let Result: string = '';
        let Day: string;
        let month: string;
        let year: string;
        let dateFormat: eDateFormat = Number(localStorage.getItem('Param.DefaultFormatAD'));

        year = dDateAD.getFullYear().toString();
        month = (dDateAD.getMonth() + 1).toString();
        Day = dDateAD.getDate().toString();

        if (month.length == 1) {
            month = "0" + month;
        }
        if (Day.length == 1) {
            Day = "0" + Day;
        }

        if (dateFormat == eDateFormat['dd-MM-yyyy']) {
            Result = Day + "-" + month + "-" + year;
        }
        else if (dateFormat == eDateFormat['MM-dd-yyyy']) {
            Result = month + "-" + Day + "-" + year;
        }
        else if (dateFormat == eDateFormat['yyyy-dd-MM']) {
            Result = year + "-" + Day + "-" + month;
        }
        else {
            Result = year + "-" + month + "-" + Day;
        }
        return Result;
    }

}
