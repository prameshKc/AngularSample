import { Component, ViewChild, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import {
    LeaveService, UserService, LeaveTypeService,
    LoginService, ReportToService, SupervisorListService,
    LeaveChildService, EmailService, CommonService,
    LeaveStatusService, MenuVsTemplateService, LoginReportService,
    LoginStatusService, LeavePolicyEmployeeService, LeavePolicyService,
    CompensableLeaveService, FiscalYearService
} from '../../services/BaseService';
import {
    ILeave, IPagination, IUser,
    IEmployee, ILeaveTypeSetup, ILeaveChild,
    IEmail, IODataResult,
    IMenuVsTemplate, ILoginReport, ILoginValidate,
    ILeavePolicyEmployee, ILoginStatus, ILeavePolicy,
    ICompensableLeave, IFiscalYear
} from '../../models/Models';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';
import { IFilterViewModel, ILoginReportVM, ILoginStatusVm, IFgetLeaveApproval_Result, IGetPendingLeaveApproval } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';

import { CsvService } from 'src/app/services/excel.service';

@Component({
    selector: 'leave-approval',
    templateUrl: 'leaveApproval.component.html'
})
export class LeaveApprovalComponent {
  @ViewChild('childModal', { static: false }) public childModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirective: any;
    selected: string;
    output: string;
    employeeDetails: IEmployee = <IEmployee>{};
    leaveTypeList: ILeaveTypeSetup[] = [];
    isAddLeave: boolean = false;
    isExpanded: boolean = false;
    InputLeave: ILeave = <ILeave>{};
    requiredParentId: number;
    closeForm: boolean = true;
    isEditLeave: boolean = false;
    selectedModalLoaded: boolean = false;
    deleteModalLoaded: boolean = false;
    deleteId: number;
    toggleListVsIcon: boolean = false;
    filterObj?: IFilterViewModel = <IFilterViewModel>{};
    svLoginList: ILoginReportVM[] = [];
    svLeaveList: ILeave[] = [];
    leaveList: IGetPendingLeaveApproval[] = [];
    unfilteredleaveList: IGetPendingLeaveApproval[] = [];
    qaLeaveList: ILeave[] = [];
    tempLeaveList: ILeave[] = [];
    nameList: ILeave[] = [];
    supervisorHierarchylist: IEmployee[] = [];
    allSupervisorHierarchylist: IEmployee[] = [];
    userDetails: IUser = {};
    pending: boolean = true;
    approved: boolean = false;
    rejected: boolean = false;
    InputLeaveChild: ILeaveChild[] = [];
    unfilteredleavechildList: IFgetLeaveApproval_Result[] = [];
    leaveChildList: IFgetLeaveApproval_Result[] = [];
    isLeaveToggle: boolean = false;
    mail: IEmail = <IEmail>{};
    messageFormat: string;
    newMessage: string;
    TillDate: Date;
    isApprove: boolean;
    userId: string;
    leaveDetail: string;
    parentId: number;
    pagination?: IPagination;
    isAdmin: boolean;
    currentEmpId: number;
    leaveStatusId: number;
    toggleSort: boolean = false;
    SelectAll: boolean = false;
    RejectAll: boolean = false;
    InputMenuList: IMenuVsTemplate[] = [];
    autoLeaveCount: number = 0;
    isAutoLeave: boolean = true;
    loginReportList: ILoginReport[] = [];
    updateloginReportObj: ILoginReport = <ILoginReport>{};
    updateLoginValidateObj: ILoginValidate = <ILoginValidate>{};
    loginStatus: ILoginStatusVm[] = [];
    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };
    currentDate: Date;
    inputFromDate: IInputDateVM;
    inputFromDateOptions: IDatePickerOptionsVM;
    inputToDate: IInputDateVM;
    inputToDateOptions: IDatePickerOptionsVM;
    filterByStaff: number;
    filterByFromDate: Date;
    filterByToDate: Date;
    eligibleLeaveDate: Date[] = [];
    nonEligibleLeaveDate: Date[] = [];
    unpaidLeaveId: number;
    unpaidHalfLeaveId: number;
    leaveTypeorStatusList: ILoginStatus[] = [];
    compareLoginStatusId: number;
    isHalfLeave: boolean = false;
    isFiscalYear: boolean = false;

    constructor(
        public leaveService: LeaveService,
        public userService: UserService,
        public leaveTypeService: LeaveTypeService,
        public loginService: LoginService,
        public reportToService: ReportToService,
        public supervisorListService: SupervisorListService,
        public leaveChildService: LeaveChildService,
        public emailService: EmailService,
        public commonService: CommonService,
        public leaveStatusService: LeaveStatusService,
        public menuVsTemplateService: MenuVsTemplateService,
        public loginReportService: LoginReportService,
        public loginStatusService: LoginStatusService,
        public leavePolicyEmployeeService: LeavePolicyEmployeeService,
        private datePickerFunctions: DatePickerFunctions,
        public leavePolicyService: LeavePolicyService,
        public compensableLeaveService: CompensableLeaveService,
        public fiscalYearService: FiscalYearService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig,
        private csvService: CsvService
    ) {
        this.userId = localStorage.getItem('UserId');
        this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.getLoginStatus();
        this.getLeaves();
        this.getAllLoginStatus();
        this.getUnpaidLeaveId();
        this.getUnpaidHalfLeaveId();
        this.currentDate = new Date();
        this.inputFromDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth(),
            Date: this.currentDate.getDate(),
        };
        this.inputFromDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        };
        this.inputToDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
        this.inputToDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        };
        this.filterObj = { Name: "", Sort: "false", SortingAttribute: "LeaveDate", SearchBy: "" };
        this.getCompensationId();
        this.isLeavePolicyFiscalYear();
    }

    ngOnInit() {
        this.filterObj = { Name: "", Sort: "false", SortingAttribute: "LeaveDate", SearchBy: "" };

        this.leaveTypeService.getAll().subscribe((leaveData: ILeaveTypeSetup[]) => {
            this.leaveTypeList = leaveData;
        });
    }

    public getEmployeeId() {
        let query: string = "$select=*,Employee/EmployeeId,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/Email,Employee/LoginReport/*,Employee/ReportTo/*,Employee/ReportTo/*,MenuTemplate/MenuVsTemplate/*";
        query += "&$expand=Employee,Employee/LoginReport,Employee/ReportTo,MenuTemplate/MenuVsTemplate";

        this.userService.get(localStorage.getItem("UserId"), query).subscribe((data: IUser) => {
            this.userDetails = data;
            this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
            this.employeeDetails = data.Employee;
            this.InputLeave.EmployeeId = data.EmployeeId;
            this.filter();
            if (this.employeeDetails.ReportTo != null || typeof this.employeeDetails.ReportTo != undefined) {
                if (this.employeeDetails.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
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
            }
        });
    }

    getSubEmpLeaveRequests(filterObj?: IFilterViewModel) {
        this.isLeaveToggle = false;
        let currentEmpId: number;
        if (
            this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 &&
            this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0
        ) {
            currentEmpId = -1;
        } else {
            currentEmpId = this.currentEmpId;
        }
        this.filterByStaff = this.filterByStaff ? this.filterByStaff : -1;

        this.supervisorListService.GetLeaveApprovalHierarchyForPending(
            this.pagination,
            currentEmpId,
            filterObj,
            this.filterByStaff,
            this.filterByFromDate,
            this.filterByToDate
        ).subscribe((data: IODataResult<IGetPendingLeaveApproval[]>) => {
            this.unfilteredleaveList = data.value;
            this.leaveList = data.value;
            this.pagination = {
                ItemsPerPage: this.pagination.ItemsPerPage,
                TotalItems: data.count,
                CurrentPage: this.pagination.CurrentPage,
                SortBy: this.pagination.SortBy
            };
            //this.leaveList.forEach(item => {
            //    item.tillDate = item.LeaveChild[item.LeaveChild.length - 1].LeaveDate;
            //})
        });
    }

    getSubEmpLeaveChildRequests(filterObj?: IFilterViewModel) {
        this.isLeaveToggle = true;
        let currentEmpId: number = this.currentEmpId;

        this.unfilteredleavechildList = [];
        this.leaveChildList = [];

        if (
            this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 &&
            this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0
        ) {
            currentEmpId = -1;
        }

        this.filterByStaff = this.filterByStaff ? this.filterByStaff : -1;
        this.supervisorListService.GetLeaveChildApprovalHierarchy(this.leaveStatusId, this.pagination, currentEmpId, filterObj, this.filterByStaff, this.filterByFromDate, this.filterByToDate)
            .subscribe((data: IODataResult<IFgetLeaveApproval_Result[]>) => {
                this.unfilteredleavechildList = data.value;
                this.leaveChildList = data.value;
                this.pagination = {
                    ItemsPerPage: this.pagination.ItemsPerPage,
                    TotalItems: data.count,
                    CurrentPage: this.pagination.CurrentPage,
                    SortBy: this.pagination.SortBy
                };
            });

    }

    public leaveAndFilter() {
        this.filterObj = { Name: "", Sort: "false", SortingAttribute: "LeaveDate", SearchBy: "" };
        this.reset();
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
    }

    /**
     * to open add modal
     */
    openAddModal(id: number/*, isRejected: number*/) {
        this.isAddLeave = true;
        this.isEditLeave = false;
        this.selectedModalLoaded = true;

        this.getLeave(id);
        if (this.childModal != undefined) {
            this.childModal.config.backdrop = true;
        }
        this.childModal.show();
    }

    /**
     * to open edit modal
     */
    openEditModal() {
        this.isEditLeave = true;
        this.isAddLeave = false;
        this.selectedModalLoaded = true;
        if (this.childModal != undefined) {
            this.childModal.config.backdrop = true;
        }
        this.childModal.show();
    }

    /**
     * to hide add/edit modal
     */
    public hideChildModal(): void {
        this.childModal.hide();
        this.isAddLeave = false;
        this.isEditLeave = false;
        this.InputLeave = <ILeave>{};
        this.SelectAll = false;
        this.RejectAll = false;

        this.resetForm();
    }
    /**
    * @summary : to get list of all Leave list
    * @param LeaveTypeId
    */
    getLeaves(LeaveTypeId?: number, filterObj?: IFilterViewModel) {
        this.parentId = LeaveTypeId;
    }

    filter() {
        if (this.rejected == true) {
            this.getSubEmpLeaveChildRequests(this.filterObj);
        }
        if (this.approved == true) {
            this.getSubEmpLeaveChildRequests(this.filterObj);
        }
        if (this.pending == true) {
            this.getSubEmpLeaveRequests(this.filterObj);
        }
    }

    toggleListVsIconFn() {
        this.toggleListVsIcon = !this.toggleListVsIcon;
    }

    //Add Leave
    public saveLeaveRequest() {

        let leaveObj: ILeave = Object.assign({}, this.InputLeave);
        leaveObj.IsProcess = true;
        leaveObj.LeaveTypeId = Number(leaveObj.LeaveTypeId);
        //leaveObj.ApprovedBy = localStorage.getItem('UserId');
        leaveObj.LeaveChild.forEach(item => {
            item.LeaveStatusUpdatedBy = this.userId;
            item.LeaveStatusUpdateOn = new Date();
            if (item.LeaveStatusId == 2) {
                item.ConsumedLeave = true;
                if (this.nonEligibleLeaveDate.length > 0) {
                    if (this.nonEligibleLeaveDate.filter(x => new Date(x).getTime() == new Date(item.LeaveDate).getTime()).length > 0) {
                        if (this.isHalfLeave) {
                            item.ApprovedLeaveTypeId = this.unpaidHalfLeaveId;
                        }
                        else {
                            item.ApprovedLeaveTypeId = this.unpaidLeaveId;
                        }
                    }
                }
            }
            else {
                item.ConsumedLeave = false;
            }
        })

        this.leaveService.put(this.InputLeave.LeaveId, leaveObj).subscribe(() => {
            leaveObj.LeaveChild.forEach(item => {
                this.compensableLeaveService.get(item.CompensableLeaveId).subscribe((one: ICompensableLeave) => {
                    let compensableLeaveObj: ICompensableLeave;
                    compensableLeaveObj = one;
                    compensableLeaveObj.Status = item.LeaveStatusId;
                    compensableLeaveObj.ModifiedBy = this.userId;
                    this.compensableLeaveService.put(compensableLeaveObj.CompensableLeaveId, compensableLeaveObj).
                        subscribe(() => {
                        });
                });
                if (item.LeaveStatusId == 2) {
                    this.updateLoginStatus(leaveObj.EmployeeId, item.LeaveDate, item.ApprovedLeaveTypeId, leaveObj.Remarks, leaveObj.ApproverRemarks);
                }
            });

            let leaveApplicantEmail = leaveObj.Employee.Email;

            let receiverName = "";
            if (leaveObj.Employee.FirstName != null) {
                receiverName += leaveObj.Employee.FirstName + " ";
            }
            if (leaveObj.Employee.MiddleName != null) {
                receiverName += leaveObj.Employee.MiddleName + " ";
            }
            if (leaveObj.Employee.LastName != null) {
                receiverName += leaveObj.Employee.LastName;
            }
            let remarks = leaveObj.Remarks;
            let approverRemarks = leaveObj.ApproverRemarks;

            this.getLeaveStatus(leaveObj).then((leaveDetail) => {
                this.getMessageFormat(receiverName, remarks, approverRemarks, this.leaveDetail).then((messageFormat) => {
                    this.commonService.getPValue("HREmail").subscribe((ccToHR: string) => {
                        this.mail = {
                            Subject: "Leave Request Addressed for your request",
                            Body: this.newMessage,
                            ReceiverEmailAddress: leaveApplicantEmail,
                            ReceiverEmailAddressCC: ccToHR
                        };
                        this.InputLeave = <ILeave>{};
                        this.filter();
                        this.svLeaveList = [];
                        //this.getSubEmpLeaveRequests(); // uncomment later
                        this.isAddLeave = false;
                        this.selectedModalLoaded = false;
                        this.hideChildModal();
                        this.sendEmail();
                    });
                }, err => console.log(err));
            }, err => console.log(err));
        });
    }

    public sendEmail() {
        this.emailService.post(this.mail).subscribe(() => {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Leave request has been successfully updated",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
        });
    }

    public getLeaveStatus(obj: ILeave): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.leaveDetail = " ";
            let i = 0;
            let query: string = "";
            obj.LeaveChild.forEach(item => { query += `${query === "" ? "" : " or "}Id eq ${item.Id}`; });
            query = `$expand=LeaveStatus&$filter=${query}`;
            this.leaveChildService.getAll(query).subscribe((children: ILeaveChild[]) => {
                let leaveDetail: string = "";
                children.forEach((child, index) => {
                    leaveDetail += `<tr><td>${index + 1}</td><td>${new Date(child.LeaveDate).toDateString()}</td><td>${child.LeaveStatus.Status}</td></tr>`;
                });
                this.leaveDetail = leaveDetail;
                resolve(leaveDetail);
            }, err => reject(err));
        });
    }

    public getMessageFormat(receiverName: string, remarks: string, approverRemarks: string, leaveDetail: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.commonService.getPValue("LAM").subscribe((data: string) => {
                this.messageFormat = data;
                var replacereceiverName = "{#receiver_name#}";
                var replaceremarks = "{#reason#}";
                var replaceapproverRemarks = "{#reason_from_supervisor#}";
                var replaceleaveDetail = "{#leave_detail_Records#}";

                this.newMessage = this.messageFormat.replace(replacereceiverName, receiverName);
                this.newMessage = this.newMessage.replace(replaceremarks, remarks);
                this.newMessage = this.newMessage.replace(replaceapproverRemarks, approverRemarks);
                this.newMessage = this.newMessage.replace(replaceleaveDetail, leaveDetail);
                this.newMessage = this.newMessage.replace(/(?:\r\n|\r|\n)/g, '<br />');
                resolve(this.newMessage);
            }, err => reject(err));
        });
    }

    //Get Leave    
    public getLeave(id: number) {
        let query: string = `$select=*,LoginStatus/*,LeaveChild/*,Employee/EmployeeId,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/Email`;
        query += `&$expand=Employee,LoginStatus,LeaveChild`;
        this.leaveService.get(id, query).subscribe((div: ILeave) => {
            this.InputLeave = div;
            this.InputLeave.Employee = div.Employee;
            this.InputLeave.LoginStatus = div.LoginStatus;
            this.InputLeave.EmployeeId = div.EmployeeId;
            this.InputLeave.LeaveChild = div.LeaveChild;
            this.TillDate = div.LeaveChild[div.LeaveChild.length - 1].LeaveDate;
            this.InputLeaveChild = div.LeaveChild;
            let leavePolicyQuery = ``;
            this.loginStatusService.get(this.InputLeave.LeaveTypeId).subscribe((data: ILoginStatus) => {
                if (data.IsHalfLeave == true) {
                    this.isHalfLeave = true;
                    this.commonService.getPValue('POHL').subscribe((pValue: string) => {
                        leavePolicyQuery = `$filter=LeaveId eq ${Number(pValue)} and EffectiveDate le DateTime'${this.InputLeave.LeaveDate}' &$orderby=EffectiveDate desc &$top=1`;
                        this.leavePolicyService.getAll(leavePolicyQuery).subscribe((list: ILeavePolicy[]) => {
                            if (list.length > 0) {
                                if (list[0].ServiceTypeId == 1) {
                                    let leavePolicyQueryfilter = `$filter=EmployeeId eq ${this.InputLeave.EmployeeId} and LeaveId eq ${Number(pValue)}`;
                                    this.getEligibleDate(leavePolicyQueryfilter);
                                }
                            }
                        });
                    });
                }
                else {
                    this.isHalfLeave = false;

                    leavePolicyQuery = `$filter=LeaveId eq ${this.InputLeave.LeaveTypeId} and EffectiveDate le DateTime'${this.InputLeave.LeaveDate}' &$orderby=EffectiveDate desc &$top=1`;
                    this.leavePolicyService.getAll(leavePolicyQuery).subscribe((list: ILeavePolicy[]) => {
                        if (list.length > 0) {
                            if (list[0].ServiceTypeId == 1) {
                                let leavePolicyQueryfilter = `$filter=EmployeeId eq ${this.InputLeave.EmployeeId} and LeaveId eq ${this.InputLeave.LeaveTypeId}`;
                                this.getEligibleDate(leavePolicyQueryfilter);
                            }
                        }
                    });
                }
            });
        });
    }

    public getEligibleDate(leavePolicyQueryfilter: string) {
        this.eligibleLeaveDate = [];
        this.nonEligibleLeaveDate = [];

        this.InputLeave.LeaveChild.forEach(item => {
            this.getFYName(item.LeaveDate).then((FYNameData) => {
                //let fiscalYear: string;
                let leavePolicyQuery2: string;
                let leavePolicyQuery: string;
                leavePolicyQuery2 = ` and EffectiveFrom le DateTime'${item.LeaveDate}' and CalendarYear eq '${FYNameData}'`;
                leavePolicyQuery = leavePolicyQueryfilter + leavePolicyQuery2;
                this.leavePolicyEmployeeService.getAll(leavePolicyQuery)
                    .subscribe((data: ILeavePolicyEmployee[]) => {
                        if (data.length > 0) {
                            this.eligibleLeaveDate.push(item.LeaveDate);
                        }
                        else {
                            this.nonEligibleLeaveDate.push(item.LeaveDate);
                        }
                    });
            });
        });
    }

    resetForm() {
        this.InputLeave = <ILeave>{};
    }

    compLogSelected() {
        if (this.InputLeave.LeaveTypeId == 2) {
            this.InputLeave.NumOfDays = (this.svLoginList.filter(x => x.isSelected == true).length).toString();
        } else {
            this.InputLeave.NumOfDays = "1";
        }
    }

    getLeaveChild(leaveStatusId: number) {
        this.pending = leaveStatusId == 1 ? true : false;
        this.approved = leaveStatusId == 2 ? true : false;
        this.rejected = leaveStatusId == 3 ? true : false;
        this.leaveStatusId = leaveStatusId;

        if (leaveStatusId > 1) {
            this.filterObj = { Name: "", Sort: "false", SortingAttribute: "LeaveStatusUpdateOn", SearchBy: "" };
            this.getSubEmpLeaveChildRequests(this.filterObj);
        } else {
            this.filterObj = { Name: "", Sort: "false", SortingAttribute: "LeaveDate", SearchBy: "" };
            this.getSubEmpLeaveRequests(this.filterObj);
        }

    }

    resetPagination() {
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
    }

    public selectAll(event: any, num: number) {
        if (event == true) {
            this.InputLeave.LeaveChild.forEach(item => {
                item.LeaveStatusId = num;
            });
        }
        else {
            this.InputLeave.LeaveChild.forEach(item => {
                item.LeaveStatusId = null;
            })

        }
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
        this.filter();
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        if (this.userDetails.Employee != null) {
            this.filter();
        } else {
            this.getEmployeeId();
        }
    }

    public radioBttn(statusId: number, Id: number) {
        this.InputLeave.LeaveChild.forEach(item => {
            if (item.Id == Id) {
                item.LeaveStatusId = statusId;
            }
        });
    }

    public updateLoginStatus(employeeId: number, tDate: Date, leaveTypeId: number, staffRemarks: string, approverRemarks: string) {
        var query = `$filter=EmployeeId eq ${employeeId} and TDate eq datetime'${tDate}' &$orderby=Id &$top=1`;
        this.loginReportService.getAll(query)
            .subscribe((data: ILoginReport[]) => {
                this.loginReportList = data;
                if (this.loginReportList.length > 0) {
                    let loginReportObj: ILoginReport = this.loginReportList[0];
                    this.updateloginReportObj = loginReportObj;
                    this.updateloginReportObj.LoginStatusId = leaveTypeId;
                    this.updateloginReportObj.StaffRemarks = staffRemarks;

                    this.updateLoginValidateObj.LoginId = loginReportObj.Id;
                    this.updateLoginValidateObj.UpdatedStatusId = loginReportObj.LoginStatusId;
                    this.updateLoginValidateObj.ValidatedBy = this.userId;
                    this.updateLoginValidateObj.VerificationRemarks = approverRemarks;


                    this.updateloginReportObj.LoginStatus = this.loginStatus.filter(x => x.LoginStatusId == this.updateloginReportObj.LoginStatusId)[0];
                    this.updateloginReportObj.LoginValidate = [this.updateLoginValidateObj];

                    this.loginReportService.put(this.updateloginReportObj.Id, this.updateloginReportObj).subscribe((data) => {
                        this.updateloginReportObj = <ILoginReport>{};
                        this.updateLoginValidateObj = <ILoginValidate>{};
                    });
                }
            });
    }

    public getLoginStatus() {
        this.loginStatusService.getAll().subscribe((data: ILoginStatusVm[]) => {
            this.loginStatus = data;
        })
    }

    public selectedEmployee(event: any) {
        this.filterByStaff = event.EmployeeId;
        this.filter();
    }

    public onFromDateSelect(selectedDate: IInputDateVM) {
        this.inputFromDate = selectedDate;
    }
    public onToDateSelect(selectedDate: IInputDateVM) {
        this.inputToDate = selectedDate;
    }
    public submitDateRange() {
        this.filterByFromDate = new Date(this.inputFromDate.Year, this.inputFromDate.Month - 1, this.inputFromDate.Date, 5, 45, 0, 0);
        this.filterByToDate = new Date(this.inputToDate.Year, this.inputToDate.Month - 1, this.inputToDate.Date, 5, 45, 0, 0);
        this.filter();
    }
    public reset() {
        this.filterByStaff = null;
        this.filterByFromDate = null;
        this.filterByToDate = null;
        this.inputFromDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth(),
            Date: this.currentDate.getDate(),
        };
        this.inputToDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
        this.filter();
    }

    public getUnpaidLeaveId() {
        this.commonService.getPValue("UPL").subscribe((one: string) => {
            this.unpaidLeaveId = Number(one);
        });
    }

    public getUnpaidHalfLeaveId() {
        this.commonService.getPValue("UHL").subscribe((one: string) => {
            this.unpaidHalfLeaveId = Number(one);
        });
    }

    public getAllLoginStatus() {
        let leaveQuery: string = `$filter=SType eq 1`;

        this.loginStatusService.getAll(leaveQuery).subscribe((loginStatusData: ILoginStatus[]) => {
            this.leaveTypeorStatusList = loginStatusData;
        });
    }

    public getCompensationId() {
        this.commonService.getPValue("CLT").subscribe((one: string) => {
            this.compareLoginStatusId = Number(one);
        });
    }

    public checkAllApprovedSelected(): boolean {
        if (this.InputLeave.LeaveChild.filter(x => x.LeaveStatusId == 2).length == this.InputLeave.LeaveChild.length) {
            return true;
        }
        else {
            return false;
        }
    }

    public checkAllRejectedSelected(): boolean {
        if (this.InputLeave.LeaveChild.filter(x => x.LeaveStatusId == 3).length == this.InputLeave.LeaveChild.length) {
            return true;
        }
        else {
            return false;
        }
    }

    public isLeavePolicyFiscalYear() {
        this.commonService.getPValue('ILPFY').subscribe((data: string) => {
            if (data == "true") {
                this.isFiscalYear = true;
            }
            else {
                this.isFiscalYear = false;
            }
        });
    }

    public getFYName(lvDate: Date): Promise<string> {
        return new Promise<string>((resolve) => {
            let calendarYear: Date = new Date(lvDate);
            let newBSADDate = this.datePickerFunctions.getDate(calendarYear.getFullYear(), calendarYear.getMonth() + 1, calendarYear.getDate(), 1);
            let fiscalYear: string;
            if (this.isFiscalYear == false) {
                fiscalYear = this.datePickerFunctions.getBSYear(newBSADDate.DateBS).toString();
                resolve(fiscalYear);
            }
            else {
                let leaveDateInString: string;
                var year = calendarYear.getFullYear();
                var month = calendarYear.getMonth() + 1;
                var date = calendarYear.getDate();
                var dateInString = date.toString();
                var monthInString = month.toString();

                if (date < 10) {
                    dateInString = "0" + dateInString;
                }
                if (month < 10) {
                    monthInString = "0" + monthInString;
                }
                leaveDateInString = year.toString() + "-" + monthInString + "-" + dateInString;
                let query = `$filter=StartDT le DateTime'${leaveDateInString}' and EndDt ge DateTime'${leaveDateInString}'`;
                this.fiscalYearService.getAll(query).subscribe((list: IFiscalYear[]) => {
                    fiscalYear = list[0].FyName;
                    resolve(fiscalYear);
                });
            }
        });
    }
    public isFormValid(bookForm: any): boolean {
        if (!bookForm.form.valid) {
            return false;
        }
        if (this.InputLeave.LeaveChild != null) {
            if (this.InputLeave.LeaveChild.filter(x => x.LeaveStatusId == 1 || x.LeaveStatusId == null).length > 0) {
                return false;
            }
        }
        return true;
    }

    csvLoading: boolean = false;
    exportToCSV() {
        var currentEmpId = -1;
        this.csvLoading = true;
        let pagination: IPagination = {
            ItemsPerPage: 10000,
            CurrentPage: 1,
            TotalItems: 0
        }
        if (!(this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0)) {
            currentEmpId = -1;
        }
        this.supervisorListService
            .GetLeaveChildApprovalHierarchy(this.leaveStatusId, pagination, currentEmpId, this.filterObj, this.filterByStaff, this.filterByFromDate, this.filterByToDate)
            .subscribe((data: IODataResult<IFgetLeaveApproval_Result[]>) => {
                console.log(data.value);
                this.csvService.download(data.value, `${this.approved == true ? 'Approved' : 'Rejected'} Leave Report- From:${this.filterByFromDate}, Till: ${this.filterByToDate}`)
                this.csvLoading = false;
            }, (err) => {
                this.csvLoading = false;
            });
    }
}

