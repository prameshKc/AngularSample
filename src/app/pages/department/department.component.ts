import { Component, ViewChild, OnInit, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';

import { DepartmentService } from '../../services/BaseService';
import { IDepartment, IPaginationViewModel } from '../../models/Models';

import { IFilterViewModel, IDepartmentVM } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'departmentSetup',
    templateUrl: 'department.component.html',
})
export class DepartmentComponent implements OnInit {
    toggleListVsIcon: boolean;
    selected: string;
    output: string;

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('loadingModal', { static: false }) public loadingModal: ModalDirective;

    isLoading?: boolean = false;

    isAddDepartment: boolean = false;
    isExpanded: boolean = false;
    InputDepartment: IDepartmentVM = <IDepartmentVM>{};
    requiredParentId: number;
    closeForm: boolean = true;
    isEditDepartment: boolean = false;
    selectedModalLoaded: boolean = false;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    pagination?: IPaginationViewModel = {
        CurrentPage: 1,
        MaxItems: 50,
        ItemsPerPage: 18,
        TotalPage: 1
    };

    toastOptions: ToastOptions;
    filterObj?: IFilterViewModel = <IFilterViewModel>{};

    parentId?: number;

    currentDepartment?: IDepartmentVM;
    svDepartmentList: IDepartmentVM[] = [];
    arrangedDepartmentList: IDepartmentVM[] = [];
    displayDepartmentList: IDepartmentVM[] = [];
    displayDepartmentListPerPage: IDepartmentVM[] = [];

    tempDepartmentList: IDepartmentVM[] = [];
    qaDepartmentList: IDepartmentVM[] = [];
    selectDepartmentList: IDepartmentVM[] = [];
    departmentList: IDepartmentVM[] = [];
    userId: string;

    constructor(
        public departmentService: DepartmentService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.filterObj = { Name: '', Sort: '' };
    }

    ngOnInit() {
        this.getAllDepartment();
    }

    /**
     * to open loading modal
     */
    public openLoadingModal() {
        this.isLoading = true;
    }

    /**
     * to hide loading modal
     */
    public hideLoadingModal() {

        setTimeout(() => {
            //this.isLoading = false;
            if (this.loadingModal != undefined) {
                this.loadingModal.hide();
            }
        }, 250);
    }

    /**
     * to open add modal
     */
    public openAddModal() {
        this.isAddDepartment = true;
        this.isEditDepartment = false;
        this.selectedModalLoaded = true;

        if (this.parentId == null) {
            this.InputDepartment.ParentId = 0;
        } else {
            this.InputDepartment.ParentId = this.parentId;
        }
        this.InputDepartment.ParentId = this.parentId;

        this.selectDepartmentList = this.getArrangedDepartments(true).filter(x => x.ParentId == null);
        this.childModal.show();
    }

    /**
     * to open edit modal
     */
    public openEditModal(id?: number) {
        this.getDepartment(id)
        this.isEditDepartment = true;
        this.isAddDepartment = false;
        this.selectedModalLoaded = true;

        this.selectDepartmentList = this.getArrangedDepartments(true).filter(x => x.ParentId == null);

        this.childModal.show();
    }

    /**
     * to open delete modal
     */
    public openDeleteModal(Id: number) {
        this.deleteId = Id;
        this.deleteModalLoaded = true;
        this.deleteModal.show();
    }

    /**
     * to hide add/edit modal
     */
    public hideChildModal(): void {
        this.childModal.hide();
        this.isAddDepartment = false;
        this.isEditDepartment = false;
        this.InputDepartment = <IDepartmentVM>{};
        this.getDisplayDepartment(this.parentId);
    }

    /**
     * to hide delete modal
     */
    public hideDeleteChildModal(): void {
        this.getDisplayDepartment(this.parentId);
        this.deleteModal.hide();
    }

    /**
     * to save new department
     */
    public saveDepartment() {
        let saveDepartmentItem: IDepartment = {
            DepartmentName: this.InputDepartment.DepartmentName,
            ParentId: this.InputDepartment.ParentId,
            isGroup: this.InputDepartment.isGroup ? this.InputDepartment.isGroup : false,
            PostedBy: this.userId
        }

        this.parentId = this.InputDepartment.ParentId;

        this.departmentService.post(saveDepartmentItem).subscribe(data => {
            this.getAllDepartment();
            this.hideChildModal();
        })
    }

