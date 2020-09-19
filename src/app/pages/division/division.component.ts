import { Component, ViewChild, OnInit, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

import { DivisionService } from '../../services/BaseService';
import { IDivision, IPaginationViewModel } from '../../models/Models';

import { IFilterViewModel, IDivisionVM } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'divisionSetup',
    templateUrl: 'division.component.html'
})
export class DivisionComponent implements OnInit {
    toggleListVsIcon: boolean;
    selected: string;
    output: string;

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('loadingModal', { static: false }) public loadingModal: ModalDirective;

    isLoading?: boolean = false;

    isAddDivision: boolean = false;
    isExpanded: boolean = false;
    InputDivision: IDivisionVM = <IDivisionVM>{};
    requiredParentId: number;
    closeForm: boolean = true;
    isEditDivision: boolean = false;
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

    currentDivision?: IDivisionVM;
    svDivisionList: IDivisionVM[] = [];
    arrangedDivisionList: IDivisionVM[] = [];
    displayDivisionList: IDivisionVM[] = [];
    displayDivisionListPerPage: IDivisionVM[] = [];

    tempDivisionList: IDivisionVM[] = [];
    qaDivisionList: IDivisionVM[] = [];
    selectDivisionList: IDivisionVM[] = [];
    divisionList: IDivisionVM[] = [];
    userId: string;

    constructor(
        public divisionService: DivisionService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.filterObj = { Name: '', Sort: '' };
    }

    ngOnInit() {
        this.getAllDivision();
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
        this.isAddDivision = true;
        this.isEditDivision = false;
        this.selectedModalLoaded = true;

        if (this.parentId == null) {
            this.InputDivision.ParentId = 0;
        } else {
            this.InputDivision.ParentId = this.parentId;
        }
        this.InputDivision.ParentId = this.parentId;

        this.selectDivisionList = this.getArrangedDivisions(true).filter(x => x.ParentId == null);
        this.childModal.show();
    }

    /**
     * to open edit modal
     */
    public openEditModal(id?: number) {
        this.getDivision(id)
        this.isEditDivision = true;
        this.isAddDivision = false;
        this.selectedModalLoaded = true;

        this.selectDivisionList = this.getArrangedDivisions(true).filter(x => x.ParentId == null);

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
        this.isAddDivision = false;
        this.isEditDivision = false;
        this.InputDivision = <IDivisionVM>{};
        this.getDisplayDivision(this.parentId);
    }

    /**
     * to hide delete modal
     */
    public hideDeleteChildModal(): void {
        this.getDisplayDivision(this.parentId);
        this.deleteModal.hide();
    }

    /**
     * to save new division
     */
    public saveDivision() {
        let saveDivisionItem: IDivision = {
            DivisionName: this.InputDivision.DivisionName,
            ParentId: this.InputDivision.ParentId,
            isGroup: this.InputDivision.isGroup ? this.InputDivision.isGroup : false,
            PostedBy: this.userId
        }

        this.parentId = this.InputDivision.ParentId;

        this.divisionService.post(saveDivisionItem).subscribe(data => {
            this.getAllDivision();
            this.hideChildModal();
        })
    }

    /**
     * to update existing division
     */
    public updateDivision() {
        let saveDivisionItem: IDivision = {
            DivisionId: this.InputDivision.DivisionId,
            DivisionName: this.InputDivision.DivisionName,
            ParentId: this.InputDivision.ParentId,
            isGroup: this.InputDivision.isGroup ? this.InputDivision.isGroup : false,
            StatusId: this.InputDivision.StatusId,
            PostedBy: this.InputDivision.PostedBy,
            PostedOn: this.InputDivision.PostedOn,
            ModifiedBy: this.userId
        }

        this.divisionService.put(saveDivisionItem.DivisionId, saveDivisionItem).subscribe(data => {
            this.parentId = this.InputDivision.ParentId;
            this.getAllDivision(this.parentId);
            this.hideChildModal();
        })
    }

    public deleteDivision() {
        this.divisionService.delete(this.deleteId).subscribe(item => {
            this.getAllDivision(this.parentId);
            this.hideDeleteChildModal();
        });
    }

    /**
     * to go back to parent folder in tree structure
     */
    public back(parentId?: number) {
        this.currentDivision = this.svDivisionList.filter(y => y.DivisionId == parentId)[0];
        this.parentId = this.currentDivision.ParentId;
        this.getDisplayDivision(this.parentId);
    }

    /**
     * to filter data in current list
     */
    public filterData() {
        this.svDivisionList.sort()

        this.tempDivisionList = this.displayDivisionList;

        if (this.filterObj != null) {
            if (this.filterObj.Sort == 'true') {
                this.displayDivisionList = this.displayDivisionList.sort(function (a, b) {
                    if (a.DivisionName < b.DivisionName) return -1;
                    if (a.DivisionName > b.DivisionName) return 1;
                    return 0;
                });
            }
            else if (this.filterObj.Sort == 'false') {
                this.displayDivisionList = this.displayDivisionList.sort(function (a, b) {
                    if (a.DivisionName < b.DivisionName) return 1;
                    if (a.DivisionName > b.DivisionName) return -1;
                    return 0;
                });
            }
            else {
                this.displayDivisionList = this.tempDivisionList;
            }
        }
    }

    getAllDivision(parentId?: number) {
        this.openLoadingModal();
        this.divisionService.getAll().subscribe((data: IDivisionVM[]) => {
            this.hideLoadingModal();

            this.svDivisionList = data;
            this.divisionList = data;

            this.divisionList.forEach(item => {
                if (this.currentDivision == null) {
                    item.isOpen = true;
                }

                item.fileDepthPath = "";
                item.fileDepthFolders = [];
            })

            this.getDisplayDivision(this.parentId);
        });
    }

