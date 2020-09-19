import { Component, Injectable, ViewChild } from '@angular/core';
import { HRMLevelService, HRLevelVsAllowancesService } from '../../services/BaseService';
import { IHRMLevel, IPagination, IHRLevelVsAllowances } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { Utilities } from '../../shared/utilities';

@Component({
  templateUrl: 'hRMLevel.component.html'
})
export class HRMLevelComponent {
  isAddLevelInfo: boolean = false;
  isEditLevelInfo: boolean = false;
  isAddEditToggle: boolean = false;
  levelInfoList: IHRMLevel[] = [];
  InputLevelInfo: IHRMLevel = <IHRMLevel>{};

  @ViewChild('levelInfoModal', { static: false }) public levelInfoModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selectedModalLoaded: boolean = false;

  //deleteModal
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirectiveDelete: any;
  deleteModalLoaded: boolean = false;
  deleteId: number;
  userId: string;
  toggleSort: boolean = false;
  duplicateName: boolean = false;
  validFormat: boolean = true;
  disableDelete: boolean = false;

  //searching and sorting
  filterObj?: IFilterViewModel;

  //for pagination
  pagination?: IPagination;

  constructor(
    public hRMLevelService: HRMLevelService,
    private hRLevelVsAllowanceService: HRLevelVsAllowancesService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig
  ) {
    this.userId = localStorage.getItem('UserId');
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.filterObj = { Name: '', Sort: '', SortingAttribute: '', SearchBy: '' };
    this.getAllLevelInfo();
  }

  public filterLevelInfo() {
    this.resetPagination();
    this.getAllLevelInfo(this.filterObj);
  }

  public levelInfoAndFilter() {
    this.resetPagination();
    this.filterObj = { Name: '', Sort: '' };
    this.getAllLevelInfo();
  }

  //getAll
  public getAllLevelInfo(filterObj?: IFilterViewModel) {
    var query: string = "";

    if (filterObj != undefined || filterObj != null) {
      if (filterObj.Name != undefined && filterObj.Name != "") {
        if (query != null && query != "") {
          query += "&$filter=substringof('" + this.filterObj.Name + "',LvlDesc)";
        }
        else {
          query += "$filter=substringof('" + this.filterObj.Name + "',LvlDesc)";
        }
      }
      if (filterObj.Sort != undefined && filterObj.Sort != "") {
        if (filterObj.Sort == 'true') {
          if (query != null && query != "") {
            query += "&$orderby=" + filterObj.SortingAttribute;
          }
          else {
            query += "$orderby=" + filterObj.SortingAttribute;
          }
        }
        else {
          if (query != null && query != "") {
            query += "&$orderby=" + filterObj.SortingAttribute + " desc";
          }
          else {
            query += "$orderby=" + filterObj.SortingAttribute + " desc";
          }
        }
      }
      else {
        if (this.isAddEditToggle == true) {
          if (query != null && query != "") {
            query += "&$orderby=ModifiedOn desc";
          }
          else {
            query += "$orderby=ModifiedOn desc";
          }
        }
        else {
          if (query != null && query != "") {
            query += "&$orderby=PostedOn desc";
          }
          else {
            query += "$orderby=PostedOn desc";
          }
        }
      }
    }
    else {
      if (this.isAddEditToggle == true) {
        if (query != null && query != "") {
          query += "&$orderby=ModifiedOn desc";
        }
        else {
          query += "$orderby=ModifiedOn desc";
        }
      }
      else {
        if (query != null && query != "") {
          query += "&$orderby=PostedOn desc";
        }
        else {
          query += "$orderby=PostedOn desc";
        }
      }
    }
    let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
    if (query != null && query != "") {
      query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
    }
    else {
      query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
    }

    this.hRMLevelService.getAll(query)
      .subscribe((list: any) => {
        this.levelInfoList = list.value;
        this.pagination = {
          ItemsPerPage: this.pagination.ItemsPerPage,
          TotalItems: <number>(list["odata.count"]),
          CurrentPage: this.pagination.CurrentPage,
          SortBy: this.pagination.SortBy
        };
      });
  }

