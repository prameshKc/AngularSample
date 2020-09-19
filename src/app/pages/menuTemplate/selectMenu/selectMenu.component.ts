import { Component, Input } from '@angular/core';

import { MenuService } from '../../../services/BaseService';
import { IMenu } from '../../../models/Models';
import { IMenuVM } from '../../../models/ViewModels';

@Component({
    selector: 'selectMenu',
    templateUrl: 'selectMenu.component.html',
})
export class selectMenuComponent {
    menuObj?: IMenuVM;

    @Input() menuListObj: IMenuVM[];

    //@Output() returnMenuList: EventEmitter<IMenu> = new EventEmitter<IMenu>();

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

    toggleItem(menuListItem: IMenuVM) {
        if (this.menuListObj.filter(x => x.MenuId == menuListItem.MenuId).length > 0) {
            if (menuListItem.isSelected == true) {
                this.menuListObj.filter(x => x.MenuId == menuListItem.MenuId)[0].isOpen = true;
            }
            this.menuListObj.filter(x => x.MenuId == menuListItem.MenuId)[0].ChildMenu.forEach(item => {
                item.isSelected = menuListItem.isSelected;
                item.isOpen = true;
                if (item.ChildMenu.length > 0) {
                    this.toggleItem(item);
                }
            })
        }
    }

    //filterSelected(menuListItem?: IMenuVM) {
    //    this.returnMenuList.emit(menuListItem);
    //}

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
