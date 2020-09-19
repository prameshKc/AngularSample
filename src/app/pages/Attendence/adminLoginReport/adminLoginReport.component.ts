import { Component, OnInit, Injectable, Input } from '@angular/core';
import { IEmployee, ILoginReport, ILoginValidate, IUser, IPagination, IODataResult, ILoginGroupChild } from '../../../models/Models';
import { EmployeeService, LoginStatusService, LoginReportService, LoginValidateService, SupervisorListService, UserService } from '../../../services/BaseService';
import { IFilterViewModel, ILoginReportVM, ILoginStatusVm, IFgetemployeeLoginReport_Result } from '../../../models/ViewModels';
import { IInputDateVM, IDatePickerOptionsVM } from '../../../shared/datepicker/models/datepickerVM';
import { CsvService } from 'src/app/services/excel.service';

import * as L from 'leaflet';

@Component({
  selector: 'adminLoginReport',
  templateUrl: 'adminLoginReport.component.html',
})
export class AdminLoginReportComponent {

  @Input() requiredEmployeeId?: number = null;
  @Input() isFromAttendance: boolean = false;
  @Input() isFromAttendance2: boolean = false;
  employeeList: IFgetemployeeLoginReport_Result[] = [];

  //searching and sorting
  userDetails: IUser = <IUser>{};
  deptId: string;
  desgId: string;
  searchText: string;

  filterObj?: IFilterViewModel = <IFilterViewModel>{};
  viewLoginReport: boolean = false;
  isRefreshCalendar: boolean = true;

  selectedEmployee: IEmployee = <IEmployee>{};
  loginDetails: ILoginReport[] = [];
  loginDetailsVm: ILoginReportVM;
  loginDetailsObj: ILoginReport;
  monthlyLoginDetails: ILoginReport[];
  loginStatus: ILoginStatusVm[] = [];
  //requiredEmployeeId?: number = null;
  userId?: string = null;

  updateLoginReportObj: ILoginReport = <ILoginReport>{};
  updateLoginValidateObj: ILoginValidate = <ILoginValidate>{};
  loginStatusValidate: ILoginStatusVm[] = [];

  //for pagination
  pagination?: IPagination = <IPagination>{
    CurrentPage: 1,
    ItemsPerPage: 50,
    TotalItems: 0,
    SortBy: null
  };

  //date picker inputs.
  inputDate: IInputDateVM;
  inputDateOptions: IDatePickerOptionsVM;
  selectedDate: Date;

  //cico variables
  filterYear: string;
  filterMonth: string;
  cicoToggle: boolean = false;
  EmpId: number;

  isLoading: boolean;
  backToMonthAtt: boolean;
  backToAtt: boolean;


  checkInOptions: any = null;
  checkOutOptions: any = null;

  constructor(
    public csvService: CsvService,
    public employeeService: EmployeeService,
    public loginStatusService: LoginStatusService,
    public loginReportService: LoginReportService,
    public loginValidateService: LoginValidateService,
    public supervisorListService: SupervisorListService,
    public userService: UserService
  ) {
  }

  ngOnInit() {

    this.userId = localStorage.getItem('UserId');
    this.filterObj = { Name: '', Sort: '' };
    let currentDate: Date = new Date();

    this.inputDate = <IInputDateVM>{
      Year: currentDate.getFullYear(),
      Month: currentDate.getMonth() + 1,
      Date: currentDate.getDate(),
    };
    this.inputDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: {
        Year: currentDate.getFullYear(),
        Month: currentDate.getMonth() + 1,
        Date: currentDate.getDate()
      }
    };

    if (this.isFromAttendance == true || this.isFromAttendance2 == true) {
      this.toggle(this.requiredEmployeeId);
    }

    if (this.selectedDate == null) {
      this.selectedDate = new Date();
    }
    this.cicoToggle = false;


