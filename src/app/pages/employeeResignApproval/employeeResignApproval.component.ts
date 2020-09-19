import { Component, Injectable, ViewChild } from '@angular/core';
import {
    EmployeeResignService, EmployeeService, UserService,
    EmployeeStatusHistoryService, SupervisorListService, MenuVsTemplateService,
    ResignedEmployeeReportService
} from '../../services/BaseService';
import {
    IEmployeeResign, IPagination, IEmployee,
    IUser, IEmployeeStatusHistory, IODataResult,
    IMenuVsTemplate, IFEmployeeResign
} from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';

@Component({
    selector:'employeeResignApproval',
    templateUrl: 'employeeResignApproval.component.html'
})
export class EmployeeResignApprovalComponent {
    //employeeResignList: IEmployeeResign[] = [];
    employeeResignList: IFEmployeeResign[] = [];
    InputEmployeeResign: IEmployeeResign = <IEmployeeResign>{};
    newEmpResignList: IEmployeeResign[] = [];
    InputEmployeeStatusHistory: IEmployeeStatusHistory = <IEmployeeStatusHistory>{};
    ResignList: IEmployeeResign[] = [];
    editEmployeeStatus: IEmployee = <IEmployee>{};

    currentDate: Date = new Date();
    //searching and sorting
    filterObj?: IFilterViewModel;
    employeeName: string;
    userId: string;
    userName: string;
    toggleSort: boolean = false;
    approved: boolean = false;
    rejected: boolean = false;
    pending: boolean = true;
    userDetails: IUser = <IUser>{};
    supervisorHierarchylist: IEmployee[] = [];
    allSupervisorHierarchylist: IEmployee[] = [];
    requiredEmployeeId: number;
    selfResignApproval: boolean;
    isAdmin: boolean;
    approvalId: number;
    currentEmpId: number;

    //for pagination
    pagination?: IPagination;

    //date picker inputs.
    inputEffectiveFromDate: IInputDateVM;
    inputDateOptions: IDatePickerOptionsVM;

    InputMenuList: IMenuVsTemplate[] = [];
    autoResignCount: number = 0;
    isAutoResign: boolean = true;

