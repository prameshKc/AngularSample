import { Component, Injectable, ViewChild, OnInit } from '@angular/core';
import {
  JobCodeService, UnitService, ClientService,
  FiscalYearService, ServiceTypeNameService, ServiceTypeService,
  CommonService
} from '../../services/BaseService';
import { IJobCodeGenerate, IUnit, IClient, IFiscalYear, IServiceTypeName, IServiceType, IPagination } from '../../models/Models';
import { IFgetFiscialyearID_Result, IFilterByUnitVM, IClientAndJobCodeVM } from '../../models/ViewModels';

import { ModalDirective } from 'ngx-bootstrap';
import { ToastyService, ToastyConfig } from 'ngx-toasty';

@Component({
  templateUrl: 'jobCode.component.html'
})
export class JobCodeComponent {
  InputJobCode: IJobCodeGenerate = <IJobCodeGenerate>{};
  jobArray: string[] = [];
  unitList: IUnit[] = [];
  clientList: IClient[] = [];
  fiscalYearList: IFiscalYear[] = [];
  serviceTypeNameList: IServiceTypeName[] = [];
  serviceTypeList: IServiceType[] = [];
  unitcode: string;
  clientCode: string;
  fiscalYearDetails: IFgetFiscialyearID_Result[] = [];

  InputJobList: IJobCodeGenerate[] = [];
  InputJob: IJobCodeGenerate = <IJobCodeGenerate>{};
  userId: string;
  fiscalYearInAD: string;
  invalidJobCode: boolean;
  jobCodeinDB: string[] = [];
  filterByUnit: number;
  filterByClient: number;
  filterByServiceType: number;
  filterByFiscalYear: number;
  jobCodeList: IJobCodeGenerate[] = [];
  unitName: string;
  filteredbyUnit: IFilterByUnitVM = <IFilterByUnitVM>{};
  filteredbyUnit2: IFilterByUnitVM = <IFilterByUnitVM>{};
  filteredbyUnitList: IFilterByUnitVM[] = [];
  clientCodeArray: number[];
  jobCodeDisplay: string;

  clientAndjobList: IClientAndJobCodeVM[] = [];
  clientAndJob: IClientAndJobCodeVM;
  JobCodeSearch: string;
  isNotEightDigit: boolean = false;
  incorrectJobCode: boolean = false;
  isDisable: boolean = false;
  pagination: IPagination;

  @ViewChild('jobCodeModal', { static: false }) public jobCodeModal: ModalDirective
  @ViewChild('modal', { static: false })
  ModalDirective: any;
  selectedModalLoaded: boolean = false;

  constructor(
    public jobCodeService: JobCodeService,
    public unitService: UnitService,
    public clientService: ClientService,
    public fiscalYearService: FiscalYearService,
    public serviceTypeNameService: ServiceTypeNameService,
    public serviceTypeService: ServiceTypeService,
    public commonService: CommonService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig) {
    this.userId = localStorage.getItem('UserId');
    this.pagination = <IPagination>{
      CurrentPage: 1,
      ItemsPerPage: 50,
      TotalItems: 0,
      SortBy: null
    };
    this.getAllUnit();
    this.getAllClient();
    this.getAllFiscalYear();
    this.getAllServiceTypeName();
  }

  public getAllUnit() {
    this.unitService.getAll().subscribe((list: IUnit[]) => {
      this.unitList = list;
    });
  }

  public getAllClient() {
    this.clientService.getAll().subscribe((list: IClient[]) => {
      this.clientList = list;
    });
  }

  public getAllFiscalYear() {
    let date = new Date();
    this.commonService.getFiscalYear(date, 5).subscribe((one: IFgetFiscialyearID_Result[]) => {
      this.fiscalYearList = one;
      this.getFiscalYear().then((data) => {
        this.fiscalYearDetails = data;
        this.filterByFiscalYear = this.fiscalYearDetails[0].FYID;
        this.filterByUnit = 0;
        this.filterByClient = 0;
        this.filterByServiceType = 0;
        this.onFilter();
      });
    });
    //this.fiscalYearService.getAll().subscribe((list: IFiscalYear[]) => {
    //    this.fiscalYearList = list;

    //    this.getFiscalYear().then((data) => {
    //        this.fiscalYearDetails = data;
    //        this.filterByFiscalYear = this.fiscalYearDetails[0].FYID;
    //        this.filterByUnit = 0;
    //        this.filterByClient = 0;
    //        this.filterByServiceType = 0;
    //        this.onFilter();
    //    });
    //});
  }

