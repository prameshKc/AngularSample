import { Component, Injectable, ViewChild } from '@angular/core';
import {
  ILoginGroup, ILoginShift, IPagination,
  ILoginGroupChild, IParam
} from '../../models/Models';
import {
  LoginGroup, LoginShiftService, LoginGroupChildService, ParamService
} from '../../services/BaseService';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { IFilterViewModel } from '../../models/ViewModels';

@Component({
  templateUrl: 'loginGroup.component.html'
})
export class LoginGroupComponent {
  InputLoginGroup: ILoginGroup = <ILoginGroup>{};
  isAddEditToggle: boolean = false;
  isAddLoginGroup: boolean = false;
  isEditLoginGroup: boolean = false;

  
  toggleDOHFrom: boolean;
  toggleDOHTo: boolean;
  toggleHHFrom: boolean;
  toggleHHTo: boolean;
  toggleOHFrom: boolean;
  toggleOHTo: boolean;
  toggleCHHFrom: boolean;
  toggleCHHTo: boolean;

  loginGroupList: ILoginGroup[] = [];
  loginShiftList: ILoginShift[];
  selectedDays: string[] = [];
  dayList: any[] = [
    { dayId: 1, day: "Sun", isSelected: false, isDisabled: false },
    { dayId: 2, day: "Mon", isSelected: false, isDisabled: false },
    { dayId: 3, day: "Tue", isSelected: false, isDisabled: false },
    { dayId: 4, day: "Wed", isSelected: false, isDisabled: false },
    { dayId: 5, day: "Thu", isSelected: false, isDisabled: false },
    { dayId: 6, day: "Fri", isSelected: false, isDisabled: false },
    { dayId: 7, day: "Sat", isSelected: false, isDisabled: false }
  ];
  halfHolidayList: any[] = [
    { dayId: 1, day: "Sun", isSelected: false, isDisabled: false },
    { dayId: 2, day: "Mon", isSelected: false, isDisabled: false },
    { dayId: 3, day: "Tue", isSelected: false, isDisabled: false },
    { dayId: 4, day: "Wed", isSelected: false, isDisabled: false },
    { dayId: 5, day: "Thu", isSelected: false, isDisabled: false },
    { dayId: 6, day: "Fri", isSelected: false, isDisabled: false },
    { dayId: 7, day: "Sat", isSelected: false, isDisabled: false }
  ];
  englishMonthList: any[] = [
    { id: 1, name: "January" },
    { id: 2, name: "February" },
    { id: 3, name: "March" },
    { id: 4, name: "April" },
    { id: 5, name: "May" },
    { id: 6, name: "June" },
    { id: 7, name: "July" },
    { id: 8, name: "August" },
    { id: 9, name: "September" },
    { id: 10, name: "October" },
    { id: 11, name: "November" },
    { id: 12, name: "December" }
  ];
  nepaliMonthList: any[] = [
    { id: 1, name: "Baishakh" },
    { id: 2, name: "Jestha" },
    { id: 3, name: "Asadh" },
    { id: 4, name: "Shrawan" },
    { id: 5, name: "Bhadra" },
    { id: 6, name: "Ashwin" },
    { id: 7, name: "Kartik" },
    { id: 8, name: "Mangsir" },
    { id: 9, name: "Poush" },
    { id: 10, name: "Magh" },
    { id: 11, name: "Falgun" },
    { id: 12, name: "Chaitra" }
  ];
  MonthList: any[] = [];
  dateList: any[] = [
    { id: 1, name: 1 },
    { id: 2, name: 2 },
    { id: 3, name: 3 },
    { id: 4, name: 4 },
    { id: 5, name: 5 },
    { id: 6, name: 6 },
    { id: 7, name: 7 },
    { id: 8, name: 8 },
    { id: 9, name: 9 },
    { id: 10, name: 10 },
    { id: 11, name: 11 },
    { id: 12, name: 12 },
    { id: 13, name: 13 },
    { id: 14, name: 14 },
    { id: 15, name: 15 },
    { id: 16, name: 16 },
    { id: 17, name: 17 },
    { id: 18, name: 18 },
    { id: 19, name: 19 },
    { id: 20, name: 20 },
    { id: 21, name: 21 },
    { id: 22, name: 22 },
    { id: 23, name: 23 },
    { id: 24, name: 24 },
    { id: 25, name: 25 },
    { id: 26, name: 26 },
    { id: 27, name: 27 },
    { id: 28, name: 28 },
    { id: 29, name: 29 },
    { id: 30, name: 30 },
    { id: 31, name: 31 },
    { id: 32, name: 32 }

  ];

