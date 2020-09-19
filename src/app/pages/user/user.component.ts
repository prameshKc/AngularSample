import { Component, ViewChild, Injectable, Input } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';

import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';

import { IUser, IPagination, IEmployee, IMenuTemplate, ILoginGroup, ILoginShift, IReportTo, IODataResult } from '../../models/Models';
import { UserService, EmployeeService, MenuTemplateService, SupervisorListService } from '../../services/BaseService';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';


import { ModalDirective } from 'ngx-bootstrap';
import { IFilterViewModel } from '../../models/ViewModels';

@Component({
  selector: 'user',
  templateUrl: 'user.component.html',
})
export class UserComponent {
  @Input() employeeId: number;
  isAddUser: boolean = false;
  isEditUser: boolean = false;
  titleToggle: boolean = null;
  openViewDetails: boolean = false;
  employeeList: IEmployee[];
  menuTemplateList: IMenuTemplate[];
  userList: IUser[] = [];
  uList: IUser[] = [];
  InputDetails: IUser = <IUser>{};
  ResetPasswordDetails: IUser = <IUser>{};
  openResetPassword: boolean = false;
  confirmPassword: string = '';
  confirmpwd: string = '';
  EmployeeObj: IEmployee;
  GroupObj: ILoginGroup = <ILoginGroup>{};
  ShiftObj: ILoginShift = <ILoginShift>{};
  userId: string = null;
  supervisorHierarchylist: IUser[] = [];
  allSupervisorHierarchylist: IUser[] = [];
  requiredEmployeeId: number = null;
  currentEmpId: number;
  userDetails: IUser = {};
  reportToList: IReportTo[] = [];
  isDuplicateUserName: boolean = false;
  isAdmin: boolean;

  //searching and sorting
  filterObj?: IFilterViewModel;

  //for pagination
  pagination?: IPagination;

  //date picker inputs.
  FromDate: IInputDateVM;
  fromDateOptions: IDatePickerOptionsVM;

  ToDate: IInputDateVM;
  toDateOptions: IDatePickerOptionsVM;
  inactive: boolean = false;
  active: boolean = true;
  statusId: number;

  public dt: Date = new Date();
  public minDate: Date = void 0;
  public events: any[];
  public tomorrow: Date;
  public afterTomorrow: Date;
  public dateDisabled: { date: Date, mode: string }[];
  public formats: string[] = ['DD-MM-YYYY', 'YYYY/MM/DD', 'DD.MM.YYYY',
    'shortDate'];
  public format: string = this.formats[0];
  public dateOptions: any = {
    formatYear: 'YY',
    startingDay: 1
  };
  private opened: boolean = false;
  toggleSort: boolean = false;


  @ViewChild('viewModal', { static: false }) public viewModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;

  /**
   * * modal popout for user details
   */
  openUserDetailsModal() {
    this.openViewDetails = true;
    if (this.viewModal != undefined) {
      this.viewModal.config.ignoreBackdropClick = true;
    }
    this.viewModal.show();
  }

  /**
   * to hide user details modal
   */

