import { Component, Injectable, ViewChild } from '@angular/core';
import { LeaveTypeService } from '../../services/BaseService';
import { ILeaveTypeSetup, IPaginationViewModel } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';

@Component({
    templateUrl: 'leaveType.component.html'
})
export class LeaveTypeComponent {
    InputLeaveType: ILeaveTypeSetup = <ILeaveTypeSetup>{};
    isAddEditToggle: boolean = false;
    isAddLeaveType: boolean = false;
    isEditLeaveType: boolean = false;
    leaveTypeList: ILeaveTypeSetup[] = [];

    //for leaveType Modal
  @ViewChild('leaveTypeModal', { static: false }) public leaveTypeModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    //for delete modal
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirectiveDelete: any;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    //for pagination
    pagination?: IPaginationViewModel = {
        CurrentPage: 1,
        MaxItems: 50,
        ItemsPerPage: 50,
        TotalPage: 0
    };

    //searching and sorting
    filterObj?: IFilterViewModel;

    constructor(public leaveTypeService: LeaveTypeService, private toastyService: ToastyService,
        private toastyConfig: ToastyConfig) {
        this.getAllLeaveType();
        this.filterObj = { Name: '', Sort: '' }
    }

    //getAll
    public getAllLeaveType(filterObj?: IFilterViewModel) {
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        let skipCount = (this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage;
        var query = `$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        if (filterObj != undefined || filterObj != null) {

            if (filterObj.Name != undefined && filterObj.Name != "") {
                query += "&$filter=startswith(LeaveTypeName, '" + this.filterObj.Name + "')";
            }
            
            if (filterObj.Sort != undefined && filterObj.Sort != "")  {

                if (filterObj.Sort == 'true') {
                    query += "&$orderby=LeaveTypeName";
                }
                else {
                    query += "&$orderby=LeaveTypeName desc";
                }
            }
        }

        this.leaveTypeService.getAll(query)
            .subscribe((list: any) => {
                this.pagination.TotalItems = <number>(list["odata.count"]);
                this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage); 
                
                this.leaveTypeList = list.value;                
            });
    }

    public filterHome(pagination: number = 1) {

        this.pagination.CurrentPage = pagination <= 1 ? 1 : pagination > this.pagination.TotalPage ? this.pagination.TotalPage : pagination;
        this.getAllLeaveType(this.filterObj);
    }


    public filterLeaveType() {
        this.pagination.CurrentPage = 1;
        this.getAllLeaveType(this.filterObj);
    }

    public leaveTypeAndFilter() {
        this.filterObj = { Name: '', Sort: '' };
        this.getAllLeaveType();
    }

    //leaveType AddModal
    public openLeaveTypeModal() {
        this.isAddLeaveType = true;
        this.isEditLeaveType = false;
        this.selectedModalLoaded = true;
        if (this.leaveTypeModal != undefined) {
            this.leaveTypeModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.leaveTypeModal.show();
    }

    public hideLeaveTypeModal() {
        document.body.removeChild(document.querySelector('.modal-backdrop'));
        this.leaveTypeModal.hide();
        this.isAddLeaveType = false;
        this.isEditLeaveType = false;
        this.isAddEditToggle = false;
        this.InputLeaveType = <ILeaveTypeSetup>{};
        this.selectedModalLoaded = false;
    }


    public saveLeaveType() {
        this.leaveTypeService.post(this.InputLeaveType)
            .subscribe(() => {
                this.InputLeaveType = <ILeaveTypeSetup>{};
                this.isAddEditToggle = false;
                this.selectedModalLoaded = false;
                this.hideLeaveTypeModal();
                this.filterLeaveType();

                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Leave Type Group has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);
            });

       
    }

    //LeaveType EditModal
    openEditModal() {
        this.isEditLeaveType = true;
        this.isAddLeaveType = false;
        this.selectedModalLoaded = true;
        if (this.leaveTypeModal != undefined) {
            this.leaveTypeModal.config.backdrop = false;
        }
        let el = document.createElement('div');
        el.className = 'modal-backdrop fade in';
        document.body.appendChild(el);
        this.leaveTypeModal.show();
    }


    //getOne
    public getLeaveType(id: number) {
        this.openEditModal();
        this.leaveTypeService.get(id)
            .subscribe((one: ILeaveTypeSetup) => {
                this.InputLeaveType = one;
                this.isAddEditToggle = true;
            });
    }

    //edit
    public editLeaveType() {
        this.leaveTypeService.put(this.InputLeaveType.LeaveTypeId, this.InputLeaveType)
            .subscribe(() => {
                this.filterLeaveType();
                this.isEditLeaveType = false;
                this.InputLeaveType = <ILeaveTypeSetup>{};
                this.hideLeaveTypeModal();
                this.selectedModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Leave Type Group has been successfully Edited",
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
    public deleteLeaveType() {
        this.leaveTypeService.delete(this.deleteId)
            .subscribe(() => {
                this.filterLeaveType();
                this.deleteModalLoaded = false;
                this.hideDeleteModal();

                var toastOptions: ToastOptions = {
                    title: "Delete",
                    msg: "Leave Type has been deleted successfully",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.error(toastOptions);
            });
    } 

    filterWorkArea(){
        
    }
}

