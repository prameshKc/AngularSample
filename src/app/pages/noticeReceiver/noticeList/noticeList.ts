import { Component, Injectable, ViewChild } from '@angular/core';
import {
  NoticeService, NoticeReceiverService,
  UserService, SupervisorListService
} from '../../../services/BaseService';
import {
  INotice, INoticeReceiver, IPagination,
  IUser, IODataResult
} from '../../../models/Models';
import { IFilterViewModel, IEmployeeWithEmpPosVM } from '../../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig } from 'ngx-toasty';
declare var text: any;
@Component({
  selector: 'notice-list',
  templateUrl: 'noticeList.html'
})
export class NoticeListComponent {
  @ViewChild('NoticeModal', { static: false }) public NoticeModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirective: any;
  selectedModal: boolean;

  @ViewChild('NotifyToModal', { static: false }) public NotifyToModal: ModalDirective
  @ViewChild('modal', { static: false }) NotifyToModalDirective: any;
  selectedModalLoad: boolean;

  userId: string;
  userDetails: IUser = <IUser>{};
  isAdmin: boolean = false;
  currentEmpId: number;
  showNotice: INotice[] = [];
  noticeList: INotice[] = [];
  InputNotice: INotice = <INotice>{};
  notifyList: INoticeReceiver[] = [];
  //for pagination
  pagination?: IPagination;
  paginationForNotifyTo?: IPagination;
  paginationForEmpList?: IPagination;

  filterObj?: IFilterViewModel;

  received: boolean = true;
  sent: boolean = false;
  selectedId: number;
  employeeList: IEmployeeWithEmpPosVM[] = [];
  showAllEmployee: boolean = false;

  constructor(
    public noticeService: NoticeService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    public userService: UserService,
    private noticeReceiverService: NoticeReceiverService,
    public supervisorListService: SupervisorListService
  ) {
    this.userId = localStorage.getItem('UserId');
    this.currentEmpId = parseInt(localStorage.getItem('EmployeeId'));
    this.getUserDetails();
  }


