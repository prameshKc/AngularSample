import { Component, Input, ViewChild } from "@angular/core";
import { IEmployeeExperience } from "../../../models/Models";
import { EmployeeExperienceService, ParamValueService, FetchFileService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";
import { DomSanitizer } from "@angular/platform-browser";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'employee-experience',
    templateUrl: 'employeeExperience.html'
})
export class EmployeeExperienceComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeExperience[]> = new EventEmitter<IEmployeeExperience[]>();

    displayECList: IEmployeeExperience[] = [];
    yearList: number[] = [];

    //form variable
    InputEExp: IEmployeeExperience = <IEmployeeExperience>{};
    tempIconPath: any;
    ExpCert: any;
    formToggle: boolean = false;
    isUploading: boolean = false;
    isValidFile?: string;

    //datepicker variable
    startDTVM: IInputDateVM;
    endDTVM: IInputDateVM;
    dateOptions: IDatePickerOptionsVM = {
        closeOnDateSelect: true,
        maxDate: null,
        minDate: null
    };

    constructor(
        public userService: UserService,
        private toastyService: ToastyService,
        public ECService: EmployeeExperienceService,
        public dateFunction: DatePickerService,
        public sanitizer: DomSanitizer,
        public pvService: ParamValueService,
        public fetchFileService: FetchFileService
    ) {
    }

    ngOnInit() {
        this.hasParamAccess();
        this.hasPermToEdit();
        this.initialize();
    }

    initialize() {
        if (this.empId != null) {
            this.getEmployeeExperiences(this.empId);
            this.setInputEExp();
            this.startDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
            this.endDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
        }
    }

    setInputEExp() {
        this.InputEExp = {
            Id: 0,
            EmployeeId: this.empId,
            OrganizationName: null,
            PPost: null,
            StartDT: new Date(),
            EndDT: new Date(),
            TypeOfWork: null,
            ExpDoc: null,
            PostedBy: localStorage.getItem('UserId'),
            PostedOn: new Date()
        }
        this.ExpCert = null;
    }

    getEmployeeExperiences(empId: number) {
        let query: string = `$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];
        this.ECService.getAll(query).subscribe((data: IEmployeeExperience[]) => {
            this.displayECList = data;
        });
    }


    addExperience() {
        if (this.empId) {
            let saveItem: IEmployeeExperience = {
                Id: this.InputEExp.Id,
                EmployeeId: this.empId,
                OrganizationName: this.InputEExp.OrganizationName,
                PPost: this.InputEExp.PPost,
                StartDT: this.InputEExp.StartDT,
                EndDT: this.InputEExp.EndDT,
                TypeOfWork: this.InputEExp.TypeOfWork,
                ExpDoc: this.InputEExp.ExpDoc,
                PostedBy: localStorage.getItem('UserId'),
                PostedOn: new Date()
            }
            this.isUploading = true;
            if (saveItem.Id == 0) {
                this.ECService.post(saveItem).subscribe(() => {
                    this.setInputEExp();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.Id, saveItem).subscribe(() => {
                    this.setInputEExp();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            }
        }
    }

    onFileChange(evt: any) {
        var obj: any = evt.currentTarget;
        this.tempIconPath = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(obj.files[0]));

        var files = evt.target.files;
        var file = files[0];
        var that = this;
        if (files && file) {
            if (file.type != 'application/pdf') {
                this.isValidFile = 'Only pdf files are accepted.';
            } else {
                var size = file.size * (4 / 3);
                if (size >= 4500000) {
                    this.isValidFile = 'Maximum file size exceeded.';
                } else {
                    this.isValidFile = null;
                    var reader = new FileReader();
                    reader.onload = function () {
                        var base64textString = btoa(JSON.stringify(this.result));
                        that.InputEExp.ExpDoc = base64textString;
                    };
                    reader.readAsBinaryString(file);
                }
            }
        }
    }

    showToasty() {
        var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Employee Experiences has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editExperience(empCert: IEmployeeExperience) {
        this.InputEExp = Object.assign({}, empCert);
        var that = this;
        this.fetchFileService.getPdfFile(empCert.ExpDoc).subscribe(data => {
            this.isValidFile = null;
            var reader = new FileReader();
            reader.onload = function () {
                var base64textString = btoa(JSON.stringify(this.result));
                that.InputEExp.ExpDoc = base64textString;
            };
            reader.readAsBinaryString(data);
        })

        this.startDTVM = { Year: new Date(empCert.StartDT).getFullYear(), Month: new Date(empCert.StartDT).getMonth() + 1, Date: new Date(empCert.StartDT).getDate() };
        this.endDTVM = { Year: new Date(empCert.EndDT).getFullYear(), Month: new Date(empCert.EndDT).getMonth() + 1, Date: new Date(empCert.EndDT).getDate() };

    }

    dateSelect(inputDate: IInputDateVM, flag: string) {
        this.InputEExp[flag] = new Date(inputDate.Year, inputDate.Month - 1, inputDate.Date, 5, 45, 0);
        if (flag == 'StartDT') {
            this.startDTVM = inputDate;
        } else {
            this.endDTVM = inputDate;
        }
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
        this.pvService.get('EmpExp').subscribe(data => {
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
