import { Component, OnInit } from '@angular/core';
import { IFGetSalShtToPF_Reult, IFilterViewModel } from '../../models/ViewModels';
import { PayrollService, UserService, BSADCalService, NepaliMonthListService, FiscalYearService } from '../../services/BaseService';
import { IBSADCal, INepaliMonthList, IPagination, IODataResult } from '../../models/Models';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { ToastyService } from 'ngx-toasty';
import { CsvService } from 'src/app/services/excel.service';

@Component({
    selector: 'pf-statement',
    templateUrl: 'pfStatement.component.html'
})
export class PFStatementComponent implements OnInit {
    pfStatementList: IFGetSalShtToPF_Reult[] = [];
    yearList: IBSADCal[] = [];
    monthList: INepaliMonthList[] = [];
    pagination: IPagination = <IPagination>{};

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
        this.getSalShtPF('all');
    }

    public reset() {
        this.filterByName = null;
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

        this.getSalShtPF()
    }

    getSalShtPF(flag?: string) {
        this.payrollService.getSalShtToPF(Number(this.filterByYear), Number(this.filterByMonth), flag, this.pagination, this.filterObj).subscribe((data: IODataResult<IFGetSalShtToPF_Reult[]>) => {
            
            data.value.forEach(item => {
                item.Amount = Math.abs(item.Amount);
            });
            this.pfStatementList = data.value;
            this.pagination.TotalItems = data.count;
        })
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getSalShtPF();
    }

    generateCSV() {
        this.csvService.download(this.pfStatementList, `HRMS Salary Sheet (PF Statement) -${this.filterByYear} ${this.filterByMonth}`);
    }
}