  LoginGroupDetails: ILoginGroup = <ILoginGroup>{};
  LoginChildList: ILoginGroupChild[] = [];
  InputLoginGroupChild: ILoginGroupChild = <ILoginGroupChild>{};
  loginGroupChildList: ILoginGroupChild[] = [];
  loginGroupChild: ILoginGroupChild = <ILoginGroupChild>{};

  defaultOfficeHourFrom: any;
  defaultOfficeHourTill: any;
  halfHolidayOfficeHourFrom: any;
  halfHolidayOfficeHourTill: any;

  officeHourFrom: any;
  officeHourTill: any;
  halfHolidayOfficeHourFromLGC: any;
  halfHolidayOfficeHourTillLGC: any;
  InputParam: IParam;
  effectiveMonthGreater: boolean = false;
  toggleAddChild: boolean = false;
  toggleEditChild: boolean = false;
  showLoginChildList: boolean = false;

  //searching and sorting
  filterObj?: IFilterViewModel;

  //for pagination
  pagination?: IPagination = <IPagination>{
    CurrentPage: 1,
    ItemsPerPage: 50,
    TotalItems: 0,
    SortBy: null
  };

  //for loginGroup modal
  @ViewChild('loginGroupModal', { static: false }) public loginGroupModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selectedModalLoaded: boolean = false;

  //for loginGroupChildDetails modal
  @ViewChild('loginGroupChildDetails', { static: false }) public loginGroupChildDetails: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirectiveChildDetails: any;
  selectedChildDetailsModalLoaded: boolean = false;
  detailId: number;

  //for delete modal
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirectiveDelete: any;
  deleteModalLoaded: boolean = false;
  deleteId: number;
  userId: string;
  toggleSort: boolean = false;

  constructor(
    public loginGroupService: LoginGroup,
    public loginShiftService: LoginShiftService,
    public loginGroupChildService: LoginGroupChildService,
    public paramService: ParamService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,

  ) {
    this.userId = localStorage.getItem('UserId');
    this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
    this.filterLoginGroup();
    this.getAllLoginShift();
    this.getAllLoginGroupChild();
    this.checkUserParameterForMonth(12);
  }

  resetDayList() {
    this.dayList = [
      { dayId: 1, day: "Sun", isSelected: false, isDisabled: false },
      { dayId: 2, day: "Mon", isSelected: false, isDisabled: false },
      { dayId: 3, day: "Tue", isSelected: false, isDisabled: false },
      { dayId: 4, day: "Wed", isSelected: false, isDisabled: false },
      { dayId: 5, day: "Thu", isSelected: false, isDisabled: false },
      { dayId: 6, day: "Fri", isSelected: false, isDisabled: false },
      { dayId: 7, day: "Sat", isSelected: false, isDisabled: false }
    ];
  }

  resetHalfHolidayList() {
    this.halfHolidayList = [
      { dayId: 1, day: "Sun", isSelected: false, isDisabled: false },
      { dayId: 2, day: "Mon", isSelected: false, isDisabled: false },
      { dayId: 3, day: "Tue", isSelected: false, isDisabled: false },
      { dayId: 4, day: "Wed", isSelected: false, isDisabled: false },
      { dayId: 5, day: "Thu", isSelected: false, isDisabled: false },
      { dayId: 6, day: "Fri", isSelected: false, isDisabled: false },
      { dayId: 7, day: "Sat", isSelected: false, isDisabled: false }
    ];
  }

  //week holiday
  public convertToDays(data: Array<number>): any {
    this.resetDayList();

    for (var i = 0; i < data.length; i++) {
      this.dayList.filter(x => x.dayId == data[i])
        .forEach(item => {
          item.isSelected = true;
        })
    }

    let a: any[] = [];
    this.dayList.filter(x => x.isSelected == true).forEach(item => {
      a.push(item.day);
    })

    return a;
  }

