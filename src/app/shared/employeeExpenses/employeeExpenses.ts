import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { UserService, HRMLedgerService, HRIncentiveService, ParamService, HRExpensesService, BSADCalService, NepaliMonthListService, FiscalYearService } from '../../services/BaseService';
import { IUser, IEmployee, IPagination, IODataResult, IHRMLedger, IBSADCal, INepaliMonthList, IFiscalYear } from '../../models/Models';
import { IFilterViewModel, IHRInsentiveVM } from '../../models/ViewModels';
import { IEmployeeSearchOption } from '../../shared/employeeSearch/employeeSearch.component';
import { IDatePickerOptionsVM, IInputDateVM, ICalendarVM } from '../../shared/datepicker/models/datepickerVM';
import { DatePickerService } from '../../shared/datepicker/modules/datePickerService';
import { ModalDirective } from 'ngx-bootstrap';
import { Utilities } from '../../shared/utilities';
import { ToastOptions, ToastyService } from 'ngx-toasty';
import { DatePickerFunctions } from '../datepicker/modules/datepickerFunctions';

@Component({
    selector: 'employee-expenses',
    templateUrl: './employeeExpenses.html'
})
export class EmployeeExpensesComponent implements OnInit {
    @Input() AM: number;

    userId: string;
    userDetails: IUser = <IUser>{};
    employeeList: IHRInsentiveVM[] = [];
    hrmLedgerList: IHRMLedger[] = [];
    isLoading: boolean = true;
    openRangeCalendar?: boolean;
    currentDate: Date;
    filterByMonth: string = "-1";
    filterByYear: string = "-1";
    saveCount?: number = 0;

    yearList: IBSADCal[] = [];
    monthList: INepaliMonthList[] = [];

  @ViewChild('newIncentivesModal', { static: false }) public newIncentivesModal: ModalDirective;
  @ViewChild('modal', { static: false }) ModalDirective: any;
    selectedModalLoaded: boolean = false;

