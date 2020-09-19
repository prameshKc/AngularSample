import { Component } from "@angular/core";
import { EmployeeService } from 'src/app/services/BaseService';

@Component({
  selector: "employee-list",
  templateUrl: "employeeList.html"
})
export class EmployeeListComponent {
  constructor(
    private empService: EmployeeService
  ) {
  
  }

  getEmployeeList() {

  }
}
