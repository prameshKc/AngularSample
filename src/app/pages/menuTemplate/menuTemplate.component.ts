import { Component, ViewChild, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

import { MenuTemplateService, DesignationService, MenuService } from '../../services/BaseService';

import { IMenuTemplate, IPaginationViewModel, IDesignation, IMenuVsTemplate } from '../../models/Models';
import { IFilterViewModel, IMenuVM, IMenuTemplateVM, IDesignationVM } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap';

import 'rxjs/add/observable/of';

@Component({
    selector: 'menuTemplateSetup',
    templateUrl: 'menuTemplate.component.html',
})
export class MenuTemplateComponent {
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

    InputMenuTemplate: IMenuTemplate = <IMenuTemplateVM>{};

    isLoading?: boolean = false;

    isAddMenuTemplate: boolean = false;
    isExpanded: boolean = false;
    requiredParentId: number;
    closeForm: boolean = true;
    isEditMenuTemplate: boolean = false;
    selectedModalLoaded: boolean = false;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    svDesignationList: IDesignationVM[] = [];
    svMenuList: IMenuVM[] = [];
    selectMenuList: IMenuVM[] = [];
    svMTList: IMenuTemplateVM[] = [];
    displayMTList: IMenuTemplateVM[] = [];
    selectMTList: IMenuTemplateVM[] = [];
    tempMTList: IMenuTemplateVM[] = [];
    toggleListVsIcon: boolean = false;

    dataSourceMenu?: IMenuVM[] = [];
    dataSourceDesignation?: IDesignationVM[] = [];
    asyncSelected?: any;
    userId: string;
    employeeId: number;

    constructor(
        public menuTemplateService: MenuTemplateService,
        public menuService: MenuService,
        public designationService: DesignationService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.employeeId = parseInt(localStorage.getItem('EmployeeId'));

        this.filterObj = { Name: '', Sort: '' };
    }

    ngOnInit() {
        this.getAllMenuTemplate();
        this.getAllMenu();
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
        this.isAddMenuTemplate = true;
        this.isEditMenuTemplate = false;
        this.selectedModalLoaded = true;
        this.asyncSelected = null;
        this.InputMenuTemplate = <IMenuTemplateVM>{};
        this.childModal.show();
        this.resetMenuList();
    }

    /**
     * to open edit modal
     */
    public openEditModal(id?: number) {
        this.asyncSelected = null;
        this.isEditMenuTemplate = true;
        this.isAddMenuTemplate = false;
        this.selectedModalLoaded = true;
        this.childModal.show();
        this.getMenuTemplate(id)
        this.resetMenuList();
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
        this.isAddMenuTemplate = false;
        this.isEditMenuTemplate = false;
        this.InputMenuTemplate = <IMenuTemplateVM>{};
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
            this.displayMTList = this.svMTList.filter(x => x.MenuTemplateName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        } else {
            this.displayMTList = this.svMTList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        }
    }

    /**
     * to set pagination
     */
    public setPagination() {
        this.pagination.TotalItems = this.svMTList.filter(x => x.MenuTemplateName.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).length;
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        if (this.pagination.TotalPage == 0) {
            this.pagination.TotalPage = 1;
        }

        this.gotoPage(1);
    }

    /**
     * to sort data in asc/desc order
     */
    public filterData() {
        this.svMTList.sort()

        this.tempMTList = this.displayMTList;

        if (this.filterObj != null) {
            if (this.filterObj.Sort == 'true') {
                this.displayMTList = this.displayMTList.sort(function (a, b) {
                    if (a.MenuTemplateName < b.MenuTemplateName) return -1;
                    if (a.MenuTemplateName > b.MenuTemplateName) return 1;
                    return 0;
                });
                this.setPagination();
            }
            else if (this.filterObj.Sort == 'false') {
                this.displayMTList = this.displayMTList.sort(function (a, b) {
                    if (a.MenuTemplateName < b.MenuTemplateName) return 1;
                    if (a.MenuTemplateName > b.MenuTemplateName) return -1;
                    return 0;
                });
                this.setPagination();
            }
            else {
                this.displayMTList = this.tempMTList;
            }
        }

    }

    getAllMenuTemplate() {
        let query: string = '';
        if (this.employeeId && this.employeeId != 0) {
            query += '$filter=MenuTemplateId ne 1';
        }

        this.menuTemplateService.getAll(query).subscribe((data: IMenuTemplateVM[]) => {
            this.svMTList = data;

            this.setPagination();
        });
    }

    getMenuTemplate(id: number) {
        let query: string = "$expand=MenuVsTemplate,Designation";
        this.menuTemplateService.get(id, query).subscribe((data: IMenuTemplateVM) => {
            this.InputMenuTemplate = data;

            this.InputMenuTemplate.Designation = data.Designation;
            this.InputMenuTemplate.DesignationId = data.DesignationId;

            data.MenuVsTemplate.forEach(item => {
                this.svMenuList.filter(x => x.MenuId == item.MenuId).forEach(dataItem => {
                    dataItem.isSelected = true;
                });
            });
            this.arrangeMenu();
        });
    }

    getAllMenu() {
        let query: string = '$filter=IsEnable ne false';

        this.menuService.getAll(query).subscribe((data: IMenuVM[]) => {
            this.svMenuList = data;
            this.arrangeMenu();
        });
    }

    resetMenuList() {
        this.svMenuList.forEach(item => {
            item.isSelected = false;
            item.isOpen = true;
        })
        this.arrangeMenu();
    }

    selectAllMenu() {
        this.svMenuList.forEach(item => {
            item.isSelected = true;
        });

        this.arrangeMenu();
    }

    arrangeMenu() {
        this.svMenuList.forEach(item => {
            item.isOpen = true;
            if (item.ParentMenuId == null) {
                item.fileDepthPath = "Path: Root";
            } else {
                let parent = this.svMenuList.filter(x => x.MenuId == item.ParentMenuId)[0];

                if (parent != null) {
                    item.fileDepthPath = parent.fileDepthPath + " / " + parent.MenuCaption.toString();
                   item.fileDepthFolders = this.svMenuList.filter(x => item.fileDepthPath.lastIndexOf(x.fileDepthPath) != -1);
                }
            }
            item.ChildMenu = this.svMenuList.filter(x => x.ParentMenuId == item.MenuId);
        });

        this.dataSourceMenu = this.svMenuList.filter(x => x.ParentMenuId == null);
    }

    getAllDesignation() {
        this.designationService.getAll().subscribe((data: IDesignationVM[]) => {
            this.svDesignationList = data;

            this.svDesignationList.forEach(item => {
                if (item.ParentId == null) {
                    item.fileDepthPath = "Path: Root";
                } else {
                    let parent = this.svDesignationList.filter(x => x.DesignationId == item.ParentId)[0];
                    item.fileDepthPath = parent.fileDepthPath + " / " + parent.DesignationName.toString();
                }
            })
            this.dataSourceDesignation = this.svDesignationList;
        });
    }

    selectDesignation($event: any) {
        if ($event.item == null) {
            this.InputMenuTemplate.Designation = null;
            this.InputMenuTemplate.DesignationId = null;
            this.asyncSelected = null;
        } else {
            this.InputMenuTemplate.Designation = $event.item;
            this.InputMenuTemplate.DesignationId = $event.item.DesignationId;
        }
    }

    saveMenuTemplate() {
        let menuVsTempalteListObj: IMenuVsTemplate[] = [];

        this.svMenuList.filter(x => x.isSelected == true).forEach(item => {
            let menuVsTempalteObj: IMenuVsTemplate = {
                MenuId: item.MenuId,
                TemplateId: this.InputMenuTemplate.MenuTemplateId
            }
            menuVsTempalteListObj.push(menuVsTempalteObj)
        })

        let menuTemplateObj: IMenuTemplate = {
            MenuTemplateName: this.InputMenuTemplate.MenuTemplateName,
            MenuVsTemplate: menuVsTempalteListObj,
            LastModifiedBy: '',
            //DesignationId: this.InputMenuTemplate.DesignationId,
            DesignationId: null,
            PostedBy: this.userId
        }

        this.menuTemplateService.post(menuTemplateObj).subscribe(data => {
            this.getAllMenuTemplate();
            this.hideChildModal();

            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Menu Template has been successfully Added",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
        })
    }

    editMenuTemplate() {
        let menuVsTempalteListObj: IMenuVsTemplate[] = [];

        this.svMenuList.filter(x => x.isSelected == true).forEach(item => {
            let menuVsTempalteObj: IMenuVsTemplate = {
                MenuId: item.MenuId,
                TemplateId: this.InputMenuTemplate.MenuTemplateId
            };
            menuVsTempalteListObj.push(menuVsTempalteObj);
        });

        let menuTemplateObj: IMenuTemplate = {
            MenuTemplateId: this.InputMenuTemplate.MenuTemplateId,
            MenuTemplateName: this.InputMenuTemplate.MenuTemplateName,
            MenuVsTemplate: menuVsTempalteListObj,            
            LastModifiedBy: this.userId,
            DesignationId: this.InputMenuTemplate.DesignationId,
            PostedBy: this.InputMenuTemplate.PostedBy,
            PostedOn: this.InputMenuTemplate.PostedOn
        }

        this.menuTemplateService.put(menuTemplateObj.MenuTemplateId, menuTemplateObj).subscribe(data => {
            this.getAllMenuTemplate();
            this.hideChildModal();

            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Menu Template has been successfully Updated",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
        })
    }

    deleteMenuTemplate() {
        this.menuTemplateService.delete(this.deleteId).subscribe(data => {
            this.getAllMenuTemplate();
            this.hideDeleteChildModal();

            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Menu Template has been successfully Deleted",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
        });
    }
}
