export interface IDateVM {
    Date?: string;
    DateAD?: string;
    DateBS?: string;
}
export interface ISelectListItemVM {
    value: string;
    Text: string;
    Selected: string;
}
export interface IDateRangeVM {
    FromDate: string;
    ToDate: string;
    FromDateAD: string;
    ToDateAD: string;
    FromDateBS: string;
    ToDateBS: string;
    RangeListL: string[];
    RangeList: IDateRangeVM[];
}
export interface ICalendarVM {
    Date: Date;
    DateType: eDateType;
    FirstDayOfWeek: number;
    CurrentDay: number;
    CurrentMonth: number;
    CurrentYear: number;
    NoOfDays: number;
    NoOfWeeks: number;
    MinDays: ICountDaysVM[];
    MaxDays: ICountDaysVM[];
    MonthWeeks: IWeekVM[];
}
export interface IWeekVM {
    Value: number;
    Days?: IDayVM[];
}
export interface IDayVM {
    Value: number;
    State: string;
    Selected: string;
    StatusId?: number;
    OtherVariables?: any;
}
export interface ICountDaysVM {
    days: number;
}
export interface ICalendarViewVM {
    MonthList: ISelectListItemVM[];
    YearList: ISelectListItemVM[];
    Calendar: ICalendarVM;
    DaysModel: ICountDaysVM[];
}
export interface ICalendarRangeVM {
    FromRange: ICalendarViewVM;
    ToRange: ICalendarViewVM;

    FromDate: string;
    ToDate: string;

    FromDateBS: string;
    ToDateBS: string;

    EnglishDateFrom: Date;
    EnglishDateTo: Date;

    MinDate: Date;
    Maxdate: Date;
}
export enum eDateType {
    Default = 0,
    DateTypeAD = 1,
    DateTypeBS = 2
}
export enum eDateFormat {
    'dd-MM-yyyy' = 1,
    'MM-dd-yyyy' = 2,
    'yyyy-dd-MM' = 3,
    'yyyy-MM-dd' = 4
}
export interface IDatePickerOptionsVM {
    closeOnDateSelect: boolean;
    dateType?: number;
    minDate?: IInputDateVM;
    maxDate?: IInputDateVM;
}
export interface IInputDateVM {
    Year: number;
    Month: number;
    Date: number;
}
