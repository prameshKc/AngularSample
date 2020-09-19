import { ToastyService, ToastOptions } from 'ngx-toasty';
import { Component, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { IDatePickerOptionsVM, IInputDateVM } from 'src/app/shared/datepicker/models/datepickerVM';
import { IEmployeeSearchOption } from 'src/app/shared/employeeSearch/employeeSearch.component';
import { IEmployee_OutsideMovement, IInfoOutSideMovement, IInfoOutSideTrnsportationType, IEmployee, IReportTo, IEmail } from 'src/app/models/Models';
import {
  Employee_OutsideMovementService, InfoOutSideMovementService,
  InfoOutSideTrnsportationTypeService, EmployeeService, ReportToService,
  EmailService, CommonService
} from 'src/app/services/BaseService';
import { map, catchError } from 'rxjs/operators'

@Component({
  selector: 'outside-movement-form',
  templateUrl: './outsideMovementForm.html'
})
export class OutsideMovementFormComponent {
  modalRef: BsModalRef;

  @Input() IsAdmin: boolean;      // is this for admin
  @Input() EditId: number;        // Primary Id for editing and approving purpose only
  @Input() FormType?: number;     // 0 = Self Approval, 1 = Add, 2 = Edit, 3 = Approval, 4 = Reject

  @Output() Refresh: EventEmitter<number> = new EventEmitter<number>();

  InputForm: IEmployee_OutsideMovement = <IEmployee_OutsideMovement>{};
  infoOMTList: IInfoOutSideMovement[];
  infoTrnsTList: IInfoOutSideTrnsportationType[];
  reportToAdmin: boolean = false;

  //date picker options
  defaultOptionsFrom: IDatePickerOptionsVM = <IDatePickerOptionsVM>{
    closeOnDateSelect: true
  }
  defaultOptionsTo: IDatePickerOptionsVM = <IDatePickerOptionsVM>{
    closeOnDateSelect: true
  }

  //Employee Search options
  selectEmployeeOptions: IEmployeeSearchOption = {
    showOpenModalButton: true
  }

  fromDP: IInputDateVM;
  toDP: IInputDateVM;
  tempfromDP: IInputDateVM;
  tempNoOfDays: number;
  isValid: boolean = true;

  constructor(
    private modalService: BsModalService,
    private empOMService: Employee_OutsideMovementService,
    private empService: EmployeeService,
    private reportToService: ReportToService,
    private infoOMTService: InfoOutSideMovementService,
    private infoOMTTService: InfoOutSideTrnsportationTypeService,
    private toastyService: ToastyService,
    private commonService: CommonService,
    private emailService: EmailService
  ) {
    this.getEmployeeDetails();
  }

  ngOnInit() {
    this.InputForm = <IEmployee_OutsideMovement>{};
    if (this.FormType == 1) {
      this.InputForm.EmployeeId = Number(localStorage.getItem('EmployeeId'));
      this.getEMReportTo();
    }
    this.initializeInput();
  }

  ngDoCheck() {
  }

  getEmployeeDetails() {
    let currEmpId = Number(localStorage.getItem('EmployeeId'));
    let query: string = '$expand=ReportTo'
    this.empService.get(currEmpId, query).subscribe(data => {
      let reportToList: IReportTo[] = data.ReportTo;
      reportToList.reverse();
      if (reportToList.length != 0) {
        reportToList = reportToList.filter(x => x.Status == true);
        this.reportTo = reportToList[0].ReportTo1;
        if (reportToList[0].ReportTo1 != 0) {
          this.reportToAdmin = true;
          this.selectEmployeeOptions.filterEmployeeId = currEmpId;
        }
      } else {
        this.selectEmployeeOptions.filterEmployeeId = currEmpId;
      }
    })
  }

  openModal(template: TemplateRef<any>) {
    this.reportTo = null;
    this.getOMTypes();
    this.getOMTrnsTypes();
    if (this.FormType != 1) {
      this.getOMData();
    }
    this.modalRef = this.modalService.show(template, {
      keyboard: false,
      ignoreBackdropClick: true
    });
  }

  hideModal() {
    this.ngOnInit();
    this.modalRef.hide();
  }

  getOMData() {
    if (this.EditId != null) {
      this.empOMService.get(this.EditId).subscribe(data => {
        this.InputForm = data;
        this.InputForm.EmployeeId = data.EmployeeId;
        this.InputForm.RequestAdvance = parseFloat(data.RequestAdvance.toString()).toFixed(2);

        this.InputForm.ApprovedAdvance = this.InputForm.RequestAdvance;
        this.fromDP = {
          Year: new Date(data.From).getFullYear(),
          Month: new Date(data.From).getMonth(),
          Date: new Date(data.From).getDate()
        }
        this.toDP = {
          Year: new Date(data.To).getFullYear(),
          Month: new Date(data.To).getMonth(),
          Date: new Date(data.To).getDate()
        }
        this.getEMReportTo();
      });
    }
  }

  reportTo: number;
  getEMReportTo() {
    const query = `$filter=EmployeeId eq ${this.InputForm.EmployeeId} and Status ne false`;
    const subscription = this.reportToService.getAll(query).subscribe(data => {
      let reportToList: IReportTo[] = data;
      reportToList.reverse();
      if (reportToList.length != 0) {
        this.reportTo = reportToList[0].ReportTo1;
      }
    }, (msg) => { console.log('Error Getting Location: ', msg); });
    setTimeout(() => { subscription.unsubscribe(); }, 10000);
  }

  getOMTypes() {
    const subscription = this.infoOMTService.getAll().subscribe(data => {
      if (this.FormType == 1) {
        this.InputForm.TType = data[0].Id;
      }
      this.infoOMTList = data;
    }, (msg) => { console.log('Error Getting Location: ', msg); });
    setTimeout(() => { subscription.unsubscribe(); }, 10000);
  }

  getOMTrnsTypes() {
    const subscription = this.infoOMTTService.getAll().subscribe(data => {
      if (this.FormType == 1) {
        this.InputForm.TransportId = data[0].Id;
      }
      this.infoTrnsTList = data;
    }, (msg) => { console.log('Error Getting Location: ', msg); });
    setTimeout(() => {
      if (subscription) {
        subscription.unsubscribe();
      }
    }, 30000);
  }

  initializeInput() {
    this.InputForm.NoOfDays = 1;

    const currentFDate = new Date();
    this.fromDP = {
      Year: currentFDate.getFullYear(),
      Month: currentFDate.getMonth() + 1,
      Date: currentFDate.getDate(),
    }
    this.setFromDate(this.fromDP);

    const currentTDate = new Date(currentFDate.getFullYear(), currentFDate.getMonth(), currentFDate.getDate() + this.InputForm.NoOfDays);
    this.toDP = {
      Year: currentTDate.getFullYear(),
      Month: currentTDate.getMonth() + 1,
      Date: currentTDate.getDate()
    }
    this.setToDate(this.toDP);
  }

  selectedDate(date: IInputDateVM, flag: string) {
    if (flag == 'From') {
      this.setFromDate(date);
    } else {
      this.setToDate(date);
    }
    this.countDays();
  }

  selectedDateTo(date: IInputDateVM) {
    this.setToDate(date);
  }

  countDays() {
    let timeDiff = this.InputForm.To.getTime() - this.InputForm.From.getTime();
    var days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    this.InputForm.NoOfDays = days;
  }

  setFromDate(date: IInputDateVM) {
    this.fromDP = date
    this.InputForm.From = new Date(date.Year, date.Month - 1, date.Date, 0, 0, 0);
    // this.InputForm.From = `${this.fromDP.Date < 10 ? '0' : ''}${this.fromDP.Date}-${this.fromDP.Month < 10 ? '0' : ''}${this.fromDP.Month}-${this.fromDP.Year}`;
  }

  setToDate(date: IInputDateVM) {
    this.toDP = date
    this.InputForm.To = new Date(date.Year, date.Month - 1, date.Date, 0, 0, 0);
    // this.InputForm.To = `${this.toDP.Date < 10 ? '0' : ''}${this.toDP.Date}-${this.toDP.Month < 10 ? '0' : ''}${this.toDP.Month}-${this.toDP.Year}`;
  }

  //Form submission
  submitForm() {
    let id;
    if (this.FormType == 1 || this.FormType == 2) {
      this.InputForm.EmployeeId = Number(localStorage.getItem('EmployeeId'));
    }

    if (this.FormType == 0 || this.FormType == 3 || this.FormType == 4) {
      this.InputForm.ApprovedBy = localStorage.getItem('UserId');
    }

    if (this.FormType == 1) {
      this.InputForm.status = 1;
    } else if (this.FormType == 0 || this.FormType == 3) {
      this.InputForm.status = 2;
    } else if (this.FormType == 4) {
      this.InputForm.status = 3;
    }
    //id = this.InputForm.status;

    let subscription: any;
    if (this.FormType <= 1) {
      this.InputForm.Id = 0;
      this.InputForm.PostedBy = localStorage.getItem('UserId');
      subscription = this.empOMService.post(this.InputForm);
    } else {
      subscription = this.empOMService.put(this.EditId, this.InputForm)
    }
    subscription.subscribe((data) => {
      this.toastyService.success(<ToastOptions>{
        title: `Success`,
        msg: `Process completed successfully.`,
        timeout: 5000
      });
      this.emailSetup(data);
    }, (err) => {
      console.log('Error:', err);

      this.toastyService.error(<ToastOptions>{
        title: `Error!`,
        msg: `Something went wrong. Please try again later.`,
        timeout: 5000
      })
    })

    setTimeout(() => {
      if (subscription) subscription.unsubscribe();
    }, 30000);
  }

  private async emailSetup(data: IEmployee_OutsideMovement) {
    var pcode = (this.FormType == 3 || this.FormType == 4) ? 'OMAE' : 'OMRE';

    var senderName = await this.empService.get(this.InputForm.EmployeeId, '$select=FirstName,LastName').pipe(map(emp => {
      return `${emp.FirstName} ${emp.MiddleName ? emp.MiddleName + ' ' : ''}${emp.LastName}`
    })).toPromise();

    this.getMessageFormat(senderName, data.From, data.To, data.NoOfDays.toString(), data.Remarks, pcode).then(() => {
      this.setReportToEmail();
    });
  }

  mail: IEmail;
  setReportToEmail() {
    let query: string = '$select=Email,';
    this.empService.get(this.reportTo, query).subscribe((data: IEmployee) => {
      var supervisorEmail = data.Email;
      this.commonService.getPValue("HREmail").subscribe((ccToHR: string) => {

        this.mail = {
          Subject: "Leave Request",
          Body: this.newMessage,
          ReceiverEmailAddress: supervisorEmail,
          ReceiverEmailAddressCC: ccToHR
        };

        this.sendEmail(this.mail);
      });
    })
  }

  emailErrorCount: number = 0;
  public sendEmail(email: IEmail) {
    this.emailService.post(email).subscribe(() => {
      this.emailErrorCount = 0;
      var toastOptions: ToastOptions = {
        title: "Success",
        msg: "Email was sent successfully.",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.success(toastOptions);
      this.emitResult(this.InputForm.status);
    }, (err) => {
      this.emailErrorCount++;
      var toastOptions: ToastOptions = {
        title: "Error",
        msg: "Email could not sent. Re-attempting to send email...",
        showClose: true,
        timeout: 6000,
        theme: 'bootstrap',
        onRemove: () => {
          this.sendEmail(email);
        }
      };
      if (this.emailErrorCount > 2) {
        toastOptions.msg = "Sorry, email could not be sent after multiple attempts.";
        this.emitResult(this.InputForm.status);
      }
      this.toastyService.error(toastOptions);
    })
  }

  emitResult(id: number) {
    this.Refresh.emit(id);
    this.hideModal();
  }

  //email setup
  messageFormat: string;
  newMessage: string;
  private getMessageFormat(senderName: string, requestedDate: string, tillDate: string, numOfDays: string, remarks: string, pcode: string): Promise<any> {
    return this.commonService.getPValue(pcode).pipe(map((data: string) => {
      this.messageFormat = data;
      var replacesenderName = "{#sender_name#}";
      var replacerequestedDate = "{#request_date#}";
      var replacetillDate = "{#till_date#}";
      var replacenumOfDays = "{#NOD#}";
      var replaceremarks = "{#reason#}"; 0

      this.newMessage = this.messageFormat.replace(replacesenderName, senderName);
      this.newMessage = this.newMessage.replace(replacerequestedDate, requestedDate);
      this.newMessage = this.newMessage.replace(replacetillDate, tillDate);
      this.newMessage = this.newMessage.replace(replacenumOfDays, numOfDays);
      this.newMessage = this.newMessage.replace(replaceremarks, remarks);
      this.newMessage = this.newMessage.replace(/(?:\r\n|\r|\n)/g, '<br />');
    })).toPromise();
  }

  checkMoney(stringNum: string) {
    var regex = /^\d+(?:\.\d{0,2})$/;

    if (this.InputForm.RequestAdvance && this.InputForm.ApprovedAdvance) {
      if (!regex.test(this.InputForm.RequestAdvance) || !regex.test(this.InputForm.ApprovedAdvance)) {
        this.isValid = false;
      } else {
        this.isValid = true;
      }
    } else {
      this.isValid = true;
    }
  }

  recieverEmployeeName;
  selectedEmployee(emp: IEmployee) {
    this.InputForm.EmployeeId = emp.EmployeeId;
    this.getEMReportTo();
  }
}
