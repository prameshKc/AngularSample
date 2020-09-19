import { UserService } from './../../services/BaseService';
import { Component, Injectable, Input, OnInit } from '@angular/core';
import {
  EmployeeService
} from '../../services/BaseService';
import { IEmployee } from 'src/app/models/Models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'employee-name',
  template: '<span>{{employeeName | async}}<span>'
})
export class EmployeeNameComponent implements OnInit {
  @Input() employeeId?: number;
  @Input() employeeNo?: number;
  @Input() userId?: string;

  employeeName: Observable<string>;

  constructor(
    private employeeService: EmployeeService,
    private userService: UserService,
  ) {

  }

  ngOnInit() {
    this.getEmployeeName();
  }
  getEmployeeName() {
    if (this.employeeId != null) {
      let query: string = '$select=FirstName,MiddleName,LastName';

      this.employeeName = this.employeeService.get(this.employeeId, query).pipe(map(data => {
        return this.getName(data);
      }));
    } else if (this.userId != null) {
      let query: string = '$select=Employee/FirstName,Employee/MiddleName,Employee/LastName&$expand=Employee';
      this.employeeName = this.userService.get(this.userId, query).pipe(map(data => {
        return this.getName(data.Employee);
      }));
    } else if (this.employeeNo != null) {
      let query: string = `$select=FirstName,MiddleName,LastName&$filter=EmployeeNo eq ${this.employeeNo}`;

      this.employeeName = this.employeeService.getAll(query).pipe(map(data => {
        if (data.length > 0) {
          return this.getName(data[0]);
        }
        else {
          return '-';
        }
      }));
    }
  }

  getName(data: IEmployee): string {
    let employeeName = data.FirstName;
    employeeName += data.MiddleName == null ? '' : ` ${data.MiddleName}`;
    employeeName += data.LastName == null ? '' : ` ${data.LastName}`;
    return employeeName;
  }
}
