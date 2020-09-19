import { Component, Input, ViewChild } from "@angular/core";
import { IEmployeeSWMC, IInfoSWMC } from "../../../models/Models";
import { EmployeeSWMCService, InfoSWMCService, ParamValueService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'employee-swmc',
    templateUrl: 'employeeSWMC.html'
})
export class EmployeeSWMCComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeSWMC[]> = new EventEmitter<IEmployeeSWMC[]>();

    displayECList: IEmployeeSWMC[] = [];
    infoSWMCList: IInfoSWMC[] = [];
    yearList: number[] = [];

    //form variable
    InputESWMC: IEmployeeSWMC = <IEmployeeSWMC>{};
    tempIconPath: any;
    formToggle: boolean = false;
    isUploading: boolean = false;
    isValidFile?: string;

    //datepicker variable
    FromDateVM: IInputDateVM;
    ToDateVM: IInputDateVM;
    dateOptions: IDatePickerOptionsVM = {
        closeOnDateSelect: true,
        maxDate: null,
        minDate: null
    };

    constructor(
        public userService: UserService,
        private toastyService: ToastyService,
        public ECService: EmployeeSWMCService,
        public infoSWMCService: InfoSWMCService,
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
            this.getInfoSWMC();
            this.setInputESWMC();
            this.FromDateVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
            this.ToDateVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
        }
    }

    setInputESWMC() {
        this.InputESWMC = {
            RowId: 0,
            EmployeeId: this.empId,
            SWMCId: -1,
            Venue: null,
            FromDate: new Date(),
            ToDate: new Date(),
            SponsoredBy: null,
            PostedBy: localStorage.getItem('UserId'),
            PostedOn: new Date()
        }
    }

    getInfoSWMC() {
        this.infoSWMCList = [];
        this.infoSWMCService.getAll().subscribe((data: IInfoSWMC[]) => {
            this.infoSWMCList = data;
            this.getEmployeeSWMCs(this.empId);
        })
    }

    getSWMC(id: number) {
        return this.infoSWMCList.filter(x => x.SWMCId == id)[0].Description;
    }

    getEmployeeSWMCs(empId: number) {
        let query: string = `$select=RowId,EmployeeId,SWMCId,Venue,FromDate,ToDate,SponsoredBy,PostedBy,PostedOn&$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];
        this.ECService.getAll(query).subscribe((data: IEmployeeSWMC[]) => {
            this.displayECList = data;
        });
    }

    addSWMC() {
        if (this.empId) {
            let saveItem: IEmployeeSWMC = {
                RowId: this.InputESWMC.RowId,
                EmployeeId: this.empId,
                SWMCId: this.InputESWMC.SWMCId,
                Venue: this.InputESWMC.Venue,
                FromDate: this.InputESWMC.FromDate,
                ToDate: this.InputESWMC.ToDate,
                SponsoredBy: this.InputESWMC.SponsoredBy,
                PostedBy: localStorage.getItem('UserId'),
                PostedOn: new Date()
            }
            this.isUploading = true;
            if (saveItem.RowId == 0) {
                this.ECService.post(saveItem).subscribe(() => {
                    this.setInputESWMC();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.RowId, saveItem).subscribe(() => {
                    this.setInputESWMC();
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
            msg: "Employee SWMCs has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editSWMC(empCert: IEmployeeSWMC) {
        this.InputESWMC = Object.assign({}, empCert);

        this.FromDateVM = { Year: new Date(empCert.FromDate).getFullYear(), Month: new Date(empCert.FromDate).getMonth() + 1, Date: new Date(empCert.FromDate).getDate() };
        this.ToDateVM = { Year: new Date(empCert.ToDate).getFullYear(), Month: new Date(empCert.ToDate).getMonth() + 1, Date: new Date(empCert.ToDate).getDate() };
    }

    dateSelect(inputDate: IInputDateVM, flag: string) {
        this.InputESWMC[flag] = new Date(inputDate.Year, inputDate.Month - 1, inputDate.Date, 5, 45, 0);
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
        this.pvService.get('EmpSWMC').subscribe(data => {
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
