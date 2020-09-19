import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DivisionComponent } from './pages/division/division.component';
import { CompanyComponent } from './pages/company/company.component';
import { DepartmentComponent } from './pages/department/department.component';
import { DesignationComponent } from './pages/designation/designation.component';
import { CategoryComponent } from './pages/category/category.component';
import { LoginShiftComponent } from './pages/loginShift/loginShift.component';
import { LoginGroupComponent } from './pages/loginGroup/loginGroup.component';
import { WorkAreaComponent } from './pages/workArea/workArea.component';
import { LeaveComponent } from './pages/leave/leave.component';
import { LeaveApprovalComponent } from './pages/leaveApproval/leaveApproval.component';
import { LeaveTypeComponent } from './pages/leaveType/leaveType.component';
import { HolidayListComponent } from './pages/holiday/holidayList/holidayList.component';
import { DataTypeComponent } from './pages/dataType/dataType.component';
import { ParamComponent } from './pages/param/param.component';
import { CostCenterComponent } from './pages/costCenter/costCenter.component';
import { ReligionComponent } from './pages/religion/religion.component';
import { SystemParamComponent } from './pages/systemParam/systemParam.component';
import { UserParamComponent } from './pages/userParam/userParam.component';
import { MenuComponent } from './pages/menu/menu.component';
import { MenuTemplateComponent } from './pages/menuTemplate/menuTemplate.component';
import { EmployeeComponent } from './pages/employee/employee.component';
import { EmployeeWorkAreaComponent } from './pages/employeeWorkArea/employeeWorkArea.component';
import { EmployeePositionComponent } from './pages/employeePosition/employeePosition.component';
import { EmployeeTransferAndPromotionComponent } from './pages/employeeTransferAndPromotion/employeeTransferAndPromotion.component';
import { UserComponent } from './pages/user/user.component';
import { ChaCalendarComponent } from './shared/chaCalendar/chaCalendar';
import { LoginReportComponent } from './pages/Attendence/loginReport.component';
import { AdminLoginReportComponent } from './pages/Attendence/adminLoginReport/adminLoginReport.component';
import { EmployeeShiftComponent } from './pages/changeEmployeeShift/changeEmployeeShift.component';
import { AssignSupervisorComponent } from './pages/assignSupervisor/assignSupervisor.component';
import { PromotionDetail } from './pages/promotionDetail/promotionDetail.component';
import { MyProfileComponent } from './pages/myProfile/myProfile.component';
import { EmployeeResignComponent } from './pages/employeeResign/employeeResign.component';
import { EmployeeResignApprovalComponent } from './pages/employeeResignApproval/employeeResignApproval.component';
import { EmployeeHolidayListComponent } from './pages/assignHolidayList/assignHolidayList.component';
import { ChangePasswordComponent } from './shared/changePassword/changePassword.component';
import { UnitComponent } from './pages/unit/unit.component';
import { ClientComponent } from './pages/client/client.component';
import { JobCodeComponent } from './pages/jobCode/jobCode.component';
import { TimeSheetComponent } from './pages/timeSheet/timeSheet.component';
import { TimeSheetReportComponent } from './pages/timeSheetReport/timeSheetReport.component';
import { TimeSheetIndividualReportComponent } from './pages/timeSheetIndividualReport/timeSheetIndividualReport.component';
import { LeavePolicyComponent } from './pages/leavePolicy/leavePolicy.component';
import { LeavePolicyEmployeeComponent } from './pages/leavePolicyEmployee/leavePolicyEmployee.component';
import { CompensableLeaveReportComponent } from './pages/compensableLeaveReport/compensableLeaveReport.component';
import { EmployeeHolidayListDataComponent } from './pages/employeeHolidayListData/employeeHolidayListData.component';
import { EmployeeAttendanceDetailComponent } from './pages/employeeAttendanceDetail/employeeAttendanceDetail.component';
import { MonthwiseAttendanceComponent } from './pages/monthwiseAttendance/monthwiseAttendance.component';
import { HRBankInfoComponent } from './pages/hRBankInfo/hRBankInfo.component';
import { HRDashainInfoComponent } from './pages/hRDashainCal/hRDashainCal.component';
import { HRMGradeComponent } from './pages/hRMGrade/hRMGrade.component';
import { HRMLedgerComponent } from './pages/hRMLedger/hRMLedger.component';
import { HRMLevelComponent } from './pages/hRMLevel/hRMLevel.component';
import { HRLevelVsAllowancesComponent } from './pages/hRLevelVsAllowances/hRLevelVsAllowances.component';
import { NoticeComponent } from './pages/notice/notice.component';
import { NoticeReceiverComponent } from './pages/noticeReceiver/noticeReceiver.component';
import { GtnJobCodeComponent } from './pages/gtnJobCode/gtnJobCode.component';
import { GtnTimeSheetComponent } from './pages/gtnTimeSheet/gtnTimeSheet.component';
import { GtnTimeSheetReportComponent } from './pages/gtnTimeSheetReport/gtnTimeSheetReport.component';
import { HRStaffInfoComponent } from './pages/hRStaffInfo/hRStaffInfo.component';
import { HRLeaveComponent } from './pages/hRLeave/hRLeave.component';
import { HRAdvanceLoanComponent } from './pages/hrAdvanceLoan/hrAdvanceLoan.component';
import { DailyLoginMap } from './shared/dailyLoginMap/dailyLoginMap';
import { BirthdayNotificationComponent } from './pages/birthdayNotification/birthdayNotification.component';
import { HRExpensesComponent } from './pages/hRExpenses/hRExpenses.component';
import { HRIncentivesComponent } from './pages/hRIncentives/hRIncentives.component';
import { CreateSalarySheetComponent } from './shared/createSalSht/createSalSht';
import { SalarySheetComponent } from './pages/salSht/salSht.component';
import { SalarySheetMergeComponent } from './pages/salShtMerge/salShtMerge.component';
import { SalarySlipComponent } from './pages/salarySlip/salarySlip.component';
import { PFStatementComponent } from './pages/pfStatement/pfStatement.component';
import { CITStatementComponent } from './pages/citStatement/citStatement.component';
import { BankStatementComponent } from './pages/bankStatement/bankStatement.component';
import { TaxStatementComponent } from './pages/taxStatement/taxStatement.component';
import { SalarySheetDepWiseComponent } from './pages/salShtDepWise/salShtDepWise.component';
import { EmpLeaveDatewiseReport } from './pages/empLeaveDatewiseRep/empLeaveDatewiseRep.component';
import { EmpTurnOverRep } from './pages/employeeTurnOverRep/employeeTurnOverRep.component';
import { HRSalaryOBComponent } from './pages/hrSalaryOB/hrSalaryOB.component';
import { OutsideMovementComponent } from './pages/outsideMovement/outsideMovement.component';
import { OutsideMovementApprovalComponent } from './pages/outsideMovementApproval/outsideMovementApproval.component';
import { UserBrnCompanyComponent } from './pages/userBrnCompany/userBrnCompany.component';
import { NavMappingComponent } from './pages/navMapping/navMapping';
import { NavLedgerComponent } from './pages/navLedger/navLedger.component';
import { LoginComponent } from './pages/login/login.component';
import { LoginImportComponent } from './pages/loginImport/loginImport';
import { EmployeeFoodAllowanceComponent } from './pages/reports/employeeFoodAllowance/employeeFoodAllowance';

