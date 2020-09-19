import { Component, ViewChild, OnInit, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

import { DesignationService } from '../../services/BaseService';
import { IDesignation, IPaginationViewModel } from '../../models/Models';

import { IFilterViewModel, IDesignationVM } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'designationSetup',
    templateUrl: 'designation.component.html',
})
export class DesignationComponent implements OnInit {
    toggleListVsIcon: boolean;
    selected: string;
    output: string;

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('loadingModal', { static: false }) public loadingModal: ModalDirective;

    isLoading?: boolean = false;

    isAddDesignation: boolean = false;
    isExpanded: boolean = false;
    InputDesignation: IDesignationVM = <IDesignationVM>{};
    requiredParentId: number;
    closeForm: boolean = true;
    isEditDesignation: boolean = false;
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

    currentDesignation?: IDesignationVM;
    svDesignationList: IDesignationVM[] = [];
    arrangedDesignationList: IDesignationVM[] = [];
    displayDesignationList: IDesignationVM[] = [];
    displayDesignationListPerPage: IDesignationVM[] = [];

    tempDesignationList: IDesignationVM[] = [];
    qaDesignationList: IDesignationVM[] = [];
    selectDesignationList: IDesignationVM[] = [];
    designationList: IDesignationVM[] = [];
    userId: string;

    constructor(
        public designationService: DesignationService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.filterObj = { Name: '', Sort: '' };
    }

    ngOnInit() {
        this.getAllDesignation();
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
        this.isAddDesignation = true;
        this.isEditDesignation = false;
        this.selectedModalLoaded = true;

        if (this.parentId == null) {
            this.InputDesignation.ParentId = 0;
        } else {
            this.InputDesignation.ParentId = this.parentId;
        }
        this.InputDesignation.ParentId = this.parentId;

        this.selectDesignationList = this.getArrangedDesignations(true).filter(x => x.ParentId == null);
        this.childModal.show();
    }

    /**
     * to open edit modal
     */
    public openEditModal(id?: number) {
        this.getDesignation(id)
        this.isEditDesignation = true;
        this.isAddDesignation = false;
        this.selectedModalLoaded = true;

        this.selectDesignationList = this.getArrangedDesignations(true).filter(x => x.ParentId == null);

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
        this.isAddDesignation = false;
        this.isEditDesignation = false;
        this.InputDesignation = <IDesignationVM>{};
        this.getDisplayDesignation(this.parentId);
    }

    /**
     * to hide delete modal
     */
    public hideDeleteChildModal(): void {
        this.getDisplayDesignation(this.parentId);
        this.deleteModal.hide();
    }

    /**
     * to save new designation
     */
    public saveDesignation() {
        let saveDesignationItem: IDesignation = {
            DesignationName: this.InputDesignation.DesignationName,
            ParentId: this.InputDesignation.ParentId,
            isGroup: this.InputDesignation.isGroup ? this.InputDesignation.isGroup : false,
            PostedBy: this.userId
        }

        this.parentId = this.InputDesignation.ParentId;

        this.designationService.post(saveDesignationItem).subscribe(data => {
            this.getAllDesignation();
            this.hideChildModal();
        })
    }

    /**
     * to update existing designation
     */
    public updateDesignation() {
        let saveDesignationItem: IDesignation = {
            DesignationId: this.InputDesignation.DesignationId,
            DesignationName: this.InputDesignation.DesignationName,
            ParentId: this.InputDesignation.ParentId,
            isGroup: this.InputDesignation.isGroup ? this.InputDesignation.isGroup : false,
            StatusId: this.InputDesignation.StatusId,
            PostedOn: this.InputDesignation.PostedOn,
            PostedBy: this.InputDesignation.PostedBy,
            ModifiedBy: this.userId
        }

        this.designationService.put(saveDesignationItem.DesignationId, saveDesignationItem).subscribe(data => {
            this.parentId = this.InputDesignation.ParentId;
            this.getAllDesignation(this.parentId);
            this.hideChildModal();
        })
    }

    public deleteDesignation() {
        this.designationService.delete(this.deleteId).subscribe(item => {
            this.getAllDesignation(this.parentId);
            this.hideDeleteChildModal();
        });
    }

    /**
     * to go back to parent folder in tree structure
     */
    public back(parentId?: number) {
        this.currentDesignation = this.svDesignationList.filter(y => y.DesignationId == parentId)[0];
        this.parentId = this.currentDesignation.ParentId;
        this.getDisplayDesignation(this.parentId);
    }

    /**
     * to filter data in current list
     */
    public filterData() {
        this.svDesignationList.sort()

        this.tempDesignationList = this.displayDesignationList;

        if (this.filterObj != null) {
            if (this.filterObj.Sort == 'true') {
                this.displayDesignationList = this.displayDesignationList.sort(function (a, b) {
                    if (a.DesignationName < b.DesignationName) return -1;
                    if (a.DesignationName > b.DesignationName) return 1;
                    return 0;
                });
            }
            else if (this.filterObj.Sort == 'false') {
                this.displayDesignationList = this.displayDesignationList.sort(function (a, b) {
                    if (a.DesignationName < b.DesignationName) return 1;
                    if (a.DesignationName > b.DesignationName) return -1;
                    return 0;
                });
            }
            else {
                this.displayDesignationList = this.tempDesignationList;
            }
        }
    }

    getAllDesignation(parentId?: number) {
        this.openLoadingModal();
        this.designationService.getAll().subscribe((data: IDesignationVM[]) => {
            this.hideLoadingModal();

            this.svDesignationList = data;
            this.designationList = data;

            this.designationList.forEach(item => {
                if (this.currentDesignation == null) {
                    item.isOpen = true;
                }

                item.fileDepthPath = "";
                item.fileDepthFolders = [];
            })

            this.getDisplayDesignation(this.parentId);
        });
    }

