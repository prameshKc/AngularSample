import { Component, Injectable, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import {
  EmployeeService, MenuVsTemplateService,
  UserService, SupervisorListService, DepartmentService,
  DesignationService
} from '../../services/BaseService';
import {
  IEmployee,
  IDesignation,
  IDepartment,
  IMenuVsTemplate,
  IUser,
  IODataResult,
  IPagination
} from '../../models/Models';
import { IEmployeeVM, IFGetEmployee_Result } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';
import { Observable, Subscriber } from 'rxjs';

@Component({
  selector: 'employee-search',
  styleUrls: ['employeeSearch.component.css'],
  templateUrl: 'employeeSearch.component.html'
})
export class EmployeeSearchComponent implements OnChanges {
  @ViewChild('childModal', { static: false }) public childModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirective: any;

  @Input() employeeSearchOption: IEmployeeSearchOption;
  @Output() selectedEmployee: EventEmitter<IEmployee> = new EventEmitter<IEmployee>();

  svEmployeeList: IFGetEmployee_Result[] = [];
  displayEmployeeList: Observable<IFGetEmployee_Result[]> = new Observable<IFGetEmployee_Result[]>((observer: Subscriber<IFGetEmployee_Result[]>) => {
    observer.next([]);
  });
  menuVsTemplateList: IMenuVsTemplate[] = [];
  supervisorList: IEmployeeVM[] = [];
  requiredSupervisorList: IEmployee[] = [];
  employeeListWithoutPagi: IEmployee[] = [];

  InputEmployee: IFGetEmployee_Result = <IFGetEmployee_Result>{};

  svDepartmentList: IDepartment[] = [];
  InputDepartment: string = '';

  svDesignationList: IDesignation[] = [];
  InputDesignation: string = '';

  userId: string;
  userDetails: IUser;

  selected?: any;
  searchText: string;
  selectModalLoaded: boolean = false;
  openSupervisorModel: boolean = false;

  //for pagination
  pagination?: IPagination;

  constructor(
    public employeeService: EmployeeService,
    public userService: UserService,
    public supervisorListService: SupervisorListService,
    public designationService: DesignationService,
    public departmentService: DepartmentService,
    public menuVsTemplateService: MenuVsTemplateService
  ) {
    this.getAllDepartment();
    this.getAllDesignation();
    //this.getAllEmployeeWithoutPagi();
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };

  }

  ngOnChanges(changes: SimpleChanges) {
    let newChanges: any = changes;

    //this.employeeSearchOption = {
    //    filterEmployeeId: this.employeeSearchOption.filterEmployeeId != null ? this.employeeSearchOption.filterEmployeeId : null,
    //    selectedEmployeeId: this.employeeSearchOption.selectedEmployeeId != null ? this.employeeSearchOption.selectedEmployeeId : null,
    //    showOpenModalButton: this.employeeSearchOption.showOpenModalButton != null ? this.employeeSearchOption.showOpenModalButton : false,
    //    showSupervisorList: this.employeeSearchOption.showSupervisorList != null ? this.employeeSearchOption.showSupervisorList : false
    //}
    if (JSON.stringify(newChanges.employeeSearchOption.currentValue) !== JSON.stringify(newChanges.employeeSearchOption.previousValue)) {
      this.userId = localStorage.getItem('UserId');
      if (!this.userDetails) {
        this.getUserDetails();
      } else {
        this.getEmployeeList();
      }

      if (this.employeeSearchOption.selectedEmployeeId == null) {
        this.selected = null;

      }
    }
  }

  getUserDetails() {
    let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
    //let query: string = "$expand=Employee,Employee/LoginReport,Employee/ReportTo,MenuTemplate/MenuVsTemplate";
    this.userService.get(localStorage.getItem("UserId"), query).subscribe((data: IUser) => {
      this.userDetails = data;
      this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
      this.getEmployeeList();
    });
  }

  searchTimeout: any;
  searchEmployee(event: any) {

    if (this.searchTimeout != null) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.searchText = this.selected;
      this.InputEmployee = this.svEmployeeList.filter(x => x.EmployeeName.toLowerCase() == this.searchText.toLowerCase())[0];
      if (this.InputEmployee) {
        this.InputDepartment = this.InputEmployee.DepartmentId.toString();
        this.InputDesignation = this.InputEmployee.DesignationID.toString();
      }
      this.selectedEmployee.emit(this.InputEmployee);
    }, 1500);
  }

  getEmployeeList() {
    if (this.userDetails.Employee.ReportTo != null || typeof this.userDetails.Employee.ReportTo != undefined) {
      if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
        this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
      ) {
        this.getAllSupervisorHierarchy();
      }
      else {
        this.getSupervisorHierarchy();
      }
    }
  }

  /**
  * *Get supervisor list
  */
  subscription: any;
  public getSupervisorHierarchy() {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.supervisorListService.GetSupervisorHierarchyEmployeeListEmpPos(this.userDetails.EmployeeId, this.pagination, this.searchText, Number(this.InputDepartment), Number(this.InputDesignation)).subscribe((data: IODataResult<IFGetEmployee_Result[]>) => {
      this.svEmployeeList = data.value;

      if (this.employeeSearchOption.filterEmployeeId != null) {
        this.svEmployeeList.filter(x => x.EmployeeId == this.employeeSearchOption.filterEmployeeId).forEach(item => {
          item.isDisabled = true;
        })
      }

      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: data.count,
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };

      this.getAllEmployee();
    })
  }

  public getAllSupervisorHierarchy() {
    let query: string = ``;

    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.supervisorListService.GetAllSupervisorHierarchyEmployeeListEmpPos(this.pagination, this.searchText, Number(this.InputDepartment), Number(this.InputDesignation)).subscribe((data: IODataResult<IFGetEmployee_Result[]>) => {
      this.svEmployeeList = data.value;

      if (this.employeeSearchOption.filterEmployeeId != null) {
        this.svEmployeeList.filter(x => x.EmployeeId == this.employeeSearchOption.filterEmployeeId).forEach(item => {
          item.isDisabled = true;
        })
      }

      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: data.count,
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };

      if (this.employeeSearchOption.showSupervisorList) {
        this.getSupervisor();
      }
      else {
        this.getAllEmployee();
      }
    })
  }

  public getAllDepartment() {
    this.departmentService.getAll()
      .subscribe((list: IDepartment[]) => {
        this.svDepartmentList = list;
      })
  }

  public getAllDesignation() {
    this.designationService.getAll()
      .subscribe((list: IDesignation[]) => {
        this.svDesignationList = list;
      })
  }

  getAllEmployee() {
    this.displayEmployeeList = new Observable<IFGetEmployee_Result[]>((observer: Subscriber<IFGetEmployee_Result[]>) => {
      observer.next(this.svEmployeeList);
    });

    this.selectModalLoaded = true;

    if (this.employeeSearchOption.selectedEmployeeId != null) {
      this.InputEmployee = this.svEmployeeList.filter(x => x.EmployeeId == this.employeeSearchOption.selectedEmployeeId)[0];
      this.getSelectedEmployee();
    }

  }

  public getSupervisor() {

    if (this.employeeSearchOption.showSupervisorList) {
      var query = '$expand=MenuTemplate/User/Employee&$filter=MenuId eq 1048';
      this.menuVsTemplateService.getAll(query).subscribe((data: IMenuVsTemplate[]) => {
        this.displayEmployeeList = new Observable<IFGetEmployee_Result[]>((observer: Subscriber<IFGetEmployee_Result[]>) => {
          observer.next([]);
        });;
        this.menuVsTemplateList = data;

        let displaySupervisorList: IEmployee[] = [];


        this.menuVsTemplateList.forEach(item => {
          item.MenuTemplate.User.forEach(userItem => {
            displaySupervisorList.push(userItem.Employee);
          });
        })

        this.displayEmployeeList = new Observable<IFGetEmployee_Result[]>((observer: Subscriber<IFGetEmployee_Result[]>) => {
          observer.next(displaySupervisorList);
        });
      })
    }
  }

  getSelectedEmployee() {
    this.selected = this.InputEmployee.EmployeeName;
    this.searchText = this.InputEmployee.EmployeeName;

    if (this.InputEmployee.DepartmentId) {
      this.InputDepartment = this.InputEmployee.DepartmentId.toString();
    }
    if (this.InputEmployee.DesignationID != null) {
      this.InputDesignation = this.InputEmployee.DesignationID.toString();
    }
  }


  filter(ev?: any) {
    this.pagination.CurrentPage = 1;
    if (!this.userDetails) {
      this.getUserDetails();
    } else {
      this.getEmployeeList();
    }
  }

  selectEmployee($event: any) {
    if ($event.item == null || $event.item == undefined) {
      this.reset();
    } else {
      this.InputEmployee = $event.item;
      if (this.InputEmployee != null) {
        this.getSelectedEmployee();
      }
    }
    //this.selectedEmployee.emit(this.InputEmployee);
  }

  selectFrmModal() {
    this.getSelectedEmployee();
    this.selectedEmployee.emit(this.InputEmployee);
    this.hideModal();
  }

  reset() {
    this.InputEmployee = null;
    this.selected = null;
    this.searchText = '';
    this.InputDepartment = '';
    this.InputDesignation = '';
    this.selectedEmployee.emit(this.InputEmployee);

    this.filter();
  }

  /**
   * to open modal
   */
  openModal() {
    this.childModal.show();
    if (this.InputEmployee == null || typeof this.InputEmployee == undefined) {
      this.searchText = '';
    }
  }

  /**
   * to hide modal
   */
  public hideModal(): void {
    this.childModal.hide();
    this.selectModalLoaded = false;
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;

    if (!this.userDetails) {
      this.getUserDetails();
    } else {
      this.getEmployeeList();
    }
  }

  getMyDepartment(departmentObj: IDepartment): string {
    if (departmentObj)
      return this.svDepartmentList.filter(x => x.DepartmentId == departmentObj.DepartmentId)[0].DepartmentName.toString();
    return '-';
  }

  getMyDesignation(designationObj: IDesignation): string {
    if (designationObj)
      return this.svDesignationList.filter(x => x.DesignationId == designationObj.DesignationId)[0].DesignationName.toString();
    return '-';
  }

}

export interface IEmployeeSearchOption {
  filterEmployeeId?: number;
  selectedEmployeeId?: number;
  showOpenModalButton?: boolean;
  showSupervisorList?: boolean;
}

