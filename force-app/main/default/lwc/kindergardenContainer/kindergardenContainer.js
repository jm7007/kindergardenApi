/**
 * @description       : 
 * @author            : Lee Jongmin
 * @group             : i2max
 * @last modified on  : 12-04-2024
 * @last modified by  : Lee Jongmin
 * Modifications Log
 * Ver   Date         Author        Modification
 * 1.0   08-04-2024   Lee Jongmin   Initial Version
**/
import { LightningElement } from 'lwc';
import { SIDO_CODE_LIST, SGG_CODE_LIST } from './constants';
import getKindergartenInfo from "@salesforce/apex/KindergardenController.getKindergartenInfo";

export default class KindergardenContainer extends LightningElement {

    sido = "---";
    sgg = "";

    infoData;
    selectedSchool;

    isLoading = false;


    get sidoOptions() {
        return SIDO_CODE_LIST;
    }

    get sggOptions() {
        return SGG_CODE_LIST.filter(sgg => sgg.value.startsWith(this.sido));
    }



    handleSidoChange(event) {
        this.sido = event.detail.name;
        this.sgg = null;
    }

    async handleSggChange(event) {
        try {
            this.isLoading = true;
            this.sgg = event.detail.name;

            if (!this.sido || !this.sgg) {
                return;
            }

            let result = await getKindergartenInfo({
                params: {
                    sidoCode: this.sido,
                    sggCode: this.sgg,
                },
                actionName: "basicInfo"
            });

            console.log(result);

            if (JSON.parse(result).status !== "SUCCESS") {
                return;
            }

            this.infoData = JSON.parse(result).kinderInfo;

            console.log('infoData: ' + JSON.stringify(this.infoData, 0, 2));

            this.isLoading = false;
        } catch (e) {
            console.log(JSON.stringify(e, 0, 2));
            this.isLoading = false;
        }
    }

    handleSchoolSelect(event) {
        this.selectedSchool = this.infoData[parseInt(event.detail.name) - 1];

        console.log('selected School: ' + JSON.stringify(this.selectedSchool, 0, 2));
    }
}