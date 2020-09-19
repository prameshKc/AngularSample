import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { UserService, HRMLedgerService, HRIncentiveService, ParamService, HRExpensesService } from '../../services/BaseService';
import { IUser, IEmployee, IPagination, IODataResult, IHRMLedger, IHRInsentive } from '../../models/Models';
import { IFilterViewModel, IHRInsentiveVM } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { IDatePickerOptionsVM, IInputDateVM, ICalendarVM } from '../../shared/datepicker/models/datepickerVM';
import { DatePickerService } from '../../shared/datepicker/modules/datePickerService';
import { ModalDirective } from 'ngx-bootstrap';
import { Utilities } from '../../shared/utilities';
import { ToastOptions, ToastyService } from 'ngx-toasty';
import { ExcelService } from '../../services/excel.service';

import * as excelToJson from "convert-excel-to-json";
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'employee-payroll',
  templateUrl: 'employeePayroll.html'
})
export class EmployeePayrollComponent implements OnInit {
  @Input() AM: number;

  userId: string;
  userDetails: IUser = <IUser>{};
  employeeList: IHRInsentiveVM[] = [];
  hrmLedgerList: IHRMLedger[] = [];
  isLoading: boolean = true;
  openRangeCalendar?: boolean;
  fromDateOptions: IDatePickerOptionsVM;
  tillDateOptions: IDatePickerOptionsVM;

  @ViewChild('newIncentivesModal', { static: false }) public newIncentivesModal: ModalDirective;
  @ViewChild('newIncentivesImportModal', { static: false }) public newIncentivesImportModal: ModalDirective;
  @ViewChild('modal', { static: false }) ModalDirective: any;
  selectedModalLoaded: boolean = false;

  // employee search variables
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
  defaultDateType: number;
  filterFromDate: IInputDateVM;
  filterToDate: IInputDateVM;
  defaultDateOptions: IDatePickerOptionsVM;

  // add incentive form variables
  InputHRIncentive: IHRInsentiveVM = <IHRInsentiveVM>{};
  validAmount: boolean = true;
  timerHandle: any;

  //pagination variables
  pagination?: IPagination = <IPagination>{
    CurrentPage: 1,
    ItemsPerPage: 50,
    TotalItems: 0
  };

  constructor(
    public userService: UserService,
    private dateService: DatePickerService,
    public hrIncentiveService: HRIncentiveService,
    public hrExpensesService: HRExpensesService,
    public hrmLedgerService: HRMLedgerService,
    public paramService: ParamService,
    public toastyService: ToastyService,
    public sanitizer: DomSanitizer,
    public excelService: ExcelService
  ) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.userId = localStorage.getItem('UserId');

    if (localStorage.getItem('Param.DateType') == null) {
      this.paramService.get(12, '$expand=ParamValue').subscribe(data => {
        this.defaultDateType = data.ParamValue.PValue;
        this.initialize();
        this.isLoading = false;
      })
    } else {
      this.defaultDateType = Number(localStorage.getItem('Param.DateType'));
      this.initialize();
      this.isLoading = false;
    }
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

    this.filterFromDate = this.dateService.getInputDate(startDate.Date);
    this.filterToDate = this.dateService.getInputDate(endDate.Date);