  public getFiscalYear(): Promise<IFgetFiscialyearID_Result[]> {
    return new Promise<IFgetFiscialyearID_Result[]>((resolve) => {
      let date = new Date();
      this.commonService.getFiscalYear(date, 0).subscribe((one: IFgetFiscialyearID_Result[]) => {
        resolve(one);
      });
    });

  }

  public getAllServiceTypeName() {
    this.serviceTypeNameService.getAll().subscribe((list: IServiceTypeName[]) => {
      this.serviceTypeNameList = list;
    });
  }

  public onUnitChange() {
    this.InputJobCode.ServiceTypeNameId = null;
  }

  public onClientChange() {
    this.InputJobCode.ServiceTypeNameId = null;
  }

  public onFYSelect() {
    this.InputJobCode.ServiceTypeNameId = null;
  }

  public onServiceTypeChange(event: any, unitId: number, clientId: number) {
    this.getUnitCode(unitId).then((code) => {
      this.unitcode = code;
      this.getClientCode(clientId).then((code) => {
        this.clientCode = code;
        //this.getFiscalYear().then((data) => {
        //this.fiscalYearDetails = data;
        //let splitData = data[0].FYNameAD;
        //let splitedData = splitData.split('/');
        //this.fiscalYearInAD = splitedData[1];
        let splitData = this.fiscalYearList.filter(x => x.FYID == this.filterByFiscalYear)[0].FYNameAD;
        let splitedData = splitData.split('/');
        this.fiscalYearInAD = splitedData[1];
        this.getServiceType(event).then((codeList) => {
          this.serviceTypeList = codeList;
          this.InputJobList = [];
          this.serviceTypeList.forEach(item => {
            this.InputJob = {
              Id: 0,
              UnitCodeId: this.InputJobCode.UnitCodeId,
              ClientCodeId: this.InputJobCode.ClientCodeId,
              FiscalYearId: this.fiscalYearDetails[0].FYID,
              ServiceTypeNameId: this.InputJobCode.ServiceTypeNameId,
              JobCode: this.unitcode + this.clientCode + this.fiscalYearInAD + item.Code,
              Status: true,
              PostedBy: this.userId,
              PostedOn: new Date(),
              ModifiedBy: null,
              ModifiedOn: null
            }
            this.InputJobList.push(this.InputJob);
          })
          this.checkInvalidJobCode(this.InputJobList[0].JobCode).then((list) => {
            if (list.length > 0) {
              this.invalidJobCode = true;
              this.InputJobList = [];
              list.forEach(item => {
                this.InputJobList.push(item);
              })
            }
            else {
              this.invalidJobCode = false;
            }
          });
        });
        //});
      });
    });
  }

  public getUnitCode(id: number): Promise<string> {
    return new Promise<string>((resolve) => {
      let code: string;
      this.unitService.get(id).subscribe((one: IUnit) => {
        code = one.UnitCode;
        resolve(code);
      });
    });
  }

  public getClientCode(id: number): Promise<string> {
    return new Promise<string>((resolve) => {
      let code: string;
      this.clientService.get(id).subscribe((one: IClient) => {
        code = one.ClientCode;
        resolve(code);
      });
    });
  }

  public getServiceType(id: number): Promise<IServiceType[]> {
    return new Promise<IServiceType[]>((resolve) => {
      let query = `$filter=ServiceTypeId eq ${id}`;
      let codeList: IServiceType[];
      this.serviceTypeService.getAll(query).subscribe((list: IServiceType[]) => {
        codeList = list;
        resolve(codeList);
      });
    });
  }

  public openJobCodeModal() {
    this.selectedModalLoaded = true;
    this.jobCodeModal.show();
  }

  public hideJobCodeModal() {
    this.selectedModalLoaded = false;
    this.invalidJobCode = false;
    this.InputJobList = [];
    this.InputJobCode = <IJobCodeGenerate>{};
    this.getAllFiscalYear();
    this.jobCodeModal.hide();
  }

  public saveJobCode() {
    this.InputJobList.forEach(item => {
      let saveItem: IJobCodeGenerate = Object.assign({}, item);
      this.jobCodeService.post(saveItem).subscribe(() => {
        this.InputJobList = [];
        this.InputJobCode = <IJobCodeGenerate>{};
        this.onFilter();
        this.hideJobCodeModal();
      });
    })
  }

