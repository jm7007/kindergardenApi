/**
 * @description       : 
 * @author            : Lee Jongmin
 * @group             : i2max
 * @last modified on  : 15-04-2024
 * @last modified by  : Lee Jongmin
 * Modifications Log
 * Ver   Date         Author        Modification
 * 1.0   11-04-2024   Lee Jongmin   Initial Version
**/
public with sharing class KindergardenController {
    private static final String DOMAIN = 'http://e-childschoolinfo.moe.go.kr';

    private static final Map<String, String> ACTION_MAP = new Map<String, String>{
        'basicInfo' => '/api/notice/basicInfo2.do'
    };

    protected Api__mdt kinderApi;

    public class KindergartenParams{
        @AuraEnabled
        public String key{get;set;} // Api 인증키 *Required
        @AuraEnabled
        public Integer pageCnt{get;set;} // 페이지당 목록 수
        @AuraEnabled
        public Integer currentPage{get;set;} // 페이지 번호
        @AuraEnabled
        public String sidoCode{get;set;} // 시도코드 *Required
        @AuraEnabled
        public String sggCode{get;set;} // 시군구코드 *Required
        @AuraEnabled
        public Integer timing{get;set;} // 공시차수 YYYYT(20201) (해당년도 + 차수) *최근 3년간의 정보만 제공됩니다.

        public String getParamsAsUrl() {
            // 필수 필드 추가
            String queryString = 'key={0}&sidoCode={1}&sggCode={2}';
            queryString = String.format(queryString, new String[]{key, sidoCode, sggCode});
            
            // 선택 필드 추가
            queryString += (pageCnt != null) ? '&pageCnt=' + pageCnt : '';
            queryString += (currentPage != null) ? '&currentPage=' + currentPage : '';
            queryString += (timing != null) ? '&timing=' + timing : '';
            
            return '?' + queryString;
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getKindergartenInfo(KindergartenParams params, String actionName){
        try{
            System.debug('params: ' + params);
            System.debug('actionName: ' + actionName);
            //필수 필드 검증
            if(params.sidoCode == null || params.sggCode == null){
                throw new AuraHandledException('required params are missing.');
            }
            // actionName 검증
            if(!ACTION_MAP.containsKey(actionName)){
                throw new AuraHandledException('invalid action name.');
            }
            //Api Key 가져오기
            params.key = [
                SELECT Id, Key__c
                FROM Api__mdt
                WHERE DeveloperName = 'kindergardeninfo'
                LIMIT 1
            ].Key__c;

            System.debug('key: ' + params.key);

            //Request 생성
            Http h = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint(DOMAIN + ACTION_MAP.get(actionName) + params.getParamsAsUrl());
            req.setMethod('GET');

            String resBody = h.send(req).getBody();
            System.debug('resBody: ' + resBody);

            return resBody;

        }catch(Exception e){
            System.Debug('error occur: KindergardenController.getKindergardenInfo');
            System.Debug(LoggingLevel.ERROR, e);
            throw e;
        }
    }
    @AuraEnabled(cacheable=true)
    public static String addressToCoordinate(String address){
        // String apiKey = '28FE5684-1D6B-3E6D-9B57-FD0F82B3D46B';
        // String requestURL =
        // 'https://api.vworld.kr/req/address?'
        // + 'service=address&request=getcoord&version=2.0&crs=epsg:4326&'
        // + 'address=' + address.replace(' ', '%20')
        // + '&refine=true&simple=true&format=json&type=road&key='
        // + apiKey;

        // String requestURL = 'https://apis.vworld.kr/new2coord.do?q=대전광역시%20중구%20계백로1615번길%2034&output=xml&epsg=epsg:4326&apiKey=28FE5684-1D6B-3E6D-9B57-FD0F82B3D46B';

        // System.debug('url: ' + requestURL);

        // try {
        //     Http h = new Http();
        //     HttpRequest req = new HttpRequest();
        //     req.setTimeout(20000);
        //     req.setEndpoint(requestURL);
        //     req.setHeader('Accept', 'application/json');
        //     req.setMethod('GET');

        //     String resBody = h.send(req).getBody();
        //     System.debug('resBody: ' + resBody);

        //     return resBody;
        // } catch (Exception e) {
        //     throw new AuraHandledException(e.getMessage());
        // }

        try {
            Map<String, String> keyInfo = getNaverMapAuthentication();

            String requestURL =
                'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?'
                + 'query=' + EncodingUtil.urlEncode(address,'UTF-8');

            System.debug(requestURL);

            Http h = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint(requestURL);
            req.setHeader('X-NCP-APIGW-API-KEY-ID',keyInfo.get('clientId'));
            req.setHeader('X-NCP-APIGW-API-KEY',keyInfo.get('key'));
            req.setHeader('Content-Type', 'application/json');
            req.setMethod('GET');

            String resBody = h.send(req).getBody();
            System.debug('resBody: ' + resBody);

            return resBody;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getNaverMapAuthentication(){
        try{
            Api__mdt authentication = [
                SELECT Id, Key__c, Client_ID__c
                FROM Api__mdt
                WHERE DeveloperName = 'naverMap'
                LIMIT 1
            ];

            return new Map<String, String>{
                'clientId' => authentication.Client_ID__c,
                'key' => authentication.Key__c
            };
        }catch(Exception e){
            System.Debug('error occur: KindergardenController.getNaverMapInfo');
            System.Debug(LoggingLevel.ERROR, e);
            throw e;
        }
    }
}