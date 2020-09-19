import { Component, Injectable, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core';
import { EmployeeService } from '../../services/BaseService';
import { IEmployeeVM } from '../../models/ViewModels';


@Component({
    selector: 'reportTo',
    template: "<span>{{reportTo}}</span>",
})
export class showReportToComponent {
    @Input() employeeId: number;

    reportToObj: IEmployeeVM = {};

    reportTo: string = '';
    constructor(
        public employeeService: EmployeeService
    ) { }

    ngOnInit() {
        this.getReportTo();
    }

    getReportTo() {
        if (this.employeeId != null) {
            var query = "$select=FirstName,MiddleName,LastName";
            this.employeeService.get(this.employeeId, query).subscribe((data: IEmployeeVM) => {
                this.reportTo = data.FirstName + ' ';
                if (data.MiddleName) {
                    this.reportTo += data.MiddleName + ' ';
                }
                this.reportTo += data.LastName;
            })
        } else {
            this.reportTo = '-';
        }
    }
}