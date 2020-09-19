import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ngx-ckeditor';

import { AlertModule, TooltipModule, ModalModule, DatepickerModule, TimepickerModule, TypeaheadModule, BsDropdownModule, TabsModule } 
from 'ngx-bootstrap';
import { ToastyModule, ToastyService } from 'ngx-toasty';
import { AssignSupervisorComponent } from './pages/assignSupervisor/assignSupervisor.component';
import { LeaveComponent } from './pages/leave/leave.component';
import { EmployeeComponent } from './pages/employee/employee.component';
import { EmployeeWorkAreaComponent } from './pages/employeeWorkArea/employeeWorkArea.component';
import { EmployeePositionComponent } from './pages/employeePosition/employeePosition.component';
import { EmployeeTransferAndPromotionComponent } from './pages/employeeTransferAndPromotion/employeeTransferAndPromotion.component';
import { CategoryComponent } from './pages/category/category.component';
import { ChildCategoryComponent } from './pages/category/childCategory/childCategory.component';
import { ChildDepartmentComponent } from './pages/department/childDepartment/childDepartment.component';
import { ChildDesignationComponent } from './pages/designation/childDesignation/childDesignation.component';
import { ChildDivisionComponent } from './pages/division/childDivision/childDivision.component';
import { DataTypeComponent } from './pages/dataType/dataType.component';
import { DepartmentComponent } from './pages/department/department.component';
import { DesignationComponent } from './pages/designation/designation.component';
import { DivisionComponent } from './pages/division/division.component';
import { ParamComponent } from './pages/param/param.component';
import { ChildParamComponent } from './pages/param/childParam/childParam.component';
import { SelectChildParamComponent } from './pages/param/selectChildParam/selectChildParam.component';
import { AdminLoginReportComponent } from './pages/Attendence/adminLoginReport/adminLoginReport.component';
import { SystemParamComponent } from './pages/systemParam/systemParam.component';
import { UserParamComponent } from './pages/userParam/userParam.component';
import { CompanyComponent } from './pages/company/company.component';
import { SelectChildCompanyComponent } from './pages/company/selectChildCompany/selectChildCompany.component';
import { CompanySelectComponent } from './shared/companySelect/companySelect';
import { LoginShiftComponent } from './pages/loginShift/loginShift.component';
import { LoginGroupComponent } from './pages/loginGroup/loginGroup.component';
import { WorkAreaComponent } from './pages/workArea/workArea.component';
import { LeaveTypeComponent } from './pages/leaveType/leaveType.component';
import { LoginReportComponent } from './pages/Attendence/loginReport.component';
import { LeaveApprovalComponent } from './pages/leaveApproval/leaveApproval.component';
import { HolidayListComponent } from './pages/holiday/holidayList/holidayList.component';
import { CostCenterComponent } from './pages/costCenter/costCenter.component';
import { ReligionComponent } from './pages/religion/religion.component';
import { SelectChildDivisionComponent } from './pages/division/selectChildDivision/selectChildDivision.component';
import { SelectChildDepartmentComponent } from './pages/department/selectChildDepartment/selectChildDepartment.component';
import { SelectChildDesignationComponent } from './pages/designation/selectChildDesignation/selectChildDesignation.component';
import { SelectChildCategoryComponent } from './pages/category/selectChildCategory/selectChildCategory.component';
import { ChaNepaliDatePickerComponent } from './shared/chaNepaliDatePicker/chaNepaliDatePicker';
import { ChaCalendarComponent } from './shared/chaCalendar/chaCalendar';
import { MenuComponent } from './pages/menu/menu.component';
import { ChildMenuComponent } from './pages/menu/childMenu/childMenu.component';
import { SelectChildMenuComponent } from './pages/menu/selectChildMenu/selectChildMenu.component';
import { DateViewComponent } from './shared/dateView/dateView';
import { TimeViewComponent } from './shared/timeView/timeView';
import { MenuTemplateComponent } from './pages/menuTemplate/menuTemplate.component';
import { selectMenuComponent } from './pages/menuTemplate/selectMenu/selectMenu.component';
import { EmployeeSearchComponent } from './shared/employeeSearch/employeeSearch.component';
import { AssignSupervisorEmployeeSearchComponent } from './shared/assignSupervisorEmployeeSearch/assignSupervisorEmployeeSearch.component';
import { SearchFilterPipe, NPRCurrency } from './shared/searchFilterPipe';
import { LoginComponent } from './pages/login/login.component';
import { UserComponent } from './pages/user/user.component';
import { EmployeeShiftComponent } from './pages/changeEmployeeShift/changeEmployeeShift.component';
import { PromotionDetail } from './pages/promotionDetail/promotionDetail.component';
import { MyProfileComponent } from './pages/myProfile/myProfile.component';
import { WebLoginComponent } from './shared/webLogin/webLogin.component';
import { showReportToComponent } from './shared/reportToView/reportTo';
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
import { DashboardComponent } from './pages/dashboard/dashboard.component';
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
import { NoticeListComponent } from './pages/noticeReceiver/noticeList/noticeList';
import { NoticeReceiverComponent } from './pages/noticeReceiver/noticeReceiver.component';
import { GtnJobCodeComponent } from './pages/gtnJobCode/gtnJobCode.component';
import { GtnDepartmentComponent } from './pages/gtnDepartment/gtnDepartment.component';
import { GtnUnitComponent } from './pages/gtnUnit/gtnUnit.component';
import { GtnSubUnitComponent } from './pages/gtnSubUnit/gtnSubUnit.component';
import { GtnTimeSheetComponent } from './pages/gtnTimeSheet/gtnTimeSheet.component';
import { GtnTimeSheetReportComponent } from './pages/gtnTimeSheetReport/gtnTimeSheetReport.component';
import { HRStaffInfoComponent } from './pages/hRStaffInfo/hRStaffInfo.component';
import { HRLeaveComponent } from './pages/hRLeave/hRLeave.component';
import { HRAdvanceLoanComponent } from './pages/hrAdvanceLoan/hrAdvanceLoan.component';
import { DailyLoginMap } from './shared/dailyLoginMap/dailyLoginMap';
import { BirthdayNotificationComponent } from './pages/birthdayNotification/birthdayNotification.component';
import { HRExpensesComponent } from './pages/hRExpenses/hRExpenses.component';
import { HRIncentivesComponent } from './pages/hRIncentives/hRIncentives.component';
import { EmployeeNameComponent } from './shared/employeeName/employeeName';
import { EmployeePayrollComponent } from './shared/employeePayroll/employeePayroll';
import { CreateSalarySheetComponent } from './shared/createSalSht/createSalSht';
import { SalarySheetComponent } from './pages/salSht/salSht.component';
import { SalarySheetMergeComponent } from './pages/salShtMerge/salShtMerge.component';
import { EmployeeExpensesComponent } from './shared/employeeExpenses/employeeExpenses';
import { SalarySlipComponent } from './pages/salarySlip/salarySlip.component';
import { PFStatementComponent } from './pages/pfStatement/pfStatement.component';
import { CITStatementComponent } from './pages/citStatement/citStatement.component';
import { BankStatementComponent } from './pages/bankStatement/bankStatement.component';
import { TaxStatementComponent } from './pages/taxStatement/taxStatement.component';
import { SalarySheetDepWiseComponent } from './pages/salShtDepWise/salShtDepWise.component';
import { EmployeeListLoginComponent } from './shared/employeeListLogin/employeeListLogin';
import { AttendanceReportStaffMonthly } from './shared/attendanceReportStaffMonthly/attendanceReportStaffMonthly';
import { EmpTurnOverRep } from './pages/employeeTurnOverRep/employeeTurnOverRep.component';
import { EmpLeaveDatewiseReport } from './pages/empLeaveDatewiseRep/empLeaveDatewiseRep.component';
import { DepartmentSelectComponent } from './shared/departmentSelect/departmentSelect';
import { DesignationSelectComponent } from './shared/designationSelect/designationSelect';
import { EmployeeNomineeComponent } from './shared/employeeNominee/employeeNominee';
import { EmployeeContractComponent } from './shared/employeeContract/employeeContract';
import { EmployeeCertificateComponent } from './shared/employeeFeatures/employeeCertificate/employeeCertificate';
import { EmployeeEducationComponent } from './shared/employeeFeatures/employeeEducation/employeeEducation';
import { EmployeeExperienceComponent } from './shared/employeeFeatures/employeeExperience/employeeExperience';
import { EmployeeTrainingComponent } from './shared/employeeFeatures/employeeTraining/employeeTraining';
import { EmployeeDecorationComponent } from './shared/employeeFeatures/employeeDecoration/employeeDecoration';
import { EmployeeGenericInfoComponent } from './shared/employeeFeatures/employeeGenericInfo/employeeGenericInfo';
import { EmployeeGrievanceComponent } from './shared/employeeFeatures/employeeGrievance/employeeGrievance';
import { EmployeeOtherActivityComponent } from './shared/employeeFeatures/employeeOtherActivity/employeeOtherActivity';
import { EmployeeResearchComponent } from './shared/employeeFeatures/employeeResearch/employeeResearch';
import { EmployeeSWMCComponent } from './shared/employeeFeatures/employeeSWMC/employeeSWMC';
import { EmployeeVacancyComponent } from './shared/employeeFeatures/employeeVacancy/employeeVacancy';
import { EmployeeCVComponent } from './shared/employeeFeatures/employeeCV/employeeCV';
import { EmployeeOtherDocumentComponent } from './shared/employeeFeatures/employeeOtherDocument/employeeOtherDocument';
import { HRSalaryOBComponent } from './pages/hrSalaryOB/hrSalaryOB.component';
import { SideMenuComponent } from './pages/layout/sideMenu/sideMenu.component';
import { OutsideMovementComponent } from './pages/outsideMovement/outsideMovement.component';
import { OutsideMovementApprovalComponent } from './pages/outsideMovementApproval/outsideMovementApproval.component';
import { OutsideMovementFormComponent } from './pages/outsideMovementForm/outsideMovementForm';
import { UserBrnCompanyComponent } from './pages/userBrnCompany/userBrnCompany.component';
import { selectCompanyComponent } from './pages/userBrnCompany/selectCompany/selectCompany.component';
import { childCompanyComponent } from './pages/company/childCompany/childCompany.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { HeaderComponent } from './pages/layout/header/header.component';
import { DrawerComponent } from './pages/layout/sideMenu/drawer/drawer.component';
import { DrawerItemComponent } from './pages/layout/sideMenu/drawerItem/drawerItem.component';
import { showHolidayListNameComponent } from './shared/holidayListView/holidayListView';
import { PickerYearMonthComponent } from './shared/pickerYearMonth/pickerYearMonth';
import { RangeDatePickerComponent } from './shared/rangeDatePicker/rangeDatePicker';