  //week halfHoliday
  public convertToHalfHolidays(data: Array<number>): any {
    this.resetHalfHolidayList();

    for (var i = 0; i < data.length; i++) {
      this.halfHolidayList.filter(x => x.dayId == data[i])
        .forEach(item => {
          item.isSelected = true;
        })
    }

    let a: any[] = [];
    this.halfHolidayList.filter(x => x.isSelected == true).forEach(item => {
      a.push(item.day);
    })

    return a;
  }

  //used for retrieving date in edit modal
  convertFromTimeSpanFormat1(date: any): any {
    var newDate = new Date();
    var time = date;
    var index: number;
    time = time.replace("PT", "");
    if (time.indexOf("H") < 0) {
      index = 0;
      time = [time.slice(0, index), "00H", time.slice(index)].join('');
    }
    if (time.indexOf("M") < 0) {
      index = time.indexOf("H") + 1;
      time = [time.slice(0, index), "00M", time.slice(index)].join('');
    }
    if (time.indexOf("S") < 0) {
      index = time.indexOf("M") + 1;
      time = [time.slice(0, index), "00S", time.slice(index)].join('');
    }
    time = time.replace("PT", '').replace("H", ":").replace("M", ":").replace("S", "")
    var c = time.split(":");

    newDate.setHours(c[0]);
    newDate.setMinutes(c[1]);
    newDate.setSeconds(c[2]);

    return newDate;
  }

  //used only for table display
  convertFromTimeSpanFormat(date: any): string {
    var time = date;
    var index: number;
    time = time.replace("PT", "");
    if (time.indexOf("H") < 0) {
      index = 0;
      time = [time.slice(0, index), "00H", time.slice(index)].join('');
    }
    if (time.indexOf("M") < 0) {
      index = time.indexOf("H") + 1;
      time = [time.slice(0, index), "00M", time.slice(index)].join('');
    }
    if (time.indexOf("S") < 0) {
      index = time.indexOf("M") + 1;
      time = [time.slice(0, index), "00S", time.slice(index)].join('');
    }
    time = time.replace("PT", '').replace("H", ":").replace("M", ":").replace("S", "")
    var c = time.split(":");
    if (c[0] < 10 && c[0] != "00") {
      c[0] = "0" + c[0];
    }
    if (c[1] < 10 && c[1] != "00") {
      c[1] = "0" + c[1];
    }
    if (c[0] > 12 && c[0] < 24) {
      //var time2 = c[0] - 22 + ":" + c[1] + " " + "PM";
      var time2 = c[0] - 12 + ":" + c[1] + " " + "PM";
    }
    else if (c[0] < 12 && c[0] > 0) {
      var time2 = c[0] + ":" + c[1] + " " + "AM";
    }
    else {
      if (c[0] == 12) {
        var time2 = "12" + ":" + c[1] + " " + "PM";
      }
      else {
        var time2 = "12" + ":" + c[1] + " " + "AM";
      }
    }
    return time2;
  }


  convertToTimeSpanFormat(date: string) {
    var obj = new Date(date);
    return "PT" + obj.getHours() + "H" + obj.getMinutes() + "M" + obj.getSeconds() + "S";
    //return obj.toTimeString();
  }

  public filterHome(pagination: number = 1) {

    //this.pagination.CurrentPage = pagination <= 1 ? 1 : pagination > this.pagination.TotalPage ? this.pagination.TotalPage : pagination;
    this.getAllLoginGroup(this.filterObj);
  }

  public filterLoginGroup() {
    this.pagination.CurrentPage = 1;
    this.getAllLoginGroup(this.filterObj);
  }

  public loginGroupAndFilter() {
    this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
    this.filterLoginGroup();
  }

  //getLoginShift
  public getAllLoginShift() {
    this.loginShiftService.getAll()
      .subscribe((loginList: ILoginShift[]) => {
        this.loginShiftList = loginList;
      });
  }

