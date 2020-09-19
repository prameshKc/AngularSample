import { Component, Input, ViewChild } from "@angular/core";
import { IEmployeeEducation, IInfoEducationDivision, IInfoEducationLevel } from "../../../models/Models";
import { EmployeeEducationService, InfoEducationDivisionService, InfoEducationLevelService, ParamValueService, FetchFileService, UserService } from "../../../services/BaseService";
import { IDatePickerOptionsVM, IDateVM } from "../../datepicker/models/datepickerVM";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: 'employee-education',
    templateUrl: 'employeeEducation.html'
})
export class EmployeeEducationComponent {
    @Input() empId?: number;
    //@Output() employeeNomineeList: EventEmitter<IEmployeeEducation[]> = new EventEmitter<IEmployeeEducation[]>();
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;

    //global variables
    displayECList: IEmployeeEducation[] = [];
    infoEduDivList: IInfoEducationDivision[] = [];
    infoEduLvlList: IInfoEducationLevel[] = [];
    yearList: number[] = [];

    //form variable
    InputEEdu: IEmployeeEducation = <IEmployeeEducation>{};
    tempIconPath: any;
    eduCert: any;
    formToggle: boolean = false;
    isUploading: boolean = false;
    isValidFile?: string;

    //datepicker variable
    dateOptions: IDatePickerOptionsVM = {
        closeOnDateSelect: true,
        maxDate: null,
        minDate: null
    };

    constructor(
        public userService: UserService,
        private toastyService: ToastyService,
        public ECService: EmployeeEducationService,
        public infoEduDivService: InfoEducationDivisionService,
        public infoEduLvlService: InfoEducationLevelService,
        public dateFunction: DatePickerService,
        public pvService: ParamValueService,
        public fetchFileService: FetchFileService
    ) {
        this.getInfoEducationLevel();
        this.getInfoEducationDivision();
        this.getYearList();
        this.hasParamAccess();
    }

    ngOnInit() {
        this.hasParamAccess();
        this.hasPermToEdit();
        this.initialize();
    }


    initialize() {
        if (this.empId != null) {
            this.getEmployeeEducations(this.empId);
            this.setInputEEdu();
        }
    }

    setInputEEdu() {
        this.InputEEdu = {
            Id: 0,
            EmployeeId: this.empId,
            DivisionId: -1,
            LevelId: -1,
            Board: null,
            Certificate: null,
            PassedYr: -1,
            PostedBy: localStorage.getItem('UserId'),
            PostedOn: new Date()
        }
        this.eduCert = null;
    }

    getYearList() {
        let currentDate: IDateVM = this.dateFunction.GetDate(1, new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
        let currentYear: number = this.dateFunction.GetBSYear(currentDate.DateBS);

        for (let i = 0; i <= 60; i++) {
            this.yearList.push(currentYear - i);
        }
    }

    getInfoEducationLevel() {
        this.infoEduLvlService.getAll().subscribe(data => {
            this.infoEduLvlList = data;
        });
    }

    getInfoEducationDivision() {
        this.infoEduDivService.getAll().subscribe(data => {
            this.infoEduDivList = data;
        });
    }

    getEmployeeEducations(empId: number) {
        let query: string = `$filter=EmployeeId eq ${empId}`;
        this.displayECList = [];

        this.ECService.getAll(query).subscribe((data: IEmployeeEducation[]) => {
            this.displayECList = data;
        });
    }

    getEducationLevel(lvlId: number) {
        return this.infoEduLvlList.filter(x => x.Id == lvlId)[0].EducationLevelName;
    }

    getEducationDivision(lvlId: number) {
        return this.infoEduDivList.filter(x => x.Id == lvlId)[0].EducationDivisionName;
    }

    addEducation() {
        if (this.empId) {
            let saveItem: IEmployeeEducation = {
                Id: this.InputEEdu.Id,
                EmployeeId: this.empId,
                DivisionId: this.InputEEdu.DivisionId,
                LevelId: this.InputEEdu.LevelId,
                Board: this.InputEEdu.Board,
                Certificate: this.InputEEdu.Certificate,
                PassedYr: this.InputEEdu.PassedYr,
                PostedBy: localStorage.getItem('UserId'),
                PostedOn: new Date()
            }
            this.isUploading = true;
            if (saveItem.Id == 0) {
                this.ECService.post(saveItem).subscribe(() => {
                    this.setInputEEdu();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.Id, saveItem).subscribe(() => {
                    this.setInputEEdu();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            }
        }
    }

    onFileChange(evt: any) {
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
                        that.InputEEdu.Certificate = base64textString;
                    };
                    reader.readAsBinaryString(file);
                }
            }
        }
    }

    showToasty() {
        var toastOptions: ToastOptions = {
            title: "Success",
            msg: "Employee Educations has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }

    editEducation(empCert: IEmployeeEducation) {
        this.InputEEdu = Object.assign({}, empCert);
        var that = this;
        this.fetchFileService.getPdfFile(empCert.Certificate).subscribe(data => {
            this.isValidFile = null;
            var reader = new FileReader();
            reader.onload = function () {
                var base64textString = btoa(JSON.stringify(this.result));
                that.InputEEdu.Certificate = base64textString;
            };
            reader.readAsBinaryString(data);
        })
    }

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
        this.pvService.get('EmpEdu').subscribe(data => {
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
