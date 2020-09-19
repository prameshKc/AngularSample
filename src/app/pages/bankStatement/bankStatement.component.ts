import { Component, OnInit } from '@angular/core';
import { IFGetSalShtToBank_Reult, IFilterViewModel } from '../../models/ViewModels';
import { PayrollService, UserService, BSADCalService, NepaliMonthListService, FiscalYearService, HRBankInfoService, DepartmentService } from '../../services/BaseService';
import { IBSADCal, INepaliMonthList, IPagination, IODataResult, IHRBankInfo, IDepartment } from '../../models/Models';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { CsvService } from 'src/app/services/excel.service';

@Component({
  selector: 'bank-statement',
  templateUrl: 'bankStatement.component.html'
})
export class BankStatementComponent implements OnInit {
  BankStatementList: IFGetSalShtToBank_Reult[] = [];
  yearList: IBSADCal[] = [];
  monthList: INepaliMonthList[] = [];
  pagination: IPagination = <IPagination>{};
  bankList: IHRBankInfo[] = [];
  deptList: IDepartment[] = [];
  isLoading: boolean;
  timeoutControl: any;
  gtotal: number = 0;

  //searching and sorting
  filterObj?: IFilterViewModel = <IFilterViewModel>{};
  filterByName: string;
  filterByDeptId: string = "-1";
  filterByBankId: string = "-1";
  filterByMonth: string = "-1";
  filterByYear: string = "-1";

  selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
    showOpenModalButton: true
  };

  //Date
  currentDate: Date = new Date();

  constructor(
    private csvService: CsvService,
    public datePickerFunctions: DatePickerFunctions,
    private payrollService: PayrollService,
    private bankService: HRBankInfoService,
    private deptService: DepartmentService
  ) { }

  ngOnInit() {
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };

    this.reset();
    this.getBanks();
    this.getDepartments();
    this.getSalSht('filtered');
  }

  public reset() {
    this.filterByName = null;
    this.filterByYear = "-1";
    this.filterByMonth = "-1";
    this.filterByDeptId = "-1";
    this.filterByBankId = "-1";
  }

  public getBanks() {
    this.bankService.getAll('$select=Bid,BName').subscribe(data => {
      this.bankList = data;
    })
  }

  public getDepartments() {
    this.deptService.getAll('$select=DepartmentId,DepartmentName').subscribe(data => {
      this.deptList = data;
    })
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
    if (this.timeoutControl) {
      clearTimeout(this.timeoutControl);
      this.timeoutControl = null;
    }
    this.timeoutControl = setTimeout(() => {
      if (this.filterByDeptId == "-1") {
        this.payrollService.getSalShtToBank(Number(this.filterByBankId), Number(this.filterByYear), Number(this.filterByMonth), flag, this.pagination, this.filterObj, this.filterByName).subscribe((data: IODataResult<IFGetSalShtToBank_Reult[]>) => {
          setTimeout(() => { this.isLoading = false; }, 1500);

          this.pagination.TotalItems = data.count;

          data.value.forEach(item => { item.Amount = Math.abs(item.Amount); });

          this.BankStatementList = data.value;
        })
      } else {
        this.payrollService.getSalShtToBankDepWise(Number(this.filterByBankId), Number(this.filterByDeptId), Number(this.filterByYear), Number(this.filterByMonth), flag, this.pagination, this.filterObj, this.filterByName).subscribe((data: IODataResult<IFGetSalShtToBank_Reult[]>) => {
          setTimeout(() => { this.isLoading = false; }, 1500);

          this.pagination.TotalItems = data.count;

          data.value.forEach(item => { item.Amount = Math.abs(item.Amount); });

          this.BankStatementList = data.value;
        })
      }

      // this.payrollService.getGTSalShtToBank(Number(this.filterByYear), Number(this.filterByMonth)).subscribe(data => {
      //     this.gtotal = data;
      // })
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
    let filename: string = `HRMS Salary Sheet (Bank Statement)-${this.bankList.filter(x => x.Bid == Number(this.filterByBankId))[0].BName}_Date-${this.filterByYear} ${this.filterByMonth}`;
    let csvData: any[] = [{
      '': "BankName: " + this.bankList.filter(x => x.Bid == Number(this.filterByBankId))[0].BName
    },
    {
      '': "Date: " + `${this.filterByYear}-${this.filterByMonth}`
    }];
    if (this.filterByDeptId != '-1') {
      filename += `_Department-${this.deptList.filter(x => x.DepartmentId == Number(this.filterByDeptId))[0].DepartmentName}`;
      csvData.push({
        '': "Department: " + `${this.deptList.filter(x => x.DepartmentId == Number(this.filterByDeptId))[0].DepartmentName}`
      });
    }
    csvData.push({ '': '' });


    csvData.push({
      'Employee No': 'Employee No',
      'Staff Name': 'Staff Name',
      'Pan Number': 'Pan Number',
      'Account No.': 'Account No.',
      'Amount': 'Amount'
    });
    this.BankStatementList.map(item => {
      csvData.push({
        'Employee No': item.EmployeeNo,
        'Staff Name': item.Staff_Name,
        'Pan Number': `"=""${item.PanNo}"""`,
        'Account No.': `"=""${item.Account_No}"""`,
        'Amount': item.Amount
      });
      return item;
    })
    this.csvService.download(csvData, filename);
  }
}
