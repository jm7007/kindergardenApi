/**
 * @description       : 
 * @author            : Lee Jongmin
 * @group             : i2max
 * @last modified on  : 11-04-2024
 * @last modified by  : Lee Jongmin
 * Modifications Log
 * Ver   Date         Author        Modification
 * 1.0   08-04-2024   Lee Jongmin   Initial Version
**/
import { LightningElement } from 'lwc';
import { SIDO_CODE_LIST, SGG_CODE_LIST } from './constants';
import getKindergartenInfo from "@salesforce/apex/KindergardenController.getKindergartenInfo";

export default class KindergardenContainer extends LightningElement {

    sido = "11";
    sgg = "11140";

    get sidoOptions() {
        return SIDO_CODE_LIST;
    }

    get sggOptions() {
        return SGG_CODE_LIST;
    }

    async handleInputChange(event) {
        try {
            this[event.target.name] = event.target.value;
            console.log("this." + event.target.name + ": " + event.target.value);
            console.log(this.sido + this.sgg);
            if (this.sido && this.sgg) {
                let result = await getKindergartenInfo({
                    params: {
                        sidoCode: this.sido,
                        sggCode: this.sgg,
                    },
                    actionName: "basicInfo"
                });
                console.log(result);
            }
        } catch (e) {
            console.log(JSON.stringify(e, 0, 2));
        }
    }
}