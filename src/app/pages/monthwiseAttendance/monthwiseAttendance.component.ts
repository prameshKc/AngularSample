import { Component } from '@angular/core';
import {
    EmployeeAttendanceReportService, UserService, BSADCalService
} from '../../services/BaseService';
import {
    IFgetMonthlyAttenRepEmpwise_Result, IPagination, IUser} from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { CsvService } from 'src/app/services/excel.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'monthwiseAttendance',
    templateUrl: 'monthwiseAttendance.component.html'
})
export class MonthwiseAttendanceComponent {
    userId: string;
    currentEmpId: number;
    monthlyAttendanceDetail: IFgetMonthlyAttenRepEmpwise_Result[] = [];
    displaymonthlyAttendanceDetail: IFgetMonthlyAttenRepEmpwise_Result[] = [];
    headingArray: { id: Date, name: string; }[] = [];
    pagination?: IPagination;
    filterObj?: IFilterViewModel = <IFilterViewModel>{};
    userDetails: IUser;
    isAdmin: boolean = false;
    filterByMonth: number;
    filterByYear: number;
    currentDate: Date;
    toggleSort: boolean = true;
    requiredEmployeeId: number;
    isFromAttendance: boolean = false;
    showAttendance: boolean = false;

    subscription: Observable<any>;

    constructor(
        private employeeAttendanceReportService: EmployeeAttendanceReportService,
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
        this.getEmployeeId();
    }

    public getEmployeeId() {
        let query: string = "$expand=Employee,Employee/LoginReport,Employee/ReportTo,MenuTemplate/MenuVsTemplate";
        this.userService.get(localStorage.getItem("UserId"), query).subscribe((data: IUser) => {
            this.userDetails = data;
            this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
            this.getAllEmployeeAttendance(this.filterObj);
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

        let newDate: string;
        let currentYear: number;
        let currentMonth: number;
        if (Number(localStorage.getItem('Param.DateType')) == 1) {
            let newDateAD: Date = new Date();
            currentYear = this.filterByYear ? Number(this.filterByYear) : newDateAD.getFullYear();
            currentMonth = this.filterByMonth ? Number(this.filterByMonth) : newDateAD.getMonth() + 1;
            startDate = new Date(currentYear, currentMonth - 1, 1);
            endDate = new Date(currentYear, currentMonth, 0);
        } else {
            newDate = this.datePickerFunctions.FGetDateBS(new Date());
            currentYear = this.filterByYear ? Number(this.filterByYear) : this.datePickerFunctions.GetBSYear(newDate);
            currentMonth = this.filterByMonth ? Number(this.filterByMonth) : this.datePickerFunctions.GetBSMonth(newDate);
            startDate = this.datePickerFunctions.FGetDateAD(currentYear, currentMonth, 1);
            endDate = this.datePickerFunctions.FGetDateAD(currentYear, currentMonth, this.datePickerFunctions.FGetDaysInMonth(currentYear, currentMonth));

        }
        if (this.userDetails) {
            let empId: number;
            if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
                empId = -1
            }
            else {
                empId = this.currentEmpId;
            }
            this.getEmployeeAttendanceDetail(empId, startDate, endDate, filterObj);

        } else{
            this.getEmployeeId();
        }

    }

    getEmployeeAttendanceDetail(isAll: number, startDate: Date, endDate: Date, filterObj1: IFilterViewModel) {
        this.displaymonthlyAttendanceDetail = [];
        this.employeeAttendanceReportService.GetMonthlyAttendanceDetail(isAll, startDate, endDate, filterObj1)
            .subscribe((data: IFgetMonthlyAttenRepEmpwise_Result[]) => {
                this.monthlyAttendanceDetail = data;

                data.forEach(item => {
                    if (this.displaymonthlyAttendanceDetail.filter(x => x.EmployeeId == item.EmployeeId).length == 0) {
                        this.displaymonthlyAttendanceDetail.push(item);
                    }
                })
                this.getFormattedAttenTable();
            });
    }

    getLoginStatus(employeeId: number, tDate: Date) {
        let x = this.monthlyAttendanceDetail.filter(x => x.EmployeeId == employeeId && x.TDate == tDate);
        if (x.length > 0) {
            return x[0].Status;
        } else {
            return "-";
        }
    }

    public getFormattedAttenTable() {
        let uniqueArray: string[] = [];
        this.headingArray = [];
        this.monthlyAttendanceDetail.forEach(item => {
            let unique = uniqueArray.filter(x => x == item.Ndate).length;
            if (unique == 0) {
                uniqueArray.push(item.Ndate);

                this.headingArray.push({
                    id: item.TDate,
                    name: item.Ndate
                });
                if (this.headingArray.length > 1) {
                    this.headingArray.sort(function (a, b) { return new Date(a.id).getTime() - new Date(b.id).getTime() });
                    //console.log(this.headingArray);
                }
            }
        });

    }

  public onPickerEvent(e: any, isYear: boolean) {
    if (isYear == true) this.filterByYear = e;
    else this.filterByMonth = e;
        this.getAllEmployeeAttendance(this.filterObj);
    }

    public reset() {
        this.filterByMonth = null;
        this.filterByYear = null;
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

    public exportToCSV(loginList: IFgetMonthlyAttenRepEmpwise_Result[]) {
        let monthName: string = this.filterByMonth.toString();
        let yearName: string = this.filterByYear.toString();
        let dataList: any = [];
        let FileName: string = "";
        loginList.forEach(item => {
            let data = {
                "Employee No": item.EmployeeNo,
                "Employee Name": item.EmployeeName,
                "Department": item.Department,
                "Designation": item.Designation,
            }
            this.headingArray.forEach(headingItem => {
                data[headingItem.name] = this.getLoginStatus(item.EmployeeId, headingItem.id);
            });
            dataList.push(data);
        });
        FileName = "DailyAttendanceSheet";
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

    public onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        if (this.userDetails.Employee != null) {
            this.getAllEmployeeAttendance(this.filterObj);
        } else {
            this.getEmployeeId();
        }
    }
}
