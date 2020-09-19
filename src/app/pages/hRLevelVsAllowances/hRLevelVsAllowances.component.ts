import { Component, Injectable, ViewChild } from '@angular/core';
import { HRLevelVsAllowancesService, HRMLevelService, PayrollService } from '../../services/BaseService';
import { IHRLevelVsAllowances, IHRMLevel, IFGetledgerAllowanceAmountTB_Result, IPagination } from '../../models/Models';
import { IFilterViewModel } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap'
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { Utilities } from '../../shared/utilities';

@Component({
  templateUrl: 'hRLevelVsAllowances.component.html'
})
export class HRLevelVsAllowancesComponent {
  isAddAllowanceInfo: boolean = false;
  isEditAllowanceInfo: boolean = false;
  isAddEditToggle: boolean = false;
  filteredLevelList: IHRLevelVsAllowances[] = [];
  allowanceInfoList: IHRLevelVsAllowances[] = [];
  InputAllowanceInfo: IHRLevelVsAllowances = <IHRLevelVsAllowances>{};
  levelList: IHRMLevel[] = [];
  ledgerAllowanceAmountList: IFGetledgerAllowanceAmountTB_Result[] = [];
  displayLedgerAllowanceAmountList: IFGetledgerAllowanceAmountTB_Result[] = [];

  @ViewChild('allowanceInfoModal', { static: false }) public allowanceInfoModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selectedModalLoaded: boolean = false;

  @ViewChild('detailModal', { static: false }) public detailModal: ModalDirective
  @ViewChild('modal', { static: false })
  selectedDetailModalLoaded: boolean = false;

  userId: string;
  toggleSort: boolean = false;
  editHR: boolean = false;
  filterByLevel: string;
  filterByAllowance: string;
  validFormat: boolean = true;

  //searching and sorting
  filterObj?: IFilterViewModel;

  //for pagination
  pagination?: IPagination;

  constructor(
    public hRLevelVsAllowancesService: HRLevelVsAllowancesService,
    public hRMLevelService: HRMLevelService,
    public payrollService: PayrollService,
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
    this.getAllLevel();
    this.getAllAllowanceInfo();
  }

  public filterAllowanceInfo() {
    this.resetPagination();
    this.getAllAllowanceInfo(this.filterObj);
  }

  public allowanceInfoAndFilter() {
    this.resetPagination();
    this.filterObj = { Name: '', Sort: '' };
    this.getAllAllowanceInfo();
  }

  public getAllLevel() {
    this.hRMLevelService.getAll().subscribe((list: IHRMLevel[]) => {
      this.levelList = list;
    });
  }

