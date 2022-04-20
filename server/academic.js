const express = require("express");
const academic = express.Router();
const defalutObj = require("./default_value.js");
const searchFaultMessage = defalutObj.searchFaultMessage;
let mysql = require("mysql");

let connection = mysql.createConnection({       // mysql 연결.
    host : "13.125.114.52",
    user : "root",
    password : "!d8h6ukja123",
    port : 3306,
    database : "kakao"
    })


const startYear = "2019", endYear = "2020"; // 하드코딩하지 않기 위해 변수로 잡아놓고 replace의 정규식에 사용하려고 햇지만 아직 수정하지 못함.

function selectCalendar(start, end, sql, ...params) // academic_calendar 테이블에서 start부터 end에 해당하는 달의 content들을 연결하여 반환한다. (sql문과 params에 따라 다르게 동작할 수 있다.)
{
    return new Promise(async function(resolve, reject){ // async, await을 사용하기 위해 프로미스를 반환한다.
        const rows = [];   // row가 여러개 select되는 경우 결과를 담는 배열
        let returnValue = null; // 각 row의 content를 개행으로 구분해서 붙인 전체 결과로, 최종적으로 resolve할 데이터이다.
    
        for(let i = start; i <= end; i++)   // start부터 end에 해당하는 month의 row를 select
            rows.push(await queryExec(sql, "month", i, ...params));   // row들을 배열에 push
    
        returnValue = rows.reduce((a, x, i) => {   // 첫번째 row를 제외한 각 row의 content에 개행을 붙이고, content들을 연결한 결과를 최종적으로 resolve할 returnValue 변수에 저장.
            if(i !== 0)
                a += "\n\n\n";
            return a += x[0].content}, ""); 
        resolve(returnValue);
    })
}

function queryExec(sql, ...value)      // async, await을 사용하기 위해 프로미스를 반환한다.
{
    return new Promise(function(resolve, reject){
        connection.query(sql, value, function(err, rows){   // sql과 sql문에 사용될 속성과 값을 입력으로 받음.
            if(!err)    // 에러가 발생하지 않으면 select한 rows를 resolve
                resolve(rows);
            else        // 에러가 발생하면 err를 reject
                reject(err);
        })
    });
}

academic.post("/calendar", function(req, res){
    
    const responseBody = defalutObj.searchBody;
    const params = req.body.action.detailParams;    
    const sql = `SELECT content FROM academic_calendar WHERE ?? = ?`;  
    const elseSql = `SELECT content FROM academic_calendar WHERE ?? = ? AND ??= ?`;   
    let simpleText = responseBody.template.outputs[0].simpleText;

    (async function(){  // 동기적 실행
    //connection.connect(); //주석 처리하지 않으면 Cannot enqueue Handshake after invoking quit.가 발생한다. 

  if(params["month"] !== undefined    // 월만 입력받은 경우.(그룹 파라미터이기 때문에 하나만 오지만 혹시 모를 상황에 대비하여 나머지 경우도 undefinded인지 체크)
    &&(params["month_period"] === undefined 
    && params["year_period"] === undefined))
    {
        try{
            let result = await queryExec(sql, "month", params["month"].value.replace("월", ""));    // 사용자가 입력한 달에 해당하는 row를 select하고, result에 resolve한 값이 저장된다.
            
            if(result.length > 1)   // 사용자가 2월을 입력한 경우 2019년과 2020년 둘다 보여주기 위해 쿼리문의 결과를 연결한다.
                simpleText.text = result.reduce((a, x, i) => {
                    if(i !== 0)
                        a += "\n\n\n";  // 첫번째 row를 제외하고 개행을 붙여서 구분되게 한다.
                    return a += x.content}, "");
            else
                simpleText.text = result[0].content; // 2월이 아닌 경우는 row가 하나 이므로 inform에 result[0].content를 저장.
        }catch(err){
            console.log(err);
        }
    }
    else if(params["month_period"] !== undefined    // 월, 기간을 입력받은 경우
    &&(params["month"] === undefined 
    && params["year_period"]=== undefined))
    {
        
        try{
            const remove = params["month_period"].value.replace(/월/gi, "").split("~"); // 5월 ~ 6월로 입력이 들어온 경우 remove에 ['5 ', ' 6']이 들어가게 끔 정리(공백은 아직 처리하지 않은 상태)

            for(let i = 0; i < remove.length; i++)
                remove[i] = remove[i].trim();   // 각 달의 양 끝부분의 공백을 제거한다.
            
            if(remove[0] === "1" && remove[1]==="2")
                simpleText.text = await selectCalendar(1, 2, elseSql, "year", endYear);   // ex. 5월 ~ 7월을 발화로 입력받은 경우 5는 remove[0], 7은 remove[1], 따라서 5는 start, 7은 end로 selectCalendar의 매개변수에 전달해서 각 content를 연결한 결과를 반환받는다. 
            else                
                simpleText.text = await selectCalendar(remove[0], remove[1], sql);   // ex. 5월 ~ 7월을 발화로 입력받은 경우 5는 remove[0], 7은 remove[1], 따라서 5는 start, 7은 end로 selectCalendar의 매개변수에 전달해서 각 content를 연결한 결과를 반환받는다. 
        }catch(err){
            console.log(err);
        }
    }
    else{   // 년도와 월을 입력 받은 경우.
        try{
            const removeMonth = params["year_period"].value.replace(/월/gi, "").replace(/2019년/gi, "").replace(/2020년/gi, "").split("~"); // 2019년 3월 ~ 2020년 1월을 받은 경우, 월만 남도록 처리
            //const removeYear = params["year_period"].value.replace(/.월/gi, "").replace(/년/gi, "").split("~");
            
            for(let i = 0; i < removeMonth.length; i++)
                removeMonth[i] = removeMonth[i].trim();   // 각 달의 양 끝부분의 공백을 제거한다.

            //for(let i = 0; i < removeYear.length; i++)
              //  removeYear[i] = removeYear[i].trim();   // 각 년도의 양 끝부분의 공백을 제거한다.    
            
            if(Number(removeMonth[0]) < Number(removeMonth[1])){ // 같은 년도인 경우(같은 년도의 경우 removeMonth[0]이 removeMonth[1] 보다 클 수 없도록 엔티티가 등록되어 있음.)
                simpleText.text = await selectCalendar(removeMonth[0], removeMonth[1], sql);
            }
            else        // 사용자가 입력한 발화가 두 해에 걸치는 경우
            {

                simpleText.text = await selectCalendar(removeMonth[0], 12, sql); // ex. 2019년 10월 ~ 2020년 2월의 경우, 2019년 10월 ~ 2019년 12월의 content를 반환.
                simpleText.text += "\n\n\n" + await selectCalendar(1, removeMonth[1], elseSql, "year", endYear); // ex. 2019년 10월 ~ 2020년 2월의 경우, 2020년 1월 ~ 2020년 2월을 반환. 
            }
            
        }catch(err){
            console.log(err);
        }
    }

  
  //connection.end();   //주석 처리하지 않으면 Cannot enqueue Handshake after invoking quit.가 발생한다. 
  res.status(200).send(responseBody);
    })();
})

