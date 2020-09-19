import { Component, Input } from "@angular/core";
import { IEmployeeGenericInfo } from "../../../models/Models";
import { EmployeeGenericInfoService, ParamValueService, UserService } from "../../../services/BaseService";
import { ToastyService, ToastOptions } from "ngx-toasty";
import { DatePickerService } from "../../datepicker/modules/datePickerService";

@Component({
    selector: 'employee-genericinfo',
    templateUrl: 'employeeGenericInfo.html'
})
export class EmployeeGenericInfoComponent {
    @Input() empId?: number;

    displayECList: IEmployeeGenericInfo[] = [];
    yearList: number[] = [];

    //form variable
    InputEGI: IEmployeeGenericInfo = <IEmployeeGenericInfo>{};
    formToggle: boolean = false;
    isUploading: boolean = false;
    isValidFile?: string;

    constructor(
        public userService: UserService,
        private toastyService: ToastyService,
        public ECService: EmployeeGenericInfoService,
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
            this.getEmployeeGenericInfos(this.empId);
            this.setInputEGI();
        }
    }

    setInputEGI() {
        this.InputEGI = {
            EmployeeId: this.empId,
            SpouseName: null,
            FatherName: null,
            MotherName: null,
            GrandFatherName: null,
            NoOfChildren: 0,
            PostedBy: localStorage.getItem('UserId'),
            PostedOn: new Date()
        }
    }

    getEmployeeGenericInfos(empId: number) {
        let query: string = `$select=EmployeeId,SpouseName,FatherName,MotherName,GrandFatherName,NoOfChildren,PostedBy,PostedOn`;
        this.displayECList = [];
        this.ECService.get(empId, query).subscribe((data: IEmployeeGenericInfo) => {
            if (data) {
                this.InputEGI = data;
            } else {
                this.setInputEGI();
            }
        });
    }

    addGenericInfo() {
        if (this.empId) {
            let saveItem: IEmployeeGenericInfo = {
                EmployeeId: this.empId,
                SpouseName: this.InputEGI.SpouseName,
                FatherName: this.InputEGI.FatherName,
                MotherName: this.InputEGI.MotherName,
                GrandFatherName: this.InputEGI.GrandFatherName,
                NoOfChildren: this.InputEGI.NoOfChildren,
                PostedBy: localStorage.getItem('UserId'),
                PostedOn: new Date()
            }
            this.isUploading = true;
            if (this.displayECList.length == 0) {
                this.ECService.post(saveItem).subscribe(() => {
                    this.setInputEGI();
                    this.showToasty();
                    this.isUploading = false;
                }, () => {
                    this.isUploading = false;
                })
            } else {
                this.ECService.put(saveItem.EmployeeId, saveItem).subscribe(() => {
                    this.setInputEGI();
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
            msg: "Employee GenericInfos has been successfully updated",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
        this.initialize();
    }


    formToggleFunc() {
        this.formToggle = !this.formToggle;
        if (this.formToggle == true) {
            this.initialize();
        }
    }

    isAccess: boolean = false;
    hasParamAccess() {
        this.pvService.get('EmpGI').subscribe(data => {
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