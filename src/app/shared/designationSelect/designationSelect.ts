import { Component, Injectable, OnChanges, SimpleChanges, Input, Output, EventEmitter } from "@angular/core";
import { DesignationService } from "../../services/BaseService";
import { IDesignation } from "../../models/Models";


@Component({
    selector: 'designation-select',
    templateUrl: './designationSelect.html'
})
export class DesignationSelectComponent implements OnChanges {
    @Input() deptId: string;
    @Output() selectedDesg: EventEmitter<string> = new EventEmitter<string>();

    //variables
    desgId: string;
    designationList: IDesignation[] = [];

    constructor(
        public designationService: DesignationService
    ) {
        this.getDesignation();
    }

    ngOnChanges(changes: SimpleChanges) {
    }

    getDesignation() {
        this.designationList = [];
        this.designationService.getAll().subscribe((data: IDesignation[]) => {
            this.designationList = data;
        })
    }

    returnDesgId(id: string) {
        this.selectedDesg.emit(id);
    }
}