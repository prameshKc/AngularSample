import { Component } from '@angular/core';
import { TimeSheetService, JobCodeService, UserService, SupervisorListService } from '../../services/BaseService';
import { ITimeSheet, IJobCodeGenerate, IUser, IPagination, IEmployee } from '../../models/Models';
import { ITimeSheetVM } from '../../models/ViewModels';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';

import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';

@Component({
    templateUrl: 'timeSheet.component.html'
})
export class TimeSheetComponent {
    userId: string;
    InputTimeSheetVM: ITimeSheetVM = <ITimeSheetVM>{};
    InputTimeSheet: ITimeSheet = <ITimeSheet>{};
    addTimeSheet: boolean = false;
    timeSheetListVM: ITimeSheetVM[] = [];
    timeSheetList: ITimeSheet[] = [];

    inputDate: IInputDateVM;
  currentDateVM: IInputDateVM;
  fromDateOptions: IDatePickerOptionsVM;
  tillDateOptions: IDatePickerOptionsVM;
    inputDateOptions: IDatePickerOptionsVM;
    currentDate: Date = new Date();
    incorrectJobCode: boolean = false;
    isNotEightDigit: boolean = false;
    displayTimeList: ITimeSheet[] = [];
    filteredDisplayTimeList: ITimeSheet[] = [];
    selfRequest: boolean = false;
    employeeName: string;
    userDetail: IUser = <IUser>{};
    requiredEmployeeId: number;
    pagination: IPagination;

    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };

    isEditTimeSheet: boolean = false;

    constructor(
        public timeSheetService: TimeSheetService,
        public jobCodeService: JobCodeService,
        public userService: UserService,
        public supervisorListService: SupervisorListService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
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
                this.requiredEmployeeId = this.userDetail.EmployeeId;
            });
    }

    public getTimeSheet() {
        let query = `$expand=JobCodeGenerate &$filter=PostedBy eq '${this.userId}' &$orderby=Date desc`;
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


    public addAnotherTimeSheet(timeSheetVMObj: ITimeSheet) {
        this.addTimeSheet = true;
        this.timeSheetListVM.push(timeSheetVMObj);
        let timeSheetObj: ITimeSheet = {
            Id: 0,
            EmployeeId: this.requiredEmployeeId,
            Date: timeSheetVMObj.Date,
            JobCodeId: timeSheetVMObj.JobCodeId,
            Hours: timeSheetVMObj.Hours,
            Remarks: timeSheetVMObj.Remarks,
            PostedBy: this.userId,
            PostedOn: new Date()
        }
        this.timeSheetList.push(timeSheetObj);
        this.InputTimeSheetVM = <ITimeSheetVM>{};
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
        if (event.length > 8) {
            this.isNotEightDigit = true
        }
        let query = `$filter=startswith(JobCode,'${event}')`;
        this.jobCodeService.getAll(query)
            .subscribe((list: IJobCodeGenerate[]) => {
                if (list.length > 0) {
                    this.incorrectJobCode = false;
                    if (event.length == 8) {
                        this.InputTimeSheetVM.JobCodeId = list.filter(x => x.JobCode == event)[0].Id;
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
                this.getTimeSheet();
                this.InputTimeSheetVM = <ITimeSheetVM>{};
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
        this.InputTimeSheetVM = <ITimeSheetVM>{};
        this.timeSheetListVM = [];
        this.timeSheetList = [];
        this.addTimeSheet = false;
    }

    public getOneTimeSheet(id: number) {
        this.timeSheetService.get(id).subscribe((one: ITimeSheet) => {
            this.InputTimeSheetVM = one;
            this.jobCodeService.get(one.JobCodeId).subscribe((jb: IJobCodeGenerate) => {
                this.InputTimeSheetVM.JobCode = jb.JobCode;
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

    public editLeavePolicy(obj: ITimeSheetVM) {
        let editObj: ITimeSheet = {
            Id: obj.Id,
            EmployeeId: obj.EmployeeId,
            Date: obj.Date,
            JobCodeId: obj.JobCodeId,
            Hours: obj.Hours,
            Remarks: obj.Remarks,
            PostedBy: obj.PostedBy,
            PostedOn: obj.PostedOn,
            ModifiedBy: this.userId,
            ModifiedOn: new Date()
        }

        this.timeSheetService.put(editObj.Id, editObj).subscribe(() => {
            this.onPageSelect(this.pagination);
            this.isEditTimeSheet = false;
            this.InputTimeSheetVM = <ITimeSheetVM>{};
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
        this.InputTimeSheetVM = <ITimeSheetVM>{};
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getTimeSheet();
    }
    selectedEmployee(employee: IEmployee){
        this.requiredEmployeeId = employee.EmployeeId;
        this.getEmployeeByUser();
    }
}
