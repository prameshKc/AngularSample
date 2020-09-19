import { Component, ViewChild } from '@angular/core';
import { ToastyService, ToastOptions } from 'ngx-toasty';
import { ExcelService } from 'src/app/services/excel.service';
import * as excelToJson from "convert-excel-to-json";
import { ILoginLogImportVM, ICompanyVM } from 'src/app/models/ViewModels';
import * as XLSX from 'xlsx';
import { CommonService } from 'src/app/services/BaseService';
import { IDatePickerOptionsVM, IInputDateVM, ICalendarVM } from 'src/app/shared/datepicker/models/datepickerVM';
import { DatePickerService } from 'src/app/shared/datepicker/modules/datePickerService';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'loginImport',
  templateUrl: 'loginImport.html'
})
export class LoginImportComponent {

  errorExcelData: string;
  excelFile: any;
  excelData: any = [];
  excelDataCols: any = [];
  excelDataHeads: any = [];
  excelDataItems: any = [];

  excelLoginLog: ILoginLogImportVM[] = [];

  constructor(
    public toastyService: ToastyService,
    private dateService: DatePickerService,
    public excelService: ExcelService,
    public commonService: CommonService
  ) {
    this.defaultDateType = Number(localStorage.getItem('Param.DateType'));
  }


  selectFile(item: any, e: any) {
    var files = e.target.files;
    var file = files[0];
    if (files && file) {
      this.resetData();

      var reader = new FileReader();
      reader.onload = (e: any) => {
        const options: XLSX.ParsingOptions = {
          type: "binary",
          sheetStubs: false,
          cellDates: true,
          raw: true
        };
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, options);

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];

        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        this.excelDataItems = (XLSX.utils.sheet_to_json(ws, options));


        this.arrangeItems();
      };
      reader.readAsBinaryString(file);
    }
  }

  pushItem(item: any, isSignIn: boolean) {
    let newDate: Date;
    if (typeof item["Date(mm/dd/yyyy)"] == "string") {
      var x = item["Date(mm/dd/yyyy)"].split('/');
      newDate = new Date(x[2], x[0] - 1, x[1]);
    } else {
      newDate = item["Date(mm/dd/yyyy)"];
      newDate.setUTCSeconds(newDate.getUTCSeconds());
    }

    let signTime: Date;
    let signedTime: any;
    if (isSignIn) {
      signedTime = item.SignIn;
    } else {
      signedTime = item.SignOut;
    }
    let hours, minute, second;
    if (typeof signedTime == "string") {
      let newTime = signedTime.split(" ");
      hours = Number(newTime[0].split(":")[0]);
      minute = Number(newTime[0].split(":")[1]);
      second = Number(newTime[0].split(":")[2] ? newTime[0].split(":")[2] : "00");
      if (newTime[1] == "PM" && hours < 12) hours += 12;
    } else {
      let signTime: Date = new Date(signedTime);
      let signedDateTime = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      signedDateTime.setUTCHours(signTime.getUTCHours());
      signedDateTime.setUTCMinutes(signTime.getUTCMinutes());
      signedDateTime.setUTCSeconds(signTime.getUTCSeconds());

      hours = signedDateTime.getHours();
      minute = signedDateTime.getMinutes();
      second = signedDateTime.getSeconds();
    }

    signTime = new Date(newDate);
    signTime.setHours(hours);
    signTime.setMinutes(minute);
    signTime.setSeconds(second);

    let excelIObj: ILoginLogImportVM = <ILoginLogImportVM>{
      Staffno: item.EmployeeNo,
      Datetime: signTime,
      LoginDeviceId: 2
    }

    this.excelLoginLog.push(excelIObj);
  }

  arrangeItems() {
    this.excelLoginLog = [];
    this.excelDataItems.forEach(item => {
      if (item.SignIn && item.SignIn != 'NULL') {
        this.pushItem(item, true);
      }
      if (item.SignOut && item.SignOut != 'NULL') {
        this.pushItem(item, false);
      }
    });
    var BreakException = {};
    try {
      this.excelLoginLog.forEach(item => {
        if (this.checkValidity(item) == false) {
          this.errorExcelData = "Invalid data found. Please check excel data and try again.";
          item.isExcelInvalid = true;
        }

        if (this.errorExcelData) throw BreakException;
      })
    } catch (ex) {
      this.resetData();
      if (ex !== BreakException) throw ex;
    }
  }

  //check if excel data is of valid data type
  checkValidity(arg: any): arg is ILoginLogImportVM {
    if (
      arg &&
      arg.Staffno && typeof (arg.Staffno) == 'number' &&
      arg.Datetime
    ) {
      return true;
    } else {
      return false;
    }
  }

  // format for login log import
  exportAsXLSX(): void {
    let insentivesFormat = [{
      EmployeeNo: '',
      "Date(mm/dd/yyyy)": '',
      SignIn: '',
      SignOut: ''
    }]
    this.excelService.exportAsExcelFile(insentivesFormat, 'Attendance Excel Sample');
  }

  resetData() {
    this.excelFile = null;
    this.excelData = [];
    this.excelDataCols = [];
    this.excelDataHeads = [];
    this.excelDataItems = [];
    this.excelLoginLog = [];
  }

  savingLoad: boolean = false;
  saveCount: number = 0;
  errCount: number = 0;
  async saveExcel() {
    this.savingLoad = true;
    let saveLoginLog = [...this.excelLoginLog];
    this.saveCount = 0;
    this.errCount = 0;
    for (let i = 0, j = this.excelLoginLog.length; i < j; i += 100) {
      let temparray = saveLoginLog.slice(i, i + 100);
      // do whatever
      this.saveCount += temparray.length;
      await this.sendReq(temparray);
    }
  }

  sendReq(temparray): Promise<boolean> {
    return new Promise((res, rej) => {
      this.commonService.saveLoginLogImport(temparray).subscribe(data => {
        if (this.saveCount == this.excelLoginLog.length) {
          this.resetData();
          this.toastyService.success(<ToastOptions>{
            msg: "Saved successfully",
            theme: "bootstrap",
            timeout: 5000
          });
          this.savingLoad = false;
        }
        res(true);
      }, (err) => {
        this.errCount++;
        if (this.saveCount == this.excelLoginLog.length && this.errCount > 0) {
          this.toastyService.error(<ToastOptions>{
            msg: "Error occured while saving the data. Please try again.",
            theme: "bootstrap",
            timeout: 5000
          });
          this.savingLoad = false;
        }
        rej(true);
      })
    })


  }


  inputDate: IInputDateVM;
  defaultDateType: number;
  openRangeCalendar?: boolean;
  defaultDateOptions: IDatePickerOptionsVM;
  fromDateOptions: IDatePickerOptionsVM;
  tillDateOptions: IDatePickerOptionsVM;
  filterFromDate: IInputDateVM;
  filterToDate: IInputDateVM;
  filterStartDate: Date;
  filterEndDate: Date;

  @ViewChild('newManualJobRunModal', { static: false }) public newIncentivesImportModal: ModalDirective;
  openJobRunModal() {
    this.inputDate = this.dateService.getInputDate(new Date());
    this.newIncentivesImportModal.show();
    this.initialize();
  }

  hideJobRunModal() {
    this.newIncentivesImportModal.hide();
  }

  manualJobRun() {
    this.commonService.manualJobRun(this.filterStartDate, this.filterEndDate, this.CompanyId).subscribe(data => {
      this.toastyService.success(<ToastOptions>{
        msg: "Job Ran Successfully",
        theme: "bootstrap",
        timeout: 5000
      });
    }, (err) => {
      this.toastyService.error(<ToastOptions>{
        msg: "Error occured.",
        theme: "bootstrap",
        timeout: 5000
      });
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

    this.filterFromDate = this.dateService.getInputDate(startDate.Date);
    this.filterToDate = this.dateService.getInputDate(endDate.Date);

    this.defaultDateOptions = {
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    }

    this.getBranches();
  }


  //company branch list
  CBSelectIsExpand: boolean;
  CBList: ICompanyVM[] = [];
  svCBList: ICompanyVM[] = [];
  CompanyName: string;
  CompanyId: number;
  getBranches() {
    this.commonService.GetCompanyBranches().subscribe((data: ICompanyVM[]) => {
      this.svCBList = data;
      this.CBList = data.filter(x => x.isGroup == true);

      this.CBList.forEach(item => {
        item.isOpen = true;
        if (item.isGroup == true) {
          item.ChildCompany = data.filter(x => x.ParentId == item.CompanyId);
        }
      })
      //this.selectBranch(this.svCBList.filter(x => x.isGroup != true)[0]);
    });
  }

  selectBranch(company?: ICompanyVM) {
    if (company.ParentId != null) {
      this.CompanyName = company.CompanyName;
      this.CompanyId = company.CompanyId;
    }
  }


  onFilterDateSelect(event: IInputDateVM, flag: string) {
    if (flag == 'F') {
      this.filterFromDate = event;
      this.filterStartDate = new Date(event.Year, event.Month - 1, event.Date);
    } else if (flag == 'T') {
      this.filterToDate = event;
      this.filterEndDate = new Date(event.Year, event.Month - 1, event.Date);
    }
  }
}
