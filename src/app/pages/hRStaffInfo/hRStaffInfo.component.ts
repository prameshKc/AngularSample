import { Component, Injectable, ViewChild } from '@angular/core';
import {
  HRStaffInfoService, UserService, EmployeeListWithFilterService,
  DepartmentService, DesignationService, HRMLevelService,
  HRMGradeService, HRBankInfoService, PayrollService,
  HRStaffVSAllowanceService, HRStaffInfoLogService, HRStaffVSAllowanceLogService,
  HRInsuranceService, CommonService, NavLedgerService, CompanyService, HRMLedgerService
} from '../../services/BaseService';
import {
  IHRStaffInfo, IPagination, IUser,
  IODataResult, IDepartment, IDesignation,
  IEmployee, IHRMLevel, IHRMGrade,
  IHRBankInfo, IFGetledgerAllowanceAmountTB_Result, IHRStaffVsAllowance,
  IHRStaffInfoLog, IHRStaffVsAllowanceLog, IHRInsurance, INavLedger, ICompany, IHRMLedger, IHRStaffInfoNav,
} from '../../models/Models';
import { IFilterViewModel, IEmployeeWithEmpPosVM, IFgetFiscialyearID_Result } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { Utilities } from '../../shared/utilities';
import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
  templateUrl: 'hRStaffInfo.component.html'
})
export class HRStaffInfoComponent {
  isAddStaffInfo: boolean = false;
  isEditStaffInfo: boolean = false;
  isAddEditToggle: boolean = false;
  staffInfoList: IHRStaffInfo[] = [];
  InputStaffInfo: IHRStaffInfo = <IHRStaffInfo>{};
  copyStaffInfo: IHRStaffInfo = <IHRStaffInfo>{};

  userDetails: IUser = <IUser>{};
  currentEmpId: number;
  isAdmin: boolean = false;
  employeeList: IEmployeeWithEmpPosVM[] = [];

  @ViewChild('staffInfoModal', { static: false }) public staffInfoModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selectedModalLoaded: boolean = false;
  deleteModalLoaded: boolean = false;

  userId: string;
  toggleSort: boolean = false;
  changedDept() { }
  changedDesignation() { }

  //searching and sorting
  filterObjForEmpList?: IFilterViewModel;
  filterNoSalDetail?: boolean = false;

  //for pagination
  empPagination?: IPagination;

