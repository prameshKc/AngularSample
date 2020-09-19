import { Component, Injectable, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { IDateVM, IDatePickerOptionsVM, ICalendarVM, ICalendarViewVM, IInputDateVM, eDateFormat } from '../datepicker/models/datepickerVM';
import { DatePickerFunctions } from '../datepicker/modules/datepickerFunctions';

import { IMonthsEngNep } from '../datepicker/models/dateModel';
import { IMonths } from '../datepicker/models/datepickerDataStore';

import { ParamService } from '../../services/BaseService';
import { IParam } from '../../models/Models';
import { ModalDirective } from 'ngx-bootstrap';
import { DATE } from 'ngx-bootstrap/chronos/units/constants';

@Component({
    selector: 'chaNepaliDatePicker',
    templateUrl: './chaNepaliDatePicker.html',
    styleUrls: ['./chaNepaliDatePicker.css'],
})
export class ChaNepaliDatePickerComponent implements OnChanges {
  @ViewChild('dateModal', { static: false }) public dateModal: ModalDirective;

    @Input() inputDate?: any;
    @Input() inputDatePickerOptions: IDatePickerOptionsVM;

    @Output() inputDateChange?: EventEmitter<IInputDateVM> = new EventEmitter<IInputDateVM>();

    @Output() selectedDate: EventEmitter<IInputDateVM> = new EventEmitter<IInputDateVM>();

    showModal: boolean = false;
    calendarData: ICalendarVM = <ICalendarVM>{};
    calendarFunctions: DatePickerFunctions;

    months: IMonthsEngNep[] = IMonths;
    years: number[] = [];

    defaultDate: IInputDateVM = this.datePickerService.getInputDate(new Date());

    defaultDatePickerOptions: IDatePickerOptionsVM = {
        closeOnDateSelect: false,
        dateType: 1,
        minDate: null,
        maxDate: null
    };

    currentDate: IInputDateVM = <IInputDateVM>{};
    tempDate: IInputDateVM = <IInputDateVM>{};
    dateADAndBS: IDateVM = <IDateVM>{};
    calendarBody: ICalendarViewVM;
    calendar: ICalendarVM = null;

    dateText: string;
    dateType: number;
    counter: number = 0;
    messageErr: string = null;

    datePickerToggle: boolean = null;

    formatParamAD: string;
    formatArrayAD: string[];

    formatParamBS: string;
    formatArrayBS: string[];

    constructor(
        private datePickerService: DatePickerFunctions,
        private paramService: ParamService
    ) {
    }

    ngOnInit() {
        if (this._isValidDate(this.inputDate)) {
            let date: Date = this.inputDate;
            this.inputDate = this.datePickerService.getInputDate(date);
        }
        this.inputDateChange.emit(this.inputDate);
        this.selectedDate.emit(this.inputDate);
    }

    _isValidDate(value) {
        var dateWrapper = new Date(value);
        return !isNaN(dateWrapper.getDate());
    }

    ngOnChanges(changes: SimpleChanges) {
        let newChanges: any = changes;

        this.checkValidinputDate();
        this.checkValidDatePickerOptions();

        this.currentDate = Object.assign({}, this.inputDate);
        this.tempDate = Object.assign({}, this.inputDate);

        if (newChanges.inputDate.currentValue) {
            let x = newChanges.inputDate.currentValue ? new Date(newChanges.inputDate.currentValue.Year, newChanges.inputDate.currentValue.Month, newChanges.inputDate.currentValue.Date, 0, 0, 0) : null;
            let y = newChanges.inputDate.previousValue ? new Date(newChanges.inputDate.previousValue.Year, newChanges.inputDate.previousValue.Month, newChanges.inputDate.previousValue.Date, 0, 0, 0) : null;
            if (x != y) {
                if (this.dateType == null) {
                    this.dateType = Number(localStorage.getItem('Param.DateType'));

                    this.formatParamAD = eDateFormat[Number(localStorage.getItem('Param.DefaultFormatAD'))];

                    this.formatParamBS = eDateFormat[Number(localStorage.getItem('Param.DefaultFormatBS'))];

                    if (this.dateType != null && this.formatParamAD != null && this.formatParamBS != null) {
                        this.formatArrayAD = this.formatParamAD.split('-');
                        this.formatArrayBS = this.formatParamBS.split('-');
                        this.getDateHandler();
                    } else {
                        this.getDefaultFormat();
                    }
                } else {
                    this.getDateHandler();
                }
            }
        } else {
            this.getDefaultFormat();
        }
    }

    getDateHandler() {
        this.dateADAndBS = this.datePickerService.getDate(this.currentDate.Year, this.currentDate.Month, this.currentDate.Date, 1);
        this.setDateText();
        this.getCalendar(this.currentDate.Year, this.currentDate.Month);
    }

    /**
     * to open modal
     */
    openModal() {
        this.showModal = true;
        this.dateModal.config = {
            backdrop: false,
            ignoreBackdropClick: false
        }

        this.dateModal.show();
    }

    /**
     * to close modal
     */
    closeModal() {
        this.showModal = false;
        this.dateModal.config = {
            backdrop: false,
            ignoreBackdropClick: false
        }

        this.dateModal.hide();
    }

    getDefaultFormat(dateType?: number) {
        if (
            localStorage.getItem('Param.DateType') &&
            localStorage.getItem('Param.DefaultFormatAD') &&
            localStorage.getItem('Param.DefaultFormatBS')
        ) {
            this._setSVFormats();
        } else {
            this.paramService.getAll("$expand=ParamValue&$filter=PId eq 13 or PId eq 14 or PId eq 12").subscribe((data: IParam[]) => {
                if (data.length != 0) {
                    localStorage.setItem('Param.DateType', data.filter(x => x.PId == 12)[0].ParamValue.PValue);
                    localStorage.setItem('Param.DefaultFormatAD', data.filter(x => x.PId == 13)[0].ParamValue.PValue);
                    localStorage.setItem('Param.DefaultFormatBS', data.filter(x => x.PId == 14)[0].ParamValue.PValue);
                }

                this._setSVFormats();
            });
        }
    }

    _setSVFormats() {
        this.formatParamAD = eDateFormat[parseInt(localStorage.getItem('Param.DefaultFormatAD'))];
        this.formatArrayAD = this.formatParamAD.split('-');

        this.formatParamBS = eDateFormat[parseInt(localStorage.getItem('Param.DefaultFormatBS'))];
        this.formatArrayBS = this.formatParamBS.split('-');

        this.dateType = parseInt(localStorage.getItem('Param.DateType'));
        this.defaultDatePickerOptions.dateType = this.dateType;

        //this.getDateBSAndAD(this.currentDate);
        this.getDateHandler();

    }

    getDateBSAndAD(date: IInputDateVM) {
        try {
            this.dateADAndBS = this.datePickerService.getDate(date.Year, date.Month, date.Date, this.dateType);
            this.setDateText();
            this.messageErr = null;
            this.getCalendar(date.Year, date.Month);
        } catch (err) {
            if (this.dateType == 1) {
                this.inputDateChange.emit(this.inputDate);
                this.selectedDate.emit(null);
                this.messageErr = `Please check the date format (${this.formatParamAD}) and try again.`;
            } else {
                this.inputDateChange.emit(this.inputDate);
                this.selectedDate.emit(null);
                this.messageErr = `Please check the date format (${this.formatParamBS}) and try again.`;
            }
        };
    }

    setDateText() {
        let newDate: string[];
        let returnDate: IInputDateVM;
        if (this.dateType == 1) {
            this.dateText = this.dateADAndBS.DateAD;

            newDate = this.dateADAndBS.DateAD.split('-');
            returnDate = {
                Year: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('yyyy'))]),
                Month: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('MM'))]),
                Date: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('dd'))])
            };

        } else {
            this.dateText = this.dateADAndBS.DateBS;

            newDate = this.dateADAndBS.DateBS.split('-');
            returnDate = {
                Year: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('yyyy'))]),
                Month: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('MM'))]),
                Date: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('dd'))])
            };
        };
        Object.assign(this.currentDate, returnDate);
        Object.assign(this.tempDate, returnDate);
    }

    dateTypeToggle() {
        this.dateType = this.dateType == 1 ? 2 : 1;
        this.setDateText();
        this.getCalendar(this.currentDate.Year, this.currentDate.Month);
    }

    getCalendar(year?: number, month?: number) {
        let minDate: Date;
        if (this.inputDatePickerOptions.minDate) {
            minDate = new Date(this.inputDatePickerOptions.minDate.Year, this.inputDatePickerOptions.minDate.Month - 1, this.inputDatePickerOptions.minDate.Date);
        }

        let maxDate: Date;
        if (this.inputDatePickerOptions.maxDate) {
            maxDate = new Date(this.inputDatePickerOptions.maxDate.Year, this.inputDatePickerOptions.maxDate.Month - 1, this.inputDatePickerOptions.maxDate.Date);
        }

        if (year && month) {
            if (this.currentDate.Year == year && this.currentDate.Month == month) {
                this.calendar = this.datePickerService.getDateByYearMonthChange(this.dateType, year, month, this.currentDate.Date, minDate, maxDate);
            } else {
                this.calendar = this.datePickerService.getDateByYearMonthChange(this.dateType, year, month, 1, minDate, maxDate);
            }
        } else {
            this.calendar = this.datePickerService.getDateByYearMonthChange(this.dateType, this.currentDate.Year, this.currentDate.Month, this.currentDate.Date, minDate, maxDate);
        }

        this.setCalendar(minDate, maxDate);

        this.years = [];
        for (let i = this.calendar.CurrentYear - 50; i <= this.calendar.CurrentYear + 50; i++) {
            this.years.push(i);
        }

        let selectedDate: IInputDateVM = this.datePickerService.getInputDate(new Date(this.dateADAndBS.Date));

        if (JSON.stringify(this.inputDate) != JSON.stringify(selectedDate)) {
            this.inputDateChange.emit(this.inputDate);
            this.selectedDate.emit(selectedDate);
        }
    }

    getPrevMonthCalendarData(Month?: number) {
        this.tempDate.Year = (Number(Month) - 1) >= 1 ? Number(this.tempDate.Year) : Number(this.tempDate.Year) - 1;
        this.tempDate.Month = (Number(Month) - 1) >= 1 ? Number(Month) - 1 : 12;
        this.getCalendar(this.tempDate.Year, this.tempDate.Month);
    }

    getNextMonthCalendarData(Month?: number) {
        this.tempDate.Year = (Number(Month) + 1) <= 12 ? Number(this.tempDate.Year) : Number(this.tempDate.Year) + 1;
        this.tempDate.Month = (Number(Month) + 1) <= 12 ? Number(Month) + 1 : 1;
        this.getCalendar(this.tempDate.Year, this.tempDate.Month);
    }

    setCalendar(minDate: Date, maxDate: Date) {
        this.calendar.MonthWeeks = [];
        let counter: number = 0;
        for (let i = 0; i < 6; i++) {
            if (i == 0) {
                this.calendar.MonthWeeks[i] = {
                    Value: i,
                    Days: []
                }

                for (let j = this.calendar.FirstDayOfWeek - 1; j < 7; j++) {
                    counter++;
                    let state: string;

                    if (this.inputDatePickerOptions.minDate != null || this.inputDatePickerOptions.maxDate != null) {
                    } else {
                        if (this.calendar.MinDays.filter(x => x.days == counter).length > 0 || this.calendar.MaxDays.filter(x => x.days == counter).length > 0) {
                            state = 'disabled'
                        }
                    }

                    this.calendar.MonthWeeks[i].Days[j] = {
                        Value: counter,
                        State: state,
                        Selected: (this.currentDate.Year == this.calendar.CurrentYear && this.currentDate.Month == this.calendar.CurrentMonth && this.currentDate.Date == counter) ? 'selected' : ''
                    };
                }
            } else {
                this.calendar.MonthWeeks[i] = {
                    Value: i,
                    Days: []
                }
                for (let j = 0; j < 7; j++) {
                    if (counter < this.calendar.NoOfDays) {
                        counter++;
                        let state: string;

                        if (this.calendar.MinDays.filter(x => x.days == counter).length > 0 || this.calendar.MaxDays.filter(x => x.days == counter).length > 0) {
                            state = 'disabled'
                        }

                        this.calendar.MonthWeeks[i].Days[j] = {
                            Value: counter,
                            State: state,
                            Selected: (this.currentDate.Year == this.calendar.CurrentYear && this.currentDate.Month == this.calendar.CurrentMonth && this.currentDate.Date == counter) ? 'selected' : ''
                        };
                    }
                }
            }
        }
    }

    checkValidinputDate() {
        if (!this.inputDate) {
            this.inputDate = this.defaultDate;
        } else {
            if (!(this.inputDate.Year || this.inputDate.Month || this.inputDate.Date)) {
                this.inputDate = this.datePickerService.getInputDate(new Date());
            }
        }
    }

    checkValidDatePickerOptions() {
        if (!this.inputDatePickerOptions) {
            this.inputDatePickerOptions = this.defaultDatePickerOptions;
        } else {
            this.inputDatePickerOptions.closeOnDateSelect = this.inputDatePickerOptions.closeOnDateSelect == null ? this.defaultDatePickerOptions.closeOnDateSelect : this.inputDatePickerOptions.closeOnDateSelect;
            this.inputDatePickerOptions.dateType = this.inputDatePickerOptions.dateType == null ? this.defaultDatePickerOptions.dateType : this.inputDatePickerOptions.dateType;
            this.inputDatePickerOptions.minDate = this.inputDatePickerOptions.minDate == null ? this.defaultDatePickerOptions.minDate : this.inputDatePickerOptions.minDate;
            this.inputDatePickerOptions.maxDate = this.inputDatePickerOptions.maxDate == null ? this.defaultDatePickerOptions.maxDate : this.inputDatePickerOptions.maxDate;
        }
    }

    showCheck: boolean = false;
    checkTimeout: any;

    callCheckFormat() {
        clearTimeout(this.checkTimeout);

        this.checkTimeout = setTimeout(() => {
            this.checkFormat();
        }, 5000);
    }
    checkFormat() {
        if (this.showCheck = true) {
            this.showCheck = false;
        }
        if (this.dateText != null) {
            let date: string[];

            date = this.dateText.split('-');
            if (date.length != 3) {
                date = this.dateText.split('/');
            }

            if (date.length == 3) {
                let totalMinDate: number = this.inputDatePickerOptions.minDate ? (this.inputDatePickerOptions.minDate.Year + this.inputDatePickerOptions.minDate.Month + this.inputDatePickerOptions.minDate.Date) : 0;
                let totalMaxDate: number = this.inputDatePickerOptions.maxDate ? (this.inputDatePickerOptions.maxDate.Year + this.inputDatePickerOptions.maxDate.Month + this.inputDatePickerOptions.maxDate.Date) : 0;
                let totalDate: number = parseInt(date[2]) + parseInt(date[0]) + parseInt(date[1]);

                try {
                    totalDate = parseInt(date[2]) + parseInt(date[0]) + parseInt(date[1]);

                    if (totalMaxDate < totalDate && totalMinDate > totalDate) {
                        this.selectedDate.emit(this.defaultDate);
                        this.messageErr = "Please check if the date entered is out of minimum and maximum date limit.";
                    } else {
                        if (this.dateType == 1) {
                            if (date[this.formatArrayAD.findIndex(x => x.startsWith('dd'))].length == 2 && date[this.formatArrayAD.findIndex(x => x.startsWith('MM'))].length == 2 && date[this.formatArrayAD.findIndex(x => x.startsWith('yyyy'))].length == 4) {
                                this.currentDate.Year = parseInt(date[this.formatArrayAD.findIndex(x => x.startsWith('yyyy'))]);
                                this.currentDate.Month = parseInt(date[this.formatArrayAD.findIndex(x => x.startsWith('MM'))]);
                                this.currentDate.Date = parseInt(date[this.formatArrayAD.findIndex(x => x.startsWith('dd'))]);
                                this.selectDate(this.currentDate.Year, this.currentDate.Month, this.currentDate.Date);
                            } else {
                                this.selectedDate.emit(this.defaultDate);
                                this.messageErr = `Please check the date format (${this.formatParamAD}) and try again.`;
                            }
                        } else {
                            if (date[this.formatArrayBS.findIndex(x => x.startsWith('dd'))].length == 2 && date[this.formatArrayBS.findIndex(x => x.startsWith('MM'))].length == 2 && date[this.formatArrayBS.findIndex(x => x.startsWith('yyyy'))].length == 4) {
                                this.currentDate.Year = parseInt(date[this.formatArrayBS.findIndex(x => x.startsWith('yyyy'))]);
                                this.currentDate.Month = parseInt(date[this.formatArrayBS.findIndex(x => x.startsWith('MM'))]);
                                this.currentDate.Date = parseInt(date[this.formatArrayBS.findIndex(x => x.startsWith('dd'))]);
                                this.selectDate(this.currentDate.Year, this.currentDate.Month, this.currentDate.Date);
                            } else {
                                this.selectedDate.emit(this.defaultDate);
                                this.messageErr = `Please check the date format (${this.formatParamBS}) and try again.`;
                            }
                        }
                    }
                } catch (err) {
                    if (this.dateType == 1) {
                        this.selectedDate.emit(this.defaultDate);
                        this.messageErr = `Please check the date format (${this.formatParamAD}) and try again.`;
                    } else {
                        this.selectedDate.emit(this.defaultDate);
                        this.messageErr = `Please check the date format (${this.formatParamBS}) and try again.`;
                    }
                }
            } else {
                this.selectedDate.emit(this.defaultDate);
                this.messageErr = `Please check the date format (${this.formatParamBS}) and try again.`;
            }
        }
    }

    selectDate(Year?: number, Month?: number, Day?: number) {
        try {
            this.dateADAndBS = this.datePickerService.getDate(Year, Month, Day, this.dateType);
            this.currentDate = this.datePickerService.getInputDate(new Date(Year, Month - 1, Day));

            //let newDate: string[] = this.dateADAndBS.Date.split('/');

            let emitDate: IInputDateVM = this.datePickerService.getInputDate(new Date(this.dateADAndBS.Date));
            this.selectedDate.emit(emitDate);

            this.messageErr = null;
            this.setDateText();
            this.getCalendar(Year, Month);
        } catch (err) {
            if (this.dateType == 1) {
                this.messageErr = `Please check the date format (${this.formatParamAD}) and try again.`;
            } else {
                this.messageErr = `Please check the date format (${this.formatParamBS}) and try again.`;
            }
        };
        this.closeModal();
    }

    getCalendarWithoutEmit(year?: number, month?: number) {
        let minDate: Date = this.inputDatePickerOptions.minDate == null ? null : new Date(this.inputDatePickerOptions.minDate.Year, this.inputDatePickerOptions.minDate.Month - 1, this.inputDatePickerOptions.minDate.Date);
        let maxDate: Date = this.inputDatePickerOptions.maxDate == null ? null : new Date(this.inputDatePickerOptions.maxDate.Year, this.inputDatePickerOptions.maxDate.Month - 1, this.inputDatePickerOptions.maxDate.Date);

        if (year && month) {
            if (this.currentDate.Year == year && this.currentDate.Month == month) {
                this.calendar = this.datePickerService.getDateByYearMonthChange(this.dateType, year, month, this.currentDate.Date, minDate, maxDate);
            } else {
                this.calendar = this.datePickerService.getDateByYearMonthChange(this.dateType, year, month, 1, minDate, maxDate);
            }
        } else {
            this.calendar = this.datePickerService.getDateByYearMonthChange(this.dateType, this.currentDate.Year, this.currentDate.Month, this.currentDate.Date, minDate, maxDate);
        }

        this.setCalendar(minDate, maxDate);

        this.years = [];
        for (let i = this.calendar.CurrentYear - 10; i <= this.calendar.CurrentYear + 10; i++) {
            this.years.push(i);
        }
    }
}


