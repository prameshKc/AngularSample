import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IDateVM, IDatePickerOptionsVM, ICalendarVM, ICalendarViewVM, IInputDateVM, eDateFormat } from '../datepicker/models/datepickerVM';
import { DatePickerFunctions } from '../datepicker/modules/datepickerFunctions';
import { LoginReportService, UserService, EmployeeService, ParamService, LoginStatusService, CalendarService } from '../../services/BaseService';
import { ILoginReport } from '../../models/Models';
import { IParam } from '../../models/Models';
import { ILoginReportVM, ILoginStatusVm } from '../../models/ViewModels';

@Component({
  selector: 'chaCalendar',
  templateUrl: './chaCalendar.html',
  styleUrls: ['./chaCalendar.css'],
})
export class ChaCalendarComponent implements OnChanges {
  @Input() requiredEmployeeId: number;
  @Input() refresh: boolean;
  @Output() selectedDate: EventEmitter<ILoginReportVM> = new EventEmitter<ILoginReportVM>();

  calendarData: ICalendarVM = <ICalendarVM>{};
  calendarFunctions: DatePickerFunctions;
  defaultDate: IInputDateVM = {
    Year: new Date().getFullYear(),
    Month: new Date().getMonth() + 1,
    Date: new Date().getDate(),
  };
  defaultDatePickerOptions: IDatePickerOptionsVM = {
    closeOnDateSelect: false,
    minDate: {
      Year: 1970,
      Month: 1,
      Date: 1
    },
    maxDate: {
      Year: 2111,
      Month: 12,
      Date: 30
    }
  };
  tempDate: IInputDateVM = <IInputDateVM>{};
  currentDate: Date;

  dateADAndBS: IDateVM = <IDateVM>{};
  calendarBody: ICalendarViewVM;
  calendar: ICalendarVM;

  dateText: string;
  dateType: number = 1;
  counter: number = 0;
  messageErr: string = null;

  datePickerToggle: boolean = null;
  inputDate: IInputDateVM = <IInputDateVM>{};
  inputDatePickerOptions: IDatePickerOptionsVM;
  requiredDate: IInputDateVM;

  userId: string;
  dateString: string;
  selectedCurrentDate: Date;
  loginDetails: ILoginReportVM[] = [];
  loginStatus: ILoginStatusVm[] = [];

  formatParamAD: string;
  formatArrayAD: string[];

  formatParamBS: string;
  formatArrayBS: string[];

