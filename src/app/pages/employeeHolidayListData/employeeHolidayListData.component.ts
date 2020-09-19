import { Component, Injectable } from '@angular/core';
import { EmployeeHolidayListDataService, BSADCalService } from '../../services/BaseService';
import { IBSADCal } from '../../models/Models';
import { IEmployeeHolidayListData } from '../../models/ViewModels';

import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';

@Component({
    selector: 'employee-holiday-list',
    templateUrl: 'employeeHolidayListData.component.html'
})
export class EmployeeHolidayListDataComponent {
    userId: string;
    currentEmpId: number;
    currentDate: Date;
    employeeHolidayList: IEmployeeHolidayListData[] = [];

    constructor(
        private datePickerFunctions: DatePickerFunctions,
        private employeeHolidayListService: EmployeeHolidayListDataService,
        private bSADCalService: BSADCalService
    ) {
        this.userId = localStorage.getItem('UserId');
        this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
        this.currentDate = new Date();
        this.getEmployeeHolidayList();
    }

    public getEmployeeHolidayList() {
        let newBSADDate = this.datePickerFunctions.getDate(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, this.currentDate.getDate(), 1);
        let calendarYear = this.datePickerFunctions.getBSYear(newBSADDate.DateBS);
        this.bSADCalService.get(calendarYear).subscribe((data: IBSADCal) => {
            this.employeeHolidayListService.GetEmployeeHolidayList(this.currentEmpId, data.StartDate, data.EndDate)
                .subscribe((data: IEmployeeHolidayListData[]) => {
                    this.employeeHolidayList = data;
                });
        });
    }
}