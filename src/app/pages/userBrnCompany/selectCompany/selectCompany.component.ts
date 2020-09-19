import { Component, Injectable, Input } from '@angular/core';

import { ICompany } from '../../../models/Models';
import { ICompanyVM } from '../../../models/ViewModels';

@Component({
    selector: 'selectCompany',
    templateUrl: 'selectCompany.component.html'
})
export class selectCompanyComponent {
    CompanyObj?: ICompanyVM;

    @Input() CompanyListObj: ICompanyVM[];

    //@Output() returnCompanyList: EventEmitter<ICompany> = new EventEmitter<ICompany>();

    IsExpanded: boolean = false;

    Company: ICompany;

    parentId?: number;

    constructor() { }

    ngOnInit() {
        if (this.CompanyListObj != null) {
            this.CompanyListObj.forEach(item => {
                if (item.isOpen == null) {
                    item.isOpen = false;
                }
            });
        }
    }

    toggle(CompanyListItem: ICompany) {
        if (this.CompanyListObj.length > 0) {
            this.CompanyListObj.filter(x => x.CompanyId = CompanyListItem.CompanyId)[0].isOpen = !this.CompanyListObj.filter(x => x.CompanyId = CompanyListItem.CompanyId)[0].isOpen;
        }
    }

    toggleItem(CompanyListItem: ICompanyVM) {
        if (this.CompanyListObj.filter(x => x.CompanyId == CompanyListItem.CompanyId).length > 0) {
            if (CompanyListItem.isSelected == true) {
                this.CompanyListObj.filter(x => x.CompanyId == CompanyListItem.CompanyId)[0].isOpen = true;
            }
            this.CompanyListObj.filter(x => x.CompanyId == CompanyListItem.CompanyId)[0].ChildCompany.forEach(item => {
                item.isSelected = CompanyListItem.isSelected;
                item.isOpen = true;
                if (item.ChildCompany.length > 0) {
                    this.toggleItem(item);
                }
            })
        }
    }

    //filterSelected(CompanyListItem?: ICompanyVM) {
    //    this.returnCompanyList.emit(CompanyListItem);
    //}

    //findSelectedChild(CompanyListObj?: ICompanyVM[], CompanyItem?: ICompanyVM) {
    //    this.CompanyListObj.forEach(item => {
    //        if (item.CompanyId == CompanyItem.CompanyId) {
    //            item.isSelected = true;
    //            this.CompanyObj = item;
    //        } else {
    //            item.isSelected = null;
    //        }

    //        if (item.ChildCompany.length > 0) {
    //            this.findSelectedChild(item.ChildCompany);
    //        }
    //    });

    //    this.returnCompanyList.emit(this.CompanyObj);
    //}
}
