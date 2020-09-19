import { Component, Injectable, ViewChild } from '@angular/core';
import {
    GtnDepartmentService, GtnUnitService, GtnSubUnitService,
    ClientService, CommonService, GtnJobCodeService,
    GtnTimeSheetService, GtnJobCodeReportService
} from '../../services/BaseService';
import {
    IGtnDepartment, IPagination, IGtnUnit,
    IGtnSubUnit, IClient, IGtnJobCode,
    IGtnTimeSheet, IODataResult
} from '../../models/Models';
import { IFilterViewModel, IFgetFiscialyearID_Result, IGtnJobCodeVM } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    selector: 'GtnJobCode',
    templateUrl: 'gtnJobCode.component.html'
})
export class GtnJobCodeComponent {
    userId: string;
    toggleSort: boolean = false;
    departmentList: IGtnDepartment[] = [];
    unitList: IGtnUnit[] = [];
    subUnitList: IGtnSubUnit[] = [];
    clientList: IClient[] = [];
    jobCodeList: IGtnJobCodeVM[] = [];

    showUnit: boolean = false;
    DeptId: number;
    DeptCode: string;

    showSubUnit: boolean = false;
    UnitId: number;
    UnitCode: string

    showClient: boolean = false;
    SubUnitId: number;
    SubUnitCode: string;

    ClientId: number;
    ClientCode: string;

    //searching and sorting
    filterObj?: IFilterViewModel;

    //for pagination
    deptPagination?: IPagination;
    unitPagination?: IPagination;
    subUnitPagination?: IPagination;
    jobCodePagination?: IPagination;
    FiscalYearDetail: IFgetFiscialyearID_Result[] = [];
    FYCode: string;
    InputJobCode: IGtnJobCode = <IGtnJobCode>{};
    duplicateJobCode: boolean = false;
    ClientCodeItem: IClient = <IClient>{};
    disableDelete: boolean = false;

    //Client Modal
  @ViewChild('clientModal', { static: false }) public clientModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    //deleteModal
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirectiveDelete: any;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    constructor(
        private departmentService: GtnDepartmentService,
        private unitService: GtnUnitService,
        private subUnitService: GtnSubUnitService,
        private clientService: ClientService,
        private commonService: CommonService,
        private jobCodeService: GtnJobCodeService,
        private timeSheetService: GtnTimeSheetService,
        private jobCodeReportService: GtnJobCodeReportService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.getFiscalYear();
        this.deptPagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.unitPagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.subUnitPagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.jobCodePagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.filterObj = { Name: '', Sort: 'false', SortingAttribute: 'PostedOn', SearchBy: '' };
  }

  refreshDeptList(ev: any) {

  }

