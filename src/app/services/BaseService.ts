import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  ICategory, ICompany, ICostCenter, IDepartment, IDesignation,
  IDivision, IEmployee, IEmployeePosition, IEmployeeShift,
  IEmployeeWorkArea, IHolidayList, IHolidayListDetails,
  ILeave, ILeaveTypeSetup, ILogin, ILoginLog, ILoginReport,
  ILoginValidate, ILoginGroup, ILoginGroupChild, ILoginShift,
  ILoginStatus, IMenu, IMenuTemplate, IMenuVsTemplate, IReligion,
  IReportTo, IRoster, IRosterDetail, IUser, IWorkArea, IParam,
  IDataType, ISelectListItem, IEmail, ILoginDeviceType, IEmployeeResign,
  IEmployeeStatusHistory, IEmployeeHolidayList, ILeaveChild, ILeaveStatus,
  IUnit, IClient, IServiceType, IServiceTypeName, IFiscalYear, IJobCodeGenerate,
  ITimeSheet, IPagination, IODataResult, IFGetTimeSheetReport_Result,
  IFGetTimeSheetDayWiseReport_Result, ILeavePolicy, ILeaveServiceType,
  ILeavePolicyEmployee, IBSADCal, ICompensableLeave, IFGetAttenSummary_Result,
  IFgetMonthlyAttenRepEmpwise_Result, IFGetHolidayListByCalendarYear_Result,
  IFEmployeeResign, IHRBankInfo, IHRDashainCal, IHRMGrade, INepaliMonthList,
  IEnglishMonthList, IHRMLedger, IHRMLevel, IHRLevelVsAllowances, IFGetledgerAllowanceAmountTB_Result,
  INotice, INoticeReceiver, IHRAM, IHRStaffInfo, IGtnDepartment, IGtnUnit, IGtnSubUnit,
  IGtnJobCode, IGtnTimeSheet, IGtnBillTypeStatus, IEmailLog, IHRStaffVsAllowance,
  IHRStaffInfoLog, IHRStaffVsAllowanceLog, IHRInsurance, IHRLeave,
  IHRLeaveNoOfDays, IFGetLeaveRecord, IHRAdvanceLoan, IFGetAdvanceAllowanceType,
  IEligibleExpMonth, IFGetAdvanceLoan, IBirthdayNotification, IHRAdvanceLoanLog,
  IHRInsentive, IHRExpenses, IHRSSheet1, IfgetIndividualTimeSheet_Result, IEmployeeContractRenew,
  IEmployeeContract, IEmployeeCertificate, IEmployeeNominee, IEmployeeDecoration, IEmployeeEducation,
  IEmployeeExperience, IEmployeeGenericInfo, IEmployeeGrievance, IEmployeeOtherActivity, IEmployeeSWMC,
  IEmployeeResearch, IEmployeeTraining, IEmployeeVacancy, IInfoCertificate, IInfoEducationLevel,
  IInfoEducationDivision, IInfoSWMC, IParamValue, IEmployeeCV, IEmployeeOtherDocument, IHRSalaryOpBal,
  IInfoOutSideMovement, IInfoOutSideTrnsportationType, IEmployee_OutsideMovement, IUserVsCompany, INavLedger, IHRStaffInfoNav
} from '../models/Models';

import {
  IFgetemployeeLoginReport_Result,
  IFgetholidaylistBoth_Result,
  IFgetFiscialyearID_Result,
  IFilterViewModel,
  IEligibleCompensableLeaveData,
  IEmployeeHolidayListData,
  IEmployeeWithEmpPosVM,
  IGtnJobCodeVM,
  IHRInsentiveVM,
  IFGetHRAdvanceLoanAll,
  IHRExpensesVM,
  IFgetLeaveApproval_Result,
  IGetPendingLeaveApproval,
  IGetEmployeeListLogin,
  IFgetLeaveUseDatewise_Result,
  FgetEmployeeTurnOver_Result,
  IFGetEmployeeContractRowId_Result,

  IFGetOutsideMovementStatus_Result,
  ICompanyVM,
  IFgetCurrentEmployeePosition_Result,
  ISalaryGetFoodExpCompanywise
} from '../models/ViewModels';
import { environment } from 'src/environments/environment';

export const domain: string = environment.domain;

export interface IService {
  getAll(query?: string): Observable<any>;
  get(id: number, query?: string): Observable<any>;
  put(id: number, item: any): Observable<any>;
  post(item?: any): Observable<any>;
  delete(id: number): Observable<any>;
}

export class Service<T> implements IService {
  public baseUrl = ``;

  constructor(public http: HttpClient) {
  }


  getAll(query?: string): Observable<T[]> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = '';
    }
    return this.http.get(this.baseUrl + query).pipe(
      map((res: any) => {

        if (<any>(res[`odata.count`]) != null) {
          return res;
        } else {
          return res.value;
        }
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
      })
    );
  }

  get(id: any, query?: string): Observable<T> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = '';
    }

    if (isNaN(id)) {
      return this.http.get(this.baseUrl + `('${id}')` + query).pipe(
        map((res: any) => {
          return res;
        }), catchError((err) => {
          console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
        })
      );

    } else {
      return this.http.get(this.baseUrl + `(${id})` + query).pipe(
        map((res: any) => {
          return res;
        }), catchError((err) => {
          console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
        })
      );
    }

  }

  put(id: any, item?: T): Observable<T> {
    return this.http.put(this.baseUrl + `(${id})`, item).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
      })
    );
  }

  post(item?: T): Observable<T> {
    return this.http.post(this.baseUrl, item).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
      })
    );
  }

  delete(id: any): Observable<T> {
    return this.http.delete(this.baseUrl + `(${id})`).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class CategoryService extends Service<ICategory> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Category`;
}

@Injectable({ providedIn: 'root' })
export class CompanyService extends Service<ICompany> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Company`;
}

@Injectable({ providedIn: 'root' })
export class CostCenterService extends Service<ICostCenter> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/CostCenter`;
}

@Injectable({ providedIn: 'root' })
export class DepartmentService extends Service<IDepartment> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Department`;
}

@Injectable({ providedIn: 'root' })
export class DesignationService extends Service<IDesignation> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Designation`;
}

@Injectable({ providedIn: 'root' })
export class DivisionService extends Service<IDivision> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Division`;
}

@Injectable({ providedIn: 'root' })
export class EmailService extends Service<IEmail> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Email`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService extends Service<IEmployee> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeNomineeService extends Service<IEmployeeNominee> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Nominee`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeContractService extends Service<IEmployeeContract> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Contract`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeCertificateService extends Service<IEmployeeCertificate>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Certificate`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeCVService extends Service<IEmployeeCV>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_CV`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeDecorationService extends Service<IEmployeeDecoration>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Decoration`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeEducationService extends Service<IEmployeeEducation>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Education`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeExperienceService extends Service<IEmployeeExperience>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Experience`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeGenericInfoService extends Service<IEmployeeGenericInfo>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_GenericInfo`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeGrievanceService extends Service<IEmployeeGrievance>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Grievance`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeOtherActivityService extends Service<IEmployeeOtherActivity>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_OtherActivity`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeOtherDocumentService extends Service<IEmployeeOtherDocument>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Other_Document`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeResearchService extends Service<IEmployeeResearch>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Research`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeSWMCService extends Service<IEmployeeSWMC>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_SWMC`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeTrainingService extends Service<IEmployeeTraining>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Training`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeVacancyService extends Service<IEmployeeVacancy>
{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_Vacancy`;
}

@Injectable({ providedIn: 'root' })
export class EmployeePositionService extends Service<IEmployeePosition> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/EmployeePosition`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeShiftService extends Service<IEmployeeShift>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/EmployeeShift`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeWorkAreaService extends Service<IEmployeeWorkArea>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/EmployeeWorkArea`;
}


@Injectable({ providedIn: 'root' })
export class HolidayListService extends Service<IHolidayList>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HolidayList`;
}

@Injectable({ providedIn: 'root' })
export class HolidayListDetailsService extends Service<IHolidayListDetails>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HolidayListDetails`;
}

@Injectable({ providedIn: 'root' })
export class InfoCertificateService extends Service<IInfoCertificate>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/InfoCertificate`;
}

@Injectable({ providedIn: 'root' })
export class InfoEducationDivisionService extends Service<IInfoEducationDivision>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/InfoEducationDivision`;
}

@Injectable({ providedIn: 'root' })
export class InfoSWMCService extends Service<IInfoSWMC>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/InfoSWMC`;
}

@Injectable({ providedIn: 'root' })
export class InfoEducationLevelService extends Service<IInfoEducationLevel>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/InfoEducationLevel`;
}


@Injectable({ providedIn: 'root' })
export class LeaveService extends Service<ILeave>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Leave`;
}

@Injectable({ providedIn: 'root' })
export class LeaveTypeService extends Service<ILeaveTypeSetup>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LeaveType`;
}

@Injectable({ providedIn: 'root' })
export class LoginValidateService extends Service<ILoginValidate>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LoginValidate`;
}

@Injectable({ providedIn: 'root' })
export class LoginReportService extends Service<ILoginReport>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LoginReport`;
}

@Injectable({ providedIn: 'root' })
export class LoginLogService extends Service<ILoginLog>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LoginLog`;
}

