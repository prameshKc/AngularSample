import { Component, Injectable } from '@angular/core';
import {
  LeavePolicyEmployeeService, EmployeeHolidayListDataService, BSADCalService,
  CommonService, FiscalYearService, UserService
} from '../../services/BaseService';
import { IBSADCal, IFiscalYear, IUser } from '../../models/Models';
import { ILeavePolicyEmployeeVM, IEmployeeHolidayListData } from '../../models/ViewModels';

import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent {
  userId: string;
  currentEmpId: number;
  currentDate: Date;
  leavePolicyEmployeeList: ILeavePolicyEmployeeVM[] = [];
  employeeHolidayList: IEmployeeHolidayListData[] = [];
  isFiscalYear: boolean = false;
  userDetails: IUser = <IUser>{};
  showBirthdayNotification: boolean = false;

  constructor(
    private leavePolicyEmployeeService: LeavePolicyEmployeeService,
    private datePickerFunctions: DatePickerFunctions,
    private employeeHolidayListService: EmployeeHolidayListDataService,
    private bSADCalService: BSADCalService,
    private commonService: CommonService,
    private fiscalYearService: FiscalYearService,
    private userService: UserService
  ) {
    this.userId = localStorage.getItem('UserId');
    this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
    this.currentDate = new Date();
    this.isLeavePolicyFiscalYear();
    this.getEmployeeHolidayList();
    this.getUserDetails();
  }

  public getLeavePolicyEmployee() {
    this.getFiscalYear().then((data) => {
      let query: string = `$expand=LoginStatus &$filter=EmployeeId eq ${this.currentEmpId} and CalendarYear eq '${data}' &$orderby=EffectiveFrom`;
      this.leavePolicyEmployeeService.getAll(query).subscribe((list: any) => {
        this.leavePolicyEmployeeList = list;
        this.leavePolicyEmployeeList.forEach(item => {
          item.BalanceLeave = (Number(item.EligibleLeave) - Number(item.CosumeLeave)).toString();
        });
      });
    });
  }

  public getEmployeeHolidayList() {
    let newBSADDate = this.datePickerFunctions.getDate(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, this.currentDate.getDate(), 1);
    let calendarYear = this.datePickerFunctions.getBSYear(newBSADDate.DateBS);
    this.bSADCalService.get(calendarYear).subscribe((data: IBSADCal) => {
      this.employeeHolidayListService.GetEmployeeHolidayList(this.currentEmpId, this.currentDate, data.EndDate)
        .subscribe((data: IEmployeeHolidayListData[]) => {
          this.employeeHolidayList = data;
        });
    });
  }

  public isLeavePolicyFiscalYear() {
    this.commonService.getPValue('ILPFY').subscribe((data: string) => {
      if (data == "true") {
        this.isFiscalYear = true;
      }
      else {
        this.isFiscalYear = false;
      }
      this.getLeavePolicyEmployee();
    });
  }

  public getFiscalYear(): Promise<string> {
    return new Promise<string>((resolve) => {
      let calendarYear = new Date();
      let fiscalYear: string;

      if (this.isFiscalYear == false) {
        let newBSADDate = this.datePickerFunctions.getDate(calendarYear.getFullYear(), calendarYear.getMonth() + 1, calendarYear.getDate(), 1);
        fiscalYear = this.datePickerFunctions.getBSYear(newBSADDate.DateBS).toString();
        resolve(fiscalYear);
      }
      else {
        let leaveDateInString = this.getDateInString(new Date());
        let query = `$filter=StartDT le DateTime'${leaveDateInString}' and EndDt ge DateTime'${leaveDateInString}'`;
        this.fiscalYearService.getAll(query).subscribe((list: IFiscalYear[]) => {
          fiscalYear = list[0].FyName;
          resolve(fiscalYear);
        });
      }
    });
  }

  public getDateInString(data: Date): string {
    let input = new Date(data);
    var year = input.getFullYear();
    var month = input.getMonth() + 1;
    var date = input.getDate();
    var dateInString = date.toString();
    var monthInString = month.toString();

    if (date < 10) {
      dateInString = "0" + dateInString;
    }
    if (month < 10) {
      monthInString = "0" + monthInString;
    }
    let dateString = year.toString() + "-" + monthInString + "-" + dateInString;
    return dateString;
  }


  public getUserDetails() {
    //var query = "$expand=Employee,MenuTemplate/MenuVsTemplate";
    let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
    this.userService.get(this.userId, query).subscribe((data: IUser) => {
      this.userDetails = data;
      if (this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1100).length > 0) {
        this.showBirthdayNotification = true;
      }
      else {
        this.showBirthdayNotification = false;
      }
    })
  }
}
