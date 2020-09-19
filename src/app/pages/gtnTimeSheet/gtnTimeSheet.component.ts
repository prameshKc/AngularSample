import { Component, Injectable, ViewChild } from '@angular/core';
import { GtnTimeSheetService, GtnJobCodeService, UserService } from '../../services/BaseService';
import { IGtnTimeSheet, IGtnJobCode, IUser, IPagination } from '../../models/Models';
import { IFilterViewModel, IGtnTimeSheetVM } from '../../models/ViewModels';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';

import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    selector: 'gtn-time-sheet',
    templateUrl: 'gtnTimeSheet.component.html'
})
export class GtnTimeSheetComponent {
    userId: string;
    InputTimeSheetVM: IGtnTimeSheetVM = <IGtnTimeSheetVM>{};
    InputTimeSheet: IGtnTimeSheet = <IGtnTimeSheet>{};
    addTimeSheet: boolean = false;
    timeSheetListVM: IGtnTimeSheetVM[] = [];
    timeSheetList: IGtnTimeSheet[] = [];

    inputDate: IInputDateVM;
    currentDateVM: IInputDateVM;
    inputDateOptions: IDatePickerOptionsVM;
    currentDate: Date = new Date();
    incorrectJobCode: boolean = false;
    isNotNineDigit: boolean = false;
    displayTimeList: IGtnTimeSheetVM[] = [];
    filteredDisplayTimeList: IGtnTimeSheet[] = [];
    employeeName: string;
    userDetail: IUser = <IUser>{};
    requiredEmployeeId: number;
    pagination: IPagination;
    isEditTimeSheet: boolean = false;

