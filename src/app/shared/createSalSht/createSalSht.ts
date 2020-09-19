import { Component, Injectable } from '@angular/core';
import {
    FiscalYearService, PayrollService, CommonService
} from '../../services/BaseService';
import {
    IFiscalYear
} from '../../models/Models';
import { IFilterViewModel, CreateSalarySheetVM, IFgetCurrentEmployeePosition_Result, ICompanyVM } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { ToastyService, ToastOptions } from 'ngx-toasty';
import { IMonths } from '../datepicker/models/datepickerDataStore';
import { IMonthsEngNep } from '../datepicker/models/dateModel';
import { BranchService } from '../../services/BranchService';
import { DatePickerService } from '../datepicker/modules/datePickerService';

@Component({
    selector: 'create-salary-sheet',
    templateUrl: "./createSalSht.html"
})
export class CreateSalarySheetComponent {
    userId: string;
    yearList: string[] = [];
    monthList: IMonthsEngNep[] = [];
    fiscalYearList: IFiscalYear[] = [];
    InputCSS: CreateSalarySheetVM = <CreateSalarySheetVM>{};

    CBSelectIsExpand: boolean = false;
    defaultDateType: number;

    currentDate: Date;

    //searching and sorting
    filterObj?: IFilterViewModel;
    filterByName: string;
    filterByMonth: string = "-1";
    filterByYear: string = "-1";
    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };

    constructor(
        public datePickerFunctions: DatePickerService,
        private fiscalYearService: FiscalYearService,
        private payrollService: PayrollService,
        private toastyService: ToastyService,
        private commonService: CommonService,
        private branchService: BranchService
    ) {

    }

    ngOnInit() {
        this.userId = localStorage.getItem('UserId');
        this.defaultDateType = Number(localStorage.getItem('Param.DateType'));

        this.currentDate = new Date();
        this.filterObj = { Name: '', Sort: 'True', SortingAttribute: 'FirstName', SearchBy: '' };
        this.getMonth();
        this.getFiscalYear();
        this.reset();


        this.getBranches();
    }

    public reset() {
        this.filterByName = null;
        if (this.defaultDateType == 1) {
            this.filterByYear = (new Date().getFullYear()).toString();
            this.filterByMonth = (new Date().getMonth() + 1).toString();
        } else{
            let BSDate: string = this.datePickerFunctions.FGetDateBS(new Date());
            this.filterByYear = this.datePickerFunctions.GetBSYear(BSDate).toString();
            this.filterByMonth = this.datePickerFunctions.GetBSMonth(BSDate).toString();
        }
    }

    public getYear() {

        this.yearList = [];
        console.log(this.fiscalYearList);

        if (this.defaultDateType == 1) {
            this.fiscalYearList.forEach(item => {
                if (this.yearList.filter(x => x == new Date(item.StartDT).getFullYear().toString()).length == 0) {
                    this.yearList.push(new Date(item.StartDT).getFullYear().toString());
                }
                if (this.yearList.filter(x => x == new Date(item.EndDt).getFullYear().toString()).length == 0) {
                    this.yearList.push(new Date(item.EndDt).getFullYear().toString());
                }
            })

        } else {
            this.yearList = [];
            this.fiscalYearList.forEach(item => {
                let sNDate = this.datePickerFunctions.GetDateBS(new Date(item.StartDT));

                let sNYear = this.datePickerFunctions.GetBSYear(sNDate).toString();
                let eNYear = this.datePickerFunctions.GetBSYear(sNDate).toString();

                if (this.yearList.filter(x => x == sNYear).length == 0) {
                    this.yearList.push(sNYear);
                }
                if (this.yearList.filter(x => x == eNYear).length == 0) {
                    this.yearList.push(eNYear);
                }
            })
        }

        this.filterByYear = this.yearList[0];
    }

    public getMonth() {
        this.monthList = IMonths;
    }

    public getFiscalYear() {
        let sdate: Date = new Date();
        sdate.setFullYear(sdate.getFullYear() - 3);
        let edate: Date = new Date();
        edate.setFullYear(edate.getFullYear() + 3);

        this.fiscalYearService.getAll().subscribe(data => {
            this.fiscalYearList = data.filter(x => new Date(x.StartDT) >= sdate && new Date(x.EndDt) <= edate);

            this.getYear();
        })
    }

    public createSalSht() {
        this.InputCSS.IsBonus = this.InputCSS.IsBonus ? this.InputCSS.IsBonus : false
        this.payrollService.createSalSht(this.InputCSS.FYID, this.InputCSS.Year, this.InputCSS.Month, this.InputCSS.IsBonus, this.userId, this.InputCSS.CompId).subscribe((data) => {
            if (data == true) {
                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: `Salary sheet has been created.`,
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);
                this.InputCSS = <CreateSalarySheetVM>{};
            } else {
                var toastOptions: ToastOptions = {
                    title: "Error",
                    msg: "Error creating salary sheet.",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.error(toastOptions);
            }
        })
    }



    //company branch list
    EmpCurrentPost: IFgetCurrentEmployeePosition_Result;
    CBList: ICompanyVM[] = [];
    svCBList: ICompanyVM[] = [];
    currentCompany: number;
    CompanyName: string;

    getBranches() {
        this.commonService.GetCompanyBranches().subscribe((data: ICompanyVM[]) => {
            this.svCBList = data;
            this.CBList = data.filter(x => x.isGroup == true);
            if (this.branchService.getBranch()) {
                this.currentCompany = Number(this.branchService.getBranch());
            } else {
                if (this.svCBList.length > 0) {
                    this.currentCompany = this.svCBList.filter(x => x.isGroup != true)[0].CompanyId;
                }
            }
            this.CBList.forEach(item => {
                item.isOpen = true;
                if (item.isGroup == true) {
                    item.ChildCompany = data.filter(x => x.ParentId == item.CompanyId);
                }
            })
            this.CompanyName = this.svCBList.filter(x => x.CompanyId == this.currentCompany)[0].CompanyName;
            this.selectBranch(this.svCBList.filter(x => x.CompanyId == this.currentCompany)[0]);
        });
    }

    selectBranch(company?: ICompanyVM) {
        if (company.isGroup != true) {
            this.CompanyName = company.CompanyName;
            this.currentCompany = company.CompanyId;

            if (this.currentCompany) {
                this.InputCSS.CompId = company.CompanyId;
            }
        }
    }
}