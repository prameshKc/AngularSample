import { Component, ViewChild, Injectable, Input } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

import {
  LeaveService, UserService, LeaveTypeService,
  LoginService, LoginStatusService, ParamService,
  LeaveChildService, CalculateLeaveDaysService, EmailService,
  CommonService, EmployeeService, MenuVsTemplateService,
  LoginReportService, BSADCalService, CompensableLeaveReportService,
  CompensableLeaveService, LeavePolicyService, LeavePolicyEmployeeService,
  FiscalYearService
} from '../../services/BaseService';

import {
  ILeave, IPagination, IUser,
  IEmployee, ILeaveTypeSetup, ILogin,
  ILeaveBalanceLog, ILoginStatus, IParam,
  ILeaveChild, IEmail, IMenuVsTemplate,
  ILoginReport, ILoginValidate, IBSADCal,
  ICompensableLeave, ILeavePolicy, ILeavePolicyEmployee,
  IFiscalYear
} from '../../models/Models';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';

import {
  IFilterViewModel, IFgetholidaylistBoth_Result,
  IEligibleCompensableLeaveData
} from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { Utilities } from '../../shared/utilities';

@Component({
  selector: 'Leave',
  templateUrl: 'leave.component.html'
})
export class LeaveComponent {
  @Input() isAutoLeave: boolean = false;
  @Input() isDashBoard: boolean = false;

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirective: any;
  selected: string;
  output: string;

  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirectiveDelete: any;

  @ViewChild('LeaveChildModal', { static: false }) public LeaveChildModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirectiveLeaveChild: any;
  selectedLeaveChildModalLoaded: boolean;


  employeeDetails: IEmployee = <IEmployee>{};
  leaveTypeList: ILoginStatus[] = [];

  //date picker inputs.
  inputDate1: IInputDateVM;
  inputDateOptions1: IDatePickerOptionsVM;
  inputDate2: IInputDateVM;
  inputDateOptions2: IDatePickerOptionsVM;


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
  svLeaveList: ILeave[] = [];
  leaveList: ILeave[] = [];
  svLeaveChildList: ILeaveChild[] = [];
  leaveChildList: ILeaveChild[] = [];
  qaLeaveList: ILeave[] = [];
  tempLeaveList: ILeave[] = [];
  nameList: ILeave[] = [];
  pending: boolean = true;
  approved: boolean = false;
  rejected: boolean = false;
  tillDate: Date;
  InputParam: IParam = <IParam>{};
  sandwichHoliday: boolean = false;
  parentId: number;
  InputLeaveChild: ILeaveChild = <ILeaveChild>{};
  InputLeaveChildList: ILeaveChild[] = [];
  FLeaveDays: IFgetholidaylistBoth_Result[] = [];
  editObj: ILeaveChild = <ILeaveChild>{};
  userId: string;
  isLeaveToggle: boolean = false;
  leaveDetail: ILeave = <ILeave>{};
  TillDate: Date;
  mail: IEmail = <IEmail>{};
  mailAutoLeave: IEmail = <IEmail>{};
  userDetails: IUser = <IUser>{};
  messageFormat: string;
  newMessage: string;
  reqEmployeeId: number;

