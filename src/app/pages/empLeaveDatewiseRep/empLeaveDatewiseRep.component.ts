import { Component, OnInit, Injectable } from "@angular/core";
import { EmployeeLeaveReportService, UserService, ParamService } from "../../services/BaseService";
import { IInputDateVM, IDatePickerOptionsVM, ICalendarVM } from "../../shared/datepicker/models/datepickerVM";
import { IPagination, IUser } from "../../models/Models";
import { IFgetLeaveUseDatewise_Result, IFilterViewModel, IEmployeeVM, EmployeeLeaveRepLeaves, LeaveListLoginStatusVM } from "../../models/ViewModels";
import { DatePickerService } from "../../shared/datepicker/modules/datePickerService";


@Component({
  selector: 'emp-leave-datewise-report',
  templateUrl: 'empLeaveDatewiseRep.component.html'
})
export class EmpLeaveDatewiseReport implements OnInit {
  //variables
  userId: string;
  userDetails: IUser = <IUser>{};
  empId: number;
  empLeaveRepList: IFgetLeaveUseDatewise_Result[] = [];
  empList: IFgetLeaveUseDatewise_Result[] = [];
  loginStatusList: LeaveListLoginStatusVM[] = [];
  isAdmin: boolean = false;

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
  searchTxt: string;
  desgId: string;
  deptId: string;

  constructor(
    public userService: UserService,
    public paramService: ParamService,
    private dateService: DatePickerService,
    public employeeLeaveReportService: EmployeeLeaveReportService
  ) {
  }

  ngOnInit() {
    this.userId = localStorage.getItem('UserId');
    this.empId = Number(localStorage.getItem('EmployeeId'));

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
    this.getUserDetails();
  }


  public getUserDetails() {
    let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
    this.userService.get(this.userId, query).subscribe((data: IUser) => {

      this.userDetails = data;
      this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
      let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
      if (currentReportTo.ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
        this.getEmpLeaveRepList();
      }
      else {
        if (this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
          this.getEmpLeaveRepList();
        }
        else {
          this.getEmpLeaveRepList(this.empId);
        }
      }
    })
  }


  getEmpLeaveRepList(empId?: number) {
    this.empLeaveRepList = [];
    this.empList = [];

    this.employeeLeaveReportService.GetLeaveUseDatewise(this.pagination, this.filterObj, this.filterStartDate, this.filterEndDate, this.empId, this.searchTxt, this.deptId, this.desgId).subscribe(data => {
      this.pagination.TotalItems = data.count;

      this.empLeaveRepList = data.value;
      this.organiseData(data.value);
    })
  }

  organiseData(data: IFgetLeaveUseDatewise_Result[]) {
    if (data.length > 0) {
      data.forEach(item => {
        let newLeaves: EmployeeLeaveRepLeaves = {
          LeaveTypeId: item.LoginStatusId,
          Count: this.empList.filter(x => x.LoginStatusId == item.LoginStatusId).length
        };

        if (this.loginStatusList.filter(x => x.LoginStatusId == item.LoginStatusId).length == 0) {
          this.loginStatusList.push({
            LoginStatusId: item.LoginStatusId,
            StatusName: item.LeaveType
          })
        }

        if (this.empList.filter(x => x.EmployeeId == item.EmployeeId).length == 0) {
          this.empList.filter(x => x.EmployeeId == item.EmployeeId).forEach(item => {
            if (item.Leaves.filter(x => x.LeaveTypeId == item.LoginStatusId).length == 0) {
              item.Leaves.push(newLeaves);
            }
          })
          this.empList.push(item);
        }
      });
    }
  }

  getLeaveTotal(empId: number, leaveType: string) {
    let total = 0;
    this.empLeaveRepList.filter(x => x.EmployeeId == empId).forEach(item => {
      total += item[leaveType];
    })
    return total;
  }

  getLeaves(empId: number, loginStatusId: number) {
    let total = 0;
    this.empLeaveRepList.filter(x => x.EmployeeId == empId && x.LoginStatusId == loginStatusId).forEach(item => {
      total += item.UsedLeave;
    })
    return total;
  }

  public onFilterDateSelect(event: IInputDateVM, flag: string) {
    if (flag == 'F') {
      this.filterStartDate = new Date(event.Year, event.Month - 1, event.Date);
    } else if (flag == 'T') {
      this.filterEndDate = new Date(event.Year, event.Month - 1, event.Date);
    }
  }

  selectedDept(deptId: string) {
    this.deptId = deptId;
    this.getEmpLeaveRepList();
  }

  selectedDesg(desgId: string) {
    this.desgId = desgId;
    this.getEmpLeaveRepList();
  }

}

