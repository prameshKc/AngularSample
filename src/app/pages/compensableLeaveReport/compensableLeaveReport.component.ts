import { Component, Injectable } from '@angular/core';
import {
  UserService, CompensableLeaveReportService, LoginReportService,
  CompensableLeaveService, CommonService
} from '../../services/BaseService';
import {
  ILoginReport, IPagination, IUser,
  IEmployee, IODataResult, ICompensableLeave
} from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';

import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { Observable } from 'rxjs';

@Component({
  selector: 'compensable-leave-report',
  templateUrl: 'compensableLeaveReport.component.html'
})
export class CompensableLeaveReportComponent {
  filterObj: IFilterViewModel = <IFilterViewModel>{};
  userId: string;
  currentEmpId: number;
  pagination?: IPagination;

  userDetails: IUser = <IUser>{};
  employeeDetails: IEmployee = <IEmployee>{};
  isAdmin: boolean = false;
  loginStatusId: number;
  presentOnHoliday: boolean = true;
  presentOnWeekHoliday: boolean = false;
  presentOnLeave: boolean = false;
  filterByStaff: number;
  filterByTDate: Date;
  loginReportList: ILoginReport[] = [];
  inputTDate: IInputDateVM;
  inputTDateOptions: IDatePickerOptionsVM;
  currentDate: Date;
  toggleSort: boolean = false;
  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };
  presentOnHolidayId: number;
  presentOnWeekHolidayId: number;
  presentOnLeaveId: number;

  constructor(
    public userService: UserService,
    public compensableLeaveReportService: CompensableLeaveReportService,
    public loginReportService: LoginReportService,
    public compensableLeaveService: CompensableLeaveService,
    private commonService: CommonService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig
  ) {
    this.userId = localStorage.getItem('UserId');
    this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
    this.getPresentOnHolidayId();
    this.getPresentOnLeaveId();
    this.getPresentOnWeekHolidayId();
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "TDate", SearchBy: "" };
    this.currentDate = new Date();
    this.inputTDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputTDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };
  }

  public getEmployeeId() {
    let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
    this.userService.get(localStorage.getItem("UserId"), query).subscribe((data: IUser) => {
      this.userDetails = data;
      this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
      this.employeeDetails = data.Employee;
      this.getAllLeaveReportComponent(this.filterObj);
      if (this.employeeDetails.ReportTo != null || typeof this.employeeDetails.ReportTo != undefined) {
        if (
          this.employeeDetails.ReportTo[0].ReportTo1 == 0 &&
          this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 &&
          this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
        ) {
          this.isAdmin = true;
        }
        else {
          if (
            this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 &&
            this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
          ) {
            this.isAdmin = true;
          }
          else {
            this.isAdmin = false;
          }
        }
      }
    });
  }

  public getAllLeaveReportComponent(filterObj?: IFilterViewModel) {
    if (this.presentOnHoliday == true) {
      this.loginStatusId = this.presentOnHolidayId;
    }
    if (this.presentOnWeekHoliday == true) {
      this.loginStatusId = this.presentOnWeekHolidayId;
    }
    if (this.presentOnLeave == true) {
      this.loginStatusId = this.presentOnLeaveId;
    }

    let filterByStaff = (this.filterByStaff == null) ? -1 : this.filterByStaff;
    let filterByTDate = (this.filterByTDate == null) ? null : this.filterByTDate;
    let subscription: Observable<IODataResult<ILoginReport[]>>;

    if (
      this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 &&
      this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 &&
      this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
    ) {
      subscription = this.compensableLeaveReportService.GetCompensableLoginReport(this.loginStatusId, this.pagination, -1, filterObj, filterByStaff, filterByTDate);
    }
    else {
      subscription = this.compensableLeaveReportService.GetCompensableLoginReport(this.loginStatusId, this.pagination, this.currentEmpId, filterObj, filterByStaff, filterByTDate);
    }

    subscription.subscribe((data: IODataResult<ILoginReport[]>) => {
      this.loginReportList = data.value;
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: data.count,
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };
    });
  }

  public editLoginReportWithCompensable(editItem: ILoginReport, isBySubmit?: number) {
    let saveItem: ILoginReport;
    //saveItem = Object.assign({}, editItem);
    this.loginReportService.get(editItem.Id).subscribe((data: ILoginReport) => {
      saveItem = {
        Id: data.Id,
        TDate: data.TDate,
        GroupId: data.GroupId,
        EmployeeId: data.EmployeeId,
        CheckInTime: data.CheckInTime,
        CheckOutTime: data.CheckOutTime,
        LoginStatusId: data.LoginStatusId,
        StaffRemarks: data.StaffRemarks,
        IsDeviceLogin: data.IsDeviceLogin,
        IsCompensable: editItem.IsCompensable
      };

      this.loginReportService.put(saveItem.Id, saveItem).subscribe(() => {
        if (isBySubmit == null) {
          var toastOptions: ToastOptions = {
            title: "Compensable Leave",
            msg: "Compensable Leave has been verified",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap',
          };
          this.toastyService.success(toastOptions);
        }
        this.getAllLeaveReportComponent(this.filterObj);
        let statusOfCompensation: number;
        if (saveItem.IsCompensable == null) {
          statusOfCompensation = null;
        }
        else if (saveItem.IsCompensable == true) {
          statusOfCompensation = 5;
        }
        else {
          statusOfCompensation = 3;
        }

        let saveLeaveReportUpdate: ICompensableLeave;
        saveLeaveReportUpdate = {
          ApprovedBy: this.userId,
          ApproveOn: new Date(),
          LoginReportId: saveItem.Id,
          Status: statusOfCompensation
        };
        this.compensableLeaveService.post(saveLeaveReportUpdate).subscribe(() => {
        });
      });
    });



  }

  public getLoginReportPOH() {
    this.presentOnHoliday = true;
    this.presentOnWeekHoliday = false;
    this.presentOnLeave = false;
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.getAllLeaveReportComponent(this.filterObj);
  }

  public getLoginReportPOWH() {
    this.presentOnHoliday = false;
    this.presentOnWeekHoliday = true;
    this.presentOnLeave = false;
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.getAllLeaveReportComponent(this.filterObj);
  }

  public getLoginReportPOL() {
    this.presentOnHoliday = false;
    this.presentOnWeekHoliday = false;
    this.presentOnLeave = true;
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.getAllLeaveReportComponent(this.filterObj);
  }

  public reset() {
    this.filterByStaff = null;
    this.filterByTDate = null;
    this.inputTDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.getAllLeaveReportComponent(this.filterObj);
  }

  public selectedEmployee(event: any) {
    this.filterByStaff = event.EmployeeId;
    this.getAllLeaveReportComponent(this.filterObj);
  }

  public onTDateSelect(selectedDate: IInputDateVM) {
    this.inputTDate = selectedDate;
    if (this.userDetails.Employee != null) {
      this.filterByTDate = new Date(this.inputTDate.Year, this.inputTDate.Month - 1, this.inputTDate.Date, 5, 45, 0, 0);
      this.getAllLeaveReportComponent(this.filterObj);
    }
  }

  public CompensableLeaveAndFilter() {
    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "TDate", SearchBy: "" };
    this.reset();
  }

  public radioBttn(event: boolean, Id: number) {
    this.loginReportList.filter(x => x.Id == Id)[0].IsCompensable = event;
  }

  public sortBy(sortBy: string) {
    this.toggleSort = !this.toggleSort;
    if (this.toggleSort == true) {
      this.filterObj.Sort = "true";
    }
    else {
      this.filterObj.Sort = "false";
    }

    this.filterObj.SortingAttribute = sortBy;
    this.getAllLeaveReportComponent(this.filterObj);
  }

  convertToTimeSpanFormat(date: string) {
    var obj = new Date(date);
    return "PT" + obj.getHours() + "H" + obj.getMinutes() + "M" + obj.getSeconds() + "S";
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    if (this.userDetails.Employee != null) {
      this.getAllLeaveReportComponent(this.filterObj);
    } else {
      this.getEmployeeId();
    }
  }
  public getPresentOnHolidayId() {
    this.commonService.getPValue('POH').subscribe((pValue: string) => {
      this.presentOnHolidayId = parseInt(pValue);
    });
  }
  public getPresentOnWeekHolidayId() {
    this.commonService.getPValue('POWH').subscribe((pValue: string) => {
      this.presentOnWeekHolidayId = parseInt(pValue);
    });
  }
  public getPresentOnLeaveId() {
    this.commonService.getPValue('POL').subscribe((pValue: string) => {
      this.presentOnLeaveId = parseInt(pValue);
    });
  }

  public submit(loginReportList: ILoginReport[]) {
    loginReportList.forEach(item => {
      if (item.IsCompensable != null) {
        this.editLoginReportWithCompensable(item, -1);
      }
    });
    var toastOptions: ToastOptions = {
      title: "Compensable Leave",
      msg: "Compensable Leave has been verified",
      showClose: true,
      timeout: 5000,
      theme: 'bootstrap',
    };
    this.toastyService.success(toastOptions);
  }

  public cancel(loginReportList: ILoginReport[]) {
    loginReportList.forEach(item => {
      if (item.IsCompensable != null) {
        item.IsCompensable = null;
      }
    });
  }
}
