import {
    ICategory,ICompany,ICostCenter,IDepartment,IDesignation,IDivision,
    IEmployee,IEmployeePosition,IEmployeeShift,IEmployeeWorkArea,IHolidayList,
    IHolidayListDetails,ILeave,ILeaveTypeSetup,ILogin,ILoginGroup,ILoginGroupChild,
    ILoginShift,ILoginStatus,ILoginReport,ILoginLog,ILoginValidate,IMenu,IMenuTemplate,
    IMenuVsTemplate,IReligion,IReportTo,IRoster,IRosterDetail,IUser,IWorkArea,IParamScript,
    IParam,IDataType,IParamValue,ISelectListItem,ILeaveChild,IUnit,IClient,IServiceType,
    IServiceTypeName,IFiscalYear,ITimeSheet,IJobCodeGenerate,IFGetTimeSheetReport_Result,
    ILeavePolicyEmployee, IGtnJobCode, IGtnTimeSheet, IHRInsentive, IHRExpenses, IEmployeeHolidayList, INavLedger
} from './Models';

import { IInputDateVM } from '../shared/datepicker/models/datepickerVM';
export interface IFilterViewModel {
    Name?: string;
    Sort?: string;
    SortingAttribute?: string;
    SearchBy?: string;
}

export interface IParamForm {
    PId?: number;
    PName?: string;
    ParentId?: number;
    isGroup?: boolean;
    DTId?: number;
    PDescription?: string;
    PValue?: string;
    PCode?: string;
    PScript?: string;
}

export interface IMenuVM extends IMenu {
    isOpen?: boolean,
    isSelected?: boolean,
    ChildMenu?: IMenuVM[],
    fileDepthPath?: string,
    fileDepthFolders?: IMenuVM[]
}

export interface IParamVM extends IParam {
    isOpen?: boolean,
    isSelected?: boolean,
    ChildParam?: IParamVM[],
    fileDepthPath?: string,
    fileDepthFolders?: IParamVM[],
    editToggle?: boolean;
    options?: ISelectListItem[];
}

export interface IDivisionVM extends IDivision {
    isOpen?: boolean,
    isSelected?: boolean,
    ChildDivision?: IDivisionVM[],
    fileDepthPath?: string,
    fileDepthFolders?: IDivisionVM[]
}

export interface IDepartmentVM extends IDepartment {
    isOpen?: boolean,
    isSelected?: boolean,
    ChildDepartment?: IDepartmentVM[],
    fileDepthPath?: string,
    fileDepthFolders?: IDepartmentVM[]
}

export interface IDesignationVM extends IDesignation {
    isOpen?: boolean,
    isSelected?: boolean,
    ChildDesignation?: IDesignationVM[],
    fileDepthPath?: string,
    fileDepthFolders?: IDesignationVM[]
}


export interface ICompanyVM extends ICompany {
    isOpen?: boolean,
    isSelected?: boolean,
    ChildCompany?: ICompanyVM[],
    fileDepthPath?: string,
    fileDepthFolders?: ICompanyVM[]
    PComapnyName?: string;
}

export interface IMenuTemplateVM extends IMenuTemplate { }

export interface ICategoryVM extends ICategory {
    isOpen?: boolean,
    isSelected?: boolean,
    ChildCategory?: ICategoryVM[],
    fileDepthPath?: string,
    fileDepthFolders?: ICategoryVM[]
}

export interface ILoginReportVM extends ILoginReport {
    Remarks?: string;
    CheckInTime1?: string;
    CheckOutTime1?: string;
    isSelected?: boolean;
    isDisabled?: boolean;
    newDate?: IInputDateVM;
}

export interface ILoginStatusVm extends ILoginStatus {
    Count?: number;
}

export interface IEmployeeShiftVM extends IEmployeeShift {
    InputFromDate?: IInputDateVM;
    ShiftId?: number;
    PostedUserName?: string;
    ModifiedUserName?: string;
}

export interface IEmployeeVM extends IEmployee {
    employeeNameJoint?: string;
    ReportToId?: number;
    isDisabled?: boolean;
}

export interface IChangePasswordVM {
    Id?: string;
    CurrentPassword?: string;
    NewPassword?: string;
}

export interface IFgetemployeeLoginReport_Result extends ILoginReport {
    EmployeeNo: number;
    EmployeeName: string;
    StatusName: string;
    VerificationRemarks: string;
    EmpPhoto?: string;
}