import { NavMappingComponent } from './pages/navMapping/navMapping';
import { HRMLedgerNavMappingComponent } from './pages/navMapping/hRMLedgerNavMapping/hRMLedgerNavMapping';
import { HRMLNMSelectComponent } from './pages/navMapping/hRMLedgerNavMapping/hRMLNMSelect/hRMLNMSelect';
import { BranchNavMappingComponent } from './pages/navMapping/branchNavMapping/branchNavMapping';
import { BranchNMSelectComponent } from './pages/navMapping/branchNavMapping/branchNMSelect/branchNMSelect';

import { NavLedgerComponent } from './pages/navLedger/navLedger.component';
import { AuthInterceptorService } from './services/AuthInterceptor';
import { PaginationComponent } from './shared/pagination/pagination.component';
import { EmployeeListComponent } from './pages/reports/employeeList/employeeList';
import { CompanyNameComponent } from './shared/companyName/companyName';
import { LoginImportComponent } from './pages/loginImport/loginImport';
import { EmployeeFoodAllowanceComponent } from './pages/reports/employeeFoodAllowance/employeeFoodAllowance';
import { LoginViewChartComponent } from './shared/loginViewChart/loginViewChart';
import { EmployeeAttendaceSummaryComponent } from './pages/reports/employeeAttSummary/employeeAttSummary';
import { DaysRemainingPipe } from './shared/daysRemainingPipe';