    /**
     * to update existing department
     */
    public updateDepartment() {
        let saveDepartmentItem: IDepartment = {
            DepartmentId: this.InputDepartment.DepartmentId,
            DepartmentName: this.InputDepartment.DepartmentName,
            ParentId: this.InputDepartment.ParentId,
            isGroup: this.InputDepartment.isGroup ? this.InputDepartment.isGroup : false,
            StatusId: this.InputDepartment.StatusId,
            PostedOn: this.InputDepartment.PostedOn,
            PostedBy: this.InputDepartment.PostedBy,
            ModifiedBy: this.userId
        }

        this.departmentService.put(saveDepartmentItem.DepartmentId, saveDepartmentItem).subscribe(data => {
            this.parentId = this.InputDepartment.ParentId;
            this.getAllDepartment(this.parentId);
            this.hideChildModal();
        })
    }

    public deleteDepartment() {
        this.departmentService.delete(this.deleteId).subscribe(item => {
            this.getAllDepartment(this.parentId);
            this.hideDeleteChildModal();
        });
    }

    /**
     * to go back to parent folder in tree structure
     */
    public back(parentId?: number) {
        this.currentDepartment = this.svDepartmentList.filter(y => y.DepartmentId == parentId)[0];
        this.parentId = this.currentDepartment.ParentId;
        this.getDisplayDepartment(this.parentId);
    }

    /**
     * to filter data in current list
     */
    public filterData() {
        this.svDepartmentList.sort()

        this.tempDepartmentList = this.displayDepartmentList;

        if (this.filterObj != null) {
            if (this.filterObj.Sort == 'true') {
                this.displayDepartmentList = this.displayDepartmentList.sort(function (a, b) {
                    if (a.DepartmentName < b.DepartmentName) return -1;
                    if (a.DepartmentName > b.DepartmentName) return 1;
                    return 0;
                });
            }
            else if (this.filterObj.Sort == 'false') {
                this.displayDepartmentList = this.displayDepartmentList.sort(function (a, b) {
                    if (a.DepartmentName < b.DepartmentName) return 1;
                    if (a.DepartmentName > b.DepartmentName) return -1;
                    return 0;
                });
            }
            else {
                this.displayDepartmentList = this.tempDepartmentList;
            }
        }
    }

    getAllDepartment(parentId?: number) {
        this.openLoadingModal();
        this.departmentService.getAll().subscribe((data: IDepartmentVM[]) => {
            this.hideLoadingModal();

            this.svDepartmentList = data;
            this.departmentList = data;

            this.departmentList.forEach(item => {
                if (this.currentDepartment == null) {
                    item.isOpen = true;
                }

                item.fileDepthPath = "";
                item.fileDepthFolders = [];
            })

            this.getDisplayDepartment(this.parentId);
        });
    }

    getDepartment(departmentId: number) {
        this.departmentService.get(departmentId).subscribe((data: IDepartmentVM) => {
            this.InputDepartment = data;
        });
    }

    getArrangedDepartments(isGroup?: any): IDepartmentVM[] {
        if (isGroup != null) {
            this.arrangedDepartmentList = this.departmentList.filter(x => x.isGroup == true);
        } else {
            this.arrangedDepartmentList = this.departmentList;
        }

        this.arrangedDepartmentList.forEach(departmentItem => {
            departmentItem.ChildDepartment = this.departmentList.filter(x => x.ParentId == departmentItem.DepartmentId);
            if (departmentItem.ParentId == null) {
                departmentItem.fileDepthPath = "0 " + departmentItem.DepartmentId.toString() + " ";
            } else {
                departmentItem.fileDepthPath = this.svDepartmentList.filter(x => x.DepartmentId == departmentItem.ParentId)[0].fileDepthPath + departmentItem.DepartmentId.toString() + " ";
            }

            if (this.currentDepartment != null) {
                if (departmentItem.fileDepthPath.startsWith(this.currentDepartment.fileDepthPath)) {
                    departmentItem.isOpen = true;
                }
            } else {
                departmentItem.isOpen = true;
            }
            departmentItem.fileDepthFolders = this.svDepartmentList.filter(x => departmentItem.fileDepthPath.split(" ").lastIndexOf(x.DepartmentId.toString()) != -1);
        });

        return this.arrangedDepartmentList;
    }

