import { Component, OnInit, Injectable, Input, Output, EventEmitter } from '@angular/core';

import { DepartmentService } from '../../../services/BaseService';
import { IDepartment } from '../../../models/Models';
import { IDepartmentVM } from '../../../models/ViewModels';

@Component({
    selector: 'selectChildDepartment',
    templateUrl: 'selectChildDepartment.component.html',
})
export class SelectChildDepartmentComponent implements OnInit {
    departmentObj?: IDepartmentVM;

    @Input() departmentListObj: IDepartmentVM[];

    @Output() returnDepartmentList: EventEmitter<IDepartment> = new EventEmitter<IDepartment>();

    IsExpanded: boolean = false;

    department: IDepartment;

    parentId?: number;

    constructor(
        public departmentService: DepartmentService
    ) {
        if (this.departmentListObj != null) {
            this.departmentListObj.forEach(item => {
                if (item.isOpen == null) {
                    item.isOpen = false;
                }
            })
        }
    }

    ngOnInit() { }

    toggle(departmentListItem: IDepartment) {
        if (this.departmentListObj.length > 0) {
            this.departmentListObj.filter(x => x.DepartmentId = departmentListItem.DepartmentId)[0].isOpen = !this.departmentListObj.filter(x => x.DepartmentId = departmentListItem.DepartmentId)[0].isOpen;
        }
    }

    filterSelected(departmentListItem?: IDepartmentVM) {
        this.returnDepartmentList.emit(departmentListItem);
    }

    findSelectedChild(departmentListObj?: IDepartmentVM[], departmentItem?: IDepartmentVM) {
        this.departmentListObj.forEach(item => {
            if (item.DepartmentId == departmentItem.DepartmentId) {
                item.isSelected = true;
                this.departmentObj = item;
            } else {
                item.isSelected = null;
            }

            if (item.ChildDepartment.length > 0) {
                this.findSelectedChild(item.ChildDepartment);
            }
        });

        this.returnDepartmentList.emit(this.departmentObj);
    }
}