  pagination?: IPagination;
  isAdmin: boolean;
  currentDate: Date;
  isCompensationCarryForward: boolean;

  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };
  loginReportList: ILoginReport[] = [];
  updateloginReportObj: ILoginReport = <ILoginReport>{};
  updateLoginValidateObj: ILoginValidate = <ILoginValidate>{};
  receiverEmail: string;
  receiverEmployeeName: string;
  leaveDetailAutoLeave: string;
  leaveDateDuplicate: boolean = false;
  isPosted: boolean = false;
  validFormatNoOfDays: boolean = true;
  EligibleCompensableDate: IEligibleCompensableLeaveData[] = [];
  compareLoginStatus: ILoginStatus = <ILoginStatus>{};
  calendarYear: Date;
  newBSADDate: any;
  fiscalYear: string;
  unpaidLeaveId: number;
  unpaidHalfLeaveId: number;
  parentOfHalfLeaveId: number;
  isHalfLeave: boolean = false;
  eligibleLeaveDate: Date[] = [];
  nonEligibleLeaveDate: Date[] = [];
  halfLeaveDisable: boolean = false;
  isFiscalYear: boolean = false;
  startDate: string;
  endDate: string;
  compStartDate: Date;
  compEndDate: Date;
  unpaidLeaveObj: ILoginStatus = <ILoginStatus>{};

  constructor(
    public leaveService: LeaveService,
    public userService: UserService,
    public leaveTypeService: LeaveTypeService,
    public loginService: LoginService,
    public loginStatusService: LoginStatusService,
    public paramService: ParamService,
    public leaveChildService: LeaveChildService,
    public calculateLeaveDaysService: CalculateLeaveDaysService,
    public emailService: EmailService,
    public commonService: CommonService,
    public employeeService: EmployeeService,
    public menuVsTemplateService: MenuVsTemplateService,
    public loginReportService: LoginReportService,
    private datePickerFunctions: DatePickerFunctions,
    public compensableLeaveReportService: CompensableLeaveReportService,
    private bSADCalService: BSADCalService,
    public compensableLeaveService: CompensableLeaveService,
    private leavePolicyService: LeavePolicyService,
    private leavePolicyEmployeeService: LeavePolicyEmployeeService,
    private fiscalYearService: FiscalYearService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig
  ) {
    this.userId = localStorage.getItem('UserId');
    this.reqEmployeeId = parseInt(localStorage.getItem('EmployeeId'));
    this.getUnpaidLeaveId();
    this.getUnpaidHalfLeaveId();
    this.getParentOfHalfLeaveId();
    //this.isLeavePolicyFiscalYear().then((data) => {
    //    console.log(data);
    //});

    this.getEmployeeDetails();
    //this.checkIsAdmin();
    this.getLeaves();

    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    //this.filter();
    this.isSandwichHoliday(22);
    this.currentDate = new Date();
    this.filterObj = { Name: '', Sort: '' };
    this.inputDate1 = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputDateOptions1 = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

    this.inputDate2 = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate(),
    };
    this.inputDateOptions2 = <IDatePickerOptionsVM>{
      closeOnDateSelect: true,
      minDate: null,
      maxDate: null
    };

  }

  ngOnInit() {
    this.getLeavePending();
  }

  public getEmployeeDetails() {
    let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
    this.userService.get(this.userId, query).subscribe((data: IUser) => {
      this.userDetails = data;
      this.employeeDetails = data.Employee;
      this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
      let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
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

  public getAllLoginStatus(empId: number, leaveReqDate: Date) {
    this.commonService.GetLeaveTypeForEmployeeLeave(empId, this.unpaidLeaveId, leaveReqDate).subscribe((list: ILoginStatus[]) => {
      this.leaveTypeList = list;
      if (list.length > 0) {
        this.InputLeave.LeaveTypeId = list[0].LoginStatusId;
      }
    });
  }

  getEmpLeaveLog() {
    this.isLeaveToggle = false;
    //this.calendarYear = new Date();
    //this.newBSADDate = this.datePickerFunctions.getDate(this.calendarYear.getFullYear(), this.calendarYear.getMonth() + 1, this.calendarYear.getDate(), 1);
    //let fiscalYear = this.datePickerFunctions.getBSYear(this.newBSADDate.DateBS);
    let startDateFilter = '';
    let endDateFilter = '';
    if (this.startDate != null) {
      startDateFilter = ` and LeaveDate ge DateTime'${this.startDate}'`;
    }
    if (this.endDate != null) {
      endDateFilter = ` and LeaveDate le DateTime'${this.endDate}'`;
    }
    let query: string = `$expand=Employee,LoginStatus,Employee/ReportTo,LeaveChild&$filter=IsProcess eq false and EmployeeId eq ${this.reqEmployeeId}${startDateFilter}${endDateFilter}&$orderby=LeaveDate desc`;
    let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
    query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
    this.leaveList = [];
    this.svLeaveList = [];
    this.leaveService.getAll(query).subscribe((data: any) => {
      this.svLeaveList = data.value;
      this.leaveList = data.value;
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: <number>(data["odata.count"]),
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };
    })
  }

  getEmpLeaveChildLog(filterBy?: string) {
    this.isLeaveToggle = true;
    //this.calendarYear = new Date();
    //this.newBSADDate = this.datePickerFunctions.getDate(this.calendarYear.getFullYear(), this.calendarYear.getMonth() + 1, this.calendarYear.getDate(), 1);
    //let fiscalYear = this.datePickerFunctions.getBSYear(this.newBSADDate.DateBS);
    if (this.startDate != null && this.endDate != null) {

      let query: string = `$expand=LoginStatus,Leave,Leave/Employee,Leave/LoginStatus,Leave/Employee/ReportTo&$filter=Leave/EmployeeId eq ${this.reqEmployeeId} and (LeaveDate ge DateTime'${this.startDate}' and LeaveDate le DateTime'${this.endDate}')`;

      if (filterBy == "approved") {
        query += " and LeaveStatusId eq 2 &$orderby=LeaveDate desc";
      }
      else {
        query += " and LeaveStatusId eq 3 &$orderby=LeaveDate desc";
      }
      let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
      query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

      this.leaveChildList = [];
      this.svLeaveChildList = [];
      this.leaveChildService.getAll(query).subscribe((data: any) => {
        this.svLeaveChildList = Object.assign([], data.value);
        this.leaveChildList = Object.assign([], data.value);
        this.pagination = {
          ItemsPerPage: this.pagination.ItemsPerPage,
          TotalItems: <number>(data["odata.count"]),
          CurrentPage: this.pagination.CurrentPage,
          SortBy: this.pagination.SortBy
        };
      })
    } else {
      this.getStDateAndEndDate(new Date(), 1).then(() => {
        this.getEmpLeaveChildLog(filterBy);
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  getUnusedCompList(employeeId: number, leaveRequestDate: Date) {
    this.commonService.getPValue("CCF").subscribe((one: string) => {
      let queryCondition: string = "";
      if (one == "true") {
        queryCondition = "";
        this.compensableLeaveReportService.GetEligibleCompensationLeave(employeeId)
          .subscribe((data: IEligibleCompensableLeaveData[]) => {
            this.EligibleCompensableDate = data;
            if (this.EligibleCompensableDate.length > 0) {
              this.commonService.getPValue("CLT").subscribe((one: string) => {
                this.loginStatusService.get(Number(one)).subscribe((loginstatusData: ILoginStatus) => {
                  this.compareLoginStatus = loginstatusData;
                  if (this.leaveTypeList.filter(x => x.LoginStatusId == this.compareLoginStatus.LoginStatusId).length == 0) {
                    this.leaveTypeList.push(loginstatusData);
                  }
                });
              });
            }
          });
      }
      else {
        queryCondition = "";
        //this.calendarYear = new Date(leaveRequestDate);
        //this.newBSADDate = this.datePickerFunctions.getDate(this.calendarYear.getFullYear(), this.calendarYear.getMonth() + 1, this.calendarYear.getDate(), 1);
        //let fiscalYear = this.datePickerFunctions.getBSYear(this.newBSADDate.DateBS);
        //incomplee

        this.getStDateAndEndDate(leaveRequestDate, 2).then((data) => {
          this.compensableLeaveReportService.GetEligibleCompensationLeave(employeeId, this.compStartDate, this.compEndDate)
            .subscribe((data: IEligibleCompensableLeaveData[]) => {
              this.EligibleCompensableDate = data;
              if (this.EligibleCompensableDate.length > 0) {
                this.commonService.getPValue("CLT").subscribe((one: string) => {
                  this.loginStatusService.get(Number(one)).subscribe((loginstatusData: ILoginStatus) => {
                    this.compareLoginStatus = loginstatusData;
                    if (this.leaveTypeList.filter(x => x.LoginStatusId == this.compareLoginStatus.LoginStatusId).length == 0) {
                      this.leaveTypeList.push(loginstatusData);
                    }
                  });
                });
              }
            });
        });
      }
    });
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * to open add modal
   */
  openAddModal() {
    this.isAddLeave = true;
    this.isEditLeave = false;
    this.selectedModalLoaded = true;

    this.InputLeave = <ILeave>{};
    if (this.isAutoLeave == false) {
      //this.InputLeave.EmployeeId = this.employeeDetails.EmployeeId;
      this.InputLeave.EmployeeId = this.reqEmployeeId;
    }
    this.InputLeave.NumOfDays = "1";
    this.InputLeave.RequestedDate = new Date(this.inputDate1.Year, this.inputDate1.Month - 1, this.inputDate1.Date);
    this.InputLeave.LeaveDate = new Date(this.inputDate2.Year, this.inputDate2.Month - 1, this.inputDate2.Date);
    this.childModal.show();
  }

  /**
   * to open edit modal
   */
  openEditModal() {
    this.isEditLeave = true;
    this.isAddLeave = false;
    this.selectedModalLoaded = true;
    this.childModal.show();
  }

  /**
   * to open delete modal
   */


  /**
   * to hide add/edit modal
   */
  public hideChildModal(): void {
    this.isPosted = false;
    this.selectedModalLoaded = false;
    this.tillDate = null;
    this.childModal.hide();
    this.isAddLeave = false;
    this.isEditLeave = false;
    this.InputLeave = <ILeave>{};
    if (this.leaveTypeList.length > 0) {
      this.InputLeave.LeaveTypeId = this.leaveTypeList[0].LoginStatusId;
    }
    this.validFormatNoOfDays = true;
    this.halfLeaveDisable = false;
    this.resetForm();
  }

  /**
   * to hide delete modal
   */
  public hideDeleteChildModal(): void {
    this.deleteModal.hide();
  }

  /**
  * @summary : to get list of all Leave list
  * @param LeaveTypeId
  */
  getLeaves(LeaveTypeId?: number, filterObj?: IFilterViewModel) {
    //this.resetPagination();
    this.parentId = LeaveTypeId;
    //this.setPagination();
  }

  filter() {
    if (this.rejected == true) {
      this.getEmpLeaveChildLog("rejected");
    }
    if (this.approved == true) {
      this.getEmpLeaveChildLog("approved");
    }
    if (this.pending == true) {
      this.getEmpLeaveLog();
    }
  }

  //filterLeaves() {
  //    this.pagination.CurrentPage = 1;
  //    this.filter();
  //}

  toggleListVsIconFn() {
    this.toggleListVsIcon = !this.toggleListVsIcon;
  }

  //Add Leave
  public saveLeaveRequest() {
    let leaveObj: ILeave = this.InputLeave;
    leaveObj.RequestedDate = new Date();
    leaveObj.IsProcess = false;
    leaveObj.LeaveTypeId = Number(leaveObj.LeaveTypeId);
    leaveObj.LeaveBalanceLog = [];
    this.InputLeaveChildList.forEach(item => {
      item.ApprovedLeaveTypeId = leaveObj.LeaveTypeId;
    });
    if (this.InputLeave.LeaveTypeId == this.compareLoginStatus.LoginStatusId) {
      //condition where compensable details are added
      if (this.EligibleCompensableDate.length > 0 && this.InputLeaveChildList.length > 0) {
        for (var i = 0; i < this.EligibleCompensableDate.filter(x => x.isSelected == true).length; i++) {
          if (this.EligibleCompensableDate.filter(x => x.isSelected == true).length > 0) {
            this.InputLeaveChildList[i].CompensableLeaveId = this.EligibleCompensableDate.filter(x => x.isSelected == true)[i].CompensableLeaveId;
            this.InputLeaveChildList[i].CompensableLeaveDate = this.EligibleCompensableDate.filter(x => x.isSelected == true)[i].CompensableDate;
          }
        }
      }
    }
    this.checkEligibleDate(leaveObj).then((dataFrom) => {
      if (dataFrom == 1) {
        if (this.isAutoLeave == true) {
          if (this.InputLeave.EmployeeId != this.reqEmployeeId) {
            leaveObj.IsProcess = true;
            leaveObj.ApproverRemarks = leaveObj.Remarks;
            this.InputLeaveChildList.forEach(item => {
              item.LeaveStatusId = 2;
              item.LeaveStatusUpdatedBy = this.userId;
              item.LeaveStatusUpdateOn = new Date();
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
            });
          }
        }

        leaveObj.LeaveChild = [];
        this.InputLeaveChildList.forEach(item => {
          leaveObj.LeaveChild.push(item);
        })

        if (this.isPosted == false) {
          this.leaveService.post(leaveObj).subscribe(() => {
            if (this.InputLeave.LeaveTypeId == this.compareLoginStatus.LoginStatusId) {
              leaveObj.LeaveChild.forEach(item => {
                this.compensableLeaveService.get(item.CompensableLeaveId).subscribe((one: ICompensableLeave) => {
                  let compensableLeaveObj: ICompensableLeave;
                  compensableLeaveObj = one;
                  compensableLeaveObj.Status = 1;
                  compensableLeaveObj.ModifiedBy = this.userId;
                  this.compensableLeaveService.put(compensableLeaveObj.CompensableLeaveId, compensableLeaveObj).
                    subscribe(() => {
                    });
                });
              });
              this.getLeavePending();
            }
            this.isPosted = true;
            let reportToId: number;
            let senderName: string;
            if (this.isAutoLeave == true) {
              leaveObj.LeaveChild.forEach(item => {
                let leaveDate = new Date(item.LeaveDate);
                if (leaveDate < this.currentDate) {
                  this.updateLoginStatus(leaveObj.EmployeeId, item.LeaveDate, item.ApprovedLeaveTypeId, leaveObj.Remarks, leaveObj.ApproverRemarks);
                }
              });
              reportToId = this.reqEmployeeId;
              senderName = this.receiverEmployeeName;
            }
            else {
              reportToId = this.userDetails.Employee.ReportTo.filter(x => x.Status == true)[0].ReportTo1;
              senderName = "";
              if (this.employeeDetails.FirstName != null) {
                senderName += this.employeeDetails.FirstName + " ";
              }
              if (this.employeeDetails.MiddleName != null) {
                senderName += this.employeeDetails.MiddleName + " ";
              }
              if (this.employeeDetails.LastName != null) {
                senderName += this.employeeDetails.LastName;
              }
            }

            let requestedDate = new Date(leaveObj.LeaveDate.getFullYear(), leaveObj.LeaveDate.getMonth(), leaveObj.LeaveDate.getDate()).toDateString();
            let tillDate2 = new Date(leaveObj.LeaveChild[leaveObj.LeaveChild.length - 1].LeaveDate);
            let tillDate = new Date(tillDate2.getFullYear(), tillDate2.getMonth(), tillDate2.getDate()).toDateString();
            let numOfDays = leaveObj.NumOfDays.toString();
            let remarks = leaveObj.Remarks;

            this.getMessageFormat(senderName, requestedDate, tillDate, numOfDays, remarks);
            let query: string = '$select=Email';
            this.employeeService.get(reportToId, query).subscribe((data: IEmployee) => {
              var supervisorEmail = data.Email;
              this.commonService.getPValue("HREmail").subscribe((ccToHR: string) => {

                this.mail = {
                  Subject: "Leave Request",
                  Body: this.newMessage,
                  ReceiverEmailAddress: supervisorEmail,
                  ReceiverEmailAddressCC: ccToHR
                };

                this.InputLeave = <ILeave>{};
                this.svLeaveList = [];
                this.filter();
                this.isAddLeave = false;
                this.selectedModalLoaded = false;
                this.hideChildModal();
                this.sendEmail(this.mail);

                if (this.isAutoLeave == true) {
                  this.leaveDetailAutoLeave = " ";
                  let leaveStatus: string = "Approved";
                  leaveObj.LeaveChild.forEach((item, index) => {
                    this.leaveDetailAutoLeave += `<tr><td>${index + 1}</td><td>${new Date(item.LeaveDate).toDateString()}</td><td>${leaveStatus}</td></tr>`;
                  });

                  let leaveApplicantEmail = this.receiverEmail;
                  let receiverName: string = this.receiverEmployeeName;
                  let remarks = leaveObj.Remarks;
                  let approverRemarks = leaveObj.ApproverRemarks;

                  this.getMessageFormatAutoLeave(receiverName, remarks, approverRemarks, this.leaveDetailAutoLeave).then((messageFormat) => {
                    this.commonService.getPValue("HREmail").subscribe((ccToHR: string) => {
                      this.mailAutoLeave = {
                        Subject: "Leave Request Addressed for your request",
                        Body: this.newMessage,
                        ReceiverEmailAddress: leaveApplicantEmail,
                        ReceiverEmailAddressCC: ccToHR
                      };
                      this.sendEmail(this.mailAutoLeave);
                    });
                  }, err => console.log(err));
                }
              });
            })


          });
        }
      }
    });
  }

  public getMessageFormat(senderName: string, requestedDate: string, tillDate: string, numOfDays: string, remarks: string) {
    this.commonService.getPValue("LRM").subscribe((data: string) => {
      this.messageFormat = data;
      var replacesenderName = "{#sender_name#}";
      var replacerequestedDate = "{#request_date#}";
      var replacetillDate = "{#till_date#}";
      var replacenumOfDays = "{#NOD#}";
      var replaceremarks = "{#reason#}";

      this.newMessage = this.messageFormat.replace(replacesenderName, senderName);
      this.newMessage = this.newMessage.replace(replacerequestedDate, requestedDate);
      this.newMessage = this.newMessage.replace(replacetillDate, tillDate);
      this.newMessage = this.newMessage.replace(replacenumOfDays, numOfDays);
      this.newMessage = this.newMessage.replace(replaceremarks, remarks);
      this.newMessage = this.newMessage.replace(/(?:\r\n|\r|\n)/g, '<br />');

    })
  }

  public sendEmail(email: IEmail) {
    this.emailService.post(email).subscribe(() => {
      var toastOptions: ToastOptions = {
        title: "Success",
        msg: "Leave Request has been successfully Sent",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.success(toastOptions);
    });
  }

  //Edit Leave
  public getLeave(id: number) {
    this.openEditModal();
    this.leaveService.get(id)
      .subscribe((div: any) => {
        this.InputLeave = div;
      });
  }

  //Delete Leave
  public deleteLeave() {
    this.leaveService.delete(this.deleteId)
      .subscribe(() => {
        this.svLeaveList = [];
        //this.InputLeave = <ILeave>{};
        this.getLeaves(this.parentId);
        this.deleteModalLoaded = false;
        this.hideChildModal();
      });
  }

  onLeaveDateSelect1(selectedDate: IInputDateVM, numDays?: number) {
    this.InputLeave.RequestedDate = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date, 5, 45, 0, 0);
  }

  onLeaveDateSelect2(selectedDate: IInputDateVM, numDays?: any) {
    this.validFormatNoOfDays = Utilities.isDecimal(this.InputLeave.NumOfDays);
    this.inputDate2 = selectedDate;
    this.InputLeave.LeaveDate = new Date(this.inputDate2.Year, this.inputDate2.Month - 1, this.inputDate2.Date, 5, 45, 0, 0);
    if (this.isAutoLeave == false) {
      this.getUnusedCompList(this.InputLeave.EmployeeId, this.InputLeave.LeaveDate);
      this.getAllLoginStatus(this.reqEmployeeId, this.InputLeave.LeaveDate);
    }
    else {
      if (this.InputLeave.EmployeeId != null) {
        this.getAllLoginStatus(this.InputLeave.EmployeeId, this.InputLeave.LeaveDate);
      }
    }
    this.calculateTillDate();
  }

  calculateTillDate() {
    //this.InputLeave.LeaveDate = new Date(this.inputDate2.Year, this.inputDate2.Month - 1, this.inputDate2.Date, 5, 45, 0, 0);

    let leavedays: any[] = [];
    let date2 = new Date(this.inputDate2.Year, this.inputDate2.Month - 1, this.inputDate2.Date, 5, 45, 0, 0);
    this.InputLeaveChildList = [];

    if (this.sandwichHoliday == false) {
      if (this.InputLeave.EmployeeId != null && this.validFormatNoOfDays == true && this.InputLeave.NumOfDays != null) {
        this.calculateLeaveDaysService.GetLeaveDays(this.InputLeave.EmployeeId, this.InputLeave.LeaveDate, Number(this.InputLeave.NumOfDays), !this.sandwichHoliday)
          .subscribe((data: IFgetholidaylistBoth_Result[]) => {
            this.FLeaveDays = data;
            this.InputLeaveChildList = [];
            this.FLeaveDays.forEach(item => {
              if (item.IsHoliday == false) {
                this.InputLeaveChild.LeaveDate = item.TDate;
                this.InputLeaveChild.LeaveStatusId = 1;
                this.InputLeaveChild.ConsumedLeave = false;
                let pushItem: ILeaveChild = Object.assign({}, this.InputLeaveChild);
                this.InputLeaveChildList.push(pushItem);
              }
            })
            this.tillDate = this.FLeaveDays[this.FLeaveDays.length - 1].TDate;
          });
      }
    }
    else {
      if (this.InputLeave.EmployeeId != null && this.validFormatNoOfDays == true && this.InputLeave.NumOfDays != null) {
        this.calculateLeaveDaysService.GetLeaveDays(this.InputLeave.EmployeeId, this.InputLeave.LeaveDate, Number(this.InputLeave.NumOfDays), !this.sandwichHoliday)
          .subscribe((data: IFgetholidaylistBoth_Result[]) => {
            this.FLeaveDays = data;
            this.InputLeaveChildList = [];
            this.FLeaveDays.forEach(item => {
              this.InputLeaveChild.LeaveDate = item.TDate;
              this.InputLeaveChild.LeaveStatusId = 1;
              this.InputLeaveChild.ConsumedLeave = false;
              let pushItem: ILeaveChild = Object.assign({}, this.InputLeaveChild);
              this.InputLeaveChildList.push(pushItem);
            })
            this.tillDate = this.FLeaveDays[this.FLeaveDays.length - 1].TDate;
          });
      }
    }
    let query: string;
    let month: string;
    let date: string;
    if (this.inputDate2.Month < 10) {
      month = "0" + this.inputDate2.Month;
    }
    else {
      month = this.inputDate2.Month.toString();
    }
    if (this.inputDate2.Date < 10) {
      date = "0" + this.inputDate2.Date;
    }
    else {
      date = this.inputDate2.Date.toString();
    }
    let leavedate = `${this.inputDate2.Year}-${month}-${date}`;
    if (this.InputLeave.EmployeeId != null) {
      query = `$expand=Leave&$filter=LeaveDate eq datetime'${leavedate}' and Leave/EmployeeId eq ${this.InputLeave.EmployeeId} and LeaveStatusId ne 3`;
      this.leaveChildService.getAll(query)
        .subscribe((list: ILeaveChild[]) => {
          if (list.length > 0) {
            this.leaveDateDuplicate = true;
          }
          else {
            this.leaveDateDuplicate = false;
          }
        });
    }
  }

  isSandwichHoliday(id: number) {
    var query = "$select=ParamValue/PValue&$expand=ParamValue";
    this.paramService.get(id, query)
      .subscribe((one: IParam) => {
        this.InputParam = one;
        if (this.InputParam.ParamValue.PValue == "true") {
          this.sandwichHoliday = true;
        }
        else {
          this.sandwichHoliday = false;
        }
      })
  }

  resetForm() {
    this.InputLeave = <ILeave>{}
    this.inputDate1 = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate()
    };
    this.inputDate2 = <IInputDateVM>{
      Year: this.currentDate.getFullYear(),
      Month: this.currentDate.getMonth() + 1,
      Date: this.currentDate.getDate()
    };
  }

  compLogSelected(ev: any) {
    if (this.InputLeave.LeaveTypeId == this.compareLoginStatus.LoginStatusId) {
      this.InputLeave.NumOfDays = (this.EligibleCompensableDate.filter(x => x.isSelected == true).length).toString();
      this.calculateTillDate();
    }
    else {
      this.InputLeave.NumOfDays = "1";
      this.loginStatusService.get(this.InputLeave.LeaveTypeId).subscribe((data: ILoginStatus) => {
        if (data.IsHalfLeave == true) {
          this.halfLeaveDisable = true;
        }
        else {
          this.halfLeaveDisable = false;
        }
      });
    }
  }

  getLeavePending() {
    this.pending = true;
    this.approved = false;
    this.rejected = false;
    //this.filter();
    this.getEmpLeaveLog();
  }

  getLeaveApproved() {
    this.pending = false;
    this.approved = true;
    this.rejected = false;
    //this.filter();
    this.getEmpLeaveChildLog("approved");
  }

  getLeaveRejected() {
    this.pending = false;
    this.approved = false;
    this.rejected = true;
    //this.filter();
    this.getEmpLeaveChildLog("rejected");
  }

  openDeleteModal(Id: number) {
    this.hideLeaveChildModal();
    this.deleteId = Id;
    this.deleteModalLoaded = true;
    if (this.deleteModal != undefined) {
      this.deleteModal.config.backdrop = true;
    }
    this.deleteModal.show();
  }

  hideDeleteModal() {
    this.deleteModal.hide();
  }

  public cancelLeave() {
    this.leaveService.delete(this.deleteId).subscribe(() => {
      this.hideDeleteModal();
      this.filter();
      var toastOptions: ToastOptions = {
        title: "Cancelled",
        msg: "Leave has been cancelled",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap',
      };
      this.toastyService.success(toastOptions);
    });
  }

  public ViewLeave(id: number) {
    var query = "$expand=Employee,LeaveChild,LoginStatus";
    this.leaveService.get(id, query)
      .subscribe((one: ILeave) => {
        this.leaveDetail = one;


        this.TillDate = this.leaveDetail.LeaveChild.reverse()[0].LeaveDate;
        this.openLeaveChildModal();
      });
  }

  openLeaveChildModal() {
    this.selectedLeaveChildModalLoaded = true;
    this.LeaveChildModal.show();
  }

  hideLeaveChildModal() {
    this.selectedLeaveChildModalLoaded = false;
    this.TillDate = null;
    this.LeaveChildModal.hide();
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.filter();
  }

  public selectedEmployee(event: any) {
    this.InputLeave.EmployeeId = event.EmployeeId;
    this.onLeaveDateSelect2(this.inputDate2);
    this.receiverEmail = event.Email;
    this.receiverEmployeeName = "";
    if (event.FirstName != null) {
      this.receiverEmployeeName += event.FirstName + " ";
    }
    if (event.MiddleName != null) {
      this.receiverEmployeeName += event.MiddleName + " ";
    }
    if (event.LastName != null) {
      this.receiverEmployeeName += event.LastName;
    }
    this.getAllLoginStatus(this.InputLeave.EmployeeId, this.InputLeave.LeaveDate);
  }

  public updateLoginStatus(employeeId: number, tDate: Date, leaveTypeId: number, staffRemarks: string, approverRemarks: string) {
    var query = `$filter=EmployeeId eq ${employeeId} and TDate eq datetime'${tDate}' &$orderby=Id &$top=1`;
    this.loginReportService.getAll(query)
      .subscribe((data: ILoginReport[]) => {
        this.loginReportList = data;
        let loginReportObj: ILoginReport = this.loginReportList[0];
        this.updateloginReportObj = loginReportObj;
        this.updateloginReportObj.LoginStatusId = leaveTypeId;
        this.updateloginReportObj.StaffRemarks = staffRemarks;

        this.updateLoginValidateObj.LoginId = loginReportObj.Id;
        this.updateLoginValidateObj.UpdatedStatusId = loginReportObj.LoginStatusId;
        this.updateLoginValidateObj.ValidatedBy = this.userId;
        this.updateLoginValidateObj.VerificationRemarks = approverRemarks;

        this.updateloginReportObj.LoginStatus = this.leaveTypeList.filter(x => x.LoginStatusId == this.updateloginReportObj.LoginStatusId)[0];
        this.updateloginReportObj.LoginValidate = [this.updateLoginValidateObj];

        this.loginReportService.put(this.updateloginReportObj.Id, this.updateloginReportObj).subscribe((data) => {
          this.updateloginReportObj = <ILoginReport>{};
          this.updateLoginValidateObj = <ILoginValidate>{};
        });
      });
  }

  public getMessageFormatAutoLeave(receiverName: string, remarks: string, approverRemarks: string, leaveDetail: string): Promise<string> {
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

  public isFormValid(bookForm: any): boolean {
    if (!this.validFormatNoOfDays) {
      return false;
    }
    if (this.InputLeave.NumOfDays == "0") {
      return false;
    }
    if (!bookForm.form.valid) {
      return false;
    }
    if (this.InputLeave.EmployeeId == null) {
      return false;
    }
    if (this.leaveDateDuplicate == true) {
      return false;
    }
    return true;
  }

  public getUnpaidLeaveId() {
    this.commonService.getPValue("UPL").subscribe((one: string) => {
      this.unpaidLeaveId = Number(one);
      this.loginStatusService.get(this.unpaidLeaveId).subscribe((obj: ILoginStatus) => {
        this.unpaidLeaveObj = obj;
      });
    });
  }

  public getUnpaidHalfLeaveId() {
    this.commonService.getPValue("UHL").subscribe((one: string) => {
      this.unpaidHalfLeaveId = Number(one);
    });
  }

  public getParentOfHalfLeaveId() {
    this.commonService.getPValue("POHL").subscribe((one: string) => {
      this.parentOfHalfLeaveId = Number(one);
    });
  }

  public getDateInString(data: Date): string {
    let input = new Date(data);
    var year = input.getFullYear();
    var month = input.getMonth() + 1;
    var date = input.getDate();
    var dateInString = date.toString();
    var monthInString = month.toString();

    if (date < 10) {
      dateInString = "0" + dateInString;
    }
    if (month < 10) {
      monthInString = "0" + monthInString;
    }
    let dateString = year.toString() + "-" + monthInString + "-" + dateInString;
    return dateString;
  }

  public checkEligibleDate(leaveObject: ILeave): Promise<number> {
    return new Promise((resolve) => {
      let leavePolicyQuery = ``;

      this.loginStatusService.get(leaveObject.LeaveTypeId).subscribe((data: ILoginStatus) => {
        if (data.IsHalfLeave == true) {
          this.isHalfLeave = true;
          let leaveDateInString = this.getDateInString(leaveObject.LeaveDate);
          leavePolicyQuery = `$filter=LeaveId eq ${this.parentOfHalfLeaveId} and EffectiveDate le DateTime'${leaveDateInString}' &$orderby=EffectiveDate desc &$top=1`;
          this.leavePolicyService.getAll(leavePolicyQuery).subscribe((leavePolicyList: ILeavePolicy[]) => {
            if (leavePolicyList.length > 0) {
              if (leavePolicyList[0].ServiceTypeId == 1) {
                let leavePolicyQueryfilter = `$filter=EmployeeId eq ${leaveObject.EmployeeId} and LeaveId eq ${this.parentOfHalfLeaveId}`;
                this.getEligibleDate(leavePolicyQueryfilter, leaveObject.EmployeeId, leaveObject.LeaveTypeId).then((data) => {
                  resolve(1);
                });
              }
            }
            else {
              resolve(1);
            }
          });
        }
        else {
          this.isHalfLeave = false;
          let leaveDateInString = this.getDateInString(leaveObject.LeaveDate);
          leavePolicyQuery = `$filter=LeaveId eq ${leaveObject.LeaveTypeId} and EffectiveDate le DateTime'${leaveDateInString}' &$orderby=EffectiveDate desc &$top=1`;
          this.leavePolicyService.getAll(leavePolicyQuery).subscribe((leavePolicyList: ILeavePolicy[]) => {
            if (leavePolicyList.length > 0) {
              let leavePolicyQueryfilter = `$filter=EmployeeId eq ${leaveObject.EmployeeId} and LeaveId eq ${leaveObject.LeaveTypeId}`;
              this.getEligibleDate(leavePolicyQueryfilter, leaveObject.EmployeeId, leaveObject.LeaveTypeId).then((data) => {
                if (data == "success") {
                  resolve(1);
                }
              });
            }
            else {
              resolve(1);
            }
          });
        }

      });

    });

  }

  public getEligibleDate(leavePolicyQueryfilter: string, empid: number, leaveId: number): Promise<string> {
    return new Promise<string>((resolve) => {
      this.eligibleLeaveDate = [];
      this.nonEligibleLeaveDate = [];
      let count = 0;
      let result;
      this.InputLeaveChildList.forEach(item => {
        this.getStDateAndEndDate(item.LeaveDate, 2).then((info) => {
          //let calendarYear: Date = new Date(item.LeaveDate);
          //let newBSADDate = this.datePickerFunctions.getDate(calendarYear.getFullYear(), calendarYear.getMonth() + 1, calendarYear.getDate(), 1);
          //let fiscalYear = this.datePickerFunctions.getBSYear(newBSADDate.DateBS);
          let leavePolicyQuery2: string;
          let leavePolicyQuery: string;
          let leaveDateInString = this.getDateInString(item.LeaveDate);
          leavePolicyQuery2 = ` and EffectiveFrom le DateTime'${leaveDateInString}' and CalendarYear eq '${this.fiscalYear}' `;
          leavePolicyQuery = leavePolicyQueryfilter + leavePolicyQuery2;
          this.leavePolicyEmployeeService.getAll(leavePolicyQuery)
            .subscribe((data: ILeavePolicyEmployee[]) => {
              count++;
              if (data.length > 0) {
                this.eligibleLeaveDate.push(item.LeaveDate);
              }
              else {
                this.nonEligibleLeaveDate.push(item.LeaveDate);
              }
              result = this.checkCount(this.InputLeaveChildList.length, count);
              if (result == true) {
                resolve("success");
              }
            }, (err) => {
              count++;
              result = this.checkCount(this.InputLeaveChildList.length, count);
              resolve("fail");
            });
        });

      });

    });
  }

  public isLeavePolicyFiscalYear(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.commonService.getPValue('ILPFY').subscribe((data: string) => {
        if (data == "true") {
          this.isFiscalYear = true;
        }
        else {
          this.isFiscalYear = false;
        }
        this.getStDateAndEndDate(new Date, 1).then((data) => {
          this.onPageSelect(this.pagination);
        });
        resolve(true);
      });
    });

  }

  public getStDateAndEndDate(tDate: Date, event: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.isFiscalYear == false) {
        this.calendarYear = new Date(tDate);
        this.newBSADDate = this.datePickerFunctions.getDate(this.calendarYear.getFullYear(), this.calendarYear.getMonth() + 1, this.calendarYear.getDate(), 1);
        let fiscalYear = this.datePickerFunctions.getBSYear(this.newBSADDate.DateBS);

        this.bSADCalService.get(fiscalYear).subscribe((data: IBSADCal) => {
          if (event == 1) {
            this.startDate = this.getDateInString(data.StartDate);
            this.endDate = this.getDateInString(data.EndDate);
            resolve(true);
          }
          else {
            this.compStartDate = data.StartDate;
            this.compEndDate = data.EndDate;
            this.fiscalYear = data.NYear.toString();
            resolve(true);
          }
        });
      }
      else {
        let leaveDateInString = this.getDateInString(tDate);
        let query = `$filter=StartDT le DateTime'${leaveDateInString}' and EndDt ge DateTime'${leaveDateInString}'`;
        this.fiscalYearService.getAll(query).subscribe((list: IFiscalYear[]) => {
          if (event == 1) {
            this.startDate = this.getDateInString(list[0].StartDT);
            this.endDate = this.getDateInString(list[0].EndDt);
            resolve(true);
          }
          else {
            this.compStartDate = list[0].StartDT;
            this.compEndDate = list[0].EndDt;
            this.fiscalYear = list[0].FyName;
            resolve(true);
          }
        });
      }
    });
  }

  public checkCount(listLength: number, count: number): boolean {
    if (listLength == count) {
      return true;
    }
    else {
      return false;
    }
  }
}

