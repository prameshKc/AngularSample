import { Component, Injectable, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core';
import { EmployeeService, HolidayListService } from '../../services/BaseService';
import { IEmployeeVM } from '../../models/ViewModels';
import { IHolidayList } from '../../models/Models';

@Component({
    selector: 'holidayListName',
    template: "<span>{{holidayListName}}</span>"
})
export class showHolidayListNameComponent {
    @Input() holidayListId: number;

    holidayListName: string = '';
    constructor(
        public hlService: HolidayListService
    ) { }

    ngOnInit() {
        this.getReportTo();
    }

    getReportTo() {
        if (this.holidayListId != null) {
            var query = "$select=ListName";
            this.hlService.get(this.holidayListId, query).subscribe((data: IHolidayList) => {
                this.holidayListName = data.ListName;
            })
        } else {
            this.holidayListName = '-';
        }
    }
}