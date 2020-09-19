import { Component, Injectable, ViewChild } from '@angular/core';
import { IFilterViewModel, IEmployeeWithEmpPosVM, IFgetFiscialyearID_Result } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';

import { Utilities } from '../../shared/utilities';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

import { IUser, IPagination, IFiscalYear, IHRSalaryOpBal, IEmployee } from '../../models/Models';
import { UserService, EmployeeListWithFilterService, HRSalaryOpBalService, EmployeeService, FiscalYearService } from '../../services/BaseService';
import { Observable } from 'rxjs/Observable';

@Component({
    templateUrl: 'hrSalaryOB.component.html'
})
export class HRSalaryOBComponent {
    userDetails: IUser = <IUser>{};
    currentEmpId: number;
    isAdmin: boolean = false;

    employeeList: IEmployeeWithEmpPosVM[] = [];
    fiscalYearList: IFiscalYear[] = [];

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;
    deleteModalLoaded: boolean = false;

    userId: string;
    toggleSort: boolean = false;
    hrSalOpSalList: IHRSalaryOpBal[] = [];

    //searching and sorting
    filterObjForEmpList?: IFilterViewModel;

    filterByName: string;
    currentDate: Date;

    constructor(
        private userService: UserService,
        private hrSalOpBal: HRSalaryOpBalService,
        private toastyService: ToastyService,
        private empListService: EmployeeListWithFilterService,
        private empService: EmployeeService,
        private fyService: FiscalYearService,
        private toastyConfig: ToastyConfig
    ) {
        //this.userId = localStorage.getItem('UserId');
        //this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
        //this.currentDate = new Date();

        this.getAllOpBal();
        this.getAllfiscalYear();
    }

    getAllOpBal() {
        let query = `$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,FiscalYear/*&$expand=Employee,FiscalYear`;
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        this.hrSalOpBal.getAll(query).subscribe((data: any) => {
            this.pagination = {
                ItemsPerPage: this.pagination.ItemsPerPage,
                TotalItems: <number>(data["odata.count"]),
                CurrentPage: this.pagination.CurrentPage,
                SortBy: this.pagination.SortBy
            };
            this.hrSalOpSalList = data.value;
        });
    }

    getEmployeeName(data: IEmployee) {
        return `${data.FirstName}${data.MiddleName ? ' ' + data.MiddleName : ' '}${data.LastName}`;
    }

    getFiscalYear(data: IFiscalYear) {
        if (Number(localStorage.getItem('Param.DateType')) == 1) {
            return `${data.FYNameAD} ( ${data.FyName} )`;
        } else {
            return `${data.FyName} ( ${data.FYNameAD} )`;
        }
    }

    // Start: Add/Edit functions
    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true,
        showSupervisorList: false
    };
    selectedEmployee(employee: IEmployee) {
        this.selectEmployeeOptions.selectedEmployeeId = employee.EmployeeId;
        console.log(employee);
        if (employee) {
            this.hrSalOpBal.get(employee.EmployeeId).subscribe((data: IHRSalaryOpBal) => {
                this.InputHRSalOpBal = data;
                this.getAllfiscalYear(data.FYId);
            }, (err) => {
                this.InputHRSalOpBal = <IHRSalaryOpBal>{};
                this.InputHRSalOpBal.StaffId = employee.EmployeeId;
            });
        }
    }

    fyList: IFiscalYear[] = [];
    getAllfiscalYear(FYId?: number) {
        this.fyList = [];
        let query: string;
        if (FYId) {
            query = `$filter=FYID gt ${Number(FYId) - 5} and FYID lt ${Number(FYId) + 5}`
        } else {
            let startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 5);

            let endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 5);
            query = `$filter=StartDT gt DateTime'${this.convertJSONDate(startDate)}' and EndDt lt DateTime'${this.convertJSONDate(endDate)}'`
        }

        this.fyService.getAll(query).subscribe((data: IFiscalYear[]) => {
            this.fyList = data;
            if (FYId) {
                this.InputHRSalOpBal.FYId = FYId;
            } else {
                this.InputHRSalOpBal.FYId = data.filter(x => new Date(x.StartDT) <= new Date() && new Date(x.EndDt) >= new Date())[0].FYID;
            }
        })
    }

    convertJSONDate(date: Date) {
        return `${date.getFullYear()}-${doubleDigits(date.getMonth() + 1)}-${doubleDigits(date.getDate())}T00:00:00`;

        function doubleDigits(number: number) {
            if (number.toString().length < 2) {
                return `0${number.toString()}`;
            } else {
                return number.toString();
            }
        }
    }

    submit() {
        let saveItem: IHRSalaryOpBal = Object.assign({}, this.InputHRSalOpBal);

        saveItem.TotalSal = saveItem.TotalSal ? saveItem.TotalSal.toString() : null;
        saveItem.IncomeTax = saveItem.IncomeTax ? saveItem.IncomeTax.toString() : null;
        saveItem.SSTax = saveItem.SSTax ? saveItem.SSTax.toString() : null;
        saveItem.PF = saveItem.PF ? saveItem.PF.toString() : null;
        saveItem.CIT = saveItem.CIT ? saveItem.CIT.toString() : null;
        saveItem.CITToBePaid = saveItem.CITToBePaid ? saveItem.CITToBePaid.toString() : null;
        saveItem.CITPaid = saveItem.CITPaid ? saveItem.CITPaid.toString() : null;

        this.hrSalOpBal.put(saveItem.StaffId, saveItem).subscribe((data: IHRSalaryOpBal) => {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Opening balance has been successfully updated.",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
            this.getAllOpBal();
            this.hideModal();
        }, (err) => {
            var toastOptions: ToastOptions = {
                title: "Error",
                msg: "Something went wrong. Please try again.",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.error(toastOptions);
        })
    }

    isAdd: boolean;
    InputHRSalOpBal: IHRSalaryOpBal = <IHRSalaryOpBal>{};
    openModal(data?: IHRSalaryOpBal) {
        if (data) {
            this.isAdd = false;
            this.InputHRSalOpBal = Object.assign({}, data);
            this.InputHRSalOpBal.Employee = null;
            this.InputHRSalOpBal.FiscalYear = null;

            this.selectEmployeeOptions.selectedEmployeeId = data.StaffId;
            this.getAllfiscalYear(data.FYId);
        } else {
            this.isAdd = true;
        }
        this.childModal.config = {
            ignoreBackdropClick: true
        }
        this.childModal.show();
    }

    hideModal() {
        this.isAdd = null;
        this.InputHRSalOpBal = <IHRSalaryOpBal>{};
        this.selectEmployeeOptions.selectedEmployeeId = null;
        this.childModal.hide();
    }


    //pagination variables
    pagination?: IPagination = <IPagination>{
        CurrentPage: 1,
        ItemsPerPage: 50,
        TotalItems: 0,
        SortBy: null
    };
    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getAllOpBal();
    }
}
