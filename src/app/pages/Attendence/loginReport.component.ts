import { Component, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { ILoginReport, IUser, ILoginValidate, IEmployee, ILoginGroup, ILoginGroupChild } from '../../models/Models';
import { ILoginReportVM, ILoginStatusVm } from '../../models/ViewModels';
import { LoginReportService, UserService, LoginStatusService, EmployeeService } from '../../services/BaseService';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';

@Component({
  selector: 'loginReport',
  templateUrl: 'loginReport.component.html'
})
export class LoginReportComponent {
  //date picker inputs.
  inputDate1: IInputDateVM;
  inputDateOptions1: IDatePickerOptionsVM;
  selectedCurrentDate: Date;
  dateString: string;

  inputDate2: IInputDateVM;
  inputDateOptions2: IDatePickerOptionsVM;
  toastOptions: ToastOptions;

  loginDetails: ILoginReport[] = [];
  userId: string = null;
  userDetails: IUser;
  requiredEmployeeId: number;
  loginStatus: ILoginStatusVm[] = [];
  loginValidateObj: ILoginValidate;
  loginDetailsVm: ILoginReportVM;
  loginDetailsObj: ILoginReport = <ILoginReport>{};
  dailyLoginDetails: ILoginReport[];
  employeeList: IEmployee[];
  employeeDetails: IEmployee;
  loginReportObj: ILoginReport;
  monthlyLoginDetails: ILoginReport[];
  loginDeviceId: number;
  cicoToggle: boolean = false;
  EmpId: number;

  isRefreshCalendar: boolean = true;
  loading: boolean = false;

  constructor(
    public loginReportService: LoginReportService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    public userService: UserService,
    public loginStatusService: LoginStatusService,
    public employeeService: EmployeeService
  ) {
    //this.userId = localStorage.getItem('UserId');
    let currentDate: Date = new Date();
    this.inputDate1 = <IInputDateVM>{
      Year: currentDate.getFullYear(),
      Month: currentDate.getMonth() + 1,
      Date: currentDate.getDate(),
    };
    this.inputDateOptions1 = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: this.inputDate1,
      maxDate: null
    };
    this.loginValidateObj = <ILoginValidate>{};
  }

  ngOnInit() {
    this.getEmployee();
    this.getLoginStatus();
    //this.getDailyLoginReport();
  }

  getMonthlyRep() {
    this.cicoToggle = !this.cicoToggle;
    this.EmpId = this.userDetails.EmployeeId;
  }

  public getLoginStatus() {
    this.loginStatusService.getAll().subscribe((data: ILoginStatusVm[]) => {
      this.loginStatus = data;
    })
  }

  public getDailyLoginReport() {
    this.loginReportService.getAll().subscribe((data: ILoginReport[]) => {
      this.dailyLoginDetails = data;
    })
  }


  public getEmployee() {
    let query: string = '$expand=Employee/EmployeeShift';
    this.userService.get(localStorage.getItem('UserId'), query).subscribe((data: IUser) => {
      this.userDetails = data;
      if (this.userDetails.Employee.EmployeeShift.length > 0) {
        this.loginDeviceId = this.userDetails.Employee.EmployeeShift[0].LoginDeviceId;
      }
      this.requiredEmployeeId = data.EmployeeId;
      this.employeeDetails = data.Employee;
      //this.getEmployeeDetails(this.requiredEmployeeId);
    })
  }

  public getEmployeeDetails(id?: number) {
    if (id != null && id != undefined) {
      this.employeeService.get(id).subscribe((data: IEmployee) => {
        this.employeeDetails = data;
      })
    }
  }

  public getLoginDetails(selectedLoginDetailItem?: ILoginReportVM) {
    if (selectedLoginDetailItem == null || selectedLoginDetailItem == undefined) {
    } else {
      this.loading = true;
      var query = `$expand=LoginStatus,LoginGroup/LoginGroupChild,LoginValidate,LoginValidate/User`;
      this.loginReportService.get(selectedLoginDetailItem.Id, query).subscribe((data: ILoginReportVM) => {
        this.loading = false;
        this.loginDetailsVm = data;
        let currentDate = new Date(this.loginDetailsVm.TDate);
        let loginGroupChild: ILoginGroupChild[] = this.loginDetailsVm.LoginGroup.LoginGroupChild.filter(x =>
          new Date(currentDate.getFullYear(), x.EffectiveMonth - 1, x.EffectiveDay, 0, 0, 0) < currentDate &&
          new Date((x.EndMonth < x.EffectiveMonth) ? currentDate.getFullYear() + 1 : currentDate.getFullYear(), x.EndMonth - 1, x.EndDay, 23, 59, 59) > currentDate);

        if (loginGroupChild.length > 0) {
          this.loginDetailsVm.LoginGroup.DefaultOfficeHourFrom = loginGroupChild[0].OfficeHourFrom;
          this.loginDetailsVm.LoginGroup.DefaultOfficeHourTill = loginGroupChild[0].OfficeHourTill;
        }

        this.loginDetailsVm.LoginValidate = data.LoginValidate.reverse();
        this.isRefreshCalendar = false;
      });
    }
  }

  public checkIn() {
    this.loginReportObj.GroupId = this.employeeDetails.GroupId;
    this.loginReportObj.EmployeeId = this.employeeDetails.EmployeeId;
    this.loginReportObj.CheckInTime = new TimeRanges();
    this.loginReportService.post(this.loginReportObj).subscribe(() => {
      this.loginReportObj = <ILoginReport>{};
    })
  }

  /**
   * *update staff remarks
   */
  public updateRemarks(loginDetailsVm: ILoginReportVM) {
    this.loginDetailsObj.Id = loginDetailsVm.Id;
    this.loginDetailsObj.CheckInTime = loginDetailsVm.CheckInTime;
    this.loginDetailsObj.CheckOutTime = loginDetailsVm.CheckOutTime;
    this.loginDetailsObj.EmployeeId = loginDetailsVm.EmployeeId;
    this.loginDetailsObj.GroupId = loginDetailsVm.GroupId;
    this.loginDetailsObj.IsDeviceLogin = loginDetailsVm.IsDeviceLogin;
    this.loginDetailsObj.LoginStatusId = loginDetailsVm.LoginStatusId;
    this.loginDetailsObj.StaffRemarks = loginDetailsVm.Remarks;
    this.loginDetailsObj.TDate = loginDetailsVm.TDate;
    loginDetailsVm.StaffRemarks = loginDetailsVm.Remarks;
    loginDetailsVm.Remarks = '';

    let loginReportDetailsObj: ILoginReport = {
      Id: loginDetailsVm.Id,
      CheckInTime: loginDetailsVm.CheckInTime,
      CheckOutTime: loginDetailsVm.CheckOutTime,
      EmployeeId: loginDetailsVm.EmployeeId,
      GroupId: loginDetailsVm.GroupId,
      IsDeviceLogin: loginDetailsVm.IsDeviceLogin,
      LoginStatusId: loginDetailsVm.LoginStatusId,
      StaffRemarks: loginDetailsVm.StaffRemarks,
      TDate: loginDetailsVm.TDate
    }

    this.loginReportService.put(loginReportDetailsObj.Id, loginReportDetailsObj).subscribe(() => {
      this.loginDetailsObj = <ILoginReport>{};
      this.isRefreshCalendar = true;
    })
  }

}

