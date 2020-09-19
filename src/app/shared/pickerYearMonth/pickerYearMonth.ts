import { Component, Injectable, Output, EventEmitter, Input } from "@angular/core";
import { FiscalYearService, ParamValueService } from "../../services/BaseService";
import { IFiscalYear } from "../../models/Models";
import { DatePickerService } from "../datepicker/modules/datePickerService";
import { IMonths } from "../datepicker/models/datepickerDataStore";
import { IMonthsEngNep } from "../datepicker/models/dateModel";


@Component({
  selector: 'picker-year-month',
  templateUrl: 'pickerYearMonth.html',
  styles: ['.row{ margin-top: 0 !important; }']
})
export class PickerYearMonthComponent {
  @Input() filterByYear: any;
  @Input() filterByMonth: any;
  @Input() hideMonth?: boolean;

  @Output() filterByYearChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() filterByMonthChange: EventEmitter<any> = new EventEmitter<any>();

  //variables
  fyList: IFiscalYear[] = [];
  YearList: string[] = [];
  MonthList: IMonthsEngNep[] = [];
  dateType: number;

  constructor(
    public fyService: FiscalYearService,
    public pvalueService: ParamValueService,
    public dateService: DatePickerService
  ) {
    this.MonthList = IMonths;
  }

  ngOnInit() {
    this.checkDateType();
  }

  checkDateType() {
    this.dateType = Number(localStorage.getItem('Param.DateType'));
    if (this.dateType) {
      this.getCurrentYearMonth();
    } else {
      this.pvalueService.getDefaultDateSetup().subscribe((data) => {
        this.checkDateType();
      })
    }
  }

  //getFiscalYear() {
  //    this.fyList = []
  //    this.fyService.getAll().subscribe(data => {
  //        this.fyList = data;
  //    })
  //}

  getCurrentYearMonth() {
    if (this.dateType == 1) {
      let engDate: Date = new Date();
      this.filterByYear = engDate.getFullYear();
      this.filterByMonth = engDate.getMonth() + 1;
    } else {
      let nepDate = this.dateService.FGetDateBS(new Date());
      this.filterByYear = this.dateService.GetBSYear(nepDate);
      this.filterByMonth = this.dateService.GetBSMonth(nepDate);
    }
    this.yearSelect();
    this.monthSelect();
  }

  getYearList() {
    this.YearList = [];
    for (let i = -10; i <= 10; i++) {
      this.YearList.push((Number(this.filterByYear) + i).toString());
    }
  }

  yearSelect() {
    this.getYearList();
    this.filterByYearChange.emit(this.filterByYear);
  }

  monthSelect() {
    this.filterByMonthChange.emit(this.filterByMonth);
  }

}