  public checkInvalidJobCode(code: string): Promise<IJobCodeGenerate[]> {
    return new Promise<IJobCodeGenerate[]>((resolve) => {
      let jobcode = code.match(/.{1,2}/g);
      let checkJobCode = jobcode[0] + jobcode[1] + jobcode[2];
      let query = `$filter=startswith(JobCode,'${checkJobCode}')`;
      this.jobCodeService.getAll(query).subscribe((list: IJobCodeGenerate[]) => {
        resolve(list);
      });
    });
  }

  public onFilter(filterObj?: number) {
    if (filterObj != null) {
      let query = `$expand=Unit,Client,ServiceTypeName&$filter=startswith(JobCode,'${filterObj}')`;
      let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
      query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

      this.filteredbyUnitList = [];
      this.jobCodeService.getAll(query).subscribe((list: any) => {
        this.jobCodeList = list.value;
        this.pagination = {
          ItemsPerPage: this.pagination.ItemsPerPage,
          TotalItems: <number>(list["odata.count"]),
          CurrentPage: this.pagination.CurrentPage,
          SortBy: this.pagination.SortBy
        };
        let newJobCodeList: string[] = [];
        this.clientAndjobList = [];
        this.clientCodeArray = [];
        this.jobCodeList.forEach(item => {
          var unique = this.clientCodeArray.filter(x => x == item.ClientCodeId).length;

          if (unique == 0) {
            this.clientCodeArray.push(item.ClientCodeId);
            this.filteredbyUnit2 = {
              UnitCodeId: item.UnitCodeId,
              ClientCodeId: item.ClientCodeId,
              ServiceTypeNameId: item.ServiceTypeNameId,
              UnitName: item.Unit.UnitName,
              ClientName: item.Client.CompanyName,
              ServiceTypeName: item.ServiceTypeName.TypeName,
              JobCode: this.jobCodeList.filter(x => x.ClientCodeId == item.ClientCodeId)
            }
            this.filteredbyUnitList.push(this.filteredbyUnit2);
          }
        })
      });

    }
    else {
      if (this.filterByUnit != 0 && this.filterByClient == 0 && this.filterByServiceType == 0 && this.filterByFiscalYear != null) {
        let query = `$expand=Unit,Client,ServiceTypeName&$filter=UnitCodeId eq ${this.filterByUnit} and FiscalYearId  eq ${this.filterByFiscalYear} and Status eq true&$orderby=Id`;
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        this.filteredbyUnitList = [];
        this.jobCodeService.getAll(query).subscribe((list: any) => {
          this.jobCodeList = list.value;
          this.pagination = {
            ItemsPerPage: this.pagination.ItemsPerPage,
            TotalItems: <number>(list["odata.count"]),
            CurrentPage: this.pagination.CurrentPage,
            SortBy: this.pagination.SortBy
          };
          let newJobCodeList: string[] = [];
          this.clientAndjobList = [];
          this.clientCodeArray = [];
          this.jobCodeList.forEach(item => {
            var unique = this.clientCodeArray.filter(x => x == item.ClientCodeId).length;

            if (unique == 0) {
              this.clientCodeArray.push(item.ClientCodeId);
              this.filteredbyUnit2 = {
                UnitCodeId: item.UnitCodeId,
                ClientCodeId: item.ClientCodeId,
                ServiceTypeNameId: item.ServiceTypeNameId,
                UnitName: item.Unit.UnitName,
                ClientName: item.Client.CompanyName,
                ServiceTypeName: item.ServiceTypeName.TypeName,
                JobCode: this.jobCodeList.filter(x => x.ClientCodeId == item.ClientCodeId)
              }
              this.filteredbyUnitList.push(this.filteredbyUnit2);
            }
          })
        });
      }
      if (this.filterByUnit == 0 && this.filterByClient != 0 && this.filterByServiceType == 0 && this.filterByFiscalYear != null) {
        let query = `$expand=Unit,Client,ServiceTypeName&$filter=ClientCodeId eq ${this.filterByClient} and FiscalYearId  eq ${this.filterByFiscalYear} and Status eq true&$orderby=Id`;
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        this.filteredbyUnitList = [];
        this.jobCodeService.getAll(query).subscribe((list: any) => {
          this.jobCodeList = list.value;
          this.pagination = {
            ItemsPerPage: this.pagination.ItemsPerPage,
            TotalItems: <number>(list["odata.count"]),
            CurrentPage: this.pagination.CurrentPage,
            SortBy: this.pagination.SortBy
          };
          let newJobCodeList: string[] = [];
          this.clientAndjobList = [];
          this.clientCodeArray = [];
          this.jobCodeList.forEach(item => {
            var unique = this.clientCodeArray.filter(x => x == item.UnitCodeId).length;

            if (unique == 0) {
              this.clientCodeArray.push(item.UnitCodeId);
              this.filteredbyUnit2 = {
                UnitCodeId: item.UnitCodeId,
                ClientCodeId: item.ClientCodeId,
                ServiceTypeNameId: item.ServiceTypeNameId,
                UnitName: item.Unit.UnitName,
                ClientName: item.Client.CompanyName,
                ServiceTypeName: item.ServiceTypeName.TypeName,
                JobCode: this.jobCodeList.filter(x => x.UnitCodeId == item.UnitCodeId)
              }
              this.filteredbyUnitList.push(this.filteredbyUnit2);
            }
          })
        });
      }
      if (this.filterByUnit == 0 && this.filterByClient == 0 && this.filterByServiceType != 0 && this.filterByFiscalYear != null) {
        let query = `$expand=Unit,Client,ServiceTypeName&$filter=ServiceTypeNameId eq ${this.filterByServiceType} and FiscalYearId  eq ${this.filterByFiscalYear} and Status eq true&$orderby=Id`;
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        this.filteredbyUnitList = [];
        this.jobCodeService.getAll(query).subscribe((list: any) => {
          this.jobCodeList = list.value;
          this.pagination = {
            ItemsPerPage: this.pagination.ItemsPerPage,
            TotalItems: <number>(list["odata.count"]),
            CurrentPage: this.pagination.CurrentPage,
            SortBy: this.pagination.SortBy
          };
          let newJobCodeList: string[] = [];
          this.clientAndjobList = [];
          this.clientCodeArray = [];
          this.jobCodeList.forEach(item => {
            let count = 0;

            var unique = this.filteredbyUnitList.filter(x => x.UnitCodeId == item.UnitCodeId && x.ClientCodeId == item.ClientCodeId).length;

            if (unique == 0) {
              this.filteredbyUnit2 = {
                UnitCodeId: item.UnitCodeId,
                ClientCodeId: item.ClientCodeId,
                ServiceTypeNameId: item.ServiceTypeNameId,
                UnitName: item.Unit.UnitName,
                ClientName: item.Client.CompanyName,
                ServiceTypeName: item.ServiceTypeName.TypeName,
                JobCode: this.jobCodeList.filter(x => x.UnitCodeId == item.UnitCodeId && x.ClientCodeId == item.ClientCodeId)
              }
              this.filteredbyUnitList.push(this.filteredbyUnit2);
            }
          })
        });
      }
      if (this.filterByUnit != 0 && this.filterByClient != 0 && this.filterByServiceType == 0 && this.filterByFiscalYear != null) {
        let query = `$expand=Unit,Client,ServiceTypeName&$filter=UnitCodeId eq ${this.filterByUnit} and ClientCodeId eq ${this.filterByClient}  and FiscalYearId  eq ${this.filterByFiscalYear} and Status eq true&$orderby=Id`;
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        this.filteredbyUnitList = [];
        this.jobCodeService.getAll(query).subscribe((list: any) => {
          this.jobCodeList = list.value;
          this.pagination = {
            ItemsPerPage: this.pagination.ItemsPerPage,
            TotalItems: <number>(list["odata.count"]),
            CurrentPage: this.pagination.CurrentPage,
            SortBy: this.pagination.SortBy
          };
          let newJobCodeList: string[] = [];
          this.clientAndjobList = [];
          this.clientCodeArray = [];
          this.jobCodeList.forEach(item => {
            var unique = this.clientCodeArray.filter(x => x == item.ClientCodeId).length;

            if (unique == 0) {
              this.clientCodeArray.push(item.ClientCodeId);
              this.filteredbyUnit2 = {
                UnitCodeId: item.UnitCodeId,
                ClientCodeId: item.ClientCodeId,
                ServiceTypeNameId: item.ServiceTypeNameId,
                UnitName: item.Unit.UnitName,
                ClientName: item.Client.CompanyName,
                ServiceTypeName: item.ServiceTypeName.TypeName,
                JobCode: this.jobCodeList.filter(x => x.ClientCodeId == item.ClientCodeId)
              }
              this.filteredbyUnitList.push(this.filteredbyUnit2);
            }
          })
        });
      }
      if (this.filterByUnit != 0 && this.filterByClient == 0 && this.filterByServiceType != 0 && this.filterByFiscalYear != null) {
        let query = `$expand=Unit,Client,ServiceTypeName&$filter=UnitCodeId eq ${this.filterByUnit} and ServiceTypeNameId eq ${this.filterByServiceType}  and FiscalYearId  eq ${this.filterByFiscalYear} and Status eq true&$orderby=Id`;
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        this.filteredbyUnitList = [];
        this.jobCodeService.getAll(query).subscribe((list: any) => {
          this.jobCodeList = list.value;
          this.pagination = {
            ItemsPerPage: this.pagination.ItemsPerPage,
            TotalItems: <number>(list["odata.count"]),
            CurrentPage: this.pagination.CurrentPage,
            SortBy: this.pagination.SortBy
          };
          let newJobCodeList: string[] = [];
          this.clientAndjobList = [];
          this.clientCodeArray = [];
          this.jobCodeList.forEach(item => {
            var unique = this.clientCodeArray.filter(x => x == item.ClientCodeId).length;

            if (unique == 0) {
              this.clientCodeArray.push(item.ClientCodeId);
              this.filteredbyUnit2 = {
                UnitCodeId: item.UnitCodeId,
                ClientCodeId: item.ClientCodeId,
                ServiceTypeNameId: item.ServiceTypeNameId,
                UnitName: item.Unit.UnitName,
                ClientName: item.Client.CompanyName,
                ServiceTypeName: item.ServiceTypeName.TypeName,
                JobCode: this.jobCodeList.filter(x => x.ClientCodeId == item.ClientCodeId)
              }
              this.filteredbyUnitList.push(this.filteredbyUnit2);
            }
          })
        });
      }
      if (this.filterByUnit == 0 && this.filterByClient != 0 && this.filterByServiceType != 0 && this.filterByFiscalYear != null) {
        let query = `$expand=Unit,Client,ServiceTypeName&$filter=ClientCodeId eq ${this.filterByClient} and ServiceTypeNameId eq ${this.filterByServiceType}  and FiscalYearId  eq ${this.filterByFiscalYear} and Status eq true&$orderby=Id`;
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        this.filteredbyUnitList = [];
        this.jobCodeService.getAll(query).subscribe((list: any) => {
          this.jobCodeList = list.value;
          this.pagination = {
            ItemsPerPage: this.pagination.ItemsPerPage,
            TotalItems: <number>(list["odata.count"]),
            CurrentPage: this.pagination.CurrentPage,
            SortBy: this.pagination.SortBy
          };
          let newJobCodeList: string[] = [];
          this.clientAndjobList = [];
          this.clientCodeArray = [];
          this.jobCodeList.forEach(item => {
            var unique = this.clientCodeArray.filter(x => x == item.UnitCodeId).length;

            if (unique == 0) {
              this.clientCodeArray.push(item.UnitCodeId);
              this.filteredbyUnit2 = {
                UnitCodeId: item.UnitCodeId,
                ClientCodeId: item.ClientCodeId,
                ServiceTypeNameId: item.ServiceTypeNameId,
                UnitName: item.Unit.UnitName,
                ClientName: item.Client.CompanyName,
                ServiceTypeName: item.ServiceTypeName.TypeName,
                JobCode: this.jobCodeList.filter(x => x.UnitCodeId == item.UnitCodeId)
              }
              this.filteredbyUnitList.push(this.filteredbyUnit2);
            }
          })
        });
      }
      if (this.filterByUnit != 0 && this.filterByClient != 0 && this.filterByServiceType != 0 && this.filterByFiscalYear != null) {
        let query = `$expand=Unit,Client,ServiceTypeName&$filter=ClientCodeId eq ${this.filterByClient} and UnitCodeId eq ${this.filterByUnit} and ServiceTypeNameId eq ${this.filterByServiceType}  and FiscalYearId  eq ${this.filterByFiscalYear} and Status eq true&$orderby=Id`;
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        this.filteredbyUnitList = [];
        this.jobCodeService.getAll(query).subscribe((list: any) => {
          this.jobCodeList = list.value;
          this.pagination = {
            ItemsPerPage: this.pagination.ItemsPerPage,
            TotalItems: <number>(list["odata.count"]),
            CurrentPage: this.pagination.CurrentPage,
            SortBy: this.pagination.SortBy
          };
          let newJobCodeList: string[] = [];
          this.clientAndjobList = [];
          this.clientCodeArray = [];
          this.jobCodeList.forEach(item => {
            var unique = this.clientCodeArray.filter(x => x == item.UnitCodeId).length;

            if (unique == 0) {
              this.clientCodeArray.push(item.UnitCodeId);
              this.filteredbyUnit2 = {
                UnitCodeId: item.UnitCodeId,
                ClientCodeId: item.ClientCodeId,
                ServiceTypeNameId: item.ServiceTypeNameId,
                UnitName: item.Unit.UnitName,
                ClientName: item.Client.CompanyName,
                ServiceTypeName: item.ServiceTypeName.TypeName,
                JobCode: this.jobCodeList.filter(x => x.UnitCodeId == item.UnitCodeId)
              }
              this.filteredbyUnitList.push(this.filteredbyUnit2);
            }
          })
        });
      }
      if (this.filterByUnit == 0 && this.filterByClient == 0 && this.filterByServiceType == 0 && this.filterByFiscalYear != null) {
        let query = `$expand=Unit,Client,ServiceTypeName&$filter=FiscalYearId  eq ${this.filterByFiscalYear} and Status eq true&$orderby=Id`;
        let skipCount = (this.pagination.ItemsPerPage * (this.pagination.CurrentPage - 1));
        query += `&$inlinecount=allpages&$skip=${skipCount}&$top=${this.pagination.ItemsPerPage}`;

        this.filteredbyUnitList = [];
        this.jobCodeService.getAll(query).subscribe((list: any) => {
          this.jobCodeList = list.value;
          this.pagination = {
            ItemsPerPage: this.pagination.ItemsPerPage,
            TotalItems: <number>(list["odata.count"]),
            CurrentPage: this.pagination.CurrentPage,
            SortBy: this.pagination.SortBy
          };
          let newJobCodeList: string[] = [];
          this.clientAndjobList = [];
          this.clientCodeArray = [];
          this.jobCodeList.forEach(item => {
            let count = 0;

            var unique = this.filteredbyUnitList.filter(x => x.UnitCodeId == item.UnitCodeId && x.ClientCodeId == item.ClientCodeId && x.ServiceTypeNameId == item.ServiceTypeNameId).length;

            if (unique == 0) {
              this.filteredbyUnit2 = {
                UnitCodeId: item.UnitCodeId,
                ClientCodeId: item.ClientCodeId,
                ServiceTypeNameId: item.ServiceTypeNameId,
                UnitName: item.Unit.UnitName,
                ClientName: item.Client.CompanyName,
                ServiceTypeName: item.ServiceTypeName.TypeName,
                JobCode: this.jobCodeList.filter(x => x.UnitCodeId == item.UnitCodeId && x.ClientCodeId == item.ClientCodeId && x.ServiceTypeNameId == item.ServiceTypeNameId)
              }
              this.filteredbyUnitList.push(this.filteredbyUnit2);
            }
          })
        });
      }
    }

  }

  public onJobCodeChange(event: any) {
    if (event == null || event == "") {
      this.isDisable = false;
      this.onFilter();
    }
    else {
      this.isDisable = true;
      if (event.length > 8) {
        this.isNotEightDigit = true;
      }
      let query = `$filter=startswith(JobCode,'${event}')`;
      this.jobCodeService.getAll(query)
        .subscribe((list: IJobCodeGenerate[]) => {
          if (list.length > 0) {
            this.incorrectJobCode = false;
            this.onFilter(event);
          }
          else {
            this.incorrectJobCode = true;
          }
        });
    }
  }

  public reset() {
    this.JobCodeSearch = null;
    this.filterByFiscalYear = this.fiscalYearDetails[0].FYID;
    this.filterByUnit = 0;
    this.filterByClient = 0;
    this.filterByServiceType = 0;
    this.isDisable = false;
    this.onFilter();
  }

  onPageSelect(pagination: IPagination) {
    this.pagination = pagination;
    this.onFilter();
  }

}
