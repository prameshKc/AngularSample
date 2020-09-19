import { Component, Injectable, ViewChild } from '@angular/core';
import { HRAdvanceLoanService, PayrollService, HRAdvanceLoanRecordService, HRAdvanceLoanLogService } from '../../services/BaseService';
import { IPagination, IHRAdvanceLoan, IFGetAdvanceAllowanceType, IHRAdvanceLoanLog } from '../../models/Models';
import { IFilterViewModel, IFGetHRAdvanceLoanAll } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';
import { Utilities } from '../../shared/utilities';

@Component({
  templateUrl: 'hrAdvanceLoan.component.html',
})
export class HRAdvanceLoanComponent {
  isAddAdvanceLoanInfo: boolean = false;
  isEditAdvanceLoanInfo: boolean = false;
  isAddEditToggle: boolean = false;
  advanceLoanInfoList: IFGetHRAdvanceLoanAll[] = [];
  InputAdvanceLoanInfo: IHRAdvanceLoan = <IHRAdvanceLoan>{};
  InputAdvanceLoanInfoOld: IHRAdvanceLoan = <IHRAdvanceLoan>{};

  @ViewChild('advanceLoanInfoModal', { static: false }) public advanceLoanInfoModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selectedModalLoaded: boolean = false;
  deleteModalLoaded: boolean;


  userId: string;
  reqEmployeeId: number;
  toggleSort: boolean = false;
  currentDate: Date;
  validInstallment: boolean = true;
  validAmount: boolean = true;
  allowanceList: IFGetAdvanceAllowanceType[] = [];

  //searching and sorting
  filterObj?: IFilterViewModel;
  timeoutHandle: any;

