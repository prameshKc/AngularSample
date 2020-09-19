import { Component, OnInit } from '@angular/core';
import { IFGetSalShtToTax_Reult, IFilterViewModel } from '../../models/ViewModels';
import { PayrollService } from '../../services/BaseService';
import { IBSADCal, INepaliMonthList, IPagination, IODataResult } from '../../models/Models';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { CsvService } from 'src/app/services/excel.service';

@Component({
    selector: 'tax-statement',
    templateUrl: 'taxStatement.component.html'
})
export class TaxStatementComponent implements OnInit {
    TaxStatementList: IFGetSalShtToTax_Reult[] = [];
    yearList: IBSADCal[] = [];
    monthList: INepaliMonthList[] = [];
    pagination: IPagination = <IPagination>{};
    isLoading: boolean;
    timeoutControl: any;

    gtotal: number = 0;

    //searching and sorting
    filterObj?: IFilterViewModel = <IFilterViewModel>{};
    filterByName: string;
    filterByMonth: string = "-1";
    filterByYear: string = "-1";
    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };

    //Date
    currentDate: Date = new Date();

    constructor(
        public csvService: CsvService,
        public datePickerFunctions: DatePickerFunctions,
        private payrollService: PayrollService
    ) { }

    ngOnInit() {
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.reset();
        this.getSalSht('filtered');
    }

    public reset() {
        this.filterByName = null;
        this.filterByYear = null;
        this.filterByMonth = null;
    }

    sortTable(sortAttribute: string) {
        if (sortAttribute != this.filterObj.SortingAttribute) {
            this.filterObj.SortingAttribute = sortAttribute;
            this.filterObj.Sort = 'true';
        } else {
            if (this.filterObj.Sort == 'false') {
                this.filterObj.Sort = 'true';
            } else {
                this.filterObj.Sort = 'false';
            }
        }

        this.getSalSht()
    }

    getSalSht(flag?: string) {
        this.isLoading = true;
        this.isLoading = true;
        if (this.timeoutControl) {
            clearTimeout(this.timeoutControl);
            this.timeoutControl = null;
        }
        this.timeoutControl = setTimeout(() => {
            this.payrollService.getSalShtToTax(Number(this.filterByYear), Number(this.filterByMonth), flag, this.pagination, this.filterObj, this.filterByName).subscribe((data: IODataResult<IFGetSalShtToTax_Reult[]>) => {
                setTimeout(() => {
                    this.isLoading = false;
                }, 1500);

                this.pagination.TotalItems = data.count;

                data.value.forEach(item => {
                    item.Amount = Math.abs(item.Amount);
                });

                this.TaxStatementList = data.value;

                // this.payrollService.getGTSalShtToTax(Number(this.filterByYear), Number(this.filterByMonth)).subscribe(data => {
                //     this.gtotal = data;
                // })
            })
        }, 900);
    }

    selectedEmployee(employee: any) {
        if (employee != null) {
            this.filterByName = employee.FirstName;
            this.filterByName += employee.MiddleName ? ' ' + employee.MiddleName : '';
            this.filterByName += ' ' + employee.LastName;
        } else {
            this.filterByName = null;
        }

        this.getSalSht('filtered');
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getSalSht('filtered');
    }

    generateCSV() {
        this.csvService.download(this.TaxStatementList, `HRMS Salary Sheet (Tax Statement) -${this.filterByYear} ${this.filterByMonth}`);
    }
}