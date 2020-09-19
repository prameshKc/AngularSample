import { Component, Injectable, Input, Output, EventEmitter, SimpleChange } from '@angular/core';

import { MenuService } from '../../../services/BaseService';
import { IMenu } from '../../../models/Models';
import { IMenuVM } from '../../../models/ViewModels';

@Component({
    selector: 'selectChildMenu',
    templateUrl: 'selectChildMenu.component.html',
})
export class SelectChildMenuComponent {

    @Input() menuListObj: IMenuVM[];
    @Output() returnMenuList: EventEmitter<IMenuVM> = new EventEmitter<IMenuVM>();

    IsExpanded: boolean = false;
    menuObj?: IMenuVM;
    menu: IMenu;
    parentId?: number;

    constructor(
        public menuService: MenuService
    ) {
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (this.menuListObj != null) {
            this.menuListObj.forEach(item => {
                if (item.isOpen == null) {
                    item.isOpen = false;
                }
            })
        }
        if (this.menuListObj.filter(x => x.isSelected == true).length > 0) {
        }
    }

    ngOnInit() { }

    toggle(menuListItem: IMenuVM) {
        if (this.menuListObj.length > 0) {
            this.menuListObj.filter(x => x.MenuId = menuListItem.MenuId)[0].isOpen = !this.menuListObj.filter(x => x.MenuId = menuListItem.MenuId)[0].isOpen;
        }
    }

    filterSelected(menuListItem?: IMenuVM) {
        this.returnMenuList.emit(menuListItem);
    }

    //findSelectedChild(menuListObj?: IMenuVM[], menuItem?: IMenuVM) {
    //    this.menuListObj.forEach(item => {
    //        if (item.MenuId == menuItem.MenuId) {
    //            item.isSelected = true;
    //            this.menuObj = item;
    //        } else {
    //            item.isSelected = null;
    //        }

    //        if (item.ChildMenu.length > 0) {
    //            this.findSelectedChild(item.ChildMenu);
    //        }
    //    });

    //    this.returnMenuList.emit(this.menuObj);
    //}
}