    getDisplayDepartment(parentId?: number) {
        if (parentId == null && this.parentId == null) {
            this.parentId = null;
            this.currentDepartment = null;
        } else {
            this.parentId = parentId;
            this.currentDepartment = this.svDepartmentList.filter(x => x.DepartmentId == this.parentId)[0];
        }

        this.arrangedDepartmentList.forEach(item => {
            if (item.DepartmentId == this.parentId) {
                item.isSelected = true;
                this.currentDepartment = item;
            } else {
                item.isSelected = false;
            }
        });

        if ((this.filterObj.Name != null && this.filterObj.Name != "")) {
            this.filterQaDepartmentList(this.getArrangedDepartments());
        } else {
            this.qaDepartmentList = this.getArrangedDepartments().filter(x => x.ParentId == null);
        }
        this.setPagination();
    }

    getDepartmentFrmChild(departmentItem?: IDepartmentVM) {
        if (departmentItem.isGroup == true) {
            this.currentDepartment = departmentItem;
            this.parentId = departmentItem.DepartmentId;
            this.getDisplayDepartment(departmentItem.DepartmentId);
        } else {
            this.currentDepartment = this.svDepartmentList.filter(x => x.DepartmentId == departmentItem.ParentId)[0];
            if (this.currentDepartment != null) {
                this.currentDepartment.isSelected = true;
                this.parentId = this.currentDepartment.DepartmentId;
            }

            this.svDepartmentList.filter(x => x.DepartmentId != this.parentId).forEach(item => {
                item.isSelected = false;
            })

            this.openEditModal(departmentItem.DepartmentId);
        }
    }

    getDepartmentFrmSelectChild(departmentItem?: IDepartmentVM) {
        if (departmentItem == null || departmentItem == undefined) {
            this.InputDepartment.ParentId = null;

            this.selectDepartmentList.forEach(item => {
                item.isSelected = false;
            })
        } else {
            this.InputDepartment.ParentId = departmentItem.DepartmentId;
        }
    }

    hasSubitem(departmentId: number) {
        if (this.svDepartmentList.filter(x => x.ParentId == departmentId).length > 0) {
            return true;
        } else {
            return false;
        }
    }

    filterQaDepartmentList(departmentList?: IDepartmentVM[]) {
        let newDepartmentList: IDepartmentVM[] = [];
        let filteredDepartmentList: IDepartmentVM[] = [];

        filteredDepartmentList = departmentList.filter(it => it.DepartmentName.toUpperCase().lastIndexOf(this.filterObj.Name.toUpperCase()) != -1);

        filteredDepartmentList.forEach(filteredItem => {
            filteredItem.fileDepthFolders.forEach(item => {
                if (newDepartmentList.filter(x => x.DepartmentId == item.DepartmentId).length == 0) {
                    item.isOpen = true;

                    if (this.parentId == item.DepartmentId) {
                        item.isSelected = true;
                    }
                    newDepartmentList.push(item);
                }
            })
        })

        newDepartmentList.forEach(item => {
            if (item.isGroup == true) {
                item.ChildDepartment = newDepartmentList.filter(y => y.ParentId == item.DepartmentId);
            }
        });

        this.qaDepartmentList = newDepartmentList.filter(x => x.ParentId == null);
        this.setPagination();
    }


    gotoPage(pageNum?: number) {
        this.pagination.CurrentPage = pageNum <= 1 ? 1 : pageNum > this.pagination.TotalPage ? this.pagination.TotalPage : pageNum;

        this.displayDepartmentList = this.svDepartmentList.filter(x => x.ParentId == this.parentId);

        if (this.filterObj.Name != '' || this.filterObj.Name != null) {
            this.displayDepartmentList = this.displayDepartmentList.filter(x => x.DepartmentName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        } else {
            this.displayDepartmentList = this.displayDepartmentList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        }
    }

    setPagination() {
        this.pagination.TotalItems = this.svDepartmentList.filter(x => x.ParentId == this.parentId && x.DepartmentName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).length;
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        if (this.pagination.TotalPage == 0) {
            this.pagination.TotalPage = 1;
        }

        this.gotoPage(1);
    }

}