const appRoutes: Routes = [
  {
    path: 'layout',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'division', component: DivisionComponent },
      { path: 'company', component: CompanyComponent },
      { path: 'department', component: DepartmentComponent },
      { path: 'designation', component: DesignationComponent },
      { path: 'category', component: CategoryComponent },
      { path: 'loginShift', component: LoginShiftComponent },
      { path: 'loginGroup', component: LoginGroupComponent },
      { path: 'workArea', component: WorkAreaComponent },
      { path: 'leaveReport', component: LeaveComponent },
      { path: 'leaveApproval', component: LeaveApprovalComponent },
      { path: 'leaveType', component: LeaveTypeComponent },
      { path: 'designation', component: DesignationComponent },
      { path: 'holidayList', component: HolidayListComponent },
      { path: 'dataType', component: DataTypeComponent },
      { path: 'paramSetup', component: ParamComponent },
      { path: 'costCenter', component: CostCenterComponent },
      { path: 'religion', component: ReligionComponent },
      { path: 'systemParam', component: SystemParamComponent },
      { path: 'userParam', component: UserParamComponent },
      { path: 'menuSetup', component: MenuComponent },
      { path: 'menuTemplateSetup', component: MenuTemplateComponent },
      { path: 'employee', component: EmployeeComponent },
      { path: 'employeeWorkArea', component: EmployeeWorkAreaComponent },
      { path: 'editEmployeePosition', component: EmployeePositionComponent },
      { path: 'employeeTransferAndPromotion', component: EmployeeTransferAndPromotionComponent },
      { path: 'userSetup', component: UserComponent },
      { path: 'calendar', component: ChaCalendarComponent },
      { path: 'loginReport', component: LoginReportComponent },
      { path: 'adminLoginReport', component: AdminLoginReportComponent },
      { path: 'changeEmployeeShift', component: EmployeeShiftComponent },
      { path: 'assignSupervisor', component: AssignSupervisorComponent },
      { path: 'promotionDetail', component: PromotionDetail },
      { path: 'myProfile', component: MyProfileComponent },
      { path: 'employeeResign', component: EmployeeResignComponent },
      { path: 'employeeResignApproval', component: EmployeeResignApprovalComponent },
      { path: 'assignHolidayList', component: EmployeeHolidayListComponent },
      { path: 'changePassword', component: ChangePasswordComponent },
      { path: 'unit', component: UnitComponent },
      { path: 'client', component: ClientComponent },
      { path: 'jobCode', component: JobCodeComponent },
      { path: 'timeSheet', component: TimeSheetComponent },
      { path: 'timeSheetReport', component: TimeSheetReportComponent },
      { path: 'timeSheetIndividualReport', component: TimeSheetIndividualReportComponent },
      { path: 'leavePolicy', component: LeavePolicyComponent },
      { path: 'leavePolicyEmployee', component: LeavePolicyEmployeeComponent },
      { path: 'compensableLeaveReport', component: CompensableLeaveReportComponent },
      { path: 'employeeHolidayList', component: EmployeeHolidayListDataComponent },
      { path: 'attendanceDetail', component: EmployeeAttendanceDetailComponent },
      { path: 'monthlyAttendanceDetail', component: MonthwiseAttendanceComponent },
      { path: 'bankInfo', component: HRBankInfoComponent },
      { path: 'dashainInfo', component: HRDashainInfoComponent },
      { path: 'gradeSetup', component: HRMGradeComponent },
      { path: 'ledgerSetup', component: HRMLedgerComponent },
      { path: 'levelSetup', component: HRMLevelComponent },
      { path: 'allowanceSetup', component: HRLevelVsAllowancesComponent },
      { path: 'generateNotice', component: NoticeComponent },
      { path: 'notice', component: NoticeReceiverComponent },
      { path: 'gtnJobCode', component: GtnJobCodeComponent },
      { path: 'gtnTimeSheet', component: GtnTimeSheetComponent },
      { path: 'gtnTimeSheetReport', component: GtnTimeSheetReportComponent },
      { path: 'hrStaffInfo', component: HRStaffInfoComponent },
      { path: 'hrLeave', component: HRLeaveComponent },
      { path: 'hrAdvanceLoan', component: HRAdvanceLoanComponent },
      { path: 'displayLoginMap', component: DailyLoginMap },
      { path: 'birthdayNotification', component: BirthdayNotificationComponent },
      { path: 'expenses', component: HRExpensesComponent },
      { path: 'incentives', component: HRIncentivesComponent },
      { path: 'createSalarySheet', component: CreateSalarySheetComponent },
      { path: 'viewSalarySheet', component: SalarySheetComponent },
      { path: 'viewSalarySheetMerge', component: SalarySheetMergeComponent },
      { path: 'salarySlip', component: SalarySlipComponent },
      { path: 'pfStatement', component: PFStatementComponent },
      { path: 'citStatement', component: CITStatementComponent },
      { path: 'bankStatement', component: BankStatementComponent },
      { path: 'taxStatement', component: TaxStatementComponent },
      { path: 'salarySheetDepWiseStatement', component: SalarySheetDepWiseComponent },
      { path: 'empLeaveDateWiseReport', component: EmpLeaveDatewiseReport },
      { path: 'empTurnOverRep', component: EmpTurnOverRep },
      { path: 'hrEmpSalOpBal', component: HRSalaryOBComponent },
      { path: 'empOutsideMovement', component: OutsideMovementComponent },
      { path: 'empOutsideMovementApproval', component: OutsideMovementApprovalComponent },
      { path: 'user-controlled-branches', component: UserBrnCompanyComponent },
      { path: 'nav-mapping', component: NavMappingComponent },
      { path: 'nav-ledger', component: NavLedgerComponent },
      { path: 'login-import', component: LoginImportComponent },
      { path: 'emp-food-expense', component: EmployeeFoodAllowanceComponent },
      
    ]
  },
  {
    path: '',
    redirectTo: 'layout',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
