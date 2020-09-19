import { Component, Injectable, ViewChild } from '@angular/core';
import { TimeSheetService, JobCodeService, UserService, SupervisorListService, EmployeeService, FiscalYearService, CommonService, TimeSheetReportFService } from '../../services/BaseService';
import { ITimeSheet, IJobCodeGenerate, IUser, IEmployee, IFiscalYear, IPagination, IODataResult, IFGetTimeSheetReport_Result, IFGetTimeSheetDayWiseReport_Result } from '../../models/Models';
import { IFgetFiscialyearID_Result } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { DatePickerFunctions } from '../../shared/datepicker/modules/datepickerFunctions';
import { CsvService } from 'src/app/services/excel.service';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig } from 'ngx-toasty';

@Component({
    templateUrl: 'timeSheetReport.component.html'
})
export class TimeSheetReportComponent {
    userId: string;
    displayTimeList: ITimeSheet[] = [];
    userDetails: IUser = <IUser>{};
    requiredEmployeeId: number;
    isAdmin: boolean;
    supervisorHierarchylist: IEmployee[] = [];
    allSupervisorHierarchylist: IEmployee[] = [];
    filteredDisplayTimeList: ITimeSheet[] = [];
    timeListMonthWise: IFGetTimeSheetReport_Result[] = [];
    employeeList: IEmployee[] = [];
    fiscalYearList: IFgetFiscialyearID_Result[] = [];
    filterByFiscalYear: number;
    filterByStaff: number;
    filterByJobCode: number;
    fiscalYearDetails: IFgetFiscialyearID_Result[] = [];
    isNotEightDigit: boolean = false;
    incorrectJobCode: boolean = false;
    JobCodeSearch: string;
    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };
    pagination: IPagination;
    currentEmpId: number;
    fromDate: Date;
    toDate: Date;
    timeSheetDayWise: IFGetTimeSheetDayWiseReport_Result = <IFGetTimeSheetDayWiseReport_Result>{};
    remarksList: { hour: number, remarks: string }[] = [];
    remarksObj: { hour: number, remarks: string };
    remarksYear: number;
    remarksMonth: number;
    showRemarks: boolean = false;
    empFileName: string;
    jbFileName: string;
    mnthFileName: string;
    isDisable: boolean;

  @ViewChild('timeSheetDayWiseModal', { static: false }) public timeSheetDayWiseModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    constructor(
        public timeSheetService: TimeSheetService,
        public jobCodeService: JobCodeService,
        public userService: UserService,
        public supervisorListService: SupervisorListService,
        public timeSheetReportFService: TimeSheetReportFService,
        public employeeService: EmployeeService,
        public fiscalYearService: FiscalYearService,
        public commonService: CommonService,
        public datePickerService: DatePickerFunctions,
        private csvService: CsvService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.getEmployeeId();
    }

    public getEmployeeId() {
        var query = "$expand=Employee,Employee/ReportTo,MenuTemplate/MenuVsTemplate";
        this.userService.get(this.userId, query).subscribe((data: IUser) => {
            this.userDetails = data;
            this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
            this.requiredEmployeeId = data.EmployeeId;
            let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
            this.getAllFiscalYear();
            this.onFilter();
            if (currentReportTo.ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
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
        })
    }

    public getAllFiscalYear() {
        let date = new Date();
        this.commonService.getFiscalYear(date, 5).subscribe((one: IFgetFiscialyearID_Result[]) => {
            this.fiscalYearList = one;
            this.getFiscalYear().then((data) => {
                this.fiscalYearDetails = data;
                this.filterByFiscalYear = this.fiscalYearDetails[0].FYID;
                let date1 = new Date(this.fiscalYearDetails[0].StartDT);
                let date2 = new Date(this.fiscalYearDetails[0].EndDt);
                this.fromDate = new Date(date1.getFullYear(), date1.getMonth() + 1, date1.getDay());
                this.toDate = new Date(date2.getFullYear(), date2.getMonth() + 1, date2.getDay());
                this.filterByStaff = null;
                this.filterByJobCode = null;
                this.onFilter();
            });
        });
    }

    public getFiscalYear(): Promise<IFgetFiscialyearID_Result[]> {
        return new Promise<IFgetFiscialyearID_Result[]>((resolve) => {
            let date = new Date();
            this.commonService.getFiscalYear(date, 0).subscribe((one: IFgetFiscialyearID_Result[]) => {
                resolve(one);
            });
        });
    }

    public onFilter() {
        if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
            if (this.filterByStaff != null && this.filterByJobCode == null && this.filterByFiscalYear != null) {
                this.timeSheetReportFService.GetTimeSheetReportMonthWise(this.pagination, -1, this.filterByFiscalYear, this.filterByStaff, -1)
                    .subscribe((data: IODataResult<IFGetTimeSheetReport_Result[]>) => {
                        this.timeListMonthWise = data.value;
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                    });
            }
            if (this.filterByStaff == null && this.filterByJobCode != null && this.filterByFiscalYear != null) {
                this.timeSheetReportFService.GetTimeSheetReportMonthWise(this.pagination, -1, this.filterByFiscalYear, -1, this.filterByJobCode)
                    .subscribe((data: IODataResult<IFGetTimeSheetReport_Result[]>) => {
                        this.timeListMonthWise = data.value;
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                    });
            }
            if (this.filterByStaff != null && this.filterByJobCode != null && this.filterByFiscalYear != null) {
                this.timeSheetReportFService.GetTimeSheetReportMonthWise(this.pagination, -1, this.filterByFiscalYear, this.filterByStaff, this.filterByJobCode)
                    .subscribe((data: IODataResult<IFGetTimeSheetReport_Result[]>) => {
                        this.timeListMonthWise = data.value;
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                    });
            }
            if (this.filterByStaff == null && this.filterByJobCode == null && this.filterByFiscalYear != null) {
                this.timeSheetReportFService.GetTimeSheetReportMonthWise(this.pagination, -1, this.filterByFiscalYear, -1, -1)
                    .subscribe((data: IODataResult<IFGetTimeSheetReport_Result[]>) => {
                        this.timeListMonthWise = data.value;
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                    });
            }
        }
        else {
            if (this.filterByStaff != null && this.filterByJobCode == null && this.filterByFiscalYear != null) {
                this.timeSheetReportFService.GetTimeSheetReportMonthWise(this.pagination, this.currentEmpId, this.filterByFiscalYear, this.filterByStaff, -1)
                    .subscribe((data: IODataResult<IFGetTimeSheetReport_Result[]>) => {
                        this.timeListMonthWise = data.value;
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                    });
            }
            if (this.filterByStaff == null && this.filterByJobCode != null && this.filterByFiscalYear != null) {
                this.timeSheetReportFService.GetTimeSheetReportMonthWise(this.pagination, this.currentEmpId, this.filterByFiscalYear, -1, this.filterByJobCode)
                    .subscribe((data: IODataResult<IFGetTimeSheetReport_Result[]>) => {
                        this.timeListMonthWise = data.value;

                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                    });
            }
            if (this.filterByStaff != null && this.filterByJobCode != null && this.filterByFiscalYear != null) {
                this.timeSheetReportFService.GetTimeSheetReportMonthWise(this.pagination, this.currentEmpId, this.filterByFiscalYear, this.filterByStaff, this.filterByJobCode)
                    .subscribe((data: IODataResult<IFGetTimeSheetReport_Result[]>) => {
                        this.timeListMonthWise = data.value;
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                    });
            }
            if (this.filterByStaff == null && this.filterByJobCode == null && this.filterByFiscalYear != null) {
                this.timeSheetReportFService.GetTimeSheetReportMonthWise(this.pagination, this.currentEmpId, this.filterByFiscalYear, -1, -1)
                    .subscribe((data: IODataResult<IFGetTimeSheetReport_Result[]>) => {
                        this.timeListMonthWise = data.value;
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                    });
            }
        }


    }

    public selectedEmployee(event: any) {
        this.filterByStaff = event.EmployeeId;
        this.empFileName = event.FirstName;
        if (event.MiddleName != null) {
            this.empFileName += event.MiddleName;
        }
        if (event.LastName != null) {
            this.empFileName += event.LastName;
        }
        this.onFilter();
    }

    public onJobCodeChange(event: any) {
        if (event.length > 8) {
            this.isNotEightDigit = true
        }
        if (event.length == 0) {
            this.filterByJobCode = null;
            this.onFilter();
        }
        let query = `$filter=startswith(JobCode,'${event}')`;
        this.jobCodeService.getAll(query)
            .subscribe((list: IJobCodeGenerate[]) => {
                if (list.length > 0) {
                    this.incorrectJobCode = false;
                    if (event.length == 8) {
                        this.jbFileName = event;
                        this.getJobCodeId(event).then((data) => {
                            this.filterByJobCode = data[0].Id;
                            this.onFilter();
                        });
                    }
                }
                else {
                    this.incorrectJobCode = true;
                }
            });

    }

    public getJobCodeId(data: any): Promise<IJobCodeGenerate[]> {
        return new Promise<IJobCodeGenerate[]>((resolve) => {
            let jobQuery = `$filter=JobCode eq '${data}'`;
            this.jobCodeService.getAll(jobQuery).subscribe((data: IJobCodeGenerate[]) => {
                resolve(data);
            });
        });
    }

    public onFiscalYearChange(event: number) {
        let query = `$filter=FYID eq ${event}`;
        this.fiscalYearService.getAll(query).subscribe((one: IFiscalYear[]) => {
            this.fiscalYearDetails = one;
            this.filterByFiscalYear = this.fiscalYearDetails[0].FYID;
            let date1 = new Date(this.fiscalYearDetails[0].StartDT);
            let date2 = new Date(this.fiscalYearDetails[0].EndDt);
            this.fromDate = new Date(this.fiscalYearDetails[0].StartDT);
            this.toDate = new Date(this.fiscalYearDetails[0].EndDt);
            this.onFilter();
        })
    }

    public reset() {
        this.JobCodeSearch = null;
        this.filterByStaff = null;
        this.filterByJobCode = null;
        this.getAllFiscalYear();
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        if (this.userDetails.Employee != null) {
            this.onFilter();
        }
        else {
            this.getEmployeeId();
        }
    }

    getDayWise(eventDetail: any, month: any, monthName: string) {
        this.mnthFileName = monthName;
        let fiscalYearArray = eventDetail.FyName.split('/');
        let fiscalYear: number;
        let fiscalMonth: number;
        let fiscalDay: number;
        let startDate: Date;
        let endDate: Date;
        let fiscalEndDay: number;

        if (month > 3 && month < 13) {
            fiscalYear = parseInt(fiscalYearArray[0]);
            fiscalMonth = month;
            fiscalDay = 1;
            this.remarksYear = fiscalYear;
            this.remarksMonth = fiscalMonth;
            this.commonService.GetMonthEndDate(fiscalYear, fiscalMonth)
                .subscribe((data: number) => {
                    fiscalEndDay = data;
                    this.commonService.GetConvertedDateAD(fiscalYear, fiscalMonth, fiscalDay)
                        .subscribe((sData: Date) => {
                            startDate = new Date(sData);
                            this.commonService.GetConvertedDateAD(fiscalYear, fiscalMonth, fiscalEndDay)
                                .subscribe((edata: Date) => {
                                    endDate = new Date(edata);
                                    this.timeSheetReportFService.GetTimeSheetReportDayWise(eventDetail.EmployeeId, eventDetail.JobCodeId, startDate, endDate)
                                        .subscribe((report: IFGetTimeSheetDayWiseReport_Result) => {
                                            this.timeSheetDayWise = report;
                                            this.openModal();
                                        });
                                });
                        });
                });
        }
        else {
            fiscalYear = parseInt("20" + fiscalYearArray[1]);
            fiscalMonth = month;
            fiscalDay = 1;
            this.remarksYear = fiscalYear;
            this.remarksMonth = fiscalMonth;
            this.commonService.GetMonthEndDate(fiscalYear, fiscalMonth)
                .subscribe((data: number) => {
                    fiscalEndDay = data;
                    this.commonService.GetConvertedDateAD(fiscalYear, fiscalMonth, fiscalDay)
                        .subscribe((sData: Date) => {
                            startDate = new Date(sData);
                            this.commonService.GetConvertedDateAD(fiscalYear, fiscalMonth, fiscalEndDay)
                                .subscribe((edata: Date) => {
                                    endDate = new Date(edata);
                                    this.timeSheetReportFService.GetTimeSheetReportDayWise(eventDetail.EmployeeId, eventDetail.JobCodeId, startDate, endDate)
                                        .subscribe((report: IFGetTimeSheetDayWiseReport_Result) => {
                                            this.timeSheetDayWise = report;
                                            this.openModal();
                                        });
                                });
                        });
                });
        }

    }

    public openModal() {
        this.showRemarks = false;
        this.selectedModalLoaded = true;
        this.timeSheetDayWiseModal.show();
    }

    public hideModal() {
        this.timeSheetDayWise = <IFGetTimeSheetDayWiseReport_Result>{};
        this.selectedModalLoaded = false;
        this.timeSheetDayWiseModal.hide();
    }

    public getRemarks(employeeId: number, jobCodeId: number, remarksDay: number) {
        this.showRemarks = true;
        let convertedDate: string;
        let query = `$filter=EmployeeId eq ${employeeId}`;

        this.commonService.GetConvertedDateAD(this.remarksYear, this.remarksMonth, remarksDay)
            .subscribe((data: Date) => {
                let remarksDate = new Date(data);
                convertedDate = this.getDateInString(remarksDate);

                this.userService.getAll(query).subscribe((list: IUser[]) => {
                    let userId = list[0].Id;
                    let tmQuery = `$filter=JobCodeId eq ${jobCodeId} and PostedBy eq '${userId}' and Date eq datetime'${convertedDate}'`;
                    this.timeSheetService.getAll(tmQuery).subscribe((tmList: ITimeSheet[]) => {
                        this.remarksList = [];
                        tmList.forEach(item => {
                            this.remarksObj = {
                                hour: item.Hours,
                                remarks: item.Remarks
                            }
                            this.remarksList.push(this.remarksObj);
                        });
                    });
                });
            });
    }

    getDateInString(input: Date): string {
        var year = input.getFullYear();
        var month = input.getMonth() + 1;
        var date = input.getDate();
        var dateInString = date.toString();
        var monthInString = month.toString();

        if (date < 10) {
            dateInString = "0" + dateInString;
        }
        if (month < 10) {
            monthInString = "0" + monthInString;
        }
        let remarksDateInString = year.toString() + "-" + monthInString + "-" + dateInString;
        return remarksDateInString;
    }

    public exportToCSV(timeSheetList: IFGetTimeSheetReport_Result[]) {
        let dataList: any = [];
        let FileName: string = "";

        timeSheetList.forEach(item => {
            let data = {
                "Employee No": item.EmployeeNo,
                "Employee Name": item.EmployeeName,
                JobCode: item.JobCode,
                Shrawan: item.Shrawan | 0,
                Bhadra: item.Bhadra | 0,
                Ashwin: item.Ashwin | 0,
                Kartik: item.Kartik | 0,
                Mangsir: item.Mangsir | 0,
                Poush: item.Poush | 0,
                Magh: item.Magh | 0,
                Falgun: item.Falgun | 0,
                Chaitra: item.Chaitra | 0,
                Baishakh: item.Baishakh | 0,
                Jestha: item.Jestha | 0,
                Ashadh: item.Ashadh | 0
            }

            dataList.push(data);
        });
        FileName = "TimeSheet";
        if (this.filterByStaff != null && this.filterByJobCode != null) {
            FileName += "_" + this.empFileName + "_" + this.jbFileName;
        }
        else if (this.filterByStaff != null) {
            FileName += "_" + this.empFileName;
        }
        else if (this.filterByJobCode != null) {
            FileName += "_" + this.jbFileName;
        }

        this.csvService.download(dataList, FileName);
    }

    public exportToCSVDaily(timeSheetList: IFGetTimeSheetDayWiseReport_Result) {
        let dataList: any = [];
        let FileName: string = "";

        let data = {
            Month: this.mnthFileName,
            "Employee No": timeSheetList.EmployeeNo,
            "Employee Name": timeSheetList.EmployeeName,
            JobCode: timeSheetList.JobCode,
            1: timeSheetList.C1 | 0,
            2: timeSheetList.C2 | 0,
            3: timeSheetList.C3 | 0,
            4: timeSheetList.C4 | 0,
            5: timeSheetList.C5 | 0,
            6: timeSheetList.C6 | 0,
            7: timeSheetList.C7 | 0,
            8: timeSheetList.C8 | 0,
            9: timeSheetList.C9 | 0,
            10: timeSheetList.C10 | 0,
            11: timeSheetList.C11 | 0,
            12: timeSheetList.C12 | 0,
            13: timeSheetList.C13 | 0,
            14: timeSheetList.C14 | 0,
            15: timeSheetList.C15 | 0,
            16: timeSheetList.C16 | 0,
            17: timeSheetList.C17 | 0,
            18: timeSheetList.C18 | 0,
            19: timeSheetList.C19 | 0,
            20: timeSheetList.C20 | 0,
            21: timeSheetList.C21 | 0,
            22: timeSheetList.C22 | 0,
            23: timeSheetList.C23 | 0,
            24: timeSheetList.C24 | 0,
            25: timeSheetList.C25 | 0,
            26: timeSheetList.C26 | 0,
            27: timeSheetList.C27 | 0,
            28: timeSheetList.C28 | 0,
            29: timeSheetList.C29 | 0,
            30: timeSheetList.C30 | 0,
            31: timeSheetList.C31 | 0,
            32: timeSheetList.C32 | 0
        }
        dataList.push(data);

        FileName = "TimeSheet_" + this.mnthFileName;

        this.csvService.download(dataList, FileName);
    }
}
