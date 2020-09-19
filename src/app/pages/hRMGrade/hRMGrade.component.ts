import { Component, Injectable, ViewChild } from '@angular/core';
import { HRMGradeService } from '../../services/BaseService';
import { IHRMGrade, IPagination } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';
import { Utilities } from '../../shared/utilities';

@Component({
  templateUrl: 'hRMGrade.component.html'
})
export class HRMGradeComponent {
  isAddGradeInfo: boolean = false;
  isEditGradeInfo: boolean = false;
  isAddEditToggle: boolean = false;
  gradeInfoList: IHRMGrade[] = [];
  InputGradeInfo: IHRMGrade = <IHRMGrade>{};

  @ViewChild('gradeInfoModal', { static: false }) public gradeInfoModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirective: any;
  selectedModalLoaded: boolean = false;

  //deleteModal
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false }) ModalDirectiveDelete: any;
  deleteModalLoaded: boolean = false;
  deleteId: number;
  userId: string;
  toggleSort: boolean = false;
  duplicateName: boolean = false;
  validFormat: boolean = true;

  //searching and sorting
  filterObj?: IFilterViewModel;

  //for pagination
  pagination?: IPagination;

  constructor(
    public hRMGradeService: HRMGradeService,
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
    this.getAllGradeInfo();
  }

  public filterGradeInfo() {
    this.resetPagination();
    this.getAllGradeInfo(this.filterObj);
  }

  public gradeInfoAndFilter() {
    this.resetPagination();
    this.filterObj = { Name: '', Sort: '' };
    this.getAllGradeInfo();
  }

  //getAll
  public getAllGradeInfo(filterObj?: IFilterViewModel) {
    var query: string = "";

    if (filterObj != undefined || filterObj != null) {
      if (filterObj.Name != undefined && filterObj.Name != "") {
        if (query != null && query != "") {
          query += "&$filter=substringof('" + this.filterObj.Name + "',GdDesc)";
        }
        else {
          query += "$filter=substringof('" + this.filterObj.Name + "',GdDesc)";
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

    this.hRMGradeService.getAll(query)
      .subscribe((list: any) => {
        this.gradeInfoList = list.value;
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
    this.isAddGradeInfo = true;
    this.isEditGradeInfo = false;
    this.selectedModalLoaded = true;
    this.gradeInfoModal.show();
  }

  public hideModal() {
    this.gradeInfoModal.hide();
    this.isAddGradeInfo = false;
    this.isEditGradeInfo = false;
    this.isAddEditToggle = false;
    this.duplicateName = false;
    this.validFormat = true;
    this.InputGradeInfo = <IHRMGrade>{};
    this.selectedModalLoaded = false;
  }

  public saveGradeInfo() {
    this.InputGradeInfo.PostedBy = this.userId;
    let saveItem: IHRMGrade = Object.assign({}, this.InputGradeInfo);

    this.hRMGradeService.post(saveItem)
      .subscribe(() => {
        this.InputGradeInfo = <IHRMGrade>{};
        this.isAddEditToggle = false;
        this.selectedModalLoaded = false;
        this.hideModal();
        this.getAllGradeInfo();

        var toastOptions: ToastOptions = {
          title: "Success",
          msg: "Grade Information has been successfully Added",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);

      });
  }

  //delete
  openDeleteModal(Id: number) {
    this.deleteId = Id;
    this.deleteModalLoaded = true;
    this.deleteModal.show();
  }

  public hideDeleteModal(): void {
    this.deleteModal.hide();
  }

  public deleteGradeInfo() {
    this.hRMGradeService.delete(this.deleteId)
      .subscribe(() => {
        this.getAllGradeInfo();
        this.deleteModalLoaded = false;
        this.hideDeleteModal();

        var toastOptions: ToastOptions = {
          title: "Delete",
          msg: "Grade Information has been deleted successfully",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.error(toastOptions);

      });
  }

  //EditModal
  openEditModal() {
    this.isEditGradeInfo = true;
    this.isAddGradeInfo = false;
    this.selectedModalLoaded = true;
    this.gradeInfoModal.show();
  }


  //getOne
  public getGradeInfo(id: number) {
    this.hRMGradeService.get(id)
      .subscribe((one: IHRMGrade) => {
        this.InputGradeInfo = one;
        this.isAddEditToggle = true;
        this.openEditModal();
      });
  }

  //edit
  public editGradeInfo() {
    this.InputGradeInfo.ModifiedBy = this.userId;
    let editItem: IHRMGrade = Object.assign({}, this.InputGradeInfo);
    this.hRMGradeService.put(editItem.GdId, editItem)
      .subscribe(() => {
        this.getAllGradeInfo();
        this.isEditGradeInfo = false;
        this.InputGradeInfo = <IHRMGrade>{};
        this.hideModal();
        this.selectedModalLoaded = false;

        var toastOptions: ToastOptions = {
          title: "Edited",
          msg: "Grade Information has been successfully Edited",
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
    this.getAllGradeInfo(this.filterObj);
  }

  public checkDuplicate(event: any) {
    var query = "$filter=GdDesc eq '" + event + "'";
    this.hRMGradeService.getAll(query).subscribe((data: IHRMGrade[]) => {
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
    this.getAllGradeInfo(this.filterObj);
  }
}
