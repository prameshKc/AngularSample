import { Component, Injectable, ViewChild } from '@angular/core';
import {
    NoticeService, NoticeReceiverService, SupervisorListService,
    UserService, EmailService, CommonService,
    EmailLogService
} from '../../services/BaseService';
import {
    INotice, INoticeReceiver, IPagination,
    IUser, IODataResult, IEmail, IEmailLog, IEmployee
} from '../../models/Models';
import { IFilterViewModel, IEmployeeWithEmpPosVM } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    templateUrl: 'notice.component.html'
})
export class NoticeComponent {
  @ViewChild('sendMailModal', { static: false }) public sendMailModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirective: any;
    selectedModal: boolean;

    bankInfoList: INotice[] = [];
    InputNotice: INotice = <INotice>{};
    userId: string;
    userDetails: IUser = <IUser>{};

    svEmpList: IEmployeeWithEmpPosVM[] = [];
    employeeList: IEmployeeWithEmpPosVM[] = [];
    svDeptList: string[] = [];
    departmentList: string[] = [];
    isAdmin: boolean = false;
    currentEmpId: number;
    showList: IEmployeeWithEmpPosVM[] = [];
    showDeptList: string[] = [];

    TotalItem: string = "0";
    SelectedItem: string = "0";
    TotalCount: string;
    SendList: IEmployeeWithEmpPosVM[] = [];
    SendDeptList: string[] = [];
    InputNoticeReceiver: INoticeReceiver = <INoticeReceiver>{};
    mail: IEmail = <IEmail>{};
    //searching and sorting
    filterObj?: IFilterViewModel;
    //for pagination
    pagination?: IPagination;
    editorInput: string;
    bcc: string = "";
    sendMailToStaff: boolean = false;
    InputEmailLog: IEmailLog = <IEmailLog>{};
    isEmpWise: boolean = true;

    EmpList: IEmployee[] = [];
    EmpList2: IEmployee[] = [];

