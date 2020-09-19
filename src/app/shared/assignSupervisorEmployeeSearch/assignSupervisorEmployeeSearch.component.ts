import { Component, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';
import {
  EmployeeService, MenuVsTemplateService,
  ReportToService, HolidayListService, EmployeeHolidayListService,
  DepartmentService, DesignationService, SupervisorListService
} from '../../services/BaseService';
import {
  IEmployee, IDesignation, IDepartment,
  IMenuVsTemplate,
  ICheckBoxViewModel, IReportTo, IHolidayList,
  IEmployeeHolidayList, IPagination
} from '../../models/Models';
import { IEmployeeVM, IFGetEmployee_Result } from '../../models/ViewModels';

@Component({
  selector: 'assignsupervisor-search',
  templateUrl: 'assignSupervisorEmployeeSearch.component.html'
})
export class AssignSupervisorEmployeeSearchComponent {
  @Input() employeeSearchOption: IEmployeeSearchOption;
  @Input() showReportTo: boolean;
  @Output() selectedEmployee: EventEmitter<IEmployee> = new EventEmitter<IEmployee>();

  svEmployeeList: IFGetEmployee_Result[] = [];
  displayEmployeeList: IFGetEmployee_Result[] = [];
  menuVsTemplateList: IMenuVsTemplate[] = [];
  supervisorList: IEmployeeVM[] = [];
  requiredSupervisorList: IEmployee[] = [];
  selectedEmployeeCheckBox: ICheckBoxViewModel<IEmployeeVM>[] = [];

  reportToObj: IEmployeeVM[] = [];
  reportToId?: number = null;
  error: boolean = false;

  InputEmployee: IFGetEmployee_Result = <IFGetEmployee_Result>{};
  svDepartmentList: IDepartment[] = [];
  InputDepartment: string = '';

  svDesignationList: IDesignation[] = [];
  InputDesignation: string = '';
  InputSupervisor: string = '';

  selected?: any;
  searchText: string;
  selectModalLoaded: boolean = false;
  openSupervisorModel: boolean = false;
  userId?: string;
  reportToList: IReportTo[] = [];
  holidayList: IHolidayList[] = [];
  employeeHolidayList: IEmployeeHolidayList[] = [];
  SelectAll: boolean = false;
  holidayListId: number;
  employeeListPagi: IEmployeeVM[] = [];
  uniqueArray: number[];

  //for pagination
  pagination?: IPagination;

  constructor(
    public employeeService: EmployeeService,
    public supervisorListService: SupervisorListService,
    public menuVsTemplateService: MenuVsTemplateService,
    public reportToService: ReportToService,
    public employeeHolidayListService: EmployeeHolidayListService,
    public holidayListService: HolidayListService,
    public departmentService: DepartmentService,
    public designationService: DesignationService,
    private toastyService: ToastyService) {
    //this.getAllEmployee();               
    this.getAllReportTo();
    this.getAllHolidayList();
    this.getAllDepartment();
    this.getAllDesignation();

  }

  ngOnInit() {
    this.employeeSearchOption = {
      filterEmployeeId: this.employeeSearchOption.filterEmployeeId != null ? this.employeeSearchOption.filterEmployeeId : null,
      selectedEmployeeId: this.employeeSearchOption.selectedEmployeeId != null ? this.employeeSearchOption.selectedEmployeeId : null,
      showOpenModalButton: this.employeeSearchOption.showOpenModalButton != null ? this.employeeSearchOption.showOpenModalButton : false,
      showSupervisorList: true
    }
    this.getSupervisor();
  }

  ngOnChanges() {
    this.employeeSearchOption = {
      filterEmployeeId: this.employeeSearchOption.filterEmployeeId != null ? this.employeeSearchOption.filterEmployeeId : null,
      selectedEmployeeId: this.employeeSearchOption.selectedEmployeeId != null ? this.employeeSearchOption.selectedEmployeeId : null,
      showOpenModalButton: this.employeeSearchOption.showOpenModalButton != null ? this.employeeSearchOption.showOpenModalButton : false,
      showSupervisorList: true
    }
    this.userId = localStorage.getItem('UserId');
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.getAllEmployee();
  }

  getAllDepartment() {
    this.departmentService.getAll()
      .subscribe((list: IDepartment[]) => {
        this.svDepartmentList = list;
      });
  }

  getAllDesignation() {
    this.designationService.getAll()
      .subscribe((list: IDesignation[]) => {
        this.svDesignationList = list;
      });
  }

  getAllEmployee() {

    //let query: string = `$expand=EmployeePosition/Department,EmployeePosition/Designation,ReportTo,EmployeeHolidayList,EmployeeHolidayList/HolidayList`;

    //if (this.employeeSearchOption.filterEmployeeId != null) {
    //    query += `&$filter=EmployeeId ne ${this.employeeSearchOption.filterEmployeeId}`;
    //    query += " and EmployeeNo ne 0";
    //}
    //else {
    //    query += "&$filter=EmployeeNo ne 0";
    //}

    let query: string = '';
    query += `ItemsPerPage=${this.pagination.ItemsPerPage}&CurrentPage=${this.pagination.CurrentPage}&Join=${this.showReportTo == true ? 'ReportTo' : ''}`;

    if (this.InputDepartment) {
      query += `&Dept=${this.InputDepartment}`;
    }
    if (this.InputDesignation) {
      query += `&Dept=${this.InputDepartment}`;
    }
    if (this.searchText) {
      query += `&Search=${this.searchText}`;
    }


    this.supervisorListService.GetEmpAllList(query).subscribe((data: any) => {
      this.svEmployeeList = data.value;
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: <number>(data.count),
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };

      //this.displayEmployeeList = this.svEmployeeList;
      this.displayEmployeeList = [];

      this.svEmployeeList.map((item) => {
        let employeeObj: IEmployeeVM = item;
        if (this.showReportTo) {
          if (employeeObj.ReportTo != null) {
            employeeObj.ReportTo = item.ReportTo.filter(x => x.Status == true);
          }
        } else {
          if (employeeObj.EmployeeHolidayList != null) {
            employeeObj.EmployeeHolidayList = item.EmployeeHolidayList.filter(x => x.Status == true);
          }
        }

        this.displayEmployeeList.push(employeeObj);
        return item;
      });
      this.displayEmployeeList = this.displayEmployeeList.filter(x => x.EmployeeNo != 0);
      this.selectModalLoaded = true;

      if (this.employeeSearchOption.selectedEmployeeId != null) {
        this.InputEmployee = this.svEmployeeList.filter(x => x.EmployeeId == this.employeeSearchOption.selectedEmployeeId)[0];
        this.getSelectedEmployee();
      }
      //this.getSupervisor();
      //this.getAllHolidayList();

    });
  }

  public getEmployeeUnderSupervisor(reportId: any) {
    let query = `$expand=Employee,Employee/EmployeePosition/Department,Employee/EmployeePosition/Designation,Employee/ReportTo &$filter=Status eq true and Employee/EmployeeNo ne 0 and ReportTo1 eq ${Number(reportId)}`;
    let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
    query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;


    this.reportToService.getAll(query).subscribe((data: any) => {
      let list: IReportTo[] = data.value;
      this.svEmployeeList = [];
      this.displayEmployeeList = [];
      list.forEach(item => {
        this.svEmployeeList.push(item.Employee);
        this.pagination = {
          ItemsPerPage: this.pagination.ItemsPerPage,
          TotalItems: <number>(data["odata.count"]),
          CurrentPage: this.pagination.CurrentPage,
          SortBy: this.pagination.SortBy
        };
      });
      this.svEmployeeList.forEach(svitem => {
        if (svitem.EmployeePosition.length > 0) {
          svitem.EmployeePosition = svitem.EmployeePosition.filter(x => new Date(x.EffectiveFrom) <= new Date()).sort(function (a, b) {
            if (new Date(a.EffectiveFrom) < new Date(b.EffectiveFrom)) return 1;
            if (new Date(a.EffectiveFrom) > new Date(b.EffectiveFrom)) return -1;
            return 0;
          });
        }

        let employeeObj: IEmployeeVM = svitem;
        employeeObj.ReportTo = svitem.ReportTo.filter(x => x.Status == true);
        this.displayEmployeeList.push(employeeObj);
      });
      this.filter();
    });
  }

  public getSupervisor() {

    if (this.employeeSearchOption.showSupervisorList) {
      var query = '$expand=MenuTemplate/User/Employee/ReportTo&$filter=MenuId eq 1043 or MenuId eq 1048';
      this.menuVsTemplateService.getAll(query).subscribe((data: IMenuVsTemplate[]) => {
        this.supervisorList = [];
        this.menuVsTemplateList = data;
        this.uniqueArray = [];
        this.menuVsTemplateList.forEach(item => {
          item.MenuTemplate.User.forEach(userObj => {
            let employeeObj: IEmployeeVM = userObj.Employee;
            employeeObj.employeeNameJoint = "";
            if (employeeObj.FirstName) {
              employeeObj.employeeNameJoint += employeeObj.FirstName + ' ';
            }
            if (employeeObj.MiddleName) {
              employeeObj.employeeNameJoint += employeeObj.MiddleName + ' ';
            }
            if (employeeObj.LastName) {
              employeeObj.employeeNameJoint += employeeObj.LastName;
            }
            employeeObj.ReportTo = employeeObj.ReportTo.filter(x => x.Status == true);
            var unique = this.uniqueArray.filter(x => x == employeeObj.EmployeeId).length;
            if (unique == 0) {
              this.uniqueArray.push(employeeObj.EmployeeId);
              if (employeeObj != null && typeof employeeObj != undefined) {
                this.supervisorList.push(employeeObj);
              }
            }

          })
        })
      })
    }
  }

  getSelectedEmployee() {
    this.selected = this.InputEmployee.EmployeeName;
    this.searchText = this.InputEmployee.EmployeeName;

    if (this.InputEmployee.EmployeePosition.length > 0) {
      if (this.svDepartmentList.length > 0) {
        this.InputDepartment = this.InputEmployee.DepartmentName;
      }
      if (this.svDesignationList.length > 0) {
        this.InputDesignation = this.InputEmployee.Designationname;
      }
    }
  }

  filter(x?: any) {
    //this.displayEmployeeList = [...this.svEmployeeList];
    //if (this.InputDepartment != '') {
    //    this.displayEmployeeList = this.displayEmployeeList.filter(x => x.DepartmentName == this.InputDepartment);
    //}
    //if (this.InputDesignation != '') {
    //    this.displayEmployeeList = this.displayEmployeeList.filter(x => x.Designationname == this.InputDesignation);
    //}
    //if (this.searchText) {
    //    this.displayEmployeeList = this.displayEmployeeList.filter(x => x.EmployeeName.toLowerCase().includes(this.searchText));
    //} 

    //if (this.InputSupervisor != '') {
    //    this.displayEmployeeList = this.svEmployeeList.filter(x => x.ReportTo.length > 0).filter(y => y.ReportTo[0].ReportTo1 == Number(this.InputSupervisor));
    //}

    this.getAllEmployee();
  }

  reset() {
    this.InputEmployee = null;
    this.selected = null;
    this.searchText = '';
    this.InputDepartment = '';
    this.InputDesignation = '';
  }

  /**
   * get all report to list
   */

  public getAllReportTo() {
    this.reportToService.getAll().subscribe((data: IReportTo[]) => {
      this.reportToList = data;
    })
  }

  public getAllHolidayList() {
    this.holidayListService.getAll()
      .subscribe((list: IHolidayList[]) => {
        this.holidayList = list;
      });
  }

  /**
   * assign supervisor to employee
   * @param reportToId
   * @param assignSupervisorObj
   */

  public assignSupervisor(reportToId: number, assignSupervisorObj: IEmployeeVM[]) {
    if (assignSupervisorObj.filter(x => x.Selected).length > 0) {
      assignSupervisorObj.filter(x => x.Selected).forEach(item => {
        let assignObj: IReportTo = {
          EmployeeId: item.EmployeeId,
          ReportTo1: reportToId,
          PostedBy: this.userId
        }
        this.reportToService.getAll().subscribe((data: IReportTo[]) => {
          this.reportToList = data;

          if (this.reportToList.filter(x => x.EmployeeId == item.EmployeeId).length > 0) {
            this.reportToList.filter(x => x.EmployeeId == item.EmployeeId && x.ReportTo1 != reportToId).forEach(item => {
              let oldReportObj: IReportTo = {
                Id: item.Id,
                EmployeeId: item.EmployeeId,
                PostedBy: item.PostedBy,
                ReportTo1: item.ReportTo1,
                PostedOn: item.PostedOn,
                Status: false
              }
              try {
                this.reportToService.put(item.Id, oldReportObj).subscribe(() => {
                  if (this.reportToList.filter(x => x.EmployeeId == item.EmployeeId && x.ReportTo1 == item.ReportTo1 && item.Status == true).length > 0) {
                    this.error = false;
                    this.reportToService.post(assignObj).subscribe(() => {
                      var toastOptions: ToastOptions = {
                        title: "Success",
                        msg: "User has been successfully re-assigned to a supervisor",
                        showClose: true,
                        timeout: 5000,
                        theme: 'bootstrap',
                        onAdd: () => {
                        },
                        onRemove: function () {
                        }
                      };
                      this.toastyService.success(toastOptions);
                      assignObj = {};
                      this.getAllEmployee();
                    })
                  }
                  else {
                    this.error = true;
                  }
                })

              }
              catch (e) {
                throw e;
              }
            })
          }
          else {
            this.reportToService.post(assignObj).subscribe(() => {
              var toastOptions: ToastOptions = {
                title: "Success",
                msg: "User has been successfully assigned to a supervisor",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap',
                onAdd: () => {
                },
                onRemove: function () {
                }
              };
              this.toastyService.success(toastOptions);
              this.getAllEmployee();
            })
          }
        })

      })
    }
  }

  public assignHoliday(holidayListId: number, assignHolidayObj: IFGetEmployee_Result[]) {
    if (assignHolidayObj.filter(x => x.Selected).length > 0) {
      assignHolidayObj.filter(x => x.Selected).forEach(item => {
        let assignHolidayObj: IEmployeeHolidayList = {
          EmployeeId: item.EmployeeId,
          HolidayListId: holidayListId,
          EffectiveFrom: new Date(),
          PostedBy: this.userId
        }
        this.employeeHolidayListService.getAll().subscribe((data: IEmployeeHolidayList[]) => {
          this.employeeHolidayList = data;

          if (this.employeeHolidayList.filter(x => x.EmployeeId == item.EmployeeId).length > 0) {
            this.employeeHolidayList.filter(x => x.EmployeeId == item.EmployeeId && x.HolidayListId != holidayListId).forEach(item => {
              let oldemployeeHolidayObj: IEmployeeHolidayList = {
                Id: item.Id,
                EmployeeId: item.EmployeeId,
                HolidayListId: item.HolidayListId,
                EffectiveFrom: item.EffectiveFrom,
                PostedBy: item.PostedBy,
                PostedOn: item.PostedOn,
                Status: false
              }
              try {
                this.employeeHolidayListService.put(item.Id, oldemployeeHolidayObj).subscribe(() => {
                  if (this.employeeHolidayList.filter(x => x.EmployeeId == item.EmployeeId && x.HolidayListId == item.HolidayListId && item.Status == true).length > 0) {
                    this.error = false;
                    this.employeeHolidayListService.post(assignHolidayObj).subscribe(() => {
                      var toastOptions: ToastOptions = {
                        title: "Success",
                        msg: "Holiday Group has been successfully re-assigned to Employee",
                        showClose: true,
                        timeout: 5000,
                        theme: 'bootstrap',
                        onAdd: () => {
                        },
                        onRemove: function () {
                        }
                      };
                      this.toastyService.success(toastOptions);
                      assignHolidayObj = {};
                      this.getAllEmployee();
                    })
                  }
                  else {
                    this.error = true;
                  }
                })

              }
              catch (e) {
                throw e;
              }
            })
          }
          else {
            this.employeeHolidayListService.post(assignHolidayObj).subscribe(() => {
              var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Holiday Group has been successfully assigned to Employee",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap',
                onAdd: () => {
                },
                onRemove: function () {
                }
              };
              this.toastyService.success(toastOptions);
              this.getAllEmployee();
            })
          }
        })

      })
    }
  }

  public selectAll(event: any) {
    if (event == true) {
      this.displayEmployeeList.forEach(item => {
        item.Selected = true;
      })

    }
    else {
      this.displayEmployeeList.forEach(item => {
        item.Selected = false;
      })
    }
  }

  public resetButton() {
    this.displayEmployeeList.forEach(item => {
      item.Selected = false;
    })
    this.holidayListId = null;
    this.reportToId = null;
    this.SelectAll = false;
  }
  onPageSelect(pagination: IPagination) {
    this.SelectAll = false;
    this.pagination = pagination;
    if (this.InputSupervisor != null && this.InputSupervisor != "") {
      this.getEmployeeUnderSupervisor(this.InputSupervisor);
    }
    else {
      this.getAllEmployee();
    }
  }

}

export interface IEmployeeSearchOption {
  filterEmployeeId?: number;
  selectedEmployeeId?: number;
  showOpenModalButton?: boolean;
  showSupervisorList?: boolean;
}

