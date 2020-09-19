import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

@Component({
    selector: 'time-view',
    template: "<span>{{newTime}}</span>"
})
export class TimeViewComponent {
    @Input() inputTime: string;

    newTime: string = '';

    defaultDateType: number;
    defaultADFormat: number;
    defaultBSFormat: number;

    constructor() { }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        this.newTime = this.getTime();
    }

    getTime(): string {
        if (this.inputTime != null) {
            var time = this.inputTime;
            var time2;
            var index: number;
            time = time.replace("PT", "");
            if (time.indexOf("H") < 0) {
                index = 0;
                time = [time.slice(0, index), "00H", time.slice(index)].join('');
            }
            if (time.indexOf("M") < 0) {
                index = time.indexOf("H") + 1;
                time = [time.slice(0, index), "00M", time.slice(index)].join('');
            }
            if (time.indexOf("S") < 0) {
                index = time.indexOf("M") + 1;
                time = [time.slice(0, index), "00S", time.slice(index)].join('');
            }
            time = time.replace("PT", '').replace("H", ":").replace("M", ":").replace("S", "")
            var c = time.split(":");

            if (Number(c[1]) < 10 && c[1] != "00") {
                c[1] = '0' + c[1].toString();
            }
            if (Number(c[2]) < 10 && c[2] != "00") {
                c[2] = '0' + c[2].toString();
            }

            if (Number(c[0]) > 12 && Number(c[0]) < 24) {

                if (Number(c[0]) - 12 < 10) {
                    c[0] = ("0" + (Number(c[0]) - 12)).slice(-2);
                }

                time2 = c[0] + ":" + c[1] + ":" + c[2] + " " + "PM";
            }
            else if (Number(c[0]) < 12 && Number(c[0]) > 0) {
                if (Number(c[0]) - 12 < 10) {
                    c[0] = ("0" + Number(c[0])).slice(-2);
                }
                time2 = c[0] + ":" + c[1] + ":" + c[2] + " " + "AM";
            }
            else {
                if (Number(c[0]) == 12) {
                    time2 = "12" + ":" + c[1] + ":" + c[2] + " " + "PM";
                }
                else {
                    time2 = "12" + ":" + c[1] + ":" + c[2] + " " + "AM";
                }
            }

            return time2;
        } else {
            return '-';
        }
    }
}
