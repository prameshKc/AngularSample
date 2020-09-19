import { Component, Injectable, ViewChild } from '@angular/core';
import { WorkAreaService } from '../../services/BaseService';
import { IWorkArea, IPagination } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    templateUrl: 'workArea.component.html',
})
export class WorkAreaComponent {
    InputWorkArea: IWorkArea = <IWorkArea>{};
    isAddEditToggle: boolean = false;
    isAddWorkArea: boolean = false;
    isEditWorkArea: boolean = false;
    workAreaList: IWorkArea[] = [];
    userId: string;
    toggleSort: boolean = false;

    //for pagination
    pagination?: IPagination;

    //for workArea Modal
  @ViewChild('workAreaModal', { static: false }) public workAreaModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    //for delete modal
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirectiveDelete: any;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    //searching and sorting
    filterObj?: IFilterViewModel;

    constructor(
        public workAreaService: WorkAreaService,
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
        this.getAllWorkArea();
    }


    //filter
    public filterWorkArea() {
        this.pagination.CurrentPage = 1;
        this.getAllWorkArea(this.filterObj);
    }

    //getAll
    public getAllWorkArea(filterObj?: IFilterViewModel) {
        let query: string = "";

        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Name != undefined && filterObj.Name != "") {
                if (query != null && query != "") {
                    query += "&$filter=startswith(WorkAreaName, '" + this.filterObj.Name + "')";
                }
                else {
                    query += "$filter=startswith(WorkAreaName, '" + this.filterObj.Name + "')";
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
            if (query != null && query != "") {
                query += "&$orderby=ModifiedOn desc";
            }
            else {
                query += "&$orderby=ModifiedOn desc";
            }
        }
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        if (query != null && query != "") {
            query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        }
        else {
            query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        }
        this.workAreaService.getAll(query).subscribe((list: any) => {            
            this.workAreaList = list.value;
            this.pagination = {
                ItemsPerPage: this.pagination.ItemsPerPage,
                TotalItems: <number>(list["odata.count"]),
                CurrentPage: this.pagination.CurrentPage,
                SortBy: this.pagination.SortBy
            }; 
        });
    }

    public workAreaAndFilter() {
        this.filterObj = { Name: '', Sort: '' };
        this.getAllWorkArea();
    }

    //workArea AddModal
    public openWorkAreaModal() {
        this.isAddWorkArea = true;
        this.isEditWorkArea = false;
        this.selectedModalLoaded = true;
        if (this.workAreaModal != undefined) {
            this.workAreaModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.workAreaModal.show();
    }

    public hideWorkAreaModal() {
        document.body.removeChild(document.querySelector('.modal-backdrop'));
        this.workAreaModal.hide();
        this.isAddWorkArea = false;
        this.isEditWorkArea = false;
        this.isAddEditToggle = false;
        this.InputWorkArea = <IWorkArea>{};
        this.selectedModalLoaded = false;
    }


    public saveWorkArea() {
        this.InputWorkArea.PostedBy = this.userId;
        this.workAreaService.post(this.InputWorkArea)
            .subscribe(() => {
                this.InputWorkArea = <IWorkArea>{};
                this.isAddEditToggle = false;
                this.filterWorkArea();
                this.selectedModalLoaded = false;
                this.hideWorkAreaModal();

                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Work Area has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });

    }

    //workArea EditModal
    openEditModal() {
        this.isEditWorkArea = true;
        this.isAddWorkArea = false;
        this.selectedModalLoaded = true;
        if (this.workAreaModal != undefined) {
            this.workAreaModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.workAreaModal.show();
    }


    //getOne
    public getWorkArea(id: number) {
        this.openEditModal();
        this.workAreaService.get(id)
            .subscribe((one: IWorkArea) => {
                this.InputWorkArea = one;
                this.isAddEditToggle = true;
            });
    }

    //edit
    public editWorkArea() {
        this.InputWorkArea.ModifiedBy = this.userId;
        this.workAreaService.put(this.InputWorkArea.WorkAreaId, this.InputWorkArea)
            .subscribe(() => {
                //this.filterWorkArea();
                this.getAllWorkArea();
                this.isEditWorkArea = false;
                this.InputWorkArea = <IWorkArea>{};
                this.hideWorkAreaModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Work Area has been successfully Edited",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    //deleteModal
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

    //delete
    public deleteWorkArea() {
        this.workAreaService.delete(this.deleteId)
            .subscribe(() => {
                this.filterWorkArea();
                this.deleteModalLoaded = false;
                this.hideDeleteModal();

                var toastOptions: ToastOptions = {
                    title: "Delete",
                    msg: "Work Area has been deleted successfully",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.error(toastOptions);
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
        this.getAllWorkArea(this.filterObj);
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getAllWorkArea(this.filterObj);
    }
}