  //openModal
  public openModal() {
    this.isAddLevelInfo = true;
    this.isEditLevelInfo = false;
    this.selectedModalLoaded = true;
    this.levelInfoModal.show();
  }

  public hideModal() {
    this.levelInfoModal.hide();
    this.isAddLevelInfo = false;
    this.isEditLevelInfo = false;
    this.isAddEditToggle = false;
    this.duplicateName = false;
    this.validFormat = true;
    this.InputLevelInfo = <IHRMLevel>{};
    this.selectedModalLoaded = false;
  }

  public saveLevelInfo() {
    this.InputLevelInfo.PostedBy = this.userId;
    let saveItem: IHRMLevel = Object.assign({}, this.InputLevelInfo);

    this.hRMLevelService.post(saveItem)
      .subscribe(() => {
        this.InputLevelInfo = <IHRMLevel>{};
        this.isAddEditToggle = false;
        this.selectedModalLoaded = false;
        this.hideModal();
        this.getAllLevelInfo();

        var toastOptions: ToastOptions = {
          title: "Success",
          msg: "Level has been successfully Added",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);

      });
  }

  //delete
  openDeleteModal(Id: number) {
    let query = `$filter=LvlId eq ${Id}`;
    this.hRLevelVsAllowanceService.getAll(query).subscribe((data: IHRLevelVsAllowances[]) => {
      if (data.length > 0) {
        this.disableDelete = true;
      }
      else {
        this.disableDelete = false;
      }
      this.deleteId = Id;
      this.deleteModalLoaded = true;
      this.deleteModal.show();
    });
  }

  public hideDeleteModal(): void {
    this.deleteModal.hide();
  }

  public deleteLevelInfo() {
    this.hRMLevelService.delete(this.deleteId)
      .subscribe(() => {
        this.getAllLevelInfo();
        this.deleteModalLoaded = false;
        this.hideDeleteModal();

        var toastOptions: ToastOptions = {
          title: "Delete",
          msg: "Level has been deleted successfully",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.error(toastOptions);

      });
  }

  //EditModal
  openEditModal() {
    this.isEditLevelInfo = true;
    this.isAddLevelInfo = false;
    this.selectedModalLoaded = true;
    this.levelInfoModal.show();
  }


  //getOne
  public getLevelInfo(id: number) {
    this.hRMLevelService.get(id)
      .subscribe((one: IHRMLevel) => {
        this.InputLevelInfo = one;
        this.isAddEditToggle = true;
        this.openEditModal();
      });
  }

  //edit
  public editLevelInfo() {
    this.InputLevelInfo.ModifiedBy = this.userId;
    let editItem: IHRMLevel = Object.assign({}, this.InputLevelInfo);
    this.hRMLevelService.put(editItem.LvlId, editItem)
      .subscribe(() => {
        this.getAllLevelInfo();
        this.isEditLevelInfo = false;
        this.InputLevelInfo = <IHRMLevel>{};
        this.hideModal();
        this.selectedModalLoaded = false;

        var toastOptions: ToastOptions = {
          title: "Edited",
          msg: "Level has been successfully Edited",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);

      });
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
    this.getAllLevelInfo(this.filterObj);
  }

  public checkDuplicate(event: any) {
    var query = "$filter=LvlDesc eq '" + event + "'";
    this.hRMLevelService.getAll(query).subscribe((data: IHRMLevel[]) => {
      if (data.length > 0) {
        this.duplicateName = true;
      }
      else {
        this.duplicateName = false;
      }
    });
  }

  public checkMoney(amt: string) {
    this.validFormat = Utilities.isDecimal(amt);
  }

  public resetPagination() {
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
  }

  public isFormValid(bookForm: any): boolean {
    if (!bookForm.form.valid) {
      return false;
    }
    if (this.duplicateName == true) {
      return false;
    }
    if (this.validFormat == false) {
      return false;
    }
    return true;
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.getAllLevelInfo(this.filterObj);
  }
}
