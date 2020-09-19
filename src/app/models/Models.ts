import { IInputDateVM } from "../shared/datepicker/models/datepickerVM";
import { ICompanyVM } from './ViewModels';

export interface ICategory {
  CategoryId?: number;
  CategoryName?: string;
  ParentId?: number;
  PostedBy?: string;
  PostedOn?: Date;
  IsGroup?: boolean;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  Employee?: Array<IEmployee>;
  EmployeePosition?: Array<IEmployeePosition>;
}

export interface ICompany {
  CompanyId: number;
  CompanyName: string;
  Address: string;
  Street2: string;
  Street1: string;
  City: string;
  State: string;
  Country: string;
  ContactNumber?: number;
  Email: string;
  Prefix: string;
  ParentId?: number;
  RegistrationDate?: Date;
  UpdatedDate?: Date;
  Logo?: boolean;
  StatusId: boolean;
  isGroup: boolean;
  Nav_code: string;
  Employee: Array<IEmployee>;
  EmployeePosition: Array<IEmployeePosition>;
}

export interface ICostCenter {
  CostCenterId: number;
  CostCenterName: string;
  PostedBy: string;
  PostedOn?: Date;
  ModifiedOn?: Date;
  ModifiedBy: string;
  Employee: Array<IEmployee>;
  EmployeePosition: Array<IEmployeePosition>;
}

export interface IDepartment {
  DepartmentId?: number;
  DepartmentName?: string;
  ParentId?: number;
  PostedBy?: string;
  PostedOn?: Date;
  StatusId?: boolean;
  isGroup?: boolean;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  ChildDepartment?: IDepartment[];
  Employee?: Array<IEmployee>;
  EmployeePosition?: Array<IEmployeePosition>;
  Roster?: Array<IRoster>;
  Department1?: IDepartment[];
  Department2?: IDepartment;

}

export interface IDesignation {
  DesignationId?: number;
  DesignationName?: string;
  ParentId?: number;
  PostedBy?: string;
  PostedOn?: Date;
  StatusId?: boolean;
  isGroup?: boolean;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  ChildDesignation?: IDesignation[];
  Employee?: Array<IEmployee>;
  EmployeePosition?: Array<IEmployeePosition>;
  MenuTemplate?: Array<IMenuTemplate>;
  Designation1?: IDesignation[];
  Designation2?: IDesignation;
}

export interface IDivision {
  DivisionId?: number;
  DivisionName?: string;
  ParentId?: number;
  PostedBy?: string;
  PostedOn?: Date;
  StatusId?: boolean;
  isGroup?: boolean;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  Employee?: Array<IEmployee>;
  EmployeePosition?: Array<IEmployeePosition>;
  Division1?: IDivision[];
  Division2?: IDivision;
}

export interface IEmail {
  Subject?: string;
  Body?: string;
  UserName?: string;
  Password?: string;
  ReceiverName?: string;
  Designation?: string;
  ServiceProviderEmail?: string;
  ReceiverEmailAddress?: string;
  ReceiverEmailAddressCC?: string;
  BCC?: string;
}

export interface IEmployee {
  EmployeeId?: number;
  EmployeeNo?: number;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  DateOfJoin?: Date;
  DateOfBirth?: Date;
  BloodGroup?: string;
  ReligionId?: number;
  Street2?: string;
  Street1?: string;
  City?: string;
  State?: string;
  Country?: string;
  PerStreet2?: string;
  PerStreet1?: string;
  PerCity?: string;
  PerState?: string;
  PerCountry?: string;
  Email?: string;
  Gender?: string;
  ContactNumber?: string;
  MobileNumber?: string;
  GroupId?: number;
  COGNumber?: string;
  PostedOn?: Date;
  Photo?: any;
  Status?: number;
  ExceptionToPayroll?: boolean;
  PostedBy?: string;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  Religion?: IReligion;
  LoginGroup?: ILoginGroup;
  EmployeePosition?: Array<IEmployeePosition>;
  EmployeeShift?: Array<IEmployeeShift>;
  EmployeeWorkArea?: Array<IEmployeeWorkArea>;
  Leave?: Array<ILeave>;
  Login?: Array<ILogin>;
  ReportTo?: Array<IReportTo>;
  RosterDetail?: Array<IRosterDetail>;
  User?: Array<IUser>;
  EmployeeHolidayList?: Array<IEmployeeHolidayList>;
  EmployeeStatus?: IEmployeeStatus;
  TemporaryAddress?: string;
  PermanentAddress?: string;
  Selected?: boolean;
  Employee_Nominee?: Array<IEmployeeNominee>;
  Employee_Contract?: Array<IEmployeeContract>;
}

export interface IEmployeeCertificate {
  ID: number;
  EmployeeId: number;
  CertificateId: number;
  CertificateNo: string;
  ExpiredDate?: Date;
  ExpiredDateVM?: IInputDateVM;
  Posteby: string;
  PostedOn: Date;
  Employee?: IEmployee;
  InfoCertificate?: IInfoCertificate;
  isEdit?: boolean;
}

