import { IEmployee_OutsideMovement, IInfoOutSideMovement, IInfoOutSideTrnsportationType, IPagination, IEmployee, IReportTo } from './../../models/Models';
import { Employee_OutsideMovementService, CommonService, ReportToService } from './../../services/BaseService';
import { Component } from '@angular/core';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { IFGetOutsideMovementStatus_Result } from '../../models/ViewModels';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'outside-movement',
  templateUrl: 'outsideMovement.component.html',
  styleUrls: ['outsideMovement.component.css']
})
export class OutsideMovementComponent {
  empOMList: IEmployee_OutsideMovement[] = [];
  infoOMList: IInfoOutSideMovement[] = [];
  infoOMTList: IInfoOutSideTrnsportationType[] = [];
  pending: boolean = false;
  statusId: number;
  searchEmpId: number;
  reportTo: number;

  omStatus: IFGetOutsideMovementStatus_Result[] = [];

  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  }

  constructor(
    public empOMS: Employee_OutsideMovementService,
    public reportToService: ReportToService,
    public commonService: CommonService
  ) {
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
  }

  ngOnInit() {
    this.getEmpReportTo();
    this.getOMStatus();
  }

  empRTSubscription: Subscription;
  getEmpReportTo() {
    if (this.subscription) this.subscription.unsubscribe();
    let empId = localStorage.getItem('EmployeeId');
    let query = `$filter=EmployeeId eq ${empId}`;
    this.empRTSubscription = this.reportToService.getAll(query).subscribe((data: IReportTo[]) => {
      if (data.length > 0) {
        let revdata = data.reverse();
        this.reportTo = revdata[0].ReportTo1;
      }
    }, (msg) => { console.log('Error: ', msg); });
    setTimeout(() => { this.empRTSubscription.unsubscribe(); }, 10000);
  }

  getOMStatus() {
    this.commonService.GetOutsideMovementStatus().subscribe(data => {
      this.omStatus = data;
      this.selectStatus(data[0].Id)
    })
  }

  subscription: Subscription;
  getEmpOMList() {
    this.empOMList = [];
    let empId = localStorage.getItem('EmployeeId');

    if (!this.statusId) {
      this.statusId = 1;
    }

    let query = '';
    query += `$expand=InfoOutSideMovement,InfoOutSideTrnsportationType`;
    query += `&$filter=status eq ${this.statusId} and EmployeeId eq ${empId} `;

    if (this.searchEmpId) {
      query += `and EmployeeId eq ${this.searchEmpId} `;
    }

    if (this.pending) {
      query += `&$orderby=status desc`;
    } else {
      query += `&$orderby=ApprovedOn desc`;
    }

    let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
    query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = this.empOMS.getAll(query).subscribe((data: any) => {
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: <number>(data["odata.count"]),
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };
      this.empOMList = data.value;
    }, (msg) => { console.log('Error: ', msg); });
    setTimeout(() => { this.subscription.unsubscribe(); }, 10000);
  }

  refreshList(id: number) {
    this.selectStatus(id);
  }

  selectedEmployee(emp: IEmployee) {
    if (emp) {
      this.searchEmpId = emp.EmployeeId;
    } else {
      this.searchEmpId = null;
    }
    this.getEmpOMList();
  }

  selectStatus(id: number) {
    this.statusId = id;
    this.omStatus.forEach(item => {
      if (item.Id == id) {
        item.isChecked = true;
      } else {
        item.isChecked = false;
      }
    })
    this.getEmpOMList();
  }

  //pagination variables
  pagination?: IPagination;
  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.getEmpOMList();
  }
}
