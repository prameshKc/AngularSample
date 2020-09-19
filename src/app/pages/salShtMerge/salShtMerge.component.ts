import { Component } from '@angular/core';
import {
    PayrollService, HRSSheet1Service
} from '../../services/BaseService';
import {
    IBSADCal, INepaliMonthList,
    IFiscalYear
} from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { CsvService } from 'src/app/services/excel.service';

@Component({
    selector: 'salary-sheet-merge',
    templateUrl: "salShtMerge.component.html"
})
export class SalarySheetMergeComponent {
    userId: string;
    yearList: IBSADCal[] = [];
    monthList: INepaliMonthList[] = [];
    fiscalYearList: IFiscalYear[] = [];
    isVerified: boolean = true;
    isLoading: boolean = false;
    svSSData: any[] = [];
    tempSSData: any[] = [];
    salShtth: SalSheetHeadings[] = [];
    csvJSONData: any[] = [];
    tableHead: TableHead[] = [];
    currentDate: Date;

    //searching and sorting
    filterObj?: IFilterViewModel;
    filterByName: string;
    filterBySMonth: string = "-1";
    filterBySYear: string = "-1";
    filterByEMonth: string = "-1";
    filterByEYear: string = "-1";
    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };

    constructor(
        public hrsSheet1Service: HRSSheet1Service,
        public datePickerFunctions: DatePickerFunctions,
        private payrollService: PayrollService,
        private csvService: CsvService
    ) { }

    ngOnInit() {
        this.userId = localStorage.getItem('UserId');
        this.currentDate = new Date();
        this.reset();

        this.filterObj = { Name: '', Sort: 'True', SortingAttribute: 'FirstName', SearchBy: '' };
        //this.getYear();
        //this.getMonth();
        this.reset();
    }

    public reset() {
        this.filterByName = null;
        //let BSDate: string = this.datePickerFunctions.FGetDateBS(new Date());
        this.filterBySYear = "-1";
        this.filterBySMonth = "-1";
        this.filterByEYear = "-1";
        this.filterByEMonth = "-1";
    }

    //public getYear() {
    //    this.bsADCalService.getAll().subscribe((list: IBSADCal[]) => {
    //        let NepaliFiscalYear = list.filter(x => new Date(x.StartDate) <= this.currentDate && new Date(x.EndDate) >= this.currentDate)[0];
    //        let NepaliFiscalYear2 = list.filter(x => x.NYear == NepaliFiscalYear.NYear + 1)[0];
    //        this.yearList = [];
    //        this.yearList.push(NepaliFiscalYear);
    //        this.yearList.push(NepaliFiscalYear2);
    //    });
    //}

    //public getMonth() {
    //    this.nepaliMonthService.getAll().subscribe((list: INepaliMonthList[]) => {
    //        this.monthList = list;
    //    });
    //}

    public getSalSht() {
        this.salShtth = [];
        this.tempSSData = [];
        this.svSSData = [];
        let start: string = `${this.filterBySYear}-${Number(this.filterBySMonth) < 10 ? 0 : ''}${this.filterBySMonth}`
        let end: string = `${this.filterByEYear}-${Number(this.filterByEMonth) < 10 ? 0 : ''}${this.filterByEMonth}`

        this.payrollService.getSalShtMerge(start, end).subscribe((data: any[]) => {
            if (data.length > 0) {
                this.tempSSData = data;
                this.svSSData = data;

                Object.keys(data[0]).forEach(item => {
                    if (item != 'TId1' && item != 'EmployeeID') {
                        let newItemSSH: SalSheetHeadings = {
                            title: item.split('-').length > 1 ? item.split('-')[1] : item,
                            AM: item.split('-').length > 1 ? Number(item.split('-')[0]) : 0,
                            svtitle: item
                        };
                        this.salShtth.push(newItemSSH);
                    }
                })
                this.salShtth.push(
                    { title: 'Gross Salary', AM: 10.5, svtitle: 'Gross Salary' },
                    { title: 'Gross Deduction', AM: 1000, svtitle: 'Gross Deduction' },
                    { title: 'Net Salary', AM: 1001, svtitle: 'Net Salary' }
                );

                this.salShtth = this.salShtth.sort((a, b) => compare(a, b));
                this.organizeSalSheet(data);

                this.getColspan();
            }
        })

        function compare(a: SalSheetHeadings, b: SalSheetHeadings) {
            if (a.AM < b.AM)
                return -1;
            if (a.AM > b.AM)
                return 1;
            return 0;
        }
    }

    public organizeSalSheet(data: any[]) {

        data.forEach((item) => {
            item['Gross Salary'] = 0;
            item['Gross Deduction'] = 0;
            item['Net Salary'] = 0;
            this.salShtth.forEach((titles, index) => {
                if (
                    index > 3 &&
                    titles.svtitle != 'Gross Salary' &&
                    titles.svtitle != 'Gross Deduction' &&
                    titles.svtitle != 'Net Salary'
                ) {
                    if (item[titles.svtitle] == null) {
                        item[titles.svtitle] = parseFloat('0').toFixed(2);
                    } else {
                        item[titles.svtitle] = parseFloat(item[titles.svtitle]).toFixed(2);
                    }

                    if (titles.AM <= 10 && titles.AM > 0) {
                        item['Gross Salary'] = Number(item['Gross Salary']) + Number(item[titles.svtitle]);
                        item['Gross Salary'] = parseFloat(item['Gross Salary']).toFixed(2);
                    }

                    if (titles.AM > 10) {
                        item[titles.svtitle] = Math.abs(item[titles.svtitle]);
                        item['Gross Deduction'] = Number(item['Gross Deduction']) + Number(item[titles.svtitle])
                        item['Gross Deduction'] = parseFloat(item['Gross Deduction']).toFixed(2);
                    }
                }
                item['Net Salary'] = (Number(item['Gross Salary']) - Number(item['Gross Deduction']));
                item['Net Salary'] = parseFloat(item['Net Salary']).toFixed(2);
            });
        });
        data.sort(function (a, b) {
            return a[1] - b[1];
        });

        this.pushTotal(data);

        let start: string = `${this.filterBySYear}-${Number(this.filterBySMonth) < 10 ? 0 : ''}${this.filterBySMonth}`;
        let end: string = `${this.filterByEYear}-${Number(this.filterByEMonth) < 10 ? 0 : ''}${this.filterByEMonth}`;

        this.csvJSONData = [];
        this.csvJSONData.push({ '': `HRMS Employee Salary Sheet Merged- From:${start} To:${end}` });

        let object = [];
        this.salShtth.forEach((head, itemindex) => {
            object[itemindex] = head.title;
        })
        this.csvJSONData.push(object);

        if (this.svSSData.length > 0) {
            this.pushTotal(this.svSSData);

            this.svSSData.forEach((data) => {
                let csvItem = {};
                this.salShtth.forEach((head) => {
                    if (head.svtitle != 'EmployeeName' && head.svtitle != 'EmployeeNo' && head.svtitle != 'DepartmentName' && head.svtitle != 'DesignationName') {
                        data[head.svtitle] = parseFloat(data[head.svtitle]).toFixed(2);
                    }
                    csvItem[head.title] = data[head.svtitle];
                })
                this.csvJSONData.push(csvItem);
            })
        }
    }

    public searchFilter() {
        if (this.filterByName != null) {
            this.tempSSData = this.svSSData.filter(x => String(x['EmployeeName']).toLowerCase().includes(this.filterByName.toLowerCase()) == true);
            this.organizeSalSheet(this.tempSSData);
        }
    }

    public pushTotal(data: any[]) {
        if (data.length > 0) {
            data.filter(x => String(x['DesignationName']).toLowerCase().includes('total') == true).forEach(item => {
                data.splice(this.tempSSData.lastIndexOf(item), 1);
            })

            let newItem: typeof data[0] = <typeof data[0]>{};
            this.salShtth.forEach((titles, index) => {
                if (index < 3) {
                    newItem[titles.svtitle] = ' ';
                } else if (index > 3) {
                    newItem[titles.svtitle] = 0
                    data.forEach(item => {
                        newItem[titles.svtitle] = Number(newItem[titles.svtitle]) + Number(item[titles.svtitle]);
                        newItem[titles.svtitle] = parseFloat(newItem[titles.svtitle]).toFixed(2)
                    })
                } else {
                    newItem[titles.svtitle] = 'Total';
                }
            });

            data.push(newItem);
        }
    }

    public getColspan() {
        this.tableHead = [
            { th: 'Employee Details', thColspan: 4 },
            { th: 'Employee Income', thColspan: this.salShtth.filter(x => x.AM > 0 && x.AM < 10).length },
            { th: 'Employee Expenses', thColspan: this.salShtth.filter(x => x.AM >= 10 && x.AM < 1001).length },
            { th: ' ', thColspan: 1 },
        ]
    }

    public exporToCSV() {
        let start: string = `${this.filterBySYear}-${Number(this.filterBySMonth) < 10 ? 0 : ''}${this.filterBySMonth}`;
        let end: string = `${this.filterByEYear}-${Number(this.filterByEMonth) < 10 ? 0 : ''}${this.filterByEMonth}`;
        this.csvService.download(this.csvJSONData, `HRMS Employee Salary Sheet Merged-(From ${start} Till ${end})`);
    }

    sortSheet(sortAttribute: string) {
        let that = this;

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

        if (this.tempSSData[this.tempSSData.length - 1][this.salShtth[0].svtitle] == '') {
            this.tempSSData.sort((a, b) => that.compare(a, b));
            this.organizeSalSheet(this.tempSSData);
        }
    }

    filterByYearLabel() {
        if (this.monthList.length > 0 && this.yearList.length > 0) {
            let start: string = `${this.filterBySYear}-${Number(this.filterBySMonth) < 10 ? 0 : ''}${this.filterBySMonth}`;
            let end: string = `${this.filterByEYear}-${Number(this.filterByEMonth) < 10 ? 0 : ''}${this.filterByEMonth}`;
            return `From ${start} Till ${end}`;
        } else {
            return '';
        }
    }

    public compare(a, b) {
        var that = this;
        if (
            that.filterObj.SortingAttribute != 'EmployeeNo' &&
            that.filterObj.SortingAttribute != 'EmployeeName' &&
            that.filterObj.SortingAttribute != 'DepartmentName' &&
            that.filterObj.SortingAttribute != 'DesignationName'
        ) {
            if (that.filterObj.Sort != 'true') {
                return (Number(a[that.filterObj.SortingAttribute]) < Number(b[that.filterObj.SortingAttribute])) ? 1 : -1;
            } else {
                return (Number(a[that.filterObj.SortingAttribute]) < Number(b[that.filterObj.SortingAttribute])) ? -1 : 1;
            }
        } else {
            if (that.filterObj.Sort != 'true') {
                if (a[that.filterObj.SortingAttribute] < b[that.filterObj.SortingAttribute]) {
                    return 1;
                } else if (a[that.filterObj.SortingAttribute] > b[that.filterObj.SortingAttribute]) {
                    return -1;
                } else {
                    return (a['EmployeeNo'] < b['EmployeeNo']) ? 1 : -1;
                }
            } else {
                if (a[that.filterObj.SortingAttribute] < b[that.filterObj.SortingAttribute]) {
                    return -1;
                } else if (a[that.filterObj.SortingAttribute] > b[that.filterObj.SortingAttribute]) {
                    return 1;
                } else {
                    return (a['EmployeeNo'] < b['EmployeeNo']) ? 1 : -1;
                }
            }
        }
    }
}

export interface SalSheetHeadings {
    title: string;
    AM?: number;
    svtitle: string;
}

export interface TableHead {
    th?: string;
    thColspan?: number;
}