    //this.getEmployeeList();
    this.getLoginStatus();

  }

  getMonthlyRep() {
    this.cicoToggle = !this.cicoToggle;
    this.EmpId = this.userDetails.EmployeeId;
  }

  getUserDetails() {
    let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
    this.userService.get(this.userId, query).subscribe((empData: IUser) => {
      this.userDetails = empData;
      this.getEmployeeList();
    })
  }

  public getEmployeeList(filterObj?: IFilterViewModel) {
    this.isLoading = true;

    if (this.userDetails.Id != null) {
      if (this.userDetails.Employee.ReportTo.length > 0) {
        if (
          this.userDetails.Employee.ReportTo.filter(x => x.Status == true)[0].ReportTo1 == 0 ||
          this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
          this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
        ) {
          this.getAllSupervisorEmployees();
        }
        else {
          this.getSupevisorEmployees();
        }
      } else {
        this.isLoading = false;
        this.employeeList = [];
      }
    } else {
      this.isLoading = false;
      this.getUserDetails();
    }
  }

  public getAllSupervisorEmployees() {
    this.supervisorListService.GetAllSupervisorHierarchyEmployeeList(this.selectedDate, this.pagination, this.deptId, this.desgId, this.searchText).subscribe((data: IODataResult<IFgetemployeeLoginReport_Result[]>) => {
      this.isLoading = false;
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: data.count,
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };
      this.employeeList = data.value.filter(x => x.EmployeeNo != 0);
    })
  }

  public getSupevisorEmployees() {
    this.supervisorListService.GetSupervisorHierarchyEmployeeList(this.userDetails.EmployeeId, this.selectedDate, this.pagination, this.deptId, this.desgId, this.searchText).subscribe((data: IODataResult<IFgetemployeeLoginReport_Result[]>) => {
      this.isLoading = false;
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: data.count,
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };
      this.employeeList = data.value.filter(x => x.EmployeeNo != 0);
    })
  }

  public getLoginStatus() {
    this.loginStatusService.getAll().subscribe((data: ILoginStatusVm[]) => {
      this.loginStatus = data;
      this.getloginStatusValidateList();
    })
  }

  public getLoginDetails(selectedLoginDetailItem?: ILoginReportVM) {
    this.loginDetailsVm = null;

    this.isLoading = true;
    var query = `$expand=LoginStatus,LoginGroup/LoginGroupChild,LoginValidate,LoginValidate/User`;
    this.loginReportService.get(selectedLoginDetailItem.Id, query).subscribe((data: ILoginReportVM) => {
      this.isLoading = false;
      this.loginDetailsVm = data;
      let currentDate = new Date(this.loginDetailsVm.TDate);

      let loginGroupChild: ILoginGroupChild[] = this.loginDetailsVm.LoginGroup.LoginGroupChild.filter(x =>
        new Date(currentDate.getFullYear(), x.EffectiveMonth - 1, x.EffectiveDay, 0,0,0) < currentDate &&
        new Date((x.EndMonth < x.EffectiveMonth) ? currentDate.getFullYear() + 1 : currentDate.getFullYear(), x.EndMonth - 1, x.EndDay, 23,59,59) > currentDate);

      if (loginGroupChild.length > 0) {
        this.loginDetailsVm.LoginGroup.DefaultOfficeHourFrom = loginGroupChild[0].OfficeHourFrom;
        this.loginDetailsVm.LoginGroup.DefaultOfficeHourTill = loginGroupChild[0].OfficeHourTill;
      }

      if (data.CheckInGeom) {
        let geomCheckIn: string = data.CheckInGeom.WellKnownValue.WellKnownText.toString();

        let checkInLat: number = Number(geomCheckIn.replace('POINT (', '').replace('(', '').replace(')', '').split(' ')[0]);
        let checkInLng: number = Number(geomCheckIn.replace('POINT (', '').replace('(', '').replace(')', '').split(' ')[1]);

        this.checkInOptions = {
          layers: [
            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
            L.marker([checkInLng, checkInLat])
          ],
          zoom: 15,
          center: L.latLng(checkInLng, checkInLat),
        };

      }

      if (data.CheckOutGeom) {
        let geomCheckOut: string = data.CheckOutGeom.WellKnownValue.WellKnownText.toString();

        let checkOutLat: number = Number(geomCheckOut.replace('POINT (', '').replace('(', '').replace(')', '').split(' ')[0]);
        let checkOutLng: number = Number(geomCheckOut.replace('POINT (', '').replace('(', '').replace(')', '').split(' ')[1]);

        this.checkOutOptions = {
          layers: [
            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
            L.marker([checkOutLng, checkOutLat])
          ],
          zoom: 15,
          center: L.latLng(checkOutLng, checkOutLat),
        };
        this.loginDetailsVm.LoginValidate = data.LoginValidate.reverse();
        this.isRefreshCalendar = false;
      }

    });

  }

  public getloginStatusValidateList() {
    this.loginStatusService.getValidationStatus().subscribe((data: ILoginStatusVm[]) => {
      this.loginStatusValidate = data;
    })
  }

  public updateVerificationRemarks(loginDetailsVm: ILoginReportVM) {
    loginDetailsVm.LoginStatusId = Number(this.updateLoginReportObj.LoginStatusId);
    this.updateLoginReportObj = <ILoginReport>loginDetailsVm;

    this.updateLoginValidateObj.LoginId = loginDetailsVm.Id;
    this.updateLoginValidateObj.UpdatedStatusId = Number(loginDetailsVm.LoginStatusId);
    this.updateLoginValidateObj.ValidatedBy = this.userId;


    this.updateLoginReportObj.LoginStatus = this.loginStatus.filter(x => x.LoginStatusId == Number(this.updateLoginReportObj.LoginStatusId))[0];
    this.updateLoginReportObj.LoginValidate = [this.updateLoginValidateObj];

    this.loginDetailsVm = null;

    this.loginReportService.put(this.updateLoginReportObj.Id, this.updateLoginReportObj).subscribe((data) => {
      this.isRefreshCalendar = true;
      this.updateLoginReportObj = <ILoginReport>{};
      this.updateLoginValidateObj = <ILoginValidate>{};
      this.onPageSelect(this.pagination);
      this.getLoginDetails(loginDetailsVm);

    });
  }

  public filterEmployee() {
    this.pagination.CurrentPage = 1;
    this.getEmployeeList(this.filterObj);
  }

  public filterHome(pagination: number = 1) {
    //this.pagination.CurrentPage = pagination <= 1 ? 1 : pagination > this.pagination.TotalPage ? this.pagination.TotalPage : pagination;
    this.getEmployeeList(this.filterObj);
  }

  public toggle(employeeId: number) {
    this.requiredEmployeeId = employeeId;
    this.employeeService.get(employeeId).subscribe((data: IEmployee) => {
      this.selectedEmployee = data;

      this.viewLoginReport = !this.viewLoginReport;
      if (this.viewLoginReport == false) {
        this.isRefreshCalendar = false;
      } else {
        this.isRefreshCalendar = true;
      }
      //this.getLoginDetails();
    });
  }

  onDateSelect(selectedDate: IInputDateVM) {
    this.selectedDate = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date);
    this.getEmployeeList();
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.getEmployeeList();
  }

  todayReport() {
    let newDate: IInputDateVM = {
      Year: new Date().getFullYear(),
      Month: new Date().getMonth() + 1,
      Date: new Date().getDate()
    }

    this.onDateSelect(newDate);
  }

  public backToMonthWiseAtt() {
    if (this.isFromAttendance == true) {
      this.backToMonthAtt = true;
    }
    else {
      this.backToAtt = true;
    }

  }

  public generateGeoJSON(geometryString: string): any {
    let returnString = '{';
    returnString += '"type": "Point","coordinates": [';
    returnString += geometryString.replace('POINT (', '').replace('(', '').replace(')', '').split(' ')[0] + ',';
    returnString += geometryString.replace('POINT (', '').replace('(', '').replace(')', '').split(' ')[1];
    returnString += ']';
    returnString += '}';
    return returnString;
  }

  public generateCSVfile() {
    if (this.userDetails.Id != null) {
      if (this.userDetails.Employee.ReportTo.length > 0) {
        if (this.userDetails.Employee.ReportTo.filter(x => x.Status == true)[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
          this.getAllSupervisorEmployeesCSV();
        }
        else {
          this.getSupevisorEmployeesCSV();
        }
      } else {
        this.employeeList = [];
      }
    } else {
      this.getUserDetails();
    }
  }


  public getAllSupervisorEmployeesCSV() {
    this.supervisorListService.GetAllSupervisorHierarchyEmployeeListCSV(this.selectedDate).subscribe((data: IODataResult<IFgetemployeeLoginReport_Result[]>) => {
      let csvDocumentData: {
        "Employee No": number,
        "Employee Name": string,
        "Check-In Time": TimeRanges,
        "Check-Out Time": TimeRanges,
        "Status": string,
        "Staff Remarks": string,
        "Verification Remarks": string
      }[] = [];

      data.value.filter(x => x.EmployeeNo != 0).forEach(item => {
        csvDocumentData.push({
          "Employee No": item.EmployeeNo,
          "Employee Name": item.EmployeeName,
          "Check-In Time": item.CheckInTime,
          "Check-Out Time": item.CheckOutTime,
          "Status": item.StatusName,
          "Staff Remarks": item.StaffRemarks,
          "Verification Remarks": item.VerificationRemarks
        })
      })
      this.csvService.download(csvDocumentData, `Employee Login Report - ${this.selectedDate}`);
    })
  }

  public getSupevisorEmployeesCSV() {
    this.supervisorListService.GetSupervisorHierarchyEmployeeListCSV(this.userDetails.EmployeeId, this.selectedDate).subscribe((data: IODataResult<IFgetemployeeLoginReport_Result[]>) => {
      let csvDocumentData: {
        "Employee No": number,
        "Employee Name": string,
        "Check-In Time": TimeRanges,
        "Check-Out Time": TimeRanges,
        "Status": string,
        "Staff Remarks": string,
        "Verification Remarks": string
      }[] = [];

      data.value.filter(x => x.EmployeeNo != 0).forEach(item => {
        csvDocumentData.push({
          "Employee No": item.EmployeeNo,
          "Employee Name": item.EmployeeName,
          "Check-In Time": item.CheckInTime,
          "Check-Out Time": item.CheckOutTime,
          "Status": item.StatusName,
          "Staff Remarks": item.StaffRemarks,
          "Verification Remarks": item.VerificationRemarks
        })
      })
      this.csvService.download(csvDocumentData, `Employee Login Report - ${this.selectedDate}`);
    })
  }

  timeroutCtrl: any = null;
  filter() {
    var that = this;
    if (this.timeroutCtrl == null) {
      this.timeroutCtrl = setTimeout(() => {
        this.timeroutCtrl = null;
        that.pagination.CurrentPage = 1;
        that.getEmployeeList();
      }, 2000);
    }
  }

  selectedDept(deptId: string) {
    this.deptId = deptId;
    this.pagination.CurrentPage = 1;
    this.getEmployeeList();
  }

  selectedDesg(desgId: string) {
    this.desgId = desgId;
    this.pagination.CurrentPage = 1;
    this.getEmployeeList();
  }

}
