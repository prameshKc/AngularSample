import { Component, Injectable, ViewChild } from '@angular/core';
import {
    EmployeePositionService, UserService, 
    SupervisorListService, ParamService
} from '../../services/BaseService';
import {
    IEmployeePosition, IEmployee, IPagination,
    IUser, IParam, IODataResult
} from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';
import { CsvService } from 'src/app/services/excel.service';

@Component({
    templateUrl: 'promotionDetail.component.html'
})
export class PromotionDetail {
    EmployeePromotionList: IEmployeePosition[] = [];
    newEmployeePromotionList: IEmployeePosition[] = [];

    displayEPTable: boolean = false;
    inputFromDate: IInputDateVM;
    inputFromDateOptions: IDatePickerOptionsVM;
    inputToDate: IInputDateVM;
    inputToDateOptions: IDatePickerOptionsVM;
    ePEffectiveFromInString: any;
    ePEffectiveToInString: any;
    isEffFromGreater: boolean = false;
    userId: string;
    userDetails: IUser = <IUser>{};
    supervisorHierarchylist: IEmployee[] = [];
    requiredEmployeeId: number;
    divisionRequired: boolean = false;
    costCenterRequired: boolean = false;
    workAreaRequired: boolean = false;
    InputParam: IParam = <IParam>{};
    requiredFromDate: boolean = false;
    requiredToDate: boolean = false;
    submitFlag: boolean = false;
    fromDate: Date;
    toDate: Date;

    //for pagination
    pagination?: IPagination;
    filterObj?: IFilterViewModel;

    toggleSort: boolean = false;
    allSupervisorHierarchylist: IEmployee[] = [];
    isAdmin: boolean = false;
    currentEmpPositionList: IEmployeePosition[] = [];
    employeePositionHistoryList: IEmployeePosition[] = [];
    employeeNo: number;
    employeeName: string;
    dateOfJoin: Date;
    uniqueEmpIdArray: number[];
    currentEmpId: number;

    //employee Position History Modal
  @ViewChild('EmployeePositionHistoryModal', { static: false }) public EmployeePositionHistoryModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    constructor(
        public employeePositionService: EmployeePositionService,
        public userService: UserService,
        public supervisorListService: SupervisorListService,
        public paramService: ParamService,
        public toastyService: ToastyService,
        public toastyConfig: ToastyConfig,
        public csvService: CsvService
    ) {
        this.userId = localStorage.getItem('UserId');
        this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
        this.getEmployeeId();
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        let currentDate: Date = new Date();
        this.filterObj = { Name: "", Sort: "false", SortingAttribute: "EffectiveFrom", SearchBy: "" };
        this.IsDivisionRequired(18);
        this.IsCostCenterRequired(19);
        this.IsWorkAreaRequired(20);
        this.inputFromDate = <IInputDateVM>{
            Year: currentDate.getFullYear(),
            Month: currentDate.getMonth(),
            Date: currentDate.getDate(),
        };
        this.inputFromDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        };

