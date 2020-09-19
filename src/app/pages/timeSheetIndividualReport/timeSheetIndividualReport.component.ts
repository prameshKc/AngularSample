import { Component } from '@angular/core';
import { TimeSheetService, JobCodeService, UserService, TimeSheetReportFService, ParamService, HRIncentiveService } from '../../services/BaseService';
import { IUser, IPagination, IfgetIndividualTimeSheet_Result } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';
import { IInputDateVM, IDatePickerOptionsVM, ICalendarVM } from '../../shared/datepicker/models/datepickerVM';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';

import { DatePickerService } from '../../shared/datepicker/modules/datePickerService';

@Component({
  templateUrl: 'timeSheetIndividualReport.component.html'
})
export class TimeSheetIndividualReportComponent {
  userId: string;

  userDetails: IUser = <IUser>{};
  isLoading: boolean = true;
  openRangeCalendar?: boolean;

  fromDateOptions: IDatePickerOptionsVM;
  tillDateOptions: IDatePickerOptionsVM;

  incorrectJobCode: boolean = false;
  isNotEightDigit: boolean = false;
  displayTimeList: IfgetIndividualTimeSheet_Result[] = [];
  filteredDisplayTimeList: IfgetIndividualTimeSheet_Result[] = [];
  selfRequest: boolean = false;
  employeeName: string;
  userDetail: IUser = <IUser>{};
  requiredEmployeeId: number;

  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };

  // filter variables
  filterObj: IFilterViewModel;
  filterByName: string;
  filterStartDate: Date;
  filterEndDate: Date;

  //datepicker variables
  inputDate: IInputDateVM;
  currentDateVM: IInputDateVM;
  defaultDateType: number;
  filterFromDate: IInputDateVM;
  filterToDate: IInputDateVM;
  defaultDateOptions: IDatePickerOptionsVM;
  inputDateOptions: IDatePickerOptionsVM;
  currentDate: Date = new Date();

  //pagination variables
  pagination?: IPagination = <IPagination>{
    CurrentPage: 1,
    ItemsPerPage: 50,
    TotalItems: 0
  };

  constructor(
    public timeSheetService: TimeSheetService,
    public jobCodeService: JobCodeService,
    public userService: UserService,
    public timeSheetReportFService: TimeSheetReportFService,
    private dateService: DatePickerService,
    public paramService: ParamService
  ) {
    this.currentDate.setHours(0, 0, 0, 0);
    this.inputDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.currentDateVM = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: this.currentDateVM
    };
  }


  ngOnInit() {
    this.isLoading = true;
    this.userId = localStorage.getItem('UserId');

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
    this.defaultDateOptions = {
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    }
    this.getTimeSheet();
  }

  public getTimeSheet(empId?: number) {
    let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));

    this.timeSheetReportFService.GetIndividualTimeSheet(this.filterStartDate, this.filterEndDate, this.pagination, empId).subscribe((data: any) => {
      this.displayTimeList = data.value;
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: <number>(data["odata.count"]),
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };
    });
  }

  public onFilterDateSelect(event: IInputDateVM, flag: string) {
    if (flag == 'F') {
      this.filterStartDate = new Date(event.Year, event.Month - 1, event.Date);
    } else if (flag == 'T') {
      this.filterEndDate = new Date(event.Year, event.Month - 1, event.Date);
    }
  }

  public selectedEmployee(event: any) {
    this.employeeName = "";
    if (event.FirstName != null) {
      this.employeeName += event.FirstName + " ";
    }
    if (event.MiddleName != null) {
      this.employeeName += event.MiddleName + " ";
    }
    if (event.LastName != null) {
      this.employeeName += event.LastName;
    }
    this.getTimeSheet(event.EmployeeId);
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.getTimeSheet();
  }
}
