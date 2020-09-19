import { Component, OnInit } from '@angular/core';
import {
    MenuService,
    ParamService,
    UserService,
    EmployeeService,
    CommonService,
    domain
} from '../../services/BaseService';
import { AuthenticationService } from '../../services/AuthService';
import { IMenuVM } from '../../models/ViewModels';
import { IUser, IEmployee, IParam } from '../../models/Models';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BranchService } from '../../services/BranchService';

@Component({
    selector: 'layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
    isOpenAdministrativeSetup: boolean = false;
    isOpenParameterSetup: boolean = false;
    isOpenEmployeeSetup: boolean = false;
    showNavPopUp: Boolean = false;

    svMenuList: IMenuVM[] = [];
    menuList: IMenuVM[] = [];
    currentMenu: IMenuVM = <IMenuVM>{};
    menuPId: number = null;
    userDetails: IUser = <IUser>{};
    employeeDetails: IEmployee = <IEmployee>{};

    isCollapse: boolean = false;
    collapseClass: string = 'toggled';

    arrangedMenuList: IMenuVM[] = [];
    qaMenuList: IMenuVM[] = [];
    loading: boolean;
    userId: string;
    isAdmin: boolean;

    constructor(
        public menuService: MenuService,
        public paramService: ParamService,
        public userService: UserService,
        public employeeService: EmployeeService,
        public commonService: CommonService,
        public branchService: BranchService,
        public authService: AuthenticationService,
        public route: ActivatedRoute,
        public router: Router,
        public location: Location
    ) {
        this.checkScrnSize();

        this.userId = localStorage.getItem('UserId');

        this.paramService.getAll('$expand=ParamValue&$filter=PId eq 12 or PId eq 13 or PId eq 14').subscribe((data: IParam[]) => {
            if (data.length != 0) {
                localStorage.setItem(
                    'Param.DateType',
                    data.filter(x => x.PId == 12)[0].ParamValue.PValue
                );
                localStorage.setItem(
                    'Param.DefaultFormatAD',
                    data.filter(x => x.PId == 13)[0].ParamValue.PValue
                );
                localStorage.setItem(
                    'Param.DefaultFormatBS',
                    data.filter(x => x.PId == 14)[0].ParamValue.PValue
                );
            }
        });

        if (
            !localStorage.getItem('UserId') ||
            !localStorage.getItem('authorizationData')
        ) {
            this.router.navigateByUrl('login');
        } else {
            let query: string = '$expand=Employee/ReportTo';
            this.userService.get(this.userId, query).subscribe((data: IUser) => {
                Object.assign(this.userDetails, data);
                Object.assign(this.employeeDetails, data.Employee);
                this.getAllMenu();
            });
        }
    }
    
    checkScrnSize() {
        let that = this;
        if (screen.width < 500) {
            that.collapseClass = 'toggled-2';
        } else {
            that.collapseClass = 'toggled';
        }

        window.addEventListener('resize', () => {
            if (screen.width < 500) {
                that.collapseClass = 'toggled-2';
            } else {
                that.collapseClass = 'toggled';
            }
        });
    }

    ngOnInit() {
        this.loading = true;
        let that = this;
        window.addEventListener('hashchange', () => {
            let currentUrl: string = window.location.href;

            if (!localStorage.getItem('UserId') || !localStorage.getItem('authorizationData')) {
                window.location.href = `/#/login`;
            } else {
                if (that.svMenuList.length != 0) {
                    if (currentUrl.includes('#/')) {
                        if (currentUrl.split('#/').length == 2) {
                            if (that.svMenuList.length > 0 && currentUrl.split('#/')[1].startsWith('layout')) {
                                if (that.svMenuList.filter(x => x.IsGroup != true).filter(x => x.Url.split('#/')[1] == currentUrl.split('#/')[1]).length == 0) {
                                    window.location.href = `/#/layout`;
                                }
                            }
                        } else {
                            window.location.href = `/#/layout`;
                        }
                    }
                } else {
                    that.getAllMenu();
                }
            }
        });
    }

    getAllMenu() {
        let currentUrl: string = window.location.href;
        this.commonService.GetLayoutMenu().subscribe((data: IMenuVM[]) => {
            this.svMenuList = data.filter(x => x.IsEnable == true);
            this.menuList = data.filter(x => x.IsEnable == true && x.IsContext != true);


            if (
                currentUrl != `${domain}#/login` &&
                currentUrl != `${domain}#/layout` &&
                currentUrl != `${domain}#/changePassword` &&
                this.svMenuList.filter(x => x.IsGroup != true && x.Url.includes('#')).filter(x => x.Url.split('#')[1].startsWith(currentUrl.split('#')[1])).length == 0 &&
                this.svMenuList.filter(x => x.IsGroup != true).filter(x => x.Url.includes(currentUrl.split('#/')[1])).length == 0
            ) {
                window.location.href = `/#/layout`;
            }

            localStorage.setItem("ContextMenus", JSON.stringify(data.filter(x => x.IsEnable == true && x.IsContext == true)));

            this.menuList.forEach(item => {
                item.isOpen = false;
                if (
                    item.Url != null &&
                    currentUrl.split('#')[1] == item.Url.split('#')[1]
                ) {
                    item.isSelected = true;
                }

                item.fileDepthPath = '';
                item.fileDepthFolders = [];
            });


            if (
                this.userDetails.Employee.ReportTo.filter(x => x.ReportTo1 == 0).length != 0 ||
                this.svMenuList.filter(x => x.MenuId == 1048).length > 0 ||
                this.svMenuList.filter(x => x.MenuId == 1121).length > 0
            ) {
                this.isAdmin = true;
            }
            else {
                this.isAdmin = false;
            }

            this.getDisplayMenu(this.menuPId);
            this.loading = false;
        }, () => {
            this.loading = false;
        });
    }

    getArrangedMenus(isGroup?: any): IMenuVM[] {
        if (isGroup != null) {
            this.arrangedMenuList = this.menuList.filter(x => x.IsGroup == true);
        } else {
            this.arrangedMenuList = this.menuList;
        }

        this.arrangedMenuList.forEach(menuItem => {
            menuItem.ChildMenu = this.menuList.filter(
                x => x.ParentMenuId == menuItem.MenuId
            );
            if (menuItem.ParentMenuId == null) {
                menuItem.fileDepthPath = '0 ' + menuItem.MenuId.toString() + ' ';
            } else {
                if (this.svMenuList.filter(x => x.MenuId == menuItem.ParentMenuId).length > 0) {
                    menuItem.fileDepthPath = this.svMenuList.filter(x => x.MenuId == menuItem.ParentMenuId)[0].fileDepthPath + menuItem.MenuId.toString() + ' ';
                }
            }
            if (this.currentMenu != null) {
                if (menuItem.fileDepthPath.startsWith(this.currentMenu.fileDepthPath)) {
                    menuItem.isOpen = true;
                }
            } else {
                menuItem.isOpen = false;
            }
            menuItem.fileDepthFolders = this.svMenuList.filter(x => menuItem.fileDepthPath.split(' ').lastIndexOf(x.MenuId.toString()) != -1);
        });
        return this.arrangedMenuList;
    }

    getDisplayMenu(menuPId?: number) {
        if (menuPId == null && this.menuPId == null) {
            this.menuPId = null;
            this.currentMenu = null;
        } else {
            this.menuPId = menuPId;
            this.currentMenu = this.svMenuList.filter(
                x => x.MenuId == this.menuPId
            )[0];
        }

        this.arrangedMenuList.forEach(item => {
            if (item.MenuId == this.menuPId) {
                item.isSelected = true;
                this.currentMenu = item;
            } else {
                item.isSelected = false;
            }
        });

        this.qaMenuList = this.getArrangedMenus().filter(
            x => x.ParentMenuId == null
        );
        //this.displayMenuList = this.svMenuList.filter(x => x.ParentMenuId == this.menuPId);
    }

    public toggleSideBar() {
        this.isCollapse = !this.isCollapse;
        this.collapseClass = this.collapseClass == 'toggled' ? 'toggled-2' : 'toggled';
    }

    getMenuFrmChild(menuItem?: IMenuVM) {
        if (menuItem.IsGroup == true) {
            this.currentMenu = menuItem;
            this.menuPId = menuItem.MenuId;
            this.getDisplayMenu(menuItem.MenuId);
        } else {
            this.currentMenu = this.svMenuList.filter(
                x => x.MenuId == menuItem.MenuId
            )[0];

            if (this.currentMenu != null) {
                this.currentMenu.isSelected = true;
                this.menuPId = this.currentMenu.MenuId;
            }

            this.svMenuList
                .filter(x => x.MenuId != this.menuPId)
                .forEach(item => {
                    item.isSelected = false;
                });

            if (menuItem.Url.includes('http') || menuItem.Url.includes('www')) {
                window.open(`${menuItem.Url}`, '_blank');
                //this.router.navigateByUrl(`${menuItem.Url}`);
            } else {
                if (menuItem.Url.includes('#')) {
                    this.router.navigateByUrl(`${menuItem.Url.split('#')[1]}`);
                } else {
                    this.router.navigateByUrl(`${menuItem.Url}`);
                }
            }

            if (screen.width < 446) {
                this.collapseClass = 'toggled-2';
            }
        }
    }
}
