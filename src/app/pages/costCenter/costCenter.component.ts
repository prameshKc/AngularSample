import { Component, Injectable, ViewChild } from '@angular/core';
import { CostCenterService, ReportToService } from '../../services/BaseService';
import { ICostCenter, IPagination, IReportTo } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    selector: 'cost-center',
    templateUrl: 'costCenter.component.html'
})
export class CostCenterComponent {
    isAddCostCenter: boolean = false;
    isEditCostCenter: boolean = false;
    isAddEditToggle: boolean = false;
    costCenterList: ICostCenter[] = [];
    InputCostCenter: ICostCenter = <ICostCenter>{};
    reportList: IReportTo[];

    //cost Center Modal
  @ViewChild('costCenterModal', { static: false }) public costCenterModal: ModalDirective
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

    //searching and sorting
    filterObj?: IFilterViewModel;

    //for pagination
    pagination?: IPagination;

    constructor(
        public costCenterService: CostCenterService,
        public reportToService: ReportToService,
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
        this.getAllCostCenter();
        //this.testReportTo();
    }

    //getAll
    public getAllCostCenter(filterObj?: IFilterViewModel) {
        var query:string="";

        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Name != undefined && filterObj.Name != "") {
                if (query != null && query != "") {
                    query += "&$filter=substringof('" + this.filterObj.Name + "',CostCenterName)";
                }
                else {
                    query += "$filter=substringof('" + this.filterObj.Name + "',CostCenterName)";
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

        this.costCenterService.getAll(query)
            .subscribe((list: any) => {               
                this.costCenterList = list.value;
                this.pagination = {
                    ItemsPerPage: this.pagination.ItemsPerPage,
                    TotalItems: <number>(list["odata.count"]),
                    CurrentPage: this.pagination.CurrentPage,
                    SortBy: this.pagination.SortBy
                }; 
            });
    }
    //filter
    public filterCostCenter() {
        this.pagination.CurrentPage = 1;
        this.getAllCostCenter(this.filterObj);
    }

    public costCenterAndFilter() {
        this.filterObj = { Name: '', Sort: '' };
        this.getAllCostCenter();
    }

    //post
    //openModal
    public openCostCenterModal() {
        this.isAddCostCenter = true;
        this.isEditCostCenter = false;
        this.selectedModalLoaded = true;
        if (this.costCenterModal != undefined) {
            this.costCenterModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.costCenterModal.show();
    }

    public hideCostCenterModal() {
        document.body.removeChild(document.querySelector('.modal-backdrop'));
        this.costCenterModal.hide();
        this.isAddCostCenter = false;
        this.isEditCostCenter = false;
        this.isAddEditToggle = false;
        this.InputCostCenter = <ICostCenter>{};
        this.selectedModalLoaded = false;
    }

    public saveCostCenter() {
        this.InputCostCenter.PostedBy = this.userId;
        this.costCenterService.post(this.InputCostCenter)
            .subscribe(() => {
                this.InputCostCenter = <ICostCenter>{};
                this.isAddEditToggle = false;
                this.selectedModalLoaded = false;
                this.hideCostCenterModal();
                this.getAllCostCenter();

                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Cost Center has been successfully Added",
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
        if (this.deleteModal != undefined) {
            this.deleteModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.deleteModal.show();
    }

    public hideDeleteModal(): void {
        document.body.removeChild(document.querySelector('.modal-backdrop'));
        this.deleteModal.hide();
    }

    public deleteCostCenter() {
        this.costCenterService.delete(this.deleteId)
            .subscribe(() => {
                this.getAllCostCenter();
                this.deleteModalLoaded = false;
                this.hideDeleteModal();

                var toastOptions: ToastOptions = {
                    title: "Delete",
                    msg: "Cost Center has been deleted successfully",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.error(toastOptions);

            });
    }

    //EditModal
    openEditModal() {
        this.isEditCostCenter = true;
        this.isAddCostCenter = false;
        this.selectedModalLoaded = true;
        if (this.costCenterModal != undefined) {
            this.costCenterModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.costCenterModal.show();
    }


    //getOne
    public getCostCenter(id: number) {
        this.costCenterService.get(id)
            .subscribe((one: ICostCenter) => {
                this.InputCostCenter = one;
                this.isAddEditToggle = true;
                this.openEditModal();
            });
    }

    //edit
    public editCostCenter() {
        this.InputCostCenter.ModifiedBy = this.userId;
        this.costCenterService.put(this.InputCostCenter.CostCenterId, this.InputCostCenter)
            .subscribe(() => {               
                this.getAllCostCenter();

                //this.filterCostCenter();
                this.isEditCostCenter = false;
                this.InputCostCenter = <ICostCenter>{};
                this.hideCostCenterModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Cost Center has been successfully Edited",
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
        this.getAllCostCenter(this.filterObj);
    }

    //public testReportTo() {
    //    this.reportToService.getAssignedUser(1)
    //        .subscribe((list: IReportTo[]) => {
    //            this.reportList = list;
    //        });

    //}
    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        //this.getUserDetails();
        this.getAllCostCenter(this.filterObj);
    }
}