@Injectable({ providedIn: 'root' })
export class LoginService extends Service<ILogin>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LoginReport`;
}

@Injectable({ providedIn: 'root' })
export class LoginGroup extends Service<ILoginGroup>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LoginGroup`;
}

@Injectable({ providedIn: 'root' })
export class LoginGroupChildService extends Service<ILoginGroupChild>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LoginGroupChild`;
}

@Injectable({ providedIn: 'root' })
export class LoginShiftService extends Service<ILoginShift>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LoginShift`;
}

@Injectable({ providedIn: 'root' })
export class NavLedgerService extends Service<INavLedger>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/NavLedger`;
}

@Injectable({ providedIn: 'root' })
export class LoginStatusService extends Service<ILoginStatus>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LoginStatus`;

  getValidationStatus(): Observable<ILoginStatus[]> {
    return this.http.get(`${domain}api/ScriptExecute/ValidateStatus`).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class LoginDeviceTypeService extends Service<ILoginDeviceType>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LoginDeviceType`;
}

@Injectable({ providedIn: 'root' })
export class MenuService extends Service<IMenu>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Menu`;
}

@Injectable({ providedIn: 'root' })
export class MenuTemplateService extends Service<IMenuTemplate>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/MenuTemplate`;
}

@Injectable({ providedIn: 'root' })
export class MenuVsTemplateService extends Service<IMenuVsTemplate>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/MenuVsTemplate`;
}

@Injectable({ providedIn: 'root' })
export class ReligionService extends Service<IReligion>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Religion`;
}

@Injectable({ providedIn: 'root' })
export class HRSalaryOpBalService extends Service<IHRSalaryOpBal>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRSalaryOpBal`;
}

@Injectable({ providedIn: 'root' })
export class ReportToService extends Service<IReportTo>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/ReportTo`;
  getAssignedUser(id: any): Observable<IReportTo[]> {
    return this.http.get(this.baseUrl + `(${id})`).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UnitService extends Service<IUnit>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Unit`;
}

@Injectable({ providedIn: 'root' })
export class ClientService extends Service<IClient>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Client`;
}

@Injectable({ providedIn: 'root' })
export class ServiceTypeService extends Service<IServiceType>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/ServiceType`;
}

@Injectable({ providedIn: 'root' })
export class ServiceTypeNameService extends Service<IServiceTypeName>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/ServiceTypeName`;
}

@Injectable({ providedIn: 'root' })
export class FiscalYearService extends Service<IFiscalYear>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/FiscalYear`;
}

@Injectable({ providedIn: 'root' })
export class JobCodeService extends Service<IJobCodeGenerate>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/JobCode`;
}

@Injectable({ providedIn: 'root' })
export class TimeSheetService extends Service<ITimeSheet>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/TimeSheet`;
}

@Injectable({ providedIn: 'root' })
export class RosterService extends Service<IRoster>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Roster`;
}

@Injectable({ providedIn: 'root' })
export class RosterDetailService extends Service<IRosterDetail>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/RosterDetail`;
}

@Injectable({ providedIn: 'root' })
export class LeavePolicyService extends Service<ILeavePolicy>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LeavePolicy`;
}

@Injectable({ providedIn: 'root' })
export class LeaveServiceTypeService extends Service<ILeaveServiceType>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LeaveServiceType`;
}

@Injectable({ providedIn: 'root' })
export class LeavePolicyEmployeeService extends Service<ILeavePolicyEmployee>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LeavePolicyEmployee`;
}

@Injectable({ providedIn: 'root' })
export class BSADCalService extends Service<IBSADCal>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/BSADCal`;
}

@Injectable({ providedIn: 'root' })
export class CompensableLeaveService extends Service<ICompensableLeave>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/CompensableLeave`;
}

@Injectable({ providedIn: 'root' })
export class HRBankInfoService extends Service<IHRBankInfo>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRBankInfo`;
}

@Injectable({ providedIn: 'root' })
export class HRDashainCalService extends Service<IHRDashainCal>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRDashainCal`;
}

@Injectable({ providedIn: 'root' })
export class HRMGradeService extends Service<IHRMGrade>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRMGrade`;
}

@Injectable({ providedIn: 'root' })
export class HRMLedgerService extends Service<IHRMLedger>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRMLedger`;
}

@Injectable({ providedIn: 'root' })
export class HRMLevelService extends Service<IHRMLevel>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRMLevel`;
}

@Injectable({ providedIn: 'root' })
export class NepaliMonthListService extends Service<INepaliMonthList>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/NepaliMonthList`;
}

@Injectable({ providedIn: 'root' })
export class EnglishMonthListService extends Service<IEnglishMonthList>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/EnglishMonthList`;
}

@Injectable({ providedIn: 'root' })
export class HRLevelVsAllowancesService extends Service<IHRLevelVsAllowances>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRLevelVsAllowances`;
}

@Injectable({ providedIn: 'root' })
export class HRAMService extends Service<IHRAM>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRAM`;
}

@Injectable({ providedIn: 'root' })
export class HRStaffInfoService extends Service<IHRStaffInfo>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRStaffInfo`;
}

@Injectable({ providedIn: 'root' })
export class HRStaffVSAllowanceService extends Service<IHRStaffVsAllowance>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRStaffVsAllowance`;
}

@Injectable({ providedIn: 'root' })
export class HRStaffInfoLogService extends Service<IHRStaffInfoLog>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRStaffInfoLog`;
}

@Injectable({ providedIn: 'root' })
export class HRStaffVSAllowanceLogService extends Service<IHRStaffVsAllowanceLog>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRStaffVsAllowanceLog`;
}

@Injectable({ providedIn: 'root' })
export class HRInsuranceService extends Service<IHRInsurance>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRInsurance`;
}

@Injectable({ providedIn: 'root' })
export class HRLeaveService extends Service<IHRLeave>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRLeave`;
}

@Injectable({ providedIn: 'root' })
export class HRLeaveNoOfdaysService extends Service<IHRLeaveNoOfDays>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRLeaveNoOfDays`;
}

@Injectable({ providedIn: 'root' })
export class HRAdvanceLoanService extends Service<IHRAdvanceLoan>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRAdvanceLoan`;
}

@Injectable({ providedIn: 'root' })
export class HRAdvanceLoanLogService extends Service<IHRAdvanceLoanLog>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRAdvanceLoanLog`;
}

@Injectable({ providedIn: 'root' })
export class GtnDepartmentService extends Service<IGtnDepartment>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/GtnDepartment`;
}

@Injectable({ providedIn: 'root' })
export class GtnUnitService extends Service<IGtnUnit>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/GtnUnit`;
}

@Injectable({ providedIn: 'root' })
export class GtnSubUnitService extends Service<IGtnSubUnit>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/GtnSubUnit`;
}

@Injectable({ providedIn: 'root' })
export class GtnJobCodeService extends Service<IGtnJobCode>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/GtnJobCode`;
}

@Injectable({ providedIn: 'root' })
export class GtnTimeSheetService extends Service<IGtnTimeSheet>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/GtnTimeSheet`;
}

@Injectable({ providedIn: 'root' })
export class GtnBillTypeStatusService extends Service<IGtnBillTypeStatus>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/GtnBillTypeStatus`;
}

@Injectable({ providedIn: 'root' })
export class NoticeService extends Service<INotice>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Notice`;
}

@Injectable({ providedIn: 'root' })
export class NoticeReceiverService extends Service<INoticeReceiver>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/NoticeReceiver`;
}

@Injectable({ providedIn: 'root' })
export class EmailLogService extends Service<IEmailLog>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/EmailLog`;
}

@Injectable({ providedIn: 'root' })
export class EligibleExpMonthService extends Service<IEligibleExpMonth>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/EligibleExpMonth`;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(public http: HttpClient) {
  }

  public baseUrl = `${domain}odata/User`;

  get(id: string, query?: string): Observable<IUser> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = '';
    }
    return this.http.get(this.baseUrl + `(${`'` + id + `'`})` + query).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
      })
    );
  }

  getAll(query?: string): Observable<IUser[]> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = '';
    }


    return this.http.get(this.baseUrl + query)
      .pipe(
        map((res: any) => {
          if (<any>(res[`odata.count`]) != null) {
            return res;
          } else {
            return res.value;
          }
        }), catchError((err) => {
          console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
        })
      );
  }

  put(id: string, item?: IUser): Observable<IUser> {
    return this.http.put(this.baseUrl + `(${`'` + id + `'`})`, item).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
      })
    );
  }

  post(item?: IUser): Observable<IUser> {
    return this.http.post(this.baseUrl, item).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
      })
    );
  }

  delete(id: string): Observable<IUser> {
    return this.http.delete(this.baseUrl + `(${`'` + id + `'`})`).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
      })
    );
  }

}

@Injectable({ providedIn: 'root' })
export class WorkAreaService extends Service<IWorkArea>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/WorkArea`;
}

@Injectable({ providedIn: 'root' })
export class DataTypeService extends Service<IDataType>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/DataType`;
}

@Injectable({ providedIn: 'root' })
export class ParamService extends Service<IParam>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Param`;
}


