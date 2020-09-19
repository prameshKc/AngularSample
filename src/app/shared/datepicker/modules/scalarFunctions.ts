import { NDateD, BSADCal } from '../models/datepickerDataStore';
import { INDateD, INMothCal } from '../models/dateModel';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScalarFunction {
  public FGetNMonthCal(NYear: number): INMothCal[] {
    const newNDateD: INMothCal[] = [];
    const selectedNDateD: INDateD = NDateD.filter(x => x.NYear == NYear)[0];
    let days = 0;

    days = days + selectedNDateD.M1;
    newNDateD.push({ Month: 1, Days: days });
    days = days + selectedNDateD.M2;
    newNDateD.push({ Month: 2, Days: days });
    days = days + selectedNDateD.M3;
    newNDateD.push({ Month: 3, Days: days });
    days = days + selectedNDateD.M4;
    newNDateD.push({ Month: 4, Days: days });
    days = days + selectedNDateD.M5;
    newNDateD.push({ Month: 5, Days: days });
    days = days + selectedNDateD.M6;
    newNDateD.push({ Month: 6, Days: days });
    days = days + selectedNDateD.M7;
    newNDateD.push({ Month: 7, Days: days });
    days = days + selectedNDateD.M8;
    newNDateD.push({ Month: 8, Days: days });
    days = days + selectedNDateD.M9;
    newNDateD.push({ Month: 9, Days: days });
    days = days + selectedNDateD.M10;
    newNDateD.push({ Month: 10, Days: days });
    days = days + selectedNDateD.M11;
    newNDateD.push({ Month: 11, Days: days });
    days = days + selectedNDateD.M12;
    newNDateD.push({ Month: 12, Days: days });

    return newNDateD;
  }

  public FGetBSDay(NDate: string) {
    let Result: number;
    let DTFormat: number;
    DTFormat = localStorage.getItem('Param.DefaultFormatBS') ? Number(localStorage.getItem('Param.DefaultFormatBS')) : 1;

    const NDateArray: string[] = NDate.split('-');

    switch (DTFormat) {
      case 1: // ddmmyyyy
        Result = Number(NDateArray[0]);
        break;
      case 2: // mmddyyyy
        Result = Number(NDateArray[1]);
        break;
      case 3: // yyyyddmm
        Result = Number(NDateArray[1]);
        break;
      case 4: // yyyymmdd
        Result = Number(NDateArray[2]);
        break;
    }
    return Result;
  }

  public FGetBSMonth(NDate: string) {
    let Result: number;
    let DTFormat: number;
    DTFormat = localStorage.getItem('Param.DefaultFormatBS') ? Number(localStorage.getItem('Param.DefaultFormatBS')) : 1;

    const NDateArray: string[] = NDate.split('-');

    switch (DTFormat) {
      case 1: // ddmmyyyy
        Result = Number(NDateArray[1]);
        break;
      case 2: // mmddyyyy
        Result = Number(NDateArray[0]);
        break;
      case 3: // yyyyddmm
        Result = Number(NDateArray[2]);
        break;
      case 4: // yyyymmdd
        Result = Number(NDateArray[1]);
        break;
    }
    return Result;
  }

  public FGetBSYear(NDate: string) {
    let Result: number;
    let DTFormat: number;
    DTFormat = localStorage.getItem('Param.DefaultFormatBS') ? Number(localStorage.getItem('Param.DefaultFormatBS')) : 1;

    const NDateArray: string[] = NDate.split('-');

    switch (DTFormat) {
      case 1: // ddmmyyyy
        Result = Number(NDateArray[2]);
        break;
      case 2: // mmddyyyy
        Result = Number(NDateArray[2]);
        break;
      case 3: // yyyyddmm
        Result = Number(NDateArray[0]);
        break;
      case 4: // yyyymmdd
        Result = Number(NDateArray[0]);
        break;
    }
    return Result;
  }

  public FGetDateBS(EngDate: Date): string {
    let StartDateYear: Date;
    let NYear: number;
    let NMonth: number;
    let NDay: number;
    const DF: number = localStorage.getItem('Param.DefaultFormatBS') ? Number(localStorage.getItem('Param.DefaultFormatBS')) : 1;

    let currentYear = BSADCal.filter(x => this.getZeroTime(new Date(x.EndDate)) >= this.getZeroTime(EngDate) && this.getZeroTime(new Date(x.StartDate)) <= this.getZeroTime(EngDate));

    StartDateYear = new Date(currentYear[0].StartDate);
    NYear = currentYear[0].NYear;
    const totdays: number = this.FGetDiff(EngDate, StartDateYear) + 1;
    let monthCal = this.FGetNMonthCal(NYear);
    NMonth = monthCal.filter(x => x.Days >= totdays)[0].Month;
    if (monthCal.filter(x => x.Days < totdays).length > 0) {
      NDay = totdays - monthCal.filter(x => x.Days < totdays).reverse()[0].Days;
    } else {
      NDay = totdays;
    }
    return this.FGetFormatedDate(NYear, NMonth, NDay, DF);
  }

  public getZeroTime(date: Date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
  }

  public FGetDateAD(NYear: number, NMonth: number, NDay: number): Date {
    let startdate: Date = new Date();
    let totdays = 0;

    if (
      NDateD.filter(x => x.NYear == NYear).length == 0 &&
      NMonth < 1 && NMonth > 12 &&
      this.FGetDaysInMonth(NYear, NMonth) < NDay &&
      BSADCal.filter(x => x.NYear == NYear).length == 0
    ) {
      return null;
    }

    startdate = new Date(BSADCal.filter(x => x.NYear == NYear)[0].StartDate);
    let listMonth: INMothCal[] = this.FGetNMonthCal(NYear).filter(x => x.Month < NMonth);
    totdays = listMonth.length > 0 ? listMonth.reverse()[0].Days : 0;
    totdays = totdays ? totdays : 0;
    totdays = totdays + NDay - 1;
    totdays = (totdays * 24 * 3600 * 1000);
    totdays += startdate.getTime();

    startdate.setTime(totdays);
    return startdate;
  }

  public FGetDateADByDateBS(DateBS: string): Date {
    let startdate: Date;
    let totdays = 0;
    const NYear: number = this.FGetBSYear(DateBS);
    const NMonth: number = this.FGetBSMonth(DateBS);
    const NDay: number = this.FGetBSDay(DateBS);

    if (
      NDateD.filter(x => x.NYear == NYear).length == 0 &&
      NMonth < 1 && NMonth > 12 &&
      this.FGetDaysInMonth(NYear, NMonth) < NDay
    ) {
      return null;
    }

    startdate = new Date(BSADCal.filter(x => x.NYear == NYear)[0].StartDate);
    totdays = this.FGetNMonthCal(NYear).filter(x => x.Month == NMonth)[0].Days;
    totdays = totdays + NDay - 1;
    totdays = (totdays * 24 * 3600 * 1000);
    totdays += startdate.getTime();

    startdate.setTime(totdays);
    return startdate;
  }

  public FGetDateADOfMonthStartEnd(NDate: string, IsStart: boolean) {
    const BSYear: number = this.FGetBSYear(NDate);
    const BSMonth: number = this.FGetBSMonth(NDate);
    const BSDay: number = this.FGetBSDay(NDate);

    let DaysInMonth = 0;
    let DateAD: Date = new Date();

    if (IsStart) {
      DateAD = this.FGetDateAD(BSYear, BSMonth, 1);
    } else {
      DaysInMonth = this.FGetDaysInMonth(BSYear, BSMonth);
      DateAD = this.FGetDateAD(BSYear, BSMonth, DaysInMonth);
    }

    return DateAD;
  }

  public FGetDaysInMonth(NYear: number, NMonth: number): number {
    switch (NMonth) {
      case 1:
        return NDateD.filter(x => x.NYear == NYear)[0].M1;
      case 2:
        return NDateD.filter(x => x.NYear == NYear)[0].M2;
      case 3:
        return NDateD.filter(x => x.NYear == NYear)[0].M3;
      case 4:
        return NDateD.filter(x => x.NYear == NYear)[0].M4;
      case 5:
        return NDateD.filter(x => x.NYear == NYear)[0].M5;
      case 6:
        return NDateD.filter(x => x.NYear == NYear)[0].M6;
      case 7:
        return NDateD.filter(x => x.NYear == NYear)[0].M7;
      case 8:
        return NDateD.filter(x => x.NYear == NYear)[0].M8;
      case 9:
        return NDateD.filter(x => x.NYear == NYear)[0].M9;
      case 10:
        return NDateD.filter(x => x.NYear == NYear)[0].M10;
      case 11:
        return NDateD.filter(x => x.NYear == NYear)[0].M11;
      case 12:
        return NDateD.filter(x => x.NYear == NYear)[0].M12;
      default:
        return 0;
    }
  }

  public FGetDaysInMonthAD(Year: number, Month: number): number {
    let DIM: number;
    const newDate: Date = new Date(Year, Month, 1);
    const date1: Date = newDate;
    date1.setDate(1 - date1.getDate());

    const date2: Date = newDate;
    date2.setDate(1 - date2.getDate());

    DIM = (1 + this.FGetAdd(date2, newDate)) - this.FGetAdd(date1, newDate);

    return DIM;
  }

  public FGetFormatedDate(Year: number, Month: number, Day: number, DTFormat: number): string {
    const CYear: string = Year.toString();
    const CMonth: string = (Month < 10) ? '0' + Month : Month.toString();
    const CDay: string = (Day < 10) ? '0' + Day : Day.toString();

    switch (DTFormat) {
      case 1: // ddmmyyyy
        return CDay + '-' + CMonth + '-' + CYear;
      case 2: // mmddyyyy
        return CMonth + '-' + CDay + '-' + CYear;
      case 3: // yyyyddmm
        return CYear + '-' + CDay + '-' + CMonth;
      case 4: // yyyymmdd
        return CYear + '-' + CMonth + '-' + CDay;
      default: // ddmmyyyy
        return CDay + '-' + CMonth + '-' + CYear;
    }
  }

  public FGETNDAYS(Year: number) {
    let totdays = 0;
    NDateD.filter(x => x.NYear < Year).forEach(item => {
      totdays += item.M1 + item.M2 + item.M3 + item.M4 + item.M5 + item.M6;
      totdays += item.M7 + item.M8 + item.M9 + item.M10 + item.M11 + item.M12;
    });

    return totdays;
  }

  FGetDiff(date1: Date, date2: Date): number {
    const timeDiff = date2.getTime() - date1.getTime();
    return Math.round(Math.abs(timeDiff / (1000 * 3600 * 24)));
  }

  FGetAdd(date1: Date, date2: Date): number {
    const timeAdd = date2.getTime() + date1.getTime();
    return Math.ceil(Math.abs(timeAdd / (1000 * 3600 * 24)));
  }
}
