import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ILoginStatusVm } from 'src/app/models/ViewModels';

import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, Color } from 'ng2-charts';

@Component({
  selector: 'login-view-chart',
  templateUrl: './loginViewChart.html',
})
export class LoginViewChartComponent implements OnChanges {
  @Input() loginData: ILoginStatusVm[];
  @Input() chartType: string;
  
  inputData: ILoginStatusVm[];

  constructor() {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (JSON.stringify(this.loginData) != JSON.stringify(this.inputData)) {
      this.inputData = [...this.loginData]
      this.setDataValues();
    }
  }

  setDataValues() {
    this.chartData = [
      {
        data: this.inputData.map(x => { return x.Count }),
        label: 'Attendance Report',
        backgroundColor: this.inputData.map(x => { return x.ColorCode }),
        hoverBackgroundColor: this.inputData.map(x => { return x.ColorCode }),
        hideInLegendAndTooltip: true
      }
    ];

    this.chartLabels = this.inputData.map(x => {
      return x.StatusName;
    });
  }

  public chartOptions: ChartOptions = {
    responsive: true,
  };

  public chartLabels: Label[] = [];
  public chartLegend = true;
  public chartPlugins = [];
  public chartData: ChartDataSets[] = [];

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }
}