  //getLoginGroupChild
  public getAllLoginGroupChild() {


    this.loginGroupChildService.getAll()
      .subscribe((list: ILoginGroupChild[]) => {

        list.forEach(item => {
          item.OfficeHourFrom = this.convertFromTimeSpanFormat(item.OfficeHourFrom);
          item.OfficeHourTill = this.convertFromTimeSpanFormat(item.OfficeHourTill);
          if (item.HalfHolidayOfficeHourFrom != null || item.HalfHolidayOfficeHourTill != null) {
            item.HalfHolidayOfficeHourFrom = this.convertFromTimeSpanFormat(item.HalfHolidayOfficeHourFrom);
            item.HalfHolidayOfficeHourTill = this.convertFromTimeSpanFormat(item.HalfHolidayOfficeHourTill);
          }
        })
        this.loginGroupChildList = list;
      });
  }

  //getAll
  public getAllLoginGroup(filterObj?: IFilterViewModel) {

    let skipCount = this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1);
    var query = "$expand=LoginShift,LoginGroupChild&$inlinecount=allpages&$skip=" + skipCount + "&$top=" + this.pagination.ItemsPerPage;

    if (filterObj != undefined || filterObj != null) {

      if (filterObj.Name != undefined && filterObj.Name != "") {
        if (filterObj.SearchBy == "ShiftName") {
          query += "&$filter=startswith(LoginShift/ShiftName, '" + this.filterObj.Name + "')";
        }
        else {
          query += "&$filter=startswith(" + filterObj.SearchBy + ", '" + this.filterObj.Name + "')";
        }
      }
      if (filterObj.Sort != undefined && filterObj.Sort != "") {

        if (filterObj.Sort == 'true') {
          query += "&$orderby=" + filterObj.SortingAttribute;
        }
        else {
          query += "&$orderby=" + filterObj.SortingAttribute + " desc";
        }
      }
    }
    else {
      if (this.isAddEditToggle == true) {
        query += "&$orderby=ModifiedOn desc";
      }
      else {
        query += "&$orderby=PostedOn desc";
      }
    }

