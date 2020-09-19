import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'DaysRemaining'
})
export class DaysRemainingPipe implements PipeTransform {
  transform(value: Date): string {
    let currentDate: Date = new Date();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    let newValue: Date = new Date(value);
    console.log(value);

    let diff: number = Math.abs(currentDate.getTime() - newValue.getTime());
    let diffDays = Math.round(diff / (24 * 60 * 60 * 1000));

    if (diffDays > 1) {
      return `${diffDays.toString()} days left`;
    } else if (diffDays == 1) {
      return 'Tommorrow';
    } else {
      return 'Today';
    }

    //if (value != null) {
    //  if (!items) return [];
    //  return items.filter(it => it[field].toUpperCase().lastIndexOf(value.toUpperCase()) != -1);
    //} else {
    //  return items;
    //}
  }
}
