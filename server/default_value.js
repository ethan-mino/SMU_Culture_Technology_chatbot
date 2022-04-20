const defaultValues = {
    "searchFaultMessage" : `요청하신 정보를 찾을 수 없습니다 😭\n\n`+
                           `🚑 사용법을 보고싶다면 "도움말" 또는\n` +
                           `     "도와주세요!"를 입력해주세요!🚑`,
    "noStudentMessage" : `현재 소설창작학과와 글로벌콘텐츠학과는\n` +
                         `재학생이 없어 수업 정보가 없습니다 😭ㅠㅠ`,
    "NoNewNotice" : "❌ 새로운 공지사항이 없습니다!\n\n" +
                    "🔽 홈페이지에서 확인해주세요 😁!",

    "quickReplies" : [
        {
            "label" : "🏠 홈",
            "action" : "message",
            "messageText" : "홈",
        },
        {
            "label" : "🚨 도움말",
            "action" : "message",
            "messageText" : "도움말",
        },
        {
            "label" : "📆 학사 일정",
            "action" : "message",
            "messageText" : "학사 일정",
        },
        {
            "label" : "📚 수업 정보",
            "action" : "message",
            "messageText" : "수업 정보",
        },
        {
            "label" : "🏢 학과 사무실 정보",
            "action" : "message",
            "messageText" : "학과 사무실 정보",
        },
        {
            "label" : "📢 공지사항",
            "action" : "message",
            "messageText" : "공지사항",
        },
        ,
        {
            "label" : "👴 교수님 정보",
            "action" : "message",
            "messageText" : "교수님 정보",
        },
        {
            "label" : "☕ 주변 가게",
            "action" : "message",
            "messageText" : "주변 가게",
        }
    ]
}
const standard = 
{
    "NoNewNotice" : defaultValues.NoNewNotice,

    "NoStudentMessage" : defaultValues.noStudentMessage,

    "searchFaultMessage" : defaultValues.searchFaultMessage,

    "simpleBody" : {
        "version": "2.0",
        "template": {
            "outputs" : [
            ],
            "quickReplies" : defaultValues.quickReplies
        }
    },

    "searchBody" : {
        "version": "2.0",
        "template": {
            "outputs" : [
                {
                    "simpleText" : {
                        "text" : defaultValues.searchFaultMessage
                    }
                }
            ],
            "quickReplies" : defaultValues.quickReplies
        }
    }
}

   




module.exports = standard;