    getDesignation(designationId: number) {
        this.designationService.get(designationId).subscribe((data: IDesignationVM) => {
            this.InputDesignation = data;
        });
    }

    getArrangedDesignations(isGroup?: any): IDesignationVM[] {
        if (isGroup != null) {
            this.arrangedDesignationList = this.designationList.filter(x => x.isGroup == true);
        } else {
            this.arrangedDesignationList = this.designationList;
        }

        this.arrangedDesignationList.forEach(designationItem => {
            designationItem.ChildDesignation = this.designationList.filter(x => x.ParentId == designationItem.DesignationId);
            if (designationItem.ParentId == null) {
                designationItem.fileDepthPath = "0 " + designationItem.DesignationId.toString() + " ";
            } else {
                designationItem.fileDepthPath = this.svDesignationList.filter(x => x.DesignationId == designationItem.ParentId)[0].fileDepthPath + designationItem.DesignationId.toString() + " ";
            }

            if (this.currentDesignation != null) {
                if (designationItem.fileDepthPath.startsWith(this.currentDesignation.fileDepthPath)) {
                    designationItem.isOpen = true;
                }
            } else {
                designationItem.isOpen = true;
            }
            designationItem.fileDepthFolders = this.svDesignationList.filter(x => designationItem.fileDepthPath.split(" ").lastIndexOf(x.DesignationId.toString()) != -1);
        });

        return this.arrangedDesignationList;
    }

    getDisplayDesignation(parentId?: number) {
        if (parentId == null && this.parentId == null) {
            this.parentId = null;
            this.currentDesignation = null;
        } else {
            this.parentId = parentId;
            this.currentDesignation = this.svDesignationList.filter(x => x.DesignationId == this.parentId)[0];
        }

        this.arrangedDesignationList.forEach(item => {
            if (item.DesignationId == this.parentId) {
                item.isSelected = true;
                this.currentDesignation = item;
            } else {
                item.isSelected = false;
            }
        });

        if ((this.filterObj.Name != null && this.filterObj.Name != "")) {
            this.filterQaDesignationList(this.getArrangedDesignations());
        } else {
            this.qaDesignationList = this.getArrangedDesignations().filter(x => x.ParentId == null);
        }
        this.setPagination();
    }

    getDesignationFrmChild(designationItem?: IDesignationVM) {
        if (designationItem.isGroup == true) {
            this.currentDesignation = designationItem;
            this.parentId = designationItem.DesignationId;
            this.getDisplayDesignation(designationItem.DesignationId);
        } else {
            this.currentDesignation = this.svDesignationList.filter(x => x.DesignationId == designationItem.ParentId)[0];
            if (this.currentDesignation != null) {
                this.currentDesignation.isSelected = true;
                this.parentId = this.currentDesignation.DesignationId;
            }

            this.svDesignationList.filter(x => x.DesignationId != this.parentId).forEach(item => {
                item.isSelected = false;
            })


            this.openEditModal(designationItem.DesignationId);
        }
    }

    getDesignationFrmSelectChild(designationItem?: IDesignationVM) {
        if (designationItem == null || designationItem == undefined) {
            this.InputDesignation.ParentId = null;

            this.selectDesignationList.forEach(item => {
                item.isSelected = false;
            })
        } else {
            this.InputDesignation.ParentId = designationItem.DesignationId;
        }
    }

    hasSubitem(designationId: number) {
        if (this.svDesignationList.filter(x => x.ParentId == designationId).length > 0) {
            return true;
        } else {
            return false;
        }
    }

    filterQaDesignationList(designationList?: IDesignationVM[]) {
        let newDesignationList: IDesignationVM[] = [];
        let filteredDesignationList: IDesignationVM[] = [];

        filteredDesignationList = designationList.filter(it => it.DesignationName.toUpperCase().lastIndexOf(this.filterObj.Name.toUpperCase()) != -1);

        filteredDesignationList.forEach(filteredItem => {
            filteredItem.fileDepthFolders.forEach(item => {
                if (newDesignationList.filter(x => x.DesignationId == item.DesignationId).length == 0) {
                    item.isOpen = true;

                    if (this.parentId == item.DesignationId) {
                        item.isSelected = true;
                    }
                    newDesignationList.push(item);
                }
            })
        })

        newDesignationList.forEach(item => {
            if (item.isGroup == true) {
                item.ChildDesignation = newDesignationList.filter(y => y.ParentId == item.DesignationId);
            }
        });

        this.qaDesignationList = newDesignationList.filter(x => x.ParentId == null);
        this.setPagination();
    }


    gotoPage(pageNum?: number) {
        this.pagination.CurrentPage = pageNum <= 1 ? 1 : pageNum > this.pagination.TotalPage ? this.pagination.TotalPage : pageNum;

        this.displayDesignationList = this.svDesignationList.filter(x => x.ParentId == this.parentId);

        if (this.filterObj.Name != '' || this.filterObj.Name != null) {
            this.displayDesignationList = this.displayDesignationList.filter(x => x.DesignationName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        } else {
            this.displayDesignationList = this.displayDesignationList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        }
    }

    setPagination() {
        this.pagination.TotalItems = this.svDesignationList.filter(x => x.ParentId == this.parentId && x.DesignationName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).length;
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        if (this.pagination.TotalPage == 0) {
            this.pagination.TotalPage = 1;
        }

        this.gotoPage(1);
    }

}