    constructor(
        public timeSheetService: GtnTimeSheetService,
        public jobCodeService: GtnJobCodeService,
        public userService: UserService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.requiredEmployeeId = parseInt(localStorage.getItem('EmployeeId'));
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.currentDate.setHours(0, 0, 0, 0);
        this.inputDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
        this.currentDateVM = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
        this.inputDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: this.currentDateVM
        };
        this.getEmployeeByUser();
        this.getTimeSheet();
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
            });
    }

    public getTimeSheet(filterObj?: IFilterViewModel) {
        let query = `$expand=JobCode1,BillTypeStatus &$filter=PostedBy eq '${this.userId}' &$orderby=Date desc`;
        //if (filterObj != undefined || filterObj != null) {
        //    if (filterObj.Sort != undefined && filterObj.Sort != "") {
        //        if (filterObj.Sort == 'true') {
        //            if (query != null && query != "") {
        //                query += "&$orderby=" + filterObj.SortingAttribute;
        //            }
        //            else {
        //                query += "$orderby=" + filterObj.SortingAttribute;
        //            }
        //        }
        //    }
        //}
        //else {
        //    query += "&$orderby=Date desc";
        //}
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        this.timeSheetService.getAll(query).subscribe((data: any) => {
            this.displayTimeList = data.value;
            this.pagination = {
                ItemsPerPage: this.pagination.ItemsPerPage,
                TotalItems: <number>(data["odata.count"]),
                CurrentPage: this.pagination.CurrentPage,
                SortBy: this.pagination.SortBy
            };
        });
    }

    public addAnotherTimeSheet(timeSheetVMObj: IGtnTimeSheet) {
        this.addTimeSheet = true;
        this.timeSheetListVM.push(timeSheetVMObj);
        let timeSheetObj: IGtnTimeSheet = {
            ID: 0,
            Date: timeSheetVMObj.Date,
            Billable_Non: timeSheetVMObj.Billable_Non,
            JobCode: timeSheetVMObj.JobCode,
            Hour: timeSheetVMObj.Hour,
            Remarks: timeSheetVMObj.Remarks,
            PostedBy: this.userId,
            PostedOn: new Date()
        }
        this.timeSheetList.push(timeSheetObj);
        this.InputTimeSheetVM = <IGtnTimeSheetVM>{};
        this.inputDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
        this.onDateSelect(this.inputDate);
    }

    public removeTimeSheet(index: number) {
        this.timeSheetListVM.splice(index, 1);
        this.timeSheetList.splice(index, 1);
    }

    public onJobCodeChange(event: any) {
        if (event.length > 9) {
            this.isNotNineDigit = true
        }
        let query = `$filter=startswith(JobCode1,'${event}')`;
        if (this.InputTimeSheetVM.Billable_Non == 1) {
            query += ` and ClientCode ne null`;
        }
        else {
            query += ` and ClientCode eq null`;
        }
        this.jobCodeService.getAll(query)
            .subscribe((list: IGtnJobCode[]) => {
                if (list.length > 0) {
                    this.incorrectJobCode = false;
                    if (event.length == 9) {
                        this.InputTimeSheetVM.JobCode = list.filter(x => x.JobCode1 == event)[0].ID;
                    }
                }
                else {
                    this.incorrectJobCode = true;
                }
            });
    }

    onDateSelect(selectedDate: IInputDateVM) {
        this.inputDate = selectedDate;
        this.InputTimeSheetVM.Date = new Date(this.inputDate.Year, this.inputDate.Month - 1, this.inputDate.Date, 5, 45, 0, 0);
    }

    public saveTimeSheet() {
        this.timeSheetList.forEach(item => {
            this.timeSheetService.post(item).subscribe(() => {
                this.onPageSelect(this.pagination);
                this.InputTimeSheetVM = <IGtnTimeSheetVM>{};
                this.timeSheetListVM = [];
                this.timeSheetList = [];
                this.addTimeSheet = false;
                var toastOptions: ToastOptions = {
                    title: "Added",
                    msg: "Time Sheet has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);
            });
        })
    }

    public cancel() {
        this.InputTimeSheetVM = <IGtnTimeSheetVM>{};
        this.timeSheetListVM = [];
        this.timeSheetList = [];
        this.addTimeSheet = false;
    }

    public setBillType(billtype: string) {
        this.InputTimeSheetVM.BillType = billtype;
        this.InputTimeSheetVM.JobCodeInString = null;
    }

    public getOneTimeSheet(id: number) {
        this.timeSheetService.get(id).subscribe((one: IGtnTimeSheet) => {
            this.InputTimeSheetVM = one;
            this.jobCodeService.get(one.JobCode).subscribe((jb: IGtnJobCode) => {
                this.InputTimeSheetVM.JobCodeInString = jb.JobCode1;
                this.isEditTimeSheet = true;
                let tDate: Date = new Date(one.Date);
                this.inputDate = {
                    Year: tDate.getFullYear(),
                    Month: tDate.getMonth() + 1,
                    Date: tDate.getDate()
                };
            });
        });
    }

    public editLeavePolicy(obj: IGtnTimeSheetVM) {
        let editObj: IGtnTimeSheet = {
            ID: obj.ID,
            Date: obj.Date,
            Billable_Non: obj.Billable_Non,
            JobCode: obj.JobCode,
            Hour: obj.Hour,
            Remarks: obj.Remarks,
            PostedBy: obj.PostedBy,
            PostedOn: obj.PostedOn,
            ModifiedBy: this.userId,
            ModifiedOn: new Date()
        }

        this.timeSheetService.put(editObj.ID, editObj).subscribe(() => {
            this.onPageSelect(this.pagination);
            this.isEditTimeSheet = false;
            this.InputTimeSheetVM = <IGtnTimeSheetVM>{};
            var toastOptions: ToastOptions = {
                title: "Added",
                msg: "Time Sheet has been successfully Edited",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
        });
    }

    public cancelEdit() {
        this.onPageSelect(this.pagination);
        this.isEditTimeSheet = false;
        this.InputTimeSheetVM = <IGtnTimeSheetVM>{};
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getTimeSheet();
    }
}