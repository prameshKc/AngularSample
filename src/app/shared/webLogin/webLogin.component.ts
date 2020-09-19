import { Component, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService, LoginReportService, EmployeeShiftService, LoginLogService, CommonService } from '../../services/BaseService';
import { IUser, ILoginReport, IEmployeeShift, ILoginLog, ILoginGroupChild } from '../../models/Models';
import { IInputDateVM } from '../../shared/datepicker/models/datepickerVM';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
  selector: 'webLogin',
  styleUrls: ['webLogin.component.css'],
  templateUrl: 'webLogin.component.html',
})
export class WebLoginComponent implements OnInit {
  selectedDate: IInputDateVM;
  userId: string = null;
  userObj: IUser;
  employeeId: number;
  checkInObj: ILoginReport = {};
  checkOutObj: ILoginReport = {};
  dateString: string;
  selectedCurrentDate: Date;
  loginDetail: ILoginReport[];
  employeeShiftObj: IEmployeeShift[];

  officeHrFrom: Date;
  oHFhr: number;
  oHFmin: number;
  oHFsec: number;

  officeHrTo: Date;
  oHThr: number;
  oHTmin: number;
  oHTsec: number;

  showStaffVerification: boolean;
  showBackButton: boolean;
  newCheckIn: ILoginLog = <ILoginLog>{};
  userDetails: IUser;
  isCheckedIn: boolean = false;

  currentSvTime: Observable<any>;

  constructor(
    public userService: UserService,
    public loginLogService: LoginLogService,
    public commonService: CommonService,
    public loginReportService: LoginReportService,
    public employeeShiftService: EmployeeShiftService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig
  ) {
    this.userId = localStorage.getItem('UserId');
    let currentDate: Date = new Date();
    this.selectedDate = <IInputDateVM>{
      Year: currentDate.getFullYear(),
      Month: currentDate.getMonth() + 1,
      Date: currentDate.getDate(),
    };
  }

  ngOnInit() {
    this.getUserDetails();
    this.getCurrentTime();
  }

  public getUserDetails() {
    let query: string = '$select=Employee/EmployeeNo,Employee/EmployeeShift/*,Employee/EmployeeShift/LoginGroup/*,Employee/EmployeeShift/LoginGroup/LoginGroupChild/*&$expand=Employee,Employee/EmployeeShift/LoginGroup/LoginGroupChild';
    this.userService.get(this.userId, query).subscribe((data: IUser) => {
      this.userObj = data;
      this.employeeId = data.EmployeeId;
      this.userDetails = data;

      data.Employee.EmployeeShift = data.Employee.EmployeeShift.map(item => {
        let currentDate = new Date();
        let loginGroupChild: ILoginGroupChild[] = item.LoginGroup.LoginGroupChild.filter(x =>
          new Date(currentDate.getFullYear(), x.EffectiveMonth - 1, x.EffectiveDay, 0, 0, 0) < currentDate &&
          new Date((x.EndMonth < x.EffectiveMonth) ? currentDate.getFullYear() + 1 : currentDate.getFullYear(), x.EndMonth - 1, x.EndDay, 23, 59, 59) > currentDate);

        if (loginGroupChild.length > 0) {
          item.LoginGroup.DefaultOfficeHourFrom = loginGroupChild[0].OfficeHourFrom;
          item.LoginGroup.DefaultOfficeHourTill = loginGroupChild[0].OfficeHourTill;
        }
        return item;
      })
      
      this.checkIfCheckedIn();
    })
  }

  checkIfCheckedIn() {
    let currentDate: Date = new Date();
    let query: string = `$filter=Staffno eq ${this.userDetails.Employee.EmployeeNo} `;
    query += `and year(Datetime) eq ${currentDate.getFullYear()} `;
    query += `and month(Datetime) eq ${currentDate.getMonth() + 1} `;
    query += `and day(Datetime) eq ${currentDate.getDate()}`;

    this.loginLogService.getAll(query).subscribe((data: ILoginLog[]) => {
      if (data.length > 0) {
        this.isCheckedIn = true;
      } else {
        this.isCheckedIn = false;
      }
    }, (err) => {
      this.checkIfCheckedIn();
    });
  }

  submitRecord() {
    this.newCheckIn.LoginDeviceId = 2;
    this.newCheckIn.Staffno = this.userDetails.Employee.EmployeeNo;
    this.saveToDB();
  }

  checkCurrentLocation() {
    navigator.geolocation.getCurrentPosition((resp) => {
      if (resp != null) {
        console.log("Success:" + JSON.stringify(resp));
        this.saveCheck(resp);
      }
    }, (error) => {
      this.checkCurrentLocation();
    });
  }

  saveCheck(resp: any) {
    this.newCheckIn = <ILoginLog>{};
    this.newCheckIn.Latitude = resp.coords.latitude.toString();
    this.newCheckIn.Longitude = resp.coords.longitude.toString();
  }

  saveToDB() {
    this.loginLogService.post(this.newCheckIn).subscribe((data: ILoginLog) => {
      this.checkIfCheckedIn();

      var toastOptions: ToastOptions = {
        title: "Success",
        msg: `${this.isCheckedIn == true ? "Checked-Out" : "Checked-In"} successfully.`,
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.success(toastOptions)
    }, (err) => {
      var toastOptions: ToastOptions = {
        title: "Error",
        msg: "Checked-In error.",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.error(toastOptions)
    });
  }

  getCurrentTime() {
    this.commonService.GetCurrentTime().subscribe((data: Date) => {
      let date = new Date(data);
      this.currentSvTime = new Observable(observer => {
        setInterval(() => observer.next(new Date(date.setSeconds(date.getSeconds() + 1))), 1000)

        return { unsubscribe() { } };
      });
    })
  }
}