export interface IEmployeeCV {
  EmployeeId: number;
  CVDoc: any;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeeDecoration {
  RowId: number;
  EmployeeId: number;
  Description: string;
  TDate: Date;
  PostedOn: Date;
  PostedBy: string;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeeEducation {
  Id: number;
  EmployeeId: number;
  LevelId: number;
  DivisionId: number;
  Board: string;
  PassedYr: number;
  Certificate: any;
  PostedBy: string;
  PostedOn: Date;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeeExperience {
  Id: number;
  EmployeeId: number;
  OrganizationName: string;
  PPost: string;
  TypeOfWork: string;
  StartDT: Date;
  EndDT: Date;
  PostedBy: string;
  PostedOn: Date;
  ExpDoc: any;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeeGenericInfo {
  EmployeeId: number;
  SpouseName: string;
  FatherName: string;
  MotherName: string;
  GrandFatherName: string;
  NoOfChildren: number;
  PostedBy: string;
  PostedOn: Date;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeeGrievance {
  Id: number;
  EmployeeId: number;
  Name: string;
  Code: string;
  NatureOfGrievance: string;
  Description: string;
  AdditionalInfo: string;
  PostedBy: string;
  PostedOn: Date;
  Doc: any;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeeOtherActivity {
  RowId: number;
  EmployeeId: number;
  SpecialAbility: string;
  Interest: string;
  Remarks: string;
  Reference: string;
  PostedBy: string;
  PostedOn: Date;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeeResearch {
  RowId: number;
  EmployeeId: number;
  Title_Subject: string;
  Major_Findings: string;
  Year: number;
  PostedBy: string;
  PostedOn: Date;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeeSWMC {
  RowId: number;
  EmployeeId: number;
  SWMCId: number;
  Venue: string;
  FromDate: Date;
  ToDate: Date;
  SponsoredBy: string;
  PostedBy: string;
  PostedOn: Date;
  Employee?: IEmployee;
  InfoSWMC?: IInfoSWMC;
  isEdit?: boolean;
}

export interface IEmployeeTraining {
  Id: number;
  EmployeeId: number;
  TName: string;
  Institution: string;
  StartDT: Date;
  EndDT: Date;
  SponsoredBy: string;
  TDOC: any;
  PostedBy: string;
  PostedOn: Date;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeeVacancy {
  EmployeeId: number;
  VacancyNo: string;
  VacancyAppNo: string;
  VacancyDate: Date;
  SelectionDate: Date;
  PostedBy: string;
  PostedOn: Date;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeePosition {
  Id?: number;
  EmployeeId?: number;
  Date?: Date;
  CompanyId?: number;
  DivisionId?: number;
  DepartmentId?: number;
  DesignationId?: number;
  CostCenterId?: number;
  CategoryId?: number;
  WorkAreaId?: number;
  EffectiveFrom?: Date;
  PostedBy?: string;
  PostedOn?: Date;
  CurrentFlag?: boolean;
  Category?: ICategory;
  Company?: ICompany;
  CostCenter?: ICostCenter;
  Department?: IDepartment;
  Designation?: IDesignation;
  Division?: IDivision;
  WorkArea?: IWorkArea;
  Employee?: IEmployee;
}

export interface IEmployeeShift {
  Id: number;
  EmployeeId: number;
  GroupId: number;
  FromDate: Date;
  AutoLogin?: boolean;
  IsOneTimeLogin?: boolean;
  LoginDeviceId: number;
  Status?: boolean;
  PostedOn: Date;
  PostedBy?: string;
  ModifiedOn?: Date;
  ModifiedBy: string;
  Employee: IEmployee;
  LoginGroup: ILoginGroup;
  LoginDeviceType: ILoginDeviceType;
  User: IUser;
  User1: IUser;
}

export interface IEmployeeWorkArea {
  Id: number;
  EmployeeId: number;
  WorkAreaId: number;
  FromDate?: Date;
  ToDate?: Date;
  Remarks?: string;
  PostedBy?: string;
  PostedOn: Date;
  ModifiedBy: string;
  ModifiedOn?: Date;
  Employee: IEmployee;
  WorkArea: IWorkArea;
}

export interface IHolidayList {
  HolidayListId: number;
  ListName: string;
  PostedOn: Date;
  PostedBy?: string;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  HolidayListDetails: Array<IHolidayListDetails>;
}

export interface IHolidayListDetails {
  HolidayListDetailId?: number;
  HolidayListId?: number;
  HolidayName?: string;
  HolidayDescription?: string;
  IsFullDay?: boolean;
  Year?: number;
  Month?: number;
  Day?: number;
  Selected?: boolean;
  Deleted?: boolean;
  PostedOn?: Date;
  PostedBy?: string;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  HolidayList?: IHolidayList;
}

export interface IHRExpenses {
  Id?: number;
  Amount?: number;
  ALId?: number;
  Rmrks?: string;
  PostedBy?: string;
  PostedOn?: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  StaffId?: number;
  TDate?: Date;
  TId1?: any;
  Employee?: IEmployee;
}

export interface IHRInsentive {
  Id?: number;
  Amount?: any;
  ALId?: number;
  Rmrks?: string;
  PostedBy?: string;
  PostedOn?: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  StaffId?: number;
  TDate?: Date;
  TId1?: any;
  Employee?: IEmployee;
}

export interface IInfoCertificate {
  CertificateId: number;
  CertificateName: string;
  IsEnable: boolean;
  IsExpirable: boolean;
  Employee_Certificate?: IEmployeeCertificate[];
}

export interface IInfoEducationDivision {
  Id: number;
  EducationDivisionName: string;
}

export interface IInfoEducationLevel {
  Id: number;
  EducationLevelName: string;
}

export interface IInfoSWMC {
  SWMCId: number;
  Description: string;
}

export interface ILeave {
  LeaveId?: number;
  EmployeeId?: number;
  LeaveTypeId?: number;
  GroupId?: number;
  RequestedDate?: Date;
  tillDate?: Date;
  LeaveDate?: Date;
  NumOfDays?: string;
  Remarks?: string;
  ApproverRemarks?: string;
  IsProcess: boolean;
  Employee?: IEmployee;
  LoginStatus?: ILoginStatus;
  LoginGroup?: ILoginGroup;
  LeaveBalanceLog?: ILeaveBalanceLog[];
  LeaveChild?: ILeaveChild[];
}

export interface ILeaveChild {
  Id: number;
  LeaveId: number;
  LeaveDate: Date;
  LeaveStatusId: number;
  LeaveStatusUpdatedBy?: string;
  LeaveStatusUpdateOn?: Date;
  ConsumedLeave?: boolean;
  ApprovedLeaveTypeId?: number;
  CompensableLeaveId?: number;
  CompensableLeaveDate?: Date;
  Leave?: ILeave;
  LeaveStatus?: ILeaveStatus;
  User?: IUser;
  LoginStatus?: ILoginStatus;
  CompensableLeave?: ICompensableLeave;
}

export interface IHRSSheet1 {
  TId1: number;
  Year: number;
  month: number;
  FYId: number;
  PostedBy: string;
  PostedOn: Date;
  VerifiedBy: string;
  VerifiedOn: Date;
  BranchId: number;
  DivId: number;
}

export interface ILeaveStatus {
  Id: number;
  Status: string;
}

export interface ILeaveTypeSetup {
  LeaveTypeId: number;
  LeaveTypeName: string;
  LeaveDays: string;
}

export interface ILogin {
  Id: number;
  EmployeeId: number;
  Date?: Date;
  CheckInTime?: TimeRanges;
  CheckOutTime?: TimeRanges;
  LoginStatusId?: number;
  StaffRemarks: string;
  VerificationRemarks: string;
  ValidatedBy: string;
  ValidatedOn?: Date;
  IsDeviceLogin?: boolean;
  Employee: IEmployee;
  LoginStatus: ILoginStatus;
  LeaveBalanceLog?: ILeaveBalanceLog[];
}

export interface ILoginGroup {
  GroupId: number;
  ShiftId: number;
  GroupName: string;
  WeekHoliday?: string;
  DefaultOfficeHourFrom: string;
  DefaultOfficeHourTill: string;
  WeeklyHalfHoliday?: string;
  HalfHolidayOfficeHourFrom?: string;
  HalfHolidayOfficeHourTill?: string;
  EffectiveMonth?: number;
  EffectiveDay?: number;
  EndMonth?: number;
  EndDay?: number;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy: string;
  ModifiedOn?: Date;
  EmployeeShift: Array<IEmployeeShift>;
  Leave: Array<ILeave>;
  LoginShift: ILoginShift;
  RosterDetail: Array<IRosterDetail>;
  LoginGroupChild: Array<ILoginGroupChild>;
  Employee: IEmployee;
}

export interface ILoginGroupChild {
  LGChildId: number;
  GroupId: number;
  OfficeHourFrom: string;
  OfficeHourTill: string;
  HalfHolidayOfficeHourFrom?: string;
  HalfHolidayOfficeHourTill?: string;
  EffectiveMonth: number;
  EffectiveDay: number;
  EndMonth: number;
  EndDay: number;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy: string;
  ModifiedOn?: Date;
  LoginGroup: ILoginGroup;
}

export interface ILoginShift {
  ShiftId: number;
  ShiftName: string;
  JobRunTime?: string;
  PostedOn: Date;
  PostedBy: string;
  LastUpdatedOn?: Date;
  LastUpdatedBy: string;
  LoginGroup?: Array<ILoginGroup>;
}

export interface ILoginStatus {
  LoginStatusId: number;
  StatusName: string;
  ColorCode: string;
  SType: number;
  LeaveDays: number;
  IsHalfLeave: boolean;
  Leave?: ILeave[];
  Login?: ILogin[];
}

export interface ILoginDeviceType {
  LoginDeviceId: number;
  LoginDeviceName: string;
}

export interface IMenu {
  MenuId?: number;
  MenuCaption: string;
  ParentMenuId?: number;
  IsGroup?: boolean;
  Url: string;
  IsEnable?: boolean;
  IsContext?: boolean;
  MenuVsTemplate?: Array<IMenuVsTemplate>;
}

export interface IMenuTemplate {
  MenuTemplateId?: number;
  MenuTemplateName: string;
  DesignationId?: number;
  PostedBy: string;
  PostedOn?: Date;
  LastModifiedOn?: Date;
  LastModifiedBy: string;
  Designation?: IDesignation;
  MenuVsTemplate?: Array<IMenuVsTemplate>;
  User?: Array<IUser>;
}

export interface IMenuVsTemplate {
  Id?: number;
  MenuId: number;
  TemplateId?: number;
  Menu?: IMenu;
  MenuTemplate?: IMenuTemplate;
}

export interface IReligion {
  ReligionId: number;
  ReligionName: string;
  Employee: Array<IEmployee>;
}

export interface IReportTo {
  Id?: number;
  EmployeeId?: number;
  ReportTo1?: number;
  PostedBy?: string;
  PostedOn?: Date;
  Status?: boolean;
  Employee?: IEmployee;
  User?: IUser;
}

export interface IRoster {
  RosterId: number;
  RosterName: string;
  DepartmentId: number;
  FromDate: Date;
  TillDate: Date;
  Department: IDepartment;
}

export interface IRosterDetail {
  RosterDetailId: number;
  EmployeeId: number;
  LoginDate: Date;
  GroupId: number;
  FromTime: TimeRanges;
  ToTime: TimeRanges;
  Employee: IEmployee;
  LoginGroup: ILoginGroup;
}

export interface IUser {
  Id?: string;
  EmployeeId?: number;
  UserName?: string;
  Password?: string;
  PasswordHash?: string;
  MenuTemplateId?: number;
  IsUnlimited?: boolean;
  FromDate?: Date;
  ToDate?: Date;
  IsActive?: boolean;
  PostedBy?: string;
  PostedOn?: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  Employee?: IEmployee;
  MenuTemplate?: IMenuTemplate;
  Email?: string;
  SecurityStamp?: string;
  EmailConfirmed?: boolean;
  PhoneNumber?: string;
  PhoneNumberConfirmed?: boolean;
  TwoFactorEnabled?: boolean;
  LockoutEndDateUtc?: Date;
  LockoutEnabled?: boolean;
  AccessFailedCount?: number;
}

export interface ICheckBoxViewModel<T> {
  Item: T;
  Selected: boolean;
}

export interface IPaginationViewModel {
  CurrentPage?: number;
  TotalPage?: number;
  ItemsPerPage?: number;
  MaxItems?: number;
  TotalItems?: number;
}

export interface IBreadcrumbViewModel {
  DivisionId?: number;
  DivisionName?: string;
}

export interface IDataType {
  DTId: number;
  DType: string;
}

export interface INavLedger {
  Id: number;
  ALId: number;
  LedgerName: string;
  NavCode?: string;
  CompanyId?: number;
  HRMLedger?: IHRMLedger;
  Company?: ICompany;
}

export interface IParamScript {
  PId?: number;
  PScript: string;
  Param?: IParam;
}

export interface IParam {
  PId?: number;
  PName: string;
  ParentId: number;
  isGroup: boolean;
  isOpen?: boolean;
  isSelected?: boolean;
  ChildParam?: IParam[];
  ParamScript?: IParamScript;
  ParamValue?: IParamValue;
}

export interface IParamValue {
  PId?: number;
  DTId: number;
  PDescription: string;
  PValue?: any;
  PCode?: string;
  Param?: IParam;
}

export interface IWorkArea {
  WorkAreaId: number;
  WorkAreaName: string;
  PostedBy: string;
  POstedOn: Date;
  ModifiedOn?: Date;
  ModifiedBy: string;
  EmployeeWorkArea: Array<IEmployeeWorkArea>;
}

export interface IDivisionForm {
  DivisionId?: number;
  DivisionName?: string;
  ParentId?: number;
  PostedBy?: string;
  PostedOn?: Date;
  StatusId?: boolean;
  isGroup?: boolean;
  isOpen?: boolean;
  isSelected?: boolean;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  ChildDiv?: IDivision[];
  Employee?: Array<IEmployee>;
  EmployeePosition?: Array<IEmployeePosition>;
  Division1?: IDivision[];
  Division2?: IDivision;
}

export interface IDepartmentForm {
  DepartmentId?: number;
  DepartmentName?: string;
  ParentId?: number;
  PostedBy?: string;
  PostedOn?: Date;
  StatusId?: boolean;
  isGroup?: boolean;
  isOpen?: boolean;
  isSelected?: boolean;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  ChildDept?: IDepartment[];
  Employee?: Array<IEmployee>;
  EmployeePosition?: Array<IEmployeePosition>;
  Roster?: Array<IRoster>;
  Department1?: IDepartment[];
  Department2?: IDepartment;
}

export interface IDesignationForm {
  DesignationId: number;
  DesignationName: string;
  ParentId?: number;
  PostedBy: string;
  PostedOn?: Date;
  StatusId: boolean;
  isGroup?: boolean;
  isOpen?: boolean;
  isSelected?: boolean;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  ChildDesg?: IDesignation[];
  Employee: Array<IEmployee>;
  EmployeePosition: Array<IEmployeePosition>;
  MenuTemplate: Array<IMenuTemplate>;
  Designation1: IDesignation[];
  Designation2: IDesignation;
}

export interface ISelectListItem {
  Text: string;
  Value: string;
}

export interface ILoginLog {
  Id?: number;
  Staffno: number;
  UserId?: number;
  Datetime: Date;
  Longitude?: string;
  Latitude?: string;
  LoginDeviceId?: number;
  Geom?: any;
}

export interface ILoginReport {
  Id?: number;
  TDate?: Date;
  GroupId?: number;
  EmployeeId?: number;
  CheckInTime?: TimeRanges;
  CheckOutTime?: TimeRanges;
  LoginStatusId?: any;
  StaffRemarks?: string;
  IsDeviceLogin?: boolean;
  IsCompensable?: boolean;
  Employee?: IEmployee;
  LoginGroup?: ILoginGroup;
  LoginStatus?: ILoginStatus;
  LoginValidate?: ILoginValidate[];
  LeaveBalanceLog?: ILeaveBalanceLog[];
  Flag?: number;
  CompensableLeave?: ICompensableLeave[];
  CheckInGeom?: any;
  CheckOutGeom?: any;
  CheckInDeviceId?: number;
  CheckOutDeviceId?: number;
}

export interface ILoginValidate {
  Id?: number;
  LoginId?: number;
  UpdatedStatusId?: number;
  ValidatedBy?: string;
  ValidatedOn?: Date;
  VerificationRemarks?: string;
  LoginStatus?: ILoginStatus;
  User?: IUser;
}

export interface ILeaveBalanceLog {
  LeaveLogId: number;
  LeaveId: number;
  BalLoginId: number;
  CompLoginId: number;
  Leave?: ILeave;
  BalLoginReport?: ILoginReport;
  CompLoginReport?: ILoginReport;
}

export interface IEmployeeResign {
  Id: number;
  EmployeeId: number;
  EffectiveFrom: Date;
  Remarks?: any;
  ApprovedBy?: string;
  Approval?: number;
  PostedOn?: Date;
  ApprovedOn?: Date;
  UserName?: string;
  Employee: IEmployee;
  User: IUser;
}

export interface IEmployeeStatusHistory {
  Id: number;
  EmployeeId: number;
  Status: number;
  ChangedBy: string;
  ChangedOn: Date;
  Employee: IEmployee;
  User: IUser;
  EmployeeStatus: IEmployeeStatus;
}

export interface IEmployeeStatus {
  Id: number;
  Status: string;
}

export interface IResignDecision {
  Id: number;
  Decision: string;
}

export interface IEmployeeHolidayList {
  Id?: number;
  EmployeeId?: number;
  HolidayListId?: number;
  EffectiveFrom?: Date;
  PostedBy?: string;
  PostedOn?: Date;
  Status?: boolean;
  Selected?: boolean;
  Employee?: IEmployee;
  HolidayList?: IHolidayList;
  User?: IUser;
}

export interface IUnit {
  Id: number;
  UnitName: string;
  UnitCode: string;
  PostedOn?: Date;
  PostedBy?: string;
  ModifiedOn?: Date;
  ModifiedBy: string;
  User?: IUser;
  User1?: IUser;
  JobCodeGenerate?: IJobCodeGenerate[];
}

export interface IClient {
  Id: number;
  CompanyName: string;
  Address?: string;
  TelephoneNo?: string;
  Email?: string;
  ClientCode: string;
  ContactPersonName?: string;
  ContactPersonTelephoneNo?: string;
  ContactPersonEmail?: string;
  PostedOn?: Date;
  PostedBy?: string;
  ModifiedOn?: Date;
  ModifiedBy: string;
  User?: IUser;
  User1?: IUser;
  JobCodeGenerate?: IJobCodeGenerate[];
}

export interface IServiceType {
  Id: number;
  Code: string;
  Name: string;
  ServiceTypeId: number;
  ServiceTypeName?: IServiceTypeName;
  JobCodeGenerate?: IJobCodeGenerate[];
}

export interface IServiceTypeName {
  Id: number;
  TypeName: string;
  ServiceType?: IServiceType[];
}

export interface IFiscalYear {
  FYID: number;
  FyName: string;
  StartDT: Date;
  EndDt: Date;
  FYNameAD: string;
  JobCodeGenerate?: IJobCodeGenerate[];
}

export interface IJobCodeGenerate {
  Id: number;
  UnitCodeId: number;
  ClientCodeId: number;
  FiscalYearId: number;
  ServiceTypeNameId: number;
  JobCode: string;
  Status: boolean;
  PostedBy?: string;
  PostedOn?: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  Client?: IClient;
  FiscalYear?: IFiscalYear;
  ServiceTypeName?: IServiceTypeName;
  Unit?: IUnit;
  User?: IUser;
  User1?: IUser;
  TimeSheet?: ITimeSheet[];
}

export interface ITimeSheet {
  Id: number;
  EmployeeId: number;
  Date: Date;
  JobCodeId: number;
  Hours: number;
  Remarks: string;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  JobCodeGenerate?: IJobCodeGenerate;
  User?: IUser;
  Employee?: IEmployee;
}

export interface IPagination {
  TotalItems: number;
  CurrentPage: number;
  ItemsPerPage: number;
  SortBy?: any;
}

export interface IODataResult<T> {
  count: number;
  value: T;
}

export interface IFGetTimeSheetReport_Result {
  EmployeeId: number;
  EmployeeNo: number;
  EmployeeName: string;
  JobCodeId: number;
  JobCode: string;
  FiscalYearId: number;
  FyName: string;
  FYNameAD: string;
  Baishakh: number;
  Jestha: number;
  Ashadh: number;
  Shrawan: number;
  Bhadra: number;
  Ashwin: number;
  Kartik: number;
  Mangsir: number;
  Poush: number;
  Magh: number;
  Falgun: number;
  Chaitra: number;
}

export interface IFGetTimeSheetDayWiseReport_Result {
  EmployeeId: number;
  EmployeeNo: number;
  EmployeeName: string;
  JobCodeId: number;
  JobCode: string;
  C1: number;
  C2: number;
  C3: number;
  C4: number;
  C5: number;
  C6: number;
  C7: number;
  C8: number;
  C9: number;
  C10: number;
  C11: number;
  C12: number;
  C13: number;
  C14: number;
  C15: number;
  C16: number;
  C17: number;
  C18: number;
  C19: number;
  C20: number;
  C21: number;
  C22: number;
  C23: number;
  C24: number;
  C25: number;
  C26: number;
  C27: number;
  C28: number;
  C29: number;
  C30: number;
  C31: number;
  C32: number;
}

export interface IfgetIndividualTimeSheet_Result {
  EmployeeId: number;
  EmployeeNo: number;
  EmployeeName: string;
  DepartmentName: string;
  DesignationName: string;
  Date: Date;
  JobCode: string;
  Hours: number;
  Remarks: string;
}

export interface ILeaveServiceType {
  ServiceId: number;
  ServiceName: number;
  IsAccAndEarn: boolean;
  LeavePolicy: ILeavePolicy[];
}

export interface ILeavePolicyEmployee {
  LeavePolicyEmployeeId?: number;
  EmployeeId: number;
  LeaveId: number;
  CalendarYear: string;
  EffectiveFrom: Date;
  PreviousBalance?: string;
  EligibleLeave?: string;
  EarnLeave?: string;
  CosumeLeave?: string;
  PostedOn: Date;
  PostedBy: string;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  ConsumedUnpaidLeave?: string;
  IsFiscalYear: boolean;
  Employee?: IEmployee;
  LoginStatus?: ILoginStatus;
  User?: IUser;
  User1?: IUser;
  //BSADCal?: IBSADCal;
}

export interface ILeavePolicy {
  LeavepolicyId?: number;
  LeaveId?: number;
  CalendarYear: string;
  EffectiveDate: Date;
  NoOfDays: string;
  ServiceTypeId: number;
  IsAccumulation?: boolean;
  AccumulationDays?: number;
  IsEarnleave?: boolean;
  IsCompensationLeave?: boolean;
  EarningSheduleDay?: number;
  ParentId: number;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  IsFiscalYear: boolean;
  EligibleExpFor: number;
  IsActive: boolean;
  LeaveServiceType?: ILeaveServiceType;
  LoginStatus?: ILoginStatus;
  //BSADCal?: IBSADCal;
}

export interface IEarningScheduleDay {
  Id: number;
  Day: number;
}

export interface INepaliCalendarFiscalYear {
  Id: number;
  NepaliYear: number;
  LeavePolicyEmployee?: ILeavePolicyEmployee;
}

export interface IBSADCal {
  NYear: number;
  StartDate: Date;
  EndDate: Date;
}

export interface ICompensableLeave {
  CompensableLeaveId?: number;
  ApprovedBy: string;
  ApproveOn: Date;
  LoginReportId: number;
  Status: number;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  LeaveStatus?: ILeaveStatus;
  LoginReport?: ILoginReport;
  User?: IUser;
  User1?: IUser;
}

export interface IFGetAttenSummary_Result {
  EmployeeId: number;
  Days: number;
  LoginStatusId: number;
  StatusName: string;
  EmployeeName: string;
  DesignationName: string;
  DepartmentName: string;
}

export interface IFgetMonthlyAttenRepEmpwise_Result {
  EmployeeId: number;
  EmployeeNo: number;
  EmployeeName: string;
  Designation: string;
  Department: string;
  TDate: Date;
  Ndate: string;
  Duration: string;
  Logintime: TimeRanges;
  Logouttime: TimeRanges;
  Remarks: string;
  Status: string;
  loginstatusid: number;
}

export interface IFGetHolidayListByCalendarYear_Result {
  Yr: number;
  HolidaylistId: number;
  ListName: string;
  HolidayName: string;
  HolidayDescription: string;
  HolidayDate?: Date;
  HolidayDetail?: IFGetHolidayListByCalendarYear_Result[]
}

export interface IFHolidayListDetail {
  HolidaylistId: number;
  HolidayName: string;
  HolidayDescription: string;
  HolidayDate?: Date;
}

export interface IFEmployeeResign {
  Id: number;
  EmployeeId: number;
  EffectiveFrom: Date;
  Remarks: string;
  ApprovedBy: string;
  Approval: number;
  PostedOn: Date;
  ApprovedOn: Date;
  EmployeeNo: number;
  EmployeeName: string;
  DateOfJoin: Date;
  DepartmentName: string;
  DesignationName: string;
  Designationname: string;
  Email: string;
  ContactNumber: string;
  Photo: string;
  newPhoto: any;
  UserName: string;
}

export interface IHRBankInfo {
  Bid: number;
  BName: string;
  BAdd: string;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  User?: IUser;
  User1?: IUser;
}

export interface IHRDashainCal {
  FYId: number;
  DAOnAD: number;
  DAOnBS: number;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  FiscalYear?: IFiscalYear;
  User?: IUser;
  User1?: IUser;
}

export interface IHRMGrade {
  GdId: number;
  GdDesc: string;
  GdAmt: string;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  User?: IUser;
  User1?: IUser;
}

export interface IHRMLedger {
  ALId: number;
  ALDesc: string;
  Enable: boolean;
  AM: number;
  OneTimeTax: boolean;
  Nav_Code: string;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  MultipleNav: boolean;
  NavLedgerId?: number;
  User?: IUser;
  User1?: IUser;
  NavLedger?: INavLedger[];
  HRStaffInfoNav?: IHRStaffInfoNav[];
}

export interface IHRMLevel {
  LvlId: number;
  LvlDesc: string;
  LvlAmt: string;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  User?: IUser;
  User1?: IUser;
}

export interface IEnglishMonthList {
  Id: number;
  EngMonthName: string;
}

export interface INepaliMonthList {
  Id: number;
  NepMonthName: string;
}

export interface IHRLevelVsAllowances {
  ALId: number;
  LvlId: number;
  Amount: string;
  PostedBy: string;
  PostedOn?: Date
  ModifiedBy?: string;
  ModifiedOn?: Date;
  HRMLedger?: IHRMLedger;
  HRMLevel?: IHRMLevel;
  User?: IUser[];
  User1?: IUser[];
}

export interface IFGetledgerAllowanceAmountTB_Result {
  ALId: number;
  ALDesc: string;
  Amount: string;
  PostedOn: Date;
  PostedBy: string;
}

export interface INotice {
  NoticeId: number;
  Subject: string;
  Body: string;
  PostedBy: string;
  PostedOn: Date;
  NoticeReceiver?: INoticeReceiver[];
  User: IUser;
}

export interface INoticeReceiver {
  NoticeReceiverId?: number;
  NoticeId?: number;
  Recipient: number;
  Employee?: IEmployee;
  Notice?: INotice;
}

export interface IHRAM {
  AMId: number;
  AMdesc: string;
}

export interface IHRStaffInfo {
  StaffId: number;
  LvlId?: number;
  GrdId?: number;
  ExtGrade?: string;
  PF?: string;
  MaritalStatus?: boolean;
  BankGrp?: number;
  BankAccNo?: string;
  Wages?: string;
  UName?: string;
  UPass?: string;
  CITNo?: string;
  MonthlyCIT?: string;
  PFNo?: string;
  PanNo?: string;
  WithDashainBonus?: boolean;
  PostedBy: string;
  PostedOn?: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  BasicSalaryNLId?: number;
  IsGratuity?: boolean;
  IsSSFInsurance: boolean;
  HRStaffInfoNav?: IHRStaffInfoNav[];
}

export interface IHRStaffInfoNav {
  Id: number;
  StaffId: number;
  ALId: number;
  CompanyId: number;
  NavLedgerId: number;
  NavLedger?: INavLedger;
  Company?: ICompany;
  HRMLedger?: IHRMLedger;
}

export interface IGtnDepartment {
  DepartmentID: number;
  DepartmentName: string;
  DepartmentCode: string;
  Visibility: boolean;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  User?: IUser;
  User1?: IUser;
  SubUnit?: IGtnSubUnit[];
  Unit1?: IGtnUnit[];
}

export interface IGtnUnit {
  UnitID: number;
  UnitName: string;
  UnitCode: string;
  DepartmentID: number;
  Visibility: boolean;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  User?: IUser;
  User1?: IUser;
  Department1?: IGtnDepartment;
  SubUnit?: IGtnSubUnit[];
}

export interface IGtnSubUnit {
  SubUnitID: number;
  SubUnitName?: string;
  SubUnitCode?: string;
  UnitID?: number;
  DepartmentID?: number;
  Visibility?: boolean;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  User?: IUser;
  User1?: IUser;
  Department1?: IGtnDepartment;
  Unit1?: IGtnUnit;
}

export interface IGtnJobCode {
  ID?: number;
  DepartmentCode: number;
  UnitCode?: number;
  SubUnitCode?: number;
  ClientCode?: number;
  FiscalYearID: number;
  JobCode1: string;
  IsVisible: boolean;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  FiscalYear?: IFiscalYear;
  User?: IUser;
  User1?: IUser;
}

export interface IGtnTimeSheet {
  ID: number;
  Date: Date;
  Billable_Non: number;
  JobCode: number;
  Hour: number;
  Remarks?: string;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
  User?: IUser;
  User1?: IUser;
  BillTypeStatus?: IGtnBillTypeStatus;
  JobCode1?: IGtnJobCode;
}

export interface IGtnBillTypeStatus {
  BillTypeID: number;
  BillType: string;
  TimeSheet1?: IGtnTimeSheet[];
}

export interface IEmailLog {
  Id?: number;
  Subject: string;
  SentTo: string;
  Bcc?: string;
  PostedOn?: Date;
}

export interface IHRStaffVsAllowance {
  Id?: number;
  AlId: number;
  StaffId: number;
  LvlId: number;
  Amount: string;
  PostedBy: string;
  PostedOn?: Date;

  HRMLedger?: IHRMLedger;
  HRStaffInfo?: IHRStaffInfo;
  User?: IUser;
}

export interface IHRStaffInfoLog {
  Id?: number;
  StaffId: number;
  ExtGrade?: string;
  LvlId: number;
  GrdId: number;
  MonthlyCIT?: string;
  PostedBy: string;
  PostedOn?: Date;
}

export interface IHRStaffVsAllowanceLog {
  Id?: number;
  AlId: number;
  StaffId: number;
  LvlId: number;
  Amount: string;
  PostedBy: string;
  PostedOn?: Date;
}

export interface IHRInsurance {
  Id?: number;
  StaffId: number;
  Premium: string;
  InsuranceCompany: string;
  TillFYId: number;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
}

export interface IHRLeave {
  Id?: number;
  StaffId: number;
  Year: number;
  Month: number;
  Day?: string;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy?: string;
  ModifiedOn?: Date;
}

export interface IHRLeaveNoOfDays {
  Id: number;
  NumOfDays: any;
}

export interface IFGetLeaveRecord {
  EmployeeId: number;
  EmployeeNo: number;
  EmployeeName: string;
  DepartmentName: string;
  HRLeaveId: number;
  Year: number;
  Month: number;
  Day?: string;
  PostedBy: string;
  PostedOn: Date;
  UnpaidCount?: number;
  LateAndEarlyCount?: number;
  AbsentCount?: number;
  TotalCount?: number;
}

export interface ILeaveDeductDetail {
  NoOfDaysId: number;
  UnpaidCount: number;
  LateAndEarlyCount: number;
  AbsentCount: number;
  TotalCount?: number;
}

export interface IHRAdvanceLoan {
  Id: number;
  TDate: Date;
  StaffId: number;
  AlId: number;
  Installment: string;
  Amount: string;
  Remarks?: string
  PostedOn: Date;
  PostedBy: string;
  ModifiedOn?: Date;
  ModifiedBy?: string;
  Employee?: IEmployee;
  User?: IUser;
  User1?: IUser;
}

export interface IHRAdvanceLoanLog extends IHRAdvanceLoan {
}

export interface IFGetAdvanceAllowanceType {
  ALId: number;
  ALDesc: string;
}

export interface IFGetAdvanceLoan {
  EmployeeNo: number;
  EmployeeName: string;
  DepartmentName: string;
  Designationname: string;
  Id: number;
  TDate: Date;
  StaffId: number;
  AlId: number;
  Amount: string;
  Remarks: string;
  Installment: string;
  PostedBy: string;
  PostedOn: Date;
  ModifiedBy: string;
  ModifiedOn: Date;
}

export interface IEligibleExpMonth {
  Id: number;
  EligibleMonth: number;
}

export interface IBirthdayNotification {
  EmployeeId: number;
  EmployeeNo: number;
  EmployeeName: string;
  DOB: Date;
  DegName: string;
  DepName: string;
  CompanyName: string;
  TodaysDate: Date;
  Birthday: number;
  CurrentBirthdayDate?: Date;
}

export interface IEmployeeNominee {
  RowId: number;
  EmployeeId: number;
  NomineeName: string;
  NomineeAddress: string;
  NomineeContact: string;
  PostedBy: string;
  PostedOn: Date;
  Employee?: IEmployee;
  isEdit?: boolean;
}

export interface IEmployeeContract {
  ECRowId: number;
  ECARowId?: number;
  EmployeeId: number;
  ContractId: number;
  ContractDate: Date;
  ExpiryDate: Date;
  JobDescription: string;
  ContractNo: string;
  PostedOn: Date;
  PostedBy: any;
  ContractImage?: any;
  ContractEndOn?: Date;
  Employee?: IEmployee;
}

export interface IEmployeeContractRenew {
  ECRowId: number;
  ECARowId: number;
  AmendOn: Date;
  ExpiryDate: Date;
  Remarks: string;
  PostedOn: Date;
  PostedBy: any;
  Image?: any;
}

export interface IEmployeeOtherDocument {
  Id: number;
  EmployeeId: number;
  Description: string;
  OtherDoc: any;
}

export interface IHRSalaryOpBal {
  StaffId: number;
  FYId: number;
  TotalSal: any;
  IncomeTax: any;
  SSTax: any;
  PF: any;
  CIT: any;
  CITToBePaid: any;
  CITPaid: any;
  Employee?: IEmployee;
  FiscalYear?: IFiscalYear;
}

export interface IEmployee_OutsideMovement {
  Id: number;
  EmployeeId: number;
  From: any;
  NoOfDays: number;
  To: any;
  PostedBy: string;
  PostedOn: Date;
  TType: number;
  TransportId: number;
  Place: string;
  RequestAdvance: any;
  ApprovedAdvance: any;
  ApprovedBy: string;
  ApprovedOn: Date;
  Remarks: string;
  status: number;
  InfoOutSideMovement?: IInfoOutSideMovement;
  InfoOutSideTrnsportationType?: IInfoOutSideTrnsportationType;
}

export interface IInfoOutSideMovement {
  Id: number;
  OutSideMovementType: string;
}

export interface IInfoOutSideTrnsportationType {
  Id: number;
  TransportationType: string;
}

export interface IUserVsCompany {
  Id?: number;
  UserId: string;
  CompanyId: number;
}
