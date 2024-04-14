/**
 * @description       : 
 * @author            : Lee Jongmin
 * @group             : i2max
 * @last modified on  : 15-04-2024
 * @last modified by  : Lee Jongmin
 * Modifications Log
 * Ver   Date         Author        Modification
 * 1.0   08-04-2024   Lee Jongmin   Initial Version
**/

/* --------------------------------------------------------------------------------------------------------
* Import
-------------------------------------------------------------------------------------------------------- */
import { LightningElement } from 'lwc';
import { SIDO_CODE_LIST, SGG_CODE_LIST } from './constants';
import getKindergartenInfo from "@salesforce/apex/KindergardenController.getKindergartenInfo";
import getNaverMapAuthentication from "@salesforce/apex/KindergardenController.getNaverMapAuthentication";
import addressToCoordinate from "@salesforce/apex/KindergardenController.addressToCoordinate";

const naverMapRequestUrl = "https://naveropenapi.apigw.ntruss.com/map-static/v2/raster-cors";
// const naverMapRequestUrl = "https://naveropenapi.apigw.ntruss.com/map-static/v2/raster";
export default class KindergardenContainer extends LightningElement {
    /* --------------------------------------------------------------------------------------------------------
    * Private Property
    -------------------------------------------------------------------------------------------------------- */
    sido = "---";
    sgg = "";

    infoData;
    selectedSchool;
    naverMapAuth;
    addressCoordinate = "";

    /* --------------------------------------------------------------------------------------------------------
    * Flag
    -------------------------------------------------------------------------------------------------------- */
    isLoading = false;

    /* --------------------------------------------------------------------------------------------------------
    * Getter / Setter
    -------------------------------------------------------------------------------------------------------- */
    get sidoOptions() {
        return this.addListCss(SIDO_CODE_LIST);
    }

    get sggOptions() {
        return this.addListCss(SGG_CODE_LIST.filter(sgg => sgg.value.startsWith(this.sido)));
    }

    get kinderInfoList() {
        return this.addListCss(this.infoData);
    }

    get selectedSchool() {
        return this._selectedSchool.key ? this.selectedSchool : {}
    }

    get naverMapImgSrc() {
        if (!this.naverMapAuth || this.addressCoordinate == "") {
            return "";
        }

        return `${naverMapRequestUrl}?w=300&h=300&center=${this.addressCoordinate}&level=15&X-NCP-APIGW-API-KEY-ID=${this.naverMapAuth.clientId}&X-NCP-APIGW-API-KEY=${this.naverMapAuth.key}`
        // return `${naverMapRequestUrl}?w=300&h=300&markers=type:d|size=tiny|pos:${this.addressCoordinate}&X-NCP-APIGW-API-KEY-ID=${this.naverMapAuth.clientId}&X-NCP-APIGW-API-KEY=${this.naverMapAuth.key}`;
    }

    /* --------------------------------------------------------------------------------------------------------
    * Lifecycle Hook
    -------------------------------------------------------------------------------------------------------- */
    renderedCallback() {
        this.getNaverAuthentication();
    }

    /* --------------------------------------------------------------------------------------------------------
    * Event Handler
    -------------------------------------------------------------------------------------------------------- */
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

            await this.fetchKinderInfo();

            this.selectedSchool = null;

            this.isLoading = false;
        } catch (e) {
            console.log(JSON.stringify(e, 0, 2));
            this.isLoading = false;
        }
    }

    handleSchoolSelect(event) {
        this.selectedSchool = this.infoData[parseInt(event.detail.name) - 1];

        this.convertAddressToCoordinate();

        console.log('selected School: ' + JSON.stringify(this.selectedSchool, 0, 2));
    }

    /* --------------------------------------------------------------------------------------------------------
    * Logic Method
    -------------------------------------------------------------------------------------------------------- */
    async getNaverAuthentication() {
        this.naverMapAuth = await getNaverMapAuthentication();
        return result;
    }

    async fetchKinderInfo() {
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
    }
    async convertAddressToCoordinate() {
        try {
            this.isLoading = true;
            console.log('this.selectedSchool.addr: ' + this.selectedSchool.addr);
            let dataString = await addressToCoordinate({ address: this.selectedSchool.addr });
            console.log('dataString: ' + dataString);
            let coorData = JSON.parse(dataString).addresses[0];
            this.addressCoordinate = coorData.x + "," + coorData.y;
            this.isLoading = false;

        } catch (e) {
            this.isLoading = false;

            console.log(e);
            throw e;
        }
    }

    /* --------------------------------------------------------------------------------------------------------
    * Utility
    -------------------------------------------------------------------------------------------------------- */
    addListCss(objectList) {
        if (!objectList) return;

        let index = 0;

        objectList.forEach(obj => {
            if (++index % 2 == 0) {
                obj.class = 'kg-nav-item even-listitem';
            } else {
                obj.class = 'kg-nav-item odd-listitem';
            }

        });
        return objectList;
    }
}