function selectCourseInform(sql, ...value){
    return new Promise(async function(resolve, reject){

        const standard = ["과목명 : ", "강의 시간 : ", "강의 장소 : ", "교수명 : ", "학점 : ", "학수번호 : "];  // select한 수업정보를 화면에 출력할 때의 규격으로, "과목명 : 월드뮤직"과 같이 출력하기 위함. 
        const columnName= ["courseName", "period", "classroom", "professorName", "credit", "academicNumber"];   // 컬럼명

        let result = "";   // 최종적으로 resolve할 데이터.
        
        const rows = await queryExec(sql, ...value);  

            for(let i = 0;  i < rows.length; i++) // select한 row의 개수만큼 실행
            {
                for(let j = 0; j < columnName.length; j++)    // 컬럼의 개수 만큼 실행 
                {
                    let data = rows[i][columnName[j]];
                        
                    if(standard[j] === "강의 시간 : ")
                        data = data.replace("\n", "\n                 ");

                    result += standard[j] + data;  // 규격과 컬럼의 데이터를 붙어서 returnValue에 붙인다.
                    
                        
                    if(!(i === rows.length - 1 && j === columnName.length - 1))   // 마지막 row의 마지막 컬럼이 아니라면 if문 실행(마지막row의 마지막 컬럼의 경우 개행을 붙여주지 않음.)
                    {
                        if(j === columnName.length -1)    // 마지막 컬럼의 경우 \n\n을 붙여줘서 각 row를 구분한다.
                            result += "\n\n";
                        else
                            result += "\n";          // 마지막 컬럼이 아니라면 \n로 컬럼을 구분한다.
                    }
                }
            }
        resolve(result);
    })
}