    //modl
  @ViewChild('Modal', { static: false }) public Modal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    constructor(
        public employeeResignService: EmployeeResignService,
        public employeeService: EmployeeService,
        public userService: UserService,
        public employeeStatusHistoryService: EmployeeStatusHistoryService,
        public supervisorListService: SupervisorListService,
        public menuVsTemplateService: MenuVsTemplateService,
        private resignedEmployeeReportService: ResignedEmployeeReportService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
        this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
        this.getEmployeeId();
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        //this.checkIsAdmin();
        //this.getAllEmployeeResign();
        this.currentDate.setHours(0, 0, 0, 0);

        this.inputEffectiveFromDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
        this.inputDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        };
    }

    public filterEmployeeResign() {
        this.getAllEmployeeResign(this.filterObj);
    }

    public employeeResignAndFilter() {
        this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
        this.filterEmployeeResign();
    }

    public getEmployeeId() {
        var query = "$expand=Employee,Employee/ReportTo,MenuTemplate/MenuVsTemplate";
        this.userService.get(this.userId, query).subscribe((data: IUser) => {
            this.userDetails = data;
            this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
            this.requiredEmployeeId = data.EmployeeId;
            let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
            this.getAllEmployeeResign(this.filterObj);
            if (currentReportTo.ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
                this.isAdmin = true;
            }
            else {
                if (this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
                    this.isAdmin = true;
                }
                else {
                    this.isAdmin = false;
                }
            }
        })
    }

    //getAll
    public getAllEmployeeResign(filterObj?: IFilterViewModel) {
        if (this.pending == true) {
            this.approvalId = 0;
        }
        if (this.approved == true) {
            this.approvalId = 1;
        }
        if (this.rejected == true) {
            this.approvalId = 2;
        }
        if (this.userDetails.Employee.ReportTo != null || typeof this.userDetails.Employee.ReportTo != undefined) {
            if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
                this.resignedEmployeeReportService.GetAllResignedEmployee(this.pagination, filterObj, 1, this.approvalId).subscribe((data: IODataResult<IFEmployeeResign[]>) => {
                    this.employeeResignList = data.value;
                    this.pagination = {
                        ItemsPerPage: this.pagination.ItemsPerPage,
                        TotalItems: data.count,
                        CurrentPage: this.pagination.CurrentPage,
                        SortBy: this.pagination.SortBy
                    };
                });
            }
            else {
                this.resignedEmployeeReportService.GetResignedEmployeeUnderManager(this.currentEmpId, this.pagination, filterObj, 1, this.approvalId).subscribe((data: IODataResult<IFEmployeeResign[]>) => {
                    this.employeeResignList = data.value;
                    this.pagination = {
                        ItemsPerPage: this.pagination.ItemsPerPage,
                        TotalItems: data.count,
                        CurrentPage: this.pagination.CurrentPage,
                        SortBy: this.pagination.SortBy
                    };
                });
            }
        }
    }

    public employeeResignApproval(id: number) {
        var query = "$expand=Employee";
        this.employeeName = "";
        this.userName = "";

        this.employeeResignService.get(id, query)
            .subscribe((one: IEmployeeResign) => {
                if (one.Employee.FirstName != null) {
                    this.employeeName += one.Employee.FirstName + " ";
                }
                if (one.Employee.MiddleName != null) {
                    this.employeeName += one.Employee.MiddleName + " ";
                }
                if (one.Employee.LastName != null) {
                    this.employeeName += one.Employee.LastName;
                }

                this.InputEmployeeResign = one;
                if (this.InputEmployeeResign.EmployeeId == this.requiredEmployeeId) {
                    this.selfResignApproval = true;
                }
                else {
                    this.selfResignApproval = false;
                }
                let date = new Date(this.InputEmployeeResign.EffectiveFrom);
                this.inputEffectiveFromDate = {
                    Year: date.getFullYear(),
                    Month: date.getMonth() + 1,
                    Date: date.getDate()
                };
            });
        this.openModal();
    }

    public openModal() {
        this.selectedModalLoaded = true;
        this.Modal.show();
    }

    public hideModal() {
        this.selectedModalLoaded = false;
        this.InputEmployeeResign = <IEmployeeResign>{};
        this.Modal.hide();
    }

    public editEmployeeResign() {
        this.InputEmployeeResign.ApprovedBy = this.userId;
        this.InputEmployeeResign.ApprovedOn = new Date();
        let saveItem: IEmployeeResign = Object.assign({}, this.InputEmployeeResign);
        this.employeeResignService.put(saveItem.Id, saveItem)
            .subscribe(() => {
                this.employeeStatusChange().then((data) => {
                    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "ApprovedOn", SearchBy: null };
                    this.hideModal();
                    this.getAllEmployeeResign(this.filterObj);
                    if (this.InputEmployeeResign.Approval == 1) {
                        var toastOptions: ToastOptions = {
                            title: "Approval",
                            msg: "Employee Resignation has been Approved",
                            showClose: true,
                            timeout: 5000,
                            theme: 'bootstrap'
                        };
                        this.toastyService.success(toastOptions);
                    }
                    else {
                        var toastOptions: ToastOptions = {
                            title: "Approval",
                            msg: "Employee Resignation has been Rejected",
                            showClose: true,
                            timeout: 5000,
                            theme: 'bootstrap'
                        };
                        this.toastyService.success(toastOptions);
                    }
                });


            });
    }

    public employeeStatusChange(): Promise<string> {
        return new Promise<string>((resolve) => {
            this.InputEmployeeStatusHistory.EmployeeId = this.InputEmployeeResign.EmployeeId;
            if (this.InputEmployeeResign.Approval == 1) {
                this.InputEmployeeStatusHistory.Status = 3;
            }
            else {
                this.InputEmployeeStatusHistory.Status = 1;
            }
            this.InputEmployeeStatusHistory.ChangedBy = this.userId;
            let saveItem: IEmployeeStatusHistory = Object.assign({}, this.InputEmployeeStatusHistory);

            this.employeeStatusHistoryService.post(saveItem)
                .subscribe(() => {
                    this.employeeStatusChangeInEmpTable(this.InputEmployeeResign.EmployeeId);
                    resolve("Success");
                });
        });
    }

    public employeeStatusChangeInEmpTable(id: number) {
        this.employeeService.get(id)
            .subscribe((one: IEmployee) => {
                this.editEmployeeStatus = one;
                this.editEmployeeStatus.Status = this.InputEmployeeStatusHistory.Status;
                this.employeeEdit();
            });

    }

    public employeeEdit() {
        this.employeeService.put(this.editEmployeeStatus.EmployeeId, this.editEmployeeStatus)
            .subscribe(() => { });
    }

    public sortBy(sortBy: string) {
        this.toggleSort = !this.toggleSort;
        if (this.toggleSort == true) {
            this.filterObj.Sort = "true";
        }
        else {
            this.filterObj.Sort = "false";
        }

        this.filterObj.SortingAttribute = sortBy;
        this.getAllEmployeeResign(this.filterObj);
    }

    public getEmployeeApproved() {
        this.approved = true;
        this.pending = false;
        this.rejected = false;
        this.getAllEmployeeResign(this.filterObj);
    }

    public getEmployeeRejected() {
        this.approved = false;
        this.pending = false;
        this.rejected = true;
        this.getAllEmployeeResign(this.filterObj);
    }

    public getEmployeePending() {
        this.approved = false;
        this.pending = true;
        this.rejected = false;
        this.getAllEmployeeResign(this.filterObj);
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        if (this.userDetails.Employee != null) {
            this.getAllEmployeeResign(this.filterObj);
        } else {
            this.getEmployeeId();
        }
    }

    public onEffectiveDateSelect(selectedDate: IInputDateVM) {
        this.InputEmployeeResign.EffectiveFrom = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date, 5, 45, 0, 0);
    }

    //public checkIsAdmin() {
    //    var query = "$expand=MenuTemplate/User,MenuTemplate/User/Employee&$filter=MenuId eq 1048";

    //    this.menuVsTemplateService.getAll(query)
    //        .subscribe((list: IMenuVsTemplate[]) => {
    //            this.InputMenuList = list;

    //            this.InputMenuList.forEach(item => {
    //                item.MenuTemplate.User.forEach(userItem => {
    //                    if (userItem.EmployeeId == this.currentEmpId) {
    //                        this.autoResignCount = this.autoResignCount + 1;
    //                    }
    //                })
    //            })

    //            if (this.autoResignCount > 0) {
    //                this.isAutoResign = true;
    //            }
    //            else {
    //                this.isAutoResign = false;
    //            }
    //        });
    //}
}
