import { Component, ViewChild, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

import { MenuService } from '../../services/BaseService';
import { IMenu, IPaginationViewModel } from '../../models/Models';

import { IFilterViewModel, IMenuVM } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
    selector: 'menuSetup',
    templateUrl: 'menu.component.html'
})
export class MenuComponent {
    toggleListVsIcon: boolean;
    selected: string;
    output: string;

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('loadingModal', { static: false }) public loadingModal: ModalDirective;

    isLoading?: boolean = false;

    isAddMenu: boolean = false;
    isExpanded: boolean = false;
    InputMenu: IMenuVM = <IMenuVM>{};
    requiredParentId: number;
    closeForm: boolean = true;
    isEditMenu: boolean = false;
    selectedModalLoaded: boolean = false;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    pagination?: IPaginationViewModel = {
        CurrentPage: 1,
        ItemsPerPage: 50,
        TotalPage: 1
    };

    toastOptions: ToastOptions;
    filterObj?: IFilterViewModel = <IFilterViewModel>{};

    parentId?: number;
    editId?: number;

    currentMenu?: IMenuVM;
    svMenuList: IMenuVM[] = [];
    arrangedMenuList: IMenuVM[] = [];
    displayMenuList: IMenuVM[] = [];
    displayMenuListPerPage: IMenuVM[] = [];

    tempMenuList: IMenuVM[] = [];
    qaMenuList: IMenuVM[] = [];
    selectMenuList: IMenuVM[] = [];
    menuList: IMenuVM[] = [];

    constructor(
        public menuService: MenuService,
        private toastyService: ToastyService
    ) {
        this.filterObj = { Name: '', Sort: '' };
    }