  //getAll
  public getAllAllowanceInfo(filterObj?: IFilterViewModel) {
    var query: string = `$expand=HRMLedger,HRMLevel`;

    if (filterObj != undefined || filterObj != null) {
      if (filterObj.Sort != undefined && filterObj.Sort != "") {
        if (filterObj.Sort == 'true') {
          query += "&$orderby=" + filterObj.SortingAttribute;
        }
        else {
          query += "&$orderby=" + filterObj.SortingAttribute + " desc";
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
    }
    else {
      if (this.isAddEditToggle == true) {
        query += "&$orderby=ModifiedOn desc";
      }
      else {
        query += "&$orderby=PostedOn desc";
      }
    }
    let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
    if (query != null && query != "") {
      query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
    }
    else {
      query += `$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;
    }

    this.hRLevelVsAllowancesService.getAll(query)
      .subscribe((list: any) => {
        this.allowanceInfoList = list.value;
        this.filteredLevelList = [];
        let uniqueArray: number[] = [];
        let unique: number;

        this.allowanceInfoList.forEach(item => {
          unique = uniqueArray.filter(x => x == item.LvlId).length;
          if (unique == 0) {
            this.filteredLevelList.push(item);
          }
          uniqueArray.push(item.LvlId);
        });
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
    this.ledgerAllowanceAmountList = [];
    this.isAddAllowanceInfo = true;
    this.isEditAllowanceInfo = false;
    this.selectedModalLoaded = true;
    this.allowanceInfoModal.show();
  }

  public hideModal() {
    this.allowanceInfoModal.hide();
    this.isAddAllowanceInfo = false;
    this.isEditAllowanceInfo = false;
    this.isAddEditToggle = false;
    this.InputAllowanceInfo = <IHRLevelVsAllowances>{};
    this.ledgerAllowanceAmountList = [];
    this.selectedModalLoaded = false;
    this.validFormat = true;
  }

  public saveAllowanceInfo(list: IFGetledgerAllowanceAmountTB_Result[]) {
    let saveItem: IHRLevelVsAllowances;
    list.forEach(item => {
      saveItem = {
        ALId: item.ALId,
        LvlId: this.InputAllowanceInfo.LvlId,
        Amount: item.Amount,
        PostedBy: this.userId
      };
      this.hRLevelVsAllowancesService.post(saveItem)
        .subscribe(() => {
          this.InputAllowanceInfo = <IHRLevelVsAllowances>{};
          this.isAddEditToggle = false;
          this.selectedModalLoaded = false;
          this.hideModal();
          this.getAllAllowanceInfo();
        });
    });
    var toastOptions: ToastOptions = {
      title: "Success",
      msg: "Allowance Information has been successfully Added",
      showClose: true,
      timeout: 5000,
      theme: 'bootstrap'
    };
    this.toastyService.success(toastOptions);
  }

  //EditModal
  openEditModal() {
    this.isEditAllowanceInfo = true;
    this.isAddAllowanceInfo = false;
    this.selectedModalLoaded = true;
    this.allowanceInfoModal.show();
  }

  //edit
  public editAllowanceInfo(list: IFGetledgerAllowanceAmountTB_Result[]) {
    this.InputAllowanceInfo.ModifiedBy = this.userId;
    let editItem: IHRLevelVsAllowances;
    list.forEach(item => {
      editItem = {
        ALId: item.ALId,
        LvlId: this.InputAllowanceInfo.LvlId,
        Amount: item.Amount,
        PostedBy: item.PostedBy,
        //PostedOn: item.PostedOn,
        ModifiedBy: this.userId
      };
      this.hRLevelVsAllowancesService.put(editItem.LvlId, editItem)
        .subscribe(() => {
          this.getAllAllowanceInfo();
          this.isEditAllowanceInfo = false;
          this.InputAllowanceInfo = <IHRLevelVsAllowances>{};
          this.hideModal();
          this.selectedModalLoaded = false;

          var toastOptions: ToastOptions = {
            title: "Edited",
            msg: "Allowance Information has been successfully Edited",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap'
          };
          this.toastyService.success(toastOptions);
        });
    });
  }

  public onLevelChange(id: number) {
    this.payrollService.getledgerAllowanceAmount(id).subscribe((list: IFGetledgerAllowanceAmountTB_Result[]) => {
      this.ledgerAllowanceAmountList = list;
      var query = `$filter=LvlId eq ${id}`;
      this.hRLevelVsAllowancesService.getAll(query).subscribe((data: IHRLevelVsAllowances[]) => {
        if (data.length > 0) {
          this.isAddEditToggle = true;
        }
        else {
          this.isAddEditToggle = false;
        }
      });
    });

  }

  public openDetailModal(id: number) {
    this.onLevelChange(id);
    this.selectedDetailModalLoaded = true;
    this.detailModal.show();
  }

  public hideDetailModal() {
    this.ledgerAllowanceAmountList = [];
    this.isAddEditToggle = false;
    this.selectedDetailModalLoaded = false;
    this.detailModal.hide();
  }

  public checkMoney(amt: string) {
    this.validFormat = Utilities.isDecimal(amt);
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
    this.getAllAllowanceInfo(this.filterObj);
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
    return true;
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.getAllAllowanceInfo(this.filterObj);
  }
}
