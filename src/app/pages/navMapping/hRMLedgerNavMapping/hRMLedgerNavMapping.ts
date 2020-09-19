import { Component, Input, SimpleChanges } from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions } from 'ngx-toasty';
import { IHRMLedger, ICompany, INavLedger } from '../../../models/Models';
import { HRMLedgerService, CommonService, NavLedgerService } from '../../../services/BaseService';
import { NavViewModel } from '../../../models/ViewModels';
import { NavMappingService } from '../../../services/nav-mapping.service';

@Component({
  selector: 'HRMLedger-NavMapping',
  templateUrl: 'hRMLedgerNavMapping.html'
})
export class HRMLedgerNavMappingComponent {
  @Input() CompanyId: number;

  ledgerList: IHRMLedger[] = [];
  changeLedgerList: IHRMLedger[] = [];
  navOptions: NavViewModel[] = [];
  isLoading: boolean = false;
  navLedgerEnabled: boolean = false;


  constructor(
    public navMappingService: NavMappingService,
    private hrmLedgerService: HRMLedgerService,
    private commonService: CommonService,
    private toastyService: ToastyService
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    this.changeLedgerList = [];
    this.getParamValue();
    this.getNavMappingItems();
  }

  getParamValue() {
    this.commonService.getPValue('MBSNM').subscribe(data => {
      this.navLedgerEnabled = data == 'true' ? true : false;
      this.getHRMLedgerList();
    })
  }

  getNavMappingItems() {
    this.navOptions = [];

    if (this.CompanyId) {
      let query = `companyId=${this.CompanyId}`;
      this.navMappingService.getNMHRMLedger(query).subscribe((data: NavViewModel[]) => {
        this.navOptions = data;
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

  getHRMLedgerList() {
    let query = this.navLedgerEnabled == true ? `$filter=MultipleNav ne true` : '';
    query += `&$expand=NavLedger`
    this.hrmLedgerService.getAll(query).subscribe((data: IHRMLedger[]) => {
      this.ledgerList = data.map(data => {
        data.NavLedger = data.NavLedger.filter(x => x.CompanyId == this.CompanyId).map((nlitem) => {
          data.Nav_Code = nlitem.NavCode ? nlitem.NavCode : '-1';
          return nlitem;
        });
        data.Nav_Code = data.Nav_Code ? data.Nav_Code : '-1';

        return data;
      });
    });
  }

  updateHRMLedgerNav(code: string, item?: IHRMLedger) {
    this.ledgerList.map(obj => {
      if (obj.ALId == item.ALId) {
        obj.Nav_Code = code;
      }
      return obj;
    })

    if (this.changeLedgerList.filter(x => x.ALId == item.ALId).length > 0) {
      this.changeLedgerList.splice(this.changeLedgerList.lastIndexOf(item), 1);
    }

    item.Nav_Code = code;
    this.changeLedgerList.push(item);
    console.log(this.changeLedgerList);

  }

  submitChanges() {
    let saveListItems: INavLedger[] = [];
    this.changeLedgerList.map((item) => {
      saveListItems.push({
        Id: item.NavLedger.filter(x => x.CompanyId == this.CompanyId).length > 0 ? item.NavLedger.filter(x => x.CompanyId == this.CompanyId)[0].Id : 0,
        ALId: item.ALId,
        CompanyId: Number(this.CompanyId),
        NavCode: item.Nav_Code,
        LedgerName: item.ALDesc
      })
    })


    this.navMappingService.updateLedgerNav(saveListItems).subscribe((data) => {
      var toastOptions: ToastOptions = {
        title: "Success",
        msg: `Ledgers has been successfully mapped.`,
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.success(toastOptions);
    }, (err) => {

      var toastOptions: ToastOptions = {
        title: "Error",
        msg: "Ledgers were not Edited",
        showClose: true,
        timeout: 5000,
        theme: 'bootstrap'
      };
      this.toastyService.error(toastOptions);
    });
  }

  resetChanges() {
    this.ledgerList = [];
    this.changeLedgerList = [];
    this.getHRMLedgerList();
  }
}
