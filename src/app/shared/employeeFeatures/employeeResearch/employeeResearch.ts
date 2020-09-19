import { Component, Input, ViewChild } from "@angular/core";
import { IEmployeeResearch } from "../../../models/Models";
import { EmployeeResearchService, ParamValueService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM, IDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'employee-research',
    templateUrl: 'employeeResearch.html'
})
export class EmployeeResearchComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeResearch[]> = new EventEmitter<IEmployeeResearch[]>();

    displayECList: IEmployeeResearch[] = [];
    yearList: number[] = [];

    //form variable
    InputERes: IEmployeeResearch = <IEmployeeResearch>{};
    tempIconPath: any;
    ResCert: any;
    formToggle: boolean = false;
    isUploading: boolean = false;
    isValidFile?: string;

    //datepicker variable
    StartDTVM: IInputDateVM;
    EndDTVM: IInputDateVM;
    dateOptions: IDatePickerOptionsVM = {
        closeOnDateSelect: true,
        maxDate: null,
        minDate: null
    };

    constructor(
        public userService: UserService,
        private toastyService: ToastyService,
        public ECService: EmployeeResearchService,
        public dateFunction: DatePickerService,
        public pvService: ParamValueService
    ) {
    }

    ngOnInit() {
        this.hasParamAccess();
        this.hasPermToEdit();
        this.initialize();
    }

    getYearList() {
        let currentDate: IDateVM = this.dateFunction.GetDate(1, new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
        let currentYear: number = this.dateFunction.GetBSYear(currentDate.DateBS);

        for (let i = 0; i <= 60; i++) {
            this.yearList.push(currentYear - i);
        }
    }

    initialize() {
        if (this.empId != null) {
            this.getYearList();
            this.getEmployeeResearchs(this.empId);
            this.setInputERes();
            this.StartDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
            this.EndDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
        }
    }

    setInputERes() {
        this.InputERes = {
            RowId: 0,
            EmployeeId: this.empId,
            Title_Subject: null,
            Major_Findings: null,
            Year: -1,
            PostedBy: localStorage.getItem('UserId'),
            PostedOn: new Date()
        }
        this.ResCert = null;
    }

    getEmployeeResearchs(empId: number) {
        let query: string = `$select=RowId,EmployeeId,Title_Subject,Major_Findings,Year,PostedBy,PostedOn&$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];
        this.ECService.getAll(query).subscribe((data: IEmployeeResearch[]) => {
            this.displayECList = data;
        });
    }

    addResearch() {
        if (this.empId) {
            let saveItem: IEmployeeResearch = {
                RowId: this.InputERes.RowId,
                EmployeeId: this.empId,
                Title_Subject: this.InputERes.Title_Subject,
                Major_Findings: this.InputERes.Major_Findings,
                Year: this.InputERes.Year,
                PostedBy: localStorage.getItem('UserId'),
                PostedOn: new Date()
            }
            this.isUploading = true;
            if (saveItem.RowId == 0) {
                this.ECService.post(saveItem).subscribe(() => {
                    this.setInputERes();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.RowId, saveItem).subscribe(() => {
                    this.setInputERes();
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
            msg: "Employee Researchs has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editResearch(empCert: IEmployeeResearch) {
        this.InputERes = Object.assign({},empCert);
    }

    dateSelect(inputDate: IInputDateVM, flag: string) {
        this.InputERes[flag] = new Date(inputDate.Year, inputDate.Month - 1, inputDate.Date, 5, 45, 0);
        this[`${flag}VM`] = inputDate;
    }

  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
    deleteId: number;
    deleteModalLoaded: boolean
    /**
     * to open delete modal
     */
    public openDeleteModal(Id: number) {
        this.deleteId = Id;
        this.deleteModalLoaded = true;
        this.deleteModal.show();
    }
    /**
     * to hide delete modal
     */
    public hideDeleteChildModal(): void {
        this.deleteModal.hide();
    }
    delete() {
        this.ECService.delete(this.deleteId).subscribe(() => {
            this.showToasty();
            this.deleteId = null;
            this.deleteModal.hide();
        })
    }

    formToggleFunc() {
        this.formToggle = !this.formToggle;
        if (this.formToggle == true) {
            this.initialize();
        }
    }

    isAccess: boolean = false;
    hasParamAccess() {
        this.pvService.get('EmpRes').subscribe(data => {
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
