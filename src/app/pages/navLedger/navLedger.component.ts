import { Component, ViewChild, OnInit, Injectable, ChangeDetectorRef } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { NavLedgerService, CompanyService, HRMLedgerService } from '../../services/BaseService';
import { INavLedger, IPaginationViewModel, ICompany, IHRMLedger } from '../../models/Models';

import { IFilterViewModel, NavViewModel } from '../../models/ViewModels';
import { ModalDirective } from 'ngx-bootstrap';
import { NavMappingService } from '../../services/nav-mapping.service';

@Component({
  selector: 'nav-ledger',
  templateUrl: 'navLedger.component.html'
})
export class NavLedgerComponent implements OnInit {

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selected: string;
  output: string;

  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirectiveDelete: any;

  navOptions: NavViewModel[] = [];


  isAddNavLedger: boolean = false;
  isExpanded: boolean = false;
  InputNavLedger: INavLedger = <INavLedger>{};
  requiredParentId: number;
  closeForm: boolean = true;
  isEditNavLedger: boolean = false;
  selectedModalLoaded: boolean = false;
  deleteModalLoaded: boolean = false;
  deleteId: number;

  filterObj?: IFilterViewModel;

  svNavLedgerList: INavLedger[] = [];
  navLedgerList: INavLedger[] = [];
  qaNavLedgerList: INavLedger[] = [];
  tempNavLedgerList: INavLedger[] = [];
  nameList: INavLedger[] = [];

  companies: ICompany[] = [];
  selectedCompanyId: number;

  ledgers: IHRMLedger[] = [];
  selectedLedgerId: number;

  parentId: number;

  pagination?: IPaginationViewModel = {
    CurrentPage: 1,
    MaxItems: 50,
    ItemsPerPage: 50,
    TotalPage: 0
  };

  constructor(
    public navLedgerService: NavLedgerService,
    private navMappingService: NavMappingService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private companyService: CompanyService,
    private ledgerService: HRMLedgerService,
    private ref: ChangeDetectorRef
  ) {
    this.getCompanies();
    this.getLedgers();
    this.getNavLedgers();
    this.filterObj = { Name: '', Sort: '' }
  }

  ngOnInit() {
    this.filterObj = { Name: '', Sort: '' }
  }

  getCompanies() {
    let query = '$filter=ParentId eq null';
    this.companyService.getAll(query).subscribe((data: ICompany[]) => {
      this.companies = data;
    })
  }

