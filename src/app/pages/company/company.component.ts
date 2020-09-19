import { Component, ViewChild, OnInit, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';

import { CompanyService } from '../../services/BaseService';
import { ICompany, IPaginationViewModel } from '../../models/Models';

import { IFilterViewModel, ICompanyVM } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'companySetup',
    templateUrl: 'company.component.html'
})
export class CompanyComponent implements OnInit {
    toggleListVsIcon: boolean;
    selected: string;
    output: string;

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('loadingModal', { static: false }) public loadingModal: ModalDirective;

    isLoading?: boolean = false;

    isAddCompany: boolean = false;
    isExpanded: boolean = false;
    InputCompany: ICompanyVM = <ICompanyVM>{};
    requiredParentId: number;
    closeForm: boolean = true;
    isEditCompany: boolean = false;
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

    currentCompany?: ICompanyVM;
    svCompanyList: ICompanyVM[] = [];
    arrangedCompanyList: ICompanyVM[] = [];
    displayCompanyList: ICompanyVM[] = [];
    displayCompanyListPerPage: ICompanyVM[] = [];

    tempCompanyList: ICompanyVM[] = [];
    qaCompanyList: ICompanyVM[] = [];
    selectCompanyList: ICompanyVM[] = [];
    CompanyList: ICompanyVM[] = [];
    userId: string;

    constructor(
        public CompanyService: CompanyService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.filterObj = { Name: '', Sort: '' };
    }

