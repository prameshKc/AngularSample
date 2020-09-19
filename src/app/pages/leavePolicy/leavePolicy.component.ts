import { Component, ViewChild, Injectable } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import {
    LeavePolicyService, LoginStatusService, LeaveServiceTypeService,
    CommonService, BSADCalService, FiscalYearService,
    EligibleExpMonthService
} from '../../services/BaseService';

import {
    ILeavePolicy, ILoginStatus, ILeaveServiceType,
    IEarningScheduleDay, IPagination, IBSADCal,
    IFiscalYear, IEligibleExpMonth
} from '../../models/Models';
import { ModalDirective } from 'ngx-bootstrap';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';
import { IFilterViewModel, IFgetFiscialyearID_Result} from '../../models/ViewModels';
import { Utilities } from '../../shared/utilities';

@Component({
    selector: 'leave-policy',
    templateUrl: 'leavePolicy.component.html'
})
export class LeavePolicyComponent {
    @ViewChild('LeavePolicyModal', { static: false }) public LeavePolicyModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirectiveLeavePolicy: any;
    selectedLeavePolicyModalLoaded: boolean;
    pagination?: IPagination;
    filterObj?: IFilterViewModel;

    userId: string;
    leaveTypeList: ILoginStatus[] = [];
    leaveServiceTypeList: ILeaveServiceType[] = [];
    InputLeavePolicy: ILeavePolicy = <ILeavePolicy>{};
    inputEffectiveDate: IInputDateVM;
    inputEffectiveDateOptions: IDatePickerOptionsVM;
    currentDate: Date;
    showAccumulationDays: boolean = false;
    showAccumulationAndEarn: boolean = false;
    showEarningScheduleDay: boolean = false;
    earningScheduleDayList: IEarningScheduleDay[] = [];
    ServiceType: any;
    leavePolicyList: ILeavePolicy[] = [];
    toggleSort: boolean = false;
    isAddLeavePolicy: boolean = false;
    isEditLeavePolicy: boolean = false;
    isAddEditToggle: boolean = false;
    forHalfLeave: boolean = false;
    parentLeaveList: ILoginStatus[] = [];
    NepaliCalendarYearList: IBSADCal[] = [];
    nepaliEnglishStartDate: Date;
    nepaliEnglishEndDate: Date;
    duplicateDate: boolean = false;
    invalidDate: boolean = false;
    leaveDateSelected: boolean = false;
    validFormatNoOfDays: boolean = true;
    validFormatAccumulationDays: boolean = true;
    NepaliFiscalYear: IBSADCal = <IBSADCal>{};
    NepaliFiscalYear2: IFgetFiscialyearID_Result = <IFgetFiscialyearID_Result>{};
    NepaliFiscalYearList: IBSADCal[];
    NepaliFiscalYearList2: IFgetFiscialyearID_Result[];
    isFiscalYear: boolean = false;
    eligibleExpMonthList: IEligibleExpMonth[] = [];
    disableEditBtn: boolean = false;
    halfLeaveInputPolicy: ILeavePolicy = <ILeavePolicy>{};