    // employee search variables
    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true
    };

    //repilcate data variables
    replicateYear: string = '-1';
    replicateMonth: string = '-1';
    replicateDataToggle?: boolean = false;
    replicationDate: Date;
    replicateYearList: number[];

    // filter variables
    filterObj: IFilterViewModel;
    filterByName: string;
    filterStartDate: Date;
    filterEndDate: Date;

    //datepicker variables
    inputDate: IInputDateVM;
    defaultDateType: number;
    filterFromDate: IInputDateVM;
    filterToDate: IInputDateVM;
    defaultDateOptions: IDatePickerOptionsVM;

    // add incentive form variables
    InputHRIncentive: IHRInsentiveVM = <IHRInsentiveVM>{};
    validAmount: boolean = true;
    timerHandle: any;

    //pagination variables
    pagination?: IPagination = <IPagination>{
        CurrentPage: 1,
        ItemsPerPage: 50,
        TotalItems: 0
    };

    constructor(
        public userService: UserService,
        private dateService: DatePickerService,
        public hrIncentiveService: HRIncentiveService,
        public hrExpensesService: HRExpensesService,
        public hrmLedgerService: HRMLedgerService,
        public paramService: ParamService,
        public toastyService: ToastyService,
        public datePickerFunctions: DatePickerFunctions,
        public bsADCalService: BSADCalService,
        private fiscalYearService: FiscalYearService,
        public nepaliMonthService: NepaliMonthListService
    ) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.userId = localStorage.getItem('UserId');
        this.currentDate = new Date();
        this.defaultDateType = Number(localStorage.getItem('Param.DateType'));
        this.reset();
        this.initialize();
    }

    initialize() {
        let currentDate = new Date();
        let startDate: ICalendarVM, endDate: ICalendarVM;

        if (this.defaultDateType == 2) {
            let nepaliDate = this.dateService.GetDateBS(new Date());
            let BSYear = this.dateService.GetBSYear(nepaliDate);
            let BSMonth = this.dateService.GetBSMonth(nepaliDate);

            startDate = this.dateService.DateByYearMonthChange(2, BSYear, BSMonth, 1);
            endDate = this.dateService.DateByYearMonthChange(2, BSYear, BSMonth, startDate.NoOfDays);

            this.filterFromDate = {
                Year: startDate.Date.getFullYear(),
                Month: startDate.Date.getMonth() + 1,
                Date: startDate.Date.getDate()
            };

            this.filterToDate = {
                Year: endDate.Date.getFullYear(),
                Month: endDate.Date.getMonth() + 1,
                Date: endDate.Date.getDate()
            };
        } else {
            this.filterFromDate = {
                Year: new Date().getFullYear(),
                Month: new Date().getMonth(),
                Date: new Date().getDate()
            };

            this.filterToDate = {
                Year: new Date().getFullYear(),
                Month: new Date().getMonth() + 1,
                Date: 0
            };
        }


        this.defaultDateOptions = {
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        }
        this.getAllHRMLedger();
    }

    public reset() {
        this.filterByName = null;
    }

    //openModal
    public openModal() {
        this.selectedModalLoaded = true;
        this.inputDate = {
            Year: new Date().getFullYear(),
            Month: new Date().getMonth() + 1,
            Date: new Date().getDate()
        };
        this.newIncentivesModal.show();
    }

    public openEditModal(hrInsentive: IHRInsentiveVM) {
        let query: string = "$expand=Employee";
        this.hrExpensesService.get(hrInsentive.Id, query).subscribe((one: IHRInsentiveVM) => {
            this.InputHRIncentive = Object.assign({}, one);
            this.inputDate = {
                Year: new Date(one.TDate).getFullYear(),
                Month: new Date(one.TDate).getMonth() + 1,
                Date: new Date(one.TDate).getDate()
            };
            this.InputHRIncentive.StaffId = one.StaffId;

            this.selectedModalLoaded = true;
            this.newIncentivesModal.show();
        });
    }

    public hideModal() {
        this.newIncentivesModal.hide();
        this.InputHRIncentive = <IHRInsentiveVM>{};
        this.selectedModalLoaded = false;
    }

    public getAllHRMLedger() {
        let query: string = `$filter=AM eq ${this.AM}`;
        this.hrmLedgerService.getAll(query).subscribe((data) => {
            this.hrmLedgerList = data;
            this.pagination.SortBy = data[0].ALId.toString();
            //this.getUserDetails();
            this.getAllSupervisorEmployees();
        })
    }

    public getHRMLedger(id: number) {
        return this.hrmLedgerList.filter(x => x.ALId == id)[0].ALDesc;
    }

    public toggleSortBy() {
        this.pagination.CurrentPage = 1;
        //this.getEmployeeList();
        this.getAllSupervisorEmployees();
    }

    public getAllSupervisorEmployees() {
        if (this.pagination.SortBy != null) {
            this.hrExpensesService.GetEmployeeExpensesAll(this.pagination, this.filterObj, this.filterByName, this.filterStartDate, this.filterEndDate)
                .subscribe((data: IODataResult<IHRInsentiveVM[]>) => {
                    this.pagination = {
                        ItemsPerPage: this.pagination.ItemsPerPage,
                        TotalItems: data.count,
                        CurrentPage: this.pagination.CurrentPage,
                        SortBy: this.pagination.SortBy
                    };

                    this.employeeList = data.value;

                    if (this.replicateDataToggle != false) {
                        this.employeeList.forEach(item => {
                            item.TDate = new Date(this.inputDate.Year, this.inputDate.Month, this.inputDate.Date);
                        })
                    }

                    this.isLoading = false;
                }, (err) => {
                    this.isLoading = false;
                })
        }
    }

    public onPageSelect(pagination: IPagination) {
        this.pagination = pagination;
        this.getAllSupervisorEmployees();
    }

    public selectedEmployee(event: IEmployee) {
        if (event != null) {
            this.filterByName = event.FirstName;
            if (event.MiddleName != null) {
                this.filterByName += " " + event.MiddleName;
            }
            if (event.LastName != null) {
                this.filterByName += " " + event.LastName;
            }
            this.onPageSelect(this.pagination);
        }
    }

    public onFilterDateSelect(event: IInputDateVM, flag: string) {
        if (flag == 'F') {
            this.filterStartDate = new Date(event.Year, event.Month - 1, event.Date);
        } else if (flag == 'T') {
            this.filterEndDate = new Date(event.Year, event.Month - 1, event.Date);
        }
    }

    public onTDateSelect(selectedDate: IInputDateVM) {
        this.InputHRIncentive.TDate = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date, 5, 45, 0, 0);
    }

    public onDateSelect(event: IInputDateVM) {
        this.inputDate = event;
        //this.employeeList.filter(x => x.StaffId == id)[0].TDate = new Date(event.Year, event.Month - 1, event.Date)
    }

    public checkMoney(amt: string, event: number) {
        clearTimeout(this.timerHandle);
        this.timerHandle = setTimeout(() => {
            if (event == 1) {
                if (amt == "") {
                    this.validAmount = true;
                }
                else {
                    this.validAmount = Utilities.isDecimal(amt);
                }
            }
        }, 1500);

    }

    public selectedEmployeeForm(event: IEmployee) {
        if (event != null) {
            if (this.selectedModalLoaded == true) {
                this.InputHRIncentive.StaffId = event.EmployeeId;
            } else {
                this.filterByName = event.FirstName;
                if (event.MiddleName != null) {
                    this.filterByName += ' ' + event.MiddleName;
                }
                this.filterByName += ' ' + event.LastName

                this.getAllSupervisorEmployees();
            }
        }
    }

    public isFormValid(bookForm: any): boolean {
        if (!bookForm.form.valid) {
            return false;
        }
        return true;
    }

    saveIncentive() {
        this.InputHRIncentive.PostedBy = this.userId;
        let saveItem: IHRInsentiveVM = Object.assign({}, this.InputHRIncentive);
        if (saveItem.Id == null) {
            saveItem.Id = 0;
        }

        this.hrExpensesService.post(saveItem).subscribe(() => {
            this.InputHRIncentive = <IHRInsentiveVM>{};
            this.hideModal();
            this.pagination.SortBy = saveItem.ALId;

            this.saveCount++;

            var toastOptions: ToastOptions = {
                title: "Success",
                msg: `${this.saveCount} of ${this.employeeList.length} Employee Expenses Information has been successfully Added.`,
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };

            this.toastyService.clearAll();
            this.toastyService.success(toastOptions);

            if (this.saveCount == this.employeeList.length && this.replicateDataToggle != false) {
                this.getAllSupervisorEmployees();

                this.isLoading = false;
                this.replicateDataToggle = false;
                this.pagination.ItemsPerPage = 50;
            } else if (this.replicateDataToggle == false) {
                this.getAllSupervisorEmployees();

                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Employee Expense Information has been successfully Added",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap'
                };
                this.toastyService.success(toastOptions);

                this.isLoading = false;
            }
        }, (err) => {
            var toastOptions: ToastOptions = {
                title: "Error",
                msg: "Employee Expense Information could not be added. Please try again later.",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap'
            };
            this.toastyService.success(toastOptions);
        });
    }



    //replicate data
    replicateToggle() {
        if (this.replicateDataToggle == false) {
            this.replicateDataToggle = true;
            this.employeeList = [];

            this.inputDate = {
                Year: new Date().getFullYear(),
                Month: new Date().getMonth() + 1,
                Date: new Date().getDate()
            };

            this.filterByName = null;
        } else {
            this.pagination.ItemsPerPage = 50;
            this.replicateDataToggle = false;
            this.getAllSupervisorEmployees();
        }
    }

    getReplicationData() {
        if (this.replicateYear != '-1' && this.replicateMonth != '-1' && this.replicateYear && this.replicateMonth) {

            if (this.defaultDateType == 1) {
                this.filterStartDate = new Date(Number(this.replicateYear), Number(this.replicateMonth)-1, 1);
                this.filterEndDate = new Date(Number(this.replicateYear), Number(this.replicateMonth), 0);

            } else {
                let monthDays = this.datePickerFunctions.FGetDaysInMonth(Number(this.replicateYear), Number(this.replicateMonth));
                this.filterStartDate = this.datePickerFunctions.FGetDateAD(Number(this.replicateYear), Number(this.replicateMonth), 1);
                this.filterEndDate = this.datePickerFunctions.FGetDateAD(Number(this.replicateYear), Number(this.replicateMonth), monthDays);
            }


            this.pagination.CurrentPage = 1;
            if (this.replicateDataToggle != false) {
                this.pagination.ItemsPerPage = 30000;
            }
            this.getAllSupervisorEmployees();
        }
    }

    deleteReplicatedItem(deleteItem: IHRInsentiveVM) {
        this.employeeList.splice(this.employeeList.findIndex(x => x.Id == deleteItem.Id), 1);
    }

    saveReplication() {
        this.isLoading = true;
        if (this.employeeList.length > 0) {
            this.saveCount = 0;
            this.employeeList.forEach(item => {
                item.Id = 0;
                this.InputHRIncentive = {
                    ALId: this.pagination.SortBy,
                    StaffId: item.StaffId,
                    Amount: parseFloat(item.Amount).toFixed(2),
                    TDate: new Date(this.inputDate.Year, this.inputDate.Month - 1, this.inputDate.Date, 5, 45, 0, 0),
                    Rmrks: item.Rmrks
                };
                this.saveIncentive();
            });
        }
    }

}
