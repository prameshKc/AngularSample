import { Component, ViewChild } from '@angular/core';
import { EmployeeWorkAreaService, EmployeeService, WorkAreaService, UserService, SupervisorListService } from '../../services/BaseService';
import { IEmployeeWorkArea, IEmployee, IWorkArea, IUser, IPagination, IODataResult } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastOptions } from 'ngx-toasty';
import { IInputDateVM, IDatePickerOptionsVM } from '../../shared/datepicker/models/datepickerVM';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';

@Component({
    templateUrl: 'employeeWorkArea.component.html'
})
export class EmployeeWorkAreaComponent {
    isAddEmployeeWorkArea: boolean = false;
    isEditEmployeeWorkArea: boolean = false;
    isAddEditToggle: boolean = false;
    employeeWorkAreaList: IEmployeeWorkArea[] = [];
    compareWorkArea: IEmployeeWorkArea[] = [];
    compareWorkArea2: IEmployeeWorkArea[] = [];
    InputEmployeeWorkArea: IEmployeeWorkArea = <IEmployeeWorkArea>{};
    employeeList: IEmployee[] = [];
    workAreaList: IWorkArea[] = [];
    currentDate: Date = new Date();
    employeeName: string;
    employeeId: number;
    //Employee Work Area Modal
  @ViewChild('employeeWorkAreaModal', { static: false }) public employeeWorkAreaModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;
    selectedModalLoaded: boolean = false;

    //deleteModal
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirectiveDelete: any;
    deleteModalLoaded: boolean = false;
    deleteId: number;

    //searching and sorting
    filterObj?: IFilterViewModel;

    isEditable: boolean = false;
    isDeletable: boolean = false;
    deleteItem: IEmployeeWorkArea = <IEmployeeWorkArea>{};
    invalidFromDateCount: number;
    invalidToDateCount: number;
    invalidFromDate: boolean = false;
    invalidToDate: boolean = false;
    lessThanFromDate: boolean = false;
    isFromDateLessThanCurrentDate: boolean = false;
    isToDateLessThanCurrentDate: boolean = false;
    currentdateInString: string;
    toggleSort: boolean = false;
    toggleEmpName: boolean = false;
    toggleWAName: boolean = false;
    toggleFromDate: boolean = false;
    userId: string;
    userDetails: IUser = <IUser>{};
    requiredEmployeeId: number;
    isAdmin: boolean = false;
    supervisorHierarchylist: IEmployee[] = [];
    allSupervisorHierarchylist: IEmployee[] = [];
    newEmployeeWorkAreaList: IEmployeeWorkArea[] = [];
    currentEmpId: number;