    this.defaultDateOptions = {
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    }
    this.getAllHRMLedger();
  }

  //openModal
  public openModal() {
    this.selectedModalLoaded = true;
    this.inputDate = this.dateService.getInputDate(new Date());
    this.newIncentivesModal.show();
  }

  public openEditModal(hrInsentive: IHRInsentiveVM) {
    let query: string = "$expand=Employee";
    if (this.AM == 6) {
      this.hrIncentiveService.get(hrInsentive.Id, query).subscribe((one: IHRInsentiveVM) => {
        this.InputHRIncentive = Object.assign({}, one);
        this.inputDate = this.dateService.getInputDate(new Date());
        this.InputHRIncentive.StaffId = one.StaffId;
        this.selectedModalLoaded = true;
        this.newIncentivesModal.show();
      });
    } else {
      this.hrExpensesService.get(hrInsentive.Id, query).subscribe((one: IHRInsentiveVM) => {
        this.InputHRIncentive = Object.assign({}, one);
        this.inputDate = this.dateService.getInputDate(new Date());
        this.InputHRIncentive.StaffId = one.StaffId;
        this.selectedModalLoaded = true;
        this.newIncentivesModal.show();
      });
    }
  }

  public hideModal() {
    this.newIncentivesModal.hide();
    this.InputHRIncentive = <IHRInsentiveVM>{};
    this.selectedModalLoaded = false;
  }

  public getAllHRMLedger() {
    let query: string = `$filter=AM eq ${this.AM}`;
    this.hrmLedgerService.getAll(query).subscribe((data) => {
      this.hrmLedgerList = data;
      this.pagination.SortBy = data[0].ALId.toString();
      //this.getUserDetails();
      this.getAllSupervisorEmployees();
    })
  }

  public getHRMLedger(id: number) {
    return this.hrmLedgerList.filter(x => x.ALId == id)[0].ALDesc;
  }

  public toggleSortBy() {
    this.pagination.CurrentPage = 1;
    //this.getEmployeeList();
    this.getAllSupervisorEmployees();
  }

  public getAllSupervisorEmployees() {
    if (this.pagination.SortBy != null) {
      if (this.AM <= 10) {
        this.hrIncentiveService.GetEmployeeInsentivesAll(this.pagination, this.filterObj, this.filterByName, this.filterStartDate, this.filterEndDate)
          .subscribe((data: IODataResult<IHRInsentiveVM[]>) => {
            this.pagination = {
              ItemsPerPage: this.pagination.ItemsPerPage,
              TotalItems: data.count,
              CurrentPage: this.pagination.CurrentPage,
              SortBy: this.pagination.SortBy
            };

            this.employeeList = data.value;
            this.isLoading = false;
          }, (err) => {
            this.isLoading = false;
          })
      } else {
        this.hrExpensesService.GetEmployeeExpensesAll(this.pagination, this.filterObj, this.filterByName, this.filterStartDate, this.filterEndDate)
          .subscribe((data: IODataResult<IHRInsentiveVM[]>) => {
            this.pagination = {
              ItemsPerPage: this.pagination.ItemsPerPage,
              TotalItems: data.count,
              CurrentPage: this.pagination.CurrentPage,
              SortBy: this.pagination.SortBy
            };

            this.employeeList = data.value;
            this.isLoading = false;
          }, (err) => {
            this.isLoading = false;
          })
      }
    }
  }

  public onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    //this.getEmployeeList();
    this.getAllSupervisorEmployees();
  }

  public selectedEmployee(event: IEmployee) {
    if (event != null) {
      this.filterByName = event.FirstName;
      if (event.MiddleName != null) {
        this.filterByName += " " + event.MiddleName;
      }
      if (event.LastName != null) {
        this.filterByName += " " + event.LastName;
      }
      this.onPageSelect(this.pagination);
    }
  }

  public onFilterDateSelect(event: IInputDateVM, flag: string) {
    if (flag == 'F') {
      this.filterFromDate = event;
      this.filterStartDate = new Date(event.Year, event.Month - 1, event.Date);
    } else if (flag == 'T') {
      this.filterToDate = event;
      this.filterEndDate = new Date(event.Year, event.Month - 1, event.Date);
    }
  }

  public onTDateSelect(selectedDate: IInputDateVM) {
    this.InputHRIncentive.TDate = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date, 5, 45, 0, 0);
    this.getData();
  }

  public onDateSelect(event: IInputDateVM, id: number) {
    this.employeeList.filter(x => x.StaffId == id)[0].TDate = new Date(event.Year, event.Month - 1, event.Date)
  }

  public checkMoney(amt: string, event: number) {
    clearTimeout(this.timerHandle);
    this.timerHandle = setTimeout(() => {
      if (event == 1) {
        if (amt == "") {
          this.validAmount = true;
        }
        else {
          this.validAmount = Utilities.isDecimal(amt);
        }
      }
    }, 1500);

  }

  public selectedEmployeeForm(event: IEmployee) {
    if (event != null) {
      this.InputHRIncentive.StaffId = event.EmployeeId;
    }
  }

  public isFormValid(bookForm: any): boolean {
    if (!bookForm.form.valid) {
      return false;
    }
    return true;
  }

  saveIncentive() {
    this.InputHRIncentive.PostedBy = this.userId;
    let saveItem: IHRInsentiveVM = Object.assign({}, this.InputHRIncentive);
    if (saveItem.Id == null) {
      saveItem.Id = 0;
    }
    if (this.AM == 6) {
      this.hrIncentiveService.post(saveItem).subscribe(() => {
        this.InputHRIncentive = <IHRInsentiveVM>{};
        this.hideModal();
        this.pagination.SortBy = saveItem.ALId;
        this.getAllSupervisorEmployees();

        var toastOptions: ToastOptions = {
          title: "Success",
          msg: "Employee Incentive Information has been successfully Added",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
      });
    } else {
      this.hrExpensesService.post(saveItem).subscribe(() => {
        this.InputHRIncentive = <IHRInsentiveVM>{};
        this.hideModal();
        this.pagination.SortBy = saveItem.ALId;
        this.getAllSupervisorEmployees();

        var toastOptions: ToastOptions = {
          title: "Success",
          msg: "Employee Expense Information has been successfully Added",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
      });
    }
  }

  openImportModal() {
    this.inputDate = this.dateService.getInputDate(new Date());
    this.InputHRIncentive.TDate = new Date();
    this.excelData = [];
    this.excelDataCols = [];
    this.excelDataHeads = [];
    this.excelDataItems = [];
    this.newIncentivesImportModal.show();
  }

  hideImportModal() {
    this.InputHRIncentive = <IHRInsentiveVM>{};
    this.excelFile = null;
    this.excelData = [];
    this.excelDataCols = [];
    this.excelDataHeads = [];
    this.excelDataItems = [];
    this.svInsentiveData = [];
    this.excelInsentives = [];
    this.newIncentivesImportModal.hide();
  }

  errorExcelData: string;
  excelFile: any;
  excelData: any = [];
  excelDataCols: any = [];
  excelDataHeads: any = [];
  excelDataItems: any = [];
  excelInsentives: IHRInsentiveVM[] = [];
  svInsentiveData: IHRInsentiveVM[] = [];

  selectFile(item: any, e: any) {
    let excelFile = e.target.files[0];
    var files = e.target.files;
    var file = files[0];
    var that = this;
    if (files && file) {
      this.excelData = [];
      this.excelDataCols = [];
      this.excelDataHeads = [];
      this.excelDataItems = [];
      var reader = new FileReader();
      reader.onload = function (e) {
        var base64textString = btoa(JSON.stringify(this.result));
        let data = excelToJson({
          source: base64textString
        });

        that.errorExcelData = null;
        if (excelFile.name.split('.')[1] == 'csv' || excelFile.name.split('.')[1] == 'xlsx') {
          that.excelData = data.Sheet1;
        } else if (excelFile.name.split('.')[1] == 'xls') {
          that.excelData = data.Worksheet;
        } else {
          that.excelFile = null;
          that.excelData = [];
          that.errorExcelData = 'Please select .xls/.xlsx/.csv file.';
        }

        that.excelData.forEach((item, i) => {
          if (i == 0) {
            that.excelDataHeads.push(item);
            JSON.stringify(item).split(',').forEach(col => {
              that.excelDataCols.push(col.split(':')[0].replace(/[^\w\s]/gi, ''));
            });
          } else {
            that.excelDataItems.push(item);
          }
        })
        that.arrangeItems();
      };
      reader.readAsBinaryString(file);
    }
  }

  arrangeItems() {
    this.excelInsentives = [];
    this.excelDataItems.forEach(item => {
      let excelIObj: IHRInsentiveVM = <IHRInsentiveVM>{};
      this.excelDataHeads.forEach(hitem => {
        this.excelDataCols.forEach(citem => {
          excelIObj[hitem[citem]] = item[citem];
        })
      })
      this.excelInsentives.push(excelIObj);
    });
    var BreakException = {};
    try {
      this.excelInsentives.forEach(item => {
        if (this.checkValidity(item) == false) this.errorExcelData = "Invalid data found. Please check excel data and try again.";
        if (this.errorExcelData) throw BreakException;
      })
    } catch (ex) {
      this.excelFile = null;
      this.excelData = [];
      this.excelDataCols = [];
      this.excelDataHeads = [];
      this.excelDataItems = [];
      this.excelInsentives = [];
      if (ex !== BreakException) throw ex;
    }
    this.checkExcelData();

  }

  subscription: Subscription;
  getData() {
    if (this.InputHRIncentive.TDate && this.InputHRIncentive.ALId) {
      this.svInsentiveData = [];
      if (this.subscription != null) {
        this.subscription.unsubscribe();
      }
      this.subscription = this.hrIncentiveService.GetInsentiveByDate(this.InputHRIncentive.ALId, this.InputHRIncentive.TDate).subscribe(data => {
        this.svInsentiveData = data;
        this.checkExcelData();
      })
    }
  }

  //check if excel data is of valid data type
  checkExcelData() {
    this.excelInsentives.forEach(eItem => {
      let itemList = this.svInsentiveData.filter(x => x.EmployeeNo == eItem.EmployeeNo);
      if (itemList.length > 0) {
        eItem.isExcelInvalid = itemList[0];
      } else {
        eItem.isExcelInvalid = null;
      }
    })
  }

  checkValidity(arg: any): arg is IHRInsentive {
    if (
      arg &&
      arg.EmployeeNo && typeof (arg.EmployeeNo) == 'number' &&
      arg.EmployeeName && typeof (arg.EmployeeName) == 'string' &&
      arg.Amount && typeof (arg.Amount) == 'number' &&
      arg.Rmrks && typeof (arg.Rmrks) == 'string'
    ) {
      return true;
    } else {
      return false;
    }
  }

  saveExcel() {
    let newSaveList: IHRInsentive[] = [];

    this.excelInsentives.forEach(item => {
      let saveItem: IHRInsentive = {
        ALId: this.InputHRIncentive.ALId,
        TDate: this.InputHRIncentive.TDate,
        Rmrks: item.Rmrks,
        StaffId: item.EmployeeNo,
        Amount: item.Amount,
        Id: item.isExcelInvalid != null ? item.isExcelInvalid.Id : 0,
        PostedBy: item.isExcelInvalid != null ? item.isExcelInvalid.PostedBy : this.userId,
        ModifiedBy: this.userId
      }
      newSaveList.push(saveItem)
    });

    this.hrIncentiveService.ImportFile(newSaveList).subscribe(data => {
      var toastOptions: ToastOptions = {
        title: "Success",
        msg: "Employee Incentive Information has been successfully Added",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.success(toastOptions);
      this.hideImportModal();
    }, (err) => {
      console.log(err);
      var toastOptions: ToastOptions = {
        title: "Error",
        msg: "Error occurred while trying to save excel file",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.error(toastOptions);
    });
  }

  exportAsXLSX(): void {
    let insentivesFormat = [{
      EmployeeNo: '123',
      EmployeeName: 'XYZ',
      Amount: '5000',
      Rmrks: 'This is a sample record'
    }]
    this.excelService.exportAsExcelFile(insentivesFormat, 'sample');
  }
}
