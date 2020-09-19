import { Component } from '@angular/core';

import 'leaflet';
import 'mapbox-gl-leaflet';
import 'leaflet.markercluster';
declare var L;

import { IEmployee, ILoginReport, ILoginValidate, IUser, IODataResult } from '../../models/Models';
import { EmployeeService, LoginStatusService, LoginReportService, LoginValidateService, SupervisorListService, UserService } from '../../services/BaseService';
import { IFilterViewModel, ILoginReportVM, ILoginStatusVm, IFgetemployeeLoginReport_Result } from "../../models/ViewModels";
import { IInputDateVM, IDatePickerOptionsVM } from "../datepicker/models/datePickerVM";

export var OSM = L.tileLayer("https://a.tiles.mapbox.com/v4/sarojrajbhandari.4ea219d2/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia2FydW5zaGFreWEiLCJhIjoiMzJjNGI5OTg4MzJkMDFlOGI3N2ZjODIzZjVlYzk5MjEifQ.5cqP0lERUDxb_-11PQoafQ", {});

@Component({
    selector: 'daily-login-map',
    templateUrl: './dailyLoginMap.html',
})
export class DailyLoginMap {
    userDetails: IUser = <IUser>{};
    employeeList: IFgetemployeeLoginReport_Result[] = [];
    filterObj?: IFilterViewModel = <IFilterViewModel>{};
    viewLoginReport: boolean = false;
    isRefreshCalendar: boolean = true;

    selectedEmployee: IEmployee = <IEmployee>{};
    loginDetails: ILoginReport[] = [];
    loginDetailsVm: ILoginReportVM;
    loginDetailsObj: ILoginReport;
    monthlyLoginDetails: ILoginReport[];
    loginStatus: ILoginStatusVm[] = [];
    //requiredEmployeeId?: number = null;
    userId?: string = null;

    updateLoginReportObj: ILoginReport = <ILoginReport>{};
    updateLoginValidateObj: ILoginValidate = <ILoginValidate>{};
    loginStatusValidate: ILoginStatusVm[] = [];

    //date picker inputs.
    inputDate: IInputDateVM;
    inputDateOptions: IDatePickerOptionsVM;
    selectedDate: Date;

    filter: boolean;
    empImage: string;

    //map
    map: L.Map;
    markers: L.Marker[] = [];
    markerCluster: any = L.markerClusterGroup();

    loading: boolean;
    backToMonthAtt: boolean = false;
    backToAtt: boolean = false;

    checkInOptions: any = null;
    checkOutOptions: any = null;

    constructor(
        public employeeService: EmployeeService,
        public loginStatusService: LoginStatusService,
        public loginReportService: LoginReportService,
        public loginValidateService: LoginValidateService,
        public supervisorListService: SupervisorListService,
        public userService: UserService
    ) {
        this.userId = localStorage.getItem('UserId');
        let currentDate: Date = new Date();
        this.inputDate = <IInputDateVM>{
            Year: currentDate.getFullYear(),
            Month: currentDate.getMonth() + 1,
            Date: currentDate.getDate(),
        };
        this.inputDateOptions = <IDatePickerOptionsVM>{
            closeOnDateSelect: true,
            minDate: null,
            maxDate: null
        };
    }

    ngOnInit() {
        if (this.selectedDate == null) {
            this.selectedDate = new Date();
        }
        this.getUserDetails();
        OSM = new L.TileLayer('https://a.tiles.mapbox.com/v4/sarojrajbhandari.4ea219d2/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia2FydW5zaGFreWEiLCJhIjoiMzJjNGI5OTg4MzJkMDFlOGI3N2ZjODIzZjVlYzk5MjEifQ.5cqP0lERUDxb_-11PQoafQ', {
            attribution: null
        });
    }