    this.loginGroupService.getAll(query)
      .subscribe((list: any) => {

        this.pagination.TotalItems = <number>(list["odata.count"]);

        list.value.forEach((item: any) => {
          item.DefaultOfficeHourFrom = this.convertFromTimeSpanFormat(item.DefaultOfficeHourFrom);
          item.DefaultOfficeHourTill = this.convertFromTimeSpanFormat(item.DefaultOfficeHourTill);

          if (item.WeekHoliday != null) {
            item.WeekHoliday = `[${item.WeekHoliday}]`;
          }
          if (item.WeeklyHalfHoliday != null) {
            item.WeeklyHalfHoliday = `[${item.WeeklyHalfHoliday}]`;
          }

          if (item.HalfHolidayOfficeHourFrom != null) {
            item.HalfHolidayOfficeHourFrom = this.convertFromTimeSpanFormat(item.HalfHolidayOfficeHourFrom);
          }
          if (item.HalfHolidayOfficeHourTill != null) {
            item.HalfHolidayOfficeHourTill = this.convertFromTimeSpanFormat(item.HalfHolidayOfficeHourTill);
          }
          if (item.WeekHoliday != null) {
            item.WeekHoliday = this.convertToDays(JSON.parse(item.WeekHoliday));
          }
          if (item.WeeklyHalfHoliday != null) {
            item.WeeklyHalfHoliday = this.convertToHalfHolidays(JSON.parse(item.WeeklyHalfHoliday));
          }
        })
        this.loginGroupList = list.value;
      });
  }

  //loginGroup AddModal
  public openLoginGroupModal() {
    this.defaultOfficeHourFrom = new Date().toString();
    this.defaultOfficeHourTill = new Date().toString();
    this.officeHourFrom = new Date().toString();
    this.officeHourTill = new Date().toString();

    this.resetDayList();
    this.resetHalfHolidayList();
    this.isAddLoginGroup = true;
    this.isEditLoginGroup = false;

    this.selectedModalLoaded = true;
    if (this.loginGroupModal != undefined) {
      this.loginGroupModal.config.backdrop = false;
    }
    this.loginGroupModal.show();
  }

  public hideLoginGroupModal() {
    this.loginGroupModal.hide();
    this.isAddLoginGroup = false;
    this.isEditLoginGroup = false;
    this.isAddEditToggle = false;
    this.InputLoginGroup = <ILoginGroup>{};
    this.InputLoginGroupChild = <ILoginGroupChild>{};
    this.selectedModalLoaded = false;

    this.defaultOfficeHourFrom = null;
    this.defaultOfficeHourTill = null;
    this.halfHolidayOfficeHourFrom = null;
    this.halfHolidayOfficeHourTill = null;
    this.officeHourFrom = null;
    this.officeHourTill = null;
    this.halfHolidayOfficeHourFromLGC = null;
    this.halfHolidayOfficeHourTillLGC = null;
    this.showLoginChildList = false;
    this.toggleAddChild = false;
    this.toggleEditChild = false;
  }

  //post
  public saveLoginGroup() {
    this.InputLoginGroup.PostedBy = this.userId;
    this.saveLoginGroupChild();
    if (this.InputLoginGroup.DefaultOfficeHourFrom == null) {
      this.InputLoginGroup.DefaultOfficeHourFrom = this.convertToTimeSpanFormat(this.defaultOfficeHourFrom.toString());
    }
    if (this.InputLoginGroup.DefaultOfficeHourTill == null) {
      this.InputLoginGroup.DefaultOfficeHourTill = this.convertToTimeSpanFormat(this.defaultOfficeHourTill.toString());
    }
    let saveItem: ILoginGroup = Object.assign({}, this.InputLoginGroup);
    saveItem.WeekHoliday = saveItem.WeekHoliday.substring(1, saveItem.WeekHoliday.length - 1);
    saveItem.WeeklyHalfHoliday = saveItem.WeeklyHalfHoliday.substring(1, saveItem.WeeklyHalfHoliday.length - 1);
    saveItem.WeekHoliday = saveItem.WeekHoliday == "" ? null : saveItem.WeekHoliday;
    saveItem.WeeklyHalfHoliday = saveItem.WeeklyHalfHoliday == "" ? null : saveItem.WeeklyHalfHoliday;
    this.loginGroupService.post(saveItem)
      .subscribe(() => {
        this.InputLoginGroup = <ILoginGroup>{};
        this.isAddEditToggle = false;
        this.selectedModalLoaded = false;
        this.hideLoginGroupModal();

        this.pagination.CurrentPage = 1;

        this.getAllLoginGroup();

        var toastOptions: ToastOptions = {
          title: "Success",
          msg: "Login Group has been successfully Added",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
      });
  }

  public saveLoginGroupChild(): any {
    this.InputLoginGroupChild.PostedBy = this.userId;
    let saveChildItem: ILoginGroupChild;
    if (this.toggleAddChild == false) {
      saveChildItem = <ILoginGroupChild>{};
    }
    else {
      if (this.InputLoginGroupChild.OfficeHourFrom == null) {
        this.InputLoginGroupChild.OfficeHourFrom = this.convertToTimeSpanFormat(this.officeHourFrom.toString());
      }
      if (this.InputLoginGroupChild.OfficeHourTill == null) {
        this.InputLoginGroupChild.OfficeHourTill = this.convertToTimeSpanFormat(this.officeHourTill.toString());
      }
      saveChildItem = Object.assign({}, this.InputLoginGroupChild);
    }

    this.InputLoginGroup.LoginGroupChild = [];
    this.InputLoginGroup.LoginGroupChild.push(saveChildItem);
  }

  //for editing
  //getOne
  public getLoginGroup(id: number) {
    let query = "$expand=LoginGroupChild";

    this.resetDayList();
    this.resetHalfHolidayList();
    this.openEditModal();
    this.loginGroupService.get(id, query)
      .subscribe((one: ILoginGroup) => {

        this.LoginGroupDetails = one;
        this.defaultOfficeHourFrom = this.convertFromTimeSpanFormat1(one.DefaultOfficeHourFrom).toString();
        this.defaultOfficeHourTill = this.convertFromTimeSpanFormat1(one.DefaultOfficeHourTill).toString();

        if (one.WeekHoliday != null) {
          one.WeekHoliday = `[${one.WeekHoliday}]`;
        }
        if (one.WeeklyHalfHoliday != null) {
          one.WeeklyHalfHoliday = `[${one.WeeklyHalfHoliday}]`;
        }

        if (one.HalfHolidayOfficeHourFrom != null) {
          this.halfHolidayOfficeHourFrom = this.convertFromTimeSpanFormat1(one.HalfHolidayOfficeHourFrom).toString();
        }
        if (one.HalfHolidayOfficeHourTill != null) {
          this.halfHolidayOfficeHourTill = this.convertFromTimeSpanFormat1(one.HalfHolidayOfficeHourTill).toString();
        }

        if (one.WeekHoliday != null) {
          for (var i = 0; i < JSON.parse(one.WeekHoliday).length; i++) {
            this.dayList.forEach(item => {
              if (item.dayId == JSON.parse(one.WeekHoliday)[i]) {
                item.isSelected = true;
              }
            })
          }
        }

        if (one.WeeklyHalfHoliday != null) {
          for (var j = 0; j < JSON.parse(one.WeeklyHalfHoliday).length; j++) {
            this.halfHolidayList.forEach(item => {
              if (item.dayId == JSON.parse(one.WeeklyHalfHoliday)[j]) {
                item.isSelected = true;
              }
            })
          }
        }

        this.dayChange();

        this.LoginChildList = this.LoginGroupDetails.LoginGroupChild;
        this.LoginChildList.forEach(item => {
          this.officeHourFrom = this.convertFromTimeSpanFormat1(item.OfficeHourFrom).toString();
        })

        this.LoginChildList.forEach(item => {
          this.officeHourTill = this.convertFromTimeSpanFormat1(item.OfficeHourTill).toString();
        })
        this.LoginChildList.forEach(item => {
          if (item.HalfHolidayOfficeHourFrom != null || item.HalfHolidayOfficeHourTill != null) {
            this.halfHolidayOfficeHourFromLGC = this.convertFromTimeSpanFormat1(item.HalfHolidayOfficeHourFrom).toString();
            this.halfHolidayOfficeHourTillLGC = this.convertFromTimeSpanFormat1(item.HalfHolidayOfficeHourTill).toString();
          }
        })
        this.LoginGroupDetails.LoginGroupChild.forEach(item => {
          if (item.EffectiveMonth == 0) {
            this.showLoginChildList = true;
            this.toggleEditChild = false;
          } else {
            this.showLoginChildList = false;
            this.toggleEditChild = true;
          }
        })

        this.isAddEditToggle = true;

      });
  }

  //getOneLoginChild for edit
  public getOneLoginGroupChild(id: number) {
    this.loginGroupChildService.get(id)
      .subscribe((one: ILoginGroupChild) => {
        this.InputLoginGroupChild = one;
        this.InputLoginGroupChild.OfficeHourFrom = this.convertFromTimeSpanFormat1(one.OfficeHourFrom).toString();
        this.InputLoginGroupChild.OfficeHourTill = this.convertFromTimeSpanFormat1(one.OfficeHourTill).toString();

        if (one.HalfHolidayOfficeHourFrom != null || one.HalfHolidayOfficeHourTill != null) {
          this.InputLoginGroupChild.HalfHolidayOfficeHourFrom = this.convertFromTimeSpanFormat1(one.HalfHolidayOfficeHourFrom).toString();
          this.InputLoginGroupChild.HalfHolidayOfficeHourTill = this.convertFromTimeSpanFormat1(one.HalfHolidayOfficeHourTill).toString();
        }
      });
  }

  //one logingroup having multiple loginGroupChild
  public getLoginGroupChildListById(id: number) {
    this.loginGroupChildService.get(id)
      .subscribe((childList: any) => {
        this.loginGroupChildList = childList;
      });
  }

  //loginShift EditModal
  openEditModal() {
    this.isEditLoginGroup = true;
    this.isAddLoginGroup = false;
    this.selectedModalLoaded = true;
    if (this.loginGroupModal != undefined) {
      this.loginGroupModal.config.backdrop = false;
    }
    this.loginGroupModal.show();
  }

  //edit
  public editLoginGroup() {
    this.LoginGroupDetails.ModifiedBy = this.userId;
    this.LoginGroupDetails.LoginGroupChild.forEach(item => {
      item.ModifiedBy = this.userId;
    });
    let saveItem: ILoginGroup = Object.assign({}, this.LoginGroupDetails);

    let holiday: number[] = [];
    this.dayList.filter(x => x.isSelected == true).forEach(item => {
      holiday.push(item.dayId);
    })
    let halfHoliday: number[] = [];
    this.halfHolidayList.filter(x => x.isSelected == true).forEach(item => {
      halfHoliday.push(item.dayId);
    })
    if (saveItem.WeekHoliday != "") {
      saveItem.WeekHoliday = JSON.stringify(holiday).substring(1, JSON.stringify(holiday).length - 1);
    }
    if (saveItem.WeeklyHalfHoliday != "") {

      saveItem.WeeklyHalfHoliday = JSON.stringify(halfHoliday).substring(1, JSON.stringify(halfHoliday).length - 1);
    }
    saveItem.WeekHoliday = saveItem.WeekHoliday == "" ? null : saveItem.WeekHoliday;
    saveItem.WeeklyHalfHoliday = saveItem.WeeklyHalfHoliday == "" ? null : saveItem.WeeklyHalfHoliday;

    this.loginGroupService.put(saveItem.GroupId, saveItem)
      .subscribe(() => {
        //this.filterLoginGroup();
        this.getAllLoginGroup();
        this.isEditLoginGroup = false;
        this.LoginGroupDetails = <ILoginGroup>{};
        this.hideLoginGroupModal();
        this.selectedModalLoaded = false;
        this.isAddEditToggle = false;

        var toastOptions: ToastOptions = {
          title: "Edited",
          msg: "Login Group has been successfully Edited",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);
      });
  }

  //deleteModal
  openDeleteModal(Id: number) {
    this.deleteId = Id;
    this.deleteModalLoaded = true;
    if (this.deleteModal != undefined) {
      this.deleteModal.config.backdrop = false;
    }
    this.deleteModal.show();
  }

  public hideDeleteModal(): void {
    this.deleteModal.hide();
  }

  //delete
  public deleteLoginGroup() {
    this.loginGroupService.delete(this.deleteId)
      .subscribe(() => {
        this.filterLoginGroup();
        this.deleteModalLoaded = false;
        this.hideDeleteModal();
        this.getAllLoginGroupChild();

        var toastOptions: ToastOptions = {
          title: "Delete",
          msg: "Login Group has been deleted successfully",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.error(toastOptions);
      });
  }

  buttonState() {
    return !this.halfHolidayList.some(x => x.isSelected);
  }


  //loginGroupChildDetailsModal
  public openLoginGroupChildDetailsModal(id: number) {
    this.detailId = id;
    this.getLoginGroupChild(id);

    this.selectedChildDetailsModalLoaded = true;
    if (this.loginGroupChildDetails != undefined) {
      this.loginGroupChildDetails.config.backdrop = false;
    }
    this.loginGroupChildDetails.show();
  }

  public hideLoginGroupChildDetailsModal() {
    this.loginGroupChildDetails.hide();
  }

  //getOne for listing details
  public getLoginGroupChild(id: number) {
    this.loginGroupChildService.get(id)
      .subscribe((one: ILoginGroupChild) => {
        this.loginGroupChild = one;
        this.loginGroupChild.OfficeHourFrom = this.convertFromTimeSpanFormat(one.OfficeHourFrom);
        this.loginGroupChild.OfficeHourTill = this.convertFromTimeSpanFormat(one.OfficeHourTill);
        if (one.HalfHolidayOfficeHourFrom != null || one.HalfHolidayOfficeHourTill != null) {
          this.loginGroupChild.HalfHolidayOfficeHourFrom = this.convertFromTimeSpanFormat(one.HalfHolidayOfficeHourFrom);
          this.loginGroupChild.HalfHolidayOfficeHourTill = this.convertFromTimeSpanFormat(one.HalfHolidayOfficeHourTill);
        }
      });
  }

  public dayChange(event?: any) {
    let holiday: number[] = [];
    this.dayList.filter(x => x.isSelected == true).forEach(item => {
      holiday.push(item.dayId);
    });

    this.halfHolidayList.forEach(halfHolidayItem => {
      if (holiday.filter(x => x == halfHolidayItem.dayId).length > 0) {
        halfHolidayItem.isSelected = false;
        halfHolidayItem.isDisabled = true;
      } else {
        halfHolidayItem.isDisabled = false;
      }
    });

    this.halfDayChange();

    this.InputLoginGroup.WeekHoliday = JSON.stringify(holiday);
  }

  public halfDayChange(event?: any) {
    let halfHoliday: number[] = [];
    this.halfHolidayList.filter(x => x.isSelected == true).forEach(item => {
      halfHoliday.push(item.dayId);
    })

    this.InputLoginGroup.WeeklyHalfHoliday = JSON.stringify(halfHoliday);
  }

  defaultOfficeHF(event: any) {
    this.InputLoginGroup.DefaultOfficeHourFrom = this.convertToTimeSpanFormat(event.toString());
  }

  defaultOfficeHT(event: any) {
    this.InputLoginGroup.DefaultOfficeHourTill = this.convertToTimeSpanFormat(event.toString());
  }

  halfHolidayOfficeHF(event: any) {
    this.InputLoginGroup.HalfHolidayOfficeHourFrom = this.convertToTimeSpanFormat(event.toString());
  }

  halfHolidayOfficeHT(event: any) {
    this.InputLoginGroup.HalfHolidayOfficeHourTill = this.convertToTimeSpanFormat(event.toString());
  }

  officeHF(event: any) {
    this.InputLoginGroupChild.OfficeHourFrom = this.convertToTimeSpanFormat(event.toString());
  }

  officeHT(event: any) {
    this.InputLoginGroupChild.OfficeHourTill = this.convertToTimeSpanFormat(event.toString());
  }

  halfHolidayOfficeHFLGC(event: any) {
    this.InputLoginGroupChild.HalfHolidayOfficeHourFrom = this.convertToTimeSpanFormat(event.toString());
  }

  halfHolidayOfficeHTLGC(event: any) {
    this.InputLoginGroupChild.HalfHolidayOfficeHourTill = this.convertToTimeSpanFormat(event.toString());
  }

  defaultOfficeHFEdit(event: any) {
    this.LoginGroupDetails.DefaultOfficeHourFrom = this.convertToTimeSpanFormat(event.toString());
  }

  defaultOfficeHTEdit(event: any) {
    this.LoginGroupDetails.DefaultOfficeHourTill = this.convertToTimeSpanFormat(event.toString());
  }

  halfHolidayOfficeHFEdit(event: any) {
    this.LoginGroupDetails.HalfHolidayOfficeHourFrom = this.convertToTimeSpanFormat(event.toString());
  }

  halfHolidayOfficeHTEdit(event: any) {
    this.LoginGroupDetails.HalfHolidayOfficeHourTill = this.convertToTimeSpanFormat(event.toString());
  }
  officeHFEdit(event: any) {
    this.LoginGroupDetails.LoginGroupChild.forEach(item => {
      item.OfficeHourFrom = this.convertToTimeSpanFormat(event.toString());
    })
  }

  officeHTEdit(event: any) {
    this.LoginGroupDetails.LoginGroupChild.forEach(item => {
      item.OfficeHourTill = this.convertToTimeSpanFormat(event.toString());
    })
  }

  halfHolidayOfficeHourFromLGCEdit(event: any) {
    this.LoginGroupDetails.LoginGroupChild.forEach(item => {
      item.HalfHolidayOfficeHourFrom = this.convertToTimeSpanFormat(event.toString());
    })
  }

  halfHolidayOfficeHourTillLGCEdit(event: any) {
    this.LoginGroupDetails.LoginGroupChild.forEach(item => {
      item.HalfHolidayOfficeHourTill = this.convertToTimeSpanFormat(event.toString());
    })
  }

  public checkUserParameterForMonth(id: number) {
    var query = "$select=ParamValue/PValue&$expand=ParamValue"
    this.paramService.get(id, query)
      .subscribe((one: IParam) => {
        this.InputParam = one;
        if (this.InputParam.ParamValue.PValue == 1) {
          this.MonthList = this.englishMonthList;
        }
        else {
          this.MonthList = this.nepaliMonthList;
        }
      })
  }

  public sortBy(sortBy: string) {
    this.toggleSort = !this.toggleSort;
    if (this.toggleSort == true) {
      this.filterObj.Sort = "true";
    }
    else {
      this.filterObj.Sort = "false";
    }

    this.filterObj.SortingAttribute = sortBy;
    this.getAllLoginGroup(this.filterObj);
  }


  // pagination return event
  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.getAllLoginGroup(this.filterObj);
  }

}
