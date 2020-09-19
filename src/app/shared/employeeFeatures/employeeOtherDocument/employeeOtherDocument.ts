import { Component, Input, ViewChild } from "@angular/core";
import { IEmployeeOtherDocument } from "../../../models/Models";
import { EmployeeOtherDocumentService, ParamValueService, FetchFileService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IInputDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";
import { DomSanitizer } from "@angular/platform-browser";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'employee-other-document',
    templateUrl: 'employeeOtherDocument.html'
})
export class EmployeeOtherDocumentComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeOtherDocument[]> = new EventEmitter<IEmployeeOtherDocument[]>();

    displayECList: IEmployeeOtherDocument[] = [];
    yearList: number[] = [];

    //form variable
    InputEOD: IEmployeeOtherDocument = <IEmployeeOtherDocument>{};
    tempIconPath: any;
    ODCert: any;
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
        private toastyService: ToastyService,
        public ECService: EmployeeOtherDocumentService,
        public userService: UserService, 
        public dateFunction: DatePickerService,
        public sanitizer: DomSanitizer,
        public pvService: ParamValueService,
        public fetchFileService: FetchFileService
    ) {
        this.hasParamAccess();
    }

    ngOnInit() {
        this.initialize();
    }

    initialize() {
        if (this.empId != null) {
            this.getEmployeeOtherDocuments(this.empId);
            this.hasPermToEdit();
            this.setInputEOD();
            this.startDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
            this.endDTVM = { Year: new Date().getFullYear(), Month: new Date().getMonth() + 1, Date: new Date().getDate() };
        }
    }

    setInputEOD() {
        this.InputEOD = {
            Id: 0,
            EmployeeId: this.empId,
            Description: null,
            OtherDoc: null
        }
        this.ODCert = null;
    }

    getEmployeeOtherDocuments(empId: number) {
        let query: string = `$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];
        this.ECService.getAll(query).subscribe((data: IEmployeeOtherDocument[]) => {
            this.displayECList = data;
        });
    }


    addOtherDocument() {
        if (this.empId) {
            let saveItem: IEmployeeOtherDocument = {
                Id: this.InputEOD.Id,
                EmployeeId: this.empId,
                Description: this.InputEOD.Description,
                OtherDoc: this.InputEOD.OtherDoc
            }
            this.isUploading = true;
            if (saveItem.Id == 0) {
                this.ECService.post(saveItem).subscribe(() => {
                    this.setInputEOD();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.Id, saveItem).subscribe(() => {
                    this.setInputEOD();
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
                        that.InputEOD.OtherDoc = base64textString;
                    };
                    reader.readAsBinaryString(file);
                }
            }
        }
    }

    showToasty() {
        var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Employee OtherDocuments has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editOtherDocument(empCert: IEmployeeOtherDocument) {
        this.InputEOD = Object.assign({}, empCert);
        var that = this;
        this.fetchFileService.getPdfFile(empCert.OtherDoc).subscribe(data => {
            this.isValidFile = null;
            var reader = new FileReader();
            reader.onload = function () {
                var base64textString = btoa(JSON.stringify(this.result));
                that.InputEOD.OtherDoc = base64textString;
            };
            reader.readAsBinaryString(data);
        })
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
        this.pvService.get('EmpOD').subscribe(data => {
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