  filterByName: string;
  filterByDesignation: string = "-1";
  filterByDepartment: string = "-1";
  departmentList: IDepartment[] = [];
  designationList: IDesignation[] = [];
  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };

  levelList: IHRMLevel[] = [];
  gradeList: IHRMGrade[] = [];
  bankList: IHRBankInfo[] = [];
  ledgerAllowanceAmountList: IFGetledgerAllowanceAmountTB_Result[] = [];
  copyLedgerAllowanceList: IFGetledgerAllowanceAmountTB_Result[] = [];
  currentDate: Date;
  
  validFA: boolean = true;
  validExtGrade: boolean = true;
  validPF: boolean = true;
  validCIT: boolean = true;
  validPremium: boolean = true;
  staffId: number;
  staffName: string;

  //insurance
  @ViewChild('insuranceModal', { static: false }) public insuranceModal: ModalDirective
  @ViewChild('modal', { static: false })
  InsuranceModalDirective: any;
  insuranceModalLoaded: boolean = false;

  isInsuranceAddEditToggle: boolean = false;
  InputInsurance: IHRInsurance = <IHRInsurance>{};
  InsuranceList: IHRInsurance[] = [];
  fiscalYearList: IFgetFiscialyearID_Result[] = [];
  addNewFieldValue: boolean = false;
  deleteItemList: number[] = [];

  constructor(
    public hRStaffInfoService: HRStaffInfoService,
    private userService: UserService,
    private empListService: EmployeeListWithFilterService,
    private departmentService: DepartmentService,
    private designationService: DesignationService,
    private ledgerService: HRMLedgerService,
    private levelService: HRMLevelService,
    private gradeService: HRMGradeService,
    private bankService: HRBankInfoService,
    private staffVsAllowanceService: HRStaffVSAllowanceService,
    private staffInfoLogService: HRStaffInfoLogService,
    private staffVsAllowanceLogService: HRStaffVSAllowanceLogService,
    private payrollService: PayrollService,
    private hrInsuranceService: HRInsuranceService,
    private commonService: CommonService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private navLedgerService: NavLedgerService,
    private companyService: CompanyService
  ) {
    this.userId = localStorage.getItem('UserId');
    this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
    this.currentDate = new Date();
    this.empPagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.filterObjForEmpList = { Name: '', Sort: 'True', SortingAttribute: 'FirstName', SearchBy: '' };
    this.getAllDepartment();
    this.getAllDesignation();
    this.getAllLevel();
    this.getAllGrade();
    this.getAllBankInfo();
    this.getAllFiscalYear();
    this.getMBSNMValue();
    this.getFAValue();
  }

  public staffInfoAndFilter() {
    this.resetPagination();
    this.filterObjForEmpList = { Name: '', Sort: 'True', SortingAttribute: 'FirstName', SearchBy: '' };
    this.onEmpPageSelect(this.empPagination);
  }

  navLedgerEnabled: boolean;
  ledgerList: IHRMLedger[];
  navLedgerList: INavLedger[];
  getMBSNMValue() {
    this.commonService.getPValue('MBSNM').subscribe(data => {
      this.navLedgerEnabled = data == 'true' ? true : false;

      this.getCompany();
    })
  }

  branchId: number = Number(localStorage.getItem('Branch'));
  getCompany() {
    this.commonService.getMainCompanyByBranchId(this.branchId).subscribe((companyId: number) => {
      this.getHRMLedgerList(companyId);
    })
  }

  // check if food allowance is enabled
  paramFoodAllowanceEnabled: boolean;
  getFAValue() {
    this.commonService.getPValue('FA').subscribe(data => {
      this.paramFoodAllowanceEnabled = data == 'true' ? true : false;
    })
  }

  getHRMLedgerList(companyId: number) {
    if (this.navLedgerEnabled == true) {
      let queryLedger = `$filter=MultipleNav eq true`;
      this.ledgerService.getAll(queryLedger).subscribe(ledgerData => {
        this.ledgerList = ledgerData;

        let query = this.navLedgerEnabled == true ? `$filter=CompanyId eq ${companyId}` : '';
        this.navLedgerService.getAll(query).subscribe((data: INavLedger[]) => {
          this.navLedgerList = [...data];
          this.ledgerList.map(item => {
            item.NavLedger = this.navLedgerList.filter(x => x.ALId == item.ALId);
            return item;
          })
        });
      });
    } else {
      this.ledgerList = [];
    }

  }

  public getUserDetails() {
    var query = "$select=Employee/ReportTo,MenuTemplate/MenuVsTemplate&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate";
    this.userService.get(this.userId, query).subscribe((data: IUser) => {
      this.userDetails = data;
      this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);

      let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
      if (currentReportTo.ReportTo1 == 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0) {
        this.isAdmin = true;
      }
      else {
        this.isAdmin = false;
      }
      this.getEmployeeDetails(this.filterObjForEmpList);
    });
  }

  public getAllDepartment() {
    this.departmentService.getAll().subscribe((list: IDepartment[]) => {
      this.departmentList = list;
    });
  }
  public getAllDesignation() {
    this.designationService.getAll().subscribe((list: IDesignation[]) => {
      this.designationList = list;
    });
  }

  public reset() {
    this.filterByName = null;
    this.filterByDepartment = "-1";
    this.filterByDesignation = "-1";
    this.onEmpPageSelect(this.empPagination);
  }

  public selectedEmployee() {
    this.onEmpPageSelect(this.empPagination);
  }

  public getEmployeeDetails(filterObjForEmpList: IFilterViewModel) {
    this.filterByName = this.filterByName != '' ? this.filterByName : null;
    let currentEmpId: number;
    if (this.isAdmin) {
      currentEmpId = -1;
    }
    else {
      currentEmpId = this.currentEmpId;
    }
    this.empListService.GetEmployeeList(currentEmpId, this.empPagination, filterObjForEmpList, 1, this.filterByName, this.filterByDesignation, this.filterByDepartment, this.filterNoSalDetail).subscribe((data: IODataResult<IEmployeeWithEmpPosVM[]>) => {
      this.employeeList = data.value;
      this.empPagination = {
        ItemsPerPage: this.empPagination.ItemsPerPage,
        TotalItems: data.count,
        CurrentPage: this.empPagination.CurrentPage,
        SortBy: this.empPagination.SortBy
      };
    });
  }

  public sortBy(sortBy: string) {
    this.toggleSort = !this.toggleSort;
    if (this.toggleSort == true) {
      this.filterObjForEmpList.Sort = "true";
    }
    else {
      this.filterObjForEmpList.Sort = "false";
    }

    this.filterObjForEmpList.SortingAttribute = sortBy;
    this.onEmpPageSelect(this.empPagination);
  }

  onEmpPageSelect(pagination: IPagination) {
    this.empPagination = pagination;
    if (this.userDetails.Employee != null) {
      this.getEmployeeDetails(this.filterObjForEmpList);
    } else {
      this.getUserDetails();
    }
  }

  //openModal
  public openSalaryModal(empId: number, empName: string) {
    this.staffName = empName;
    this.staffId = empId;
    this.isAddStaffInfo = true;
    this.isEditStaffInfo = false;

    let query = `$expand=HRStaffInfoNav&$filter=StaffId eq ${empId}`;
    this.hRStaffInfoService.getAll(query).subscribe((list: IHRStaffInfo[]) => {
      if (list.length > 0) {
        this.isAddEditToggle = true;
        this.InputStaffInfo = <IHRStaffInfo>list[0];
        Object.assign(this.copyStaffInfo, this.InputStaffInfo);
        this.payrollService.getStaffAllowanceAmount(empId).subscribe((list: IFGetledgerAllowanceAmountTB_Result[]) => {
          this.ledgerAllowanceAmountList = list;
          this.copyLedgerAllowanceList = list;
        });
      }
      else {
        this.InputStaffInfo = <IHRStaffInfo>{};
        this.InputStaffInfo.HRStaffInfoNav = [];
        this.isAddEditToggle = false;
      }
      this.ledgerList.map(item => {
        if (this.InputStaffInfo.HRStaffInfoNav.filter(x => x.ALId == item.ALId).length == 0) {
          let pItem: IHRStaffInfoNav = {
            Id: 0,
            StaffId: empId,
            ALId: item.ALId,
            CompanyId: this.branchId,
            NavLedgerId: null,
          }
          this.InputStaffInfo.HRStaffInfoNav.push(pItem);
        } else {
          this.InputStaffInfo.HRStaffInfoNav.filter(x => x.ALId == item.ALId).map(x => {
            item.NavLedgerId = x.NavLedgerId;
          });
        }
        return item;
      });
      this.selectedModalLoaded = true;
      this.staffInfoModal.show();
    });
  }

  public hideSalaryModal() {
    this.staffInfoModal.hide();
    this.isAddStaffInfo = false;
    this.isEditStaffInfo = false;
    this.isAddEditToggle = false;
    this.InputStaffInfo = <IHRStaffInfo>{};
    this.InputStaffInfo.HRStaffInfoNav = [];
    this.selectedModalLoaded = false;
    this.validExtGrade = true;
    this.validPF = true;
    this.validCIT = true;
    this.ledgerAllowanceAmountList = [];
    this.ledgerList.map(item => {
      item.NavLedgerId = null;
      return item;
    })
  }

  public getAllLevel() {
    this.levelService.getAll().subscribe((list: IHRMLevel[]) => {
      this.levelList = list;
    });
  }
  public getAllGrade() {
    this.gradeService.getAll().subscribe((list: IHRMGrade[]) => {
      this.gradeList = list;
    });
  }

  public getAllBankInfo() {
    this.bankService.getAll().subscribe((list: IHRBankInfo[]) => {
      this.bankList = list;
    });
  }

  public onLevelChange(lvlId: any, stffId: number) {
    if (lvlId != "") {
      let query = `$filter=StaffId eq ${stffId} and LvlId eq ${lvlId}`;
      this.staffVsAllowanceService.getAll(query).subscribe((list: IHRStaffVsAllowance[]) => {
        if (list.length > 0) {
          this.payrollService.getStaffAllowanceAmount(stffId).subscribe((list: IFGetledgerAllowanceAmountTB_Result[]) => {
            this.ledgerAllowanceAmountList = list;
          });
        }
        else {
          this.payrollService.getledgerAllowanceAmount(lvlId).subscribe((list: IFGetledgerAllowanceAmountTB_Result[]) => {
            this.ledgerAllowanceAmountList = list;
          });
        }
      });
    }
    else {
      this.ledgerAllowanceAmountList = [];
    }
  }

  public checkMoney(amt: string, event: number) {
    if (event == 1) {
      if (amt == "") {
        this.validExtGrade = true;
      }
      else {
        this.validExtGrade = Utilities.isDecimal(amt);
      }
    }
    if (event == 2) {
      if (amt == "") {
        this.validPF = true;
      }
      else {
        this.validPF = Utilities.isDecimal(amt);
      }
    }
    if (event == 3) {
      if (amt == "") {
        this.validCIT = true;
      }
      else {
        this.validCIT = Utilities.isDecimal(amt);
      }
    }
    if (event == 4) {
      if (amt == "") {
        this.validPremium = true;
      }
      else {
        this.validPremium = Utilities.isDecimal(amt);
      }
    }
    if (event == 5) {
      if (amt == "") {
        this.validFA = true;
      }
      else {
        this.validFA = Utilities.isDecimal(amt);
      }
    }
  }

  public saveStaffInfo() {
    this.InputStaffInfo.StaffId = this.staffId;
    this.InputStaffInfo.PostedBy = this.userId;
    let saveItem: IHRStaffInfo = Object.assign({}, this.InputStaffInfo);

    this.hRStaffInfoService.post(saveItem)
      .subscribe(() => {
        this.saveStaffVsAllowance().then((data) => {
          if (data == true) {
            this.resetInput();
            var toastOptions: ToastOptions = {
              title: "Success",
              msg: "Staff Information has been successfully Added",
              showClose: true,
              timeout: 5000,
              theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
          }
        });
      });
  }

  resetInput() {
    this.InputStaffInfo = <IHRStaffInfo>{};
    this.isAddEditToggle = false;
    this.selectedModalLoaded = false;
    this.hideSalaryModal();
    this.onEmpPageSelect(this.empPagination);
    this.isEditStaffInfo = false;
  }

  public saveStaffVsAllowance(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let saveItem: IHRStaffVsAllowance = <IHRStaffVsAllowance>{};
      let editItem: IHRStaffVsAllowance = <IHRStaffVsAllowance>{};
      let count: number = 0;
      this.ledgerAllowanceAmountList.forEach((item, index) => {
        saveItem = {
          AlId: item.ALId,
          StaffId: this.staffId,
          LvlId: this.InputStaffInfo.LvlId,
          Amount: item.Amount.toString(),
          PostedBy: this.userId
        }
        this.staffVsAllowanceService.post(saveItem).subscribe(() => {
          count++;
          if (count + 1 == this.ledgerAllowanceAmountList.length) {
            resolve(true);
          }
        });
      });

    });
  }

  //edit
  public editStaffInfo() {
    this.InputStaffInfo.ModifiedBy = this.userId;
    let editItem: IHRStaffInfo = Object.assign({}, this.InputStaffInfo);
    this.hRStaffInfoService.put(editItem.StaffId, editItem)
      .subscribe(() => {
        if (this.copyStaffInfo.ExtGrade != this.InputStaffInfo.ExtGrade || this.copyStaffInfo.LvlId != this.InputStaffInfo.LvlId || this.copyStaffInfo.GrdId != this.InputStaffInfo.GrdId || this.copyStaffInfo.MonthlyCIT != this.InputStaffInfo.MonthlyCIT) {
          let logItem: IHRStaffInfoLog;

          logItem = {
            StaffId: this.copyStaffInfo.StaffId,
            ExtGrade: this.copyStaffInfo.ExtGrade,
            LvlId: this.copyStaffInfo.LvlId,
            GrdId: this.copyStaffInfo.GrdId,
            MonthlyCIT: this.copyStaffInfo.MonthlyCIT != null ? this.copyStaffInfo.MonthlyCIT : "0",
            PostedBy: this.userId
          }
          this.staffInfoLogService.post(logItem).subscribe(() => {
            this.resetInput();

            var toastOptions: ToastOptions = {
              title: "Edited",
              msg: "Staff Information has been successfully Edited",
              showClose: true,
              timeout: 5000,
              theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
          });
        }
        this.editStaffVsAllowance().then((data) => {
          this.resetInput();
          var toastOptions: ToastOptions = {
            title: "Edited",
            msg: "Staff Information has been successfully Edited",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
          };
          this.toastyService.success(toastOptions);
        }).catch((err) => {
          console.log(err);
        })
      });
  }

  public editStaffVsAllowance(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let saveItem: IHRStaffVsAllowanceLog = <IHRStaffVsAllowanceLog>{};
      let count: number = 0;
      this.ledgerAllowanceAmountList.forEach((item, index) => {
        saveItem = {
          AlId: item.ALId,
          StaffId: this.staffId,
          LvlId: this.InputStaffInfo.LvlId,
          Amount: item.Amount.toString(),

          PostedBy: this.userId,
          PostedOn: new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, this.currentDate.getDate(), 5, 45, 0, 0)
        }
        this.staffVsAllowanceService.put("post", saveItem).subscribe(() => {
          count++;
          if (count + 1 == this.ledgerAllowanceAmountList.length) {
            resolve(true);
          }
        });
      });

    });
  }

  public maritalChange(event: boolean) {
    this.InputStaffInfo.MaritalStatus = event;
  }

  public checkStatus() {
    if (this.InputStaffInfo.MaritalStatus == true) {
      return true;
    }
    else {
      return false;
    }
  }

  public openInsuranceModal(empId: number, empName: string) {
    this.staffName = empName;
    this.staffId = empId;

    let query = `$filter=StaffId eq ${empId}`;
    this.hrInsuranceService.getAll(query).subscribe((list: IHRInsurance[]) => {
      if (list.length > 0) {
        this.isInsuranceAddEditToggle = true;
        this.addNewFieldValue = true;
        this.InsuranceList = list;
      }
      else {
        this.isInsuranceAddEditToggle = false;
      }
      this.insuranceModalLoaded = true;
      this.insuranceModal.show();
    });
  }

  public hideInsuranceModal() {
    this.isInsuranceAddEditToggle = false;
    this.InputInsurance = <IHRInsurance>{};
    this.InsuranceList = [];
    this.addNewFieldValue = false;
    this.insuranceModalLoaded = false;
    this.insuranceModal.hide();
  }

  public getAllFiscalYear() {
    let date = new Date();
    this.commonService.getFiscalYear(date, 3).subscribe((list: IFgetFiscialyearID_Result[]) => {
      this.fiscalYearList = list;
    });
  }

  public addFieldValue() {
    this.InsuranceList.push(this.InputInsurance)
    this.InputInsurance = <IHRInsurance>{};
  }

  public deleteFieldValue(index: number, id?: number) {
    this.InsuranceList.splice(index, 1);
    if (id != null) {
      this.deleteItemList.push(id);
    }
  }

  public disableAdd(): boolean {
    if (this.InputInsurance.InsuranceCompany == null || this.InputInsurance.InsuranceCompany == "") {
      return true;
    }
    if (this.InputInsurance.Premium == null || this.InputInsurance.Premium == "") {
      return true;
    }
    if (this.InputInsurance.TillFYId == null) {
      return true;
    }
    if (this.validPremium == false) {
      return true;
    }
    if (this.InputInsurance == null && this.InsuranceList.length > 0) {
      return false;
    }
    return false;
  }

  public toggle() {
    this.addNewFieldValue = !this.addNewFieldValue;
    this.InputInsurance = <IHRInsurance>{};
  }

  public saveInsurance() {
    if (this.InsuranceList.length > 0) {
      this.InsuranceList.forEach((item, index) => {
        item.StaffId = this.staffId;
        item.PostedBy = this.userId;
        this.hrInsuranceService.post(item).subscribe(() => {
          if (index == this.InsuranceList.length) {
            var toastOptions: ToastOptions = {
              title: "Success",
              msg: "Insurance has been successfully added",
              showClose: true,
              timeout: 5000,
              theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
          }
        });
      });
      if (this.InputInsurance.InsuranceCompany != null && this.InputInsurance.Premium != null && this.InputInsurance.TillFYId != null) {
        let saveItem: IHRInsurance = <IHRInsurance>{};
        Object.assign(saveItem, this.InputInsurance);
        saveItem.PostedBy = this.userId;
        saveItem.StaffId = this.staffId;
        this.hrInsuranceService.post(saveItem).subscribe(() => { });
      }
      this.hideInsuranceModal();
    }
    else {
      if (this.InputInsurance.InsuranceCompany != null && this.InputInsurance.Premium != null && this.InputInsurance.TillFYId != null) {
        let saveItem: IHRInsurance = <IHRInsurance>{};
        Object.assign(saveItem, this.InputInsurance);
        saveItem.StaffId = this.staffId;
        saveItem.PostedBy = this.userId;
        this.hrInsuranceService.post(saveItem).subscribe(() => {
          this.hideInsuranceModal();
          var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Insurance has been successfully added",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
          };
          this.toastyService.success(toastOptions);
        });
      }
    }

  }

  public editInsurance() {
    if (this.deleteItemList.length > 0) {
      this.deleteItemList.forEach(item => {
        this.hrInsuranceService.delete(item).subscribe(() => { });
      });
    }
    if (this.InsuranceList.length > 0) {
      this.InsuranceList.forEach((item, index) => {
        if (item.Id != null) {
          item.ModifiedBy = this.userId;
          this.hrInsuranceService.put(item.Id, item).subscribe(() => {
            if (index == this.InsuranceList.length) {
              var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Insurance has been successfully edited",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
              };
              this.toastyService.success(toastOptions);
            }
          });
        }
        else {
          item.PostedBy = this.userId;
          item.StaffId = this.staffId;
          this.hrInsuranceService.post(item).subscribe(() => { });
        }
      });
      if (this.InputInsurance.InsuranceCompany != null && this.InputInsurance.Premium != null && this.InputInsurance.TillFYId != null) {
        let saveItem: IHRInsurance = <IHRInsurance>{};
        Object.assign(saveItem, this.InputInsurance);
        saveItem.PostedBy = this.userId;
        saveItem.StaffId = this.staffId;
        this.hrInsuranceService.post(saveItem).subscribe(() => {

        });
      }
      this.hideInsuranceModal();
    }
    else {
      if (this.InputInsurance.InsuranceCompany != null && this.InputInsurance.Premium != null && this.InputInsurance.TillFYId != null) {
        let saveItem: IHRInsurance = <IHRInsurance>{};
        Object.assign(saveItem, this.InputInsurance);
        saveItem.StaffId = this.staffId;
        saveItem.PostedBy = this.userId;
        this.hrInsuranceService.post(saveItem).subscribe(() => {
          this.hideInsuranceModal();
          var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Insurance has been successfully edited",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
          };
          this.toastyService.success(toastOptions);
        });
      }
    }

  }

  public resetPagination() {
    this.empPagination = <IPagination>{
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

  public isInsuranceFormValid(bookForm: any): boolean {
    if (!bookForm.form.valid) {
      return false;
    }
    return true;
  }

  //empty cha don't know why
  onGradeChange() {

  }

  selectNavLedger(ledgerObj: IHRMLedger) {
    console.log(this.InputStaffInfo);
    this.InputStaffInfo.HRStaffInfoNav.filter(x => x.ALId == ledgerObj.ALId).map(y => {
      y.NavLedgerId = Number(ledgerObj.NavLedgerId);
      return y;
    });

    //console.log(this.InputStaffInfo.HRStaffInfoNav);
  }
}
