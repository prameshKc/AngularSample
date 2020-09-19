import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchfilter'
})
export class SearchFilterPipe implements PipeTransform {
    transform(items: any[], field: string, value: string): any[] {
        if (value != null && value != "") {
            if (!items) return [];
            return items.filter(it => it[field].toUpperCase().lastIndexOf(value.toUpperCase()) != -1);
        } else {
            return items;
        }
    }
}

@Pipe({
    name: 'NPRCurrency'
})
export class NPRCurrency implements PipeTransform {
    transform(value: number): string {
        if (!value) {
            return '-';
        }
        var returnValue = parseFloat(value.toString()).toFixed(2);
        if (!isNaN(value)) {
            var currencySymbol = '';
            //var output = Number(input).toLocaleString('en-IN');   <-- This method is not working fine in all browsers!           
            var result = returnValue.toString().split('.');

            var lastThree = result[0].substring(result[0].length - 3);
            var otherNumbers = result[0].substring(0, result[0].length - 3);
            if (otherNumbers != '')
                lastThree = ',' + lastThree;
            var output = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

            if (result.length > 1) {
                output += `.` + result[1];
            }

            return currencySymbol + output;
        }
    }
}