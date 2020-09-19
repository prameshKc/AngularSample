import { Component, Injectable } from '@angular/core';
import { EmployeeAttendanceReportService, UserService, BSADCalService } from '../../services/BaseService';
import {
    IFGetAttenSummary_Result, IPagination, IUser,
    IBSADCal
} from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { ScalarFunction } from '../../shared/datepicker/modules/scalarFunctions';
import { CsvService } from 'src/app/services/excel.service';
import { IMonths } from '../../shared/datepicker/models/datepickerDataStore';

@Component({
    selector: 'employeeAttendanceDetail',
    templateUrl: 'employeeAttendanceDetail.component.html',
})
export class EmployeeAttendanceDetailComponent {
    userId: string;
    currentEmpId: number;
    attendanceDetail: IFGetAttenSummary_Result[] = [];
    displayAttendanceDetail: IFGetAttenSummary_Result[] = [];
    headingArray: { id: number, name: string; }[] = [];
    pagination?: IPagination;
    filterObj?: IFilterViewModel = <IFilterViewModel>{};
    userDetails: IUser;
    isAdmin: boolean = false;
    filterByMonth: number;
    filterByYear: number;
    currentDate: Date;
    toggleSort: boolean = true;
    NepaliFiscalYear: IBSADCal = <IBSADCal>{};
    NepaliFiscalYearList: IBSADCal[];
    NepaliMonthList: { id: number, month: string }[] = [
        { id: 1, month: "Baishakh" },
        { id: 2, month: "Jestha" },
        { id: 3, month: "Ashadh" },
        { id: 4, month: "Shrawan" },
        { id: 5, month: "Bhadra" },
        { id: 6, month: "Ashwin" },
        { id: 7, month: "Kartik" },
        { id: 8, month: "Mangsir" },
        { id: 9, month: "Poush" },
        { id: 10, month: "Magh" },
        { id: 11, month: "Falgun" },
        { id: 12, month: "Chaitra" },
    ];
    showAttendance: boolean = false;
    requiredEmployeeId: number;
    isFromAttendance: boolean = false;

    constructor(
        private employeeAttendanceReporttService: EmployeeAttendanceReportService,
        private userService: UserService,
        public bSADCalService: BSADCalService,
        public datePickerFunctions: DatePickerFunctions,
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
        this.currentDate = new Date();
        this.filterObj = { Name: "", Sort: "true", SortingAttribute: "EmployeeName", SearchBy: "" };
        this.getAllNepaliCalendarFiscalYear();
        this.getEmployeeId();
    }

