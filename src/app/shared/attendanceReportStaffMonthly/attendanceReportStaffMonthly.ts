import { Component, Input } from '@angular/core';
import { SupervisorListService, NepaliMonthListService, UserService, EmployeeService } from '../../services/BaseService';
import { IBSADCal, INepaliMonthList, IUser, IODataResult } from '../../models/Models';
import { BSADCal } from '../datepicker/models/datepickerDataStore';
import { DatePickerFunctions } from '../datepicker/modules/datepickerFunctions';
import { CsvService } from 'src/app/services/excel.service';

@Component({
    selector: 'hrMonthlyRep',
    templateUrl: 'attendanceReportStaffMonthly.html'
})
export class AttendanceReportStaffMonthly {
    @Input() EmpId: number;
    @Input() filterByYear: string;
    @Input() filterByMonth: string;

    userDetails: IUser = <IUser>{};
    currentDate: Date = new Date();
    yearList: IBSADCal[] = [];
    monthList: INepaliMonthList[] = [];

    hrMonthlyRepList: any = [];

    constructor(
        private nepaliMonthService: NepaliMonthListService,
        private datePickerFunctions: DatePickerFunctions,
        private userService: UserService,
        public supervisorListService: SupervisorListService,
        private employeeService: EmployeeService,
        public csvService: CsvService
    ) { }

    ngOnInit() {
        this.getYear();
        //this.getMonth();
        this.getEmployeeName();
        this.getEmpMonthlyLogin();
    }

    public getYear() {
        let startDate = new Date();
        startDate.setFullYear(this.currentDate.getFullYear() - 6);

        let endDate = new Date();
        endDate.setFullYear(this.currentDate.getFullYear() + 6);

        let NepaliFiscalYear = BSADCal.filter(x => new Date(x.StartDate) >= startDate && new Date(x.EndDate) <= endDate);
        this.yearList = NepaliFiscalYear;

        this.filterByYear = this.yearList.filter(x => new Date(x.StartDate) <= new Date() && new Date(x.EndDate) >= new Date())[0].NYear.toString();
    }

    //public getMonth() {
    //    this.nepaliMonthService.getAll().subscribe((list: INepaliMonthList[]) => {
    //        this.monthList = list;

    //        let nepaliDate = this.datePickerFunctions.GetDateBS(new Date());
    //        this.filterByMonth = this.datePickerFunctions.GetBSMonth(nepaliDate).toString();
    //    });
    //}

    employeeName: string;
    employeeNo: number;
    getEmpMonthlyLogin() {
        if (this.EmpId != null && this.filterByMonth != null && this.filterByYear != null) {
            this.supervisorListService.GetHRmonthlyRep(this.EmpId, this.filterByMonth, this.filterByYear).subscribe((data) => {
                this.hrMonthlyRepList = data;
            })
        }
    }

    getEmployeeName() {
        let query: string = '$select=FirstName,MiddleName,LastName,EmployeeNo';
        this.employeeService.get(this.EmpId, query).subscribe(data => {
            this.employeeName = data.FirstName;
            this.employeeName += data.MiddleName == null ? '' : ` ${data.MiddleName}`;
            this.employeeName += data.LastName == null ? '' : ` ${data.LastName}`;
            this.employeeNo = data.EmployeeNo;
        })
    }

    csvData: any[];
    downloadCSV() {
        if (this.employeeName) {
            this.csvService.download(this.hrMonthlyRepList.value, `HRMS_Employee_Login_CICO-${this.filterByMonth}_${this.filterByYear}-${this.employeeName}-${this.employeeNo}`);
        }
    }

}