@Injectable({ providedIn: 'root' })
export class HRStaffInfoNavService extends Service<IHRStaffInfoNav>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRStaffInfoNav`;
}

@Injectable({ providedIn: 'root' })
export class ParamValueService {
  constructor(public http: HttpClient) {
  }


  public baseUrl = `${domain}odata/ParamValue`;

  get(id: string, query?: string): Observable<IParamValue> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = '';
    }

    return this.http.get(this.baseUrl + `('${id}')` + query).pipe(
      map((res: any) => {
        return res;
      }), catchError((err) => {
        console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
      })
    );
  }

  getDefaultDateSetup() {
    let query = `?$filter=PCode eq 'DDT' or PCode eq 'DFA' or PCode eq 'DFB'`;


    return this.http.get(this.baseUrl + query).pipe(map((res: any) => {
      var newRes = res;
      localStorage.setItem('Param.DateType', newRes.value.filter(x => x.PCode == 'DDT')[0].PValue);
      localStorage.setItem('Param.DefaultFormatAD', newRes.value.filter(x => x.PCode == 'DFA')[0].PValue);
      localStorage.setItem('Param.DefaultFormatBS', newRes.value.filter(x => x.PCode == 'DFB')[0].PValue);
      return newRes;
    }), catchError((err) => {
      console.log('Error Getting Data: ', err); return throwError('Something bad happened; please try again later.');;
    })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class EmployeeResignService extends Service<IEmployeeResign>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/EmployeeResign`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeStatusHistoryService extends Service<IEmployeeStatusHistory>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/EmployeeStatusHistory`;
}

@Injectable({ providedIn: 'root' })
export class EmployeeHolidayListService extends Service<IEmployeeHolidayList>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/EmployeeHolidayList`;
}

@Injectable({ providedIn: 'root' })
export class LeaveChildService extends Service<ILeaveChild>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LeaveChild`;
}

@Injectable({ providedIn: 'root' })
export class LeaveStatusService extends Service<ILeaveStatus>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/LeaveStatus`;
}

@Injectable({ providedIn: 'root' })
export class HRSSheet1Service extends Service<IHRSSheet1>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRSSheet1`;
}

@Injectable({ providedIn: 'root' })
export class Employee_OutsideMovementService extends Service<IEmployee_OutsideMovement>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/Employee_OutsideMovement`;

  public GetList(pagination: IPagination, empId?: number, statusId?: number, filterObj?: IFilterViewModel, startDate?: string, endDate?: string) {
    let query = '?';
    if (empId) {
      query += `EmployeeId=${empId}`;
    }
    if (filterObj.Name) {
      query += `&SearchText=${filterObj.Name}`;
    }
    if (filterObj.Sort && filterObj.SortingAttribute) {
      query += `&Sort=${filterObj.Sort}&SortingAttribute=${filterObj.SortingAttribute}`;
    }
    if (statusId) {
      query += `&StatusId=${statusId}`;
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${localStorage.getItem('Branch')}`;
    }
    if (startDate) {
      query += `&StartDate=${startDate}`;
    }
    if (endDate) {
      query += `&EndDate=${endDate}`;
    }

    return this.http.get(`${domain}api/OutsideMovement/GetList/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IGetPendingLeaveApproval[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      console.log(err);
      return Observable.throw(err);
    }));
  }

  public GetCSVList(empId?: number, statusId?: number, filterObj?: IFilterViewModel, startDate?: string, endDate?: string) {
    let query = '?';
    if (empId) {
      query += `EmployeeId=${empId}`;
    }
    if (filterObj.Name) {
      query += `&SearchText=${filterObj.Name}`;
    }
    if (statusId) {
      query += `&StatusId=${statusId}`;
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${localStorage.getItem('Branch')}`;
    }
    if (startDate) {
      query += `&StartDate=${startDate}`;
    }
    if (endDate) {
      query += `&EndDate=${endDate}`;
    }

    return this.http.get(`${domain}api/OutsideMovement/GetCSVList/${query}`).pipe(map((res: any) => {
      let result: IODataResult<IGetPendingLeaveApproval[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      console.log(err);
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class InfoOutSideMovementService extends Service<IInfoOutSideMovement>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/InfoOutSideMovement`;
}

@Injectable({ providedIn: 'root' })
export class InfoOutSideTrnsportationTypeService extends Service<IInfoOutSideTrnsportationType>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/InfoOutSideTrnsportationType`;
}

@Injectable({ providedIn: 'root' })
export class UserVsCompanyService extends Service<IUserVsCompany>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/UserVsCompany`;
}