    getUserDetails() {
        this.userService.get(this.userId, `$expand=Employee/ReportTo,MenuTemplate/MenuVsTemplate`).subscribe((empData: IUser) => {
            this.setupMap();
            this.userDetails = empData;
            if (empData.Employee.ReportTo.length > 0) {
                if (this.userDetails.Employee.ReportTo.filter((x: any) => x.Status == true)[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
                    this.getAllSupervisorEmployees();
                }
                else {
                    this.getSupevisorEmployees();
                }
            } else {
                this.loading = false;
                this.employeeList = [];
            }
        })
    }

    public getEmployeeList(selectedDate?: IInputDateVM) {
        this.loading = true;
        if (this.userDetails.Id != null) {
            if (this.userDetails.Employee.ReportTo.length > 0) {
                if (this.userDetails.Employee.ReportTo.filter(x => x.Status == true)[0].ReportTo1 == 0 && this.userDetails.MenuTemplate.MenuVsTemplate.filter(x => x.MenuId == 1048).length > 0) {
                    this.getAllSupervisorEmployees();
                }
                else {
                    this.getSupevisorEmployees();
                }
            } else {
                this.loading = false;
                this.employeeList = [];
            }
        } else {
            this.loading = false;
            this.getUserDetails();
        }
    }

    public getAllSupervisorEmployees() {
        this.supervisorListService.GetEmployeeListLoginMapAll(this.selectedDate).subscribe((data: IODataResult<IFgetemployeeLoginReport_Result[]>) => {
            this.loading = false;
            this.employeeList = data.value;
            this.addMarkers();
        });
    }

    public getSupevisorEmployees() {
        this.supervisorListService.GetEmployeeListLoginMap(this.userDetails.EmployeeId, this.selectedDate).subscribe((data: IODataResult<IFgetemployeeLoginReport_Result[]>) => {
            this.loading = false;
            this.employeeList = data.value;
            this.addMarkers();
        })
    }

    setupMap() {
        OSM.bringToFront();
        this.map = L.map("map", {
            center: [27.700769, 85.300140],
            zoom: 12,
            layers: [ OSM ],
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: false
        });

        this.map.addLayer(this.markerCluster);
    }

    filterMarkers(filter?: number) {
        this.clearMarkers();
        if (filter == null) {
            this.filter = null;
        } else {
            this.filter = Boolean(filter);
        }
        if (this.employeeList.length > 0) {
            this.addMarkers();
        } else {
            this.getEmployeeList();
        }
    }

    setIcon(x: boolean): L.IconOptions {
        var y: L.IconOptions = <L.IconOptions>{
            popupAnchor: [1, -37],
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        };

        if (x == true) {
            y.iconUrl = '/assets/map marker/map marker-02.png';
        } else {
            y.iconUrl = '/assets/map marker/map marker-01.png';
        }
        return y;
    }

    addMarkers() {
        this.markers = [];
        this.employeeList.forEach(item => {
            if (this.filter != false) {
                if (item.CheckInDeviceId >= 3) {
                    this.addMarker(item, true);
                }
            }
            if (this.filter != true) {
                if (item.CheckOutDeviceId >= 3) {
                    this.addMarker(item, false);
                }
            }
        });
    }

    addMarker(item: IFgetemployeeLoginReport_Result, isCheckIn: boolean) {
        let that = this;
        let newGeom;

        if (isCheckIn == true) {
            newGeom = this.generateGeoJSONForPoints(item.CheckInGeom.Geometry.WellKnownText);
        } else {
            newGeom = this.generateGeoJSONForPoints(item.CheckOutGeom.Geometry.WellKnownText);
        }

        let content = "<div><i class='fa fa-spinner fa-spin'></i> Loading...</div>";
        let marker = L.marker([JSON.parse(newGeom).coordinates[1], JSON.parse(newGeom).coordinates[0]], {
            icon: new L.Icon(that.setIcon(Boolean(isCheckIn)))
        }).bindPopup(content, { maxWidth: 500, minWidth: 250 });

        marker.on('click', (ev: any) => {
            if (item.EmpPhoto == null) {
                let query = "$select=Photo";
                that.employeeService.get(item.EmployeeId, query).subscribe(imgdata => {
                    that.empImage = imgdata.Photo;
                    that.employeeList.filter(x => x.EmployeeId == item.EmployeeId)[0].EmpPhoto = imgdata.Photo;

                    let content = "<div class='media'>";
                    content += `<div class="pull-left" style="padding: 3px;"><a href="#"><img src="${item.EmpPhoto != null ? item.EmpPhoto : '/Images/User.png'}" class="media-object" style="max-width:80px; max-height:80px;" /></a></div>`;
                    content += `<div class="media-body">`;
                    content += `<h4 class="media-heading">${item.EmployeeName}</h4>`;
                    if (isCheckIn == true) {
                        content += `<strong>Check-In Time: </strong> ${item.CheckInTime}<br>`;
                    }
                    if (isCheckIn == false) {
                        content += `<strong>Check-In Time: </strong> ${item.CheckInTime}<br>`;
                        content += `<strong>Check-Out Time: </strong> ${item.CheckOutTime}<br>`;
                    }
                    content += `<strong>Status: </strong> ${item.StatusName}`;
                    content += "</div>";
                    content += "</div>";

                    marker.bindPopup(content, { maxWidth: 500, minWidth: 250 }).openPopup();
                });
            } else {
                let content = "<div class='media'>";
                content += `<div class="pull-left" style="padding: 3px;"><a href="#"><img src="${item.EmpPhoto != null ? item.EmpPhoto : '/Images/User.png'}" class="media-object" style="max-width:80px; max-height:80px;" /></a></div>`;
                content += `<div class="media-body">`;
                content += `<h4 class="media-heading">${item.EmployeeName}</h4>`;
                if (isCheckIn == true) {
                    content += `<strong>Check-In Time: </strong> ${item.CheckInTime}<br>`;
                }
                if (isCheckIn == false) {
                    content += `<strong>Check-In Time: </strong> ${item.CheckInTime}<br>`;
                    content += `<strong>Check-Out Time: </strong> ${item.CheckOutTime}<br>`;
                }
                content += `<strong>Status: </strong> ${item.StatusName}`;
                content += "</div>";
                content += "</div>";
                marker.bindPopup(content, { maxWidth: 500, minWidth: 250 }).openPopup();
            }
        });

        this.markerCluster.addLayer(marker);
        this.markers.push(marker);
    }


    clearMarkers() {
        this.markers.forEach(item => {
            item.removeFrom(this.markerCluster);
        });
    }

    onDateSelect(selectedDate: IInputDateVM) {
        if (
            this.selectedDate.getFullYear() != selectedDate.Year ||
            (this.selectedDate.getMonth() + 1) != selectedDate.Month ||
            this.selectedDate.getDate() != selectedDate.Date
        ) {
            this.selectedDate = new Date(selectedDate.Year, selectedDate.Month - 1, selectedDate.Date);
            this.clearMarkers();
            this.getEmployeeList(selectedDate);
        }
    }

    todayReport() {
        let newDate: IInputDateVM = {
            Year: new Date().getFullYear(),
            Month: new Date().getMonth() + 1,
            Date: new Date().getDate()
        }
        this.onDateSelect(newDate);
    }

    public generateGeoJSONForPoints(geometryString: string): any {
        let returnString = '{';
        returnString += '"type": "Point","coordinates": [';
        returnString += geometryString.replace('POINT (', '').replace('(', '').replace(')', '').split(' ')[0] + ',';
        returnString += geometryString.replace('POINT (', '').replace('(', '').replace(')', '').split(' ')[1];
        returnString += ']';
        returnString += '}';
        return returnString;
    }

}