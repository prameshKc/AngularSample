import { IEmployee_OutsideMovement, IInfoOutSideMovement, IInfoOutSideTrnsportationType, IEmployee, IPagination, IODataResult, IUser } from './../../models/Models';
import { Employee_OutsideMovementService, CommonService, UserService } from './../../services/BaseService';
import { Component } from '@angular/core';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { IFGetOutsideMovementStatus_Result, IFilterViewModel } from '../../models/ViewModels';
import { CsvService } from 'src/app/services/excel.service';

@Component({
  selector: 'outside-movement-approval',
  templateUrl: 'outsideMovementApproval.component.html',
  styleUrls: ['outsideMovementApproval.component.css']
})
export class OutsideMovementApprovalComponent {
  empOMList: IEmployee_OutsideMovement[] = [];
  infoOMList: IInfoOutSideMovement[] = [];
  infoOMTList: IInfoOutSideTrnsportationType[] = [];
  pending: boolean = false;
  statusId: number;
  searchEmpId: number;
  currEmpId: number;
  isAdmin: boolean = false;
  csvJSONData: any[] = [];

  userDetails: IUser;
  filterObj: IFilterViewModel = <IFilterViewModel>{};
  subscription: any;

  omStatus: IFGetOutsideMovementStatus_Result[] = [];

  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  }

  constructor(
    private empOMS: Employee_OutsideMovementService,
    private commonService: CommonService,
    private csvService: CsvService,
    private userService: UserService
  ) {
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.currEmpId = Number(localStorage.getItem('EmployeeId'));
  }

  ngOnInit() {
    this.getOMStatus();
    this.getUserDetails();
  }

  getOMStatus() {
    this.commonService.GetOutsideMovementStatus().subscribe(data => {
      this.omStatus = data;
      this.selectStatus(data[0].Id)
    })
  }

  public getUserDetails() {
    var query = "$expand=Employee,Employee/ReportTo,MenuTemplate/MenuVsTemplate";

    let userId = localStorage.getItem('UserId');
    this.userService.get(userId, query).subscribe((data: IUser) => {
      this.userDetails = data;
      this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
      let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
      if (
        currentReportTo.ReportTo1 == 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
      ) {
        this.isAdmin = true;
      }
      else {
        this.isAdmin = false;
      }
      this.getEmpOMList();
    })
  }


  getEmpOMList(event?: any) {
    this.empOMList = [];
    if (this.searchEmpId) {
      this.filterObj.Name = this.searchEmpId.toString();
    }
    this.filterObj.Sort = 'false';
    if (this.pending) {
      this.filterObj.SortingAttribute = 'status';
    } else {
      this.filterObj.SortingAttribute = 'ApprovedOn';
    }

    let empId: number = this.isAdmin == true ? -1 : Number(localStorage.getItem('EmployeeId'));
    let fromDate: string;
    let toDate: string;
    if (this.filterByFromDate) {
      fromDate = `${this.filterByFromDate.getFullYear()}-${this.filterByFromDate.getMonth() + 1}-${this.filterByFromDate.getDate()}T00:00:00Z`;
    }
    if (this.filterByToDate) {
      toDate = `${this.filterByToDate.getFullYear()}-${this.filterByToDate.getMonth() + 1}-${this.filterByToDate.getDate()}T00:00:00Z`;
    }
    if (this.subscription != null) this.subscription.unsubscribe();
    this.subscription = this.empOMS.GetList(this.pagination, empId, this.statusId, this.filterObj, fromDate, toDate).subscribe((data: any) => {
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: <number>(data["count"]),
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

  filterByFromDate: Date;
  filterByToDate: Date;

  loadingExportCSV: boolean = false;
  exportToCSV() {
    let fromDate: string;
    let toDate: string;
    let empId: number = this.isAdmin == true ? -1 : Number(localStorage.getItem('EmployeeId'));
    this.loadingExportCSV = true;

    if (this.searchEmpId) this.filterObj.Name = this.searchEmpId.toString();
    if (this.subscription != null) this.subscription.unsubscribe();
    if (this.filterByFromDate) fromDate = `${this.filterByFromDate.getFullYear()}-${this.filterByFromDate.getMonth() + 1}-${this.filterByFromDate.getDate()}T00:00:00Z`;
    if (this.filterByToDate) toDate = `${this.filterByToDate.getFullYear()}-${this.filterByToDate.getMonth() + 1}-${this.filterByToDate.getDate()}T00:00:00Z`;

    this.empOMS.GetCSVList(empId, this.statusId, this.filterObj, fromDate, toDate).subscribe((data: any) => {
      this.csvJSONData = data.value;
      this.csvService.download(this.csvJSONData, `HRMS Outside Movement_${new Date().toDateString()}`);
      this.loadingExportCSV = false;
    }, (msg) => {
      this.loadingExportCSV = true;
      console.log('Error: ', msg);
    });
  }
}
