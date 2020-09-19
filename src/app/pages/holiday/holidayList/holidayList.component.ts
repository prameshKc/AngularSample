import { Component, ViewChild, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ngx-toasty';
import { HolidayListService, HolidayListDetailsService, BSADCalService, EmployeeHolidayListDataService } from '../../../services/BaseService';
import {
    IHolidayList, IHolidayListDetails, ICheckBoxViewModel,
    IBSADCal, IFGetHolidayListByCalendarYear_Result, IFHolidayListDetail
} from '../../../models/Models';
import { DatePickerFunctions } from '../../../shared/datepicker/modules/datepickerFunctions';
import { ModalDirective } from 'ngx-bootstrap';
import { IInputDateVM, IDatePickerOptionsVM } from '../../../shared/datepicker/models/datepickerVM';

@Component({
    selector: 'holidayList',
    templateUrl: 'holidayList.component.html',
    styleUrls: ['holidayList.component.css']
})
export class HolidayListComponent {

  @ViewChild('childModal', { static: false }) public childModal: ModalDirective
  @ViewChild('modal', { static: false })
    ModalDirective: any;

  @ViewChild('detailModal', { static: false }) public detailModal: ModalDirective
  @ViewChild('modal', { static: false })
    DetailModalDirective: any;

    isEditHolidayList: boolean = false;

  @ViewChild('editDetailModal', { static: false }) public editDetailModal: ModalDirective
  @ViewChild('modal', { static: false })
    EditDetailModalDirective: any;

  @ViewChild('copyDetailModal', { static: false }) public copyDetailModal: ModalDirective
  @ViewChild('modal', { static: false })
    CopyHolidayModalDirective: any;

  @ViewChild('copyFromDetailModal', { static: false }) public copyFromDetailModal: ModalDirective
  @ViewChild('modal', { static: false })
    CopyFromHolidayModalDirective: any;

  @ViewChild('deleteDetailModal', { static: false }) public deleteDetailModal: ModalDirective
  @ViewChild('modal', { static: false })
    DeleteDetailModalDirective: any;

  @ViewChild('deleteHolidayConfirmationModal', { static: false }) public deleteHolidayConfirmationModal: ModalDirective
  @ViewChild('modal', { static: false })
    DeleteHolidayConfirmationModalDirective: any;

  @ViewChild('deleteHolidayListConfirmationModal', { static: false }) public deleteHolidayListConfirmationModal: ModalDirective
  @ViewChild('modal', { static: false })
    DeleteHolidayListConfirmationModalDirective: any;

    SelectedCalendarYear: number;

    InputHolidayList: IHolidayList = <IHolidayList>{};
    InputHolidayListDetails: IHolidayListDetails = <IHolidayListDetails>{};
    SelectedList: number[] = [];
    IsFullDay: number[] = [];
    holidayList: IHolidayList[];
    holidayListAndDetail: IFGetHolidayListByCalendarYear_Result[] = [];
    displayHolidayListAndDetail: IFGetHolidayListByCalendarYear_Result[] = [];
    displayHolidayDetail: IFHolidayListDetail[] = [];

    holidays: IHolidayList[];
    hList: IHolidayList[];
    holidayListCheckBox: ICheckBoxViewModel<IHolidayList>[] = [];
    holidayListCheckBoxCopy: ICheckBoxViewModel<IHolidayList>[] = [];
    requiredDeleteId: number = null;
    requiredListId: number = null;
    disableDeletedHolidayDivFlag: boolean = false;
    getHoliday: IHolidayListDetails;

    listDetails: IHolidayListDetails[] = [];
    list: IHolidayList[] = [];
    deleteEnable: boolean = false;
    excludeId: number = null;
    copyFromModal: boolean = false;

    holidayListDetail: IHolidayListDetails[];
    deleteConfirmationModalLoaded: boolean = false;
    deleteListConfirmationModalLoaded: boolean = false;
    selectedModalLoaded: boolean = false;
    copyModal: boolean = false;
    selectedDetailModalLoaded: boolean = false;
    isAddHolidayList: boolean = false;
    isHolidayListDetails: boolean = false;
    error: boolean = false;
    emptyListSelected: boolean = false;
    userId: string;
    NepaliFiscalYearList: IBSADCal[];
    NepaliFiscalYear: IBSADCal = <IBSADCal>{};
    isEditHolidayListDetails: boolean = false; //flag for edit list details
    SelectedHolidayListId: number;
    CalendarYear: number;

    years: any[] = [];
    month: number = 0;
    day: number = 0;

    monthList = [
        { month: 1 }, { month: 2 }, { month: 3 }, { month: 4 }, { month: 5 }, { month: 6 }, { month: 7 },
        { month: 8 }, { month: 9 }, { month: 10 }, { month: 11 }, { month: 12 }
    ];

    dayList = [
        { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 }, { day: 13 }, { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 },
        { day: 19 }, { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 }, { day: 32 }
    ];
    currentDate: Date = new Date();
    inputHolidayDate: IInputDateVM;
    inputHolidayDateOptions: IDatePickerOptionsVM;

    constructor(
        public holidayListService: HolidayListService,
        public holidayListDetailsService: HolidayListDetailsService,
        public bSADCalService: BSADCalService,
        public datePickerFunctions: DatePickerFunctions,
        private employeeHolidayListDataService: EmployeeHolidayListDataService,
        private toastyService: ToastyService,
        private toastyConfig: ToastyConfig
    ) {
        this.userId = localStorage.getItem('UserId');
        this.getHolidayList();
        this.getYearList();
        this.getAllNepaliCalendarFiscalYear();
        this.currentDate.setHours(0, 0, 0, 0);
        this.inputHolidayDate = <IInputDateVM>{
            Year: this.currentDate.getFullYear(),
            Month: this.currentDate.getMonth() + 1,
            Date: this.currentDate.getDate(),
        };
        this.inputHolidayDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        };
    }

    //to get list of +-10years
    public getYearList() {
        var date = new Date,
            j = date.getUTCFullYear() - 10;

        for (var i = j; i < j + 20; i++) {
            this.years.push({ year: i });
        }
    }
    //to open add holiday list modal

    openAddHolidayListModal() {
        this.isAddHolidayList = true;
        this.selectedModalLoaded = true;
        if (this.childModal != undefined) {
            this.childModal.config.ignoreBackdropClick = true;
        }
        this.childModal.show();
    }

    /**
     * to hide add/edit modal
     */

    public hideChildModal(): void {
        this.childModal.hide();
        this.isAddHolidayList = false;
        this.isEditHolidayList = false;
        this.InputHolidayList = <IHolidayList>{};

    }

    openHolidayListDetailsModal() {
        this.holidayListService.getAll().subscribe((data: IHolidayList[]) => {
            this.holidayListCheckBox = [];
            data.forEach(item => {
                this.holidayListCheckBox.push({
                    Item: item,
                    Selected: false
                });
            });
            this.isHolidayListDetails = true;
            this.selectedDetailModalLoaded = true;
            if (this.detailModal != undefined) {
                this.detailModal.config.ignoreBackdropClick = true;
            }
            this.detailModal.show();
        });        
    }

    public hideListDetailsModal(): void {
        this.detailModal.hide();
        this.isHolidayListDetails = false;
        this.InputHolidayListDetails = <IHolidayListDetails>{};
        this.holidayListCheckBox.filter(x => x.Item).forEach(item => {
            item.Selected = false;
        })

    }
    //edit Holiday List
    openEditHolidayListModal(ListId?: number) {
        this.isEditHolidayList = true;
        this.selectedModalLoaded = true;
        if (this.childModal != undefined) {
            this.childModal.config.ignoreBackdropClick = true;
        }
        this.childModal.show();
        this.getListByID(ListId);
    }

    //to edit Holiday details

    openEditHolidayListDetailsModal(ListId?: number,year?:number) {
        this.isEditHolidayListDetails = true;
        this.selectedDetailModalLoaded = true;
        if (this.editDetailModal != undefined) {
            this.editDetailModal.config.ignoreBackdropClick = true;
        }
        this.editDetailModal.show();

        this.getListDetails(ListId, year);
    }

    public hideEditListDetailsModal(): void {
        this.editDetailModal.hide();

        this.isEditHolidayListDetails = false;
    }

    //to copy Holiday 

    openCopyHolidayModal(ListId?: number,year?:number) {
        this.copyModal = true;
        this.error = false;
        this.emptyListSelected = false;
        if (this.copyDetailModal != undefined) {
            this.copyDetailModal.config.ignoreBackdropClick = true;
        }
        this.copyDetailModal.show();
        this.excludeId = ListId;
        this.getHList();
        this.getListDetails(ListId,year);
    }

    public hideOpenCopyModal(): void {
        this.copyDetailModal.hide();
        this.holidayListCheckBoxCopy = [];
        this.copyModal = false;
    }

    //to copy from Holiday List

    openCopyFromHolidayModal(ListId?: number) {
        this.listDetails = [];
        this.copyFromModal = true;
        this.error = false;
        this.excludeId = ListId;
        this.getHList();
        if (this.copyFromDetailModal != undefined) {
            this.copyFromDetailModal.config.ignoreBackdropClick = true;
        }
        this.copyFromDetailModal.show();

    }

    public hideOpenCopyFromModal(): void {
        this.SelectedHolidayListId=null;
        this.CalendarYear=null;
        this.copyFromDetailModal.hide();
        this.hList = [];
        this.holidayListCheckBoxCopy = [];
        this.copyFromModal = false;
    }

    //to delete Holiday

    openDeleteHolidayListDetailsModal(ListId?: number,nYear?:number) {
        this.deleteEnable = true;
        this.getListDetails(ListId, nYear);
        this.selectedDetailModalLoaded = false;
        if (this.deleteDetailModal != undefined) {
            this.deleteDetailModal.config.ignoreBackdropClick = true;
        }
        this.deleteDetailModal.show();
    }

    public hideDeleteListDetailsModal(): void {
        this.deleteDetailModal.hide();
        this.deleteEnable = false;
    }

    //to delete Holiday Confirmation

    openDeleteHolidayConfirmationModal(ListId: number) {
        this.deleteConfirmationModalLoaded = true;
        this.requiredDeleteId = ListId;
        if (this.deleteHolidayConfirmationModal != undefined) {
            this.deleteHolidayConfirmationModal.config.ignoreBackdropClick = true;
        }
        this.deleteHolidayConfirmationModal.show();
    }

    public hideDeleteConfirmationModal(): void {
        this.deleteHolidayConfirmationModal.hide();
        this.deleteConfirmationModalLoaded = false;
    }

    //to delete Holiday list
    openDeleteHolidayListConfirmationModal(ListId: number) {
        this.deleteListConfirmationModalLoaded = true;
        this.requiredListId = ListId;
        if (this.deleteHolidayListConfirmationModal != undefined) {
            this.deleteHolidayListConfirmationModal.config.ignoreBackdropClick = true;
        }
        this.deleteHolidayListConfirmationModal.show();
        this.getList(ListId);
    }

    public hideDeleteListConfirmationModal(): void {
        this.deleteHolidayListConfirmationModal.hide();
        this.deleteListConfirmationModalLoaded = false;
    }
    /**
     * to get holiday lists
     */

    public getHolidayList(nYear?: number) {
        let BSDate: string = this.datePickerFunctions.FGetDateBS(new Date());
        let calendarYear: number = nYear ? Number(nYear) : this.datePickerFunctions.GetBSYear(BSDate);
        this.displayHolidayListAndDetail = [];
        this.employeeHolidayListDataService.GetHolidayListByCalendarYear(calendarYear)
            .subscribe((data: IFGetHolidayListByCalendarYear_Result[]) => {
                let uniqueArray: number[] = [];
                let unique: number;
                let one: IFGetHolidayListByCalendarYear_Result = <IFGetHolidayListByCalendarYear_Result>{};
                let list: IFGetHolidayListByCalendarYear_Result[] = [];
                this.holidayListAndDetail = data;
                //data.forEach(item => {
                //    if (this.displayHolidayListAndDetail.filter(x => x.HolidaylistId == item.HolidaylistId).length == 0) {
                //        item.HolidayDetail = this.getHolidayDetailById(item.HolidaylistId);
                //        this.displayHolidayListAndDetail.push(item);
                //    }
                //})
                this.holidayListAndDetail.forEach(item => {
                    var unique = uniqueArray.filter(x => x == item.HolidaylistId).length;

                    if (unique == 0) {
                        uniqueArray.push(item.HolidaylistId);
                        one = {
                            Yr: item.Yr,
                            HolidaylistId: item.HolidaylistId,
                            HolidayDate: item.HolidayDate,
                            HolidayDescription: item.HolidayDescription,
                            ListName: item.ListName,
                            HolidayName: item.HolidayName,
                            HolidayDetail: this.holidayListAndDetail.filter(x => x.HolidaylistId == item.HolidaylistId)
                        }
                        this.displayHolidayListAndDetail.push(one);
                    }
                })
                //this.displayHolidayListAndDetail.forEach(item => {
                //    if (item.HolidayDetail.filter(x => x.HolidaylistId == item.HolidaylistId).length == 0) {
                //        item.HolidayDetail = this.getHolidayDetailById(item.HolidaylistId);
                //    }
                //});
            });
        //var query = "$expand=HolidayListDetails"
        //this.holidayListService.getAll(query).subscribe((data: IHolidayList[]) => {
        //    this.holidayList = data;
        //    data.forEach(item => {
        //        this.holidayListCheckBox.push({
        //            Item: item,
        //            Selected: false
        //        });
        //    });

        //});
    }

    public getHolidayDetailById(holidayListId: number): IFHolidayListDetail[] {
        this.displayHolidayDetail = [];
          this.holidayListAndDetail.filter(x => x.HolidaylistId = holidayListId).forEach(item => {
              let holidayDetailById = {
                  HolidaylistId:item.HolidaylistId,
                  HolidayName: item.HolidayName,
                  HolidayDescription: item.HolidayDescription,
                  HolidayDate: item.HolidayDate
              };
                  this.displayHolidayDetail.push(holidayDetailById);
        });
          return this.displayHolidayDetail;
    }

    public getHList() {

        var query = "$filter=HolidayListId ne " + this.excludeId + "";
        this.holidayListService.getAll(query).subscribe((data: IHolidayList[]) => {
            this.hList = data;
            data.forEach(item => {
                this.holidayListCheckBoxCopy.push({
                    Item: item,
                    Selected: false
                });
            });

        });
    }

    /**
     *  to add holiday list
     */

    public saveHolidayList() {
        this.InputHolidayList.PostedBy = this.userId;
        this.holidayListService.post(this.InputHolidayList).subscribe(() => {
            var toastOptions: ToastOptions = {
                title: "Success",
                msg: "Holiday list has been successfully Added",
                showClose: true,
                timeout: 5000,
                theme: 'bootstrap',
                onAdd: (toast: ToastData) => {
                },
                onRemove: function (toast: ToastData) {
                }
            };
            this.toastyService.success(toastOptions);
            this.InputHolidayList = <IHolidayList>{};
            this.holidayListCheckBox = [];
            this.holidayListCheckBoxCopy = [];
            this.getHolidayList();
            this.isAddHolidayList = false;
            this.selectedModalLoaded = false;
            this.hideChildModal();
        })
    }

    /**
     * to add holiday details 
     */

    public saveListDetails() {
        this.holidayListCheckBox.filter(x => x.Selected).forEach(item => {
            this.InputHolidayListDetails.HolidayListId = item.Item.HolidayListId;
            this.InputHolidayListDetails.PostedBy = this.userId;
            this.holidayListDetailsService.post(this.InputHolidayListDetails).subscribe(() => {
                this.InputHolidayListDetails = <IHolidayListDetails>{};
                this.holidayListCheckBox = [];
                this.holidayListCheckBoxCopy = [];
                this.getHolidayList();
                this.isHolidayListDetails = false;
                this.selectedDetailModalLoaded = false;
                this.hideListDetailsModal();
            })
        })
    }

    /**
     * Edit Holiday Details
     */

    public getListDetails(ListId?: number,nYear?:number) {
        let BSDate: string = this.datePickerFunctions.FGetDateBS(new Date());
        let currentYear: number = nYear ? Number(nYear) : this.datePickerFunctions.GetBSYear(BSDate);

        this.listDetails = [];
        this.bSADCalService.get(currentYear).subscribe((data: IBSADCal) => {
            let sDate = new Date(data.StartDate);
            let eDate = new Date(data.EndDate);
            if (ListId != null) {
                this.employeeHolidayListDataService.GetHolidayListDetailsByCalendarYear(ListId, sDate, eDate)
                    .subscribe((detailList: IHolidayListDetails[]) => {
                        this.listDetails = detailList;
                    });
                //var query = "$filter=HolidayListId eq " + ListId + "";
                //this.holidayListDetailsService.getAll(query).subscribe((data: IHolidayListDetails[]) => {
                //    this.listDetails = data;
                //    this.listDetails = this.listDetails.filter(x => new Date(x.Year, x.Month, x.Day).getTime() >= sDate.getTime() && new Date(x.Year, x.Month, x.Day).getTime() <= eDate.getTime());
                //});
            }            
        });
    }

    public editHolidayList() {
        this.InputHolidayList.ModifiedBy = this.userId;
        this.holidayListService.put(this.InputHolidayList.HolidayListId, this.InputHolidayList)
            .subscribe(() => {
                this.getHolidayList();
                this.hideChildModal();
            });
    }

    public editHolidayDetails(holidayDetails: IHolidayListDetails[]) {
        holidayDetails.forEach(item => {
            item.ModifiedBy = this.userId;
            this.holidayListDetailsService.put(item.HolidayListId, item).subscribe(() => {
                this.getHolidayList();
                this.hideEditListDetailsModal();
            });
        })
        this.getHolidayList();
        this.holidayListCheckBox = [];
        this.holidayListCheckBoxCopy = [];

    }

    /**
     * for deleting individual holiday
     */
    public disableDeletedHolidayDiv() {
        this.listDetails.filter(x => x.HolidayListDetailId === this.requiredDeleteId)[0].Deleted = true;
        this.deleteHolidayConfirmationModal.hide();
    }

    public deleteHoliday(holiday: IHolidayListDetails[]) {
        holiday.filter(x => x.Deleted === true).forEach(item => {
            this.holidayListDetailsService.delete(item.HolidayListDetailId).subscribe(() => {
                this.getHolidayList();
                this.holidayListCheckBox = [];
                this.holidayListCheckBoxCopy = [];
            })
        })
        this.hideDeleteListDetailsModal();
        this.selectedDetailModalLoaded = false;
    }

    /**
     * delete holiday list and all of its holiday details
     */

    public getList(Id: number) {
        var query = "$expand=HolidayListDetails&$filter=HolidayListId eq " + Id + "";
        this.holidayListService.getAll(query).subscribe((data: IHolidayList[]) => {
            this.list = data;
        })
    }

    public getListByID(id: number) {
        this.holidayListService.get(id)
            .subscribe((one: IHolidayList) => {
                this.InputHolidayList = one;
            })

    }

    public deleteList() {
        this.holidayListService.delete(this.requiredListId).subscribe(() => {
            this.getHolidayList();
            this.holidayListCheckBox = [];
            this.holidayListCheckBoxCopy = [];
            this.requiredListId = null;
            this.hideDeleteListConfirmationModal();
        })
    }

    /**
     * Copy holiday to the selected list
     * @param holidayList
     */
    public copyHoliday(holidayList: IHolidayListDetails[]) {

        if (this.holidayListCheckBoxCopy.filter(x => x.Selected).length > 0) {
            this.holidayListCheckBoxCopy.filter(x => x.Selected).forEach(item => {
                holidayList.filter(x => x.Selected).forEach(hItem => {
                    let holidayObj: IHolidayListDetails = {
                        HolidayListId: item.Item.HolidayListId,
                        HolidayName: hItem.HolidayName,
                        HolidayDescription: hItem.HolidayDescription,
                        IsFullDay: hItem.IsFullDay,
                        Year: hItem.Year,
                        Month: hItem.Month,
                        Day: hItem.Day
                    };

                    if (this.holidayList.filter(x => x.HolidayListId == item.Item.HolidayListId)[0].HolidayListDetails.filter(x => x.HolidayName == holidayObj.HolidayName).length == 0) {
                        this.holidayListDetailsService.post(holidayObj).subscribe(() => {
                            this.hideOpenCopyModal();
                            this.getHolidayList();
                            this.holidayListCheckBox = [];
                            this.holidayListCheckBoxCopy = [];
                            this.error = false;
                            this.emptyListSelected = false;
                        })
                    }
                    else {
                        this.error = true;
                    }
                })
            })
        } else {
            this.emptyListSelected = true;
        }


    }

    /**
     * Copy holiday from the list
     * @param holidayList
     */
    public copyFromHoliday(holidayList: IHolidayListDetails[]) {
        holidayList.filter(x => x.Selected).forEach(item => {
            let holidayObj: IHolidayListDetails = {
                HolidayListId: this.excludeId,
                HolidayName: item.HolidayName,
                HolidayDescription: item.HolidayDescription,
                IsFullDay: item.IsFullDay,
                Year: item.Year,
                Month: item.Month,
                Day: item.Day
            };
            if (this.holidayList.filter(x => x.HolidayListId == this.excludeId)[0].HolidayListDetails.filter(x => x.HolidayName == holidayObj.HolidayName).length == 0) {
                this.holidayListDetailsService.post(holidayObj).subscribe(() => {
                    this.hideOpenCopyFromModal();
                    this.getHolidayList();
                    item.Selected = false;
                    this.holidayListCheckBox = [];
                    this.holidayListCheckBoxCopy = [];
                    this.error = false;
                })
            }
            else {
                this.error = true;
            }
        })


    }

    public getAllNepaliCalendarFiscalYear() {
        this.bSADCalService.getAll().subscribe((data) => {
            let currentDate = new Date();
            this.NepaliFiscalYear = data.filter(x => new Date(x.StartDate) <= currentDate && new Date(x.EndDate) >= currentDate)[0];
            let NepaliFiscalYear1 = data.filter(x => x.NYear == this.NepaliFiscalYear.NYear - 1)[0];
            let NepaliFiscalYear2 = data.filter(x => x.NYear == this.NepaliFiscalYear.NYear + 1)[0];

            this.NepaliFiscalYearList = [];
            this.NepaliFiscalYearList.push(NepaliFiscalYear1);
            this.NepaliFiscalYearList.push(this.NepaliFiscalYear);
            this.NepaliFiscalYearList.push(NepaliFiscalYear2);
        });

    }

    onHolidayDateSelect(selectedDate: IInputDateVM) {
        this.inputHolidayDate = selectedDate;
        this.InputHolidayListDetails.Year = this.inputHolidayDate.Year;
        this.InputHolidayListDetails.Month = this.inputHolidayDate.Month;
        this.InputHolidayListDetails.Day = this.inputHolidayDate.Date;
    }
}