    getDivision(divisionId: number) {
        this.divisionService.get(divisionId).subscribe((data: IDivisionVM) => {
            this.InputDivision = data;
        });
    }

    getArrangedDivisions(isGroup?: any): IDivisionVM[] {
        if (isGroup != null) {
            this.arrangedDivisionList = this.divisionList.filter(x => x.isGroup == true);
        } else {
            this.arrangedDivisionList = this.divisionList;
        }

        this.arrangedDivisionList.forEach(divisionItem => {
            divisionItem.ChildDivision = this.divisionList.filter(x => x.ParentId == divisionItem.DivisionId);
            if (divisionItem.ParentId == null) {
                divisionItem.fileDepthPath = "0 " + divisionItem.DivisionId.toString() + " ";
            } else {
                divisionItem.fileDepthPath = this.svDivisionList.filter(x => x.DivisionId == divisionItem.ParentId)[0].fileDepthPath + divisionItem.DivisionId.toString() + " ";
            }

            if (this.currentDivision != null) {
                if (divisionItem.fileDepthPath.startsWith(this.currentDivision.fileDepthPath)) {
                    divisionItem.isOpen = true;
                }
            } else {
                divisionItem.isOpen = true;
            }
            divisionItem.fileDepthFolders = this.svDivisionList.filter(x => divisionItem.fileDepthPath.split(" ").lastIndexOf(x.DivisionId.toString()) != -1);
        });

        return this.arrangedDivisionList;
    }

    getDisplayDivision(parentId?: number) {
        if (parentId == null && this.parentId == null) {
            this.parentId = null;
            this.currentDivision = null;
        } else {
            this.parentId = parentId;
            this.currentDivision = this.svDivisionList.filter(x => x.DivisionId == this.parentId)[0];
        }

        this.arrangedDivisionList.forEach(item => {
            if (item.DivisionId == this.parentId) {
                item.isSelected = true;
                this.currentDivision = item;
            } else {
                item.isSelected = false;
            }
        });

        if ((this.filterObj.Name != null && this.filterObj.Name != "")) {
            this.filterQaDivisionList(this.getArrangedDivisions());
        } else {
            this.qaDivisionList = this.getArrangedDivisions().filter(x => x.ParentId == null);
        }
        this.setPagination();
    }

    getDivisionFrmChild(divisionItem?: IDivisionVM) {
        if (divisionItem.isGroup == true) {
            this.currentDivision = divisionItem;
            this.parentId = divisionItem.DivisionId;
            this.getDisplayDivision(divisionItem.DivisionId);
        } else {
            this.currentDivision = this.svDivisionList.filter(x => x.DivisionId == divisionItem.ParentId)[0];
            if (this.currentDivision != null) {
                this.currentDivision.isSelected = true;
                this.parentId = this.currentDivision.DivisionId;
            }

            this.svDivisionList.filter(x => x.DivisionId != this.parentId).forEach(item => {
                item.isSelected = false;
            })

            this.openEditModal(divisionItem.DivisionId);
        }
    }

    getDivisionFrmSelectChild(divisionItem?: IDivisionVM) {
        if (divisionItem == null || divisionItem == undefined) {
            this.InputDivision.ParentId = null;

            this.selectDivisionList.forEach(item => {
                item.isSelected = false;
            })
        } else {
            this.InputDivision.ParentId = divisionItem.DivisionId;
        }
    }

    hasSubitem(divisionId: number) {
        if (this.svDivisionList.filter(x => x.ParentId == divisionId).length > 0) {
            return true;
        } else {
            return false;
        }
    }

    filterQaDivisionList(divisionList?: IDivisionVM[]) {
        let newDivisionList: IDivisionVM[] = [];
        let filteredDivisionList: IDivisionVM[] = [];

        filteredDivisionList = divisionList.filter(it => it.DivisionName.toUpperCase().lastIndexOf(this.filterObj.Name.toUpperCase()) != -1);

        filteredDivisionList.forEach(filteredItem => {
            filteredItem.fileDepthFolders.forEach(item => {
                if (newDivisionList.filter(x => x.DivisionId == item.DivisionId).length == 0) {
                    item.isOpen = true;

                    if (this.parentId == item.DivisionId) {
                        item.isSelected = true;
                    }
                    newDivisionList.push(item);
                }
            })
        })

        newDivisionList.forEach(item => {
            if (item.isGroup == true) {
                item.ChildDivision = newDivisionList.filter(y => y.ParentId == item.DivisionId);
            }
        });

        this.qaDivisionList = newDivisionList.filter(x => x.ParentId == null);
        this.setPagination();
    }


    gotoPage(pageNum?: number) {
        this.pagination.CurrentPage = pageNum <= 1 ? 1 : pageNum > this.pagination.TotalPage ? this.pagination.TotalPage : pageNum;

        this.displayDivisionList = this.svDivisionList.filter(x => x.ParentId == this.parentId);

        if (this.filterObj.Name != '' || this.filterObj.Name != null) {
            this.displayDivisionList = this.displayDivisionList.filter(x => x.DivisionName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        } else {
            this.displayDivisionList = this.displayDivisionList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        }
    }

    setPagination() {
        this.pagination.TotalItems = this.svDivisionList.filter(x => x.ParentId == this.parentId && x.DivisionName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).length;
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        if (this.pagination.TotalPage == 0) {
            this.pagination.TotalPage = 1;
        }

        this.gotoPage(1);
    }

}
