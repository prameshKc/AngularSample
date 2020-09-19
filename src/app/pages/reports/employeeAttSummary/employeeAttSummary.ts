import { Component } from '@angular/core';
import {
  PayrollService, HRSSheet1Service, DepartmentService, CommonService
} from 'src/app/services/BaseService';
import {
  IBSADCal, INepaliMonthList,
  IFiscalYear, ICompany
} from 'src/app/models/Models';
import { IFilterViewModel, ISalaryGetFoodExpCompanywise, ICompanyVM } from 'src/app/models/ViewModels';
import { IEmployeeSearchOption } from 'src/app/shared/employeeSearch/employeeSearch.component';
import { DatePickerFunctions } from 'src/app/shared/datepicker/modules/datepickerFunctions';
import { CsvService } from 'src/app/services/excel.service';
import { IMonths } from 'src/app/shared/datepicker/models/datepickerDataStore';

@Component({
  selector: 'employee-att-summary',
  templateUrl: "employeeAttSummary.html"
})
export class EmployeeAttendaceSummaryComponent {
  userId: string;

  compList: ICompany[] = [];
  yearList: IBSADCal[] = [];
  monthList: INepaliMonthList[] = [];
  fiscalYearList: IFiscalYear[] = [];

  isVerified: boolean = true;
  isLoading: boolean = false;
  svData: ISalaryGetFoodExpCompanywise[] = [];
  tempData: ISalaryGetFoodExpCompanywise[] = [];
  thList: Headings[] = [];
  csvJSONData: any[] = [];
  tableHead: TableHead[] = [];
  currentDate: Date;

  //searching and sorting
  filterObj?: IFilterViewModel;
  filterByName: string;
  compId: string = "-1";
  filterByMonth: string = "-1";
  filterByYear: string = "-1";
  isBonus?: boolean = false;
  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };

  constructor(
    public hrsSheet1Service: HRSSheet1Service,
    public datePickerFunctions: DatePickerFunctions,
    private commonService: CommonService,
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
    this.getBranches();
    this.getFA();
    this.reset();
  }

  public reset() {
    this.filterByName = null;
    this.filterByYear = null;
    this.filterByMonth = null;
  }

  //public getBranches() {
  //  let data: ICompany[] = JSON.parse(localStorage.getItem("Branches"));
  //  let currBranch: number = Number(localStorage.getItem("Branch"));

  //  this.compList = data;
  //  if (data.length > 0) this.compId = data.filter(x => x.CompanyId == currBranch)[0].CompanyId.toString();
  //}

  public getFA() {
    this.thList = [];
    this.tempData = [];
    this.svData = [];
    this.isBonus = this.isBonus ? this.isBonus : false;

    if (this.CompanyId != null && this.filterByYear != '-1' && this.filterByMonth != '-1')
      this.payrollService.getEmployeeFoodAllowance(Number(this.CompanyId), Number(this.filterByYear), Number(this.filterByMonth)).subscribe((data: ISalaryGetFoodExpCompanywise[]) => {
        if (data.length > 0) {
          Object.keys(data[0]).map((key) => {
            // ...
            let show: boolean = true;
            let money: boolean = false;
            if (
              key == "staffid" ||
              key == "Year" ||
              key == "Month" ||
              key == "noofDaysinmonth" ||
              key == "Deductdays" ||
              key == "companyid" ||
              key == "Companyname" ||
              key == "Branchid" ||
              key == "BranchName"
            ) {
              show = false;
            }
            if (
              key == "payableAmount"
            ) {
              money = true;
            }
            this.thList.push({
              title: key.toString(),
              svtitle: key.toString(),
              show: show,
              money: money
            })

            this.thList = this.thList.filter(x => x.show == true);
          });

          this.tempData = [...data];
          this.svData = [...data];
          this.organizeSalSheet(data);
        }
      })

    function compare(a: Headings, b: Headings) {
      if (a.AM < b.AM)
        return -1;
      if (a.AM > b.AM)
        return 1;
      return 0;
    }
  }

  public organizeSalSheet(data: any[]) {
    data.map((item) => {
      this.thList.map((titles, index) => {
        if (
          titles.show == true
        ) {
          if (titles.money == true) {
            if (item[titles.svtitle] == null) {
              item[titles.svtitle] = parseFloat('0').toFixed(2);
            } else {
              item[titles.svtitle] = parseFloat(item[titles.svtitle]).toFixed(2);
            }
          }
        }
      });
    });

    data.sort(function (a, b) {
      return a[1] - b[1];
    });

    this.csvJSONData = [];
    this.csvJSONData.push({ '': `HRMS Employee Food Allowance Expenses of ${this.filterByBranchName()}- Year:${this.filterByYear} Month:${this.filterByMonth}` });

    let object = [];
    this.thList.map((head, itemindex) => {
      object[itemindex] = head.title;
    })
    this.csvJSONData.push(object);

    if (this.svData.length > 0) {
      this.svData.map((data) => {
        let csvItem = {};
        this.thList.map((head) => {
          if (head.money == true) {
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
      this.tempData = this.svData.filter(x => String(x['Employeename']).toLowerCase().includes(this.filterByName.toLowerCase()) == true);
      this.organizeSalSheet(this.tempData);
    }
  }

  public exporToCSV() {
    this.csvService.download(this.csvJSONData, `HRMS Employee Food Allowance-${this.filterByYear} ${this.filterByMonth}`);
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
      this.tempData.sort((a, b) => that.compare(a, b));
      this.organizeSalSheet(this.tempData);
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

  filterByBranchName() {
    return this.CompanyName;
  }

  public compare(a, b) {
    var that = this;
      if (that.filterObj.Sort != 'true') {
        return (a[that.filterObj.SortingAttribute] < b[that.filterObj.SortingAttribute]) ? 1 : -1;
      } else {
        return (a[that.filterObj.SortingAttribute] < b[that.filterObj.SortingAttribute]) ? -1 : 1;
      }
  }


  //company branch list
  CBSelectIsExpand: boolean;
  CBList: ICompanyVM[] = [];
  svCBList: ICompanyVM[] = [];
  CompanyName: string;
  CompanyId: number;
  getBranches() {
    this.commonService.GetCompanyBranches().subscribe((data: ICompanyVM[]) => {
      this.svCBList = data;
      this.CBList = data.filter(x => x.isGroup == true);

      this.CBList.forEach(item => {
        item.isOpen = true;
        if (item.isGroup == true) {
          item.ChildCompany = data.filter(x => x.ParentId == item.CompanyId);
        }
      })
      //this.selectBranch(this.svCBList.filter(x => x.isGroup != true)[0]);
    });
  }

  selectBranch(company?: ICompanyVM) {
    if (company.ParentId != null) {
      this.CompanyName = company.CompanyName;
      this.CompanyId = company.CompanyId;
    }
    this.getFA();
  }
}

export interface Headings {
  title: string;
  AM?: number;
  svtitle: string;
  show: boolean;
  money: boolean;
}

export interface TableHead {
  th?: string;
  thColspan?: number;
}