export interface IFgetholidaylistBoth_Result {
    EmployeeId: number;
    TDate: Date;
    Flag: boolean;
    TDay: number;
    IsHoliday: boolean;
}

export interface IUnitVM extends IUnit {
    editToggle?: boolean;
}

export interface IFgetFiscialyearID_Result extends IFiscalYear { }

export interface ITimeSheetVM extends ITimeSheet {
    JobCode?: string;
}

export interface IFilterByUnitVM {
    //Id: number;
    UnitCodeId: number;
    ClientCodeId: number;
    ServiceTypeNameId: number;
    UnitName: string;
    ClientName: string;
    ServiceTypeName: string;
    JobCode: IJobCodeGenerate[];

}

export interface IClientAndJobCodeVM {
    ClientCode: number;
    JobCode: string;
}

export interface IEligibleCompensableLeaveData {
    CompensableLeaveId: number;
    CompensableDate: Date;
    isSelected?: boolean;
}

export interface ILeavePolicyEmployeeVM extends ILeavePolicyEmployee {
    BalanceLeave?: string;
}

export interface IEmployeeHolidayListData {
    EmployeeId: number;
    HolidayListId: number;
    HolidayListDetailId: number;
    HolidayName: string;
    HolidayDescription: string;
    HolidayDate: Date;
}

export interface IEmployeeWithEmpPosVM {
    EmployeeId: number;
    EmployeeNo: number;
    EmployeeName: string;
    DateOfJoin: Date;
    DateOfbirth: Date;
    BloodGroup: string; 
    Religion: string; 
    Permanentaddress: string; 
    City: string; 
    State: string; 
    Country: string; 
    Email: string;
    Gender: string;
    ContactNumber: string;
    MobileNumber: string;
    ResignOn: Date;
    EffectiveFrom: Date;
    statusid: number;
    Status: string;
    Photo: string;
    newPhoto: any;
    DepartmentName: string;
    DesignationName: string;
    Designationname: string;
    PostedOn: Date;
    ModifiedOn: Date;
    ExceptionToPayroll: boolean;
}

export interface IGtnJobCodeVM extends IGtnJobCode{
    ID: number;
    ClientCode: number;
    GeneratedJobCode: string;
    CompanyName: string;
}

export interface IGtnTimeSheetVM extends IGtnTimeSheet {
    JobCodeInString?: string;
    BillType?: string;
}

export interface IFGetStaffUnderManager_Result {
    EmployeeId: number;
    ManagerId: number;
    Lvl: number;
    EmployeeName: string;
    ExceptionToPayroll: boolean;
}

export interface IHRExpensesVM extends IHRExpenses {
    EmployeeNo?: number;
    EmployeeName?: string;
    DepartmentName?: string;
}

export interface IHRInsentiveVM extends IHRInsentive {
    EmployeeNo?: number;
    EmployeeName?: string;
    DepartmentName?: string;
    TempDate?: IInputDateVM;
    isExcelInvalid?: IHRInsentiveVM;
}

export interface IFGetHRAdvanceLoanAll {
    Id: number;
    EmployeeNo: number;
    StaffId: number;
    EmployeeName: string;
    DepartmentName: string;
    Designationname: string;
    TDate: Date;
    Amount: number;
    Installment: number;
    Remarks: string;
    PostedBy: string;
    PostedOn: Date;
    ModifiedBy: string;
    ModifiedOn: Date;
    editToggle?: boolean;
}

export interface CreateSalarySheetVM {
    FYID: number;
    Year: number;
    Month: number;
    IsBonus: boolean;
    UserId: string;
    CompId: number;
}

export interface IFGetSalarySlip_ResultVM {
    StaffId?: number;
    ALId?: number;
    AlDesc?: string;
    AM?: number;
    Amount?: number;
}

export interface IFGetSalShtToPF_Reult {
    EmployeeId?: number;
    EmployeeNo?: number;
    Staff_Name?: string;
    PanNo?: string;
    PFNo?: string;
    Amount?: number;
}

