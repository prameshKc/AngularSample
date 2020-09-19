import { Component, Injectable } from '@angular/core';
import { UserService, ChangePasswordService } from '../../services/BaseService';
import { IUser, IEmployee } from '../../models/Models';
import { IChangePasswordVM } from '../../models/ViewModels';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../../services/AuthService';


@Component({
    selector: 'change-password',
    templateUrl: './changePassword.component.html',
    styleUrls: ['./changePassword.component.css']
})
export class ChangePasswordComponent {
    InputUserDetail: IUser = <IUser>{};
    userDetail: IUser = <IUser>{};
    ChangePasswordDetails: IUser = <IUser>{};
    currentPassword: string;
    confirmPassword: string;
    EmployeeObj: IEmployee = <IEmployee>{};
    isCurrentPasswordCorrect: boolean = true;
    isConfirmPasswordCorrect: boolean = true;

    userId: string;
    constructor(
        public userService: UserService,
        public changePasswordService: ChangePasswordService,           
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig,
        private route: ActivatedRoute,
        private router: Router,
        public authService: AuthenticationService
    ) {
        this.userId = localStorage.getItem('UserId');
        this.getUser(this.userId);
    }

    public getUser(Id?: string) {
        var query = "$expand=Employee,MenuTemplate,Employee/LoginGroup/LoginShift";
        this.userService.get(Id, query).subscribe((data: IUser) => {
            this.InputUserDetail = data;
            this.InputUserDetail.PasswordHash = data.PasswordHash;
            this.ChangePasswordDetails.UserName = data.UserName; 
            this.EmployeeObj.EmployeeNo = data.Employee.EmployeeNo;
            this.EmployeeObj.FirstName = data.Employee.FirstName;
            this.EmployeeObj.MiddleName = data.Employee.MiddleName;
            this.EmployeeObj.LastName = data.Employee.LastName;          
        })
    }

    public submit() {
        let passwordDetails: IChangePasswordVM = {
            Id: this.InputUserDetail.Id,
            CurrentPassword: this.currentPassword,
            NewPassword: this.ChangePasswordDetails.PasswordHash
        }
        this.checkCurrentPassword(passwordDetails);
    }

    public changePassword(ChangePasswordDetails: IUser) {        
        let userObj: IUser = {
            Id: this.InputUserDetail.Id,
            EmployeeId: this.InputUserDetail.EmployeeId,
            UserName: this.InputUserDetail.UserName,           
            PasswordHash: ChangePasswordDetails.PasswordHash,
            MenuTemplateId: this.InputUserDetail.MenuTemplateId,
            IsUnlimited: this.InputUserDetail.IsUnlimited,
            FromDate: this.InputUserDetail.FromDate,
            ToDate: this.InputUserDetail.ToDate,
            IsActive: this.InputUserDetail.IsActive,
            PostedBy: this.InputUserDetail.PostedBy,
            PostedOn: this.InputUserDetail.PostedOn,
            ModifiedBy: this.userId,
            ModifiedOn: new Date()
        }; 

        if (this.isCurrentPasswordCorrect == true && this.isConfirmPasswordCorrect == true) {
            this.userService.put("rp", userObj).subscribe(() => {
                var toastOptions: ToastOptions = {
                    title: "Success",
                    msg: "Password has been changed successfully",
                    showClose: true,
                    timeout: 5000,
                    theme: 'bootstrap',
                    onAdd: (toast: ToastData) => {
                    },
                    onRemove: function (toast: ToastData) {
                    }
                };
                this.toastyService.success(toastOptions);
                this.ChangePasswordDetails = <IUser>{};
                this.currentPassword = '';
                this.confirmPassword = '';
                this.authService.logout();
                this.router.navigateByUrl('login');            
            })
        }
        
    }

    public checkCurrentPassword(pwdObj: IChangePasswordVM) {
        this.changePasswordService.CheckCurrentPassword(pwdObj.Id, pwdObj.CurrentPassword)
            .subscribe((one: boolean) => {
                this.isCurrentPasswordCorrect = one;
                this.changePassword(this.ChangePasswordDetails);
            })
    }

    public checkConfirmPassword(event:any) {
        if (event == this.ChangePasswordDetails.PasswordHash) {
            this.isConfirmPasswordCorrect = true;
        }
        else {
            this.isConfirmPasswordCorrect = false;
        }
    }

    public cancelChangePassword() {
        this.ChangePasswordDetails = <IUser>{};
        this.currentPassword = '';
        this.confirmPassword = ''; 
        this.router.navigateByUrl('layout');
    }

}