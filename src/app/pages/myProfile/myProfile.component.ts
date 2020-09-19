import { Component, Injectable } from '@angular/core';
import { IUser, IEmployee } from '../../models/Models';
import { UserService, EmployeeService } from '../../services/BaseService';
import { ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: 'myProfile.component.html'
})
export class MyProfileComponent {
    userId: string;
    userDetails: IUser = <IUser>{};
    empList: IEmployee[] = [];
    parameter: any;
    requiredEmployeeId: number;
    showEmp: boolean = false;

    constructor(public userService: UserService, private route: ActivatedRoute, public employeeService: EmployeeService) {

        this.userId = localStorage.getItem('UserId');
        this.requiredEmployeeId = parseInt(localStorage.getItem('EmployeeId'));
        this.getEmployeeId(this.userId);
    }

    //ngOnInit() {
    //    this.route.params.subscribe(params => {
    //        this.parameter = params;            
    //        if (this.parameter.id != this.userId) {
    //            this.showEmp = true;
    //            this.getEmployeeIdFromEmployeeNo(this.parameter);
    //        }
    //        else {
    //            this.showEmp = false;
    //            this.getEmployeeId(this.parameter);
    //        }   

    //    });                  
    //}

    ngOnInit() {
        this.showEmp = false;
    }

    public empDetail(event: any) {
    }

    //public getEmployeeId(parameter:any) {
    //    this.userService.get(parameter.id).subscribe((data: IUser) => {
    //        this.userDetails = data;
    //        this.requiredEmployeeId = data.EmployeeId;            
    //    })
    //}

    public getEmployeeId(userId: any) {
        this.userService.get(userId).subscribe((data: IUser) => {
            this.userDetails = data;
            this.requiredEmployeeId = data.EmployeeId;
        })
    }

    public getEmployeeIdFromEmployeeNo(empNo: any) {
        var query = "$filter=EmployeeNo eq " + empNo.id;
        this.employeeService.getAll(query)
            .subscribe((list: IEmployee[]) => {
                this.empList = list;
                this.requiredEmployeeId = this.empList[0].EmployeeId;
            });
    }
}