  //for pagination
  pagination?: IPagination;

  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };

  //date picker inputs.
  inputDate: IInputDateVM;
  inputDateOptions: IDatePickerOptionsVM;

  constructor(
    private hRAdvanceLoanService: HRAdvanceLoanService,
    private hRAdvanceLoanLogService: HRAdvanceLoanLogService,
    private hrAdvanceLoanRecordService: HRAdvanceLoanRecordService,
    private payrollService: PayrollService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig
  ) {
    this.userId = localStorage.getItem('UserId');
    this.reqEmployeeId = parseInt(localStorage.getItem('EmployeeId'));
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
    this.currentDate = new Date();
    this.inputDate = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputDateOptions = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };
    this.getAdvanceAllowanceType();
  }

  public filterAdvanceLoanInfo() {
    clearTimeout(this.timeoutHandle);
    this.timeoutHandle = setTimeout(() => {
      this.resetPagination();
      this.getAllAdvanceLoanInfo(this.filterObj);
    }, 1500)
  }

  public advanceLoanInfoAndFilter() {
    this.resetPagination();
    this.filterObj = { Name: '', Sort: '' };
    this.getAllAdvanceLoanInfo();
  }

  public getAdvanceAllowanceType() {
    this.payrollService.getAdvanceAllowanceType().subscribe((list: IFGetAdvanceAllowanceType[]) => {
      this.allowanceList = list;
      this.getAllAdvanceLoanInfo();
    });
  }

  //getAll
  public getAllAdvanceLoanInfo(filterObj?: IFilterViewModel) {

    this.hrAdvanceLoanRecordService.GetAdvanceLoanList(this.pagination, filterObj).subscribe((data) => {
      this.pagination.TotalItems = data.count;
      this.advanceLoanInfoList = data.value;
    })
  }

  public getHRMLedger(id: number) {
    return this.allowanceList.filter(x => x.ALId == id)[0].ALDesc;
  }

  //openModal
  public openModal() {
    this.isAddAdvanceLoanInfo = true;
    this.isEditAdvanceLoanInfo = false;
    this.selectedModalLoaded = true;
    this.advanceLoanInfoModal.show();
  }

  public hideModal() {
    this.advanceLoanInfoModal.hide();
    this.isAddAdvanceLoanInfo = false;
    this.isEditAdvanceLoanInfo = false;
    this.isAddEditToggle = false;
    this.InputAdvanceLoanInfo = <IHRAdvanceLoan>{};
    this.selectedModalLoaded = false;
  }

  public saveAdvanceLoanInfo() {
    this.InputAdvanceLoanInfo.PostedBy = this.userId;
    let saveItem: IHRAdvanceLoan = Object.assign({}, this.InputAdvanceLoanInfo);

    this.hRAdvanceLoanService.post(saveItem).subscribe(() => {
      this.InputAdvanceLoanInfo = <IHRAdvanceLoan>{};
      this.isAddEditToggle = false;
      this.hideModal();
      this.getAllAdvanceLoanInfo();

      var toastOptions: ToastOptions = {
        title: "Success",
        msg: "Advance Loan Information has been successfully Added",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.success(toastOptions);
    });
  }

  //EditModal
  openEditModal() {
    this.isEditAdvanceLoanInfo = true;
    this.isAddAdvanceLoanInfo = false;
    this.selectedModalLoaded = true;
    this.advanceLoanInfoModal.show();
  }


  //getOne
  public getAdvanceLoanInfo(id: number) {
    let query = '$expand=Employee';
    this.hRAdvanceLoanService.get(id, query)
      .subscribe((one: IHRAdvanceLoan) => {
        this.InputAdvanceLoanInfoOld = Object.assign({}, one);
        this.InputAdvanceLoanInfo = Object.assign({}, one);
        this.inputDate = {
          Year: new Date(one.TDate).getFullYear(),
          Month: new Date(one.TDate).getMonth() + 1,
          Date: new Date(one.TDate).getDate()
        };
        this.isAddEditToggle = true;
        this.openEditModal();
      });
  }

  //edit
  public editAdvanceLoanInfo() {
    this.InputAdvanceLoanInfo.ModifiedBy = this.userId;
    let editItem: IHRAdvanceLoan = Object.assign({}, this.InputAdvanceLoanInfo);

    let oldAdvanceLoan: IHRAdvanceLoanLog = <IHRAdvanceLoanLog>{
      Id: 0,
      TDate: this.InputAdvanceLoanInfoOld.TDate,
      StaffId: this.InputAdvanceLoanInfoOld.StaffId,
      AlId: this.InputAdvanceLoanInfoOld.AlId,
      Installment: this.InputAdvanceLoanInfoOld.Installment,
      Amount: this.InputAdvanceLoanInfoOld.Amount,
      Remarks: this.InputAdvanceLoanInfoOld.Remarks,
      PostedOn: this.InputAdvanceLoanInfoOld.PostedOn,
      PostedBy: this.InputAdvanceLoanInfoOld.PostedBy,
      ModifiedOn: this.InputAdvanceLoanInfoOld.ModifiedOn,
      ModifiedBy: this.InputAdvanceLoanInfo.ModifiedBy
    }

    this.hRAdvanceLoanLogService.post(oldAdvanceLoan).subscribe(data => {
      this.hRAdvanceLoanService.put(editItem.Id, editItem).subscribe(() => {
        this.getAllAdvanceLoanInfo(this.filterObj);
        this.isEditAdvanceLoanInfo = false;
        this.InputAdvanceLoanInfo = <IHRAdvanceLoan>{};
        this.selectedModalLoaded = false;
        this.hideModal();

        var toastOptions: ToastOptions = {
          title: "Edited",
          msg: "Advance Loan Information has been successfully Edited",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
      }, (err) => {
        console.log(err);
        var toastOptions: ToastOptions = {
          title: "Error Occurred!",
          msg: "Sorry advance loan information could not be edited.",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.error(toastOptions);
      });
    }, (err) => {
      console.log(err);
      var toastOptions: ToastOptions = {
        title: "Error Occurred!",
        msg: "Sorry advance loan information could not be edited.",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.error(toastOptions);
    })


  }

  public selectedEmployee(event: any) {
    this.InputAdvanceLoanInfo.StaffId = event.EmployeeId;
  }

  public onTDateSelect(selectedDate: IInputDateVM) {
    this.InputAdvanceLoanInfo.TDate = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date, 5, 45, 0, 0);
  }

  public checkMoney(amt: string, event: number) {
    if (event == 1) {
      if (amt == "") {
        this.validAmount = true;
      }
      else {
        this.validAmount = Utilities.isDecimal(amt);
      }
    }
    if (event == 2) {
      if (amt == "") {
        this.validInstallment = true;
      }
      else {
        this.validInstallment = Utilities.isDecimal(amt);
      }
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
    this.getAllAdvanceLoanInfo(this.filterObj);
  }

  public resetPagination() {
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
  }

  public isFormValid(bookForm: any): boolean {
    if (!bookForm.form.valid) {
      return false;
    }
    return true;
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.getAllAdvanceLoanInfo(this.filterObj);
  }
}