  public hideUserDetailsModal(): void {
    this.InputDetails = <IUser>{};
    this.viewModal.hide();
    this.openViewDetails = false;
  }

  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };

  constructor(
    public userService: UserService,
    public employeeService: EmployeeService,
    public menuTemplateService: MenuTemplateService,
    public supervisorListService: SupervisorListService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig
  ) {
    this.userId = localStorage.getItem('UserId');
    this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.getEmployee();
    //this.filterUser();
    this.getAllEmployees();
    this.getAllMenuTemplates();

    let currentDate: Date = new Date();
    this.FromDate = <IInputDateVM>{
      Year: currentDate.getFullYear(),
      Month: currentDate.getMonth() + 1,
      Date: currentDate.getDate()
    };
    this.fromDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

    this.ToDate = <IInputDateVM>{
      Year: currentDate.getFullYear(),
      Month: currentDate.getMonth() + 1,
      Date: currentDate.getDate()
    };
    this.toDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

    (this.tomorrow = new Date()).setDate(this.tomorrow.getDate() + 1);
    (this.afterTomorrow = new Date()).setDate(this.tomorrow.getDate() + 2);
    (this.minDate = new Date()).setDate(this.minDate.getDate() - 1000);
    (this.dateDisabled = []);
    this.events = [
      { date: this.tomorrow, status: 'full' },
      { date: this.afterTomorrow, status: 'partially' }
    ];
    //this.userId = localStorage.getItem('UserId');
    //this.getEmployee();
    this.EmployeeObj = { EmployeeId: null, EmployeeNo: null, FirstName: null, MiddleName: null, LastName: null, DateOfJoin: null, DateOfBirth: null, BloodGroup: null, GroupId: null, ReligionId: null, Street2: null, Street1: null, City: null, State: null, Country: null, PerStreet1: null, PerStreet2: null, PerCity: null, PerState: null, PerCountry: null, Email: null, Gender: null, ContactNumber: null, MobileNumber: null, COGNumber: null, PostedOn: null, Photo: null, PostedBy: null, ModifiedBy: null, ModifiedOn: null, Religion: null, LoginGroup: null, EmployeePosition: null, EmployeeShift: null, EmployeeWorkArea: null, Leave: null, Login: null, ReportTo: null, RosterDetail: null, User: null };
    //this.InputDetails = { UserId: null, Employee: null, EmployeeId: null, Username: null, Password: null, MenuTemplate: null, MenuTemplateId: null, IsUnlimited: null, FromDate: null, ToDate: null, IsActive: null, PostedBy: null, PostedOn: null, ModifiedBy: null, ModifiedOn: null }
  }

  public getDate(): number {
    return this.dt && this.dt.getTime() || new Date().getTime();
  }

  public today(): void {
    this.dt = new Date();
  }

  public d20090824(): void {
    this.dt = new Date(2009, 7, 24);
  }

  public disableTomorrow(): void {
    this.dateDisabled = [{ date: this.tomorrow, mode: 'day' }];
  }

  // todo: implement custom class cases
  public getDayClass(date: any, mode: string): string {
    if (mode === 'day') {
      let dayToCheck = new Date(date).setHours(0, 0, 0, 0);

      for (let event of this.events) {
        let currentDay = new Date(event.date).setHours(0, 0, 0, 0);

        if (dayToCheck === currentDay) {
          return event.status;
        }
      }
    }

    return '';
  }

  public disabled(date: Date, mode: string): boolean {
    return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
  }

  public open(): void {
    this.opened = !this.opened;
  }

  public clear(): void {
    this.dt = void 0;
    this.dateDisabled = undefined;
  }

  public toggleMin(): void {
    this.dt = new Date(this.minDate.valueOf());
  }


  public hideResetPassword() {
    this.openResetPassword = false;
    this.InputDetails = <IUser>{};
  }

  //filter
  public filterUser() {
    this.getAllUsers(this.filterObj);
  }

  public userAndFilter() {
    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
    this.filterUser();
  }

  public getEmployee() {
    let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
    this.userService.get(localStorage.getItem('UserId'), query).subscribe((data: IUser) => {
      this.userDetails = data;
      this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
      this.requiredEmployeeId = data.EmployeeId;
      //this.reportToList = data.Employee.ReportTo.filter(x => x.Status == true);
      let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
      this.getAllUsers(this.filterObj);
      if (currentReportTo.ReportTo1 == 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
      ) {
        this.isAdmin = true;
      }
      else {
        this.isAdmin = false;
      }
    })
  }

  public getAllUsers(filterObj?: IFilterViewModel) {
    if (this.active == true) {
      this.statusId = 1;
    }
    if (this.inactive == true) {
      this.statusId = 2;
    }
    let currentEmpId;
    if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
      currentEmpId = -1;
    } else {
      currentEmpId = this.currentEmpId;
    }
    this.supervisorListService.GetUserHierarchy(this.statusId, this.pagination, currentEmpId, filterObj).subscribe((data: IODataResult<IUser[]>) => {
      this.userList = data.value;
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: data.count,
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };
    });
  }

  checkIfUserExists() {
    let query = '$expand=User'
    this.employeeService.get(this.employeeId, query).subscribe((data: IEmployee) => {
      if (data.User.length > 0) {
        this.EmployeeObj = data;
        this.InputDetails = data.User[0];
        this.titleToggle = false;
      } else {
        this.titleToggle = true;
      }
    })
  }

  public selectedEmployee(event: IEmployee) {
    if (event != null) {
      this.employeeId = event.EmployeeId;
    }
    this.checkIfUserExists();
  }



  public getAllEmployees() {
    this.employeeService.getAll().subscribe((data: IEmployee[]) => {
      this.employeeList = data;
    })
  }

  public getAllMenuTemplates() {
    this.menuTemplateService.getAll().subscribe((data: IMenuTemplate[]) => {
      this.menuTemplateList = data;
    })
  }

  public clearForm() {
    this.titleToggle = null;
    this.confirmpwd = '';
    this.InputDetails = <IUser>{};
  }

  public addForm() {
    this.titleToggle = true;
    this.InputDetails = <IUser>{};
  }

  onFromDateSelect(selectedDate: IInputDateVM) {
    this.FromDate = selectedDate;
    this.InputDetails.FromDate = new Date(this.FromDate.Year, this.FromDate.Month - 1, this.FromDate.Date, 5, 45, 0, 0);
  }

  onToDateSelect(selectedDate: IInputDateVM) {
    this.ToDate = selectedDate;
    this.InputDetails.ToDate = new Date(this.ToDate.Year, this.ToDate.Month - 1, this.ToDate.Date, 5, 45, 0, 0);
  }

  /**
   * Register user
   * @param InputDetails
   */
  public saveUser(InputDetails: IUser) {
    this.InputDetails.EmployeeId = this.employeeId;
    this.InputDetails.PostedBy = this.userId;
    this.InputDetails.FromDate = new Date(this.FromDate.Year, this.FromDate.Month - 1, this.FromDate.Date, 5, 45, 0, 0);
    this.InputDetails.ToDate = new Date(this.ToDate.Year, this.ToDate.Month - 1, this.ToDate.Date, 5, 45, 0, 0);
    this.userService.post(InputDetails).subscribe(() => {
      var toastOptions: ToastOptions = {
        title: "Success",
        msg: "User has been successfully registered",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap',
        onAdd: (toast: ToastData) => {
        },
        onRemove: function (toast: ToastData) {
        }
      };
      this.toastyService.success(toastOptions);
      this.InputDetails = <IUser>{};
      this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
      this.getAllUsers(this.filterObj);
      this.titleToggle = null;
    })

  }

  /**
   * Edit User
   * @param InputDetails
   */

  public getUser(Id?: string) {
    var query = "$expand=Employee,MenuTemplate,Employee/LoginGroup/LoginShift";
    this.userService.get(Id, query).subscribe((data: IUser) => {
      this.InputDetails = data;
      let currentDate = new Date();
      let fromDate = new Date(data.FromDate);
      let toDate = new Date(data.ToDate);

      if (data.IsUnlimited == true && data.Employee.Status == 1) {
        data.IsActive = true;
      }
      else {
        if (currentDate >= fromDate && currentDate < toDate && data.Employee.Status == 1) {
          data.IsActive = true;
        }
        else {
          data.IsActive = false;
        }
      }
      this.FromDate = {
        Year: fromDate.getFullYear(),
        Month: fromDate.getMonth() + 1,
        Date: fromDate.getDate()
      };
      this.ToDate = {
        Year: toDate.getFullYear(),
        Month: toDate.getMonth() + 1,
        Date: toDate.getDate()
      };


      //if (data.Employee.Status == 1 && ) {
      //    this.InputDetails.IsActive = true;
      //}
      //else {
      //    this.InputDetails.IsActive = false;
      //}
      this.InputDetails.IsActive
      this.ResetPasswordDetails.UserName = data.UserName;
      this.EmployeeObj.EmployeeNo = data.Employee.EmployeeNo;
      this.EmployeeObj.FirstName = data.Employee.FirstName;
      this.EmployeeObj.MiddleName = data.Employee.MiddleName;
      this.EmployeeObj.LastName = data.Employee.LastName;
      this.EmployeeObj.Gender = data.Employee.Gender;
      this.EmployeeObj.DateOfBirth = data.Employee.DateOfBirth;
      this.EmployeeObj.Email = data.Employee.Email;
      this.EmployeeObj.MobileNumber = data.Employee.MobileNumber;
      this.EmployeeObj.Photo = data.Employee.Photo;
      //this.GroupObj.GroupName = data.Employee.LoginGroup.GroupName;
      //this.GroupObj.DefaultOfficeHourFrom = this.convertFromTimeSpanFormat(data.Employee.LoginGroup.DefaultOfficeHourFrom);
      //this.GroupObj.DefaultOfficeHourTill = this.convertFromTimeSpanFormat(data.Employee.LoginGroup.DefaultOfficeHourTill);
      //this.ShiftObj.ShiftName = data.Employee.LoginGroup.LoginShift.ShiftName;
    })
  }


  /**
   * Edit User
   * @param InputDetails
   */
  public editUser(InputDetails: IUser) {
    let userObj: IUser = {
      AccessFailedCount: InputDetails.AccessFailedCount,
      Email: InputDetails.Email,
      EmailConfirmed: InputDetails.EmailConfirmed,
      EmployeeId: InputDetails.EmployeeId,
      FromDate: InputDetails.FromDate,
      Id: InputDetails.Id,
      IsActive: InputDetails.IsActive,
      IsUnlimited: InputDetails.IsUnlimited,
      LockoutEnabled: InputDetails.LockoutEnabled,
      LockoutEndDateUtc: InputDetails.LockoutEndDateUtc,
      MenuTemplateId: InputDetails.MenuTemplateId,
      ModifiedBy: this.userId,
      ModifiedOn: InputDetails.ModifiedOn,
      PasswordHash: InputDetails.PasswordHash,
      PhoneNumber: InputDetails.PhoneNumber,
      PhoneNumberConfirmed: InputDetails.PhoneNumberConfirmed,
      PostedBy: InputDetails.PostedBy,
      PostedOn: InputDetails.PostedOn,
      SecurityStamp: InputDetails.SecurityStamp,
      ToDate: InputDetails.ToDate,
      TwoFactorEnabled: InputDetails.TwoFactorEnabled,
      UserName: InputDetails.UserName
    }
    this.userService.put(userObj.Id, userObj).subscribe(() => {
      var toastOptions: ToastOptions = {
        title: "Success",
        msg: "User details has been successfully updated",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap',
        onAdd: (toast: ToastData) => {
        },
        onRemove: function (toast: ToastData) {
        }
      };
      this.toastyService.success(toastOptions);
      this.titleToggle = null;
      this.InputDetails = <IUser>{};
      this.filterObj = { Name: "", Sort: "false", SortingAttribute: "ModifiedOn", SearchBy: null };
      this.getAllUsers(this.filterObj);
    })
  }

  public resetPassword(ResetPasswordDetails: IUser) {
    let userObj: IUser = {
      Id: this.InputDetails.Id,
      EmployeeId: this.InputDetails.EmployeeId,
      UserName: this.InputDetails.UserName,
      PasswordHash: ResetPasswordDetails.PasswordHash,
      MenuTemplateId: this.InputDetails.MenuTemplateId,
      IsUnlimited: this.InputDetails.IsUnlimited,
      FromDate: this.InputDetails.FromDate,
      ToDate: this.InputDetails.ToDate,
      IsActive: this.InputDetails.IsActive,
      PostedBy: this.InputDetails.PostedBy,
      PostedOn: this.InputDetails.PostedOn,
      ModifiedBy: this.InputDetails.ModifiedBy,
      ModifiedOn: this.InputDetails.ModifiedOn
    };
    this.userService.put("rp", userObj).subscribe(() => {
      var toastOptions: ToastOptions = {
        title: "Success",
        msg: "Password has been reset successfully",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap',
        onAdd: (toast: ToastData) => {
        },
        onRemove: function (toast: ToastData) {
        }
      };
      this.toastyService.success(toastOptions);
      this.openResetPassword = false;
      this.ResetPasswordDetails = <IUser>{};
      this.confirmPassword = '';
      this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
      this.getAllUsers(this.filterObj);
    })
  }


  //used only for table display
  convertFromTimeSpanFormat(date: any): string {

    var time = date.split('PT');
    var c = time[1].split(/[A-Z]/);
    if (c[0] > 12 && c[0] < 24) {
      if (c[1] == "") {
        var time2 = c[0] - 12 + ":" + "00" + " " + "PM";
      }
      else {
        if (c[1] > 9) {
          var time2 = c[0] - 12 + ":" + c[1] + " " + "PM";
        }
        else {
          var time2 = c[0] - 12 + ":0" + c[1] + " " + "PM";
        }
      }
    }
    else if (c[0] < 12 && c[0] > 0) {

      if (c[1] == "") {
        var time2 = c[0] + ":" + "00" + " " + "AM";
      }
      else {
        if (c[1] > 9) {
          var time2 = c[0] + ":" + c[1] + " " + "AM";
        }
        else {
          var time2 = c[0] + ":0" + c[1] + " " + "AM";
        }
      }
    }

    else {
      if (c[0] == 12) {
        if (c[1] == "") {
          var time2 = "12" + ":" + "00" + " " + "PM";
        }
        else {
          if (c[1] > 9) {
            var time2 = "12" + ":" + c[1] + " " + "PM";
          }
          else {
            var time2 = "12" + ":0" + c[1] + " " + "PM";
          }
        }
      }
      else {
        if (c[1] == "") {
          var time2 = "12" + ":" + "00" + " " + "AM";
        }
        else {
          if (c[1] > 9) {
            var time2 = "12" + ":" + c[1] + " " + "AM";
          }
          else {
            var time2 = "12" + ":0" + c[1] + " " + "AM";
          }
        }
      }
    }
    return time2;
  }

  public duplicateUserName(event: any) {
    let query = `$filter=UserName eq '${event}'`;
    this.userService.getAll(query).subscribe((data: IUser[]) => {
      if (data.length > 0) {
        this.isDuplicateUserName = true;
      }
      else {
        this.isDuplicateUserName = false;
      }
    });
    //this.userList.filter(x => x.UserName == event).length > 0 ? this.isDuplicateUserName = true : this.isDuplicateUserName = false;
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    if (this.userDetails.Employee != null) {
      this.getAllUsers(this.filterObj);
    } else {
      this.getEmployee();
    }
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
    this.getAllUsers(this.filterObj);
  }

  public getActiveEmployee() {
    this.active = true;
    this.inactive = false;
    this.getAllUsers(this.filterObj);
  }

  public getInactiveEmployee() {
    this.active = false;
    this.inactive = true;
    this.getAllUsers(this.filterObj);
  }
}

