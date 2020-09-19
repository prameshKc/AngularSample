import { Component, Injectable, ViewChild } from '@angular/core';
import { HRMLedgerService, HRLevelVsAllowancesService, HRAMService } from '../../services/BaseService';
import { IHRMLedger, IPagination, IHRLevelVsAllowances, IHRAM } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';

@Component({
    templateUrl: 'hRMLedger.component.html'
})
export class HRMLedgerComponent {
    isAddLedgerInfo: boolean = false;
    isEditLedgerInfo: boolean = false;
    isAddEditToggle: boolean = false;
    ledgerInfoList: IHRMLedger[] = [];
    InputLedgerInfo: IHRMLedger = <IHRMLedger>{};

  @ViewChild('ledgerInfoModal', { static: false }) public ledgerInfoModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    //deleteModal
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirectiveDelete: any;
    deleteModalLoaded: boolean = false;
    deleteId: number;
    userId: string;
    toggleSort: boolean = false;
    duplicateName: boolean = false;
    disableDelete: boolean = false;
    hRAMList: IHRAM[] = [];

    //searching and sorting
    filterObj?: IFilterViewModel;

    //for pagination
    pagination?: IPagination;

    constructor(
        public hRMLedgerService: HRMLedgerService,
        private hRLevelVsAllowanceService: HRLevelVsAllowancesService,
        private hRAMService: HRAMService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
        this.getAllAM();
        this.getAllLedgerInfo();
    }

    public filterLedgerInfo() {
        this.resetPagination();
        this.getAllLedgerInfo(this.filterObj);
    }

    public ledgerInfoAndFilter() {
        this.resetPagination();
        this.filterObj = { Name: '', Sort: '' };
        this.getAllLedgerInfo();
    }

    public getAllAM() {
        this.hRAMService.getAll().subscribe((data: IHRAM[]) => {
            this.hRAMList = data;
        });
    }

    //getAll
    public getAllLedgerInfo(filterObj?: IFilterViewModel) {
        var query: string = "$expand=HRAM";

        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Name != undefined && filterObj.Name != "") {
                query += "&$filter=substringof('" + this.filterObj.Name + "',ALDesc)";
            }
            if (filterObj.Sort != undefined && filterObj.Sort != "") {
                if (filterObj.Sort == 'true') {
                        query += "&$orderby=" + filterObj.SortingAttribute;
                }
                else {
                        query += "&$orderby=" + filterObj.SortingAttribute + " desc";
                }
            }
            else {
                if (this.isAddEditToggle == true) {
                        query += "&$orderby=ModifiedOn desc";
                }
                else {
                        query += "&$orderby=PostedOn desc";
                }
            }
        }
        else {
            if (this.isAddEditToggle == true) {
                    query += "&$orderby=ModifiedOn desc";
            }
            else {
                    query += "&$orderby=PostedOn desc";
            }
        }
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        if (query != null && query != "") {
            query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        }
        else {
            query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        }

        this.hRMLedgerService.getAll(query)
            .subscribe((list: any) => {
                this.ledgerInfoList = list.value;
                this.pagination = {
                    ItemsPerPage: this.pagination.ItemsPerPage,
                    TotalItems: <number>(list["odata.count"]),
                    CurrentPage: this.pagination.CurrentPage,
                    SortBy: this.pagination.SortBy
                };
            });
    }

    //openModal
    public openModal() {
        this.isAddLedgerInfo = true;
        this.isEditLedgerInfo = false;
        this.selectedModalLoaded = true;
        this.ledgerInfoModal.show();
    }

    public hideModal() {
        this.ledgerInfoModal.hide();
        this.isAddLedgerInfo = false;
        this.isEditLedgerInfo = false;
        this.isAddEditToggle = false;
        this.duplicateName = false;
        this.InputLedgerInfo = <IHRMLedger>{};
        this.selectedModalLoaded = false;
    }

    public saveLedgerInfo() {
        this.InputLedgerInfo.PostedBy = this.userId;
        let saveItem: IHRMLedger = Object.assign({}, this.InputLedgerInfo);

        this.hRMLedgerService.post(saveItem)
            .subscribe(() => {
                this.InputLedgerInfo = <IHRMLedger>{};
                this.isAddEditToggle = false;
                this.selectedModalLoaded = false;
                this.hideModal();
                this.getAllLedgerInfo();

                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Ledger Information has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    //delete
    openDeleteModal(Id: number) {
        let query = `$filter=ALId eq ${Id}`;
        this.hRLevelVsAllowanceService.getAll(query).subscribe((data: IHRLevelVsAllowances[]) => {
            if (data.length > 0) {
                this.disableDelete = true;
            }
            else {
                this.disableDelete = false;
            }
            this.deleteId = Id;
            this.deleteModalLoaded = true;
            this.deleteModal.show();
        });
    }

    public hideDeleteModal(): void {
        this.deleteModal.hide();
    }

    public deleteLedgerInfo() {
        this.hRMLedgerService.delete(this.deleteId)
            .subscribe(() => {
                this.getAllLedgerInfo();
                this.deleteModalLoaded = false;
                this.hideDeleteModal();

                var toastOptions: ToastOptions = {
                    title: "Delete",
                    msg: "Ledger Information has been deleted successfully",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.error(toastOptions);

            });
    }

    //EditModal
    openEditModal() {
        this.isEditLedgerInfo = true;
        this.isAddLedgerInfo = false;
        this.selectedModalLoaded = true;
        this.ledgerInfoModal.show();
    }


    //getOne
    public getLedgerInfo(id: number) {
        this.hRMLedgerService.get(id)
            .subscribe((one: IHRMLedger) => {
                this.InputLedgerInfo = one;
                this.isAddEditToggle = true;
                this.openEditModal();
            });
    }

    //edit
    public editLedgerInfo() {
        this.InputLedgerInfo.ModifiedBy = this.userId;
        let editItem: IHRMLedger = Object.assign({}, this.InputLedgerInfo);
        this.hRMLedgerService.put(editItem.ALId, editItem)
            .subscribe(() => {
                this.getAllLedgerInfo();
                this.isEditLedgerInfo = false;
                this.InputLedgerInfo = <IHRMLedger>{};
                this.hideModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Ledger Information has been successfully Edited",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
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
        this.getAllLedgerInfo(this.filterObj);
    }

    public checkDuplicate(event: any) {
        var query = "$filter=ALDesc eq '" + event + "'";
        this.hRMLedgerService.getAll(query).subscribe((data: IHRMLedger[]) => {
            if (data.length > 0) {
                this.duplicateName = true;
            }
            else {
                this.duplicateName = false;
            }
        });
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
        if (this.duplicateName == true) {
            return false;
        }
        return true;
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getAllLedgerInfo(this.filterObj);
    }
}
