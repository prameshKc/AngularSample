import { Component, Injectable } from '@angular/core';
import { CommonService } from '../../services/BaseService';
import { IBirthdayNotification } from '../../models/Models';

@Component({
    selector: 'birthdayNotification',
    templateUrl: 'birthdayNotification.component.html'
})
export class BirthdayNotificationComponent {
    birthdayNotificationList: IBirthdayNotification[] = [];
    userId: string;
    currentDay: number = new Date().getDate();
    dateType: number;

    constructor(
        public commonService: CommonService,
    ) {
        this.userId = localStorage.getItem('UserId');
        this.dateType = parseInt(localStorage.getItem('Param.DateType'));
        this.getAllBirthdayNotification();
    }

    //getAll
    public getAllBirthdayNotification() {
        this.commonService.GetBirthdayNotification().subscribe((list: IBirthdayNotification[]) => {
            list.forEach(item => {
                let tDate = new Date(item.TodaysDate);
                item.CurrentBirthdayDate = new Date(tDate.getFullYear(), tDate.getMonth(), item.Birthday);
            });
            this.birthdayNotificationList = list.filter(x => x.Birthday >= this.currentDay);
        });
    }
}