  getLedgers() {
    let query = '$filter=MultipleNav eq true';
    this.ledgerService.getAll(query).subscribe((data: IHRMLedger[]) => {
      this.ledgers = data;
    })
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * to open add modal
   */
  openAddModal() {
    this.InputNavLedger.ALId = this.selectedLedgerId;
    this.isAddNavLedger = true;
    this.isEditNavLedger = false;
    this.selectedModalLoaded = true;
    if (this.childModal != undefined) {
      this.childModal.config.backdrop = false;
    }
    this.childModal.show();
  }


  /**
   * to open edit modal
   */
  openEditModal() {
    this.isEditNavLedger = true;
    this.isAddNavLedger = false;
    this.selectedModalLoaded = true;
    if (this.childModal != undefined) {
      this.childModal.config.backdrop = false;
    }
    this.childModal.show();
  }


  /**
   * to open delete modal
   */
  openDeleteModal(Id: number) {
    this.deleteId = Id;
    this.deleteModalLoaded = true;
    if (this.deleteModal != undefined) {
      this.deleteModal.config.backdrop = false;
    }
    this.deleteModal.show();
  }


  /**
   * to hide add/edit modal
   */
  public hideChildModal(): void {
    this.childModal.hide();
    this.isAddNavLedger = false;
    this.isEditNavLedger = false;
    this.InputNavLedger = <INavLedger>{};

  }


  /**
   * to hide delete modal
   */

  public hideDeleteChildModal(): void {
    this.deleteModal.hide();
  }


  resetPagination() {
    this.pagination = {
      CurrentPage: 1,
      MaxItems: 50,
      ItemsPerPage: 50,
      TotalPage: 0
    };
  }

  getPaginatedNavLedgerResult(filterObj?: IFilterViewModel) {
    if (this.selectedCompanyId != null) {
      let query = `$filter=CompanyId eq ${this.selectedCompanyId} and ALId eq ${this.selectedLedgerId}`;
      this.navLedgerService.getAll(query).subscribe((data: INavLedger[]) => {
        this.svNavLedgerList = [...data];
        this.navLedgerList = [...this.svNavLedgerList];
        this.filter(filterObj);
        this.pagination.TotalPage = Math.ceil(this.svNavLedgerList.length / this.pagination.ItemsPerPage);
        this.pagination.TotalItems = this.svNavLedgerList.length;
        this.navLedgerList = this.svNavLedgerList.slice((this.pagination.CurrentPage * this.pagination.ItemsPerPage) - this.pagination.ItemsPerPage, this.pagination.CurrentPage * this.pagination.ItemsPerPage)
      })
    }
  }



  getNavMappingItems() {
    this.navOptions = [];

    if (this.selectedCompanyId && this.selectedLedgerId) {
      let query = `companyId=${this.selectedCompanyId}`;
      this.navMappingService.getNMHRMLedger(query).subscribe((data: NavViewModel[]) => {
        this.navOptions = data;
        this.getNavLedgers();
      }, (err) => {
        this.navOptions = [];
        var toastOptions: ToastOptions = {
          title: "Error",
          msg: "Connection Timed Out",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.error(toastOptions);
      });
    }
  }

  /**
  @summary : to get list of all NavLedger list  
   * @param NavLedgerId
   */
  getNavLedgers(filterObj?: IFilterViewModel) {
    //this.resetPagination();
    this.getPaginatedNavLedgerResult(filterObj);
  }

  filter(filterObj?: IFilterViewModel) {
    this.tempNavLedgerList = this.svNavLedgerList;

    if (filterObj != null) {
      if (filterObj.Name != null && filterObj.Name != '') {
        this.navLedgerList = this.svNavLedgerList.filter(x => x.LedgerName.toLowerCase().startsWith(filterObj.Name.toLowerCase()));
      } else {
        this.navLedgerList = this.svNavLedgerList;
      }
      if (filterObj.Sort == 'true') {
        this.navLedgerList = this.svNavLedgerList;
      }
      if (filterObj.Sort == 'true') {
        this.navLedgerList = this.navLedgerList.sort(function (a, b) {
          if (a.LedgerName < b.LedgerName) return -1;
          if (a.LedgerName > b.LedgerName) return 1;
          return 0;
        });
      }
      else if (filterObj.Sort == 'false') {
        this.navLedgerList = this.navLedgerList.sort(function (a, b) {
          if (a.LedgerName < b.LedgerName) return 1;
          if (a.LedgerName > b.LedgerName) return -1;
          return 0;
        });
      }
      else {
        this.navLedgerList = this.tempNavLedgerList;
      }
    }
  }

  public filterHome(pagination: number = 1) {
    this.pagination.CurrentPage = pagination <= 1 ? 1 : pagination > this.pagination.TotalPage ? this.pagination.TotalPage : pagination;
    this.getNavLedgers(this.filterObj);
  }

  //Add NavLedger
  public saveNavLedger() {
    this.InputNavLedger.CompanyId = this.selectedCompanyId;
    this.navLedgerService.post(this.InputNavLedger)
      .subscribe(() => {
        var toastOptions: ToastOptions = {
          title: "Success",
          msg: "Nav Ledger has been successfully Added",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);

        this.InputNavLedger = <INavLedger>{};
        this.svNavLedgerList = [];
        this.getNavLedgers();
        this.isAddNavLedger = false;
        this.selectedModalLoaded = false;
        this.hideChildModal();
      });

  }

  //Edit NavLedger

  public getNavLedger(id: number) {
    this.openEditModal();
    this.navLedgerService.get(id)
      .subscribe((div: any) => {
        this.InputNavLedger = div;
      });
  }

  public editNavLedger(navLedgerObj: INavLedger) {
    this.navLedgerService.put(navLedgerObj.Id, navLedgerObj)
      .subscribe(() => {

        var toastOptions: ToastOptions = {
          title: "Success",
          msg: "Nav Ledger has been successfully Edited",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.success(toastOptions);

        this.isEditNavLedger = false;
        this.svNavLedgerList = [];
        this.InputNavLedger = <INavLedger>{};
        this.getNavLedgers();
        this.selectedModalLoaded = false;
        this.hideChildModal();

      }, (err) => {

        var toastOptions: ToastOptions = {
          title: "Error",
          msg: "Nav Ledger was not Edited",
          showClose: true,
          timeout: 5000,
          theme: 'bootstrap'
        };
        this.toastyService.error(toastOptions);
      });

  }

  ////Delete NavLedger
  //public deleteNavLedger() {
  //  this.navLedgerService.delete(this.deleteId)
  //    .subscribe(() => {
  //      this.svNavLedgerList = [];
  //      //this.InputNavLedger = <INavLedger>{};
  //      this.getNavLedgers();
  //      this.deleteModalLoaded = false;
  //      this.hideChildModal();
  //    });
  //}

}
