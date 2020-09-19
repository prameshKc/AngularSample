import { Component, ViewChild } from '@angular/core';
import { ToastyService, ToastOptions } from 'ngx-toasty';

import { DesignationService, MenuService, CommonService, UserVsCompanyService, UVCAPIService } from '../../services/BaseService';

import { ICompany, IPaginationViewModel, IDesignation, IUser, IUserVsCompany } from '../../models/Models';
import { IFilterViewModel, IMenuVM, IDesignationVM, ICompanyVM } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap';

import 'rxjs/add/observable/of';

@Component({
    selector: 'userBrnCompany',
    templateUrl: 'userBrnCompany.component.html',
})
export class UserBrnCompanyComponent {
  @ViewChild('childModal', { static: false }) public childModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('loadingModal', { static: false }) public loadingModal: ModalDirective;

    parentId: number;
    filterObj: IFilterViewModel;

    pagination?: IPaginationViewModel = {
        CurrentPage: 1,
        ItemsPerPage: 50,
        TotalPage: 1
    };

    designationObj?: IDesignation;

    InputCompany: ICompany = <ICompanyVM>{};

    isLoading?: boolean = false;

    isAddCompany: boolean = false;
    isExpanded: boolean = false;
    requiredParentId: number;
    closeForm: boolean = true;
    isEditCompany: boolean = false;
    selectedModalLoaded: boolean = false;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    svDesignationList: IDesignationVM[] = [];
    svMenuList: IMenuVM[] = [];
    selectMenuList: IMenuVM[] = [];
    svMTList: ICompanyVM[] = [];
    displayMTList: ICompanyVM[] = [];
    selectMTList: ICompanyVM[] = [];
    tempMTList: ICompanyVM[] = [];
    toggleListVsIcon: boolean = false;

    dataSourceMenu?: IMenuVM[] = [];
    dataSourceDesignation?: IDesignationVM[] = [];
    asyncSelected?: any;
    userId: string;
    employeeId: number;

    filterData: any;
    branchMngrList: IUser[] = [];
    companyList: ICompanyVM[] = [];
    dispCompanyList: ICompanyVM[] = [];

    constructor(
        public uvcService: UserVsCompanyService,
        public uvcAPIService: UVCAPIService,
        public menuService: MenuService,
        public commonService: CommonService,
        public designationService: DesignationService,
        private toastyService: ToastyService    ) {
        this.filterObj = { Name: '', Sort: '' };
    }

    ngOnInit() {
        this.getBranchManagers();
        this.getCompanies();
    }

    getBranchManagers() {
        this.commonService.GetBranchManagers().subscribe((data: IUser[]) => {
            this.branchMngrList = data;
        })
    }

    getCompanies() {
        this.commonService.GetCompanyBranches().subscribe((data: ICompanyVM[]) => {
            this.companyList = data;
            this.arrangeCompanyList([]);
        })
    }

    arrangeCompanyList(uvcList: ICompanyVM[]) {
        this.companyList.forEach(item => {
            item.ChildCompany = this.companyList.filter(x => x.ParentId == item.CompanyId);
            item.isOpen = true;
            item.isSelected = (uvcList.length > 0 && uvcList.filter(x => x.CompanyId == item.CompanyId).length > 0) || (item.isGroup == true) ? true : false;
        })
        this.dispCompanyList = Object.assign([], this.companyList.filter(x => x.ParentId == null));
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
            if (this.loadingModal != undefined) {
                this.loadingModal.hide();
                //this.isLoading = false;
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
        this.asyncSelected = null;
        this.InputCompany = <ICompanyVM>{};
        this.childModal.show();
    }

    /**
     * to open edit modal
     */
    public openEditModal(id?: string) {
        this.asyncSelected = null;
        this.isEditCompany = true;
        this.isAddCompany = false;
        this.selectedModalLoaded = true;
        this.userId = id;
        this.commonService.GetCompanyBranches(id).subscribe(data => {
            this.arrangeCompanyList(data);
            this.childModal.show();
        })
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
    }

    /**
     * to hide delete modal
     */
    public hideDeleteChildModal(): void {
        this.deleteModal.hide();
    }

    /**
     * to goto selected page number
     */
    public gotoPage(pageNum?: number) {
        this.pagination.CurrentPage = pageNum <= 1 ? 1 : pageNum > this.pagination.TotalPage ? this.pagination.TotalPage : pageNum;

        if (this.filterObj.Name != '' || this.filterObj.Name != null) {
            this.displayMTList = this.svMTList.filter(x => x.CompanyName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        } else {
            this.displayMTList = this.svMTList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        }
    }

    /**
     * to set pagination
     */
    public setPagination() {
        this.pagination.TotalItems = this.svMTList.filter(x => x.CompanyName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).length;
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        if (this.pagination.TotalPage == 0) {
            this.pagination.TotalPage = 1;
        }

        this.gotoPage(1);
    }

    saving: boolean = false;
    editCompany() {
        let compListObj: IUserVsCompany[] = [];
        this.saving = true;

        this.companyList.filter(x => x.isSelected == true && x.isGroup != true).forEach(item => {
            let uvcObj: IUserVsCompany = {
                UserId: this.userId,
                CompanyId: item.CompanyId
            };
            compListObj.push(uvcObj);
        });
        if (compListObj.length == 0) {
            var toastOptions: ToastOptions = {
                title: "Error",
                msg: "Please select alteast one branch and try again.",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.error(toastOptions);
            this.saving = false;

        } else {
            console.log(compListObj);
            this.uvcAPIService.storeUVC(compListObj).subscribe(() => {
                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "User branches were updated successfully.",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);
                this.saving = false;
                this.hideChildModal();
            }, () => {
                var toastOptions: ToastOptions = {
                    title: "Error",
                    msg: "Error occured, please try again.",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.error(toastOptions);
                this.saving = false;
            })
        }

        //this.
        //this.CompanyService.put(CompanyObj.CompanyId, CompanyObj).subscribe(data => {
        //    //this.getAllCompany();
        //    this.hideChildModal();

        //    var toastOptions: ToastOptions = {
        //        title: "Success",
        //        msg: "Menu Template has been successfully Updated",
        //        showClose: true,
        //        timeout: 5000,
        //        theme: 'bootstrap'
        //    };
        //    this.toastyService.success(toastOptions);
        //})
    }

    //deleteCompany() {
    //    this.CompanyService.delete(this.deleteId).subscribe(data => {
    //        //this.getAllCompany();
    //        this.hideDeleteChildModal();

    //        var toastOptions: ToastOptions = {
    //            title: "Success",
    //            msg: "Menu Template has been successfully Deleted",
    //            showClose: true,
    //            timeout: 5000,
    //            theme: 'bootstrap'
    //        };
    //        this.toastyService.success(toastOptions);
    //    });
    //}
}