    ngOnInit() {
        this.getAllCompany();
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
            this.isLoading = false;
            if (this.loadingModal != undefined) {
                this.loadingModal.hide();
            }
        }, 250);
    }

    /**
     * to open add modal
     */
    public openAddModal() {
        this.isAddCompany = true;
        this.isEditCompany = false;
        this.selectedModalLoaded = true;

        if (this.parentId == null) {
            this.InputCompany.ParentId = 0;
        } else {
            this.InputCompany.ParentId = this.parentId;
        }
        this.InputCompany.ParentId = this.parentId;

        this.selectCompanyList = this.getArrangedCompanys(true).filter(x => x.ParentId == null);
        this.childModal.show();
    }

    /**
     * to open edit modal
     */
    public openEditModal(id?: number) {
        this.getCompany(id)
        this.isEditCompany = true;
        this.isAddCompany = false;
        this.selectedModalLoaded = true;

        this.selectCompanyList = this.getArrangedCompanys(true).filter(x => x.ParentId == null);

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
        this.isAddCompany = false;
        this.isEditCompany = false;
        this.InputCompany = <ICompanyVM>{};
        this.getDisplayCompany(this.parentId);
    }

    /**
     * to hide delete modal
     */
    public hideDeleteChildModal(): void {
        this.getDisplayCompany(this.parentId);
        this.deleteModal.hide();
    }

    /**
     * to save new Company
     */
    public saveCompany() {
        let saveCompanyItem: ICompany = Object.assign({}, this.InputCompany);

        this.parentId = this.InputCompany.ParentId;

        this.CompanyService.post(saveCompanyItem).subscribe(data => {
            this.getAllCompany();
            this.hideChildModal();
        })
    }

    /**
     * to update existing Company
     */
    public updateCompany() {
        let saveCompanyItem: ICompany = Object.assign({}, this.InputCompany);

        this.CompanyService.put(saveCompanyItem.CompanyId, saveCompanyItem).subscribe(data => {
            this.parentId = this.InputCompany.ParentId;
            this.getAllCompany(this.parentId);
            this.hideChildModal();
        })
    }

    public deleteCompany() {
        //let saveCompanyItem: ICompany = Object.assign({}, this.svCompanyList.filter(x => x.CompanyId == this.deleteId)[0]);
        //let newCompanyItem: ICompany = Object.assign({}, saveCompanyItem);
        //newCompanyItem.StatusId = false;

        //this.CompanyService.put(saveCompanyItem.CompanyId, saveCompanyItem).subscribe(data => {
        //    this.parentId = this.InputCompany.ParentId;
        //    this.getAllCompany(this.parentId);
        //    this.hideChildModal();
        //})
        this.CompanyService.delete(this.deleteId).subscribe(item => {
            this.getAllCompany(this.parentId);
            this.hideDeleteChildModal();
        });
    }

    /**
     * to go back to parent folder in tree structure
     */
    public back(parentId?: number) {
        this.currentCompany = this.svCompanyList.filter(y => y.CompanyId == parentId)[0];
        this.parentId = this.currentCompany.ParentId;
        this.getDisplayCompany(this.parentId);
    }

    /**
     * to filter data in current list
     */
    public filterData() {
        this.svCompanyList.sort()

        this.tempCompanyList = this.displayCompanyList;

        if (this.filterObj != null) {
            if (this.filterObj.Sort == 'true') {
                this.displayCompanyList = this.displayCompanyList.sort(function (a, b) {
                    if (a.CompanyName < b.CompanyName) return -1;
                    if (a.CompanyName > b.CompanyName) return 1;
                    return 0;
                });
            }
            else if (this.filterObj.Sort == 'false') {
                this.displayCompanyList = this.displayCompanyList.sort(function (a, b) {
                    if (a.CompanyName < b.CompanyName) return 1;
                    if (a.CompanyName > b.CompanyName) return -1;
                    return 0;
                });
            }
            else {
                this.displayCompanyList = this.tempCompanyList;
            }
        }
    }

    getAllCompany(parentId?: number) {
        this.openLoadingModal();

        let query = '$filter=StatusId eq true';
        this.CompanyService.getAll(query).subscribe((data: ICompanyVM[]) => {
            this.hideLoadingModal();

            this.svCompanyList = data;
            this.CompanyList = data;

            this.CompanyList.forEach(item => {
                if (this.currentCompany == null) {
                    item.isOpen = true;
                }

                item.fileDepthPath = "";
                item.fileDepthFolders = [];
            })

            this.getDisplayCompany(this.parentId);
        });
    }

    getCompany(CompanyId: number) {
        this.CompanyService.get(CompanyId).subscribe((data: ICompanyVM) => {
            this.InputCompany = data;
        });
    }

    getArrangedCompanys(isGroup?: any): ICompanyVM[] {
        if (isGroup != null) {
            this.arrangedCompanyList = this.CompanyList.filter(x => x.isGroup == true);
        } else {
            this.arrangedCompanyList = this.CompanyList;
        }

        this.arrangedCompanyList.forEach(CompanyItem => {
            CompanyItem.ChildCompany = this.CompanyList.filter(x => x.ParentId == CompanyItem.CompanyId);
            if (CompanyItem.ParentId == null) {
                CompanyItem.fileDepthPath = "0 " + CompanyItem.CompanyId.toString() + " ";
            } else {
                CompanyItem.fileDepthPath = this.svCompanyList.filter(x => x.CompanyId == CompanyItem.ParentId)[0].fileDepthPath + CompanyItem.CompanyId.toString() + " ";
            }

            if (this.currentCompany != null) {
                if (CompanyItem.fileDepthPath.startsWith(this.currentCompany.fileDepthPath)) {
                    CompanyItem.isOpen = true;
                }
            } else {
                CompanyItem.isOpen = true;
            }
            CompanyItem.fileDepthFolders = this.svCompanyList.filter(x => CompanyItem.fileDepthPath.split(" ").lastIndexOf(x.CompanyId.toString()) != -1);
        });

        return this.arrangedCompanyList;
    }

    getDisplayCompany(parentId?: number) {
        if (parentId == null && this.parentId == null) {
            this.parentId = null;
            this.currentCompany = null;
        } else {
            this.parentId = parentId;
            this.currentCompany = this.svCompanyList.filter(x => x.CompanyId == this.parentId)[0];
        }

        this.arrangedCompanyList.forEach(item => {
            if (item.CompanyId == this.parentId) {
                item.isSelected = true;
                this.currentCompany = item;
            } else {
                item.isSelected = false;
            }
        });

        if ((this.filterObj.Name != null && this.filterObj.Name != "")) {
            this.filterQaCompanyList(this.getArrangedCompanys());
        } else {
            this.qaCompanyList = this.getArrangedCompanys().filter(x => x.ParentId == null);
        }
        this.setPagination();
    }

    getCompanyFrmChild(CompanyItem?: ICompanyVM) {
        if (CompanyItem.isGroup == true) {
            this.currentCompany = CompanyItem;
            this.parentId = CompanyItem.CompanyId;
            this.getDisplayCompany(CompanyItem.CompanyId);
        } else {
            this.currentCompany = this.svCompanyList.filter(x => x.CompanyId == CompanyItem.ParentId)[0];
            if (this.currentCompany != null) {
                this.currentCompany.isSelected = true;
                this.parentId = this.currentCompany.CompanyId;
            }

            this.svCompanyList.filter(x => x.CompanyId != this.parentId).forEach(item => {
                item.isSelected = false;
            })

            this.openEditModal(CompanyItem.CompanyId);
        }
    }

    getCompanyFrmSelectChild(CompanyItem?: ICompanyVM) {
        if (CompanyItem == null || CompanyItem == undefined) {
            this.InputCompany.ParentId = null;

            this.selectCompanyList.forEach(item => {
                item.isSelected = false;
            })
        } else {
            this.InputCompany.ParentId = CompanyItem.CompanyId;
        }
    }

    hasSubitem(CompanyId: number) {
        if (this.svCompanyList.filter(x => x.ParentId == CompanyId).length > 0) {
            return true;
        } else {
            return false;
        }
    }

    filterQaCompanyList(CompanyList?: ICompanyVM[]) {
        let newCompanyList: ICompanyVM[] = [];
        let filteredCompanyList: ICompanyVM[] = [];

        filteredCompanyList = CompanyList.filter(it => it.CompanyName.toUpperCase().lastIndexOf(this.filterObj.Name.toUpperCase()) != -1);

        filteredCompanyList.forEach(filteredItem => {
            filteredItem.fileDepthFolders.forEach(item => {
                if (newCompanyList.filter(x => x.CompanyId == item.CompanyId).length == 0) {
                    item.isOpen = true;

                    if (this.parentId == item.CompanyId) {
                        item.isSelected = true;
                    }
                    newCompanyList.push(item);
                }
            })
        })

        newCompanyList.forEach(item => {
            if (item.isGroup == true) {
                item.ChildCompany = newCompanyList.filter(y => y.ParentId == item.CompanyId);
            }
        });

        this.qaCompanyList = newCompanyList.filter(x => x.ParentId == null);
        this.setPagination();
    }


    gotoPage(pageNum?: number) {
        this.pagination.CurrentPage = pageNum <= 1 ? 1 : pageNum > this.pagination.TotalPage ? this.pagination.TotalPage : pageNum;

        this.displayCompanyList = this.svCompanyList.filter(x => x.ParentId == this.parentId);

        if (this.filterObj.Name != '' || this.filterObj.Name != null) {
            this.displayCompanyList = this.displayCompanyList.filter(x => x.CompanyName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        } else {
            this.displayCompanyList = this.displayCompanyList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        }
    }

    setPagination() {
        this.pagination.TotalItems = this.svCompanyList.filter(x => x.ParentId == this.parentId && x.CompanyName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).length;
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        if (this.pagination.TotalPage == 0) {
            this.pagination.TotalPage = 1;
        }

        this.gotoPage(1);
    }

}