  public getUserDetails() {
    return new Promise<string>((resolve) => {
      let query: string = '$select=*,Employee/FirstName,Employee/MiddleName,Employee/LastName,Employee/ReportTo/*,MenuTemplate/*,MenuTemplate/MenuVsTemplate/*&$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate';
      this.userService.get(this.userId, query).subscribe((data: IUser) => {
        this.userDetails = data;
        this.userDetails.Employee.ReportTo = this.userDetails.Employee.ReportTo.filter(x => x.Status == true);
        let currentReportTo = data.Employee.ReportTo.filter(x => x.Status == true)[0];
        if (
          currentReportTo.ReportTo1 == 0 ||
          this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0 ||
          this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1121).length > 0
        ) {
          this.isAdmin = true;
        }
        else {
          this.isAdmin = false;
        }

        this.filterObj = { Name: "", Sort: "false", SortingAttribute: "PostedOn", SearchBy: null };
        this.pagination = <IPagination>{
          CurrentPage: 1,
          ItemsPerPage: 5,
          TotalItems: 0,
          SortBy: null
        };
        this.paginationForNotifyTo = this.pagination;
        this.paginationForEmpList = this.pagination;
      })
    });
  }

  public getAllReceivedNotice() {
    var query: string = `$expand=NoticeReceiver`;

    if (this.received == true) {
      if (this.isAdmin == false) {
        query += `&$filter=NoticeReceiver/Recipient eq 0 or NoticeReceiver/Recipient eq ${this.currentEmpId}`;
      }
    }
    else {
      query += `&$filter=PostedBy eq '${this.userId}'`;
    }
    let currentDate = new Date();
    currentDate.setDate(-20);
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);

    if (!query.includes('$filter')) {
      query += `&$filter=`;
    } else {
      query += ` and `;
    }
    query += `PostedOn ge DateTime'${currentDate.toISOString()}'`;

    let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));


    query += `&$orderby=PostedOn desc&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

    this.noticeService.getAll(query).subscribe((data: any) => {
      this.showNotice = [];
      this.noticeList = data.value;
      let uniqueArray: number[] = [];
      let unique: number;
      this.noticeList.forEach(item => {
        if (uniqueArray.filter(x => x == item.NoticeId).length == 0) {
          this.showNotice.push(item);
          uniqueArray.push(item.NoticeId);
        }
      });
      this.pagination = {
        ItemsPerPage: this.pagination.ItemsPerPage,
        TotalItems: <number>(data["odata.count"]),
        CurrentPage: this.pagination.CurrentPage,
        SortBy: this.pagination.SortBy
      };
    });
  }

  openNoticeModal(id: number) {
    this.noticeService.get(id).subscribe((data: INotice) => {
      this.InputNotice = data;
      this.selectedModal = true;
      this.NoticeModal.show();
      setTimeout(() => {
        text = data.Body;
      }, 0);
    });
  }

  public hideModal() {
    this.selectedModal = false;
    this.NoticeModal.hide();
  }

  getNotifiedStaff(id: number) {
    this.paginationForEmpList = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 5,
      TotalItems: 0,
      SortBy: null
    };
    this.selectedId = id;
    let query = `$expand=Employee&$filter=NoticeId eq ${id}`;
    let skipCount = (this.paginationForNotifyTo.ItemsPerPage * (this.paginationForNotifyTo.CurrentPage - 1));
    if (query != null && query != "") {
      query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.paginationForNotifyTo.ItemsPerPage}`;
    }
    else {
      query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.paginationForNotifyTo.ItemsPerPage}`;
    }
    this.noticeReceiverService.getAll(query).subscribe((data: any) => {
      this.notifyList = data.value;
      if (this.notifyList[0].Recipient == 0) {
        this.showAllEmployee = true;
      }
      else {
        this.showAllEmployee = false;
      }

      this.paginationForNotifyTo = {
        ItemsPerPage: this.paginationForNotifyTo.ItemsPerPage,
        TotalItems: <number>(data["odata.count"]),
        CurrentPage: this.paginationForNotifyTo.CurrentPage,
        SortBy: this.paginationForNotifyTo.SortBy
      };
      this.selectedModalLoad = true;
      this.NotifyToModal.show();
    });
  }

  getAllEmployee() {
    this.supervisorListService.GetEmployeeHierarchy(-1, this.paginationForEmpList, this.filterObj).subscribe((data: IODataResult<IEmployeeWithEmpPosVM[]>) => {
      this.employeeList = data.value;
      this.paginationForEmpList = {
        ItemsPerPage: this.paginationForEmpList.ItemsPerPage,
        TotalItems: data.count,
        CurrentPage: this.paginationForEmpList.CurrentPage,
        SortBy: this.paginationForEmpList.SortBy
      };
    });
  }

  public hideNotifyToModal() {
    this.selectedModalLoad = false;
    this.NotifyToModal.hide();
    this.paginationForEmpList = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 5,
      TotalItems: 0,
      SortBy: null
    };
  }

  public onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.getAllReceivedNotice();
  }

  public onPageSelect2(pagination: IPagination) {
    this.paginationForNotifyTo = pagination;
    this.getNotifiedStaff(this.selectedId);
  }

  public onPageSelect3(pagination: IPagination) {
    this.paginationForEmpList = pagination;
    this.getAllEmployee();
  }

  public goToSendNotice() {
    this.received = false;
    this.sent = true;
    this.resetPagination();
    this.onPageSelect(this.pagination);
  }

  public goToReceivedNotice() {
    this.received = true;
    this.sent = false;
    this.resetPagination();
    this.onPageSelect(this.pagination);
  }

  public resetPagination() {
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 5,
      TotalItems: 0,
      SortBy: null
    };
  }
}