    //getAll
    public getAllDepartment(filterObj: IFilterViewModel) {
        var query: string = "";

        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Sort != undefined && filterObj.Sort != "") {
                if (filterObj.Sort == 'true') {
                    if (query != null && query != "") {
                        query += "&$orderby=" + filterObj.SortingAttribute;
                    }
                    else {
                        query += "$orderby=" + filterObj.SortingAttribute;
                    }
                }
                else {
                    if (query != null && query != "") {
                        query += "&$orderby=" + filterObj.SortingAttribute + " desc";
                    }
                    else {
                        query += "$orderby=" + filterObj.SortingAttribute + " desc";
                    }
                }
            }
        }
        let skipCount = (this.deptPagination.ItemsPerPage * (this.deptPagination.CurrentPage - 1));
        if (query != null && query != "") {
            query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.deptPagination.ItemsPerPage}`;
        }
        else {
            query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.deptPagination.ItemsPerPage}`;
        }

        this.departmentService.getAll(query)
            .subscribe((list: any) => {
                this.departmentList = list.value;
                this.deptPagination = {
                    ItemsPerPage: this.deptPagination.ItemsPerPage,
                    TotalItems: <number>(list["odata.count"]),
                    CurrentPage: this.deptPagination.CurrentPage,
                    SortBy: this.deptPagination.SortBy
                };
            });
    }

    public refreshList(event: number) {
        if (event == 1) {
            this.onDeptPageSelect(this.deptPagination);
        }
        if (event == 2) {
            this.onUnitPageSelect(this.unitPagination);
        }
        if (event == 3) {
            this.onSubUnitPageSelect(this.subUnitPagination);
        }
    }

    onDeptPageSelect(pagination: IPagination) {
        this.deptPagination = pagination;
        this.getAllDepartment(this.filterObj);
    }

    public sortBy(sortBy: string, sortNumber: number) {
        this.toggleSort = !this.toggleSort;
        if (this.toggleSort == true) {
            this.filterObj.Sort = "true";
        }
        else {
            this.filterObj.Sort = "false";
        }

        this.filterObj.SortingAttribute = sortBy;
        if (sortNumber == 1) {
            this.onDeptPageSelect(this.deptPagination);
        }
        if (sortNumber == 2) {
            this.onUnitPageSelect(this.unitPagination);
        }
        if (sortNumber == 3) {
            this.onSubUnitPageSelect(this.subUnitPagination);
        }
        if (sortNumber == 4) {
            this.onJobCodePageSelect(this.jobCodePagination);
        }
    }

    public goToUnit(deptId: number, deptCode: string) {
        this.showUnit = true;
        this.showSubUnit = false;
        this.showClient = false;
        this.DeptId = deptId;
        this.DeptCode = deptCode;
        this.getAllUnit(this.filterObj, this.DeptId);
    }

    //getAll
    public getAllUnit(filterObj: IFilterViewModel, deptId: number) {
        var query: string = `$filter=DepartmentID eq ${deptId}`;

        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Sort != undefined && filterObj.Sort != "") {
                if (filterObj.Sort == 'true') {
                    if (query != null && query != "") {
                        query += "&$orderby=" + filterObj.SortingAttribute;
                    }
                }
                else {
                    if (query != null && query != "") {
                        query += "&$orderby=" + filterObj.SortingAttribute + " desc";
                    }
                }
            }
        }
        let skipCount = (this.unitPagination.ItemsPerPage * (this.unitPagination.CurrentPage - 1));
        if (query != null && query != "") {
            query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.unitPagination.ItemsPerPage}`;
        }
        else {
            query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.unitPagination.ItemsPerPage}`;
        }

        this.unitService.getAll(query)
            .subscribe((list: any) => {
                this.unitList = list.value;
                this.unitPagination = {
                    ItemsPerPage: this.unitPagination.ItemsPerPage,
                    TotalItems: <number>(list["odata.count"]),
                    CurrentPage: this.unitPagination.CurrentPage,
                    SortBy: this.unitPagination.SortBy
                };
            });
    }

    onUnitPageSelect(pagination: IPagination) {
        this.unitPagination = pagination;
        this.getAllUnit(this.filterObj, this.DeptId);
    }

    public goToSubUnit(unitId: number, unitCode: string) {
        this.showSubUnit = true;
        this.showClient = false;
        this.UnitId = unitId;
        this.UnitCode = unitCode;
        this.getAllSubUnit(this.filterObj, this.UnitId);
    }

    //getAll
    public getAllSubUnit(filterObj: IFilterViewModel, unitId: number) {
        var query: string = `$filter=UnitID eq ${unitId}`;

        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Sort != undefined && filterObj.Sort != "") {
                if (filterObj.Sort == 'true') {
                    if (query != null && query != "") {
                        query += "&$orderby=" + filterObj.SortingAttribute;
                    }
                }
                else {
                    if (query != null && query != "") {
                        query += "&$orderby=" + filterObj.SortingAttribute + " desc";
                    }
                }
            }
        }
        let skipCount = (this.subUnitPagination.ItemsPerPage * (this.subUnitPagination.CurrentPage - 1));
        if (query != null && query != "") {
            query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.subUnitPagination.ItemsPerPage}`;
        }
        else {
            query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.subUnitPagination.ItemsPerPage}`;
        }

        this.subUnitService.getAll(query)
            .subscribe((list: any) => {
                this.subUnitList = list.value;
                this.subUnitPagination = {
                    ItemsPerPage: this.subUnitPagination.ItemsPerPage,
                    TotalItems: <number>(list["odata.count"]),
                    CurrentPage: this.subUnitPagination.CurrentPage,
                    SortBy: this.subUnitPagination.SortBy
                };
            });
    }

    onSubUnitPageSelect(pagination: IPagination) {
        this.subUnitPagination = pagination;
        this.getAllSubUnit(this.filterObj, this.UnitId);
    }

    public goToClient(subUnitId: number, subUnitCode: string) {
        this.showClient = true;
        this.SubUnitId = subUnitId;
        this.SubUnitCode = subUnitCode;
        this.getAllClient();
        this.getAllJobCode(this.filterObj, subUnitId);
    }

    //getAll
    public getAllClient() {
        this.clientService.getAll()
            .subscribe((list: IClient[]) => {
                this.clientList = list;
            });
    }

    public getAllJobCode(filterObj: IFilterViewModel, subUnitId: number) {
        this.jobCodeReportService.GetJobCodeList(subUnitId, this.jobCodePagination, this.filterObj).subscribe((list: IODataResult<IGtnJobCodeVM[]>) => {
            this.jobCodeList = list.value;
            this.jobCodePagination = {
                ItemsPerPage: this.jobCodePagination.ItemsPerPage,
                TotalItems: list.count,
                CurrentPage: this.jobCodePagination.CurrentPage,
                SortBy: this.jobCodePagination.SortBy
            };
        });
    }

    onJobCodePageSelect(pagination: IPagination) {
        this.jobCodePagination = pagination;
        this.getAllJobCode(this.filterObj, this.SubUnitId);
    }

    onClientChange(event: any) {
        this.ClientId = event.Id;
        //this.ClientId = clientId;
        this.ClientCode = event.ClientCode;
        let jbCode = this.DeptCode + this.UnitCode + this.SubUnitCode + this.ClientCode + this.FYCode;
        let query = `$filter=JobCode1 eq '${jbCode}'`;
        this.jobCodeService.getAll(query).subscribe((list: IGtnJobCode[]) => {
            if (list.length > 0) {
                this.duplicateJobCode = true;
            }
            else {
                this.duplicateJobCode = false;
            }
        });
    }

    //openModal
    public openClientModal() {
        this.ClientCodeItem = null;
        this.selectedModalLoaded = true;
        this.clientModal.show();
    }

    public hideClientModal() {
        this.ClientCodeItem = null;
        this.selectedModalLoaded = false;
        this.clientModal.hide();
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

    public saveJobCode() {
        let currentDate = new Date();
        this.InputJobCode = {
            DepartmentCode: this.DeptId,
            UnitCode: this.UnitId,
            SubUnitCode: this.SubUnitId,
            ClientCode: this.ClientId,
            FiscalYearID: this.FiscalYearDetail[0].FYID,
            JobCode1: this.DeptCode + this.UnitCode + this.SubUnitCode + this.ClientCode + this.FYCode,
            IsVisible: true,
            PostedBy: this.userId,
            PostedOn: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate(), 5, 45, 0, 0)
        };
        this.jobCodeService.post(this.InputJobCode).subscribe(() => {
            this.onJobCodePageSelect(this.jobCodePagination);
            this.hideClientModal();
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Job Code has been successfully Created",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
        });
    }

    //delete
    openDeleteModal(Id: number) {
        let query = `$filter=JobCode eq ${Id}`;
        this.timeSheetService.getAll(query).subscribe((list: IGtnTimeSheet[]) => {
            this.deleteId = Id;
            this.deleteModalLoaded = true;
            this.deleteModal.show();
            if (list.length > 0) {
                this.disableDelete = true;
            }
            else {
                this.disableDelete = false;
            }
        });
    }

    public hideDeleteModal(): void {
        this.deleteModalLoaded = false;
        this.deleteModal.hide();
    }

    public deleteJobCode() {
        this.jobCodeService.delete(this.deleteId).subscribe(() => {
            this.getAllJobCode(this.filterObj, this.SubUnitId);
            this.hideDeleteModal();

            var toastOptions: ToastOptions = {
                title: "Delete",
                msg: "Job Code has been deleted successfully",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.error(toastOptions);
        });

    }

    public isFormValid(bookForm: any): boolean {
        if (!bookForm.form.valid) {
            return false;
        }
        if (this.duplicateJobCode == true) {
            return false;
        }
        return true;
    }
}
