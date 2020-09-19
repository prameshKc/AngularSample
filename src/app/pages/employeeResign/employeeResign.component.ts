import { Component, Injectable, ViewChild,Input } from '@angular/core';
import {
    EmployeeResignService, EmployeeService, UserService,
    EmployeeStatusHistoryService, MenuVsTemplateService,
    EmailService, EmailLogService, CommonService
} from '../../services/BaseService';
import {
    IEmployeeResign, IEmployee,
    IUser, IEmployeeStatusHistory, IMenuVsTemplate,
    IEmail, IEmailLog
} from '../../models/Models';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';

@Component({
    selector:'EmployeeResign',
    templateUrl: 'employeeResign.component.html'
})
export class EmployeeResignComponent {
    @Input() isAutoResign: boolean = false;

  @ViewChild('resignModal', { static: false }) public resignModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    userId: string;
    employeeId: number;
    InputEmployeeResign: IEmployeeResign = <IEmployeeResign>{};
    InputMenuList: IMenuVsTemplate[] = [];
    currentDate: Date = new Date();
    EffectiveFromLTCurrentDate: boolean = false;
    userDetail: IUser = <IUser>{};
    employeeName: string;
    InputEmployeeStatusHistory: IEmployeeStatusHistory = <IEmployeeStatusHistory>{};
    requiredED: boolean = false;
    editEmployeeStatus: IEmployee = <IEmployee>{};

    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };

    //date picker inputs.
    inputEffectiveFromDate: IInputDateVM;
    inputDateOptions: IDatePickerOptionsVM;
    mail: IEmail = <IEmail>{};
    InputEmailLog: IEmailLog = <IEmailLog>{};
    reportToId: number;
    subordinateEmpId: number;
    duplicateEntry: boolean = false;
    isEmpRequired: boolean = false;

    constructor(
        public employeeResignService: EmployeeResignService,
        public employeeService: EmployeeService,
        public userService: UserService,
        public employeeStatusHistoryService: EmployeeStatusHistoryService,
        private emailService: EmailService,
        private emailLogService: EmailLogService,
        private commonService: CommonService,
        public menuVsTemplateService: MenuVsTemplateService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.employeeId = parseInt(localStorage.getItem('EmployeeId'));
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
        if (this.isAutoResign == false) {
            this.getEmployeeByUser();
            this.alreadyApplied(this.employeeId);
        }
    }

    public getEmployeeByUser() {
        var query = "$expand=Employee";
        this.employeeName = "";
        this.userService.get(this.userId, query)
            .subscribe((one: IUser) => {
                this.userDetail = one;
                if (this.userDetail.Employee.FirstName != null) {
                    this.employeeName += this.userDetail.Employee.FirstName + " ";
                }
                if (this.userDetail.Employee.MiddleName != null) {
                    this.employeeName += this.userDetail.Employee.MiddleName + " ";
                }
                if (this.userDetail.Employee.LastName != null) {
                    this.employeeName += this.userDetail.Employee.LastName;
                }
                this.InputEmployeeResign.EmployeeId = this.userDetail.EmployeeId;
            });
    }

    public save() {
        if (this.isAutoResign == true) {
            if (this.InputEmployeeResign.EmployeeId == this.employeeId) {
                this.saveEmployeeResign();
            } 
            else {
                this.saveAutoEmployeeResign();
            }
        }
        else {
            this.saveEmployeeResign();
        }
    }

    public saveEmployeeResign() {
        let saveItem: IEmployeeResign = Object.assign({}, this.InputEmployeeResign);
        let text = this.InputEmployeeResign.Remarks;
        saveItem.Approval = 0;

        //this.InputEmployeeResign.Remarks
        if (this.InputEmployeeResign.EffectiveFrom == null) {
            this.requiredED = true;
        }
        else {
            this.employeeResignService.post(saveItem)
                .subscribe(() => {
                    const query = "$expand=Employee,Employee/ReportTo";
                    this.userService.get(this.userId, query).subscribe((userData: IUser) => {
                        this.reportToId = userData.Employee.ReportTo.filter(x => x.Status == true)[0].ReportTo1;
                        this.getReportTo(this.reportToId, saveItem.Remarks).then((data) => {
                            if (data == true) {
                                this.InputEmployeeResign = <IEmployeeResign>{};
                                this.inputEffectiveFromDate = <IInputDateVM>{
                                    Year: this.currentDate.getFullYear(),
                                    Month: this.currentDate.getMonth() + 1,
                                    Date: this.currentDate.getDate(),
                                };
                                var toastOptions: ToastOptions = {
                                    title: "Success",
                                    msg: "Employee Resignation has been successfully sent",
                                    showClose: true,
                                    timeout: 5000,
                                    theme: 'bootstrap'
                                };
                                this.toastyService.success(toastOptions);
                                this.alreadyApplied(userData.EmployeeId);
                            }
                        });
                    })
                });
        }
    }

    public saveAutoEmployeeResign() {
        this.InputEmployeeResign.Approval = 1;
        this.InputEmployeeResign.ApprovedOn = new Date();
        this.InputEmployeeResign.ApprovedBy = this.userId;

        let saveItem: IEmployeeResign = Object.assign({}, this.InputEmployeeResign);
        let text = this.InputEmployeeResign.Remarks;
        saveItem.Remarks = text;

        if (this.InputEmployeeResign.EffectiveFrom == null) {
            this.requiredED = true;
        }
        else {
            this.requiredED = false;
            this.employeeResignService.post(saveItem)
                .subscribe(() => {
                    this.employeeStatusChange().then((data) => {
                        if (this.isAutoResign == true) {
                            this.hideModal();
                        }
                        let query = `$expand=Employee,Employee/ReportTo &$filter=EmployeeId eq ${this.subordinateEmpId}`;
                        this.userService.getAll(query).subscribe((list: IUser[]) => {
                            this.reportToId = list[0].Employee.ReportTo.filter(x => x.Status == true)[0].ReportTo1;
                            this.getReportTo(this.reportToId, saveItem.Remarks).then((data) => {
                                if (data == true) {
                                    this.InputEmployeeResign = <IEmployeeResign>{};
                                    this.inputEffectiveFromDate = <IInputDateVM>{
                                        Year: this.currentDate.getFullYear(),
                                        Month: this.currentDate.getMonth() + 1,
                                        Date: this.currentDate.getDate(),
                                    };
                                    var toastOptions: ToastOptions = {
                                        title: "Success",
                                        msg: "Employee Resignation has been successfully sent",
                                        showClose: true,
                                        timeout: 5000,
                                        theme: 'bootstrap'
                                    };
                                    this.toastyService.success(toastOptions);
                                }
                            });
                        });
                    });                  
                });
        }
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

    public cancel() {
        this.InputEmployeeResign = <IEmployeeResign>{};
        this.inputEffectiveFromDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
    }

    public onEffectiveFromSelect(selectedDate: IInputDateVM) {
        this.inputEffectiveFromDate = selectedDate;
        var date = new Date(this.inputEffectiveFromDate.Year, this.inputEffectiveFromDate.Month - 1, this.inputEffectiveFromDate.Date);
        
        this.InputEmployeeResign.EffectiveFrom = new Date(this.inputEffectiveFromDate.Year, this.inputEffectiveFromDate.Month - 1, this.inputEffectiveFromDate.Date, 5, 45, 0, 0);
        this.requiredED = false;
    }

    public selectedEmployee(event: any) {
        this.isEmpRequired = true;
        this.InputEmployeeResign.EmployeeId = event.EmployeeId;
        this.subordinateEmpId = event.EmployeeId;
        this.alreadyApplied(this.InputEmployeeResign.EmployeeId);
    }  

    public openAddModal() {
        this.duplicateEntry = false;  
        this.isEmpRequired = false;   
        this.selectedModalLoaded = true;
        this.resignModal.show();
    }

    public hideModal() {
        this.duplicateEntry = false;
        this.isEmpRequired = false; 
        this.cancel();
        this.selectedModalLoaded = false;
        this.resignModal.hide();        
    }
    public getReportTo(reportId: number, remarks: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            //let query: string = '$select=Email';

            //this.employeeService.get(reportId, query).subscribe((data: IEmployee) => {
            //    var supervisorEmail = data.Email;
            //    this.commonService.getPValue("HREmail").subscribe((ccToHR: string) => {
            //        this.mail = {
            //            Subject: "Resignation",
            //            Body: remarks,
            //            ReceiverEmailAddress: supervisorEmail,
            //            ReceiverEmailAddressCC: ccToHR
            //        };
            //        this.sendEmail(this.mail).then((data) => {
            //            if (data == true) {
            //                resolve(true);
            //            }
            //        });
            //    });
            //});
                            resolve(true);
        });
    }
    public sendEmail(mail:IEmail):Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            //this.emailService.post(mail).subscribe(() => {
            //    this.InputEmailLog = {
            //        Subject: mail.Subject,
            //        SentTo: mail.ReceiverEmailAddress
            //    }
            //    this.emailLogService.post(this.InputEmailLog).subscribe(() => {
            //        this.InputEmailLog = <IEmailLog>{};
            //        resolve(true);
            //    });
            //});
                    resolve(true);
        });
        
    }

    public alreadyApplied(empId:number) {
        let query:string;
        if (this.isAutoResign == true) {
            query = `$filter=EmployeeId eq ${this.InputEmployeeResign.EmployeeId }`;
        }
        else {
            query = `$filter=EmployeeId eq ${this.employeeId}`;
        }
        
        this.employeeResignService.getAll(query).subscribe((list: IEmployeeResign[]) => {
            if (list.filter(x => x.Approval == 1 || x.Approval == 0).length > 0) {
                this.duplicateEntry = true;
            }
            else {
                this.duplicateEntry = false;
            }
        });
    }
}
