import { Component, ViewChild } from '@angular/core';
import { ToastyService, ToastOptions } from 'ngx-toasty';
import {
  LeavePolicyEmployeeService, LoginStatusService,
  CommonService, LeavePolicyService, BSADCalService,
  UserService, EmployeeLeavePolicyReportService, FiscalYearService
} from '../../services/BaseService';

import {
  ILeavePolicyEmployee, IPagination, ILoginStatus,
  ILeavePolicy, IBSADCal, IUser, IODataResult,
  IFiscalYear
} from '../../models/Models';
import { ModalDirective } from 'ngx-bootstrap';
import { IFilterViewModel, IFgetFiscialyearID_Result } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';
import { Utilities } from '../../shared/utilities';
import { DatePickerService } from '../../shared/datepicker/modules/datePickerService';
import { Subscription } from 'rxjs';
import { BSADCal } from 'src/app/shared/datepicker/models/datepickerDataStore';

@Component({
  selector: 'leave-policy-employee',
  templateUrl: 'leavePolicyEmployee.component.html'
})
export class LeavePolicyEmployeeComponent {
  @ViewChild('LeavePolicyEmployeeModal', { static: false }) public LeavePolicyEmployeeModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirectiveLeavePolicy: any;
  selectedModalLoaded: boolean;

