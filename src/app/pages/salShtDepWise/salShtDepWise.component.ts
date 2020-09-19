import { Component } from '@angular/core';
import {
    PayrollService, HRSSheet1Service, DepartmentService
} from '../../services/BaseService';
import {
    IBSADCal, INepaliMonthList,
    IFiscalYear, IDepartment
} from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { CsvService } from 'src/app/services/excel.service';
import { IMonths } from '../../shared/datepicker/models/datepickerDataStore';

@Component({
    selector: 'salary-sheet-dep-wise',
    templateUrl: "salShtDepWise.component.html"
})
export class SalarySheetDepWiseComponent {
    userId: string;

    deptList: IDepartment[] = [];
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
    deptId: string = "-1";
    filterByMonth: string = "-1";
    filterByYear: string = "-1";
    isBonus?: boolean = false;
    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };

    constructor(
        public hrsSheet1Service: HRSSheet1Service,
        public datePickerFunctions: DatePickerFunctions,
        private payrollService: PayrollService,
        private departmentService: DepartmentService,
        private csvService: CsvService
    ) {
    }

    ngOnInit() {
        this.userId = localStorage.getItem('UserId');
        this.currentDate = new Date();
        this.reset();

        this.filterObj = { Name: '', Sort: 'True', SortingAttribute: 'FirstName', SearchBy: '' };
        //this.getYear();
        //this.getMonth();
        this.getDept();
        this.getSalSht();
        this.reset();
    }

    public reset() {
        this.filterByName = null;
        this.filterByYear = null;
        this.filterByMonth = null;
    }

    public getDept() {
        this.departmentService.getAll('$select=DepartmentId,DepartmentName').subscribe(data => {
            this.deptList = data;
            if (data.length > 0)
                this.deptId = data[0].DepartmentId.toString();
        })
    }

    public getSalSht() {
        this.salShtth = [];
        this.tempSSData = [];
        this.svSSData = [];
        this.isBonus = this.isBonus ? this.isBonus : false;

        if (this.deptId != '-1' && this.filterByYear != '-1' && this.filterByMonth != '-1')
            this.payrollService.getSalShtDepWise(Number(this.deptId), Number(this.filterByYear), Number(this.filterByMonth)).subscribe((data: any[]) => {
                if (data.length > 0) {
                    this.tempSSData = data;
                    this.svSSData = data;

                    Object.keys(data[0]).forEach(item => {
                        if (
                            item != 'Tid1' &&
                            item != 'EmployeeId' &&
                            item != 'DepName' 
                        ) {
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
                    index > 2 &&
                    titles.svtitle != 'Gross Salary' &&
                    titles.svtitle != 'Gross Deduction' &&
                    titles.svtitle != 'Net Salary'
                ) {
                    if (item[titles.svtitle] == null) {
                        item[titles.svtitle] = parseFloat('0').toFixed(2);
                    } else {
                        item[titles.svtitle] = parseFloat(item[titles.svtitle]).toFixed(2);
                    }

                    if (item[titles.svtitle] > 0) {
                        item['Gross Salary'] = Number(item['Gross Salary']) + Number(item[titles.svtitle]);
                        item['Gross Salary'] = parseFloat(item['Gross Salary']).toFixed(2);
                    }

                    if (item[titles.svtitle] < 0) {
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

        this.csvJSONData = [];
        this.csvJSONData.push({ '': `HRMS Employee Salary Sheet of ${this.filterByDeptName()}- Year:${this.filterByYear} Month:${this.filterByMonth}` });

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
                    if (head.svtitle != 'EmployeeName' && head.svtitle != 'EmployeeNo' && head.svtitle != 'DegName') {
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

            data.filter(x => String(x['DegName']).toLowerCase().includes('total') == true).forEach(item => {
                data.splice(this.tempSSData.lastIndexOf(item), 1);
            })

            let newItem: typeof data[0] = <typeof data[0]>{};
            this.salShtth.forEach((titles, index) => {
                if (index < 2) {
                    newItem[titles.svtitle] = ' ';
                } else if (index > 2) {
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
            { th: 'Employee Details', thColspan: 3 },
            { th: 'Employee Income', thColspan: this.salShtth.filter(x => x.AM > 0 && x.AM < 11).length },
            { th: 'Employee Expenses', thColspan: this.salShtth.filter(x => x.AM >= 11 && x.AM < 1001).length },
            { th: ' ', thColspan: 1 },
        ]
    }

    public exporToCSV() {
        this.csvService.download(this.csvJSONData, `HRMS Employee Salary Sheet-${this.filterByYear} ${this.filterByMonth}`);
    }

    sortSheet(sortAttribute: string) {
        let that = this;

        if (this.filterObj.SortingAttribute != null) {
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
    }

    filterByDateLabel() {
        if (this.monthList.length > 0 && this.yearList.length > 0) {
            if (Number(localStorage.getItem('Param.DateType')) == 1) {
                return IMonths.filter(x => x.Id == Number(this.filterByMonth))[0].EngName + ', ' + this.filterByYear;
            } else {
                return IMonths.filter(x => x.Id == Number(this.filterByMonth))[0].NepName + ', ' + this.filterByYear;
            }
        } else {
            return '';
        }
    }

    filterByDeptName() {
        if (this.deptList.length > 0) {
            return this.deptList.filter(x => x.DepartmentId == Number(this.deptId))[0].DepartmentName;
        } else {
            return '';
        }
    }

    public compare(a, b) {
        var that = this;
        if (that.filterObj.SortingAttribute != 'EmployeeNo' && that.filterObj.SortingAttribute != 'EmployeeName') {
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
