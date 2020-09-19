import { Component, OnInit, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/AuthService';
import { IUser } from '../../models/Models';
import { UserService, ParamValueService } from '../../services/BaseService';
import {
  trigger,
  state,
  style,
  transition,
  query,
  stagger,
  animate,
  keyframes,
  group,
  AUTO_STYLE
} from '@angular/animations';
import { loginPageListShowHide } from './login.animation';
@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css'],
  animations: [
    loginPageListShowHide
  ]
})
export class LoginComponent implements OnInit {
  User: IUser = {};
  ErrorMessage: string;
  loading: boolean;
  showList: boolean;
  containerBackgroundImg = 'url(../../../assets/hrms-login-bg_large-01.png)';
  loginBackgroundImg = 'url(../../../assets/login_container-bg.png)';

  constructor(
    public authService: AuthenticationService,
    public userService: UserService,
    public router: Router,
    public pvService: ParamValueService
  ) {
    this.hasParamAccess();
  }

  ngOnInit() {
    if (
      localStorage.getItem('UserId') &&
      localStorage.getItem('authorizationData')
    ) {
      this.router.navigateByUrl(`layout/loginReport`);
    }
  }

  public login(User: IUser) {
    this.authUser(User.UserName, User.PasswordHash);
  }

  authUser(username: string, password: string): void {
    var that = this;
    that.loading = true;
    that.authService
      .login({
        userName: username,
        password: password,
        useRefreshTokens: false
      })
      .subscribe(
        response => {
          that.ErrorMessage = null;
          var authData: any = JSON.parse(
            localStorage.getItem('authorizationData')
          );

          if (authData != null) {
            this.storeUserData(authData.userName);
          } else {
            that.loading = false;
            that.ErrorMessage = 'Sorry, login failed. Please try again later.';
          }
        },
        err => {
          that.loading = false;
          that.ErrorMessage = "Sorry, login failed. Please try again later.";
          if (err._body) {
            let str = JSON.parse(err._body);
            that.ErrorMessage = str.error_description;
          }
        }
      );
  }

  storeUserData(username: string) {
    var that = this;
    var query = "$select=Id,EmployeeId&$filter=UserName eq '" + username + "'";
    this.userService.getAll(query).subscribe(data => {
      if (data != null) {
        that.ErrorMessage = null;
        var usrId = data[0].Id;
        localStorage.setItem('UserId', usrId);

        var empId = data[0].EmployeeId.toString();
        localStorage.setItem('EmployeeId', empId);
        that.loading = false;
        that.router.navigateByUrl('layout');
        //this.location.go(`/layout`);
        //window.location.href = `${domain}#/layout`;
      } else {
        that.loading = false;
        //alert("Error while logging in.");
      }
    });
  }


  isAccess: boolean = false;
  hasParamAccess() {
    this.pvService.get('ELL').subscribe(data => {
      if (data.PValue == 'true') {
        this.isAccess = true;
      } else {
        this.isAccess = false;
      }
    })
  }
}
