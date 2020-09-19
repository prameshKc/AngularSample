import { Component, Injectable, Input, Output, EventEmitter } from '@angular/core';

import { MenuService } from '../../../../services/BaseService';
import { IMenu } from '../../../../models/Models';
import { IMenuVM } from '../../../../models/ViewModels';

@Component({
    selector: 'app-drawer',
    templateUrl: 'drawer.component.html',
    styleUrls: ['drawer.component.css'],
})
export class DrawerComponent {
    menuObj?: IMenuVM;

    @Input() menuListObj: IMenuVM[];

    @Output() returnMenuList: EventEmitter<IMenu> = new EventEmitter<IMenu>();

    IsExpanded: boolean = false;

    menu: IMenu;

    parentId?: number;

    constructor(
        public menuService: MenuService
    ) {
        if (this.menuListObj != null) {
            this.menuListObj.forEach(item => {
                if (item.isOpen == null) {
                    item.isOpen = false;
                }
            });
        }
    }

    ngOnInit() { }

    toggle(menuListItem: IMenu) {
        if (this.menuListObj.length > 0) {
            this.menuListObj.filter(x => x.MenuId = menuListItem.MenuId)[0].isOpen = !this.menuListObj.filter(x => x.MenuId = menuListItem.MenuId)[0].isOpen;
        }
    }

    filterSelected(menuListItem?: IMenuVM) {
        this.returnMenuList.emit(menuListItem);
    }

    findSelectedChild(menuListObj?: IMenuVM[], menuItem?: IMenuVM) {
        this.menuListObj.forEach(item => {
            let currentURL = window.location.href;
            if (
                item.Url != null &&
                currentURL.split('#')[1] == item.Url.split('#')[1]
            ) {
                item.isSelected = true;
            } else {
                item.isSelected = null;
            }

            if (item.ChildMenu.length > 0) {
                this.findSelectedChild(item.ChildMenu);
            }
        });

        this.returnMenuList.emit(this.menuObj);
    }
}