  constructor(
    private datePickerService: DatePickerFunctions,
    private loginReportService: LoginReportService,
    public userService: UserService,
    public employeeService: EmployeeService,
    private paramService: ParamService,
    public loginStatusService: LoginStatusService,
    public calendarService: CalendarService
  ) {
    this.getLoginStatus();

    this.dateADAndBS = this.datePickerService.GetDate(1, new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
  }

  ngOnChanges(changes: SimpleChanges) {
    let newChanges: any = changes;

    this.checkValidinputDate();
    this.checkValidDatePickerOptions();
    this.getDefaultFormat();
  }

  public getLoginStatus() {
    this.loginStatusService.getAll().subscribe((data: ILoginStatusVm[]) => {
      this.loginStatus = data;
    })
  }

  getDefaultFormat() {
    this.paramService.getAll("$expand=ParamValue&$filter=PId eq 13 or PId eq 14 or PId eq 12").subscribe((data: IParam[]) => {
      localStorage.setItem('Param.DefaultFormatAD', data.find(x => x.PId == 13).ParamValue.PValue);
      localStorage.setItem('Param.DefaultFormatBS', data.find(x => x.PId == 14).ParamValue.PValue);
      localStorage.setItem('Param.DateType', data.find(x => x.PId == 12).ParamValue.PValue);

      this.formatParamAD = eDateFormat[parseInt(data.find(x => x.PId == 13).ParamValue.PValue)];
      this.formatArrayAD = this.formatParamAD.split('-');

      this.formatParamBS = eDateFormat[parseInt(data.find(x => x.PId == 14).ParamValue.PValue)];
      this.formatArrayBS = this.formatParamBS.split('-');

      this.dateType = parseInt(data.find(x => x.PId == 12).ParamValue.PValue);

      this.defaultDatePickerOptions.dateType = this.dateType;

      this.setDateText();

      this.getCalendar(this.inputDate.Year, this.inputDate.Month);
    });
  }

  setDateText() {
    let newDate: string[];
    let returnDate: IInputDateVM;
    if (this.dateType == 1) {
      newDate = this.dateADAndBS.DateAD.split('-');
      returnDate = {
        Year: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('yyyy'))]),
        Month: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('MM'))]),
        Date: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('dd'))])
      };
      Object.assign(this.inputDate, returnDate);
    } else {
      newDate = this.dateADAndBS.DateBS.split('-');
      returnDate = {
        Year: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('yyyy'))]),
        Month: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('MM'))]),
        Date: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('dd'))])
      };

      let newEDate = this.dateADAndBS.DateAD.split('-');
      let returnEDate = {
        Year: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('yyyy'))]),
        Month: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('MM'))]),
        Date: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('dd'))])
      };
      Object.assign(this.inputDate, returnEDate);
    };
    Object.assign(this.tempDate, returnDate);
  }

  public getEmployeeMonthlyLoginDetails(Year: number, Month: number, Day: number) {
    let selectedStartDate: IInputDateVM = null;
    let selectedEndDate: IInputDateVM = null;
    let searchStartDate: Date;
    let searchEndDate: Date;

    searchStartDate = new Date(this.datePickerService.getDate(Year, Month, Day, this.dateType).Date);
    selectedStartDate = {
      Year: searchStartDate.getFullYear(),
      Month: searchStartDate.getMonth() + 1,
      Date: searchStartDate.getDate()
    };

    searchEndDate = new Date(this.datePickerService.getDate(Year, Month, Day + this.calendar.NoOfDays, this.dateType).Date);
    selectedEndDate = {
      Year: searchEndDate.getFullYear(),
      Month: searchEndDate.getMonth() + 1,
      Date: searchEndDate.getDate()
    };

    var timeString = '00:00:00.000Z';

    let startString: string = selectedStartDate.Year + '-' + (selectedStartDate.Month < 10 ? '0' : '') + selectedStartDate.Month + '-' + (selectedStartDate.Date < 10 ? '0' : '') + selectedStartDate.Date + 'T' + timeString;
    let endString: string = selectedEndDate.Year + '-' + (selectedEndDate.Month < 10 ? '0' : '') + selectedEndDate.Month + '-' + (selectedEndDate.Date < 10 ? '0' : '') + selectedEndDate.Date + 'T' + timeString;

    if (this.inputDate != undefined || this.inputDate != null) {

      var query = `$expand=LoginStatus,LoginGroup`;
      query += `&$select=Id,LoginStatusId,LoginStatus/ColorCode,LoginStatus/LoginStatusId,TDate,EmployeeId`;
      query += `&$filter=EmployeeId eq ${this.requiredEmployeeId} `;
      query += `and TDate ge datetime'${startString}' `;
      query += `and TDate lt datetime'${endString}' `;
      query += `&$orderby=TDate`;

      this.loginReportService.getAll(query).subscribe((data: ILoginReportVM[]) => {
        let newDate: string[] = [];
        if (data.length > 0) {
          this.loginDetails = [];
          if (this.dateType == 2) {
            data.forEach(item => {
              let returnDate: IInputDateVM;

              newDate = this.datePickerService.getDate(new Date(item.TDate).getFullYear(), new Date(item.TDate).getMonth() + 1, new Date(item.TDate).getDate(), 1).DateBS.split('-');

              returnDate = {
                Year: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('yyyy'))]),
                Month: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('MM'))]),
                Date: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('dd'))])
              };

              item.newDate = returnDate;

              this.loginDetails.push(item);
              if ((data.length - 1) == data.findIndex(x => x.Id == item.Id)) {
                this.setCalendar();
              }
            })
          } else {
            data.forEach(item => {
              let returnDate: IInputDateVM;
              let newDate = new Date(item.TDate);
              //newDate = this.datePickerService.getDate(new Date(item.TDate).getFullYear(), new Date(item.TDate).getMonth() + 1, new Date(item.TDate).getDate(), 1).DateAD.split('-');
              //returnDate = {
              //    Year: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('yyyy'))]),
              //    Month: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('MM'))]),
              //    Date: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('dd'))])
              //};
              returnDate = {
                Year: newDate.getFullYear(),
                Month: newDate.getMonth() + 1,
                Date: newDate.getDate()
              };

              item.newDate = returnDate;
              this.loginDetails.push(item);

              if ((data.length - 1) == data.findIndex(x => x.Id == item.Id)) {
                this.setCalendar();
              }
            })
          }
        } else {
          this.setCalendar();
        }
      });
    }
  }

  dateTypeToggle() {
    this.dateType = this.dateType == 1 ? 2 : 1;
    //this.setDateText();

    let newDate: string[];
    let returnDate: IInputDateVM;
    if (this.dateType == 1) {
      newDate = this.dateADAndBS.DateAD.split('-');
      returnDate = {
        Year: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('yyyy'))]),
        Month: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('MM'))]),
        Date: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('dd'))])
      };
      Object.assign(this.inputDate, returnDate);
    } else {
      newDate = this.dateADAndBS.DateBS.split('-');
      returnDate = {
        Year: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('yyyy'))]),
        Month: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('MM'))]),
        Date: parseInt(newDate[this.formatArrayBS.findIndex(x => x.startsWith('dd'))])
      };



      let newEDate = this.dateADAndBS.DateAD.split('-');
      let returnEDate = {
        Year: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('yyyy'))]),
        Month: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('MM'))]),
        Date: parseInt(newDate[this.formatArrayAD.findIndex(x => x.startsWith('dd'))])
      };
      Object.assign(this.inputDate, returnEDate);
    };
    Object.assign(this.tempDate, returnDate);

    this.getCalendar(this.tempDate.Year, this.tempDate.Month);
  }

  getDateBSAndAD(date: IInputDateVM) {
    this.dateADAndBS = this.datePickerService.getDate(date.Year, date.Month, date.Date, this.dateType);

    if (this.dateType == 1) {
      this.dateText = this.dateADAndBS.DateAD;
    } else {
      this.dateText = this.dateADAndBS.DateBS;
    }
    this.getCalendar(date.Year, date.Month);
  }

  getCalendar(year?: number, month?: number) {
    let getDateByYearMonthChange: any;

    this.calendar = this.datePickerService.getDateByYearMonthChange(this.dateType, year, month, 1);

    this.inputDate.Year = this.calendar.CurrentYear;
    this.inputDate.Month = this.calendar.CurrentMonth;
    this.inputDate.Date = this.calendar.CurrentDay;
    this.tempDate = this.inputDate;

    this.getEmployeeMonthlyLoginDetails(this.tempDate.Year, this.tempDate.Month, this.tempDate.Date);
  }

  chartData: ILoginStatusVm[] = [];
  setCalendar() {
    this.calendar.MonthWeeks = [];

    this.loginStatus.map(item => {
      item.Count = this.loginDetails.filter(x => x.LoginStatusId == item.LoginStatusId && x.newDate.Year == this.tempDate.Year && x.newDate.Month == this.tempDate.Month).length;
      return item;
    })
    this.chartData = [...this.loginStatus.filter(x => x.Count > 0)];
    let counter: number = 0;
    for (let i = 0; i < 6; i++) {
      if (i == 0) {
        this.calendar.MonthWeeks[i] = {
          Value: i,
          Days: []
        }

        for (let j = this.calendar.FirstDayOfWeek - 1; j < 7; j++) {
          counter++;
          let state: string;

          if (this.calendar.MinDays.filter(x => x.days == counter).length > 0 || this.calendar.MaxDays.filter(x => x.days == counter).length > 0) {
            state = 'disabled'
          }

          let compareDate: IInputDateVM = { Year: this.calendar.CurrentYear, Month: this.calendar.CurrentMonth, Date: counter };
          let compareLoginReportArray: ILoginReport[] = this.loginDetails.filter(x => x.newDate.Year == compareDate.Year && x.newDate.Month == compareDate.Month && x.newDate.Date == compareDate.Date);
          this.calendar.MonthWeeks[i].Days[j] = {
            Value: counter,
            State: compareLoginReportArray.length > 0 ? compareLoginReportArray[0].LoginStatus.ColorCode : '',
            Selected: compareLoginReportArray.length > 0 ? compareLoginReportArray[0].Id.toString() : ''
          };
        }
      } else {
        this.calendar.MonthWeeks[i] = {
          Value: i,
          Days: []
        }
        for (let j = 0; j < 7; j++) {
          if (counter < this.calendar.NoOfDays) {
            counter++;
            let state: string;

            let compareDate: IInputDateVM = { Year: this.calendar.CurrentYear, Month: this.calendar.CurrentMonth, Date: counter };
            let compareLoginReportArray: ILoginReportVM[] = this.loginDetails.filter(x => x.newDate.Year == compareDate.Year && x.newDate.Month == compareDate.Month && x.newDate.Date == compareDate.Date);
            this.calendar.MonthWeeks[i].Days[j] = {
              Value: counter,
              State: compareLoginReportArray.length > 0 ? compareLoginReportArray[0].LoginStatus.ColorCode : '',
              Selected: compareLoginReportArray.length > 0 ? compareLoginReportArray[0].Id.toString() : ''
            };
          }
        }
      }
    }

  }

  getPrevMonthCalendarData(Month?: number) {
    this.tempDate.Year = (Number(Month) - 1) >= 1 ? Number(this.tempDate.Year) : Number(this.tempDate.Year) - 1;
    this.tempDate.Month = (Number(Month) - 1) >= 1 ? Number(Month) - 1 : 12;
    this.tempDate.Date = 1;

    this.getCalendar(this.tempDate.Year, this.tempDate.Month);
  }

  getNextMonthCalendarData(Month?: number) {
    this.tempDate.Year = (Number(Month) + 1) <= 12 ? Number(this.tempDate.Year) : Number(this.tempDate.Year) + 1;
    this.tempDate.Month = (Number(Month) + 1) <= 12 ? Number(Month) + 1 : 1;
    this.tempDate.Date = 1;

    this.getCalendar(this.tempDate.Year, this.tempDate.Month);
  }

  selectDate(loginReportItem: string, Year?: number, Month?: number, Day?: number) {
    this.dateADAndBS = this.datePickerService.getDate(Year, Month, Day, this.dateType);
    this.setDateText();
    if (this.loginDetails.filter(x => x.Id == Number(loginReportItem)).length > 0) {
      this.selectedDate.emit(this.loginDetails.filter(x => x.Id == Number(loginReportItem))[0]);
    }
  }

  getTodayCalendar() {
    this.dateADAndBS = this.datePickerService.GetDate(1, new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
    this.getDefaultFormat();
    this.setDateText();
  }

  checkValidinputDate() {
    if (!this.inputDate) {
      this.inputDate = this.defaultDate;
    } else {
      this.inputDate.Year = this.inputDate.Year != undefined ? this.inputDate.Year : new Date().getFullYear();
      this.inputDate.Month = this.inputDate.Month != undefined ? this.inputDate.Month : new Date().getMonth() + 1;
      this.inputDate.Date = this.inputDate.Date != undefined ? this.inputDate.Date : new Date().getDate();
    }
  }

  checkValidDatePickerOptions() {
    if (!this.inputDatePickerOptions) {
      this.inputDatePickerOptions = this.defaultDatePickerOptions;
    } else {
      this.inputDatePickerOptions.closeOnDateSelect = this.inputDatePickerOptions.closeOnDateSelect == null ? this.defaultDatePickerOptions.closeOnDateSelect : this.inputDatePickerOptions.closeOnDateSelect;
      this.inputDatePickerOptions.dateType = this.inputDatePickerOptions.dateType == null ? this.defaultDatePickerOptions.dateType : this.inputDatePickerOptions.dateType;
      this.inputDatePickerOptions.minDate = this.inputDatePickerOptions.minDate == null ? this.defaultDatePickerOptions.minDate : this.inputDatePickerOptions.minDate;
      this.inputDatePickerOptions.maxDate = this.inputDatePickerOptions.maxDate == null ? this.defaultDatePickerOptions.maxDate : this.inputDatePickerOptions.maxDate;
    }
  }

}