  isAddLeavePolicyEmployee: boolean = false;
  isEditLeavePolicyEmployee: boolean = false;
  isAddEditToggle: boolean = false;
  pagination?: IPagination;
  filterObj?: IFilterViewModel;
  userId: string;
  currentEmpId: number;
  leavePolicyEmployeeList: ILeavePolicyEmployee[] = [];
  InputLeavePolicyEmployee: ILeavePolicyEmployee = <ILeavePolicyEmployee>{};
  leaveTypeList: ILoginStatus[] = [];
  toggleSort: boolean = false;
  currentDate: Date;
  NepaliFiscalYear: IBSADCal = <IBSADCal>{};
  invalidEligibleLeave: boolean = false;
  validEligibleLeave: number;
  NepaliFiscalYearList: IBSADCal[];
  showLeaveType: boolean = false;
  inputEffectiveDate: IInputDateVM;
  inputEffectiveDateOptions: IDatePickerOptionsVM;
  selectedCalendarYear: IBSADCal = <IBSADCal>{};
  showLeavePolicy: ILeavePolicy = <ILeavePolicy>{};
  showLeaveTypeDetails: boolean = false;
  isDuplicateEntry: boolean = false;
  validFormatPreviousBal: boolean = true;
  validFormatEligibleLeave: boolean = true;
  validFormatEarnLeave: boolean = true;
  validFormatConsumeLeave: boolean = true;
  isAdmin: boolean = false;
  userDetails: IUser = <IUser>{};
  NepaliFiscalYear2: IFgetFiscialyearID_Result = <IFgetFiscialyearID_Result>{};
  NepaliFiscalYearList2: IFgetFiscialyearID_Result[] = [];
  isFiscalYear: boolean = true;
  selectedCalendarYear2: IFgetFiscialyearID_Result = <IFgetFiscialyearID_Result>{};

  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };

  constructor(
    public leavePolicyEmployeeService: LeavePolicyEmployeeService,
    public loginStatusService: LoginStatusService,
    public commonService: CommonService,
    public leavePolicyService: LeavePolicyService,
    public bSADCalService: BSADCalService,
    private userService: UserService,
    private employeeLeavePolicyReportService: EmployeeLeavePolicyReportService,
    private fiscalYearService: FiscalYearService,
    private toastyService: ToastyService,
    public dateService: DatePickerService
  ) {
    this.userId = localStorage.getItem('UserId');
    this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);

    this.inputEffectiveDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputEffectiveDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };
    this.filterObj = { Name: '', Sort: "false", SortingAttribute: "PostedOn", SearchBy: '' };
    //this.getAllLoginStatus();
    this.getAllNepaliCalendarFiscalYear();
    this.isLeavePolicyFiscalYear();
    this.getAllFiscalYear();
    //this.getAllLeavePolicyEmployee();
    this.dateType = Number(localStorage.getItem('Param.DateType'));
  }

  dateType: number;
  public getEmployeeId() {
    let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
    //var query = "$expand=Employee,Employee/ReportTo,MenuTemplate/MenuVsTemplate";
    this.userService.get(this.userId, query).subscribe((data: IUser) => {
      this.userDetails = data;
      this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
      let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
      this.getCurrentYear();

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

  public getAllLoginStatus(calendarYear: string) {
    let serviceTypeParam: string = "1,3";
    this.commonService.GetLeaveType(serviceTypeParam, this.isFiscalYear, calendarYear)
      .subscribe((data: ILoginStatus[]) => {
        this.leaveTypeList = data;
      });
  }

  public getAllNepaliCalendarFiscalYear() {
    this.NepaliFiscalYear = BSADCal.filter(x => new Date(x.StartDate).getTime() <= new Date(this.currentDate).getTime() && new Date(x.EndDate).getTime() >= new Date(this.currentDate).getTime())[0];
    let NepaliFiscalYear2 = BSADCal.filter(x => x.NYear == this.NepaliFiscalYear.NYear + 1)[0];
    //let NepaliFiscalYear3 = BSADCal.filter(x => x.NYear == this.NepaliFiscalYear.NYear - 1)[0] ? BSADCal.filter(x => x.NYear == this.NepaliFiscalYear.NYear - 1)[0] : null;
    this.NepaliFiscalYearList = [];
    //this.NepaliFiscalYearList.push(NepaliFiscalYear3);
    this.NepaliFiscalYearList.push(this.NepaliFiscalYear);
    this.NepaliFiscalYearList.push(NepaliFiscalYear2);

    //this.bSADCalService.getAll().subscribe((data) => {
    //  this.NepaliFiscalYear = data.filter(x => new Date(x.StartDate).getTime() <= new Date(this.currentDate).getTime() && new Date(x.EndDate).getTime() >= new Date(this.currentDate).getTime())[0];
    //  let NepaliFiscalYear2 = data.filter(x => x.NYear == this.NepaliFiscalYear.NYear + 1)[0];
    //  this.NepaliFiscalYearList = [];
    //  this.NepaliFiscalYearList.push(this.NepaliFiscalYear);
    //  this.NepaliFiscalYearList.push(NepaliFiscalYear2);
    //});
  }

  public getAllFiscalYear() {
    let date = new Date();
    this.commonService.getFiscalYear(date, 2).subscribe((data: IFgetFiscialyearID_Result[]) => {
      this.NepaliFiscalYear2 = data.filter(x => new Date(x.StartDT).getTime() <= new Date(this.currentDate).getTime() && new Date(x.EndDt).getTime() >= new Date(this.currentDate).getTime())[0];
      let id = this.NepaliFiscalYear2.FYID + 1;
      let NepaliFiscalYear2Second: IFgetFiscialyearID_Result;
      this.fiscalYearService.get(id).subscribe((one: IFiscalYear) => {
        NepaliFiscalYear2Second = one;
        this.NepaliFiscalYearList2 = [];
        this.NepaliFiscalYearList2.push(this.NepaliFiscalYear2);
        this.NepaliFiscalYearList2.push(NepaliFiscalYear2Second);
      });
    });
  }

  subscription: Subscription;
  public getAllLeavePolicyEmployee() {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
    this.leavePolicyEmployeeList = [];

    let currentEmpId = -1;
    if (this.isAdmin != true) {
      currentEmpId = this.currentEmpId;
    }
    this.subscription = this.employeeLeavePolicyReportService.GetEmployeeLeavePolicyReport(this.pagination, currentEmpId, this.filterObj, this.isFiscalYear, this.filterByYear).subscribe((data: IODataResult<ILeavePolicyEmployee[]>) => {
      this.leavePolicyEmployeeList = data.value ? data.value : [];
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: data.count,
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };
    });
  }

  public openAddModal() {
    this.isAddLeavePolicyEmployee = true;
    this.isEditLeavePolicyEmployee = false;
    this.selectedModalLoaded = true;
    this.InputLeavePolicyEmployee.PreviousBalance = "0";
    this.InputLeavePolicyEmployee.EarnLeave = "0";
    this.InputLeavePolicyEmployee.CosumeLeave = "0";
    this.LeavePolicyEmployeeModal.show();
  }

  public hideModal() {
    this.isAddLeavePolicyEmployee = false;
    this.isEditLeavePolicyEmployee = false;
    this.isAddEditToggle = false;
    this.selectedModalLoaded = false;
    this.InputLeavePolicyEmployee = <ILeavePolicyEmployee>{};
    this.invalidEligibleLeave = false;
    this.showLeaveType = false;
    this.showLeaveTypeDetails = false;
    this.isDuplicateEntry = false;
    this.validFormatPreviousBal = true;
    this.validFormatEligibleLeave = true;
    this.validFormatEarnLeave = true;
    this.validFormatConsumeLeave = true;
    this.LeavePolicyEmployeeModal.hide();
  }

  public saveLeavePolicyEmployee(saveData: ILeavePolicyEmployee) {
    let saveItem: ILeavePolicyEmployee;
    saveItem = {
      EmployeeId: saveData.EmployeeId,
      LeaveId: saveData.LeaveId,
      CalendarYear: saveData.CalendarYear,
      EffectiveFrom: saveData.EffectiveFrom,
      PreviousBalance: saveData.PreviousBalance,
      EligibleLeave: saveData.EligibleLeave,
      EarnLeave: saveData.EarnLeave,
      CosumeLeave: saveData.CosumeLeave,
      PostedOn: new Date(),
      PostedBy: this.userId,
      IsFiscalYear: this.isFiscalYear
    };
    this.leavePolicyEmployeeService.post(saveItem)
      .subscribe((data) => {
        this.isAddEditToggle = false;
        this.InputLeavePolicyEmployee = <ILeavePolicyEmployee>{};
        this.filterObj = { Name: '', Sort: "false", SortingAttribute: "PostedOn", SearchBy: '' };
        this.getAllLeavePolicyEmployee();
        this.hideModal();
        var toastOptions: ToastOptions = {
          title: "Added",
          msg: "Employee Leave Policy has been successfully Added",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
      });
  }

  public selectedEmployee(event: any) {
    this.InputLeavePolicyEmployee.EmployeeId = event.EmployeeId;
    if (this.InputLeavePolicyEmployee.CalendarYear != null && this.InputLeavePolicyEmployee.LeaveId != null && this.InputLeavePolicyEmployee.EmployeeId != null) {
      this.checkDuplicateEntry();
    }
  }

  public checkDuplicateEntry() {
    let query = `$filter=EmployeeId eq ${this.InputLeavePolicyEmployee.EmployeeId} and LeaveId eq ${this.InputLeavePolicyEmployee.LeaveId} and CalendarYear eq '${this.InputLeavePolicyEmployee.CalendarYear}'`;

    this.leavePolicyEmployeeService.getAll(query).subscribe((data: ILeavePolicyEmployee[]) => {
      if (data.length > 0) {
        this.isDuplicateEntry = true;
      }
      else {
        this.isDuplicateEntry = false;
      }
    });
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
    this.getAllLeavePolicyEmployee();
  }

  public onCalendarYearChange() {
    this.showLeaveType = true;
    this.getAllLoginStatus(this.InputLeavePolicyEmployee.CalendarYear);
    if (this.isFiscalYear == false) {
      this.selectedCalendarYear = this.NepaliFiscalYearList.filter(x => x.NYear == parseInt(this.InputLeavePolicyEmployee.CalendarYear))[0];
    }
    else {
      this.selectedCalendarYear2 = this.NepaliFiscalYearList2.filter(x => x.FyName == this.InputLeavePolicyEmployee.CalendarYear)[0];
    }
    if (this.InputLeavePolicyEmployee.CalendarYear != null && this.InputLeavePolicyEmployee.LeaveId != null && this.InputLeavePolicyEmployee.EmployeeId != null) {
      this.checkDuplicateEntry();
    }
    if (this.InputLeavePolicyEmployee.EligibleLeave != null && this.InputLeavePolicyEmployee.LeaveId != null) {
      this.onEligibleLeaveChange(this.InputLeavePolicyEmployee.EligibleLeave);
    }
    if (this.InputLeavePolicyEmployee.LeaveId != null) {
      this.onLeaveTypeChange(this.InputLeavePolicyEmployee.LeaveId);
    }
  }

  public onLeaveTypeChange(leaveId: number) {
    if (this.InputLeavePolicyEmployee.CalendarYear != null && this.InputLeavePolicyEmployee.LeaveId != null && this.InputLeavePolicyEmployee.EmployeeId != null) {
      this.checkDuplicateEntry();
    }
    let query = ``;
    if (this.isFiscalYear == false) {
      query += `$expand=LeaveServiceType &$filter=LeaveId eq ${leaveId} and EffectiveDate le DateTime'${this.selectedCalendarYear.StartDate}' and IsFiscalYear eq ${this.isFiscalYear}`;
    }
    else {
      query += `$expand=LeaveServiceType &$filter=LeaveId eq ${leaveId} and EffectiveDate le DateTime'${this.selectedCalendarYear2.StartDT}' and IsFiscalYear eq ${this.isFiscalYear}`;
    }
    query += `&$orderby=CalendarYear desc &$top=1`;
    this.leavePolicyService.getAll(query).subscribe((data: ILeavePolicy[]) => {
      this.showLeavePolicy = data[0];
      this.showLeaveTypeDetails = true;
    });
  }

  public onEligibleLeaveChange(event: any) {
    this.checkDecimal(this.InputLeavePolicyEmployee.EligibleLeave, 2);
    if (this.InputLeavePolicyEmployee.LeaveId != null) {
      let noOfDaysList = parseFloat(this.showLeavePolicy.NoOfDays.toString());
      if (this.validFormatEligibleLeave == true) {
        if (event <= noOfDaysList) {
          this.invalidEligibleLeave = false;
          this.InputLeavePolicyEmployee.EarnLeave = this.InputLeavePolicyEmployee.EligibleLeave;
        }
        else {
          this.invalidEligibleLeave = true;
          this.validEligibleLeave = Number(this.showLeavePolicy.NoOfDays);
        }
      }
    }
  }

  public onLeaveEffectiveDateSelect(selectedDate: IInputDateVM) {
    this.inputEffectiveDate = selectedDate;
    this.InputLeavePolicyEmployee.EffectiveFrom = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date, 5, 45, 0, 0);
  }

  public checkDecimal(input: string, inputType: number) {
    if (inputType == 1) {
      this.validFormatPreviousBal = Utilities.isDecimal(input);
    }
    if (inputType == 2) {
      this.validFormatEligibleLeave = Utilities.isDecimal(input);
    }
    if (inputType == 3) {
      this.validFormatEarnLeave = Utilities.isDecimal(input);
    }
    if (inputType == 4) {
      this.validFormatConsumeLeave = Utilities.isDecimal(input);
    }
  }

  public isLeavePolicyFiscalYear() {
    this.commonService.getPValue('ILPFY').subscribe((data: string) => {
      if (data == "true") {
        this.isFiscalYear = true;
      }
      else {
        this.isFiscalYear = false;
      }
    });
  }

  public isFormValid(bookForm: any): boolean {
    if (!this.validFormatPreviousBal) {
      return false;
    }
    if (!this.validFormatEligibleLeave) {
      return false;
    }
    if (!this.validFormatEarnLeave) {
      return false;
    }
    if (!this.validFormatConsumeLeave) {
      return false;
    }
    if (this.invalidEligibleLeave == true) {
      return false;
    }
    if (!bookForm.form.valid) {
      return false;
    }
    if (this.InputLeavePolicyEmployee.EmployeeId == null) {
      return false;
    }
    if (this.isDuplicateEntry == true) {
      return false;
    }
    return true;
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    if (this.userDetails.Employee != null) {
      this.getAllLeavePolicyEmployee();
    } else {
      this.getEmployeeId();
    }
  }

  filterByYear: string;
  year: number;
  YearList: string[];
  getCurrentYear() {
    this.dateType = Number(localStorage.getItem('Param.DateType'));
    //if (this.dateType == 1) {
    //  let engDate: Date = new Date();
    //  this.filterByYear = engDate.getFullYear();
    //} else {
    //  let nepDate = this.dateService.FGetDateBS(new Date());
    //  this.filterByYear = this.dateService.GetBSYear(nepDate);
    //}
    this.NepaliFiscalYearList2.forEach(item => {
      if (this.dateType == 1) {
        this.filterByYear = item.FYNameAD;
      } else {
        this.filterByYear = item.FyName;
      }
    })
    //this.yearSelect();
  }

  getYearList() {
    //this.YearList = [];
    //for (let i = -25; i <= 25; i++) {
    //  this.YearList.push((Number(this.filterByYear) + i).toString());
    //}
  }

  yearSelect() {
    //if (Object.assign({}, this.filterByYear) != this.year) {
    //  this.year = Object.assign({}, this.filterByYear);
    //  this.getYearList();
    //  console.log(Object.assign({}, this.filterByYear));
    //  this.getAllLeavePolicyEmployee();
    //}
    this.getAllLeavePolicyEmployee();
  }
}
