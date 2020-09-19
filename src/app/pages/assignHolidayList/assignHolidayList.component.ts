import { Component, Injectable, Output } from '@angular/core';
import { EmployeeHolidayListService, HolidayListService, EmployeeService } from '../../services/BaseService';
import { IEmployeeHolidayList, IHolidayList, IPaginationViewModel } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';

import { ToastyService, ToastyConfig } from 'ngx-toasty';

@Component({
    selector: 'assign-holiday-list',
    templateUrl: 'assignHolidayList.component.html'
})
export class EmployeeHolidayListComponent {
    @Output() selectedEmployee;

    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true,
        showSupervisorList: false
    };
    empHolidayList: IEmployeeHolidayList[] = [];
    employeeHolidayList: IEmployeeHolidayList[] = [];
    holidayList: IHolidayList[] = [];
    userId: string;

    //searching and sorting
    filterObj?: IFilterViewModel;

    //for pagination
    pagination?: IPaginationViewModel = {
        CurrentPage: 1,
        MaxItems: 50,
        ItemsPerPage: 50,
        TotalPage: 0
    };

    constructor(
        public employeeHolidayListService: EmployeeHolidayListService,
        public holidayListService: HolidayListService,
        public employeeService: EmployeeService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
    }
    
}