    ngOnInit() {
        this.getAllMenu();
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
        }, 250);
    }

    /**
     * to open add modal
     */
    public openAddModal() {
        this.isAddMenu = true;
        this.isEditMenu = false;
        this.selectedModalLoaded = true;

        if (this.parentId == null) {
            this.InputMenu.ParentMenuId = 0;
        } else {
            this.InputMenu.ParentMenuId = this.parentId;
        }
        //this.InputMenu.ParentMenuId = this.parentId;

        this.selectMenuList = this.getArrangedMenus(true).filter(x => x.ParentMenuId == null);
        this.childModal.show();
    }

    /**
     * to open edit modal
     */
    public openEditModal(id?: number) {
        this.editId = id;
        this.getMenu(id)
        this.isEditMenu = true;
        this.isAddMenu = false;
        this.selectedModalLoaded = true;

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
        this.isAddMenu = false;
        this.isEditMenu = false;
        this.InputMenu = <IMenuVM>{};
        this.getDisplayMenu(this.parentId);
    }

    /**
     * to hide delete modal
     */
    public hideDeleteChildModal(): void {
        this.deleteModal.hide();
        this.getDisplayMenu(this.parentId);
    }

    /**
     * to save new menu
     */
    public saveMenu() {
        this.openLoadingModal();
        let saveMenuItem: IMenu = {
            MenuCaption: this.InputMenu.MenuCaption,
            ParentMenuId: this.InputMenu.ParentMenuId,
            IsGroup: this.InputMenu.IsGroup ? this.InputMenu.IsGroup : false,
            IsEnable: this.InputMenu.IsEnable ? this.InputMenu.IsEnable : false,
            IsContext: this.InputMenu.IsContext ? this.InputMenu.IsContext : false,
            Url: this.InputMenu.Url
        }


        this.menuService.post(saveMenuItem).subscribe(data => {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Menu has been successfully Added",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);

            this.parentId = this.InputMenu.ParentMenuId;

            this.getAllMenu();
            this.hideChildModal();
            this.hideLoadingModal();
        })
    }

    /**
     * to update existing menu
     */
    public updateMenu() {
        this.openLoadingModal();
        let saveMenuItem: IMenu = {
            MenuId: this.InputMenu.MenuId,
            MenuCaption: this.InputMenu.MenuCaption,
            ParentMenuId: this.InputMenu.ParentMenuId,
            IsGroup: this.InputMenu.IsGroup ? this.InputMenu.IsGroup : false,
            IsEnable: this.InputMenu.IsEnable ? this.InputMenu.IsEnable : false,
            IsContext: this.InputMenu.IsContext ? this.InputMenu.IsContext : false,
            Url: this.InputMenu.Url
        }

        this.menuService.put(saveMenuItem.MenuId, saveMenuItem).subscribe(data => {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Menu has been successfully Updated",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);

            this.parentId = this.InputMenu.ParentMenuId;

            this.getAllMenu(this.parentId);
            this.hideChildModal();
            this.hideLoadingModal();
        })
    }

    public deleteMenu() {
        this.menuService.delete(this.deleteId).subscribe(item => {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Menu has been successfully Deleted",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);

            this.getAllMenu(this.parentId);
            this.hideDeleteChildModal();
        });
    }

    /**
     * to go back to parent folder in tree structure
     */
    public back(parentId?: number) {
        this.currentMenu = this.svMenuList.filter(y => y.MenuId == parentId)[0];
        this.parentId = this.currentMenu.ParentMenuId;
        this.getDisplayMenu(this.parentId);
    }

    /**
     * to filter data in current list
     */
    public filterData() {
        this.tempMenuList = this.displayMenuList;

        if (this.filterObj != null) {
            if (this.filterObj.Sort == 'true') {
                this.displayMenuList = this.displayMenuList.sort(function (a, b) {
                    if (a.MenuCaption < b.MenuCaption) return -1;
                    if (a.MenuCaption > b.MenuCaption) return 1;
                    return 0;
                });
            }
            else if (this.filterObj.Sort == 'false') {
                this.displayMenuList = this.displayMenuList.sort(function (a, b) {
                    if (a.MenuCaption < b.MenuCaption) return 1;
                    if (a.MenuCaption > b.MenuCaption) return -1;
                    return 0;
                });
            }
            else {
                this.displayMenuList = this.tempMenuList;
            }
        }
    }

    getAllMenu(parentId?: number) {
        this.openLoadingModal();
        this.menuService.getAll().subscribe((data: IMenuVM[]) => {

            this.svMenuList = data;
            this.menuList = data;

            this.menuList.forEach(item => {
                if (this.currentMenu == null) {
                    item.isOpen = true;
                }

                item.fileDepthPath = "";
                item.fileDepthFolders = [];
            })

            this.getDisplayMenu(this.parentId);
            this.hideLoadingModal();
        });
    }

    getMenu(menuId: number) {
        this.openLoadingModal();
        this.menuService.get(menuId).subscribe((data: IMenuVM) => {
            this.hideLoadingModal();
            this.InputMenu = data;

            this.selectMenuList = this.getArrangedMenus(true, menuId).filter(x => x.ParentMenuId == null);
        });
    }

    getArrangedMenus(isGroup?: any, hideId?: number): IMenuVM[] {
        this.arrangedMenuList = this.svMenuList;

        if (isGroup != null) {
            this.arrangedMenuList = this.arrangedMenuList.filter(x => x.IsGroup == true);
        }
        if (hideId != null) {
            this.arrangedMenuList = this.arrangedMenuList.filter(x => x.MenuId != hideId);

            if (this.svMenuList.filter(x => x.ParentMenuId == hideId).length > 0) {
                this.svMenuList.filter(x => x.ParentMenuId == hideId)[0].isSelected = true;
            }
        }

        this.arrangedMenuList.forEach(menuItem => {
            menuItem.ChildMenu = this.svMenuList.filter(x => x.ParentMenuId == menuItem.MenuId);
            if (hideId != null) {
                menuItem.ChildMenu = menuItem.ChildMenu.filter(x => x.MenuId != hideId);
            }

            if (menuItem.ParentMenuId == null) {
                menuItem.fileDepthPath = "0 " + menuItem.MenuId.toString() + " ";
            } else {
                menuItem.fileDepthPath = this.svMenuList.filter(x => x.MenuId == menuItem.ParentMenuId)[0].fileDepthPath + menuItem.MenuId.toString() + " ";
            }

            if (this.currentMenu != null) {
                if (menuItem.fileDepthPath.startsWith(this.currentMenu.fileDepthPath)) {
                    menuItem.isOpen = true;
                }
            } else {
                menuItem.isOpen = true;
            }
            menuItem.fileDepthFolders = this.svMenuList.filter(x => menuItem.fileDepthPath.split(" ").lastIndexOf(x.MenuId.toString()) != -1);
        });

        return this.arrangedMenuList;
    }

    getDisplayMenu(parentId?: number) {
        if (parentId == null && this.parentId == null) {
            this.parentId = null;
            this.currentMenu = null;
        } else {
            this.parentId = parentId;
            this.currentMenu = this.svMenuList.filter(x => x.MenuId == this.parentId)[0];
        }

        this.arrangedMenuList.forEach(item => {
            if (item.MenuId == this.parentId) {
                item.isSelected = true;
                this.currentMenu = item;
            } else {
                item.isSelected = false;
            }
        });

        if ((this.filterObj.Name != null && this.filterObj.Name != "")) {
            this.filterQaMenuList(this.getArrangedMenus());
        } else {
            this.qaMenuList = this.getArrangedMenus().filter(x => x.ParentMenuId == null);
        }
        //this.displayMenuList = this.svMenuList.filter(x => x.ParentMenuId == this.parentId);

        this.setPagination();
    }

    getMenuFrmChild(menuItem?: IMenuVM) {
        if (menuItem.IsGroup == true) {
            this.currentMenu = menuItem;
            this.parentId = menuItem.MenuId;
            this.getDisplayMenu(menuItem.MenuId);
        } else {
            this.currentMenu = this.svMenuList.filter(x => x.MenuId == menuItem.ParentMenuId)[0];

            if (this.currentMenu != null) {
                this.currentMenu.isSelected = true;
                this.parentId = this.currentMenu.MenuId;
            }

            this.svMenuList.filter(x => x.MenuId != this.parentId).forEach(item => {
                item.isSelected = false;
            })

            this.openEditModal(menuItem.MenuId);
            //this.getAllMenu(this.parentId);
            //this.getDisplayMenu(this.parentId);
        }
    }

    getMenuFrmSelectChild(menuItem?: IMenuVM) {
        if (menuItem == null || menuItem == undefined) {
            this.InputMenu.ParentMenuId = null;

            this.svMenuList.forEach(item => {
                item.isSelected = false;
            })
        } else {
            this.InputMenu.ParentMenuId = menuItem.MenuId;

            this.svMenuList.forEach(item => {
                if (item.MenuId != menuItem.MenuId) {
                    item.isSelected = false;
                }

                if (item.MenuId == menuItem.MenuId) {
                    item.isSelected = true;
                }
            })
        }
        this.selectMenuList = this.getArrangedMenus(true, this.InputMenu.MenuId).filter(x => x.ParentMenuId == null);
    }

    hasSubitem(menuId: number) {
        if (this.svMenuList.filter(x => x.ParentMenuId == menuId).length > 0) {
            return true;
        } else {
            return false;
        }
    }

    filterQaMenuList(menuList?: IMenuVM[]) {
        let newMenuList: IMenuVM[] = [];
        let filteredMenuList: IMenuVM[] = [];

        filteredMenuList = menuList.filter(it => it.MenuCaption.toUpperCase().lastIndexOf(this.filterObj.Name.toUpperCase()) != -1);

        filteredMenuList.forEach(filteredItem => {
            filteredItem.fileDepthFolders.forEach(item => {
                if (newMenuList.filter(x => x.MenuId == item.MenuId).length == 0) {
                    item.isOpen = true;

                    if (this.parentId == item.MenuId) {
                        item.isSelected = true;
                    }
                    newMenuList.push(item);
                }
            })
        })

        newMenuList.forEach(item => {
            if (item.IsGroup == true) {
                item.ChildMenu = newMenuList.filter(y => y.ParentMenuId == item.MenuId);
            }
        });

        //this.menuList = newMenuList;
        this.qaMenuList = newMenuList.filter(x => x.ParentMenuId == null);
        this.setPagination();
    }


    gotoPage(pageNum?: number) {
        this.pagination.CurrentPage = pageNum <= 1 ? 1 : pageNum > this.pagination.TotalPage ? this.pagination.TotalPage : pageNum;

        this.displayMenuList = this.svMenuList.filter(x => x.ParentMenuId == this.parentId);

        if (this.filterObj.Name != '' || this.filterObj.Name != null) {
            this.displayMenuList = this.displayMenuList.filter(x => x.MenuCaption.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        } else {
            this.displayMenuList = this.displayMenuList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage);
        }
    }

    setPagination() {
        this.pagination.TotalItems = this.svMenuList.filter(x => x.ParentMenuId == this.parentId && x.MenuCaption.toLowerCase().lastIndexOf(this.filterObj.Name.toLowerCase()) != -1).length;
        this.pagination.TotalPage = Math.ceil(this.pagination.TotalItems / this.pagination.ItemsPerPage);

        if (this.pagination.TotalPage == 0) {
            this.pagination.TotalPage = 1;
        }

        this.gotoPage(1);
    }

}
