import { Component } from '@angular/core';
import { UserService, HRIncentiveService } from '../../services/BaseService';
import { IUser, IEmployee, IPagination, IODataResult } from '../../models/Models';
import { IFilterViewModel, IHRInsentiveVM } from '../../models/ViewModels';

@Component({
    selector: 'expenses',
    templateUrl: 'hRExpenses.component.html',
})
export class HRExpensesComponent {
    userId: string;
    userDetails: IUser = <IUser>{};
    employeeList: IHRInsentiveVM[] = [];

    //pagination variables
    pagination: IPagination;

    constructor(
        public userService: UserService,
        public hrIncentiveService: HRIncentiveService
    ) { }

    ngOnInit() {
        this.userId = localStorage.getItem('UserId');
    }
}