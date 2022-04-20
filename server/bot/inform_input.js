const express = require("express");
const inform_input = express.Router();
const defalutObj = require("./default_value.js");
const enrollSuccessMessage = defalutObj.enrollSuccessMessage;
const enrollFailureMessage = defalutObj.enrollFailureMessage;
const enrollBody = defalutObj.enrollBody;
const simpleBody = defalutObj.simpleBody;

let mysql = require("mysql");

let connection = mysql.createConnection({       // mysql 연결.
    host : "13.125.114.52",
    user : "root",
    password : "!d8h6ukja123",
    port : 3306,
    database : "kakao"
})

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


inform_input.post("/check", function(req, res){
   
    (async function(){
    let simpleText = simpleBody.template.outputs[0].simpleText;  
    let id = req.body.userRequest.user.id; 

    let sql = "SELECT * FROM user_inform WHERE id = ?"; // 사용자가 등록되어 있는지 확인하기 위한 sql문.
    let rows = await queryExec(sql, id);    // select문으로 user_inform 테이블을 검색한 후 결과 반환.

    if(rows.length !== 0){   // 이미 등록되어 있는 경우
        let graduateSchool = rows[0].graduateSchool;    // 테이블에 저장되어 있는 대학원명을 graduateSchool에 저장.
        let major = rows[0].affiliation;    // 테이블에 저장되어 있는 학과전공을 major에 저장.

        simpleText.text = `등록된 정보입니다! \n` +
                          `🎓 대학원 : ${graduateSchool}\n` +
                          `🎒 전공/학과 : ${major}`;
    }    
    else{   // 아직 등록 되지 않은 경우
        
        simpleText.text = `❌등록된 정보가 없습니다! \n` +
                          ` 정보를 등록하려면 \n`+ 
                          ` 등록 또는 수정이라고 말해주세요😄!`;
    }

    res.status(200).send(simpleBody);               
    })();
});

function replaceText(message, graduateSchool, major){   // 메시지의 "graduateSchool", "major"을 사용자가 입력한 graduateSchool, major변수의 문자열로 교체하고 그 문자열을 반환하는 함수.
    message = message.replace("graduateSchool", graduateSchool);
    message = message.replace("major", major);

    return message;
}

inform_input.post("/enroll", function(req, res){
    (async function(){
    let params = req.body.action.detailParams;  
    let simpleText = enrollBody.template.outputs[0].simpleText;    // default_value파일의 enrollBody
    let id = req.body.userRequest.user.id;  // 사용자의 id
    let graduateSchool = params.graduate_school.value;  // 사용자가 입력한 대학원명
    let major = params.major.value; // 사용자가 입력한 학과/전공명
   
    let enrollSql = "SELECT * FROM user_inform WHERE id = ?"; // 사용자가 등록되어 있는지 확인하기 위해 id로 테이블 검색.
    let validsql = "select * from valid_affiliation where graduateSchool = ? AND affiliation = ?";  // 사용자가 입력한 대학원에 해당 학과/전공이 실제 존재하는지 확인하기 위한 sql문.
                                                                                                    // valid_affiliation에는 유효한 대학원-학과/전공이 저장되어 있음.
    let rows = await queryExec(enrollSql, id);  // rows의 length가 0이면 사용자가 등록되지 않은 것.
    let len = await queryExec(validsql, graduateSchool, major); // len의 length가 0이면 입력한 대학원에 해당 학과/전공이 존재하지 않는 것.
    simpleText.text = replaceText(enrollFailureMessage, graduateSchool, major); // simpleText.text에는 default_vaule의 실패 메시지를 저장.

    if(rows.length === 0){    // 사용자 정보가 아직 등록되지 않은 경우
        if(len.length !== 0){    // 만약 사용자가 입력한 대학원-학과/전공이 유효하다면.
            let simpleText = simpleBody.template.outputs[0].simpleText; // default_vaule의 enrollBody 객체 불러옴.
            let insertSql = "INSERT INTO user_inform(id, graduateSchool, affiliation) VALUES (? , ? , ?)";  // user_inform 테이블의 사용자의 대학원과 학과/전공 정보를 삽입하는 sql문.
        
            await queryExec(insertSql, id, graduateSchool, major);  // id를 primary key로 user_infom 테이블에 정보 삽입.
            simpleText.text = replaceText(enrollSuccessMessage, graduateSchool, major); // default_vaule의 성공 메세지를 가져와서 "graduateSchool", "major"를 사용자가 입력한 대학원명, 학과/전공으로 대체
            res.status(200).send(simpleBody);
        }    
        else{
            res.status(200).send(enrollBody);
        }   
    }
    else{    // 이미 등록되어 있는 경우
        if(len.length !== 0){    // 만약 사용자가 입력한 대학원-학과/전공이 유효하다면.
            let simpleText = simpleBody.template.outputs[0].simpleText; // default_vaule의 enrollBody 객체 불러옴.
            let updateSql = "UPDATE user_inform SET graduateSchool = ?, affiliation = ? WHERE id = ? "; // 이미 등록되어 있는 경우 update문을 사용해서 사용자의 정보를 수정하는 sql문.

            await queryExec(updateSql, graduateSchool, major, id);  // 사용자가 입력한 대학원명, 학과/전공으로 정보 수정.
            
            simpleText.text = replaceText(enrollSuccessMessage, graduateSchool, major); // default_vaule의 성공 메세지를 가져와서 "graduateSchool", "major"를 사용자가 입력한 대학원명, 학과/전공으로 대체
            res.status(200).send(simpleBody);
        }
        else{
            res.status(200).send(enrollBody);
        }
    }
        
    })();
}); 

module.exports = inform_input;