@Injectable({ providedIn: 'root' })
export class ScriptExecuteService extends Service<ISelectListItem>{
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}api/ScriptExecute`;

  executeSql(item: string): Observable<ISelectListItem[]> {
    return this.http.post(this.baseUrl, { "value": item }).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      console.log(err);
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  public baseUrl = `${domain}api/LoginStatusCount`;

  constructor(public http: HttpClient) {
  }

  get(EmployeeId: number, Year: number, Month: number, GroupId?: number, query?: string): Observable<ILoginStatus> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = '';
    }
    return this.http.get(this.baseUrl + `(${"'" + EmployeeId + "'"})` + query).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class SupervisorListService {
  public baseUrl = `${domain}api/SupervisorList`;
  constructor(public http: HttpClient) {
  }

  GetEmpAllList(query?: string): Observable<IEmployee[]> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = ``;
    }
    if (localStorage.getItem("Branch")) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }

    return this.http.get(this.baseUrl + `/GetEmpAllList` + query).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetSupervisorName(EmployeeId: number): Observable<IEmployee[]> {

    return this.http.get(this.baseUrl + `/GetSupervisorName/${EmployeeId}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetSupervisorHierarchy(EmployeeId: number, query?: string): Observable<IEmployee[]> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = '';
    }

    return this.http.get(this.baseUrl + `/GetSupervisorHierarchy/${EmployeeId}` + query).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetAllSupervisorHierarchy(query?: string): Observable<IEmployee[]> {
    if (query != null) {
      query = `?${query}`;
    } else {
      query = ``;
    }
    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }






    return this.http.get(this.baseUrl + `/GetSupervisorHierarchy` + query).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetSupervisorHierarchyEmployeeList(EmployeeId: number, date: Date, pagination: IPagination, deptId?: string, desgId?: string, searchText?: string): Observable<IODataResult<IFgetemployeeLoginReport_Result[]>> {

    let reqDate: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;






    let queryParams = '?';

    if (deptId) {
      queryParams += `deptId=${deptId}&`;
    }
    if (desgId) {
      queryParams += `desgId=${desgId}&`;
    }
    if (searchText) {
      queryParams += `search=${searchText}`;
    }

    return this.http.get(this.baseUrl + `/GetSupervisorHierarchyEmployeeListLoginDate/${EmployeeId}/${reqDate}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${queryParams}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetAllSupervisorHierarchyEmployeeList(date: Date, pagination?: IPagination, deptId?: string, desgId?: string, searchText?: string): Observable<IODataResult<IFgetemployeeLoginReport_Result[]>> {

    let reqDate: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;






    let queryParams = '?';
    if (deptId) {
      queryParams += `deptId=${deptId}&`;
    }
    if (desgId) {
      queryParams += `desgId=${desgId}&`;
    }
    if (searchText) {
      queryParams += `search=${searchText}&`;
    }
    if (localStorage.getItem("Branch")) {
      queryParams += `Branch=${localStorage.getItem("Branch")}&`;
    }
    return this.http.get(this.baseUrl + `/GetSupervisorHierarchyEmployeeListLoginDate/${reqDate}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${queryParams}`).pipe(map((res: any) => {

      let result: IODataResult<IFgetemployeeLoginReport_Result[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetSupervisorHierarchyEmployeeListCSV(EmployeeId: number, date: Date): Observable<IODataResult<IFgetemployeeLoginReport_Result[]>> {
    let reqDate: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;






    return this.http.get(this.baseUrl + `/GetSupervisorHierarchyEmployeeListLoginDate/${EmployeeId}/${reqDate}/10000/1`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetAllSupervisorHierarchyEmployeeListCSV(date: Date): Observable<IODataResult<IFgetemployeeLoginReport_Result[]>> {
    let reqDate: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;





    let query = '';
    if (localStorage.getItem("Branch")) {
      query += `?Branch=${localStorage.getItem("Branch")}`;
    }
    return this.http.get(this.baseUrl + `/GetSupervisorHierarchyEmployeeListLoginDate/${reqDate}/10000/1${query}`).pipe(map((res: any) => {

      let result: IODataResult<IFgetemployeeLoginReport_Result[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetEmployeeListLoginMap(EmployeeId: number, date: Date): Observable<IODataResult<IFgetemployeeLoginReport_Result[]>> {
    let reqDate: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;





    return this.http.get(this.baseUrl + `/GetEmployeeLoginReportMap/${EmployeeId}/${reqDate}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetEmployeeListLoginMapAll(date: Date): Observable<IODataResult<IFgetemployeeLoginReport_Result[]>> {
    let reqDate: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;





    let query = '';
    if (localStorage.getItem("Branch")) {
      query += `?Branch=${localStorage.getItem("Branch")}`;
    }
    return this.http.get(this.baseUrl + `/GetEmployeeLoginReportMap/${reqDate}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetSupervisorHierarchyEmployeeListEmpPos(EmployeeId: number, pagination?: IPagination, employeeName?: string, departmentId?: number, designationId?: number): Observable<IODataResult<IEmployee[]>> {
    let query = '?';

    if (employeeName && employeeName != '') {
      query += `employeeName=${employeeName}&`;
    }
    if (departmentId) {
      query += `departmentId=${departmentId}&`;
    }
    if (designationId) {
      query += `designationId=${designationId}&`;
    }






    return this.http.get(this.baseUrl + `/GetSupervisorHierarchyEmployeeListEmpPos/${EmployeeId}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IEmployee[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetAllSupervisorHierarchyEmployeeListEmpPos(pagination?: IPagination, employeeName?: string, departmentId?: number, designationId?: number): Observable<IODataResult<IEmployee[]>> {
    let query = '?';

    if (employeeName && employeeName != '') {
      query += `employeeName=${employeeName}&`;
    }
    if (departmentId) {
      query += `departmentId=${departmentId}&`;
    }
    if (designationId) {
      query += `designationId=${designationId}&`;
    }
    if (localStorage.getItem("Branch")) {
      query += `Branch=${localStorage.getItem("Branch")}`;
    }






    return this.http.get(this.baseUrl + `/GetAllSupervisorHierarchyEmployeeListEmpPos/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IEmployee[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetEmployeeHierarchy(EmployeeId: number, pagination?: IPagination, filterObj?: IFilterViewModel, statusId?: number): Observable<IODataResult<IEmployeeWithEmpPosVM[]>> {
    let query = '?';
    if (filterObj != null) {
      if (filterObj.Sort && filterObj.Sort != '') {
        query += `Sort=${filterObj.Sort}&`;
      }
      if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
        query += `SortingAttribute=${filterObj.SortingAttribute}&`;
      }
      if (filterObj.Name && filterObj.Name != '') {
        query += `FilterName=${filterObj.Name}&`;
      }
    }

    if (statusId != null) {
      query += `StatusId=${statusId}&`;
    }
    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }






    return this.http.get(this.baseUrl + `/GetEmployeeHierarchy/${EmployeeId}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IEmployeeWithEmpPosVM[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
  GetUserHierarchy(statusId: number, pagination?: IPagination, employeeId?: number, filterObj?: IFilterViewModel): Observable<IODataResult<IUser[]>> {
    let query = '?';

    if (employeeId) {
      query += `EmployeeId=${employeeId}&`;
    }

    if (filterObj != null) {

      if (filterObj.Sort && filterObj.Sort != '') {
        query += `Sort=${filterObj.Sort}&`;
      }
      if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
        query += `SortingAttribute=${filterObj.SortingAttribute}&`;
      }
      if (filterObj.Name && filterObj.Name != '') {
        query += `FilterName=${filterObj.Name}&`;
      }
    }
    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }

    return this.http.get(this.baseUrl + `/GetUserHierarchy/${statusId}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IUser[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
  GetEmployeeWorkAreaHierarchy(pagination?: IPagination, employeeId?: number, filterObj?: IFilterViewModel): Observable<IODataResult<IEmployeeWorkArea[]>> {
    let query = '?';

    if (employeeId) {
      query += `EmployeeId=${employeeId}&`;
    }
    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }
    if (filterObj.Name && filterObj.Name != '') {
      query += `FilterName=${filterObj.Name}&`;
    }
    if (filterObj.SearchBy && filterObj.SearchBy != '') {
      query += `SearchBy=${filterObj.SearchBy}&`;
    }
    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }






    return this.http.get(this.baseUrl + `/GetEmployeeWorkAreaHierarchy/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IEmployeeWorkArea[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
  GetPromotionDetailHierarchy(pagination?: IPagination, employeeId?: number, filterObj?: IFilterViewModel, fromDate?: Date, toDate?: Date): Observable<IODataResult<IEmployeePosition[]>> {
    let query = '?';

    if (employeeId) {
      query += `EmployeeId=${employeeId}&`;
    }
    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }
    if (fromDate && fromDate != null) {
      query += `FromDate=${fromDate}&`;
    }
    if (toDate && toDate != null) {
      query += `ToDate=${toDate}&`;
    }
    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }






    return this.http.get(this.baseUrl + `/GetPromotionDetailHierarchy/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IEmployeePosition[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
  GetLeaveApprovalHierarchyForPending(pagination?: IPagination, employeeId?: number, filterObj?: IFilterViewModel, filterByStaff?: number, filterByFromDate?: Date, filterByToDate?: Date): Observable<IODataResult<IGetPendingLeaveApproval[]>> {
    let fromDate: string;
    let toDate: string;

    let query = '?';

    if (employeeId) {
      query += `EmployeeId=${employeeId}&`;
    }
    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }
    if (filterByStaff && filterByStaff != null) {
      query += `filterByStaff=${filterByStaff}&`;
    }
    if (filterByFromDate && filterByFromDate != null) {
      fromDate = `${filterByFromDate.getFullYear()}-${filterByFromDate.getMonth() + 1}-${filterByFromDate.getDate()}`;
      query += `filterByFromDate=${fromDate}&`;
    }
    if (filterByToDate && filterByToDate != null) {
      toDate = `${filterByToDate.getFullYear()}-${filterByToDate.getMonth() + 1}-${filterByToDate.getDate()}`;
      query += `filterByToDate=${toDate}&`;
    }
    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }






    return this.http.get(this.baseUrl + `/GetLeaveApprovalHierarchyForPending/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IGetPendingLeaveApproval[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetLeaveChildApprovalHierarchy(LeaveStatusId: number, pagination?: IPagination, employeeId?: number, filterObj?: IFilterViewModel, filterByStaff?: number, filterByFromDate?: Date, filterByToDate?: Date): Observable<IODataResult<IFgetLeaveApproval_Result[]>> {
    let fromDate: string;
    let toDate: string;
    let query = '?';

    if (employeeId) {
      query += `EmployeeId=${employeeId}&`;
    }
    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }
    if (filterByStaff && filterByStaff != null) {
      query += `filterByStaff=${filterByStaff}&`;
    }
    if (filterByFromDate && filterByFromDate != null) {
      fromDate = `${filterByFromDate.getFullYear()}-${filterByFromDate.getMonth() + 1}-${filterByFromDate.getDate()}`;
      query += `filterByFromDate=${fromDate}&`;
    }
    if (filterByToDate && filterByToDate != null) {
      toDate = `${filterByToDate.getFullYear()}-${filterByToDate.getMonth() + 1}-${filterByToDate.getDate()}`;
      query += `filterByToDate=${toDate}&`;
    }
    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }

    return this.http.get(this.baseUrl + `/GetLeaveChildApprovalHierarchy/${LeaveStatusId}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`)
      .pipe(map((res: any) => {
        let result: IODataResult<IFgetLeaveApproval_Result[]> = {
          count: res.count,
          value: res.value
        };
        return result;
      }), catchError((err) => {
        return Observable.throw(err);
      }));

  }
  GetEmployeeListLogin(pagination: IPagination, sortA?: string, sortT?: boolean, Search?: string): Observable<IODataResult<IGetEmployeeListLogin[]>> {
    let query = '';

    if (sortA != null) {
      if (sortT == null) {
        sortT = false;
      }
      query += `SortAttribute=${sortA}&`
      query += `SortToggle=${sortT}&`
    }
    if (Search != null && Search != '') {
      query += `Search=${Search}`;
    }

    return this.http.get(this.baseUrl + `/GetEmployeeListLogin/${pagination.ItemsPerPage}/${pagination.CurrentPage}?${query}`).pipe(map((res: any) => {
      let result: IODataResult<IGetEmployeeListLogin[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetHRmonthlyRep(EmpId: number, NMonth: string, NYear: string) {
    let query = '';
    return this.http.get(this.baseUrl + `/GetHRmonthlyRep/${EmpId}/${NMonth}/${NYear}`).pipe(map((res: any) => {
      let result: IODataResult<IGetEmployeeListLogin[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetEmployeeTurnOver(CompanyId: number, pagination: IPagination, filterObj?: IFilterViewModel, filterByFromDate?: Date, filterByToDate?: Date) {
    let startDate: string = `${filterByFromDate.getFullYear()}-${filterByFromDate.getMonth() + 1}-${filterByFromDate.getDate()}`;
    let endDate: string = `${filterByToDate.getFullYear()}-${filterByToDate.getMonth() + 1}-${filterByToDate.getDate()}`;

    let query = '';
    query += `filterByFromDate=${startDate}&filterByToDate=${endDate}`;

    if (filterObj != null) {
      if (filterObj.SortingAttribute != null) {
        query += `&Sort=${filterObj.Sort}&SortingAttribute=${filterObj.SortingAttribute}`;
      }
    }

    return this.http.get(this.baseUrl + `/GetEmployeeTurnOver/${CompanyId}/${pagination.ItemsPerPage}/${pagination.CurrentPage}?${query}`).pipe(map((res: any) => {
      let result: IODataResult<FgetEmployeeTurnOver_Result[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class TimeSheetReportFService {

  public baseUrl = `${domain}api/TimeSheetReport`;

  constructor(public http: HttpClient) {
  }

  GetTimeSheetReportHierarchy(fiscalYearStartDate: Date, fiscalYearEndDate: Date, pagination?: IPagination, employeeId?: number, filterByFiscalYear?: number, filterByStaff?: number, filterByJobCode?: number): Observable<IODataResult<ITimeSheet[]>> {
    let startDate: string = `${fiscalYearStartDate.getFullYear()}-${fiscalYearStartDate.getMonth() + 1}-${fiscalYearStartDate.getDate()}`;
    let endDate: string = `${fiscalYearEndDate.getFullYear()}-${fiscalYearEndDate.getMonth() + 1}-${fiscalYearEndDate.getDate()}`;

    let query = '?';

    if (employeeId) {
      query += `EmployeeId=${employeeId}&`;
    }
    if (filterByFiscalYear && filterByFiscalYear != null) {
      query += `filterByFiscalYear=${filterByFiscalYear}&`;
    }
    if (filterByStaff && filterByStaff != null) {
      query += `filterByStaff=${filterByStaff}&`;
    }
    if (filterByJobCode && filterByJobCode != null) {
      query += `filterByJobCode=${filterByJobCode}&`;
    }
    query += `&Branch=${localStorage.getItem("Branch")}`;

    return this.http.get(this.baseUrl + `/GetTimeSheetReportHierarchy/${startDate}/${endDate}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<ITimeSheet[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
  GetTimeSheetReportMonthWise(pagination: IPagination, employeeId: number, FiscalYearId: number, StaffId?: number, JobCodeId?: number): Observable<IODataResult<IFGetTimeSheetReport_Result[]>> {
    let query = '?';

    if (StaffId && StaffId != null) {
      query += `StaffId=${StaffId}&`;
    }
    if (JobCodeId && JobCodeId != null) {
      query += `JobCodeId=${JobCodeId}&`;
    }
    query += `&Branch=${localStorage.getItem("Branch")}`;

    return this.http.get(this.baseUrl + `/GetTimeSheetReportMonthWise/${pagination.ItemsPerPage}/${pagination.CurrentPage}/${employeeId}/${FiscalYearId}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IFGetTimeSheetReport_Result[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
  GetTimeSheetReportDayWise(StaffId: number, JobCodeId: number, StartDate: Date, EndDate: Date): Observable<IFGetTimeSheetDayWiseReport_Result> {
    let startDate: string = `${StartDate.getFullYear()}-${StartDate.getMonth() + 1}-${StartDate.getDate()}`;
    let endDate: string = `${EndDate.getFullYear()}-${EndDate.getMonth() + 1}-${EndDate.getDate()}`;
    let query = '';

    return this.http.get(this.baseUrl + `/GetTimeSheetReportDayWise/${StaffId}/${JobCodeId}/${startDate}/${endDate}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
  GetIndividualTimeSheet(StartDate: Date, EndDate: Date, pagination?: IPagination, StaffId?: number): Observable<IfgetIndividualTimeSheet_Result> {
    let startDate: string = `${StartDate.getFullYear()}-${StartDate.getMonth() + 1}-${StartDate.getDate()}`;
    let endDate: string = `${EndDate.getFullYear()}-${EndDate.getMonth() + 1}-${EndDate.getDate()}`;

    let query = '';

    if (StaffId != null) {
      query = `StaffId=${StaffId}`;
    }

    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }
    return this.http.get(this.baseUrl + `/GetIndividualTimeSheet/${startDate}/${endDate}/${pagination.ItemsPerPage}/${pagination.CurrentPage}?${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class HRExpensesService extends Service<IHRExpenses> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRExpenses`;

  GetEmployeeExpensesAll(pagination?: IPagination, filterObj?: IFilterViewModel, FilterByName?: string, FilterStartDate?: Date, FilterEndDate?: Date): Observable<IODataResult<IHRExpensesVM[]>> {
    let query = '?';
    if (filterObj != null) {
      if (filterObj.Sort && filterObj.Sort != '') {
        query += `Sort=${filterObj.Sort}&`;
      }
      if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
        query += `SortingAttribute=${filterObj.SortingAttribute}&`;
      }
    }
    if (FilterByName != null) {
      query += `FilterByName=${FilterByName}&`;
    }

    if (FilterStartDate != null) {
      query += `FilterStartDate=${FilterStartDate.getFullYear()}-${FilterStartDate.getMonth() + 1}-${FilterStartDate.getDate()}&`;
    }
    if (FilterEndDate != null) {
      query += `FilterEndDate=${FilterEndDate.getFullYear()}-${FilterEndDate.getMonth() + 1}-${FilterEndDate.getDate()}`;
    }
    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }




    return this.http.get(`${domain}api/HRExpensesAPI/List/${Number(pagination.SortBy)}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class HRIncentiveService extends Service<IHRInsentive> {
  constructor(http: HttpClient) { super(http); }; public baseUrl = `${domain}odata/HRInsentive`;

  GetEmployeeInsentivesAll(pagination?: IPagination, filterObj?: IFilterViewModel, FilterByName?: string, FilterStartDate?: Date, FilterEndDate?: Date): Observable<IODataResult<IHRInsentiveVM[]>> {
    let query = '?';
    if (filterObj != null) {
      if (filterObj.Sort && filterObj.Sort != '') {
        query += `Sort=${filterObj.Sort}&`;
      }
      if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
        query += `SortingAttribute=${filterObj.SortingAttribute}&`;
      }
    }
    if (FilterByName != null) {
      query += `FilterByName=${FilterByName}&`;
    }

    if (FilterStartDate != null) {
      query += `FilterStartDate=${FilterStartDate.getFullYear()}-${FilterStartDate.getMonth() + 1}-${FilterStartDate.getDate()}&`;
    }
    if (FilterEndDate != null) {
      query += `FilterEndDate=${FilterEndDate.getFullYear()}-${FilterEndDate.getMonth() + 1}-${FilterEndDate.getDate()}`;
    }
    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }

    return this.http.get(`${domain}api/HRIncentive/List/${Number(pagination.SortBy)}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetInsentiveByDate(ALId: number, FilterDate?: Date): Observable<IHRInsentiveVM[]> {
    let query = '?';
    query += `ALId=${ALId}`;
    if (FilterDate != null) {
      query += `&Date=${FilterDate.getFullYear()}-${FilterDate.getMonth() + 1}-${FilterDate.getDate()}&`;
    }

    return this.http.get(`${domain}api/HRIncentive/ListByDate${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  ImportFile(ExcelInsentives: IHRInsentiveVM[]): Observable<boolean> {

    return this.http.post(`${domain}api/HRIncentive/ImportFile`, ExcelInsentives).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

}

@Injectable({ providedIn: 'root' })
export class ChangePasswordService {
  public baseUrl = `${domain}api/ChangePassword`;

  constructor(public http: HttpClient) {
  }

  CheckCurrentPassword(Id: string, currentPassword: string): Observable<boolean> {
    return this.http.get(this.baseUrl + `/CheckCurrentPassword/${Id}/${currentPassword}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class CalculateLeaveDaysService {
  public baseUrl = `${domain}api/CalculateLeaveDays`;

  constructor(public http: HttpClient) {
  }

  GetLeaveDays(EmployeeId: number, effectiveDate: Date, numOfDays: number, isSandwich: boolean): Observable<IFgetholidaylistBoth_Result[]> {
    let effDate: string = `${effectiveDate.getFullYear()}-${effectiveDate.getMonth() + 1}-${effectiveDate.getDate()}`;

    return this.http.get(this.baseUrl + `/LeaveDays/${EmployeeId}/${effDate}/${numOfDays}/${isSandwich}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class CommonService {
  public baseUrl = `${domain}api/CommonService`;

  constructor(public http: HttpClient) {
  }

  getPValue(code: string): Observable<string> {
    return this.http.get(this.baseUrl + `/GetPValue/${code}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getFiscalYear(date: Date, noOfYear: number): Observable<IFgetFiscialyearID_Result[]> {
    let effDate: string = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;






    return this.http.get(this.baseUrl + `/GetFiscalYear/${effDate}/${noOfYear}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetMonthEndDate(year: number, month: number): Observable<Number> {
    return this.http.get(this.baseUrl + `/GetMonthEndDate/${year}/${month}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetConvertedDateAD(year: number, month: number, day: number): Observable<Date> {
    return this.http.get(this.baseUrl + `/GetConvertedDateAD/${year}/${month}/${day}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetParentLeaveType(serviceTypeParam: string, isFiscalYear: boolean): Observable<ILoginStatus[]> {
    return this.http.get(this.baseUrl + `/GetParentLeaveType/${serviceTypeParam}/${isFiscalYear}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetLeaveType(serviceTypeParam: string, isFiscalYear: boolean, calendarYear?: string, ): Observable<ILoginStatus[]> {
    let query = '?';

    if (calendarYear) {
      query += `calendarYear=${calendarYear}&`;
    }
    return this.http.get(this.baseUrl + `/GetLeaveType/${serviceTypeParam}/${isFiscalYear}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetLeaveTypeForEmployeeLeave(employeeId: number, unpaidLeaveId: number, leaveReqDate: Date): Observable<ILoginStatus[]> {
    let query = '?';
    if (leaveReqDate && leaveReqDate != null) {
      let tDate = `${leaveReqDate.getFullYear()}-${leaveReqDate.getMonth() + 1}-${leaveReqDate.getDate()}`;
      query += `leaveReqDate=${tDate}&`;
    }
    return this.http.get(this.baseUrl + `/GetLeaveTypeForEmployeeLeave/${employeeId}/${unpaidLeaveId}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetBirthdayNotification(): Observable<IBirthdayNotification[]> {
    return this.http.get(this.baseUrl + `/GetBirthdayNotification`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetCurrentTime(): Observable<Date> {
    return this.http.get(this.baseUrl + `/GetCurrentTime`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetOutsideMovementStatus(): Observable<IFGetOutsideMovementStatus_Result[]> {

    return this.http.get(this.baseUrl + `/GetOutsideMovementStatus`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetCompanyBranches(id?: string): Observable<ICompanyVM[]> {
    let query = '';
    if (id == null) {
      if (localStorage.getItem('UserId')) {
        query = `id=${localStorage.getItem('UserId')}`;
      }
    } else {
      query = `id=${id}`;
    }

    return this.http.get(this.baseUrl + `/GetCompanyBranches?${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetBranchManagers(): Observable<IUser[]> {
    return this.http.get(this.baseUrl + `/GetBranchManagers`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetEmployeePosition(empId: number): Observable<IFgetCurrentEmployeePosition_Result> {
    return this.http.get(this.baseUrl + `/GetEmployeePosition/${empId}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetLayoutMenu(): Observable<IMenu[]> {
    return this.http.get(this.baseUrl + `/GetLayoutMenu/${localStorage.getItem('UserId')}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getMainCompanyByBranchId(branchId: number): Observable<number> {
    return this.http.get(this.baseUrl + `/GetMainCompanyByBranchId/${branchId}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  saveLoginLogImport(loginLog: ILoginLog[]) {
    let saveLog: ILoginLog[] = [];
    loginLog.map(item => {
      item.Datetime.setTime(item.Datetime.getTime() - item.Datetime.getTimezoneOffset());
      saveLog.push(item);
      return item;
    })
    return this.http.post(this.baseUrl + `/SaveLoginLogImport`, saveLog).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  manualJobRun(fDate: Date, tDate: Date, companyId: number): Observable<any> {
    let sDate = `${fDate.getFullYear()}-${fDate.getMonth() + 1}-${fDate.getDate()}`;
    let eDate = `${tDate.getFullYear()}-${tDate.getMonth() + 1}-${tDate.getDate()}`;



    return this.http.get(this.baseUrl + `/manualJobRun/${sDate}/${eDate}/${companyId}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class CompensableLeaveReportService {
  public baseUrl = `${domain}api/CompensableLeaveReport`;

  constructor(public http: HttpClient) {
  }

  GetCompensableLoginReport(LoginStatusId: number, pagination?: IPagination, employeeId?: number, filterObj?: IFilterViewModel, filterByStaff?: number, filterByTDate?: Date): Observable<IODataResult<ILoginReport[]>> {
    let tDate: string;
    let query = '?';

    if (employeeId) {
      query += `EmployeeId=${employeeId}&`;
    }
    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }
    if (filterByStaff && filterByStaff != null) {
      query += `filterByStaff=${filterByStaff}&`;
    }
    if (filterByTDate && filterByTDate != null) {
      tDate = `${filterByTDate.getFullYear()}-${filterByTDate.getMonth() + 1}-${filterByTDate.getDate()}`;
      query += `filterByTDate=${tDate}&`;
    }

    return this.http.get(this.baseUrl + `/GetCompensableLoginReport/${LoginStatusId}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<ILoginReport[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }

  GetEligibleCompensationLeave(EmployeeId: number, StartDate?: Date, EndDate?: Date): Observable<IEligibleCompensableLeaveData[]> {
    let startDateFormat: Date = new Date(StartDate);
    let endDateFormat: Date = new Date(EndDate);
    let startDate: string;
    let endDate: string;

    let query = '?';
    if (StartDate && StartDate != null) {
      startDate = `${startDateFormat.getFullYear()}-${startDateFormat.getMonth() + 1}-${startDateFormat.getDate()}`;
      query += `startDate=${startDate}&`;
    }
    if (EndDate && EndDate != null) {
      endDate = `${endDateFormat.getFullYear()}-${endDateFormat.getMonth() + 1}-${endDateFormat.getDate()}`;
      query += `endDate=${endDate}&`;
    }

    return this.http.get(this.baseUrl + `/GetEligibleCompensationLeave/${EmployeeId}/${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
}

@Injectable({ providedIn: 'root' })
export class EmployeeHolidayListDataService {
  public baseUrl = `${domain}api/EmployeeHolidayListDataService`;

  constructor(public http: HttpClient) {
  }

  GetEmployeeHolidayList(EmployeeId: number, StartDate: Date, EndDate: Date): Observable<IEmployeeHolidayListData[]> {
    let sDate: Date = new Date(StartDate);
    let eDate: Date = new Date(EndDate);

    let startDate: string = `${sDate.getFullYear()}-${sDate.getMonth() + 1}-${sDate.getDate()}`;
    let endDate: string = `${eDate.getFullYear()}-${eDate.getMonth() + 1}-${eDate.getDate()}`;

    return this.http.get(this.baseUrl + `/GetEmployeeHolidayList/${EmployeeId}/${startDate}/${endDate}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetHolidayListByCalendarYear(CalendarYear: number): Observable<IFGetHolidayListByCalendarYear_Result[]> {
    return this.http.get(this.baseUrl + `/GetHolidayListByCalendarYear/${CalendarYear}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetHolidayListDetailsByCalendarYear(ListId: number, StartDate: Date, EndDate: Date): Observable<IHolidayListDetails[]> {
    let sDate: Date = new Date(StartDate);
    let eDate: Date = new Date(EndDate);

    let startDate: string = `${sDate.getFullYear()}-${sDate.getMonth() + 1}-${sDate.getDate()}`;
    let endDate: string = `${eDate.getFullYear()}-${eDate.getMonth() + 1}-${eDate.getDate()}`;

    return this.http.get(this.baseUrl + `/GetHolidayListDetailsByCalendarYear/${ListId}/${startDate}/${endDate}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class EmployeeLeavePolicyReportService {
  public baseUrl = `${domain}api/EmployeeLeavePolicyReport`;

  constructor(public http: HttpClient) {
  }

  GetEmployeeLeavePolicyReport(pagination?: IPagination, employeeId?: number, filterObj?: IFilterViewModel, isFiscalYear?: boolean, filterByYear?: string): Observable<IODataResult<ILeavePolicyEmployee[]>> {
    let tDate: string;
    let query = '?';

    if (employeeId) {
      query += `EmployeeId=${employeeId}&`;
    }
    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }
    if (isFiscalYear != null) {
      query += `isFiscalYear=${isFiscalYear}&`;
    }
    if (filterByYear != null) {
      query += `Year=${filterByYear}`;
    }
    if (localStorage.getItem("Branch") != null) {
      query += `&Branch=${localStorage.getItem("Branch")}`;
    }

    return this.http.get(this.baseUrl + `/GetEmployeeLeavePolicyReport/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<ILeavePolicyEmployee[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class EmployeeAttendanceReportService {
  public baseUrl = `${domain}api/EmployeeAttendance`;
  constructor(public http: HttpClient) {
  }

  GetEmployeeAttendanceDetail(EmployeeId: number, StartDate: Date, EndDate: Date, filterObj?: IFilterViewModel): Observable<IFGetAttenSummary_Result[]> {
    let query = '?';
    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${Number(localStorage.getItem('Branch'))}&`;
    }

    let sDate: Date = new Date(StartDate);
    let eDate: Date = new Date(EndDate);

    let startDate: string;
    let endDate: string;

    startDate = `${sDate.getFullYear()}-${sDate.getMonth() + 1}-${sDate.getDate()}`;
    endDate = `${eDate.getFullYear()}-${eDate.getMonth() + 1}-${eDate.getDate()}`;

    return this.http.get(this.baseUrl + `/GetEmployeeAttendanceDetail/${EmployeeId}/${startDate}/${endDate}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  GetMonthlyAttendanceDetail(EmployeeId: number, StartDate: Date, EndDate: Date, filterObj?: IFilterViewModel): Observable<IFgetMonthlyAttenRepEmpwise_Result[]> {
    let query = '?';
    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${Number(localStorage.getItem('Branch'))}&`;
    }

    let sDate: Date = new Date(StartDate);
    let eDate: Date = new Date(EndDate);

    let startDate: string;
    let endDate: string;

    startDate = `${sDate.getFullYear()}-${sDate.getMonth() + 1}-${sDate.getDate()}`;
    endDate = `${eDate.getFullYear()}-${eDate.getMonth() + 1}-${eDate.getDate()}`;

    return this.http.get(this.baseUrl + `/GetMonthlyAttendanceDetail/${EmployeeId}/${startDate}/${endDate}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class ResignedEmployeeReportService {
  public baseUrl = `${domain}api/ResignedEmployee`;

  constructor(public http: HttpClient) {
  }

  GetAllResignedEmployee(pagination?: IPagination, filterObj?: IFilterViewModel, types?: number, approvalId?: number): Observable<IODataResult<IFEmployeeResign[]>> {
    let query = '?';

    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }
    if (filterObj.Name && filterObj.Name != '') {
      query += `FilterName=${filterObj.Name}&`;
    }
    if (types != null) {
      query += `type=${types}&`;
    }
    if (approvalId != null) {
      query += `approvalId=${approvalId}&`;
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${Number(localStorage.getItem('Branch'))}&`;
    }

    return this.http.get(this.baseUrl + `/GetAllResignedEmployee/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IFEmployeeResign[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
  GetResignedEmployeeUnderManager(employeeId: number, pagination?: IPagination, filterObj?: IFilterViewModel, types?: number, approvalId?: number): Observable<IODataResult<IFEmployeeResign[]>> {
    let query = '?';

    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }
    if (filterObj.Name && filterObj.Name != '') {
      query += `FilterName=${filterObj.Name}&`;
    }
    if (types != null) {
      query += `type=${types}&`;
    }
    if (approvalId != null) {
      query += `approvalId=${approvalId}&`;
    }

    return this.http.get(this.baseUrl + `/GetResignedEmployeeUnderManager/${employeeId}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IFEmployeeResign[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class PayrollService {
  public baseUrl = `${domain}api/Payroll`;

  constructor(public http: HttpClient) {
  }

  getledgerAllowanceAmount(lvlId: number): Observable<IFGetledgerAllowanceAmountTB_Result[]> {
    return this.http.get(this.baseUrl + `/GetledgerAllowanceAmount/${lvlId}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getStaffAllowanceAmount(staffId: number): Observable<IFGetledgerAllowanceAmountTB_Result[]> {
    return this.http.get(this.baseUrl + `/GetStaffAllowanceAmount/${staffId}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getAdvanceAllowanceType(): Observable<IFGetAdvanceAllowanceType[]> {
    return this.http.get(this.baseUrl + `/GetAdvanceAllowanceType`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  createSalSht(FYId: number, year: number, month: number, isBonus: boolean, userId: string, compId: number): Observable<Boolean> {
    return this.http.get(this.baseUrl + `/CreateSalSheet?FYID=${FYId}&Year=${year}&Month=${month}&isBonus=${isBonus}&UserId=${userId}&CompId=${compId}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getSalSht(year?: number, month?: number): Observable<any> {
    let query = `?Year=${year}&Month=${month}`;
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${Number(localStorage.getItem('Branch'))}&`;
    }

    return this.http.get(this.baseUrl + `/GetSalSheet` + query).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getSalShtMerge(start: string, end: string): Observable<any> {
    let query = `?Start=${start}&End=${end}`;
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${Number(localStorage.getItem('Branch'))}&`;
    }

    return this.http.get(this.baseUrl + `/GetSalSheetMerge` + query).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getSalShtDepWise(deptId?: number, year?: number, month?: number): Observable<any> {
    let query = `?Year=${year}&Month=${month}&DeptId=${deptId}`;
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${Number(localStorage.getItem('Branch'))}&`;
    }

    return this.http.get(this.baseUrl + `/GetSalSheetDepWise${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  vefrifyDelSalSheet(flag: string, TId: number, userId: string): Observable<boolean> {
    return this.http.get(this.baseUrl + `/VefrifyDelSalSheet?Flag=${flag}&Tid1=${TId}&verifyBy=${userId}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getSalSlip(year?: number, month?: number, employeeId?: number) {
    return this.http.get(this.baseUrl + `/GetSalarySlip?Year=${year}&Month=${month}&EmployeeId=${employeeId}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getSalShtToPF(year?: number, month?: number, flag?: string, pagination?: IPagination, filterObj?: IFilterViewModel, FilterByName?: string) {
    let query = `&Flag=${flag}`;
    if (flag != 'all') {
      query += `&ItemPerPage=${pagination.ItemsPerPage}`;
      query += `&CurrentPage=${pagination.CurrentPage}`;

      if (filterObj.Sort != null) {
        query += `&Sort=${filterObj.Sort}`;
        query += `&SortingAttribute=${filterObj.SortingAttribute}`;
      }

      if (FilterByName != null && FilterByName != '') {
        query += `&FilterByName=${FilterByName}`;
      }
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${localStorage.getItem('Branch')}`;
    }

    return this.http.get(this.baseUrl + `/GetSalShtToPF?Year=${year}&Month=${month}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getGTSalShtToPF(year?: number, month?: number) {
    let query = '';
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${localStorage.getItem('Branch')}`;
    }

    return this.http.get(this.baseUrl + `/GetGTSalShtToPF?Year=${year}&Month=${month}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getSalShtToCIT(year?: number, month?: number, flag?: string, pagination?: IPagination, filterObj?: IFilterViewModel, FilterByName?: string) {
    let query = `&Flag=${flag}`;
    if (flag != 'all') {
      query += `&ItemPerPage=${pagination.ItemsPerPage}`;
      query += `&CurrentPage=${pagination.CurrentPage}`;

      if (filterObj.Sort != null) {
        query += `&Sort=${filterObj.Sort}`;
        query += `&SortingAttribute=${filterObj.SortingAttribute}`;
      }

      if (FilterByName != null && FilterByName != '') {
        query += `&FilterByName=${FilterByName}`;
      }
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${localStorage.getItem('Branch')}`;
    }

    return this.http.get(this.baseUrl + `/GetSalShtToCIT?Year=${year}&Month=${month}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getGTSalShtToCIT(year?: number, month?: number) {
    let query = '';
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${localStorage.getItem('Branch')}`;
    }
    return this.http.get(this.baseUrl + `/GetGTSalShtToPF?Year=${year}&Month=${month}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getSalShtToBank(bankId?: number, year?: number, month?: number, flag?: string, pagination?: IPagination, filterObj?: IFilterViewModel, FilterByName?: string) {
    let query = `&Flag=${flag}`;
    query += `&ItemPerPage=${pagination.ItemsPerPage}`;
    query += `&CurrentPage=${pagination.CurrentPage}`;
    if (flag != 'all') {
      if (filterObj.Sort != null) {
        query += `&Sort=${filterObj.Sort}`;
        query += `&SortingAttribute=${filterObj.SortingAttribute}`;
      }

      if (FilterByName != null && FilterByName != '') {
        query += `&FilterByName=${FilterByName}`;
      }
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${localStorage.getItem('Branch')}`;
    }

    return this.http.get(this.baseUrl + `/GetSalShtToBank?BankId=${bankId}&Year=${year}&Month=${month}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getSalShtToTax(year?: number, month?: number, flag?: string, pagination?: IPagination, filterObj?: IFilterViewModel, FilterByName?: string) {
    let query = `&Flag=${flag}`;
    if (flag != 'all') {
      query += `&ItemPerPage=${pagination.ItemsPerPage}`;
      query += `&CurrentPage=${pagination.CurrentPage}`;

      if (filterObj.Sort != null) {
        query += `&Sort=${filterObj.Sort}`;
        query += `&SortingAttribute=${filterObj.SortingAttribute}`;
      }

      if (FilterByName != null && FilterByName != '') {
        query += `&FilterByName=${FilterByName}`;
      }
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${localStorage.getItem('Branch')}`;
    }

    return this.http.get(this.baseUrl + `/GetSalShtToTax?Year=${year}&Month=${month}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getSalShtToBankDepWise(bankId?: number, deptId?: number, year?: number, month?: number, flag?: string, pagination?: IPagination, filterObj?: IFilterViewModel, FilterByName?: string) {
    let query = `&Flag=${flag}`;
    query += `&ItemPerPage=${pagination.ItemsPerPage}`;
    query += `&CurrentPage=${pagination.CurrentPage}`;
    if (flag != 'all') {
      if (filterObj.Sort != null) {
        query += `&Sort=${filterObj.Sort}`;
        query += `&SortingAttribute=${filterObj.SortingAttribute}`;
      }

      if (FilterByName != null && FilterByName != '') {
        query += `&FilterByName=${FilterByName}`;
      }
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${localStorage.getItem('Branch')}`;
    }

    return this.http.get(this.baseUrl + `/GetSalShtToBankDepwise?BankId=${bankId}&DeptId=${deptId}&Year=${year}&Month=${month}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  getEmployeeFoodAllowance(branch?: number, year?: number, month?: number): Observable<ISalaryGetFoodExpCompanywise[]> {
    let query = "";

    if (branch != null) {
      query += `&Branch=${branch}`;
    } else if (localStorage.getItem('Branch')) {
      query += `&Branch=${localStorage.getItem('Branch')}`;
    }

    return this.http.get(this.baseUrl + `/EmployeeFoodAllowance?Year=${year}&Month=${month}${query}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class GtnJobCodeReportService {
  public baseUrl = `${domain}api/GtnJobCodeService`;

  constructor(public http: HttpClient) {
  }

  GetJobCodeList(subUnitId: number, pagination?: IPagination, filterObj?: IFilterViewModel): Observable<IODataResult<IGtnJobCodeVM[]>> {
    let query = '?';

    if (filterObj.Sort && filterObj.Sort != '') {
      query += `Sort=${filterObj.Sort}&`;
    }
    if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
      query += `SortingAttribute=${filterObj.SortingAttribute}&`;
    }

    return this.http.get(this.baseUrl + `/GetJobCodeList/${subUnitId}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IGtnJobCodeVM[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class GtnTimeSheetReportService {
  public baseUrl = `${domain}api/GtnTimeSheetService`;

  constructor(public http: HttpClient) {
  }

  GetGtnTimeSheetReportMonthWise(pagination: IPagination, employeeId: number, FiscalYearId: number, StaffId?: number, JobCodeId?: number): Observable<IODataResult<IFGetTimeSheetReport_Result[]>> {
    let query = '?';

    if (StaffId && StaffId != null) {
      query += `StaffId=${StaffId}&`;
    }
    if (JobCodeId && JobCodeId != null) {
      query += `JobCodeId=${JobCodeId}&`;
    }

    return this.http.get(this.baseUrl + `/GetGtnTimeSheetReportMonthWise/${pagination.ItemsPerPage}/${pagination.CurrentPage}/${employeeId}/${FiscalYearId}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IFGetTimeSheetReport_Result[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }

  GetGtnTimeSheetReportDayWise(StaffId: number, JobCodeId: number, StartDate: Date, EndDate: Date): Observable<IFGetTimeSheetDayWiseReport_Result> {
    let startDate: string = `${StartDate.getFullYear()}-${StartDate.getMonth() + 1}-${StartDate.getDate()}`;
    let endDate: string = `${EndDate.getFullYear()}-${EndDate.getMonth() + 1}-${EndDate.getDate()}`;

    return this.http.get(this.baseUrl + `/GetGtnTimeSheetReportDayWise/${StaffId}/${JobCodeId}/${startDate}/${endDate}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
}

@Injectable({ providedIn: 'root' })
export class EmployeeListWithFilterService {
  public baseUrl = `${domain}api/EmployeeListWithFilter`;

  constructor(public http: HttpClient) {
  }

  GetEmployeeList(EmployeeId: number, pagination?: IPagination, filterObj?: IFilterViewModel, statusId?: number, FilterByName?: string, FilterByDesignation?: string, FilterByDepartment?: string, FilterNoSalDetail?: boolean): Observable<IODataResult<IEmployeeWithEmpPosVM[]>> {
    let query = '?';
    if (filterObj != null) {
      if (filterObj.Sort && filterObj.Sort != '') {
        query += `Sort=${filterObj.Sort}&`;
      }
      if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
        query += `SortingAttribute=${filterObj.SortingAttribute}&`;
      }
    }

    if (statusId != null) {
      query += `StatusId=${statusId}&`;
    }
    if (FilterByName != null) {
      query += `FilterByName=${FilterByName}&`;
    }
    if (FilterByDesignation != null) {
      query += `FilterByDesignation=${FilterByDesignation}&`;
    }
    if (FilterByDepartment != null) {
      query += `FilterByDepartment=${FilterByDepartment}&`;
    }
    if (FilterNoSalDetail != null) {
      query += `FilterNoSalDetail=${FilterNoSalDetail}&`;
    }

    if (localStorage.getItem('Branch')) {
      query += `&Branch=${Number(localStorage.getItem('Branch'))}`;
    }

    return this.http.get(this.baseUrl + `/GetEmployeeList/${EmployeeId}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IEmployeeWithEmpPosVM[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
}

@Injectable({ providedIn: 'root' })
export class HRLeaveRecordListService {
  public baseUrl = `${domain}api/HRLeaveRecord`;

  constructor(public http: HttpClient) {
  }

  GetLeaveList(
    EmployeeId: number,
    pagination?: IPagination,
    filterObj?: IFilterViewModel,
    FilterByYear?: string,
    FilterByMonth?: string,
    FilterByName?: string,
    startDateInString?: string,
    endDateInString?: string
  ): Observable<IODataResult<IFGetLeaveRecord[]>> {
    let query = '?';
    if (filterObj != null) {
      if (filterObj.Sort && filterObj.Sort != '') {
        query += `Sort=${filterObj.Sort}&`;
      }
      if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
        query += `SortingAttribute=${filterObj.SortingAttribute}&`;
      }
    }

    if (FilterByYear != null) {
      query += `FilterByYear=${FilterByYear}&`;
    }
    if (FilterByMonth != null) {
      query += `FilterByMonth=${FilterByMonth}&`;
    }
    if (FilterByName != null) {
      query += `FilterByName=${FilterByName}&`;
    }
    if (startDateInString != null) {
      query += `StartDate=${startDateInString}&`;
    }
    if (endDateInString != null) {
      query += `EndDate=${endDateInString}&`;
    }
    if (localStorage.getItem('Param.DateType') != null) {
      query += `DateType=${Number(localStorage.getItem('Param.DateType'))}`;
    }
    if (localStorage.getItem('Branch')) {
      query += `&Branch=${Number(localStorage.getItem('Branch'))}`;
    }

    return this.http.get(this.baseUrl + `/GetLeaveList/${EmployeeId}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IFGetLeaveRecord[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
}

@Injectable({ providedIn: 'root' })
export class HRAdvanceLoanRecordService {
  public baseUrl = `${domain}api/HRAdvanceLoanRecord`;

  constructor(public http: HttpClient) {
  }

  GetAdvanceLoanList(pagination?: IPagination, filterObj?: IFilterViewModel, FilterByName?: string, FilterByFromDate?: Date, FilterByToDate?: Date): Observable<IODataResult<IFGetHRAdvanceLoanAll[]>> {
    let FromDate;
    if (FilterByFromDate) {
      FromDate = `${FilterByFromDate.getFullYear()}-${FilterByFromDate.getMonth() + 1}-${FilterByFromDate.getDate()}`;
    }
    let ToDate;
    if (FilterByToDate) {
      ToDate = `${FilterByToDate.getFullYear()}-${FilterByToDate.getMonth() + 1}-${FilterByToDate.getDate()}`;
    }

    let query = '?';
    if (filterObj != null) {
      if (filterObj.Sort && filterObj.Sort != '') {
        query += `Sort=${filterObj.Sort}&`;
      }
      if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
        query += `SortingAttribute=${filterObj.SortingAttribute}&`;
      }
      if (filterObj.Name != null && filterObj.Name != '') {
        query += `FilterByName=${filterObj.Name}&`;
      }
    }

    if (localStorage.getItem('Branch')) {
      query += `&Branch=${Number(localStorage.getItem('Branch'))}`;
    }

    return this.http.get(this.baseUrl + `/GetAdvanceLoanList/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IFGetHRAdvanceLoanAll[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
}

@Injectable({ providedIn: 'root' })
export class EmployeeLeaveReportService {
  public baseUrl = `${domain}api/EmployeeLeaveReport`;

  constructor(public http: HttpClient) {
  }

  GetLeaveUseDatewise(
    pagination?: IPagination,
    filterObj?: IFilterViewModel,
    FilterByFromDate?: Date,
    FilterByToDate?: Date,
    empId?: number,
    searchTxt?: string,
    deptId?: string,
    desgId?: string
  ): Observable<IODataResult<IFgetLeaveUseDatewise_Result[]>> {
    let FromDate;
    if (FilterByFromDate) {
      FromDate = `${FilterByFromDate.getFullYear()}-${FilterByFromDate.getMonth() + 1}-${FilterByFromDate.getDate()}`;
    }
    let ToDate;
    if (FilterByToDate) {
      ToDate = `${FilterByToDate.getFullYear()}-${FilterByToDate.getMonth() + 1}-${FilterByToDate.getDate()}`;
    }

    let query = '?';
    if (filterObj != null) {
      if (filterObj.Sort && filterObj.Sort != '') {
        query += `Sort=${filterObj.Sort}&`;
      }
      if (filterObj.SortingAttribute && filterObj.SortingAttribute != '') {
        query += `SortingAttribute=${filterObj.SortingAttribute}&`;
      }
    }
    if (searchTxt != null && searchTxt != '') {
      query += `srchTxt=${searchTxt}&`;
    }
    if (deptId != null && deptId != '') {
      query += `deptId=${deptId}&`;
    }
    if (desgId != null && desgId != '') {
      query += `desgId=${desgId}&`;
    }
    return this.http.get(this.baseUrl + `/GetLeaveUseDatewise/${FromDate}/${ToDate}/${pagination.ItemsPerPage}/${pagination.CurrentPage}${query}`).pipe(map((res: any) => {
      let result: IODataResult<IFgetLeaveUseDatewise_Result[]> = {
        count: res.count,
        value: res.value
      };
      return result;
    }), catchError((err) => {
      return Observable.throw(err);
    }));

  }
}

@Injectable({ providedIn: 'root' })
export class EmployeeContractAPIService {
  public baseUrl = `${domain}api/EmployeeContractAPI`;

  constructor(public http: HttpClient) {
  }

  GetEmployeeContract(employeeId: number): Observable<IEmployeeContractRenew[]> {
    return this.http.get(this.baseUrl + `/GetEmployeeContract/${employeeId}`).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  SaveContract(empContract: IEmployeeContract) {
    return this.http.post(this.baseUrl + `/SaveContract`, empContract).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }

  SaveRenewContract(empRenewContract: IEmployeeContractRenew): Observable<boolean> {

    return this.http.post(this.baseUrl + `/SaveRenewContract`, empRenewContract).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class FetchFileService {
  constructor(public http: HttpClient) {
  }

  getPdfFile(url: string) {
    return this.http.get(url).pipe(map((res: any) => {
      var res1 = res.arrayBuffer();
      return new File([res1], url.split('/').reverse()[0].toString(), { type: 'application/pdf' });
    }), catchError((err) => {
      return Observable.throw(err);
    }));
  }
}

@Injectable({ providedIn: 'root' })
export class UVCAPIService {
  public baseUrl = `${domain}api/UVCAPI`;

  constructor(public http: HttpClient) {
  }

  storeUVC(uvcList: IUserVsCompany[]) {
    return this.http.post(this.baseUrl + `/StoreUVC`, uvcList).pipe(map((res: any) => {
      return res;
    }), catchError((err) => {
      console.log(err);
      return Observable.throw(err);
    }));
  }
}
