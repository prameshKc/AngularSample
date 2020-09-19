import { Component, OnInit } from '@angular/core';
import { IFGetSalShtToPF_Reult, IFilterViewModel, IFGetSalShtToCIT_Reult } from '../../models/ViewModels';
import { PayrollService, UserService, BSADCalService, NepaliMonthListService, FiscalYearService } from '../../services/BaseService';
import { IBSADCal, INepaliMonthList, IPagination, IODataResult } from '../../models/Models';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { ToastyService } from 'ngx-toasty';
import { CsvService } from 'src/app/services/excel.service';

@Component({
    selector: 'cit-statement',
    templateUrl: 'citStatement.component.html'
})
export class CITStatementComponent implements OnInit {
    citStatementList: IFGetSalShtToPF_Reult[] = [];
    yearList: IBSADCal[] = [];
    monthList: INepaliMonthList[] = [];
    pagination: IPagination = <IPagination>{};
    isLoading: boolean;
    timeoutControl: any;

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
        private csvService: CsvService,
        private userService: UserService,
        private bsADCalService: BSADCalService,
        private nepaliMonthService: NepaliMonthListService,
        public datePickerFunctions: DatePickerFunctions,
        private fiscalYearService: FiscalYearService,
        private payrollService: PayrollService,
        private toastyService: ToastyService
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

    getSalSht(flag?: string) {
        this.isLoading = true;
        if (this.timeoutControl) {
            clearTimeout(this.timeoutControl);
            this.timeoutControl = null;
        }
        this.timeoutControl = setTimeout(() => {
            this.payrollService.getSalShtToCIT(Number(this.filterByYear), Number(this.filterByMonth), flag, this.pagination, this.filterObj, this.filterByName).subscribe((data: IODataResult<IFGetSalShtToCIT_Reult[]>) => {
                setTimeout(() => {
                    this.isLoading = false;
                }, 1500);

                this.pagination.TotalItems = data.count;

                data.value.forEach(item => {
                    item.Amount = Math.abs(item.Amount);
                });

                this.citStatementList = data.value;
            })
        }, 900);
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

        this.getSalSht('filtered');
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
        this.csvService.download(this.citStatementList, `HRMS Salary Sheet (PF Statement) -${this.filterByYear} ${this.filterByMonth}`);
    }
}