academic.post("/course_inform", function(req, res){     // 수업 정보
    const responseBody = defalutObj.searchBody;
    const params = req.body.action.detailParams;    
    const parameterName= ["course_name", "professor_name", "classroom", "credit", "academic_number"];   // 요청으로부터 전달받는 파라미터명
    const columnName= ["courseName", "professorName", "classroom", "credit", "academicNumber"];         // DB의 컬럼명
    let simpleText = responseBody.template.outputs[0].simpleText;
    
    const major = {
        "뮤직테크놀로지학과" : "music_technology_course",
        "공연예술경영학과" : "performing_arts_course",
        "글로벌콘텐츠학과" : "glober_contents_course",
        "소설창작학과" : "novel_creation_course"
    }

    const tableName = major[params.major.value];
    let result = "";

    (async function(){  
        
        if(params.major.value === "글로벌콘텐츠학과" || params.major.value === "소설창작학과"){
            simpleText.text = defalutObj.NoStudentMessage;
        }
        else{

            if(params["sys_text"] === undefined){   // 사용자가 sys_text 아닌 필수 파라미터를 입력한 경우 
                let i = 0;  // break 됐을 때 i의 값을 통해 sql문을 완성하기 위해 for문 밖에서 정의.

                for(; i < parameterName.length; i++)    // sys_text를 제외한 파라미터의 개수 만큼 실행
                {
                    if(params[parameterName[i]] !== undefined)  // 입력받은 파라미터를 발견하면 break
                        break;
                }
        
                try{
                    const informSql = `SELECT * FROM ?? WHERE ?? = ?`;    // 입력받은 파라미터에 따라 SQL문을 다르게 할 수 있음.
                    result = await selectCourseInform(informSql, tableName, columnName[i], params[parameterName[i]].value);   // ??에는 입력 받은 파라미터에 대응하는 파라미터명이 대응됨.
                }catch(err)                                                                                                   // ?에는 입력받은 파라미터의 value가 대응됨.
                {
                    console.log(err);
                }
            }
            else{   // 사용자가 "수업 정보"를 입력하고 필수 파라미터에 해당하는 정보를 입력하지 않은 경우 
                try{
                    let likeSql = `SELECT * FROM ${tableName} WHERE courseName LIKE ${connection.escape('%' + `${params["sys_text"].value}` +'%')}`;  
                    // 다른 필수 파라미터에 대응되지 않아 sys_text가 입려되면 like 연산자를 사용해서 사용자가 입력한 발화가 포함된 과목명을 select.
                    // (학점, 교수명, 강의실, 학수번호의 경우 like 연산자가 사용될 필요가 없다고 판단함.)

                    if(params["sys_text"].value === "전체") // 전체를 입력할 경우 모든 수업 정보가 출력.
                        likeSql = "SELECT * FROM course";  

                        result = await selectCourseInform(likeSql);    // 정보를 찾지 못하는 경우에는 반환된 검색 결과를 사용자에게 전달하지 않고 기본 메시지를 전달.   
                        
                }catch(err){
                    console.log(err);
                }
            }
            if(result !== "")
                simpleText.text = result;
            else
                simpleText.text = searchFaultMessage;
        }
        res.status(200).send(responseBody);
    })();
})

function selectNotice(sql)
{
    return new Promise(async function(resolve, reject){
        
        let rows = await queryExec(sql);    // 공지사항 select
        let returnValue = [];   

        if(rows.length === 0)
            resolve(null);

        for(let i = 0; i < rows.length; i++)    // select한 row 개수만큼 실행
        {
            const obj = {   
                "title" : rows[i].title,
                "description" : rows[i].writeDate,
                "link" : {
                    "web" : rows[i].url
                }
            }
            returnValue.push(obj);  // 배열에 push해서 listCard의 items 형식에 맞춤.
        }
        resolve(returnValue);    
    })
}

academic.post("/notice", function(req, res){     // 수업 정보

    let outputs = defalutObj.simpleBody.template.outputs;   // default_value.js에 저장해놓은 json 형식 객체를 불러옴.

    (async function(){
        const noticeSql = "SELECT * FROM cultural_notice WHERE id < 6 "   
        let noticeArr = await selectNotice(noticeSql);  

        let noticeObj = null;
        if(noticeArr === null)
        {
            noticeObj = {
                "basicCard" : {
                    "title" : defalutObj.NoNewNotice,
                    
                    "buttons" :[
                        {
                            "label" : "공지사항 홈페이지 이동",
                            "action" : "webLink",
                            "webLinkUrl" : "https://www.smu.ac.kr/gsct/community/notice.do"
                        }
                    ]
                }
                
            }
        }
        else{
                noticeObj = {"listCard" : {   // listCard의 응답 형식
                    "header" : {
                        "title" : "📢 공지사항 📢",
                        "imageUrl" : "http://blogfiles.naver.net/20130416_169/spriner_13660765805086SE0y_JPEG/130416_%BB%F3%B8%ED%B4%EB_%BB%E7%BD%BF%C4%B6%B8%AE_%C7%A5%C1%F62.jpg"
                    },

                    "items" : noticeArr,  
                    "buttons" :[
                        {
                            "label" : "공지사항 홈페이지 이동",
                            "action" : "webLink",
                            "webLinkUrl" : "https://www.smu.ac.kr/gsct/community/notice.do"
                        }
                    ]
                }
            };
        }
           

        outputs[0] = noticeObj;
        
       res.status(200).send(defalutObj.simpleBody);
    })();
});


module.exports = academic;



