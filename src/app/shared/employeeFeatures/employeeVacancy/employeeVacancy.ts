import { Component, Input } from "@angular/core";
import { IEmployeeVacancy } from "../../../models/Models";
import { EmployeeVacancyService, ParamValueService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";

@Component({
    selector: 'employee-vacancy',
    templateUrl: 'employeeVacancy.html'
})
export class EmployeeVacancyComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeVacancy[]> = new EventEmitter<IEmployeeVacancy[]>();

    displayECList: IEmployeeVacancy[] = [];
    yearList: number[] = [];

    //form variable
    InputEVac: IEmployeeVacancy = <IEmployeeVacancy>{};
    tempIconPath: any;
    formToggle: boolean = false;
    isUploading: boolean = false;
    isValidFile?: string;

    //datepicker variable
    VacancyDateVM: IInputDateVM;
    SelectionDateVM: IInputDateVM;
    dateOptions: IDatePickerOptionsVM = {
        closeOnDateSelect: true,
        maxDate: null,
        minDate: null
    };

    constructor(
        public userService: UserService,
        private toastyService: ToastyService,
        public ECService: EmployeeVacancyService,
        public dateFunction: DatePickerService,
        public pvService: ParamValueService
    ) {
    }

    ngOnInit() {
        this.hasParamAccess();
        this.hasPermToEdit();
        this.initialize();
    }

    initialize() {
        if (this.empId != null) {
            this.getEmployeeVacancys(this.empId);
            this.setInputEVac();
            this.VacancyDateVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
            this.SelectionDateVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
        }
    }

    setInputEVac() {
        this.InputEVac = {
            EmployeeId: this.empId,
            VacancyNo: null,
            VacancyAppNo: null,
            VacancyDate: new Date(),
            SelectionDate: new Date(),
            PostedBy: localStorage.getItem('UserId'),
            PostedOn: new Date()
        }
    }

    getEmployeeVacancys(empId: number) {
        let query: string = `$select=EmployeeId,VacancyNo,VacancyAppNo,VacancyDate,SelectionDate,PostedBy,PostedOn&$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];
        this.ECService.getAll(query).subscribe((data: IEmployeeVacancy[]) => {
            this.displayECList = data;
            if (data.length > 0) {
                this.InputEVac = data[0];
                data[0].VacancyDate = new Date(data[0].VacancyDate);
                data[0].SelectionDate = new Date(data[0].SelectionDate);
                this.VacancyDateVM = { Year: data[0].VacancyDate.getFullYear(), Month: data[0].VacancyDate.getMonth() + 1, Date: data[0].VacancyDate.getDate() };
                this.SelectionDateVM = { Year: data[0].SelectionDate.getFullYear(), Month: data[0].SelectionDate.getMonth() + 1, Date: data[0].SelectionDate.getDate() };
            }
        });
    }

    addVacancy() {
        if (this.empId) {
            let saveItem: IEmployeeVacancy = {
                EmployeeId: this.empId,
                VacancyNo: this.InputEVac.VacancyNo,
                VacancyAppNo: this.InputEVac.VacancyAppNo,
                VacancyDate: this.InputEVac.VacancyDate,
                SelectionDate: this.InputEVac.SelectionDate,
                PostedBy: localStorage.getItem('UserId'),
                PostedOn: new Date()
            }
            this.isUploading = true;
            if (this.displayECList.length == 0) {
                this.ECService.post(saveItem).subscribe(() => {
                    this.setInputEVac();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.EmployeeId, saveItem).subscribe(() => {
                    this.setInputEVac();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            }
        }
    }

    showToasty() {
        var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Employee Vacancys has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editVacancy(empCert: IEmployeeVacancy) {
        this.InputEVac = Object.assign({}, empCert);
    }

    dateSelect(inputDate: IInputDateVM, flag: string) {
        this.InputEVac[flag] = new Date(inputDate.Year, inputDate.Month - 1, inputDate.Date, 5, 45, 0);
        this[`${flag}VM`] = inputDate;
    }

    formToggleFunc() {
        this.formToggle = !this.formToggle;
        if (this.formToggle == true) {
            this.initialize();
        }
    }

    isAccess: boolean = false;
    hasParamAccess() {
        this.pvService.get('EmpVac').subscribe(data => {
            if (data.PValue == 'true') {
                this.isAccess = true;
            } else {
                this.isAccess = false;
            }
        })
    }

    isEditAccess: boolean = false;
    editAccessParam: string = '#/layout/AFEA';
    hasPermToEdit() {
        let userId: string = localStorage.getItem('UserId');
        let query: string = `$select=MenuTemplate/MenuVsTemplate/Menu/*&$expand=MenuTemplate/MenuVsTemplate/Menu`;
        this.isEditAccess = false;
        this.userService.get(userId, query).subscribe(data => {
            if (data != null) {
                if (data.MenuTemplate.MenuVsTemplate.length > 0) {
                    if (data.MenuTemplate.MenuVsTemplate.filter(x => x.Menu.Url == this.editAccessParam).length > 0) {
                        this.isEditAccess = true;
                    }
                }
            }
        })
    }
}