    constructor(
        public leavePolicyService: LeavePolicyService,
        public loginStatusService: LoginStatusService,
        public leaveServiceTypeService: LeaveServiceTypeService,
        public commonService: CommonService,
        public fiscalYearService: FiscalYearService,
        public bSADCalService: BSADCalService,
        private eligibleExpMonthService: EligibleExpMonthService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.isLeavePolicyFiscalYear();
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
        this.currentDate = new Date();
        this.inputEffectiveDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
        this.currentDate.setHours(0, 0, 0, 0);
        this.inputEffectiveDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        };
        this.getAllLoginStatus();
        this.getAllServiceType();
        this.getAllNepaliCalendarFiscalYear();
        this.getAllFiscalYear();
        this.getAllEligibleExpMonth();
        this.earningScheduleDayList = [
            { Id: 1, Day: 1 },
            { Id: 2, Day: 2 },
            { Id: 3, Day: 3 },
            { Id: 4, Day: 4 },
            { Id: 5, Day: 5 },
            { Id: 6, Day: 6 },
            { Id: 7, Day: 7 },
            { Id: 8, Day: 8 },
            { Id: 9, Day: 9 },
            { Id: 10, Day: 10 },
            { Id: 11, Day: 11 },
            { Id: 12, Day: 12 },
            { Id: 13, Day: 13 },
            { Id: 14, Day: 14 },
            { Id: 15, Day: 15 },
            { Id: 16, Day: 16 },
            { Id: 17, Day: 17 },
            { Id: 18, Day: 18 },
            { Id: 19, Day: 19 },
            { Id: 20, Day: 20 },
            { Id: 21, Day: 21 },
            { Id: 22, Day: 22 },
            { Id: 23, Day: 23 },
            { Id: 24, Day: 24 },
            { Id: 25, Day: 25 },
            { Id: 26, Day: 26 },
            { Id: 27, Day: 27 },
            { Id: 28, Day: 28 },
            { Id: 29, Day: 29 },
            { Id: 30, Day: 30 },
            { Id: 31, Day: 31 },
            { Id: 32, Day: 32 }
        ];
    }

    public getAllLoginStatus() {
        let leaveQuery: string = `$filter=SType eq 1`;
        this.loginStatusService.getAll(leaveQuery)
            .subscribe((data: ILoginStatus[]) => {
                this.leaveTypeList = data;
            });
    }

    public getAllServiceType() {
        this.leaveServiceTypeService.getAll()
            .subscribe((data: ILeaveServiceType[]) => {
                this.leaveServiceTypeList = data;
            });
    }

    public getAllNepaliCalendarFiscalYear() {
        this.bSADCalService.getAll().subscribe((data: IBSADCal[]) => {
            this.NepaliFiscalYear = data.filter(x => new Date(x.StartDate).getTime() <= new Date(this.currentDate).getTime() && new Date(x.EndDate).getTime() >= new Date(this.currentDate).getTime())[0];
            let NepaliFiscalYear2 = data.filter(x => x.NYear == this.NepaliFiscalYear.NYear + 1)[0];
            this.NepaliFiscalYearList = [];
            this.NepaliFiscalYearList.push(this.NepaliFiscalYear);
            this.NepaliFiscalYearList.push(NepaliFiscalYear2);
        });
    }

    public getAllFiscalYear() {
        let date = new Date();
        this.commonService.getFiscalYear(date, 2).subscribe((data: IFgetFiscialyearID_Result[]) => {
            this.NepaliFiscalYear2 = data.filter(x => new Date(x.StartDT).getTime() <= new Date(this.currentDate).getTime() && new Date(x.EndDt).getTime() >= new Date(this.currentDate).getTime())[0];
            let id = this.NepaliFiscalYear2.FYID + 1;
            let NepaliFiscalYear2Second: IFgetFiscialyearID_Result;
            this.fiscalYearService.get(id).subscribe((one: IFiscalYear) => {
                NepaliFiscalYear2Second = one;
                this.NepaliFiscalYearList2 = [];
                this.NepaliFiscalYearList2.push(this.NepaliFiscalYear2);
                this.NepaliFiscalYearList2.push(NepaliFiscalYear2Second);
            });
        });
    }

    public getAllEligibleExpMonth() {
        this.eligibleExpMonthService.getAll().subscribe((list: IEligibleExpMonth[]) => {
            this.eligibleExpMonthList = list;
        });
    }

    public getAllLeavePolicy(filterObj?: IFilterViewModel) {
        var query: string = `$expand=LoginStatus,LeaveServiceType &$filter=IsFiscalYear eq ${this.isFiscalYear}`;
        if (filterObj != undefined || filterObj != null) {
            if (filterObj.Sort != undefined && filterObj.Sort != "") {
                if (filterObj.Sort == 'true') {
                    query += "&$orderby=" + filterObj.SortingAttribute;
                }
                else {
                    query += "&$orderby=" + filterObj.SortingAttribute + " desc";
                }
            }
            else {
                if (this.isAddEditToggle == true) {
                    query += "&$orderby=ModifiedOn desc";
                }
                else {
                    query += "&$orderby=PostedOn desc";
                }
            }
        }
        else {
            if (this.isAddEditToggle == true) {
                query += "&$orderby=ModifiedOn desc";
            }
            else {
                query += "&$orderby=PostedOn desc";
            }
        }

        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
        this.leavePolicyService.getAll(query)
            .subscribe((list: any) => {
                this.leavePolicyList = list.value;
                this.pagination = {
                    ItemsPerPage: this.pagination.ItemsPerPage,
                    TotalItems: <number>(list["odata.count"]),
                    CurrentPage: this.pagination.CurrentPage,
                    SortBy: this.pagination.SortBy
                };
            });
    }

    public openAddModal() {
        this.isAddLeavePolicy = true;
        this.isEditLeavePolicy = false;
        this.selectedLeavePolicyModalLoaded = true;
        this.LeavePolicyModal.show();
    }

    public hideModal() {
        this.LeavePolicyModal.hide();
        this.forHalfLeave = false;
        this.isAddLeavePolicy = false;
        this.isEditLeavePolicy = false;
        this.isAddEditToggle = false;
        this.selectedLeavePolicyModalLoaded = false;
        this.InputLeavePolicy = <ILeavePolicy>{};
        this.ServiceType = null;
        this.showAccumulationDays = false;
        this.showAccumulationAndEarn = false;
        this.showEarningScheduleDay = false;
        this.leaveDateSelected = false;
        this.validFormatNoOfDays = true;
        this.inputEffectiveDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate()
        };
    }

    public saveLeavePolicy() {
        let saveItem: ILeavePolicy;
        this.InputLeavePolicy.PostedBy = this.userId;
        this.InputLeavePolicy.IsActive = true;
        if (this.isFiscalYear == true) {
            this.InputLeavePolicy.IsFiscalYear = true;
        }
        else {
            this.InputLeavePolicy.IsFiscalYear = false;
        }

        if (this.forHalfLeave == true) {
            let parentQuery = `$filter=CalendarYear eq '${this.InputLeavePolicy.CalendarYear}' and LeaveId eq ${this.InputLeavePolicy.ParentId}`;
            this.leavePolicyService.getAll(parentQuery).subscribe((list: ILeavePolicy[]) => {
                this.halfLeaveInputPolicy = {
                    LeaveId: this.InputLeavePolicy.LeaveId,
                    CalendarYear: this.InputLeavePolicy.CalendarYear,
                    EffectiveDate: this.InputLeavePolicy.EffectiveDate,
                    NoOfDays: "0",
                    ServiceTypeId: list[0].ServiceTypeId,
                    IsAccumulation: list[0].IsAccumulation,
                    AccumulationDays: list[0].AccumulationDays,
                    IsEarnleave: list[0].IsEarnleave,
                    IsCompensationLeave: list[0].IsCompensationLeave,
                    EarningSheduleDay: list[0].EarningSheduleDay,
                    ParentId: this.InputLeavePolicy.ParentId,
                    PostedBy: this.userId,
                    PostedOn: new Date(),
                    IsFiscalYear: this.InputLeavePolicy.IsFiscalYear,
                    EligibleExpFor: list[0].EligibleExpFor,
                    IsActive: true
                }
                saveItem = Object.assign({}, this.halfLeaveInputPolicy);
                this.updateLeavePolicyStatus(saveItem.LeaveId).then((result) => {
                    if (result == true) {
                        this.leavePolicyService.post(saveItem)
                            .subscribe(() => {
                                this.isAddEditToggle = false;
                                this.InputLeavePolicy = <ILeavePolicy>{};
                                this.getAllLeavePolicy();
                                this.hideModal();
                                var toastOptions: ToastOptions = {
                                    title: "Added",
                                    msg: "Leave Policy has been successfully Added",
                                    showClose: true,
                                    timeout: 5000,
                                    theme: 'bootstrap'
                                };
                                this.toastyService.success(toastOptions);
                            });
                    }
                });
            });
        }
        else {
            saveItem = Object.assign({}, this.InputLeavePolicy);
            this.updateLeavePolicyStatus(saveItem.LeaveId).then((result) => {
                if (result == true) {
                    this.leavePolicyService.post(saveItem)
                        .subscribe(() => {
                            this.isAddEditToggle = false;
                            this.InputLeavePolicy = <ILeavePolicy>{};
                            this.getAllLeavePolicy();
                            this.hideModal();
                            var toastOptions: ToastOptions = {
                                title: "Added",
                                msg: "Leave Policy has been successfully Added",
                                showClose: true,
                                timeout: 5000,
                                theme: 'bootstrap'
                            };
                            this.toastyService.success(toastOptions);
                        });
                }
            });
        }
            
    }

    public updateLeavePolicyStatus(leaveId: number): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            let filteredList: ILeavePolicy[] = this.leavePolicyList.filter(x => x.LeaveId == leaveId);
            if (filteredList.length > 0) {
                filteredList.forEach(item => {
                    let editObj: ILeavePolicy = {
                        LeavepolicyId: item.LeavepolicyId,
                        LeaveId: item.LeaveId,
                        CalendarYear: item.CalendarYear,
                        EffectiveDate: item.EffectiveDate,
                        NoOfDays: item.NoOfDays,
                        ServiceTypeId: item.ServiceTypeId,
                        IsAccumulation: item.IsAccumulation,
                        AccumulationDays: item.AccumulationDays,
                        IsEarnleave: item.IsEarnleave,
                        IsCompensationLeave: item.IsCompensationLeave,
                        EarningSheduleDay: item.EarningSheduleDay,
                        ParentId: item.ParentId,
                        PostedBy: item.PostedBy,
                        PostedOn: item.PostedOn,
                        ModifiedBy: this.userId,
                        ModifiedOn: new Date(),
                        IsFiscalYear: item.IsFiscalYear,
                        EligibleExpFor: item.EligibleExpFor,
                        IsActive: false
                    };
                    this.leavePolicyService.put(editObj.LeavepolicyId, editObj).subscribe(() => {
                        if (filteredList[filteredList.length - 1] == item) {
                            resolve(true);
                        }
                    });
                });
            }
            else {
                resolve(true);
            }
        });
    }

    public getLeavePolicy(id: number) {
        let query = `$expand=LeaveServiceType`;
        this.leavePolicyService.get(id, query)
            .subscribe((data: ILeavePolicy) => {
                this.InputLeavePolicy = data;
                this.leaveDateSelected = true;
                let effDate: Date = new Date(data.EffectiveDate);
                this.inputEffectiveDate = {
                    Year: effDate.getFullYear(),
                    Month: effDate.getMonth() + 1,
                    Date: effDate.getDate()
                };
                this.ServiceType = data.LeaveServiceType;
                if (data.LeaveServiceType.IsAccAndEarn == true) {
                    this.showAccumulationAndEarn = true;
                }
                if (data.IsAccumulation == true) {
                    this.showAccumulationDays = true;
                }
                if (data.IsEarnleave == true) {
                    this.showEarningScheduleDay = true;
                }
                this.isAddEditToggle = true;
                this.openEditModal();
                this.disableEdit();
            });
    }

    public editLeavePolicy(leavePolicyObj: ILeavePolicy) {
        let saveItem: ILeavePolicy;
        saveItem = {
            LeavepolicyId: leavePolicyObj.LeavepolicyId,
            LeaveId: leavePolicyObj.LeaveId,
            CalendarYear: leavePolicyObj.CalendarYear,
            EffectiveDate: leavePolicyObj.EffectiveDate,
            NoOfDays: leavePolicyObj.NoOfDays,
            ServiceTypeId: leavePolicyObj.ServiceTypeId,
            IsAccumulation: leavePolicyObj.IsAccumulation,
            AccumulationDays: leavePolicyObj.AccumulationDays,
            IsEarnleave: leavePolicyObj.IsEarnleave,
            EarningSheduleDay: leavePolicyObj.EarningSheduleDay,
            IsCompensationLeave: leavePolicyObj.IsCompensationLeave,
            ParentId: leavePolicyObj.ParentId,
            PostedOn: leavePolicyObj.PostedOn,
            PostedBy: leavePolicyObj.PostedBy,
            ModifiedBy: this.userId,
            ModifiedOn: new Date(),
            IsFiscalYear: leavePolicyObj.IsFiscalYear,
            EligibleExpFor: leavePolicyObj.EligibleExpFor,
            IsActive: leavePolicyObj.IsActive
        }
        this.leavePolicyService.put(saveItem.LeavepolicyId, saveItem)
            .subscribe(() => {
                this.getAllLeavePolicy();
                this.isEditLeavePolicy = false;
                this.InputLeavePolicy = <ILeavePolicy>{};
                this.hideModal();
                this.selectedLeavePolicyModalLoaded = false;

                var toastOptions: ToastOptions = {
                    title: "Edited",
                    msg: "Leave Policy has been successfully Edited",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

            });
    }

    public openEditModal() {
        this.isEditLeavePolicy = true;
        this.isAddLeavePolicy = false;
        this.selectedLeavePolicyModalLoaded = true;
        this.LeavePolicyModal.show();
    }

    public onLeaveEffectiveDateSelect(selectedDate: IInputDateVM) {
        this.inputEffectiveDate = selectedDate;
        let leaveDate = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date, 5, 45, 0, 0);
        leaveDate.setHours(0, 0, 0, 0);
        this.InputLeavePolicy.EffectiveDate = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date, 5, 45, 0, 0);

        if (leaveDate <= this.nepaliEnglishEndDate && leaveDate >= this.nepaliEnglishStartDate) {
            //this.invalidDate = false;
            if (this.leavePolicyList.filter(x => new Date(x.EffectiveDate).getTime() == leaveDate.getTime() && x.LeaveId == this.InputLeavePolicy.LeaveId).length > 0) {
                this.duplicateDate = true;
            }
            else {
                this.duplicateDate = false;
            }
        }
        //else {
        //    this.invalidDate = true;
        //}
    }

    public isAccumulationChecked(event: any) {
        if (event == true) {
            this.showAccumulationDays = true;
        }
        else {
            this.showAccumulationDays = false;
            this.InputLeavePolicy.AccumulationDays = null;
        }
    }

    public isEarnLeaveChecked(event: any) {
        if (event == true) {
            this.showEarningScheduleDay = true;
        }
        else {
            this.showEarningScheduleDay = false;
            this.InputLeavePolicy.EarningSheduleDay = null;
        }
    }

    public isYearlyLeave(serviceId: number) {
        this.leaveServiceTypeService.get(serviceId)
            .subscribe((one: ILeaveServiceType) => {
                if (one.IsAccAndEarn == true) {
                    this.showAccumulationAndEarn = true;
                }
                else {
                    this.showAccumulationAndEarn = false;
                    this.showAccumulationDays = false;
                    this.InputLeavePolicy.IsAccumulation = false;
                    this.InputLeavePolicy.AccumulationDays = null;
                    this.InputLeavePolicy.IsEarnleave = false;
                    this.showEarningScheduleDay = false;
                    this.InputLeavePolicy.EarningSheduleDay = null;
                }
            });
    }

    public leaveTypeChange(leaveTypeId: number) {
        this.loginStatusService.get(leaveTypeId)
            .subscribe((one: ILoginStatus) => {
                if (this.InputLeavePolicy.CalendarYear != null) {
                    this.onLeaveEffectiveDateSelect(this.inputEffectiveDate);
                }
                if (one.IsHalfLeave == true) {
                    this.forHalfLeave = true;
                    this.getParentLeaveType();
                }
                else {
                    this.forHalfLeave = false;
                    this.showAccumulationAndEarn = false;
                    this.showAccumulationDays = false;
                    this.showEarningScheduleDay = false;
                    this.InputLeavePolicy.NoOfDays = null;
                    this.InputLeavePolicy.ServiceTypeId = null;
                    this.InputLeavePolicy.IsAccumulation = false;
                    this.InputLeavePolicy.AccumulationDays = null;
                    this.InputLeavePolicy.IsEarnleave = false;
                    this.InputLeavePolicy.EarningSheduleDay = null;
                    this.InputLeavePolicy.IsCompensationLeave = null;
                }
            });
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
        this.getAllLeavePolicy(this.filterObj);
    }

    public getParentLeaveType() {
        let serviceTypeParam: string = "1";
        this.commonService.GetParentLeaveType(serviceTypeParam, this.isFiscalYear)
            .subscribe((data: ILoginStatus[]) => {
                this.parentLeaveList = data;
            });
    }

    public onCalendarYearChange(event: any) {
        if (this.isFiscalYear == false) {
            this.bSADCalService.get(event).subscribe((one: IBSADCal) => {
                this.nepaliEnglishStartDate = new Date(one.StartDate);
                this.nepaliEnglishEndDate = new Date(one.EndDate);
                this.inputEffectiveDate = <IInputDateVM>{
                    Year: this.nepaliEnglishStartDate.getFullYear(),
                    Month: this.nepaliEnglishStartDate.getMonth() + 1,
                    Date: this.nepaliEnglishStartDate.getDate()
                };
                this.leaveDateSelected = true;
                this.onLeaveEffectiveDateSelect(this.inputEffectiveDate);
            });
        }
        else {
            let query = `$filter=FyName eq '${event}'`;
            this.fiscalYearService.getAll(query).subscribe((list: IFgetFiscialyearID_Result[]) => {
                this.nepaliEnglishStartDate = new Date(list[0].StartDT);
                this.nepaliEnglishEndDate = new Date(list[0].EndDt);
                this.inputEffectiveDate = <IInputDateVM>{
                    Year: this.nepaliEnglishStartDate.getFullYear(),
                    Month: this.nepaliEnglishStartDate.getMonth() + 1,
                    Date: this.nepaliEnglishStartDate.getDate()
                };
                this.leaveDateSelected = true;
                this.onLeaveEffectiveDateSelect(this.inputEffectiveDate);
            });
        }
        
    }

    public checkDecimal(noOfDays: string) {
        this.validFormatNoOfDays = Utilities.isDecimal(noOfDays);
    }

    public checkAccumulationDays(noOfDays: number) {
        this.validFormatAccumulationDays = true;

        if (!Utilities.isNumber(noOfDays)) {
            this.validFormatAccumulationDays = false;
        } else {
            if (Number(noOfDays) < 0) {
                this.validFormatAccumulationDays = false;
            }
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

    public disableEdit() {
        if (this.isFiscalYear == true) {
            if (new Date(this.InputLeavePolicy.EffectiveDate).getTime() < new Date(this.NepaliFiscalYear2.StartDT).getTime()) {
                this.disableEditBtn = true;
            }
            else {
                this.disableEditBtn = false;
            }
        }
        else {
            if (new Date(this.InputLeavePolicy.EffectiveDate).getTime() < new Date(this.NepaliFiscalYear.StartDate).getTime()) {
                this.disableEditBtn = true;
            }
            else {
                this.disableEditBtn = false;
            }
        }
    }

    public isFormValid(bookForm: any): boolean {
        if (!bookForm.form.valid) {
            return false;
        }
        if (this.isAddEditToggle == true) {
            if(this.disableEditBtn == true) {
                return false;
            };
        }
        if (this.duplicateDate == true) {
            return false;
        }
        if (this.validFormatNoOfDays == false) {
            return false;
        }
        if (this.validFormatAccumulationDays == false) {
            return false;
        }
        return true;
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getAllLeavePolicy(this.filterObj);
    }
}