    public getEmployeeId() {
        let query: string = "$expand=Employee,Employee/LoginReport,Employee/ReportTo,MenuTemplate/MenuVsTemplate";
        this.userService.get(localStorage.getItem("UserId"), query).subscribe((data: IUser) => {
            this.userDetails = data;
            this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
            if (this.userDetails.Employee.ReportTo != null || typeof this.userDetails.Employee.ReportTo != undefined) {
                if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
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

    public getAllEmployeeAttendance(filterObj: IFilterViewModel) {
        let startDate: Date;
        let endDate: Date;

        let x: ScalarFunction = new ScalarFunction();
        let newDate: string;
        let currentYear: number;
        let currentMonth: number;
        if (Number(localStorage.getItem('Param.DateType')) == 1) {
            let newDateAD: Date = new Date();
            currentYear = this.filterByYear ? Number(this.filterByYear) : newDateAD.getFullYear();
            currentMonth = this.filterByMonth ? Number(this.filterByMonth) : newDateAD.getMonth() + 1;
        } else {
            newDate = this.datePickerFunctions.FGetDateBS(new Date());
            currentYear = this.filterByYear ? Number(this.filterByYear) : this.datePickerFunctions.GetBSYear(newDate);
            currentMonth = this.filterByMonth ? Number(this.filterByMonth) : this.datePickerFunctions.GetBSMonth(newDate);
        }
        if (this.userDetails) {
            let empId: number;
            if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
                empId = -1
            }
            else {
                empId = this.currentEmpId;
            }
            if (Number(localStorage.getItem('Param.DateType')) == 1) {
                startDate = new Date(currentYear, currentMonth - 1, 1);
                endDate = new Date(currentYear, currentMonth, 0);
            } else {
                startDate = this.datePickerFunctions.FGetDateAD(currentYear, currentMonth, 1);
                endDate = this.datePickerFunctions.FGetDateAD(currentYear, currentMonth, this.datePickerFunctions.FGetDaysInMonth(currentYear, currentMonth));
            }
            this.getEmployeeAttendanceDetail(empId, startDate, endDate, filterObj);

        } else {
            this.getEmployeeId();
        }
    }

    getEmployeeAttendanceDetail(isAll: number, startDate: Date, endDate: Date, filterObj1: IFilterViewModel) {
        this.displayAttendanceDetail = [];
        this.employeeAttendanceReporttService.GetEmployeeAttendanceDetail(isAll, startDate, endDate, filterObj1)
            .subscribe((data: IFGetAttenSummary_Result[]) => {
                this.attendanceDetail = data;

                data.forEach(item => {
                    if (this.displayAttendanceDetail.filter(x => x.EmployeeId == item.EmployeeId).length == 0) {
                        this.displayAttendanceDetail.push(item);
                    }
                })
                this.getFormattedAttenTable();
            });
    }

    getLoginDays(employeeId: number, loginStatusId: number) {
        let x = this.attendanceDetail.filter(x => x.EmployeeId == employeeId && x.LoginStatusId == loginStatusId);
        if (x.length > 0) {
            return x[0].Days;
        } else {
            return 0;
        }
    }

    public getFormattedAttenTable() {
        let uniqueArray: string[] = [];
        this.headingArray = [];
        this.attendanceDetail.forEach(item => {
            let unique = uniqueArray.filter(x => x == item.StatusName).length;
            if (unique == 0) {
                uniqueArray.push(item.StatusName);

                this.headingArray.push({
                    id: item.LoginStatusId,
                    name: item.StatusName
                });
            }
        });
    }

    public getAllNepaliCalendarFiscalYear() {
        this.bSADCalService.getAll().subscribe((data: IBSADCal[]) => {
            this.NepaliFiscalYear = data.filter(x => new Date(x.StartDate) <= this.currentDate && new Date(x.EndDate) >= this.currentDate)[0];
            let NepaliFiscalYearPrevious = data.filter(x => x.NYear == this.NepaliFiscalYear.NYear - 1)[0];
            let NepaliFiscalYearPrevious2 = data.filter(x => x.NYear == this.NepaliFiscalYear.NYear - 2)[0];
            this.NepaliFiscalYearList = [];
            this.NepaliFiscalYearList.push(NepaliFiscalYearPrevious2);
            this.NepaliFiscalYearList.push(NepaliFiscalYearPrevious);
            this.NepaliFiscalYearList.push(this.NepaliFiscalYear);
        });
    }

    public onMonthChange() {
        this.getAllEmployeeAttendance(this.filterObj);
    }

    public reset() {
        let newDate: string;
        let currentYear: number;
        let currentMonth: number;

        if (Number(localStorage.getItem('Param.DateType')) == 1) {
            currentYear = this.filterByYear ? Number(this.filterByYear) : new Date().getFullYear();
            currentMonth = this.filterByMonth ? Number(this.filterByMonth) : new Date().getMonth() + 1;
        } else {
            newDate = this.datePickerFunctions.FGetDateBS(new Date());
            currentYear = this.filterByYear ? Number(this.filterByYear) : this.datePickerFunctions.GetBSYear(newDate);
            currentMonth = this.filterByMonth ? Number(this.filterByMonth) : this.datePickerFunctions.GetBSMonth(newDate);
        }
        this.getAllEmployeeAttendance(this.filterObj);
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
        this.getAllEmployeeAttendance(this.filterObj);
    }

    public showEmployeeLoginAtt(id: number) {
        this.requiredEmployeeId = id;
        this.showAttendance = true;
        this.isFromAttendance = true;
    }

    public exportToCSV(loginList: IFGetAttenSummary_Result[]) {
        let monthName: string = Number(localStorage.getItem('Param.DateType')) == 1 ? IMonths.filter(x => x.Id == this.filterByMonth)[0].EngName : IMonths.filter(x => x.Id == this.filterByMonth)[0].NepName;
        let yearName: string = this.NepaliFiscalYearList.filter(x => x.NYear == this.filterByYear)[0].NYear.toString();
        let dataList: any = [];
        let FileName: string = "";
        loginList.forEach(item => {
            let data = {
                "Employee Name": item.EmployeeName,
                "Department": item.DepartmentName,
                "Designation": item.DesignationName,
            }
            this.headingArray.forEach(headingItem => {
                data[headingItem.name] = this.getLoginDays(item.EmployeeId, headingItem.id);
            });
            dataList.push(data);
        });
        FileName = "MonthlyAttendanceSheet";
        if (this.filterByYear != null && this.filterByMonth != null) {
            FileName += "_" + yearName + "_" + monthName;
        }
        else if (this.filterByYear != null) {
            FileName += "_" + yearName;
        }
        else if (this.filterByMonth != null) {
            FileName += "_" + monthName;
        }
        this.csvService.download(dataList, FileName);
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        if (this.userDetails.Employee != null) {
            this.getAllEmployeeAttendance(this.filterObj);
        } else {
            this.getEmployeeId();
        }
    }
}