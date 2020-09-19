import { Component, Injectable, ViewChild } from '@angular/core';
import {
    UserService, BSADCalService, NepaliMonthListService,
    HRLeaveNoOfdaysService, HRLeaveRecordListService, LoginReportService,
    CommonService, HRLeaveService
} from '../../services/BaseService';
import {
    IPagination, IUser, IODataResult,
    IEmployee, IBSADCal, INepaliMonthList,
    IHRLeaveNoOfDays, IFGetLeaveRecord, ILoginReport,
    ILeaveDeductDetail, IHRLeave
} from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { ToastyService, ToastOptions } from 'ngx-toasty';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';

@Component({
    templateUrl: 'hRLeave.component.html'
})
export class HRLeaveComponent {
    isAddEditToggle: boolean = false;
    userDetails: IUser = <IUser>{};
    currentEmpId: number;
    currentDate: Date;
    isAdmin: boolean = false;
    leaveList: IFGetLeaveRecord[] = [];
    userId: string;
    toggleSort: boolean = false;

    //for pagination
    pagination?: IPagination;

    //searching and sorting
    filterObj?: IFilterViewModel;
    filterByName: string;
    filterByMonth: string;
    filterByYear: string;
    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };

    yearList: IBSADCal[] = [];
    monthList: INepaliMonthList[] = [];
    dayList: IHRLeaveNoOfDays[] = [];
    loginReportList: ILoginReport[] = [];
    absentDeductRatio: string;
    isLCIECO: boolean;
    unpaidHalfLeaveId: number;
    unpaidLeaveId: number;
    leaveDeductCalc: string;
    leaveValidTill: number;
    leaveDeductDetail: ILeaveDeductDetail = <ILeaveDeductDetail>{};
    dataAlreadyExist: boolean = false;

    constructor(
        private userService: UserService,
        private leaveListService: HRLeaveRecordListService,
        private bsADCalService: BSADCalService,
        private nepaliMonthService: NepaliMonthListService,
        private dayService: HRLeaveNoOfdaysService,
        public datePickerFunctions: DatePickerFunctions,
        private loginReportService: LoginReportService,
        private commonService: CommonService,
        private hrLeaveService: HRLeaveService,
        private toastyService: ToastyService
    ) {
        this.userId = localStorage.getItem('UserId');
        this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
        this.currentDate = new Date();
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.filterObj = { Name: '', Sort: 'True', SortingAttribute: 'EmployeeName', SearchBy: '' };
        this.getDay();
        this.reset();
        this.checkAlreadyExist().then((data) => {
            this.dataAlreadyExist = data;
        });
    }

    public getDay() {
        this.dayService.getAll().subscribe((list: IHRLeaveNoOfDays[]) => {
            this.dayList = list;

            this.dayList.forEach(item => {
                item.NumOfDays = Number(item.NumOfDays);
            });
        });
    }

    public changedYear(event: string) {
        this.checkAlreadyExist().then((data) => {
            this.dataAlreadyExist = data;
            this.onEmpPageSelect(this.pagination);
        });
    }

    public changedMonth(event: string) {
        this.checkAlreadyExist().then((data) => {
            this.dataAlreadyExist = data;
            this.onEmpPageSelect(this.pagination);
        });
    }

    public checkAlreadyExist(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            let query = `$filter=Year eq ${this.filterByYear} and Month eq ${this.filterByMonth}`;
            this.hrLeaveService.getAll(query).subscribe((list: IHRLeave[]) => {
                if (list.length > 0) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
    }

    public selectedEmployee(event: IEmployee) {
        if (event != null) {
            this.filterByName = event.FirstName;
            if (event.MiddleName != null) {
                this.filterByName += " " + event.MiddleName;
            }
            if (event.LastName != null) {
                this.filterByName += " " + event.LastName;
            }
            this.onEmpPageSelect(this.pagination);
        }
    }

    public staffInfoAndFilter() {
        this.resetPagination();
        this.filterObj = { Name: '', Sort: 'True', SortingAttribute: 'EmployeeName', SearchBy: '' };
        this.onEmpPageSelect(this.pagination);
    }

    public getUserDetails() {
        var query = "$select=*,Employee/ReportTo/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee,Employee/ReportTo,MenuTemplate/MenuVsTemplate";
        this.userService.get(this.userId, query).subscribe((data: IUser) => {
            this.userDetails = data;
            this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);

            let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
            this.getEmployeeLeaveDetails(this.filterObj);
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

    public reset() {
        this.filterByName = null;
        this.onEmpPageSelect(this.pagination);
    }

    public getEmployeeLeaveDetails(filterObj: IFilterViewModel) {
        this.filterByName = this.filterByName != null ? this.filterByName : "-1";

        if (this.userDetails.Employee.ReportTo != null || typeof this.userDetails.Employee.ReportTo != undefined) {
            if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
                this.getLeaveList(-1, filterObj);
            }
            else {
                this.getLeaveList(this.currentEmpId, filterObj);
            }
        }
    }

    getLeaveList(currentEmpId: number, filterObj: IFilterViewModel) {
        let startDate = this.datePickerFunctions.FGetDateAD(parseInt(this.filterByYear), parseInt(this.filterByMonth), 1);
        let endDate = this.datePickerFunctions.FGetDateAD(parseInt(this.filterByYear), parseInt(this.filterByMonth), this.datePickerFunctions.FGetDaysInMonth(parseInt(this.filterByYear), parseInt(this.filterByMonth)));
        let startDateInString = this.getDateInString(startDate);
        let endDateInString = this.getDateInString(endDate);
        this.leaveList = [];

        this.leaveListService.GetLeaveList(
            -1,
            this.pagination,
            filterObj,
            this.filterByYear,
            this.filterByMonth,
            this.filterByName,
            startDateInString,
            endDateInString
        ).subscribe((data: IODataResult<IFGetLeaveRecord[]>) => {
            this.leaveList = data.value;
            //this.leaveList.forEach((item, index) => {
            //    this.LeaveDeduct(item.EmployeeId).then((leaveData) => {
            //        if (this.dataAlreadyExist == false) {
            //            item.Day = leaveData.NoOfDaysId;
            //        }
            //        else {
            //            if (item.Day == null) {
            //                item.Day = -1;
            //            }
            //        }
            //        item.UnpaidCount = leaveData.UnpaidCount;
            //        item.AbsentCount = leaveData.AbsentCount;
            //        item.LateAndEarlyCount = leaveData.LateAndEarlyCount;
            //        item.TotalCount = leaveData.TotalCount;
            //        if (index + 1 == this.leaveList.length) {
            //            this.pagination = {
            //                ItemsPerPage: this.pagination.ItemsPerPage,
            //                TotalItems: data.count,
            //                CurrentPage: this.pagination.CurrentPage,
            //                SortBy: this.pagination.SortBy
            //            };
            //        }
            //    });
            //});
        });
    }

    public LeaveDeduct(empId: number): Promise<ILeaveDeductDetail> {
        return new Promise<ILeaveDeductDetail>((resolve) => {
            let startDate = this.datePickerFunctions.FGetDateAD(parseInt(this.filterByYear), parseInt(this.filterByMonth), 1);
            let endDate = this.datePickerFunctions.FGetDateAD(parseInt(this.filterByYear), parseInt(this.filterByMonth), this.datePickerFunctions.FGetDaysInMonth(parseInt(this.filterByYear), parseInt(this.filterByMonth)));
            let startDateInString = this.getDateInString(startDate);
            let endDateInString = this.getDateInString(endDate);
            let numOfDaysId: any;
            this.getDay();
            let query = `$filter=EmployeeId eq ${empId} and TDate ge datetime'${startDateInString}' and TDate le datetime'${endDateInString}'`;
            this.loginReportService.getAll(query).subscribe((list: ILoginReport[]) => {
                this.loginReportList = list;

                let absentCount: number = list.filter(x => x.LoginStatusId == 22).length;
                let unpaidHalfLeaveCount: number = list.filter(x => x.LoginStatusId == this.unpaidHalfLeaveId).length;
                let unpaidLeaveCount: number = list.filter(x => x.LoginStatusId == this.unpaidLeaveId).length;

                let LCICount: number = list.filter(x => x.LoginStatusId == 2).length;
                let CIECOCount: number = list.filter(x => x.LoginStatusId == 4).length;
                let LCICOCount: number = list.filter(x => x.LoginStatusId == 5).length;
                let LCIECOCount: number = list.filter(x => x.LoginStatusId == 6).length;
                let DNLOCount: number = list.filter(x => x.LoginStatusId == 20).length;
                let LateAndEarlyDeduct: number = LCICount + CIECOCount + LCICOCount + LCIECOCount + DNLOCount;
                //console.log(list.filter(x => x.LoginStatusId == 2 || x.LoginStatusId == 4 || x.LoginStatusId == 5 || x.LoginStatusId == 6 || x.LoginStatusId == 20).length)

                let unpaidCalc = unpaidLeaveCount + (unpaidHalfLeaveCount / 2);
                let absentCalc = parseFloat(this.absentDeductRatio) * absentCount;
                let lateAndEarlyCalc: number = 0;
                let totalCalc: number;

                if (this.isLCIECO == true) {
                    lateAndEarlyCalc = LateAndEarlyDeduct / (this.leaveValidTill + 1);
                    totalCalc = unpaidCalc + absentCalc + parseInt(lateAndEarlyCalc.toString());
                    this.leaveDeductCalc = totalCalc.toString();
                    if (parseFloat(this.leaveDeductCalc) > 32) {
                        this.leaveDeductCalc = this.datePickerFunctions.FGetDaysInMonth(parseInt(this.filterByYear), parseInt(this.filterByMonth)).toString();
                    }
                }
                else {
                    totalCalc = unpaidCalc + absentCalc;
                    this.leaveDeductCalc = totalCalc.toString();
                }
                numOfDaysId = this.dayList.filter(x => parseFloat(x.NumOfDays) == parseFloat(this.leaveDeductCalc))[0].NumOfDays;
                this.leaveDeductDetail = {
                    NoOfDaysId: numOfDaysId,
                    UnpaidCount: unpaidCalc,
                    AbsentCount: absentCalc,
                    LateAndEarlyCount: parseInt(lateAndEarlyCalc.toString()),
                    TotalCount: totalCalc
                };
                resolve(this.leaveDeductDetail);
            });

        });
    }

    public getParams() {
        this.commonService.getPValue('LDRFA').subscribe((data: string) => {
            this.absentDeductRatio = data;
        });
        this.commonService.getPValue('LDFLCI').subscribe((one: string) => {
            if (one == "true") {
                this.isLCIECO = true;
            }
            else {
                this.isLCIECO = false;
            }
        });
        this.commonService.getPValue('UHL').subscribe((data: string) => {
            this.unpaidHalfLeaveId = parseInt(data);
        });
        this.commonService.getPValue('UPL').subscribe((data: string) => {
            this.unpaidLeaveId = parseInt(data);
        });
        this.commonService.getPValue('LVT').subscribe((data: string) => {
            this.leaveValidTill = parseInt(data);
        });
    }

    public getDateInString(input: Date): string {
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
        let remarksDateInString = year.toString() + "-" + monthInString + "-" + dateInString;
        return remarksDateInString;
    }

    public saveLeaveDeduct() {
        let saveItem: IHRLeave = <IHRLeave>{};
        let day: number;
        this.leaveList.forEach((item, index) => {
            saveItem = {
                StaffId: item.EmployeeId,
                Year: parseInt(this.filterByYear),
                Month: parseInt(this.filterByMonth),
                Day: item.Day.toString(),
                PostedBy: this.userId,
                PostedOn: new Date()
            }
            this.hrLeaveService.post(saveItem).subscribe(() => {
                if (index + 1 == this.leaveList.length) {
                    var toastOptions: ToastOptions = {
                        title: "Success",
                        msg: "Leave Deduct Information has been successfully Added",
                        showClose: true,
                        timeout: 5000,
                        theme: 'bootstrap'
                    };
                    this.toastyService.success(toastOptions);
                    this.checkAlreadyExist().then((data) => {
                        this.dataAlreadyExist = data;
                        this.onEmpPageSelect(this.pagination);
                    });
                    this.isAddEditToggle = false;
                }
            });
        });
    }

    public editLeaveDeduct() {
        let editItem: IHRLeave = <IHRLeave>{};
        let saveItem: IHRLeave = <IHRLeave>{};
        let day: number;
        let count: number = 0;
        this.leaveList.forEach((item, index) => {

            if (item.HRLeaveId == null) {
                saveItem = {
                    StaffId: item.EmployeeId,
                    Year: parseInt(this.filterByYear),
                    Month: parseInt(this.filterByMonth),
                    Day: (Number(item.Day) <= 0) ? '0' : item.Day.toString(),
                    PostedBy: this.userId,
                    PostedOn: new Date()
                }
                this.hrLeaveService.post(saveItem).subscribe(() => {
                    count = count + 1;
                    if (count == this.leaveList.length) {
                        var toastOptions: ToastOptions = {
                            title: "Success",
                            msg: "Leave Deduct Information has been successfully Edited",
                            showClose: true,
                            timeout: 5000,
                            theme: 'bootstrap'
                        };
                        this.toastyService.success(toastOptions);
                        this.checkAlreadyExist().then((data) => {
                            this.dataAlreadyExist = data;
                            this.onEmpPageSelect(this.pagination);
                        });
                    }
                });
            }
            else {
                editItem = {
                    Id: item.HRLeaveId,
                    StaffId: item.EmployeeId,
                    Year: item.Year,
                    Month: item.Month,
                    Day: (Number(item.Day) <= 0) ? '0' : item.Day.toString(),
                    PostedBy: item.PostedBy,
                    PostedOn: item.PostedOn,
                    ModifiedBy: this.userId
                }
                this.hrLeaveService.put(editItem.Id, editItem).subscribe(() => {
                    count = count + 1;
                    if (count == this.leaveList.length) {
                        var toastOptions: ToastOptions = {
                            title: "Success",
                            msg: "Leave Deduct Information has been successfully Edited",
                            showClose: true,
                            timeout: 5000,
                            theme: 'bootstrap'
                        };
                        this.toastyService.success(toastOptions);
                        this.checkAlreadyExist().then((data) => {
                            this.dataAlreadyExist = data;
                            this.onEmpPageSelect(this.pagination);
                        });
                    }
                });
            }
        });

    }

    public cancelLeaveDeduct() {
        this.onEmpPageSelect(this.pagination);
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
        this.onEmpPageSelect(this.pagination);
    }

    public resetPagination() {
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
    }

    onEmpPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        if (this.userDetails.Employee != null) {
            this.getEmployeeLeaveDetails(this.filterObj);
        } else {
            this.getUserDetails();
        }
    }
}