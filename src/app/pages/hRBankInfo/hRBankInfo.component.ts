import { Component, Injectable, ViewChild } from '@angular/core';
import { HRBankInfoService } from '../../services/BaseService';
import { IHRBankInfo, IPagination } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    templateUrl: 'hRBankInfo.component.html'
})
export class HRBankInfoComponent {
    isAddBankInfo: boolean = false;
    isEditBankInfo: boolean = false;
    isAddEditToggle: boolean = false;
    bankInfoList: IHRBankInfo[] = [];
    InputBankInfo: IHRBankInfo = <IHRBankInfo>{};

    @ViewChild('bankInfoModal', { static: false }) public bankInfoModal: ModalDirective
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

    //searching and sorting
    filterObj?: IFilterViewModel;

    //for pagination
    pagination?: IPagination;

    constructor(
        public hRBankInfoService: HRBankInfoService,
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
        this.getAllBankInfo();
    }

    public filterBankInfo() {
        this.resetPagination();
        this.getAllBankInfo(this.filterObj);
    }

    public bankInfoAndFilter() {
        this.resetPagination();
        this.filterObj = { Name: '', Sort: '' };
        this.getAllBankInfo();
    }

    //getAll
    public getAllBankInfo(filterObj?: IFilterViewModel) {
        var query: string = "";

        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Name != undefined && filterObj.Name != "") {
                if (query != null && query != "") {
                    query += "&$filter=substringof('" + this.filterObj.Name + "',BName)";
                }
                else {
                    query += "$filter=substringof('" + this.filterObj.Name + "',BName)";
                }
            }
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
        else {
            if (this.isAddEditToggle == true) {
                if (query != null && query != "") {
                    query += "&$orderby=ModifiedOn desc";
                }
                else {
                    query += "$orderby=ModifiedOn desc";
                }
            }
            else {
                if (query != null && query != "") {
                    query += "&$orderby=PostedOn desc";
                }
                else {
                    query += "$orderby=PostedOn desc";
                }
            }
        }
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        if (query != null && query != "") {
            query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        }
        else {
            query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        }

        this.hRBankInfoService.getAll(query)
            .subscribe((list: any) => {
                this.bankInfoList = list.value;
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
        this.isAddBankInfo = true;
        this.isEditBankInfo = false;
        this.selectedModalLoaded = true;
        this.bankInfoModal.show();
    }

    public hideModal() {
        this.bankInfoModal.hide();
        this.isAddBankInfo = false;
        this.isEditBankInfo = false;
        this.isAddEditToggle = false;
        this.duplicateName = false;
        this.InputBankInfo = <IHRBankInfo>{};
        this.selectedModalLoaded = false;
    }

    public saveBankInfo() {
        this.InputBankInfo.PostedBy = this.userId;
        let saveItem: IHRBankInfo = Object.assign({}, this.InputBankInfo);

        this.hRBankInfoService.post(saveItem)
            .subscribe(() => {
                this.InputBankInfo = <IHRBankInfo>{};
                this.isAddEditToggle = false;
                this.selectedModalLoaded = false;
                this.hideModal();
                this.getAllBankInfo();

                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Bank Information has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    //delete
    openDeleteModal(Id: number) {
        this.deleteId = Id;
        this.deleteModalLoaded = true;
        this.deleteModal.show();
    }

    public hideDeleteModal(): void {
        this.deleteModal.hide();
    }

    public deleteBankInfo() {
        this.hRBankInfoService.delete(this.deleteId)
            .subscribe(() => {
                this.getAllBankInfo();
                this.deleteModalLoaded = false;
                this.hideDeleteModal();

                var toastOptions: ToastOptions = {
                    title: "Delete",
                    msg: "Bank Information has been deleted successfully",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.error(toastOptions);

            });
    }

    //EditModal
    openEditModal() {
        this.isEditBankInfo = true;
        this.isAddBankInfo = false;
        this.selectedModalLoaded = true;
        this.bankInfoModal.show();
    }


    //getOne
    public getBankInfo(id: number) {
        this.hRBankInfoService.get(id)
            .subscribe((one: IHRBankInfo) => {
                this.InputBankInfo = one;
                this.isAddEditToggle = true;
                this.openEditModal();
            });
    }

    //edit
    public editBankInfo() {
        this.InputBankInfo.ModifiedBy = this.userId;
        let editItem: IHRBankInfo = Object.assign({}, this.InputBankInfo);
        this.hRBankInfoService.put(editItem.Bid, editItem)
            .subscribe(() => {
                this.getAllBankInfo();
                this.isEditBankInfo = false;
                this.InputBankInfo = <IHRBankInfo>{};
                this.hideModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Bank Information has been successfully Edited",
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
        this.getAllBankInfo(this.filterObj);
    }

    public checkDuplicate(event: any) {
        var query = "$filter=BName eq '" + event + "'";
        this.hRBankInfoService.getAll(query).subscribe((data: IHRBankInfo[]) => {
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
        this.getAllBankInfo(this.filterObj);
    }
}