@NgModule({
  imports: [
    AppRoutingModule,
    BrowserModule,
    ChartsModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    LeafletModule.forRoot(),
    AlertModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    DatepickerModule.forRoot(),
    ToastyModule.forRoot(),
    TimepickerModule.forRoot(),
    TypeaheadModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    CKEditorModule,
    AngularFontAwesomeModule
  ],
  declarations: [
    AppComponent,
    AssignSupervisorComponent,
    LeaveComponent,
    EmployeeComponent,
    EmployeeWorkAreaComponent,
    EmployeeWorkAreaComponent,
    EmployeePositionComponent,
    EmployeeTransferAndPromotionComponent,
    CategoryComponent,
    ChildCategoryComponent,
    ChildDepartmentComponent,
    ChildDesignationComponent,
    ChildDivisionComponent,
    DataTypeComponent,
    DepartmentComponent,
    DesignationComponent,
    DivisionComponent,
    ParamComponent,
    ChildParamComponent,
    SelectChildParamComponent,
    AdminLoginReportComponent,

    SystemParamComponent,
    UserParamComponent,
    CompanyComponent,
    SelectChildCompanyComponent,
    CompanySelectComponent,

    LoginShiftComponent,
    LoginGroupComponent,
    WorkAreaComponent,
    LeaveTypeComponent,
    LoginReportComponent,
    LeaveApprovalComponent,
    HolidayListComponent,
    CostCenterComponent,
    ReligionComponent,
    SelectChildDivisionComponent,
    SelectChildDepartmentComponent,
    SelectChildDesignationComponent,
    SelectChildCategoryComponent,
    ChaNepaliDatePickerComponent,
    ChaCalendarComponent,
    MenuComponent,
    ChildMenuComponent,
    SelectChildMenuComponent,
    DateViewComponent,
    TimeViewComponent,
    MenuTemplateComponent,
    selectMenuComponent,
    EmployeeSearchComponent,
    AssignSupervisorEmployeeSearchComponent,

    SearchFilterPipe,
    DaysRemainingPipe,
    NPRCurrency,

    LoginComponent,
    UserComponent,
    EmployeeShiftComponent,
    PromotionDetail,
    MyProfileComponent,
    WebLoginComponent,
    showReportToComponent,
    EmployeeResignComponent,
    EmployeeResignApprovalComponent,
    EmployeeHolidayListComponent,
    ChangePasswordComponent,
    UnitComponent,
    ClientComponent,
    JobCodeComponent,
    TimeSheetComponent,
    TimeSheetReportComponent,
    TimeSheetIndividualReportComponent,
    PaginationComponent,

    LeavePolicyComponent,
    LeavePolicyEmployeeComponent,
    CompensableLeaveReportComponent,
    DashboardComponent,
    EmployeeHolidayListDataComponent,
    EmployeeAttendanceDetailComponent,
    MonthwiseAttendanceComponent,
    HRBankInfoComponent,
    HRDashainInfoComponent,
    HRMGradeComponent,
    HRMLedgerComponent,
    HRMLevelComponent,
    HRLevelVsAllowancesComponent,
    NoticeComponent,
    NoticeListComponent,
    NoticeReceiverComponent,
    GtnJobCodeComponent,
    GtnDepartmentComponent,
    GtnUnitComponent,
    GtnSubUnitComponent,
    GtnTimeSheetComponent,
    GtnTimeSheetReportComponent,
    HRStaffInfoComponent,
    HRLeaveComponent,
    HRAdvanceLoanComponent,
    DailyLoginMap,
    BirthdayNotificationComponent,
    HRExpensesComponent,
    HRIncentivesComponent,
    EmployeeNameComponent,
    EmployeePayrollComponent,
    CreateSalarySheetComponent,
    SalarySheetComponent,
    SalarySheetMergeComponent,
    EmployeeExpensesComponent,
    SalarySlipComponent,
    PFStatementComponent,
    CITStatementComponent,
    BankStatementComponent,
    TaxStatementComponent,
    SalarySheetDepWiseComponent,
    EmployeeListLoginComponent,
    AttendanceReportStaffMonthly,
    EmpTurnOverRep,
    EmpLeaveDatewiseReport,
    DepartmentSelectComponent,
    DesignationSelectComponent,
    EmployeeNomineeComponent,
    EmployeeContractComponent,
    EmployeeCertificateComponent,
    EmployeeEducationComponent,
    EmployeeExperienceComponent,
    EmployeeTrainingComponent,
    EmployeeDecorationComponent,
    EmployeeGenericInfoComponent,
    EmployeeGrievanceComponent,
    EmployeeOtherActivityComponent,
    EmployeeResearchComponent,
    EmployeeSWMCComponent,
    EmployeeVacancyComponent,
    EmployeeCVComponent,
    EmployeeOtherDocumentComponent,
    HRSalaryOBComponent,
    SideMenuComponent,
    OutsideMovementComponent,
    OutsideMovementApprovalComponent,
    OutsideMovementFormComponent,

    UserBrnCompanyComponent,
    selectCompanyComponent,

    childCompanyComponent,
    LayoutComponent,
    HeaderComponent,
    DrawerComponent,
    DrawerItemComponent,

    showHolidayListNameComponent,
    PickerYearMonthComponent,
    RangeDatePickerComponent,

    NavMappingComponent,
    HRMLedgerNavMappingComponent,
    HRMLNMSelectComponent,
    BranchNavMappingComponent,
    BranchNMSelectComponent,

    EmployeeListComponent,
    NavLedgerComponent,
    EmployeeFoodAllowanceComponent,

    LoginImportComponent,
    CompanyNameComponent,
    LoginViewChartComponent,

    EmployeeAttendaceSummaryComponent,
    EmployeeFoodAllowanceComponent,
  ],
  providers: [
    ToastyService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
