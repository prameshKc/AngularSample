import { FgetEmployeeTurnOver_Result } from './../../models/ViewModels';
import { Component, OnInit, Injectable } from "@angular/core";
import { EmployeePositionService, ParamService, SupervisorListService } from "../../services/BaseService";
import { IInputDateVM, IDatePickerOptionsVM, ICalendarVM } from "../../shared/datepicker/models/datepickerVM";
import { IPagination, IEmployeePosition } from "../../models/Models";
import { IFgetLeaveUseDatewise_Result, IFilterViewModel, IEmployeeVM, EmployeeLeaveRepLeaves, LeaveListLoginStatusVM } from "../../models/ViewModels";
import { DatePickerService } from "../../shared/datepicker/modules/datePickerService";


@Component({
  templateUrl: 'employeeTurnOverRep.component.html'
})
export class EmpTurnOverRep implements OnInit {

  //variables
  currentEmpId: number = Number(localStorage.getItem('EmployeeId'));
  empTurnOverList: FgetEmployeeTurnOver_Result[] = [];

  compId: number;
  compList: IEmployeePosition[] = [];
  loginStatusList: LeaveListLoginStatusVM[] = [];

  //datepicker variables
  openRangeCalendar: boolean;
  inputDate: IInputDateVM;
  defaultDateType: number;
  filterFromDate: IInputDateVM;
  filterToDate: IInputDateVM;
  defaultDateOptions: IDatePickerOptionsVM;
  fromDateOptions: IDatePickerOptionsVM;
  tillDateOptions: IDatePickerOptionsVM;

  //pagination variables
  pagination?: IPagination = <IPagination>{
    CurrentPage: 1,
    ItemsPerPage: 50,
    TotalItems: 0
  };

  // filter variables
  filterObj: IFilterViewModel;
  filterStartDate: Date;
  filterEndDate: Date;

  constructor(
    public empPosService: EmployeePositionService,
    public paramService: ParamService,
    private dateService: DatePickerService,
    public supervisorListService: SupervisorListService
  ) {
  }

  ngOnInit() {
    this.currentEmpId = Number(localStorage.getItem('EmployeeId'));

    this.paramService.get(12, '$expand=ParamValue').subscribe(data => {
      this.defaultDateType = data.ParamValue.PValue;
      this.initialize();
    })
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

    this.filterFromDate = {
      Year: startDate.Date.getFullYear(),
      Month: startDate.Date.getMonth() + 1,
      Date: startDate.Date.getDate()
    };

    this.filterToDate = {
      Year: endDate.Date.getFullYear(),
      Month: endDate.Date.getMonth() + 1,
      Date: endDate.Date.getDate()
    };

    this.onFilterDateSelect(this.filterFromDate, 'F');
    this.onFilterDateSelect(this.filterToDate, 'T');

    this.defaultDateOptions = {
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    }
    this.getCompanyId();
  }

  public getCompanyId() {
    this.currentEmpId = Number(localStorage.getItem('EmployeeId'));
    let currentDate = new Date();

    this.compList = [];

    let query: string = '$select=CompanyId,Company/*&$expand=Company&$top=1';
    query += `&$filter=EmployeeId eq ${this.currentEmpId} and EffectiveFrom lt DateTime'${currentDate.getFullYear()}-${currentDate.getMonth() < 10 ? 0 : ''}${currentDate.getMonth() + 1}-${currentDate.getDate() < 10 ? 0 : ''}${currentDate.getDate()}T00:00:00'`;
    this.empPosService.getAll(query).subscribe(data => {
      if (this.compList.length == 0) {
        this.compId = Number(localStorage.getItem('Branch'));
      } else {
        this.compList = data;
        this.compId = this.compList[0].CompanyId;
      }
      this.getTurnOverRep();
    })

  }

  public onFilterDateSelect(event: IInputDateVM, flag: string) {
    if (flag == 'F') {
      this.filterStartDate = new Date(event.Year, event.Month - 1, event.Date);
    } else if (flag == 'T') {
      this.filterEndDate = new Date(event.Year, event.Month - 1, event.Date);
    }
  }

  getTurnOverRep() {
    this.empTurnOverList = [];
    this.supervisorListService.GetEmployeeTurnOver(
      this.compId,
      this.pagination,
      this.filterObj,
      this.filterStartDate,
      this.filterEndDate
    ).subscribe(data => {
      this.pagination.TotalItems = data.count;
      this.empTurnOverList = data.value;
    })
  }
}