    constructor(
        public noticeService: NoticeService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig,
        public supervisorListService: SupervisorListService,
        public userService: UserService,
        private noticeReceiverService: NoticeReceiverService,
        private emailService: EmailService,
        private emailLogService: EmailLogService,
        private commonService: CommonService
    ) {
        this.userId = localStorage.getItem('UserId');
        this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: -1,
            TotalItems: 0,
            SortBy: null
        };
        this.filterObj = { Name: "", Sort: "true", SortingAttribute: "EmployeeName", SearchBy: null };
        this.getUserDetails();
    }


    public getUserDetails() {
        let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
        this.userService.get(this.userId, query).subscribe((data: IUser) => {
            this.userDetails = data;
            this.getAllEmployee(this.filterObj);
            if (
                this.userDetails.Employee.ReportTo.filter(x => x.Status == true)[0].ReportTo1 == 0 ||
                this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
                this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
            ) {
                this.isAdmin = true;
            }
            else {
                this.isAdmin = false;
            }
        })
    }

    public getAllEmployee(filterObj?: IFilterViewModel) {
        let currentEmpId;
        if (this.userDetails.Employee.ReportTo != null || typeof this.userDetails.Employee.ReportTo != undefined) {
            if (
                this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 &&
                this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 &&
                this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
            ) {
                currentEmpId = -1;
            }
            else {
                currentEmpId = this.currentEmpId;
            }
            this.supervisorListService.GetEmployeeHierarchy(currentEmpId, this.pagination, filterObj).subscribe((data: IODataResult<IEmployeeWithEmpPosVM[]>) => {
                this.employeeList = data.value;
                this.svEmpList = data.value;
                this.pagination = {
                    ItemsPerPage: -1,
                    TotalItems: data.count,
                    CurrentPage: this.pagination.CurrentPage,
                    SortBy: this.pagination.SortBy
                };
                this.getDepartmentNames();
            });
        }
    }

    public getDepartmentNames() {
        this.employeeList.forEach(item => {
            if (this.departmentList.filter(x => x.includes(item.DepartmentName)).length == 0) {
                this.departmentList.push(item.DepartmentName);
                this.svDeptList.push(item.DepartmentName);
            }
        })
        this.getCount();
    }

    public saveNotice() {
        this.InputNotice.PostedBy = this.userId;
        this.checkAdmin();
        let saveItem: INotice = Object.assign({}, this.InputNotice);

        this.noticeService.post(saveItem)
            .subscribe(() => {
                this.InputNotice = <INotice>{};
                if (this.sendMailToStaff == true) {
                    if (this.isEmpWise) {
                        this.showList.forEach((item, index) => {
                            if (item.Email != null && item.Email != 'undefined') {
                                if (this.bcc == "") {
                                    this.bcc = item.Email;
                                }
                                else {
                                    this.bcc += "," + item.Email;
                                }
                            }
                        });
                    } else {
                        this.showDeptList.forEach((dItem, index) => {
                            this.svEmpList.filter(x => x.DepartmentName == dItem).forEach(item => {
                                if (item.Email != null && item.Email != 'undefined') {
                                    if (this.bcc == "") {
                                        this.bcc = item.Email;
                                    }
                                    else {
                                        this.bcc += "," + item.Email;
                                    }
                                }
                            })
                        });
                    }
                    this.commonService.getPValue("HREmail").subscribe((ccToHR: string) => {
                        this.mail = {
                            Subject: saveItem.Subject,
                            Body: saveItem.Body,
                            ReceiverEmailAddress: ccToHR,
                            ReceiverEmailAddressCC: this.bcc
                        };
                        this.sendEmail();
                    });
                }
                this.hideModal();
                this.cancel();
                this.getCount();
                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Notice has been successfully Sent",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);
            });
    }

    public checkAdmin() {
        let count = 0;
        let result;
        this.InputNotice.NoticeReceiver = [];

        if (this.showList.length == parseInt(this.TotalCount) || this.showDeptList.length == parseInt(this.TotalCount)) {
            this.InputNoticeReceiver = {
                Recipient: 0
            }
            this.InputNotice.NoticeReceiver.push(this.InputNoticeReceiver);
        }
        else {
            if (this.isEmpWise) {
                this.showList.forEach(item => {
                    this.InputNoticeReceiver = {
                        Recipient: item.EmployeeId
                    }
                    this.InputNotice.NoticeReceiver.push(this.InputNoticeReceiver);
                });
            } else {
                this.showDeptList.forEach((dItem, index) => {
                    this.svEmpList.filter(x => x.DepartmentName == dItem).forEach(item => {
                        this.InputNoticeReceiver = {
                            Recipient: item.EmployeeId
                        }
                        this.InputNotice.NoticeReceiver.push(this.InputNoticeReceiver);
                    })
                });
            }
        }

    }

    public cancel() {
        this.InputNotice = <INotice>{};
        this.getAllEmployee(this.filterObj);
        this.showList = [];
        this.showDeptList = [];
    }

    public sendEmail() {
        this.emailService.post(this.mail).subscribe(() => {
            this.bcc = "";
            this.InputEmailLog = {
                Subject: this.mail.Subject,
                SentTo: this.mail.ReceiverEmailAddress,
                Bcc: this.mail.BCC
            }
            this.emailLogService.post(this.InputEmailLog).subscribe(() => {
                this.InputEmailLog = <IEmailLog>{};
            });
        });
    }

    public selectedItem(appendItem: any, index: number) {
        if (this.isEmpWise) {
            this.employeeList.splice(index, 1);
            this.showList.push(appendItem);
        } else {
            this.departmentList.splice(index, 1);
            this.showDeptList.push(appendItem);
        }
        this.getCount();
    }


    public cancelledItem(removeItem: any, index: number) {

        if (this.isEmpWise) {
            this.showList.splice(index, 1);
            this.employeeList.push(removeItem);
        } else {
            this.showDeptList.splice(index, 1);
            this.departmentList.push(removeItem);
        }
        this.getCount();
    }
    public copyAll(event: number) {
        if (this.isEmpWise) {
            if (event == 1) {
                this.employeeList.forEach(item => {
                    this.showList.push(item);
                });
                this.employeeList = [];
            }
            else {
                this.showList.forEach(item => {
                    this.employeeList.push(item);
                });
                this.showList = [];
            }
        } else {
            if (event == 1) {
                this.departmentList.forEach(item => {
                    this.showDeptList.push(item);
                });
                this.departmentList = [];
            }
            else {
                this.showDeptList.forEach(item => {
                    this.departmentList.push(item);
                });
                this.showDeptList = [];
            }
        }
        this.getCount();
    }

    public getCount() {
        if (this.isEmpWise) {
            this.TotalCount = this.svEmpList.length.toString();
            this.TotalItem = this.employeeList.length.toString() + "/" + this.TotalCount;
            this.SelectedItem = this.showList.length.toString() + "/" + this.TotalCount;
            this.SendList = [];
        } else {
            this.TotalCount = this.svDeptList.length.toString();
            this.TotalItem = this.departmentList.length.toString() + "/" + this.TotalCount;
            this.SelectedItem = this.showDeptList.length.toString() + "/" + this.TotalCount;
            this.SendDeptList = [];
        }
    }

    public getSelectValues(select: any) {
        if (this.isEmpWise) {
            this.SendList = select;
        } else {
            this.SendDeptList = select;
        }
    }

    public copyMultiple(event: number) {
        if (this.isEmpWise) {
            if (event == 1) {
                this.SendList.forEach(item => {
                    this.showList.push(item);
                    let index = this.employeeList.indexOf(item);
                    this.employeeList.splice(index, 1);
                });
            }
            else {
                this.SendList.forEach(item => {
                    this.employeeList.push(item);
                    let index = this.showList.indexOf(item);
                    this.showList.splice(index, 1);
                });
            }
        } else {
            if (event == 1) {
                this.SendDeptList.forEach(item => {
                    this.showDeptList.push(item);
                    let index = this.departmentList.indexOf(item);
                    this.departmentList.splice(index, 1);
                });
            }
            else {
                this.SendDeptList.forEach(item => {
                    this.departmentList.push(item);
                    let index = this.showDeptList.indexOf(item);
                    this.showDeptList.splice(index, 1);
                });
            }
        }
        this.getCount();
    }

    public openModal() {
        this.selectedModal = true;
        this.sendMailModal.show();
    }

    public hideModal() {
        this.sendMailToStaff = false;
        this.selectedModal = false;
        this.sendMailModal.hide();
    }

    public sendMail() {
        this.sendMailToStaff = true;
        this.saveNotice();
    }

    public isFormValid(bookForm: any): boolean {
        if (!bookForm.form.valid) {
            return false;
        }
        if (this.isEmpWise) {
            if (this.showList.length == 0) {
                return false;
            }
        } else {
            if (this.showDeptList.length == 0) {
                return false;
            }
        }
        
        if (this.InputNotice.Subject == "" || this.InputNotice.Subject == null) {
            return false;
        }
        if (this.InputNotice.Body == "") {
            return false;
        }
        return true;
    }

    onEditorInputChange(newHtml: string) {
        this.editorInput = newHtml;
    }
}