    //for pagination
    pagination: IPagination;

    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };

    //date picker inputs.
    inputFromDate: IInputDateVM;
    inputFromDateOptions: IDatePickerOptionsVM;

    inputToDate: IInputDateVM;
    inputToDateOptions: IDatePickerOptionsVM;

    constructor(
        public employeeWorkAreaService: EmployeeWorkAreaService,
        public employeeService: EmployeeService,
        public workAreaService: WorkAreaService,
        public userService: UserService,
        public supervisorListService: SupervisorListService,
        private toastyService: ToastyService    ) {
        this.userId = localStorage.getItem('UserId');
        this.employeeId = parseInt(localStorage.getItem('EmployeeId'));
        this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: "" };
        this.getEmployeeId();
        this.pagination = <IPagination>{
            CurrentPage: 1,
            ItemsPerPage: 50,
            TotalItems: 0,
            SortBy: null
        };
        this.getAllEmployee();
        this.getAllWorkArea();
        this.currentDate.setHours(0, 0, 0, 0);

        this.inputFromDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
        this.inputFromDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        };

        this.inputToDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
        this.inputToDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        };
    }

    //getAllEmployee
    public getAllEmployee() {
        this.employeeService.getAll()
            .subscribe((list: IEmployee[]) => {
                this.employeeList = list;
            });
    }

    //getAll
    public getAllWorkArea() {
        this.workAreaService.getAll()
            .subscribe((list: IWorkArea[]) => {
                this.workAreaList = list;
            });
    }

    public getEmployeeId() {
        var query = "$expand=Employee,Employee/ReportTo,MenuTemplate/MenuVsTemplate";
        this.userService.get(this.userId, query).subscribe((data: IUser) => {
            this.userDetails = data;
            this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
            this.requiredEmployeeId = data.EmployeeId;
            let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
            this.getAllEmployeeWorkArea(this.filterObj);
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

    //getAll
    public getAllEmployeeWorkArea(filterObj?: IFilterViewModel) {
        if (this.userDetails.Employee.ReportTo != null || typeof this.userDetails.Employee.ReportTo != undefined) {
            if (this.userDetails.Employee.ReportTo[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {

                this.supervisorListService.GetEmployeeWorkAreaHierarchy(this.pagination, -1, filterObj).subscribe((data: IODataResult<IEmployeeWorkArea[]>) => {
                    this.employeeWorkAreaList = data.value;                    
                    this.pagination = {
                        ItemsPerPage: this.pagination.ItemsPerPage,
                        TotalItems: data.count,
                        CurrentPage: this.pagination.CurrentPage,
                        SortBy: this.pagination.SortBy
                    };
                });
            }
            else {
                this.supervisorListService.GetEmployeeWorkAreaHierarchy(this.pagination, this.currentEmpId, filterObj).subscribe((data: IODataResult<IEmployeeWorkArea[]>) => {
                    this.employeeWorkAreaList = data.value;
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

    public filterHome() {
        this.getAllEmployeeWorkArea(this.filterObj);
    }

    //filter
    public filterEmployeeWorkArea() {
        this.getAllEmployeeWorkArea(this.filterObj);
    }

    public employeeWorkAreaAndFilter() {
        this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: "" };
        this.getAllEmployeeWorkArea(this.filterObj);
    }

    public openEmployeeWorkAreaModal() {
        this.isAddEmployeeWorkArea = true;
        this.isEditEmployeeWorkArea = false;
        this.selectedModalLoaded = true;
    }

    public hideEmployeeWorkAreaModal() {
        this.selectedModalLoaded = false;
        this.isAddEmployeeWorkArea = false;
        this.isEditEmployeeWorkArea = false;
        this.isAddEditToggle = false;
        this.InputEmployeeWorkArea = <IEmployeeWorkArea>{};
        this.isEditable = false;
        this.isDeletable = false;
        this.inputFromDate = {
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate()
        }
        this.inputToDate = {
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate()
        }
        this.invalidFromDate = false;
        this.invalidToDate = false;
        this.isFromDateLessThanCurrentDate = false;
        this.isToDateLessThanCurrentDate = false;
    }

    public saveEmployeeWorkArea() {
        this.invalidFromDateCount = 0;
        this.invalidToDateCount = 0;
        this.InputEmployeeWorkArea.PostedBy = this.userId;

        this.compareWorkArea.forEach(item => {
            var date1 = new Date(item.FromDate);
            var date2 = new Date(item.ToDate);
            date1.setHours(0, 0, 0, 0);
            date2.setHours(0, 0, 0, 0);

            if (item.EmployeeId == this.InputEmployeeWorkArea.EmployeeId && item.WorkAreaId == this.InputEmployeeWorkArea.WorkAreaId) {
                if ((date1 >= this.InputEmployeeWorkArea.FromDate && date1 <= this.InputEmployeeWorkArea.ToDate) || (date2 >= this.InputEmployeeWorkArea.FromDate && date2 <= this.InputEmployeeWorkArea.ToDate)) {
                    if (date1 >= this.InputEmployeeWorkArea.FromDate && date1 <= this.InputEmployeeWorkArea.ToDate) {
                        this.invalidFromDateCount = this.invalidFromDateCount + 1;
                    }
                    if (date2 >= this.InputEmployeeWorkArea.FromDate && date2 <= this.InputEmployeeWorkArea.ToDate) {
                        this.invalidToDateCount = this.invalidToDateCount + 1;
                    }
                }
                else if ((this.InputEmployeeWorkArea.FromDate > date1 && this.InputEmployeeWorkArea.FromDate < date2) || (this.InputEmployeeWorkArea.ToDate > date1 && this.InputEmployeeWorkArea.ToDate < date2)) {
                    if (this.InputEmployeeWorkArea.FromDate > date1 && this.InputEmployeeWorkArea.FromDate < date2) {
                        this.invalidFromDateCount = this.invalidFromDateCount + 1;
                    }
                    if (this.InputEmployeeWorkArea.ToDate > date1 && this.InputEmployeeWorkArea.ToDate < date2) {
                        this.invalidToDateCount = this.invalidToDateCount + 1;
                    }
                }
            }

        })
        if (this.invalidFromDateCount > 0) {
            this.invalidFromDate = true;
        }
        else {
            this.invalidFromDate = false;
        }
        if (this.invalidToDateCount > 0) {
            this.invalidToDate = true;
        }
        else {
            this.invalidToDate = false;
        }
        if (this.invalidFromDate == false && this.invalidToDate == false) {
            this.employeeWorkAreaService.post(this.InputEmployeeWorkArea)
                .subscribe(() => {
                    this.InputEmployeeWorkArea = <IEmployeeWorkArea>{};
                    this.inputFromDate = <IInputDateVM>{};
                    this.inputToDate = <IInputDateVM>{};
                    this.isAddEditToggle = false;
                    this.selectedModalLoaded = false;
                    this.hideEmployeeWorkAreaModal();
                    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: "" };
                    this.getAllEmployeeWorkArea(this.filterObj);


                    var toastOptions: ToastOptions = {
                        title: "Success",
                        msg: "Employee Work Area has been successfully Added",
                        showClose: true,
                        timeout: 5000,
                        theme: 'bootstrap'
                    };
                    this.toastyService.success(toastOptions);
                });
        }
    }

    //delete
    openDeleteModal(Id: number) {
        this.deleteId = Id;
        this.deleteModalLoaded = true;

        this.employeeWorkAreaService.get(Id)
            .subscribe((one: IEmployeeWorkArea) => {
                this.deleteItem = one;

                this.currentDate.setHours(0, 0, 0, 0);
                let date = new Date(this.deleteItem.FromDate);

                if (date < this.currentDate) {
                    this.isDeletable = true;
                }
            });

        if (this.deleteModal != undefined) {
            this.deleteModal.config.backdrop = false;
        }
        this.deleteModal.show();

    }

    public hideDeleteModal(): void {
        this.deleteModal.hide();
        this.isDeletable = false;
    }

    public deleteEmployeeWorkArea() {
        this.employeeWorkAreaService.delete(this.deleteId)
            .subscribe(() => {
                this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: "" };
                this.getAllEmployeeWorkArea(this.filterObj);
                this.deleteModalLoaded = false;
                this.hideDeleteModal();

                var toastOptions: ToastOptions = {
                    title: "Delete",
                    msg: "Employee Work Area has been deleted successfully",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.error(toastOptions);

            });
    }

    //EditModal
    openEditModal() {
        this.isEditEmployeeWorkArea = true;
        this.isAddEmployeeWorkArea = false;
        this.selectedModalLoaded = true;
    }


    //getOne
    public getEmployeeWorkArea(id: number) {
        var query = "$expand=Employee";
        this.isEditable = false;
        this.employeeName = "";
        let currentDate = new Date();

        this.employeeWorkAreaService.get(id, query)
            .subscribe((one: IEmployeeWorkArea) => {
                this.InputEmployeeWorkArea = one;
                this.employeeId = one.EmployeeId;
                if (one.Employee.FirstName != null) {
                    this.employeeName += one.Employee.FirstName + " ";
                }
                if (one.Employee.MiddleName != null) {
                    this.employeeName += one.Employee.MiddleName + " ";
                }
                if (one.Employee.LastName != null) {
                    this.employeeName += one.Employee.LastName;
                }
                let date = new Date(one.FromDate);
                let date2 = new Date(one.ToDate);

                this.inputFromDate.Year = date.getFullYear();
                this.inputFromDate.Month = date.getMonth() + 1;
                this.inputFromDate.Date = date.getDate();

                this.inputToDate.Year = date2.getFullYear();
                this.inputToDate.Month = date2.getMonth() + 1;
                this.inputToDate.Date = date2.getDate();

                this.isAddEditToggle = true;

                if (date < currentDate) {
                    this.isEditable = true;
                }
                this.openEditModal();
                this.getWorkAreabyId(this.employeeId, id);
            });
    }

    //edit
    public editEmployeeWorkArea() {
        this.invalidFromDateCount = 0;
        this.invalidToDateCount = 0;
        this.InputEmployeeWorkArea.ModifiedBy = this.userId;
        this.compareWorkArea.forEach(item => {
            var date1 = new Date(item.FromDate);
            var date2 = new Date(item.ToDate);
            date1.setHours(0, 0, 0, 0);
            date2.setHours(0, 0, 0, 0);
            var fromDate = new Date(this.InputEmployeeWorkArea.FromDate);
            var toDate = new Date(this.InputEmployeeWorkArea.ToDate);
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(0, 0, 0, 0);


            if (item.EmployeeId == this.InputEmployeeWorkArea.EmployeeId && item.WorkAreaId == this.InputEmployeeWorkArea.WorkAreaId) {
                if ((date1 >= fromDate && date1 <= toDate) || (date2 >= fromDate && date2 <= toDate)) {
                    if (date1 >= fromDate && date1 <= toDate) {
                        this.invalidFromDateCount = this.invalidFromDateCount + 1;
                    }
                    if (date2 >= fromDate && date2 <= toDate) {
                        this.invalidToDateCount = this.invalidToDateCount + 1;
                    }
                }
                else if ((fromDate > date1 && fromDate < date2) || (toDate > date1 && toDate < date2)) {
                    if (fromDate > date1 && fromDate < date2) {
                        this.invalidFromDateCount = this.invalidFromDateCount + 1;
                    }
                    if (toDate > date1 && toDate < date2) {
                        this.invalidToDateCount = this.invalidToDateCount + 1;
                    }
                }
            }

        })
        if (this.invalidFromDateCount > 0) {
            this.invalidFromDate = true;
        }
        else {
            this.invalidFromDate = false;
        }
        if (this.invalidToDateCount > 0) {
            this.invalidToDate = true;
        }
        else {
            this.invalidToDate = false;
        }
        if (this.invalidFromDate == false && this.invalidToDate == false) {
            this.employeeWorkAreaService.put(this.InputEmployeeWorkArea.WorkAreaId, this.InputEmployeeWorkArea)
                .subscribe(() => {
                    this.filterObj = { Name: "", Sort: "false", SortingAttribute: "ModifiedOn", SearchBy: "" };
                    this.getAllEmployeeWorkArea(this.filterObj);
                    this.isEditEmployeeWorkArea = false;
                    this.InputEmployeeWorkArea = <IEmployeeWorkArea>{};
                    this.hideEmployeeWorkAreaModal();
                    this.selectedModalLoaded = false;

                    var toastOptions: ToastOptions = {
                        title: "Edited",
                        msg: "Employee Work Area has been successfully Edited",
                        showClose: true,
                        timeout: 5000,
                        theme: 'bootstrap'
                    };
                    this.toastyService.success(toastOptions);
                });
        }
    }


    public generalDateInString(date: Date) {
        var dateInString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        return dateInString;
    }

    workAreaChange(event: any) {
        this.compareWorkArea2 = this.compareWorkArea.filter(x => x.WorkAreaId == event);
    }

    onFromDateSelect(selectedDate: IInputDateVM) {
        this.invalidFromDateCount = 0;
        this.inputFromDate = selectedDate;
        var date = new Date(this.inputFromDate.Year, this.inputFromDate.Month - 1, this.inputFromDate.Date, 5, 45, 0, 0);

        if (date >= this.currentDate) {
            this.isFromDateLessThanCurrentDate = false;
            this.compareWorkArea2.forEach(item => {
                var oldFromDate = new Date(item.FromDate);
                var oldToDate = new Date(item.ToDate);
                oldFromDate.setHours(0, 0, 0, 0);
                oldToDate.setHours(0, 0, 0, 0);
                if (date >= oldFromDate && date <= oldToDate) {
                    this.invalidFromDateCount = this.invalidFromDateCount + 1;
                }
            })

            if (this.invalidFromDateCount > 0) {
                this.invalidFromDate = true;
            }
            else {
                this.invalidFromDate = false;
            }

        }
        else {
            this.isFromDateLessThanCurrentDate = true;
        }
        this.InputEmployeeWorkArea.FromDate = new Date(this.inputFromDate.Year, this.inputFromDate.Month - 1, this.inputFromDate.Date, 5, 45, 0, 0);
    }

    onToDateSelect(selectedDate: IInputDateVM) {
        this.invalidToDateCount = 0;
        this.inputToDate = selectedDate;
        var date = new Date(this.inputToDate.Year, this.inputToDate.Month - 1, this.inputToDate.Date, 5, 45, 0, 0);
        if (date < this.currentDate) {
            this.isToDateLessThanCurrentDate = true;
        }
        else {
            this.isToDateLessThanCurrentDate = false;
            if (date < this.InputEmployeeWorkArea.FromDate) {
                this.lessThanFromDate = true;
            }
            else {
                this.lessThanFromDate = false;
                this.compareWorkArea2.forEach(item => {
                    var oldFromDate = new Date(item.FromDate);
                    var oldToDate = new Date(item.ToDate);
                    oldFromDate.setHours(0, 0, 0, 0);
                    oldToDate.setHours(0, 0, 0, 0);
                    if (date >= oldFromDate && date <= oldToDate) {
                        this.invalidToDateCount = this.invalidToDateCount + 1;
                    }
                })
                if (this.invalidToDateCount > 0) {
                    this.invalidToDate = true;
                }
                else {
                    this.invalidToDate = false;
                }
            }
        }
        this.InputEmployeeWorkArea.ToDate = new Date(this.inputToDate.Year, this.inputToDate.Month - 1, this.inputToDate.Date, 5, 45, 0, 0);
    }

    selectedEmployee(event: any) {
        if (event != null) {
            this.employeeName = "";
            if (event.FirstName != null) {
                this.employeeName += event.FirstName + " ";
            }
            if (event.MiddleName != null) {
                this.employeeName += event.MiddleName + " ";
            }
            if (event.LastName != null) {
                this.employeeName += event.LastName;
            }
        }

        this.openEmployeeWorkAreaModal();
        this.getCurrentDateInString(this.currentDate);

        var query = "$filter=EmployeeId eq " + event.EmployeeId + " and (FromDate gt DateTime'" + this.currentdateInString + "' or ToDate gt DateTime'" + this.currentdateInString + "')";

        this.InputEmployeeWorkArea.EmployeeId = event.EmployeeId;

        this.employeeWorkAreaService.getAll(query)
            .subscribe((list: IEmployeeWorkArea[]) => {
                this.compareWorkArea = list;
            });
    }

    getWorkAreabyId(employeeId: number, id: number) {
        this.getCurrentDateInString(this.currentDate);
        var query = "$filter=EmployeeId eq " + employeeId + " and Id ne " + id + " and (FromDate gt DateTime'" + this.currentdateInString + "' or ToDate gt DateTime'" + this.currentdateInString + "')";
        this.employeeWorkAreaService.getAll(query)
            .subscribe((list: IEmployeeWorkArea[]) => {
                this.compareWorkArea = list;
                this.workAreaChange(this.InputEmployeeWorkArea.WorkAreaId);
            });
    }

    getCurrentDateInString(currentDate: Date) {
        var year = currentDate.getFullYear();
        var month = currentDate.getMonth() + 1;
        var date = currentDate.getDate();

        if (date < 10 || month < 10) {
            var dateInString = date.toString();
            var monthInString = month.toString();
            if (date < 10) {
                var dateString = "0" + dateInString;
            }
            if (this.inputFromDate.Month < 10) {
                var monthString = "0" + monthInString;
            }

            if (date < 10 && month > 9) {
                this.currentdateInString = year.toString() + "-" + month.toString() + "-" + dateString;
            }
            else if (month < 10 && date > 9) {
                this.currentdateInString = year.toString() + "-" + monthString + "-" + date.toString();
            }
            else {
                this.currentdateInString = year.toString() + "-" + monthString + "-" + dateString;
            }
        }
        else {
            this.currentdateInString = year.toString() + "-" + month.toString() + "-" + date.toString();
        }
    }

    sortBy(sortBy: string) {
        this.toggleSort = !this.toggleSort;
        if (this.toggleSort == true) {
            this.filterObj.Sort = "true";
        }
        else {
            this.filterObj.Sort = "false";
        }
        this.filterObj.SortingAttribute = sortBy;
        this.getAllEmployeeWorkArea(this.filterObj);
    }

    onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        if (this.userDetails.Employee != null) {
            this.getAllEmployeeWorkArea(this.filterObj);
        } else {
            this.getEmployeeId();
        }
    }
}
