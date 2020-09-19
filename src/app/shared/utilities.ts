export class Utilities {
    public static isDecimal(value: string | number): boolean {
        const expression = new RegExp(/^[0-9]+(\.[0-9]{1,2})?$/, "gi");
        return expression.test(`${value}`);
    }

    public static isMoney(value: string | number): boolean {
        const expression = new RegExp(/^[0-9]+(\.[0-9]{1,2})?$/, "gi");
        return expression.test(`${value}`);
    }

    public static isNumber(value: any): boolean {
        if (typeof (value) === "undefined" || value === null) {
            return false;
        }
        let returnObj: number;
        if (typeof (value) === "string") {
            returnObj = parseInt(value);
            if (isNaN(returnObj)) {
                return false;
            }
        }
        return true;
    }

    public static isString(value: any): boolean {
        if (typeof (value) === "undefined" || value === null || value === "") {
            return false;
        }
        return true;
    }
}

export interface IFormValidation {
    Name?: string;
    IsValid: boolean;
    ErrorMessage: string;
    FieldValidations?: IFormValidation[];
}