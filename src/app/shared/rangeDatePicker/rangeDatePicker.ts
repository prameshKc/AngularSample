import { Component, Injectable, OnChanges, SimpleChanges, Input, Output, EventEmitter } from "@angular/core";
import { IInputDateVM, IDatePickerOptionsVM, ICalendarVM } from "../datepicker/models/datepickerVM";
import { ParamService } from "../../services/BaseService";
import { DatePickerService } from "../datepicker/modules/datePickerService";

@Component({
  selector: 'range-datepicker',
  templateUrl: 'rangeDatePicker.html'
})
export class RangeDatePickerComponent implements OnChanges {
  @Output() startDate: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() endDate: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() applyFilter: EventEmitter<number> = new EventEmitter<number>();

  filterStartDate: Date;
  filterEndDate: Date;

  openRangeCalendar: boolean;

  //datepicker variables
  inputDate: IInputDateVM;
  defaultDateType: number;
  filterFromDate: IInputDateVM;
  filterToDate: IInputDateVM;
  defaultDateOptions: IDatePickerOptionsVM;

  fromDateOptions: IDatePickerOptionsVM;
  tillDateOptions: IDatePickerOptionsVM;

  //variables

  constructor(
    private dateService: DatePickerService,
    public paramService: ParamService
  ) {
    this.initialize();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  initialize() {
    let currentDate = new Date();
    let startDate: ICalendarVM, endDate: ICalendarVM;

    if (this.defaultDateType == 1) {
      startDate = this.dateService.DateByYearMonthChange(1, currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      endDate = this.dateService.DateByYearMonthChange(1, currentDate.getFullYear(), currentDate.getMonth() + 1, startDate.NoOfDays);
    } else {
      let nepaliDate = this.dateService.GetDateBS(new Date());
      let BSYear = this.dateService.GetBSYear(nepaliDate);
      let BSMonth = this.dateService.GetBSMonth(nepaliDate);

      startDate = this.dateService.DateByYearMonthChange(2, BSYear, BSMonth, 1);
      endDate = this.dateService.DateByYearMonthChange(2, BSYear, BSMonth, startDate.NoOfDays);
    }

    this.filterFromDate = this.dateService.getInputDate(startDate.Date);
    this.filterToDate = this.dateService.getInputDate(endDate.Date);

    this.defaultDateOptions = {
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    }
  }

  public onFilterDateSelect(event: IInputDateVM, flag: string) {
    if (flag == 'F') {
      this.filterFromDate = event;
      this.filterStartDate = new Date(event.Year, event.Month - 1, event.Date);
      this.startDate.emit(this.filterStartDate);
    } else if (flag == 'T') {
      this.filterToDate = event;
      this.filterEndDate = new Date(event.Year, event.Month - 1, event.Date);
      this.endDate.emit(this.filterEndDate);
    }
  }

  public applyFilterFn() {
    this.applyFilter.emit(1);
  }
}
