import { Component, Injectable, ViewChild, Input} from '@angular/core';
import {
    GtnDepartmentService, GtnJobCodeService, FiscalYearService,
    CommonService
} from '../../services/BaseService';
import {
    IGtnDepartment, IPagination, IGtnJobCode,
} from '../../models/Models';
import { IFilterViewModel, IFgetFiscialyearID_Result } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    selector: 'GtnDepartment',
    templateUrl: 'gtnDepartment.component.html'
})
export class GtnDepartmentComponent {
    @Input() userId: string;
    @Input() showDeptDetail: boolean = false;
    @Input() deptId: number;
   
    isAddDepartment: boolean = false;
    isEditDepartment: boolean = false;
    isAddEditToggle: boolean = false;
    departmentList: IGtnDepartment[] = [];
    InputDepartment: IGtnDepartment = <IGtnDepartment>{};
    InputJobCode: IGtnJobCode = <IGtnJobCode>{};
    FiscalYearDetail: IFgetFiscialyearID_Result[] = [];
    FYCode: string;

        //Department Modal
  @ViewChild('departmentModal', { static: false }) public departmentModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;
   
    toggleSort: boolean = false;
    duplicateCode: boolean = false;
    duplicateName: boolean = false;
    validDigit: boolean = false;

    //searching and sorting
    filterObj?: IFilterViewModel;

    //for pagination
    pagination?: IPagination;

    constructor(
        private departmentService: GtnDepartmentService,
        private jobCodeService: GtnJobCodeService,
        private fiscalYearService: FiscalYearService,
        private commonService: CommonService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.filterObj = { Name: '', Sort: 'false', SortingAttribute: 'PostedOn', SearchBy: '' };
        this.getFiscalYear();
    }

    //post
    //openModal
    public openDepartmentModal() {
        this.InputDepartment.Visibility = true;
        this.isAddDepartment = true;
        this.isEditDepartment = false;
        this.selectedModalLoaded = true;
        this.departmentModal.show();
    }

    public hideDepartmentModal() {
        this.isAddDepartment = false;
        this.isEditDepartment = false;
        this.isAddEditToggle = false;
        this.InputDepartment = <IGtnDepartment>{};
        this.selectedModalLoaded = false;
        this.departmentModal.hide();
    }

    public saveDepartment() {
        if (this.InputDepartment.Visibility != true) {
            this.InputDepartment.Visibility = false;
        }
        this.InputDepartment.PostedBy = this.userId;
        let saveItem: IGtnDepartment = Object.assign({}, this.InputDepartment);
        this.departmentService.post(saveItem)
            .subscribe(() => {
                this.InputDepartment = <IGtnDepartment>{};
                this.isAddEditToggle = false;
                this.selectedModalLoaded = false;
                this.hideDepartmentModal();
                this.saveJobCode(saveItem.DepartmentCode).then((data) => {
                    if (data == true) {
                        var toastOptions: ToastOptions = {
                            title: "Success",
                            msg: "Department has been successfully Added and Job Code is Created",
                            showClose: true,
                            timeout: 5000,
                            theme: 'bootstrap'
                        };
                        this.toastyService.success(toastOptions);
                    }
                });

            });
    }

    //EditModal
    openEditModal() {
        this.isEditDepartment = true;
        this.isAddDepartment = false;
        this.selectedModalLoaded = true;
        this.departmentModal.show();
    }

    //getOne
    public getDepartment(id: number) {
        this.departmentService.get(id)
            .subscribe((one: IGtnDepartment) => {
                this.InputDepartment = one;
                this.isAddEditToggle = true;
                this.openEditModal();
            });
    }

    //edit
    public editDepartment() {
        this.InputDepartment.ModifiedBy = this.userId;
        let editItem: IGtnDepartment = Object.assign({}, this.InputDepartment);

        this.departmentService.put(editItem.DepartmentID, editItem)
            .subscribe(() => {
                this.isEditDepartment = false;
                this.InputDepartment = <IGtnDepartment>{};
                this.hideDepartmentModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Department has been successfully Edited",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    public onDeptCodeChange(data: any) {
        const query = `$filter=DepartmentCode eq '${data}'`;
        if (data < 10 && data.length == 1) {
            this.validDigit = false;
            this.departmentService.getAll(query).subscribe((list: IGtnDepartment[]) => {
                if (list.length > 0) {
                    this.duplicateCode = true;
                }
                else {
                    this.duplicateCode = false;
                }
            });
        }
        else {
            this.validDigit = true;
            this.duplicateCode = false;
        }

    }

    public onDeptNameChange(data: string) {
        const query = `$filter=DepartmentName eq '${data}'`;        
            this.departmentService.getAll(query).subscribe((list: IGtnDepartment[]) => {
                if (list.length > 0) {
                    this.duplicateName = true;
                }
                else {
                    this.duplicateName = false;
                }
            });
    }

    public getFiscalYear() {
            let date = new Date();
            this.commonService.getFiscalYear(date, 0).subscribe((list: IFgetFiscialyearID_Result[]) => {
                this.FiscalYearDetail = list;
                let splitData = this.FiscalYearDetail[0].FyName;
                let splitedData = splitData.split('/');
                let fyCode1 = parseInt(splitedData[0]) % 10;
                let fyCode2 = parseInt(splitedData[1]) % 10;
                this.FYCode = fyCode1.toString() + fyCode2.toString();
            });
    }

    public saveJobCode(code: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const query = `$filter=DepartmentCode eq '${code}'`;
            this.departmentService.getAll(query).subscribe((list: IGtnDepartment[]) => {
                let currentDate = new Date();
                this.InputJobCode = {
                    DepartmentCode: list[0].DepartmentID,
                    FiscalYearID: this.FiscalYearDetail[0].FYID,
                    JobCode1: code + "00" + "00" + "00" + this.FYCode,
                    IsVisible: true,
                    PostedBy: this.userId,
                    PostedOn: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate(), 5, 45, 0, 0)
                };
                this.jobCodeService.post(this.InputJobCode).subscribe(() => {
                    return true;
                });
            });
        });
        
    }

    public isFormValid(bookForm: any): boolean {
        if (!bookForm.form.valid) {
            return false;
        }
        if (this.duplicateCode == true) {
            return false;
        }
        return true;
    }
}
