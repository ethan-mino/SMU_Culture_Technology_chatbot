const express = require("express");
const course = express.Router();
let mysql = require("mysql");

let connection = mysql.createConnection({       // mysql 연결.
    host : "13.125.114.52",
    user : "root",
    password : "!d8h6ukja123",
    port : 3306,
    database : "kakao"
    })


    
function queryExec (sql, ...value)      // async, await을 사용하기 위해 프로미스를 반환한다.
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

course.posr("/course_inform", function(){
    // CourseName, AcademicNumber, credit, professorName, period, location
    const params = req.body.action.detailParams;    
    const sqlCourseName = "Select * from course where CourseName = ?";
    const sqlAcademicNumber = "Select * from course where CourseName = ?";
    const sqlCredit = "Select * from course where CourseName = ?";
    const sqlProfessorName = "Select * from course where CourseName = ?";
    const sqlLocation = "Select * from course where CourseName = ?";

})

module.exports = course;
