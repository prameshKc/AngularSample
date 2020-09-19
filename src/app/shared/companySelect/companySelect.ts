import { Component, OnInit, Injectable, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

import { CompanyService } from '../../services/BaseService';
import { ICompany } from '../../models/Models';
import { ICompanyVM } from '../../models/ViewModels';

@Component({
    selector: 'companySelect',
    templateUrl: './companySelect.html'
})
export class CompanySelectComponent implements OnInit {
    @Input() CompanyListObj: ICompanyVM[];
    @Output() returnCompanyList: EventEmitter<ICompany> = new EventEmitter<ICompany>();
    @Input() IsExpanded: boolean = true;

    CompanyObj?: ICompanyVM;
    Company: ICompany;
    dCompany: ICompanyVM[] = [];
    parentId?: number;

    constructor(
        public CompanyService: CompanyService
    ) {
        if (this.CompanyListObj != null) {
            this.CompanyListObj.map(item => {
                if (item.isOpen == null) {
                    item.isOpen = false;
                }
                return item;
            })
        }
    }

    ngOnInit() {
        if (this.CompanyListObj.length > 0) {
            this.dCompany = [...this.CompanyListObj];
        } else {
            this.setCompany();
        }
    }

    toggle(CompanyListItem: ICompany) {
        if (this.CompanyListObj.length > 0) {
            this.CompanyListObj.filter(x => x.CompanyId = CompanyListItem.CompanyId)[0].isOpen = !this.CompanyListObj.filter(x => x.CompanyId = CompanyListItem.CompanyId)[0].isOpen;
        }
    }

    filterSelected(CompanyListItem?: ICompanyVM) {
        CompanyListItem.PComapnyName = this.CompanyListObj.filter(x => x.CompanyId == CompanyListItem.ParentId)[0].CompanyName;
        this.returnCompanyList.emit(CompanyListItem);
    }

    filterById(id: number) {
        let branches: ICompanyVM[] = JSON.parse(localStorage.getItem('Branches'));
        let item = branches.filter(x => x.ParentId != null && x.CompanyId == id)[0];
        this.filterSelected(item);
    }


    findSelectedChild(CompanyListObj?: ICompanyVM[], CompanyItem?: ICompanyVM) {
        this.CompanyListObj.forEach(item => {
            if (item.CompanyId == CompanyItem.CompanyId) {
                item.isSelected = true;
                this.CompanyObj = item;
            } else {
                item.isSelected = null;
            }
            if (item.isSelected == true) {
                this.filterSelected(this.CompanyObj);
            } else {
                if (item.ChildCompany.length > 0 && item.isSelected == null) {
                    this.findSelectedChild(item.ChildCompany);
                }
            }
        });
    }

    companyId: number = -1;
    branchName: string;
    search() {
        this.setCompany();
        this.setCBranches();
    }

    setCompany() {
        let branches: ICompanyVM[] = JSON.parse(localStorage.getItem('Branches'));
        branches.forEach(item => {
            item.isOpen = true;
            item.ChildCompany = branches.filter(x => x.ParentId == item.CompanyId);
        });
        this.dCompany = branches.filter(x => x.ParentId == null);
        if (this.companyId.toString() != '-1') {
            this.dCompany = this.dCompany.filter(x => x.CompanyId == this.companyId);
        }
    }

    setCBranches() {
        if (this.branchName) {
            this.dCompany.forEach(item => {
                item.ChildCompany = item.ChildCompany.filter(x => x.CompanyName.toLowerCase().includes(this.branchName.toLowerCase()));
            })
        }
    }
}
