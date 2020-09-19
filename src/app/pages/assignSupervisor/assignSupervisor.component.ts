import { Component } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';
import { IUser, IEmployee, IReportTo, IMenuVsTemplate, ICheckBoxViewModel } from '../../models/Models';
import { UserService, EmployeeService, ReportToService, MenuVsTemplateService, SupervisorListService } from '../../services/BaseService';
import { IEmployeeVM } from '../../models/ViewModels';
import { IEmployeeSearchOption} from '../../shared/employeeSearch/employeeSearch.component';

@Component({
    selector: 'assignSupervisor',
    templateUrl: 'assignSupervisor.component.html',
})
export class AssignSupervisorComponent {
    userList: IUser[] = [];
    user: IUser[] = [];
    supervisor: IUser[] = [];
    //supervisorList: IUser[] = [];
    supervisorList: IEmployeeVM[] = [];
    selectedUserDetails: IUser;
    requiredDepartmentId: number;
    reportToObj: IReportTo = <IReportTo>{};
    employeeId: number;
    requiredUserId: string;
    menuVsTemplateList: IMenuVsTemplate[];
    Details: IReportTo = <IReportTo>{};
    userId: string = null;
    requiredEmployeeId: number = null;
    requiredSupervisorId: number = null;
    supervisorHierarchylist: IEmployee[] = [];
    checkedEmployee: ICheckBoxViewModel<IEmployee>[] = [];
    employeeDetails: IEmployeeVM[] = [];

    selectEmployeeOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true,
        showSupervisorList: false
    };
    selectSupervisorOptions: IEmployeeSearchOption = <IEmployeeSearchOption>{
        showOpenModalButton: true,
        showSupervisorList: true
    };

    constructor(
        public userService: UserService,
        public employeeService: EmployeeService,
        public reportToService: ReportToService,
        public menuVsTemplateService: MenuVsTemplateService,
        public supervisorListService: SupervisorListService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        //this.getUsers();
    }

    ngOnInit() {
    }

    public getUsers() {
        var query = "$expand=Employee";
        this.userService.getAll(query).subscribe((data: IUser[]) => {
            this.userList = data;
        })
    }

    /**
     * * Assign supervisor to user
     * @param userId
     * @param supervisorId
     */
    public assignSupervisor(userId: string, supervisorId: string) {
        
        this.reportToObj.EmployeeId = this.requiredEmployeeId;
        this.reportToObj.ReportTo1 = this.requiredSupervisorId;
        this.reportToObj.PostedBy = this.userId;
        this.reportToService.post(this.reportToObj).subscribe(() => {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "User has been successfully assigned",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap',
                onAdd: (toast: ToastData) => {
                },
                onRemove: function (toast: ToastData) {
                }
            };
            this.toastyService.success(toastOptions);
            this.reportToObj = <IReportTo>{};
        });
    }


    selectedEmployee($event: IEmployee) {
        if ($event != null) {
            this.requiredEmployeeId = $event.EmployeeId;
            this.selectSupervisorOptions = {
                filterEmployeeId: $event.EmployeeId,
                showOpenModalButton: this.selectSupervisorOptions.showOpenModalButton,
                selectedEmployeeId: this.selectSupervisorOptions.selectedEmployeeId,
                showSupervisorList: this.selectSupervisorOptions.showSupervisorList
            };
        } else {
            this.selectSupervisorOptions = {
                filterEmployeeId: null,
                showOpenModalButton: this.selectSupervisorOptions.showOpenModalButton,
                selectedEmployeeId: this.selectSupervisorOptions.selectedEmployeeId,
                showSupervisorList: this.selectSupervisorOptions.showSupervisorList
            };
        }
    }

    selectedSupervisor($event: IEmployee) {
        if ($event != null)
        {
            this.requiredSupervisorId = $event.EmployeeId;
        }

    }
    
}