        this.inputToDate = <IInputDateVM>{
            Year: currentDate.getFullYear(),
            Month: currentDate.getMonth() + 1,
            Date: currentDate.getDate(),
        };
        this.inputToDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        };
    }

    public filterEmployeePromotionDetail() {
        if (this.submitFlag == true) {
            this.getAllPromotionDetail(this.filterObj, this.fromDate, this.toDate);
        }
        else {
            this.getAllPromotionDetail(this.filterObj);
        }
    }

    public promotionAndFilter() {
        this.filterObj = { Name: "", Sort: "false", SortingAttribute: "EffectiveFrom", SearchBy: "" };
        this.submitFlag = false;
        let currentDate: Date = new Date();
        this.inputFromDate = <IInputDateVM>{
            Year: currentDate.getFullYear(),
            Month: currentDate.getMonth(),
            Date: currentDate.getDate(),
        };
        this.inputToDate = <IInputDateVM>{
            Year: currentDate.getFullYear(),
            Month: currentDate.getMonth() + 1,
            Date: currentDate.getDate(),
        };
        this.filterEmployeePromotionDetail();
    }

    public getEmployeeId() {
        var query = "$expand=Employee,Employee/ReportTo,MenuTemplate/MenuVsTemplate";
        this.userService.get(this.userId, query).subscribe((data: IUser) => {
            this.userDetails = data;
            this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
            this.requiredEmployeeId = data.EmployeeId;
            let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
            if (this.submitFlag == true) {
                this.getAllPromotionDetail(this.filterObj, this.fromDate, this.toDate);
            }
            else {
                this.getAllPromotionDetail(this.filterObj);
            }
            if (currentReportTo.ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
                this.isAdmin = true;
            }
            else {
                if (this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
                    this.isAdmin = true;
                }
                this.isAdmin = false;
            }
        })
    }

    
    public submit(date1?: Date, date2?: Date) {
        this.submitFlag = true;
        this.fromDate = date1;
        this.toDate = date2;
        //if (this.inputFromDate >= this.inputToDate) {
        //    this.isEffFromGreater = true;
        //}
        //else {
        //    this.isEffFromGreater = false;
        //}
        if (date1 != null && date2 != null) {
            if (date1 >= date2) {
                this.isEffFromGreater = true;
            }
            else {
                this.isEffFromGreater = false;
                //this.showEmployeePrmotionDetail(date1, date2, filterObj);
                this.getAllPromotionDetail(this.filterObj, date1, date2);

            }
        }
        else {
            if (date1 == null && date2 == null) {
                this.requiredFromDate = true;
                this.requiredToDate = true;
                //this.onEffectiveFromSelect1(this.inputFromDate);
                //this.onEffectiveToSelect1(this.inputToDate);
            }
            else if (date1 == null) {
                this.requiredFromDate = true;
                //this.onEffectiveFromSelect1(this.inputFromDate);
            }
            else if (date2 == null) {
                this.requiredToDate = true;
                //this.onEffectiveToSelect1(this.inputToDate);
            }
            //this.showEmployeePrmotionDetail(this.ePEffectiveFromInString, this.ePEffectiveToInString);
        }
    }
    public getAllPromotionDetail(filterObj?: IFilterViewModel, input1?: Date, input2?: Date) {
        if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
            if (input1 != null && input2 != null && this.submitFlag == true) {
                this.supervisorListService.GetPromotionDetailHierarchy(this.pagination, -1, filterObj, input1, input2)
                    .subscribe((data: IODataResult<IEmployeePosition[]>) => {
                        this.displayEPTable = true;
                        this.EmployeePromotionList = data.value;                        
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                        //this.uniqueEmpIdArray = [];
                        //this.newEmployeePromotionList.forEach(item => {
                        //    var unique = this.uniqueEmpIdArray.filter(x => x == item.EmployeeId).length;
                        //    if (unique == 0) {
                        //        this.uniqueEmpIdArray.push(item.EmployeeId);
                        //        this.getAllCurrentEmployeePosition(item.EmployeeId).then((data) => {
                        //            this.EmployeePromotionList.push(data);
                        //        });
                        //    }
                        //})
                    });
            }
            else {
                this.supervisorListService.GetPromotionDetailHierarchy(this.pagination, -1, filterObj)
                    .subscribe((data: IODataResult<IEmployeePosition[]>) => {
                        this.displayEPTable = true;
                        this.EmployeePromotionList = data.value;
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                        //this.uniqueEmpIdArray = [];
                        //this.newEmployeePromotionList.forEach(item => {
                        //    var unique = this.uniqueEmpIdArray.filter(x => x == item.EmployeeId).length;
                        //    if (unique == 0) {
                        //        this.uniqueEmpIdArray.push(item.EmployeeId);
                        //        this.getAllCurrentEmployeePosition(item.EmployeeId).then((data) => {
                        //            this.EmployeePromotionList.push(data);
                        //        });
                        //    }
                        //})
                    });

            }
        } else {
            if (input1 != null && input2 != null && this.submitFlag == true) {
                this.supervisorListService.GetPromotionDetailHierarchy(this.pagination, this.currentEmpId, filterObj, input1, input2)
                    .subscribe((data: IODataResult<IEmployeePosition[]>) => {
                        this.displayEPTable = true;
                        this.EmployeePromotionList = data.value;
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                        //this.uniqueEmpIdArray = [];
                        //this.newEmployeePromotionList.forEach(item => {
                        //    var unique = this.uniqueEmpIdArray.filter(x => x == item.EmployeeId).length;
                        //    if (unique == 0) {
                        //        this.uniqueEmpIdArray.push(item.EmployeeId);
                        //        this.getAllCurrentEmployeePosition(item.EmployeeId).then((data) => {
                        //            this.EmployeePromotionList.push(data);
                        //        });
                        //    }
                        //})
                    });
            }
            else {
                this.supervisorListService.GetPromotionDetailHierarchy(this.pagination, this.currentEmpId, filterObj)
                    .subscribe((data: IODataResult<IEmployeePosition[]>) => {
                        this.displayEPTable = true;
                        this.EmployeePromotionList = data.value;                       
                        this.pagination = {
                            ItemsPerPage: this.pagination.ItemsPerPage,
                            TotalItems: data.count,
                            CurrentPage: this.pagination.CurrentPage,
                            SortBy: this.pagination.SortBy
                        };
                        //this.uniqueEmpIdArray = [];
                        //this.newEmployeePromotionList.forEach(item => {
                        //    var unique = this.uniqueEmpIdArray.filter(x => x == item.EmployeeId).length;
                        //    if (unique == 0) {
                        //        this.uniqueEmpIdArray.push(item.EmployeeId);
                        //        this.getAllCurrentEmployeePosition(item.EmployeeId).then((data) => {
                        //            this.EmployeePromotionList.push(data);
                        //        });
                        //    }
                        //})
                    });
            }
        }
    }

    //public getAllCurrentEmployeePosition(id: number): Promise<IEmployeePosition> {
    //    return new Promise<IEmployeePosition>((resolve) => {
    //        var query = "$expand=Employee,Employee/ReportTo,Company,CostCenter,Category,Department,Division,Designation,WorkArea&$filter=Employee/EmployeeNo ne 0 and EmployeeId eq " + id + "&$orderby=EffectiveFrom desc &$top=1";
    //        this.employeePositionService.getAll(query)
    //            .subscribe((list: IEmployeePosition[]) => {
    //                this.currentEmpPositionList = list;
    //                this.currentEmpPositionList.forEach(item => {
    //                    resolve(item);
    //                })
    //            });
    //    });

    //}

    public hideDetail() {
        this.submitFlag = false;
        let currentDate: Date = new Date();
        this.inputFromDate = <IInputDateVM>{
            Year: currentDate.getFullYear(),
            Month: currentDate.getMonth(),
            Date: currentDate.getDate(),
        };
        this.inputToDate = <IInputDateVM>{
            Year: currentDate.getFullYear(),
            Month: currentDate.getMonth() + 1,
            Date: currentDate.getDate(),
        };
        this.getAllPromotionDetail(this.filterObj);
    }

    onEffectiveFromSelect1(selectedDate: IInputDateVM) {
        this.inputFromDate = selectedDate;
        this.requiredFromDate = false;

        //if (this.inputFromDate >= this.inputToDate) {
        //    this.isEffFromGreater = true;
        //}
        //else {
        //    this.isEffFromGreater = false;
        //}

        if (this.inputFromDate.Date < 10 || this.inputFromDate.Month < 10) {
            var dateInString = this.inputFromDate.Date.toString();
            var monthInString = this.inputFromDate.Month.toString();
            if (this.inputFromDate.Date < 10) {
                var date = "0" + dateInString;
            }
            if (this.inputFromDate.Month < 10) {
                var month = "0" + monthInString;
            }

            if (this.inputFromDate.Date < 10 && this.inputFromDate.Month > 9) {
                this.ePEffectiveFromInString = this.inputFromDate.Year.toString() + "-" + this.inputFromDate.Month.toString() + "-" + date;
            }
            else if (this.inputFromDate.Month < 10 && this.inputFromDate.Date > 9) {
                this.ePEffectiveFromInString = this.inputFromDate.Year.toString() + "-" + month + "-" + this.inputFromDate.Date.toString();
            }
            else {
                this.ePEffectiveFromInString = this.inputFromDate.Year.toString() + "-" + month + "-" + date;
            }
        }
        else {
            this.ePEffectiveFromInString = this.inputFromDate.Year.toString() + "-" + this.inputFromDate.Month.toString() + "-" + this.inputFromDate.Date.toString();
        }
    }

    onEffectiveToSelect1(selectedDate: IInputDateVM) {
        this.inputToDate = selectedDate;
        this.requiredToDate = false;
        //if (this.inputFromDate >= this.inputToDate) {
        //    this.isEffFromGreater = true;
        //}
        //else {
        //    this.isEffFromGreater = false;
        //}

        if (this.inputToDate.Date < 10 || this.inputToDate.Month < 10) {
            var dateInString = this.inputToDate.Date.toString();
            var monthInString = this.inputToDate.Month.toString();

            if (this.inputToDate.Date < 10) {
                var date = "0" + dateInString;
            }
            if (this.inputToDate.Month < 10) {
                var month = "0" + monthInString;
            }

            if (this.inputToDate.Date < 10 && this.inputToDate.Month > 9) {
                this.ePEffectiveToInString = this.inputToDate.Year.toString() + "-" + this.inputToDate.Month.toString() + "-" + date;
            }
            else if (this.inputToDate.Month < 10 && this.inputToDate.Date > 9) {
                this.ePEffectiveToInString = this.inputToDate.Year.toString() + "-" + month + "-" + this.inputToDate.Date.toString();
            }
            else {
                this.ePEffectiveToInString = this.inputToDate.Year.toString() + "-" + month + "-" + date;
            }
        }
        else {
            this.ePEffectiveToInString = this.inputToDate.Year.toString() + "-" + this.inputToDate.Month.toString() + "-" + this.inputToDate.Date.toString();
        }
    }

    public IsDivisionRequired(id: number) {
        var query = "$select=ParamValue/PValue&$expand=ParamValue"
        this.paramService.get(id, query)
            .subscribe((one: IParam) => {
                this.InputParam = one;
                if (this.InputParam.ParamValue.PValue == "true") {
                    this.divisionRequired = true;
                }
                else {
                    this.divisionRequired = false;
                }
            })
    }

    public IsCostCenterRequired(id: number) {
        var query = "$select=ParamValue/PValue&$expand=ParamValue"
        this.paramService.get(id, query)
            .subscribe((one: IParam) => {
                this.InputParam = one;
                if (this.InputParam.ParamValue.PValue == "true") {
                    this.costCenterRequired = true;
                }
                else {
                    this.costCenterRequired = false;
                }
            })
    }

    public IsWorkAreaRequired(id: number) {
        var query = "$select=ParamValue/PValue&$expand=ParamValue"
        this.paramService.get(id, query)
            .subscribe((one: IParam) => {
                this.InputParam = one;
                if (this.InputParam.ParamValue.PValue == "true") {
                    this.workAreaRequired = true;
                }
                else {
                    this.workAreaRequired = false;
                }
            })
    }

    public sortBy(sortBy: string) {
        this.toggleSort = !this.toggleSort;
        if (this.toggleSort == true) {
            this.filterObj.Sort = "true";
        }
        else {
            this.filterObj.Sort = "false";
        }

        this.filterObj.SortingAttribute = sortBy;
        if (this.submitFlag == true) {
            this.getAllPromotionDetail(this.filterObj, this.fromDate, this.toDate);
        }
        else {
            this.getAllPromotionDetail(this.filterObj);
        }
    }

    public viewHistory(id: number) {
        this.openEmployeePositionModal();
        var query = "$expand=Employee,Company,CostCenter,Category,Department,Division,Designation,WorkArea&$filter=EmployeeId eq " + id + "&$orderby=EffectiveFrom desc";

        this.employeePositionService.getAll(query)
            .subscribe((list: IEmployeePosition[]) => {
                this.employeePositionHistoryList = list;
                this.employeePositionHistoryList.forEach(item => {
                    this.employeeName = "";
                    this.employeeNo = item.Employee.EmployeeNo;
                    this.dateOfJoin = item.Employee.DateOfJoin;
                    if (item.Employee.FirstName != null) {
                        this.employeeName += item.Employee.FirstName + " ";
                    }
                    if (item.Employee.MiddleName != null) {
                        this.employeeName += item.Employee.MiddleName + " ";
                    }
                    if (item.Employee.LastName != null) {
                        this.employeeName += item.Employee.LastName;
                    }
                })
            });
    }

    public openEmployeePositionModal() {
        this.selectedModalLoaded = true;
        this.EmployeePositionHistoryModal.show();
    }

    public hideEmployeePositionModal() {
        this.EmployeePositionHistoryModal.hide();
        this.employeePositionHistoryList = [];
        this.selectedModalLoaded = false;
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        if (this.userDetails.Employee != null) {
            if (this.submitFlag == true) {
                this.getAllPromotionDetail(this.filterObj, this.fromDate, this.toDate);
            }
            else {
                this.getAllPromotionDetail(this.filterObj);
            }
        } else {
            this.getEmployeeId();
        }
    }

    exportToCSV() {
        //let data = this.csvService.ConvertToCSV(this.employeePositionHistoryList);
        let data = [];
        data.push({ '': '' });
        data.push({
            0: `Employee Name:`,
            1: `${this.employeePositionHistoryList[0].Employee.FirstName} ${this.employeePositionHistoryList[0].Employee.MiddleName ? this.employeePositionHistoryList[0].Employee.MiddleName + ' ' : ''}${this.employeePositionHistoryList[0].Employee.LastName}`
        })
        data.push({
            0: `Employee No.:`,
            1: `${this.employeePositionHistoryList[0].Employee.EmployeeNo.toString()}`
        });
        data.push({
            0: `Joined Date:`,
            1: `${this.dateOfJoin}`
        });
        data.push({ '': '' });
        data.push({
            0: 'Effective From',
            1: 'Designation',
            2: 'Department'
        });
        this.employeePositionHistoryList.forEach(item => {
            data.push({
                0: item.EffectiveFrom,
                1: item.Designation.DesignationName,
                2: item.Department.DepartmentName
            });
        })

        this.csvService.download(
            data,
            `Position History: ${this.employeePositionHistoryList[0].Employee.FirstName} ${this.employeePositionHistoryList[0].Employee.MiddleName ? this.employeePositionHistoryList[0].Employee.MiddleName + ' ' : ''}${this.employeePositionHistoryList[0].Employee.LastName}`
        );
    }
}
