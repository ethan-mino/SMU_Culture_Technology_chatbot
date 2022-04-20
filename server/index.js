
// //morgan은 로깅을 담당하고 body-parser는 http 요청의 body를 추출합니다.

// const express = require('express'); // express를 사용하여, app을 생성
// const app = express();  // app은 스킬 응답을 받을 api 서버 인스턴스
// const logger = require('morgan');
// const bodyParser = require('body-parser');  

// const apiRouter = express.Router();


// // app의 use 메소드를 이용하여 morgan과 body-parser를 등록
// app.use(logger('dev', {}));
// app.use(bodyParser.json());
// app.use('/api', apiRouter); // api를 담당하는 apiRouter를 생성하고, 
//                             // 이를 app의 ‘/api’ 경로에 붙입니다. 이 코드의 결과로, 
//                             // ‘/api/**’로 시작하는 모든 요청은 apiRouter에게 전달


// apiRouter.post('/sayHello', function(req, res) {    //apiRouter는 이미 ‘api’ 라는 경로를 가지고 있기 때문에, 추가적으로 api 경로를 붙이지 않음.
//                                                     // POST 응답을 처리해야 하기 때문에, apiRouter의 POST 메소드를 이용
// const responseBody = {
//     version: "2.0",
//     template: {
//     outputs: [
//         {
//         simpleText: {
//             text: "hello I'm Ryan"
//         }
//         }
//     ]
//     }
// };

// res.status(200).send(responseBody);
// });

// apiRouter.get('/user', function(req, res){
//     res.send("GET");
// });
// apiRouter.post('/showHello', function(req, res) {   // post 요청이 오면 콜벡함수 실행
//                                                     // req는 request, res는 response
//                                                     // app.METHOD(PATH, HANDLER)    METHOD: HTTP 요청 메소드 - GET, POST, DELETE, PUT...
//                                                     //                              PATH : 라우트 경로
//                                                     //                              HANDLER : 실행될 콜백함수
                                                    
                                                    
// /* main.js  // 모듈화 하여 한 파일이 너무 커지는것을 방지하고, 코드를 나누어 간결하게하고, 유지보수를 쉽게 함.
// let user = require("./routes/user");


// app.use("/user, user");     // /user로 요청이 들어오면 user 라우터로 연결
// app.listen(3000, function() {       // 설정한 express app을 특정 포트로 실행하는 부분
//     console.log('Example skill server listening on port 3000!');
// }); 
// */


// /* routes/user.js
// let express = require("express");
// let router = express.Router();

// router.get('/:id', function(req, res) // :id는 파라미터 설정하는 것, 특정 값을 받으면 콜백함수 실행됨.
// {
//     res.send("Received a GET request, param : " + req.param.id);
// });

// router.post('/', function(req, res)   //  
// {
//     res.json({success : true})  // json 형태의 응답을 할 수 있음.
// });
// router.put('/', function(req, res)
// {
//     res.status(400).json({message : "Hey, you. Bad Request!"});
// })
// router.delete('/', function(req, res)
// {
//     res.send("Received a DELETE request");
// })

// module.exports = router;
// */
// console.log(req.body);      // 봇 시스템의 요청 body 출력

// const responseBody = {
//     version: "2.0",         
//     template: {
//     outputs: [
//         {
//         simpleImage: {
//             imageUrl: "https://t1.daumcdn.net/friends/prod/category/M001_friends_ryan2.jpg",
//             altText: "hello I'm Ryan"
//         }
//         }
//     ]
//     }
// };

// res.status(200).send(responseBody);
// });

// app.listen(80, function() {       // 설정한 express app을 특정 포트로 실행하는 부분
// console.log('Example skill server listening on port 80!');
// });        

// /*
// 80번 포트 사용하려면 sudo node index.js으로 실행.(자바/코틀린/js 알고리즘)
// 1. putty에 cd / 명령어 실행해서 root로 이동
// 2. find -name node 명령어 실행 (permission denied를 보지 않으려면 sudo find -name node로 명령어 실행)
// 3. sudo su로 root 계정으로 이동 
// 4. ln -s find로 찾은 node경로 /usr/bin/node (ex.  ln -s /home/ubuntu/.nvm/versions/node/v10.16.3/bin/node /usr/bin/node)
// 5. cd /usr/bin 명령어 실행
// 6. chmod 755 node 명령어 실행
// 7. ubuntu 계정으로 변환해서 sudo node index.js하면 실행됨.
// 8. 또 안될 때는 netstat -tnlp | grep 80 명령어로 80번 포트 사용중인 프로세스 pid 확인.
// 9. kill -9 pid 또는 sudo kill -9 pid
// well-known 포트를 사용하기 위해선 관리자 권한이 필요하다.
// 아무데서나 실행을 하게 하려면 그 파일이 설치된 경로가 PATH에 잡혀있어야 한다.
// nodemon도 sudo nodemon index.js로 실행
// */


const express = require('express');
const app = express();
const academic = require("./academic");
const logger = require('morgan');
const bodyParser = require('body-parser');

const apiRouter = express.Router();

app.use(logger('dev', {}));
app.use(bodyParser.json());
app.use("/academic", academic);



app.use(express.static("public"));

app.get('/:name', function(req, res) {
    res.send(`<img src = '/` +`${req.params.name}.jpg'>`);
});

app.listen(80, function() {       // 설정한 express app을 특정 포트로 실행하는 부분
console.log('Example skill server listening on port 80!');
}); 

