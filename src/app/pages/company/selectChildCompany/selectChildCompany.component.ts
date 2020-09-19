import { Component, OnInit, Injectable, Input, Output, EventEmitter } from '@angular/core';

import { CompanyService } from '../../../services/BaseService';
import { ICompany } from '../../../models/Models';
import { ICompanyVM } from '../../../models/ViewModels';

@Component({
    selector: 'selectChildCompany',
    templateUrl: 'selectChildCompany.component.html'
})
export class SelectChildCompanyComponent implements OnInit {
    CompanyObj?: ICompanyVM;

    @Input() CompanyListObj: ICompanyVM[];

    @Output() returnCompanyList: EventEmitter<ICompany> = new EventEmitter<ICompany>();

    IsExpanded: boolean = false;

    Company: ICompany;

    parentId?: number;

    constructor(
        public CompanyService: CompanyService
    ) {
        if (this.CompanyListObj != null) {
            this.CompanyListObj.forEach(item => {
                if (item.isOpen == null) {
                    item.isOpen = false;
                }
            })
        }
    }

    ngOnInit() { }

    toggle(CompanyListItem: ICompany) {
        if (this.CompanyListObj.length > 0) {
            this.CompanyListObj.filter(x => x.CompanyId = CompanyListItem.CompanyId)[0].isOpen = !this.CompanyListObj.filter(x => x.CompanyId = CompanyListItem.CompanyId)[0].isOpen;
        }
    }

    filterSelected(CompanyListItem?: ICompanyVM) {
        this.returnCompanyList.emit(CompanyListItem);
    }

    findSelectedChild(CompanyListObj?: ICompanyVM[], CompanyItem?: ICompanyVM) {
        this.CompanyListObj.forEach(item => {
            if (item.CompanyId == CompanyItem.CompanyId) {
                item.isSelected = true;
                this.CompanyObj = item;
            } else {
                item.isSelected = null;
            }

            if (item.ChildCompany.length > 0) {
                this.findSelectedChild(item.ChildCompany);
            }
        });

        this.returnCompanyList.emit(this.CompanyObj);
    }
}