export interface IFGetSalShtToCIT_Reult {
    EmployeeId?: number;
    EmployeeNo?: number;
    Staff_Name?: string;
    PanNo?: string;
    CITNo?: string;
    Amount?: number;
}
export interface IFGetSalShtToBank_Reult {
    EmployeeId?: number;
    EmployeeNo?: number;
    Staff_Name?: string;
    PanNo?: string;
    Account_No?: string;
    Amount?: number;
}

export interface IFGetSalShtToTax_Reult {
    EmployeeId?: number;
    EmployeeNo?: number;
    Staff_Name?: string;
    PanNo?: string;
    Account_No?: string;
    Amount?: number;
}

export interface IFGetEmployee_Result extends IEmployee {
    DepartmentName?: string;
    DepartmentId?: number;
    Designationname?: string;
    DesignationID?: string;
    ExceptionToPayroll?: boolean;
    EmployeeName?: string;
    ReportToId?: number;
    isDisabled?: boolean;
    ReportTo?: IReportTo[];
    EmployeeHolidayList?: IEmployeeHolidayList[];
}

export interface IGetEmployeeListLogin {
    ContactNumber: string
    CugNo: string
    DepartmentName: string
    Email: string
    EmployeeId: number
    EmployeeName: string
    EmployeeNo: number
}

export interface IFgetLeaveApproval_Result {
    EmployeeId: number;
    EmployeeNo: number;
    EmployeeName: string;
    LeaveDate: Date;
    leavestatus: string;
    RequestedLeaveType: string;
    ApprovedLeavetype: string;
    PersonalRemarks: string;
    LeaveStatusUpdateOn: Date;
    LeaveStatusUpdatedBy: string;
    ApproverRemarks: string;
    LeaveStatusId: number;
}

export interface IGetPendingLeaveApproval {
    EmployeeId: number;
    EmployeeNo: number;
    EmployeeName: string;
    LeaveDate: Date;
    RequestedLeaveType: string;
    NumOfDays: number;
    Remarks: string;
    LeaveId: number;
}

export interface IFgetLeaveUseDatewise_Result {
    EmployeeId: number;
    EmployeeNo: number;
    EmployeeName: string;
    DepartmentName: string;
    Designationname: string;
    LeaveType: string;
    ServiceType: number;
    LoginStatusId: number;
    EligibleLeave: number;
    UsedLeave: number;
    AccumulationDays: number;
    Leaves?: EmployeeLeaveRepLeaves[]
}

export interface EmployeeLeaveRepLeaves {
    LeaveTypeId: number;
    Count: number
}

export interface LeaveListLoginStatusVM {
    LoginStatusId: number;
    StatusName: string;
}

export interface FgetEmployeeTurnOver_Result {
    DepartmentId: number;
    CompanyId: number;
    CompanyName: string;
    DepartmentName: string;
    ActiveStaff: number;
    NewEmployee: number;
    ResignEmployee: number;
    Promotion: number;
}

export interface IFGetEmployeeContractRowId_Result {
    EmployeeId: number;
    ECRowId: number;
    ECARowId: number;
    DateOfJoin: Date;
    CED: Date;
    PostedOn: Date;
}

export interface IFGetSalShtMerge_Result {
    EmployeeId: number;
    EmployeeName: string;
    EmployeeNo: number;
    Alid: number;
    AlDesc: string;
    AM: number;
    Amount: number;
}

export interface IFGetOutsideMovementStatus_Result {
    Id: number;
    MovementStatus: string;
    ord: number;
    isChecked: boolean;
}

export interface IFgetCurrentEmployeePosition_Result {
    EmployeeId: number;
    CompanyId: number;
    DivisionId: number;
    DivisionName: string;
    DepartmentId: number;
    DepartmentName: string;
    DesignationId: number;
    DesignationName: string;
    CostCenterId: number;
    CostCenterName: string;
    WorkAreaId: number;
    WorkAreaName: string;
    EffectiveFrom: Date;
}

export interface NavViewModel {
    No?: number;
    Value?: number;
    Name?: string;
    Text?: string;
}

export interface ISalaryGetFoodExpCompanywise {
  staffid: number;
  EmployeeNo: number;
  Employeename: string;
  Year: number;
  Month: number;
  noofDaysinmonth: number;
  Deductdays: string;
  Presentdays: number;
  payableAmount: string;
  companyid: number;
  Companyname: string;
  Branchid: number;
  BranchName: string;
}

export interface ILoginLogImportVM extends ILoginLog {
  isExcelInvalid: boolean;
}
