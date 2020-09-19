import { Component } from '@angular/core';
import {
    UserService, BSADCalService, NepaliMonthListService, PayrollService} from '../../services/BaseService';
import {
    IUser, IBSADCal, INepaliMonthList} from '../../models/Models';
import { IFGetSalarySlip_ResultVM } from '../../models/ViewModels';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { CsvService } from 'src/app/services/excel.service';

@Component({
    selector: 'salary-slip',
    templateUrl: "salarySlip.component.html"
})
export class SalarySlipComponent {
    // variables
    userDetails: IUser = <IUser>{};
    currentDate: Date = new Date();
    yearList: IBSADCal[] = [];
    monthList: INepaliMonthList[] = [];
    filterByYear: string;
    filterByMonth: string;
    employeeId: number;
    salarySlip: IFGetSalarySlip_ResultVM[] = [];
    salarySlipIn: IFGetSalarySlip_ResultVM[] = [];
    salarySlipEx: IFGetSalarySlip_ResultVM[] = [];

    GTIncome: number = 0;
    GTExpenses: number = 0;
    total: number = 0;

    isLoading: boolean = false;

    constructor(
        private csvService: CsvService,
        private bsADCalService: BSADCalService,
        private nepaliMonthService: NepaliMonthListService,
        private payrollService: PayrollService,
        private datePickerFunctions: DatePickerFunctions,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.employeeId = Number(localStorage.getItem('EmployeeId'));
        this.getUserDetails();
        this.getSalarySlip();
    }

    public getUserDetails() {
        let userId: string = localStorage.getItem('UserId');
        this.userService.get(userId, '$expand=Employee,Employee/EmployeePosition').subscribe(data => {
            this.userDetails = data;

        })
    }

    public getYear() {
        this.bsADCalService.getAll().subscribe((list: IBSADCal[]) => {
            let startDate = new Date();
            startDate.setFullYear(this.currentDate.getFullYear() - 6);

            let endDate = new Date();
            endDate.setFullYear(this.currentDate.getFullYear() + 6);

            let NepaliFiscalYear = list.filter(x => new Date(x.StartDate) >= startDate && new Date(x.EndDate) <= endDate);
            this.yearList = NepaliFiscalYear;

            this.filterByYear = this.yearList.filter(x => new Date(x.StartDate) <= new Date() && new Date(x.EndDate) >= new Date())[0].NYear.toString();
        });
    }

    public getMonth() {
        this.nepaliMonthService.getAll().subscribe((list: INepaliMonthList[]) => {
            this.monthList = list;

            let nepaliDate = this.datePickerFunctions.GetDateBS(new Date());
            this.filterByMonth = this.datePickerFunctions.GetBSMonth(nepaliDate).toString();
        });
    }

    public getSalarySlip() {
        this.isLoading = true;
        this.payrollService.getSalSlip(Number(this.filterByYear), Number(this.filterByMonth), this.employeeId).subscribe((data: IFGetSalarySlip_ResultVM[]) => {
            this.isLoading = false;

            this.getTotal(data);
            this.salarySlip = data;

            this.salarySlipIn = data.filter(x => x.AM <= 10);
            this.salarySlipEx = data.filter(x => x.AM > 10);

            this.salarySlip.forEach(item => {
                item.Amount = Number(parseFloat(Math.abs(item.Amount).toString()).toFixed(2));
            })
        }, () => {
            this.isLoading = false;
        })
    }

    public getTotal(data: IFGetSalarySlip_ResultVM[]) {
        this.GTIncome = 0;
        this.GTExpenses = 0;
        this.total = 0;
        data.forEach(item => {
            if (item.AM <= 10) {
                this.GTIncome += item.Amount;
            } else {
                this.GTExpenses += item.Amount;
            }
            this.total += item.Amount;
        });

        this.GTIncome = Number(parseFloat(Math.abs(this.GTIncome).toString()).toFixed(2));
        this.GTExpenses = Number(parseFloat(Math.abs(this.GTExpenses).toString()).toFixed(2));
        this.total = Number(parseFloat(this.total.toString()).toFixed(2));
    }

    public getFixed(amount: any) {
        return amount.toFixed(2);
    }

    generateCSV() {
        let csvData = [];
        csvData.push({ '': `HRMS Salary Slip -${this.userDetails.Employee.FirstName} ${this.userDetails.Employee.MiddleName ? this.userDetails.Employee.MiddleName + ' ' : ''}${this.userDetails.Employee.LastName} -${this.filterByYear}/${this.filterByMonth}` });
        csvData.push({ 0: 'Particulars', 1: 'Amount' });
        csvData.push({ '': '' });
        csvData.push({ '': 'Earnings' });
        this.salarySlip.forEach(item => {
            item.Amount = Number(parseFloat(Math.abs(item.Amount).toString()).toFixed(2));
            if (item.AM <= 10) {
                csvData.push({
                    0: item.AlDesc,
                    1: item.Amount
                });
            }
        });
        csvData.push({ 0: 'Gross Income', 1: this.GTIncome });
        csvData.push({ '': '' });
        csvData.push({ '': 'Deduction' });
        this.salarySlip.forEach(item => {
            item.Amount = Number(parseFloat(Math.abs(item.Amount).toString()).toFixed(2));
            if (!(item.AM <= 10)) {
                csvData.push({
                    0: item.AlDesc,
                    1: item.Amount
                });
            }
        });
        csvData.push({ 0: 'Gross Expenses', 1: this.GTExpenses });
        csvData.push({ '': '' });
        csvData.push({ 0: 'Net Salary', 1: this.total });

        this.csvService.download(csvData, `HRMS Salary Slip -${this.userDetails.Employee.FirstName}  ${this.userDetails.Employee.MiddleName ? this.userDetails.Employee.MiddleName + ' ' : ''}${this.userDetails.Employee.LastName} -${this.filterByYear}/${this.filterByMonth}`);
    }
}
