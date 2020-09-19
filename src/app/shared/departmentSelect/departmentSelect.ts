import { Component, Injectable, OnChanges, SimpleChanges, Input, Output, EventEmitter } from "@angular/core";
import { DepartmentService } from "../../services/BaseService";
import { IDepartment } from "../../models/Models";

@Component({
    selector: 'department-select',
    templateUrl: './departmentSelect.html'
})
export class DepartmentSelectComponent implements OnChanges {
    @Output() selectedDept: EventEmitter<string> = new EventEmitter<string>();

    //variables
    deptId: string;
    departmentList: IDepartment[] = [];

    constructor(
        public departmentService: DepartmentService
    ) {
        this.getDepartment();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (JSON.stringify(changes.previousValue) != JSON.stringify(changes.currentValue)) {

        }
    }

    getDepartment() {
        this.departmentService.getAll().subscribe((data: IDepartment[]) => {
            this.departmentList = data;
        })
    }

    returnDeptId(id: string) {
        this.selectedDept.emit(id);
    }
}