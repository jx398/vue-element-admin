// ==UserScript==
// @name xxpt
// @namespace xxcripts
// @version 0.3.2
// @author freeman99sd
// require https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @match https://*.xuexi.cn/
// @match https://xuexi.cn
// @match https://xuexi.cn/index.html
// @match https://www.xuexi.cn/index.html
// @match https://pc.xuexi.cn/points/my-points.html
// @match https://pc.xuexi.cn/points/exam-practice.html
// @match https://pc.xuexi.cn/points/exam-weekly-detail.html?id=*
// @match https://pc.xuexi.cn/points/exam-weekly-list.html
// @match https://pc.xuexi.cn/points/exam-paper-detail.html?id=*
// @match https://pc.xuexi.cn/points/exam-paper-list.html
// @require https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js
// @require https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js
// @require https://cdn.jsdelivr.net/npm/@supabase/supabase-js@1.0.3/dist/umd/supabase.min.js
// @grant GM_download
// @grant GM_openInTab
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_xmlhttpRequest
// @grant GM_addStyle
// @grant unsafeWindow
// @grant GM_setClipboard
// @grant GM_getResourceURL
// @grant GM_getResourceText
// @grant GM_info
// @grant GM_registerMenuCommand
// @run-at document-idle

// ==/UserScript==
var $jq = $.noConflict();

window.onload = function () {
    var nextDay = '';
    var mytimer;
    localStorage['2021/11/18'] = 'ok';
    if (mytimer && typeof mytimer == "function") clearInterval(mytimer);
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            S: this.getMilliseconds(), //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                (this.getFullYear() + "").substr(4 - RegExp.$1.length)
            );
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length == 1
                        ? o[k]
                        : ("00" + o[k]).substr(("" + o[k]).length)
                );
            }
        }
        return fmt;
    };

    function test() {
        return new Promise(resolve => {
            setTimeout(() => resolve(console.log("2s之后执行签到主程序：")), 2000);
        });
    }
    test().then(FindNextDay);

    function checkStatus() {
        var nowDate = new Date().format('yyyy/MM/dd');
        if (localStorage[nowDate] != null && localStorage[nowDate] != undefined && localStorage[nowDate] == 'ok') {
            return true;
        }
        else {
            return false;

        }
    }
    function daojiashi() {
        mytimer = setInterval(function () {
            var nnerHTML = showtime();
            $jq('p.tips.text-ellipsis').html("" + nnerHTML + "");
            var nowDate = new Date().format('hhmmss')
            if (nowDate == '040000' || nowDate == '060000' || nowDate == '080000') {
                window.location.reload(true);
            }
        }, 1000); //反复执行函数本身
    }
    function FindNextDay() {
        var nextDate;
        var num = true;
        var tempDate = new Date();
        var hh = new Date().getHours();
        if (!checkStatus()) {
            nextDate = addDayTime(tempDate, 0);
            nextDate.setHours(hh + 1);
        }
        else {
            nextDate = addDayTime(tempDate, 1);
            var hhh = Math.round(Math.random() * 8 + 10);
            nextDate.setHours(hhh);
        }
        nextDate.setMinutes(ranDom);
        nextDate.setSeconds(20);
        nextDay = nextDate;
        daojiashi(nextDay);
        return nextDate;
    }

    function showtime() {
        var nowtime = new Date();//获取当前时间
        var TempnextDay = "";
        var endtime = "";
        if (nextDay === undefined)
            TempnextDay = endtime = FindNextDay();
        else
            TempnextDay = endtime = new Date(nextDay); //定义结束时间
        var lefttime = endtime.getTime() - nowtime.getTime(), //距离结束时间的毫秒数
            leftd = Math.floor(lefttime / (1000 * 60 * 60 * 24)), //计算天数
            lefth = Math.floor((lefttime - leftd * 1000 * 60 * 60 * 24) / (1000 * 60 * 60)), //计算小时数
            leftm = Math.floor((lefttime - leftd * 1000 * 60 * 60 * 24 - lefth * 1000 * 60 * 60) / (1000 * 60)), //计算分钟数
            lefts = Math.floor((lefttime - leftd * 1000 * 60 * 60 * 24 - lefth * 1000 * 60 * 60 - leftm * 1000 * 60) / (1000)); //计算秒数

        if (lefttime > 100 && lefttime < 1800) {
            if (!checkStatus())
                woaixuexi().then(() => nextDay = FindNextDay());
        } else if (lefttime < -1800) {
            //时的字符串
            nextDay = FindNextDay();

        }
        var ind = qiandaoDaojishi(nextDay);
        return (
            ind + "下次打卡时间：<span style='color:red'>" +
            TempnextDay.format("yyyy-MM-dd hh:mm:ss") +
            "</span>现在时刻：" +
            nowtime.format("yyyy-MM-dd hh:mm:ss") +
            "，签到倒计时：<span style='color:red'>" + leftd + "天" + lefth + ":" + leftm + ":" + lefts + "</span>"
        ); //返回倒计
    };
    var ranDom = Math.round(Math.random() * 30 + 10);
    var buttons = [];
    var timers = [];
    var qiandaoTime = "";
    //nextDay = new Date("2021-04-28 07:35:40");
    function addDayTime(datetime, days) {
        if (datetime == "undefine" || datetime == "" || datetime.length < 8) {
            datetime = new Date();
        }
        if (datetime.length == 8 && datetime.indexOf("-") == -1)
            datetime =
                datetime.substring(0, 4) +
                "-" +
                datetime.substring(4, 6) +
                "-" +
                datetime.substring(6, 8);

        startDate = new Date(datetime);
        startDate = +startDate + days * 1000 * 60 * 60 * 24;
        startDate = new Date(startDate);
        var nextStartDate =
            startDate.getFullYear() +
            "" +
            (startDate.getMonth() + 1 - 0 > 9
                ? startDate.getMonth() + 1
                : "0" + (startDate.getMonth() + 1)) +
            "" +
            (startDate.getDate() - 0 > 9
                ? startDate.getDate()
                : "0" + startDate.getDate());
        return startDate;
    }
    woaixuexi();
    async function woaixuexi() {
        'use strict';
        const dati = "开始答题"

        var needReload;
        var timers = [];
        var debug = true; // 调试开关，有问题打开这个开关，在www.xuexi.cn页面按12打开控制台，把log贴上来反馈给我。

        var msg = "";
        var datev = new Date();
        //const supa = supabase.createClient("https://vsxqsnogzhrykowqdloi.supabase.co", 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMTI3NTU1NywiZXhwIjoxOTI2ODUxNTU3fQ.DWxw-rBJSqM6oShe3WI55j9nuJ5Zzo4x3ISzROA90aU')

        //var articles = await getArticles();
        //console.log(articles)
        function xuexi() {
            var timer = setInterval(function () {
                checkxue()
            }, 1000); //反复执行函数本身
        }
        function checkxue() {

            var date = datev.getFullYear() + "/" + datev.getMonth() + "/" + datev.getDate();
            if (localStorage['xuexi' + date] != null && localStorage['xuexi' + date] != undefined && localStorage['xuexi' + date] == 'ok') {

            }
            else {
            }
        }
        var date = datev.getFullYear() + "/" + datev.getMonth() + "/" + datev.getDate();

        var examData = GMgetValue(date, { weeklyExamDone: false, zhuanxiangExamDone: false })
        var settings = GMgetValue("Settings");
        if (!settings) {
            msg = "请通过左边按钮设定自动学习项目，默认为全部自动学习！！";
            settings = {
                article: { value: true, name: "文章学习" },
                video: { value: true, name: "视频学习" },
                daily: { value: true, name: "每日答题" },
                weekly: { value: true, name: "每周答题" },
                zhuanxiang: { value: true, name: "专项答题" },
            }
        } else {
            msg = "如需修改自动学习项目，请通过左边按钮修改！！";
        }

        //if (debug) {
        // console.log(settings);
        //}

        async function doStudy() {
            console.log("开始今日学习：doStudy() start")

            var scores = await getScores();
            if (debug) {
                console.log("今日总积分：" + scores);
                console.log("阅读文章完成否：flash为完成，" + checkAriticle(scores))
                console.log("观看视频完成否：flash为完成，" + checkVideo(scores))
                console.log("每日答题完成否：flash为完成，" + checkDaily(scores))
                console.log("每周答题完成否：flash为完成，" + checkWeekly(scores))
                console.log("专项答题完成否：flash为完成，" + checkZhuanxiang(scores))
            }

            if (!(checkAriticle(scores) ||
                checkVideo(scores) ||
                checkDaily(scores) ||
                checkWeekly(scores) ||
                checkZhuanxiang(scores))) {
                var nowDate = new Date().format('yyyy/MM/dd');
                localStorage[nowDate] = 'ok';
                console.log("今日学习任务已经完成！！！return");
                return;
            }
            if (checkAriticle(scores)) {
                await doArticleStudy();
            }

            if (checkVideo(scores)) {
                await doVideoStudy();
            }

            if (settings.daily.value || settings.weekly.value || settings.zhuanxiang.value) {
                if (checkDaily(scores)) {
                    await openDailyExam();
                } else if (checkWeekly(scores)) {
                    await openWeeklyExam();
                } else if (checkZhuanxiang(scores)) {
                    await openZhuanxiangExam();
                }
            }

            console.log("doStudy() end")

        }

        function checkAriticle(scores) {
            return (settings.article.value && scores.article.dayScore < scores.article.dayMaxScore);
        }

        function checkVideo(scores) {
            return (settings.video.value && (scores.video_num.dayScore < scores.video_num.dayMaxScore || scores.video_time.dayScore < scores.video_time.dayMaxScore));
        }

        function checkDaily(scores) {
            return (scores.daily.dayScore < scores.daily.dayMaxScore && settings.daily.value);
        }

        function checkWeekly(scores) {
            return (scores.weekly.dayScore === 0 && settings.weekly.value && !examData.weeklyExamDone);
        }

        function checkZhuanxiang(scores) {
            return (scores.zhuanxiang.dayScore === 0 && settings.zhuanxiang.value && !examData.zhuanxiangExamDone);
        }

        async function openDailyExam() {
            console.log("打开每日答题：openDailyExam() start")
            var scores = await getScores();

            if (scores.daily.dayScore < scores.daily.dayMaxScore) {
                var win = window.open("https://pc.xuexi.cn/points/exam-practice.html");
                var timer = setInterval(async function () {
                    if (win.closed) {
                        /*var scores = await getScores();
                        if (scores.daily.dayScore < scores.daily.dayMaxScore && settings.daily.value) {
                        clearInterval(timer);
                        openDailyExam();
                        } else {*/
                        if (checkWeekly(scores)) {
                            openWeeklyExam();
                        } else if (checkZhuanxiang(scores)) {
                            openZhuanxiangExam();
                        } else {
                            location.reload();
                        }
                        clearInterval(timer);
                        console.log('打开每日答题关闭：DailyExam closed');
                        //}
                    }
                }, 10000);
            }
            console.log("打开每日答题完成：openDailyExam() end")
        }

        async function openWeeklyExam() {
            console.log("打开每周答题开始：openWeeklyExam() start")
            var scores = await getScores();

            if (scores.weekly.dayScore === 0) {
                var win = window.open("https://pc.xuexi.cn/points/exam-weekly-list.html");
                var timer = setInterval(function () {
                    if (win.closed) {
                        if (checkZhuanxiang(scores)) {
                            openZhuanxiangExam();
                        } else {
                            location.reload();
                        }
                        clearInterval(timer);
                        console.log('每周答题关闭：WeeklyExam closed');
                    }
                }, 10000);

            }
            console.log("打开每周答题结束：openWeeklyExam() end")
        }

        async function openZhuanxiangExam() {
            console.log("打开专项答题开始：openZhuanxiangExam() start")
            var scores = await getScores();

            if (scores.zhuanxiang.dayScore === 0) {
                var win = window.open("https://pc.xuexi.cn/points/exam-paper-list.html");

                var timer = setInterval(function () {
                    if (win.closed) {
                        location.reload();
                        clearInterval(timer);
                        console.log('打开专项答题关闭：ZhuanxiangExam closed');
                    }
                }, 10000);
            }
            console.log("打开专项答题结束：openZhuanxiangExam() end")
        }

        async function doDailyExam() {
            console.log("每日答题开始：doDailyExam() start")
            if (settings.daily.value) {
                var scores = await getScores();
                while (scores.daily.dayScore < scores.daily.dayMaxScore) {
                    console.log("===================================");
                    await delay();
                    var end = await doExam();
                    if (end) {
                        //await openDailyExam();
                        window.close();
                        break;
                    }
                }
            }
            console.log("每日答题结束：doDailyExam() end")

        }

        async function doWeeklyExam() {
            console.log("每周答题开始：doWeeklyExam() start")
            if (settings.weekly.value) {
                var scores = await getScores();
                while (scores.weekly.dayScore === 0) {
                    console.log("===================================");
                    await delay();
                    var end = await doExam();
                    if (end) {
                        examData.weeklyExamDone = true;
                        GMsetValue(date, examData);
                        window.close();
                        break;
                    }
                    //scores = await getScores();
                }
            }
            console.log("每周答题开始：doWeeklyExam() end")

        }

        async function doZhuanXiangExam() {
            console.log("专项答题开始：doZhuanXiangExam() start")
            if (settings.zhuanxiang.value) {
                var scores = await getScores();
                while (scores.zhuanxiang.dayScore >= 0) {
                    console.log("===================================");
                    await delay();
                    var end = await doExam();
                    if (end) {
                        examData.zhuanxiangExamDone = true;
                        GMsetValue(date, examData);
                        window.close();
                        break;
                    }
                    //scores = await getScores();
                }
            }

            console.log("专项答题开始：doZhuanXiangExam() end")
        }

        if (window.location.href === "https://pc.xuexi.cn/points/exam-practice.html") {
            doDailyExam();
        } else if (window.location.href === "https://pc.xuexi.cn/points/exam-weekly-list.html") {
            getExams().then(buttons => {
                var exams = Array.prototype.slice.call(buttons);
                exams = exams.filter(exams => {
                    return exams.innerText === dati
                })
                if (exams.length == 0) {
                    examData.weeklyExamDone = true;
                    GMsetValue(date, examData);
                    //openZhuanxiangExam();
                    window.close();
                } else {
                    exams[exams.length - 1].click();
                }
            });
        } else if (window.location.href === "https://pc.xuexi.cn/points/exam-paper-list.html") {
            getExams().then(buttons => {
                var exams = Array.prototype.slice.call(buttons);
                exams = exams.filter(exams => {
                    return exams.innerText === dati
                })
                if (exams.length == 0) {
                    examData.zhuanxiangExamDone = true;
                    GMsetValue(date, examData);
                    window.close();
                } else {
                    exams[exams.length - 1].click();
                }

            });
        } else if (window.location.href.startsWith("https://pc.xuexi.cn/points/exam-weekly-detail.html")) {
            doWeeklyExam();
        } else if (window.location.href.startsWith("https://pc.xuexi.cn/points/exam-paper-detail.html")) {
            doZhuanXiangExam();
        } else if (window.location.href.startsWith("https://pc.xuexi.cn/points/my-points.html")) {
            $jq(document).ready(async function () {

                await parseScoreDocument();
                window.close();
            })

            /*setInterval(() => {
            needReload = GMgetValue("needReload");
            if (needReload == "1") {
            location.reload();
            }
            }, 60000);*/

        } else {
            $jq(document).ready(async function () {
                var retryNum = 20;
                var login;
                var logined;
                while (retryNum >= 0) { // 不知道什么原因，有时候就是取不到，所以多循环几次取
                    login = document.querySelector("a.icon.login-icon");
                    logined = document.querySelector("span.logged-text");
                    if (debug) {
                        console.log(login);
                    }
                    if (login != null && login != undefined) {
                        break;
                    }

                    if (logined != null && logined != undefined) {
                        break;
                    }

                    await sleep(2000);
                    retryNum--;
                    continue;
                }


                if (login != null && login != undefined) {
                    alert("请先登录学习强国，然后才能自动学习！！\n" + msg);
                }

                if (logined != null && logined != undefined) {
                    console.log('积分页面打开：score page opened');
                    var win = window.open("https://pc.xuexi.cn/points/my-points.html");
                    //parseScoreDocument();
                    var timer = setInterval(function () {
                        if (win.closed) {
                            doStudy();
                            clearInterval(timer);
                            console.log('积分页面关闭：score page closed');
                        }
                    }, 10000);

                }
            })
        }

        async function getExams() {
            var buttons = [];
            while (buttons.length == 0) {
                await delay();
                buttons = document.querySelectorAll(".ant-btn");
            }
            return buttons
        }

        async function delay() {
            await sleep((Math.random() * 5 + 5) * 1000);
        }

        async function doExam() {
            console.log("doExam() start")
            var end = false;
            var nextAll = document.querySelectorAll(".ant-btn");

            if (debug) {
                console.log(nextAll);
            }
            var next = nextAll[0];

            if (nextAll.length == 2) {
                next = nextAll[1];
            }

            if (next.textContent != "再练一次" && next.textContent != "再来一组" && next.textContent != "查看解析") {

            } else {
                return true;
            }

            try {
                document.querySelector(".tips").click();
            } catch (e) {
                console.log(e);
            }

            //所有提示
            var allTips = document.querySelectorAll("font[color=red]");
            if (debug) {
                console.log(allTips);
            }
            await delay();

            //选项按钮
            var buttons = document.querySelectorAll(".q-answer");
            var questions = document.querySelectorAll(".q-body");

            var textboxs = document.querySelectorAll("input[type=text]");
            if (debug) {
                console.log(textboxs);
            }
            //问题类型
            try {
                var qType = document.querySelector(".q-header").textContent;
                qType = qType.substr(0, 3)
            } catch (e) {
                console.log(e);
            }


            var results = [];
            switch (qType) {
                case "填空题":
                    //第几个填空
                    textboxs = document.querySelectorAll(".blank");
                    var mevent = new Event('input', { bubbles: true });
                    if (textboxs.length > 1) {
                        //填空数量和提示数量一致
                        if (allTips.length == textboxs.length) {
                            for (let i = 0; i < allTips.length; i++) {
                                let tip = allTips[i];
                                let tipText = tip.textContent;
                                if (tipText.length > 0) {
                                    //通过设置属性,然后立即让他冒泡这个input事件.
                                    //否则1,setattr后,内容消失.
                                    //否则2,element.value=124后,属性值value不会改变,所以冒泡也不管用.
                                    textboxs[i].setAttribute("value", tipText);
                                    textboxs[i].dispatchEvent(mevent);
                                }
                            }
                        }
                        else {
                            //若填空数量和提示数量不一致，那么，应该都是提示数量多。
                            if (allTips.length > textboxs.length) {
                                var lineFeed = document.querySelector('.line-feed').textContent;//这个是提示的所有内容，不仅包含红色答案部分。
                                let n = 0;//计数，第几个tip。
                                for (let j = 0; j < textboxs.length; j++) {
                                    let tipText = allTips[n].textContent;
                                    let nextTipText = "";
                                    do {
                                        tipText += nextTipText;
                                        if (n < textboxs.length - 1) {
                                            n++;
                                            nextTipText = allTips[n].textContent;
                                        } else {
                                            nextTipText = "结束了，没有了。";
                                        }
                                    }
                                    while (lineFeed.indexOf(tipText + nextTipText));

                                    textboxs[j].setAttribute("value", tipText);
                                    textboxs[j].dispatchEvent(mevent);
                                }

                            }

                        }
                    }
                    else if (textboxs.length == 1) {//只有一个空，直接把所有tips合并。
                        let tipText = "";
                        for (let i = 0; i < allTips.length; i++) {
                            tipText += allTips[i].textContent;
                        }
                        if (tipText === "") {
                            tipText = "  ";
                        }
                        textboxs[0].setAttribute("value", tipText);
                        textboxs[0].dispatchEvent(mevent);
                        break;
                    }
                    else {
                        //怕有没空白的情况。
                    }

                    break;
                case "多选题":
                    results = [];
                    var re = new RegExp("（）", "g");
                    var arr = questions[0].innerText.match(re);
                    console.log(arr.length);
                    //如果选项数量与空格数量相同则直接全选
                    if (arr.length == buttons.length) {
                        for (var jj = 0; jj < arr.length; jj++) {
                            if (!$jq(buttons[jj]).hasClass("chosen")) {
                                buttons[jj].click();
                            }
                        }
                    }
                    else {
                        for (let i = 0; i < allTips.length; i++) {
                            let tip = allTips[i];
                            let tipText = tip.textContent;
                            if (debug) {
                                console.log(tipText);
                            }
                            if (tipText.length > 0) {
                                for (let js = 0; js < buttons.length; js++) {
                                    let cButton = buttons[js];
                                    let cButtonText = cButton.textContent;
                                    results[js] = xiangshidu(cButtonText, tipText)
                                }
                            }

                            let max = 0;
                            let index = 0;
                            if (debug) {
                                console.log(results);
                            }
                            results.forEach((item, i) => {
                                if (item > max) {
                                    max = item;
                                    index = i;
                                }
                            });

                            if (debug) {
                                console.log("max = " + max)
                                console.log("index = " + index)
                                console.log($jq(buttons[index]).hasClass("chosen"));
                            }
                            if (!$jq(buttons[index]).hasClass("chosen")) {
                                buttons[index].click();
                            }

                        }
                    }
                    break;

                case "单选题":
                    //单选，所以所有的提示，其实是同一个。有时候，对方提示会分成多个部分。
                    //比如2018年10月第一周答题第二题。
                    //case 块里不能直接用let。所以增加了个if。
                    results = [];
                    if (true) {
                        //把红色提示组合为一条
                        let tipText = "";
                        for (let i = 0; i < allTips.length; i++) {
                            tipText += allTips[i].textContent;
                        }

                        if (debug) {
                            console.log(tipText)
                        }
                        let clicked = false;
                        if (tipText.length > 0) {
                            //循环对比后点击
                            for (let js = 0; js < buttons.length; js++) {
                                results[js] = 0;
                                let cButton = buttons[js];
                                let cButtonText = cButton.textContent;
                                if (debug) {
                                    console.log(cButtonText);
                                }
                                //通过判断是否相互包含，来确认是不是此选项
                                if (cButtonText.indexOf(tipText) > -1 || tipText.indexOf(cButtonText) > -1) {
                                    clicked = true;
                                    cButton.click();
                                    break;
                                } else {
                                    results[js] = xiangshidu(cButtonText, tipText)
                                }
                            }

                            if (!clicked) {
                                let max = 0;
                                let index = 0;
                                if (debug) {
                                    console.log(results);
                                }
                                results.forEach((item, i) => {
                                    if (item > max) {
                                        max = item;
                                        index = i;
                                    }
                                });

                                if (debug) {
                                    console.log("max = " + max)
                                    console.log("index = " + index)
                                }
                                buttons[index].click();
                            }
                        } else {
                            buttons[0].click();
                        }
                    }
                    break;
                default:
                    break;
            }
            try {
                document.querySelector(".tips").click();

            } catch (e) {
                console.log(e);
            }

            nextAll = document.querySelectorAll(".ant-btn");

            if (debug) {
                console.log(nextAll);
            }

            if (nextAll.length == 2) {
                next = nextAll[1];
            }

            if (next.textContent != "再练一次" && next.textContent != "再来一组" && next.textContent != "查看解析") {
                end = false
                next.click();
            } else {
                end = true;
            }
            if (debug) {
                console.log("end = " + end)
            }
            console.log("doExam() end")
            return end;

        }



        async function doVideoStudy() {
            console.log("doVideoStudy() start")
            var articles = await getVideos();
            // console.log(videos);
            var i = 0;
            var closed = true;
            var scores = await getScores();
            if (debug) {
                console.log(scores);
            }
            var num = Math.max((scores.video_num.dayMaxScore - scores.video_num.dayScore), (scores.video_time.dayMaxScore - scores.video_time.dayScore)) + 1
            while (num >= 0) {
                closed = false;
                //scores = await getScores();
                //console.log(scores.video_num.dayScore);
                //console.log(scores.video_num.dayMaxScore);
                //console.log(scores.video_time.dayScore);
                //console.log(scores.video_time.dayMaxScore);
                var k = 0;
                //if (scores.video_num.dayScore < scores.video_num.dayMaxScore || scores.video_time.dayScore < scores.video_time.dayMaxScore) {
                var readarticle_time = 40 + (Math.ceil(Math.random() * 10) + 5);
                if (debug) {
                    console.log("videos:" + readarticle_time);
                }
                var win = window.open(articles[i].url, articles[i].title);
                console.log("videos_url:" + articles[i].url, "videos_title:" + articles[i].title)

                //for (var j = 0; j < 2; j++) {
                /*if (Math.random() > 0.3) {
                
                }*/
                await delay();
                var height = win.document.body.clientHeight / 2;
                win.window.scrollTo(0, height);

                await sleep(readarticle_time * 1000);

                win.close();

                i++;
                num--;
                //} else {
                // break;
                //}
            }
            console.log("doVideoStudy() end")

        }


        /*async function getVideos() {
        var videos = []
        await $.when(getVideos1(), getVideos2(), getVideos3()).done(function(videos1, videos2, videos3) {
        console.log(videos1)
        console.log(videos2)
        console.log(videos3)
        videos = videos.concat(videos1[0].map(video => {
        return {itemId:video.itemId, title:video.title, url:video.url}
        }))
        videos = videos.concat(videos2[0].map(video => {
        return {itemId:video.itemId, title:video.title, url:video.url}
        }))
        videos = videos.concat(videos3[0].map(video => {
        return {itemId:video.itemId, title:video.title, url:video.url}
        }))
        
        videos.sort(video => {
        return Math.random() - 0.5;
        })
        
        })
        return videos;
        }*/



        async function getVideos() {
            console.log("getVideos() start")
            //str1/str2数据来源：
            // 视频数据来源：
            //https://www.xuexi.cn/lgdata/41gt3rsjd6l8.json?_st=26990617
            //https://www.xuexi.cn/lgdata/2qfjjjrprmdh.json?_st=26990617
            //https://www.xuexi.cn/lgdata/4d82ahlubmol.json?_st=26990617
            //https://www.xuexi.cn/lgdata/48cdilh72vp4.json?_st=26990617
            //https://www.xuexi.cn/lgdata/3m1erqf28h0r.json?_st=26990617 1010个
            //https://www.xuexi.cn/lgdata/4d82ahlubmol.json?_st=26990617 568个
            //https://www.xuexi.cn/lgdata/41gt3rsjd6l8.json?_st=26990617 464个
            //https://www.xuexi.cn/lgdata/54tjo9frmhm7.json?_st=26990617 439个
            let str1 = [
                {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2560392888520766136&item_id=2560392888520766136"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8846929956655142331&item_id=8846929956655142331"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6459641726169655855&item_id=6459641726169655855"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5277180099607480614&item_id=5277180099607480614"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6679518335812856680&item_id=6679518335812856680"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1742954848541062149&item_id=1742954848541062149"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12695731383261904418&item_id=12695731383261904418"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10599335027941446498&item_id=10599335027941446498"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1109713753264975239&item_id=1109713753264975239"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17121491559569265501&item_id=17121491559569265501"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7318160257081449126&item_id=7318160257081449126"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14239598833411860168&item_id=14239598833411860168"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16107195046907133931&item_id=16107195046907133931"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14895793546453001175&item_id=14895793546453001175"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12143970813561742428&item_id=12143970813561742428"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1826649420260084886&item_id=1826649420260084886"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8170774962896011967&item_id=8170774962896011967"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11715936823466157556&item_id=11715936823466157556"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13990975744627851287&item_id=13990975744627851287"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7715148254762744913&item_id=7715148254762744913"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5355159221306649153&item_id=5355159221306649153"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1386577143186403021&item_id=1386577143186403021"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=150110184354193134&item_id=150110184354193134"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10891872359715772471&item_id=10891872359715772471"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5762057407890104244&item_id=5762057407890104244"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5389303246736307087&item_id=5389303246736307087"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6253618752900753036&item_id=6253618752900753036"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2311524467221273379&item_id=2311524467221273379"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5295706888140385049&item_id=5295706888140385049"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9899594282720441511&item_id=9899594282720441511"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16522845240826922076&item_id=16522845240826922076"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2272365463999664822&item_id=2272365463999664822"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14706206186216030916&item_id=14706206186216030916"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16427381744578846214&item_id=16427381744578846214"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16683791579977277136&item_id=16683791579977277136"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7137349062494599636&item_id=7137349062494599636"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9586202306991062612&item_id=9586202306991062612"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1728737659096584241&item_id=1728737659096584241"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5603153048640145184&item_id=5603153048640145184"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7501691308119093390&item_id=7501691308119093390"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6028130067794323078&item_id=6028130067794323078"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16068756437438752165&item_id=16068756437438752165"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4408568222905282830&item_id=4408568222905282830"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3101062837545780272&item_id=3101062837545780272"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17722088347760163815&item_id=17722088347760163815"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12774173311505986579&item_id=12774173311505986579"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17515207386547608467&item_id=17515207386547608467"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9222238269480420390&item_id=9222238269480420390"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=814535370974738985&item_id=814535370974738985"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=149888162499060547&item_id=149888162499060547"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14474900216269963339&item_id=14474900216269963339"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16329799364469058590&item_id=16329799364469058590"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1418778696997184714&item_id=1418778696997184714"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3608609784797824647&item_id=3608609784797824647"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3374955534406593538&item_id=3374955534406593538"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17059978957104313469&item_id=17059978957104313469"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2824062473541087477&item_id=2824062473541087477"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10613515761524448350&item_id=10613515761524448350"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16483881756106832154&item_id=16483881756106832154"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12922966406823837226&item_id=12922966406823837226"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10243335319731233006&item_id=10243335319731233006"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14795111509058683934&item_id=14795111509058683934"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2850911903130775572&item_id=2850911903130775572"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8348258492307817635&item_id=8348258492307817635"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6585334585797321702&item_id=6585334585797321702"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9095330496220120599&item_id=9095330496220120599"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5961779819140930079&item_id=5961779819140930079"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9305490151767831938&item_id=9305490151767831938"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15686526549550739079&item_id=15686526549550739079"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3612881946504025925&item_id=3612881946504025925"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6903183605792168719&item_id=6903183605792168719"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=797492667637159275&item_id=797492667637159275"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10459761004218683433&item_id=10459761004218683433"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14048296158567301732&item_id=14048296158567301732"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10727825832903256963&item_id=10727825832903256963"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=312152300913977349&item_id=312152300913977349"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3566741666579167051&item_id=3566741666579167051"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16314045041199637515&item_id=16314045041199637515"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12391866780579123410&item_id=12391866780579123410"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10175965184177183000&item_id=10175965184177183000"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1280742253927200703&item_id=1280742253927200703"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5628094232544874541&item_id=5628094232544874541"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13385051786986714037&item_id=13385051786986714037"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8513249494595805913&item_id=8513249494595805913"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12141502602397246486&item_id=12141502602397246486"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14032587868528356957&item_id=14032587868528356957"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3687662743126063680&item_id=3687662743126063680"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1669185184102129811&item_id=1669185184102129811"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=43073149128117674&item_id=43073149128117674"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8565395498308777441&item_id=8565395498308777441"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17153179764770895597&item_id=17153179764770895597"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15479012578923351641&item_id=15479012578923351641"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2658480618184493766&item_id=2658480618184493766"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16839488008898841296&item_id=16839488008898841296"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5420752314001488262&item_id=5420752314001488262"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=208356226144217915&item_id=208356226144217915"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12606216426954332825&item_id=12606216426954332825"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11762542528455169583&item_id=11762542528455169583"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6660364397740068407&item_id=6660364397740068407"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12230578027318651745&item_id=12230578027318651745"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5700079898993528309&item_id=5700079898993528309"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16869443773221034065&item_id=16869443773221034065"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4873298767707598033&item_id=4873298767707598033"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4793702777626194897&item_id=4793702777626194897"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1115625012019375641&item_id=1115625012019375641"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4607612453591188157&item_id=4607612453591188157"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5858407447740011016&item_id=5858407447740011016"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10627488770125176862&item_id=10627488770125176862"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16824126436189715966&item_id=16824126436189715966"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4161556147754969030&item_id=4161556147754969030"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7707054511259119272&item_id=7707054511259119272"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3422480228555641935&item_id=3422480228555641935"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17259871676871133224&item_id=17259871676871133224"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15942613919801494108&item_id=15942613919801494108"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15326155359432111761&item_id=15326155359432111761"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5793334799831616642&item_id=5793334799831616642"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5790189443238907096&item_id=5790189443238907096"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10932393662635382368&item_id=10932393662635382368"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5306526297411570078&item_id=5306526297411570078"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=945079720700318243&item_id=945079720700318243"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5631902261529303857&item_id=5631902261529303857"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14844086917458840851&item_id=14844086917458840851"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1566080272911645649&item_id=1566080272911645649"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7076622424396092245&item_id=7076622424396092245"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10566816161501156487&item_id=10566816161501156487"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14320532561461482419&item_id=14320532561461482419"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6068738142807198113&item_id=6068738142807198113"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8991179753396331541&item_id=8991179753396331541"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10165678907995720181&item_id=10165678907995720181"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16016906958158460199&item_id=16016906958158460199"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2428608924319742565&item_id=2428608924319742565"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7450887707037394076&item_id=7450887707037394076"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10651607991675319600&item_id=10651607991675319600"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6418311954127454183&item_id=6418311954127454183"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6846993021522034646&item_id=6846993021522034646"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15959693861165268292&item_id=15959693861165268292"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16810649151560835802&item_id=16810649151560835802"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16667871062189997221&item_id=16667871062189997221"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17951574988620549340&item_id=17951574988620549340"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9776899461562157339&item_id=9776899461562157339"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10160813383097984669&item_id=10160813383097984669"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10413935232719763794&item_id=10413935232719763794"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=890260054878609315&item_id=890260054878609315"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8432616338679987291&item_id=8432616338679987291"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8286985538306119392&item_id=8286985538306119392"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5317060062622916442&item_id=5317060062622916442"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14857123696859072333&item_id=14857123696859072333"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8497924210373131962&item_id=8497924210373131962"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7167226147859545403&item_id=7167226147859545403"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9199521771847918805&item_id=9199521771847918805"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15184654323849123431&item_id=15184654323849123431"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17115317787387781775&item_id=17115317787387781775"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=336784995239629903&item_id=336784995239629903"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14634789506507734356&item_id=14634789506507734356"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6489924994087960167&item_id=6489924994087960167"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15205440281290422272&item_id=15205440281290422272"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17643281107454071086&item_id=17643281107454071086"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2866827197493297846&item_id=2866827197493297846"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3422234169718688661&item_id=3422234169718688661"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9368878169839440511&item_id=9368878169839440511"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3844104735636576549&item_id=3844104735636576549"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3791362049389571021&item_id=3791362049389571021"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8836064276671283368&item_id=8836064276671283368"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17371698589087780153&item_id=17371698589087780153"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12652448332776637830&item_id=12652448332776637830"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17603464904871360411&item_id=17603464904871360411"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=919294447093817241&item_id=919294447093817241"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7231011410902352225&item_id=7231011410902352225"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11299729872286617245&item_id=11299729872286617245"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2171074606726372966&item_id=2171074606726372966"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4952748669588275487&item_id=4952748669588275487"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8710864148954857186&item_id=8710864148954857186"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7709363886490358239&item_id=7709363886490358239"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14466217667752794065&item_id=14466217667752794065"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3182258182799509592&item_id=3182258182799509592"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2732162198680391342&item_id=2732162198680391342"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9121340611170555528&item_id=9121340611170555528"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10723118044691974954&item_id=10723118044691974954"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=927624982760752944&item_id=927624982760752944"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1463945243242899616&item_id=1463945243242899616"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=507662337657090328&item_id=507662337657090328"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=161382468801864447&item_id=161382468801864447"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6563976084357468811&item_id=6563976084357468811"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1997518016392777257&item_id=1997518016392777257"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12057700086245237320&item_id=12057700086245237320"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18068934985370261479&item_id=18068934985370261479"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13917993687515225622&item_id=13917993687515225622"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4302197225455815865&item_id=4302197225455815865"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15098387269202918036&item_id=15098387269202918036"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=113397198021757680&item_id=113397198021757680"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=259082306330142660&item_id=259082306330142660"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7105715380428846315&item_id=7105715380428846315"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1564040006757366450&item_id=1564040006757366450"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1591879287594558979&item_id=1591879287594558979"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15756299414615311735&item_id=15756299414615311735"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17746145721466336336&item_id=17746145721466336336"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10434174343523482827&item_id=10434174343523482827"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1318633960971217391&item_id=1318633960971217391"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4821321693353629655&item_id=4821321693353629655"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13708970303906218888&item_id=13708970303906218888"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7952825434474994634&item_id=7952825434474994634"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13075345713910941312&item_id=13075345713910941312"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6366559675201194294&item_id=6366559675201194294"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10443198311615624367&item_id=10443198311615624367"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1445889984555432103&item_id=1445889984555432103"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5717170321610302299&item_id=5717170321610302299"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10578977939302256615&item_id=10578977939302256615"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17058868936830164320&item_id=17058868936830164320"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12040544575687806833&item_id=12040544575687806833"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13060336380797167395&item_id=13060336380797167395"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4270188917411342121&item_id=4270188917411342121"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2002378627471444028&item_id=2002378627471444028"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14360898954168808171&item_id=14360898954168808171"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5898568332100183335&item_id=5898568332100183335"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11629931678651170952&item_id=11629931678651170952"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13210276820460802089&item_id=13210276820460802089"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4119673241990910902&item_id=4119673241990910902"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12005779703320912120&item_id=12005779703320912120"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=977766345161139215&item_id=977766345161139215"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1132720992087201303&item_id=1132720992087201303"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17555896751781852227&item_id=17555896751781852227"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6941529013523325544&item_id=6941529013523325544"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4939062821185406734&item_id=4939062821185406734"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18111167694418599001&item_id=18111167694418599001"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10119760506456800090&item_id=10119760506456800090"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14925981414377075274&item_id=14925981414377075274"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6442804057496725891&item_id=6442804057496725891"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13173563753764502965&item_id=13173563753764502965"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18195291980405758238&item_id=18195291980405758238"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9465369785517506549&item_id=9465369785517506549"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2185526085695606535&item_id=2185526085695606535"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2631377668278936400&item_id=2631377668278936400"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3645409536394034596&item_id=3645409536394034596"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15929586164207743574&item_id=15929586164207743574"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10732940868115203469&item_id=10732940868115203469"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1768896837538662607&item_id=1768896837538662607"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8915161835316315759&item_id=8915161835316315759"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5598862088767923658&item_id=5598862088767923658"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10628824497478312787&item_id=10628824497478312787"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15840024233003375287&item_id=15840024233003375287"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18412952467876985831&item_id=18412952467876985831"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9252584093301565048&item_id=9252584093301565048"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=201290283638942267&item_id=201290283638942267"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5468780121727795608&item_id=5468780121727795608"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12202046181480543107&item_id=12202046181480543107"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3103039204591176753&item_id=3103039204591176753"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17099305247854047072&item_id=17099305247854047072"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12408119494131203439&item_id=12408119494131203439"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9933680473664787541&item_id=9933680473664787541"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1791122237678981777&item_id=1791122237678981777"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10897832696602831633&item_id=10897832696602831633"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4984152054833706359&item_id=4984152054833706359"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15030688794051738393&item_id=15030688794051738393"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9757577789071095684&item_id=9757577789071095684"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17435859428246879310&item_id=17435859428246879310"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7261339375908395739&item_id=7261339375908395739"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15899642960435283936&item_id=15899642960435283936"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5080906530209345356&item_id=5080906530209345356"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7428947097787227768&item_id=7428947097787227768"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18021071773400777552&item_id=18021071773400777552"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6407678688367162204&item_id=6407678688367162204"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3518590684617088455&item_id=3518590684617088455"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13611261408790164556&item_id=13611261408790164556"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1947939565857609666&item_id=1947939565857609666"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2463286147712965467&item_id=2463286147712965467"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5404213757106931976&item_id=5404213757106931976"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8440583530181449437&item_id=8440583530181449437"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1205353303659228541&item_id=1205353303659228541"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14605320332288919269&item_id=14605320332288919269"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2935592538146343013&item_id=2935592538146343013"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5757674323948725683&item_id=5757674323948725683"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6897270163058941164&item_id=6897270163058941164"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9632367292077799597&item_id=9632367292077799597"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11866033322837656392&item_id=11866033322837656392"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2659104176342598568&item_id=2659104176342598568"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3170270922533866796&item_id=3170270922533866796"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16292679529897016719&item_id=16292679529897016719"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6763703095685137278&item_id=6763703095685137278"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5608682954687410801&item_id=5608682954687410801"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13305931483590161107&item_id=13305931483590161107"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9414880240724648125&item_id=9414880240724648125"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4731742720116938111&item_id=4731742720116938111"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9477333875208722908&item_id=9477333875208722908"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11820440137407938221&item_id=11820440137407938221"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13599514721885587464&item_id=13599514721885587464"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14398414642360250429&item_id=14398414642360250429"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3043215002806387254&item_id=3043215002806387254"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1048853072725090264&item_id=1048853072725090264"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13743883705922165106&item_id=13743883705922165106"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5724549992771654011&item_id=5724549992771654011"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6992246091580563581&item_id=6992246091580563581"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2899371671919402950&item_id=2899371671919402950"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=883098631902472204&item_id=883098631902472204"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17950712193804081066&item_id=17950712193804081066"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11988550620035217256&item_id=11988550620035217256"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3184004377261090605&item_id=3184004377261090605"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12549141954432867028&item_id=12549141954432867028"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13732700612786001008&item_id=13732700612786001008"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3384096587885682611&item_id=3384096587885682611"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9704141015608769680&item_id=9704141015608769680"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17620405631175893913&item_id=17620405631175893913"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5024529951238334964&item_id=5024529951238334964"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15687265497468786728&item_id=15687265497468786728"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4454977106870618813&item_id=4454977106870618813"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11074965641672901347&item_id=11074965641672901347"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9647666973764014970&item_id=9647666973764014970"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15391366353101371196&item_id=15391366353101371196"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17031292146071150237&item_id=17031292146071150237"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=316015927499577402&item_id=316015927499577402"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12988727165437288629&item_id=12988727165437288629"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3140836585989291125&item_id=3140836585989291125"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13893661125045040104&item_id=13893661125045040104"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1224376884270867025&item_id=1224376884270867025"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10622370599700484624&item_id=10622370599700484624"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13899226032566483453&item_id=13899226032566483453"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11015294799012187534&item_id=11015294799012187534"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14905470686473599733&item_id=14905470686473599733"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9875251249942848910&item_id=9875251249942848910"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7066601145289973979&item_id=7066601145289973979"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4436139415193882697&item_id=4436139415193882697"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4757176302083661972&item_id=4757176302083661972"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14763954468608273170&item_id=14763954468608273170"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2249352051621317538&item_id=2249352051621317538"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8786393700743352092&item_id=8786393700743352092"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16840831031035787843&item_id=16840831031035787843"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1445847636061124591&item_id=1445847636061124591"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9797263768804743912&item_id=9797263768804743912"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11654300970194763606&item_id=11654300970194763606"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7952714194054833646&item_id=7952714194054833646"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14556673452484493666&item_id=14556673452484493666"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14932770546374880219&item_id=14932770546374880219"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7620227738837613086&item_id=7620227738837613086"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8826428755688431091&item_id=8826428755688431091"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9725177383210783177&item_id=9725177383210783177"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13422069888367144937&item_id=13422069888367144937"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18098095345051972104&item_id=18098095345051972104"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6232722432777262368&item_id=6232722432777262368"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=504451189206735121&item_id=504451189206735121"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14323990942379100635&item_id=14323990942379100635"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4147150264423680634&item_id=4147150264423680634"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14153960741635893016&item_id=14153960741635893016"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6474410690889255064&item_id=6474410690889255064"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1008951687761630611&item_id=1008951687761630611"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17598895401546513434&item_id=17598895401546513434"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6587530402249353886&item_id=6587530402249353886"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2629958738711042611&item_id=2629958738711042611"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7163893596855472980&item_id=7163893596855472980"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8879035814930716641&item_id=8879035814930716641"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3332377370927590675&item_id=3332377370927590675"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=479866649361157922&item_id=479866649361157922"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5195970035734566745&item_id=5195970035734566745"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12303474748876469872&item_id=12303474748876469872"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5911643977710504348&item_id=5911643977710504348"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12231968792563392039&item_id=12231968792563392039"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12496573528388158262&item_id=12496573528388158262"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17781793388094344255&item_id=17781793388094344255"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14931264905533264479&item_id=14931264905533264479"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7166747805723663501&item_id=7166747805723663501"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8942289861415827254&item_id=8942289861415827254"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11195596493454949816&item_id=11195596493454949816"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15952089475653614376&item_id=15952089475653614376"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2118840378488578967&item_id=2118840378488578967"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9976693969190893621&item_id=9976693969190893621"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2969235264442681009&item_id=2969235264442681009"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9854311137981280955&item_id=9854311137981280955"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13046862588078092928&item_id=13046862588078092928"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4965943046089580873&item_id=4965943046089580873"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5805348952006137292&item_id=5805348952006137292"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7129315784202833978&item_id=7129315784202833978"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5087493472505128489&item_id=5087493472505128489"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5338157062233915404&item_id=5338157062233915404"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9359345329759734283&item_id=9359345329759734283"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13274135354661708795&item_id=13274135354661708795"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12655412893459202873&item_id=12655412893459202873"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15287037913138734168&item_id=15287037913138734168"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11121936815621014652&item_id=11121936815621014652"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4753175463550072053&item_id=4753175463550072053"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5043716687122026810&item_id=5043716687122026810"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7793402432562542673&item_id=7793402432562542673"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13757050073623955516&item_id=13757050073623955516"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3873463074964176943&item_id=3873463074964176943"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4684529672715195967&item_id=4684529672715195967"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14763363477592773370&item_id=14763363477592773370"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16631764316626537520&item_id=16631764316626537520"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=425809669253271723&item_id=425809669253271723"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4315183410224811970&item_id=4315183410224811970"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10685348784856882266&item_id=10685348784856882266"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7569906544700020196&item_id=7569906544700020196"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16804834322499783214&item_id=16804834322499783214"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5028896567581479250&item_id=5028896567581479250"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11776509439965144098&item_id=11776509439965144098"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14407162923135109222&item_id=14407162923135109222"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4931679423116885924&item_id=4931679423116885924"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4996956859652139295&item_id=4996956859652139295"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8963763689759433089&item_id=8963763689759433089"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16478309034147871230&item_id=16478309034147871230"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5319473150358861612&item_id=5319473150358861612"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1214664479808497934&item_id=1214664479808497934"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13433407221352113110&item_id=13433407221352113110"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1783405648500053883&item_id=1783405648500053883"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18385681067832776810&item_id=18385681067832776810"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4228970745495200646&item_id=4228970745495200646"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12199879037547736775&item_id=12199879037547736775"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17882554496747929809&item_id=17882554496747929809"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3674021796402150184&item_id=3674021796402150184"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16577054391962124687&item_id=16577054391962124687"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4271539926322101377&item_id=4271539926322101377"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5113456157678120507&item_id=5113456157678120507"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5477371412029910713&item_id=5477371412029910713"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10706437759513991522&item_id=10706437759513991522"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17853808791590129641&item_id=17853808791590129641"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6432900924165911556&item_id=6432900924165911556"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13162934245678791761&item_id=13162934245678791761"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14696577866446582743&item_id=14696577866446582743"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18156971557072958312&item_id=18156971557072958312"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=217122065343584682&item_id=217122065343584682"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=246604809699289993&item_id=246604809699289993"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16207138412390080322&item_id=16207138412390080322"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5907525691771828632&item_id=5907525691771828632"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4239109373904956465&item_id=4239109373904956465"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16826860324988315648&item_id=16826860324988315648"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7245564400030907061&item_id=7245564400030907061"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16241124762316833190&item_id=16241124762316833190"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=833554325095515734&item_id=833554325095515734"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8502458985087139043&item_id=8502458985087139043"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17510256277421136487&item_id=17510256277421136487"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4095133472506144445&item_id=4095133472506144445"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14525456352119700015&item_id=14525456352119700015"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13389375211856904033&item_id=13389375211856904033"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3535372341500469425&item_id=3535372341500469425"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12857036410816656885&item_id=12857036410816656885"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14884692310240758146&item_id=14884692310240758146"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7290344068887632180&item_id=7290344068887632180"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1406027624111609208&item_id=1406027624111609208"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1788333332156287537&item_id=1788333332156287537"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5630893942660456649&item_id=5630893942660456649"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3500873888874273739&item_id=3500873888874273739"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8653112691655676366&item_id=8653112691655676366"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10267585829106342640&item_id=10267585829106342640"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12361645943472831295&item_id=12361645943472831295"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8291624379937362738&item_id=8291624379937362738"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10239290173281043796&item_id=10239290173281043796"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14808331781478715289&item_id=14808331781478715289"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7164395150084696212&item_id=7164395150084696212"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=604826632337645573&item_id=604826632337645573"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14681019574437452920&item_id=14681019574437452920"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3589307329770293045&item_id=3589307329770293045"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4370319445655099838&item_id=4370319445655099838"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8243706717693367786&item_id=8243706717693367786"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15799482236591518488&item_id=15799482236591518488"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2953268456529236946&item_id=2953268456529236946"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16013483256342847464&item_id=16013483256342847464"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1786411093875409963&item_id=1786411093875409963"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6623241520082294130&item_id=6623241520082294130"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7985509122653331913&item_id=7985509122653331913"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3503993359295877469&item_id=3503993359295877469"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10971380804253625270&item_id=10971380804253625270"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14006496739247836432&item_id=14006496739247836432"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=390655269480130589&item_id=390655269480130589"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11312342265194067125&item_id=11312342265194067125"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1466018378572356156&item_id=1466018378572356156"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15788717886863206351&item_id=15788717886863206351"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10757160373289810606&item_id=10757160373289810606"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4509684325027792585&item_id=4509684325027792585"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14139963655144356965&item_id=14139963655144356965"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5732353583752008699&item_id=5732353583752008699"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6812976546779387836&item_id=6812976546779387836"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6861940635615313985&item_id=6861940635615313985"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10702323513133236202&item_id=10702323513133236202"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2793627141418705703&item_id=2793627141418705703"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3945333185647992304&item_id=3945333185647992304"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5108306153018307019&item_id=5108306153018307019"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5530934140913744873&item_id=5530934140913744873"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11577518612390140865&item_id=11577518612390140865"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7515389301275864568&item_id=7515389301275864568"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10351515436364292907&item_id=10351515436364292907"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15370185149351582365&item_id=15370185149351582365"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15398721654006748929&item_id=15398721654006748929"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12288900395632235750&item_id=12288900395632235750"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9851235121935904595&item_id=9851235121935904595"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16910963114846100436&item_id=16910963114846100436"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12098880564711565332&item_id=12098880564711565332"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6006509830936926329&item_id=6006509830936926329"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13134932301881946355&item_id=13134932301881946355"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11139859918003723517&item_id=11139859918003723517"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12891689908803559230&item_id=12891689908803559230"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17914417884130458427&item_id=17914417884130458427"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7824919032539995960&item_id=7824919032539995960"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16958487784903118321&item_id=16958487784903118321"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1695999153412944626&item_id=1695999153412944626"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12287962868733855626&item_id=12287962868733855626"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3467509901625506746&item_id=3467509901625506746"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9274885297707825123&item_id=9274885297707825123"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10956408652131837352&item_id=10956408652131837352"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5391018991036460529&item_id=5391018991036460529"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10474639708349309911&item_id=10474639708349309911"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17943901398888374936&item_id=17943901398888374936"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4419830223807736069&item_id=4419830223807736069"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=246589125191274910&item_id=246589125191274910"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5295324697172077667&item_id=5295324697172077667"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1341916861431472931&item_id=1341916861431472931"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12922724320313970211&item_id=12922724320313970211"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14931989750292179001&item_id=14931989750292179001"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17209779681915327927&item_id=17209779681915327927"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3758551274454697904&item_id=3758551274454697904"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6887043049886221971&item_id=6887043049886221971"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8900025552359587672&item_id=8900025552359587672"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11823039089380087361&item_id=11823039089380087361"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12220982365492154204&item_id=12220982365492154204"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14793933023841185892&item_id=14793933023841185892"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2167917402596890693&item_id=2167917402596890693"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8016650200165702829&item_id=8016650200165702829"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7045434682528744076&item_id=7045434682528744076"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11871317787672680483&item_id=11871317787672680483"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9675561753201363328&item_id=9675561753201363328"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11192725700644351179&item_id=11192725700644351179"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14593057090222226661&item_id=14593057090222226661"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15853693750193184483&item_id=15853693750193184483"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15175496548070629466&item_id=15175496548070629466"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3073601530014632774&item_id=3073601530014632774"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4121959978612018314&item_id=4121959978612018314"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7940069754548665804&item_id=7940069754548665804"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12318743556709676686&item_id=12318743556709676686"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15905076652829555212&item_id=15905076652829555212"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=577975881914559178&item_id=577975881914559178"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7956162541107794501&item_id=7956162541107794501"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4784921883569189656&item_id=4784921883569189656"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5978609667759486528&item_id=5978609667759486528"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8520401054354857401&item_id=8520401054354857401"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11772583808222907074&item_id=11772583808222907074"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13278418370026915969&item_id=13278418370026915969"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2372652154977765332&item_id=2372652154977765332"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4607620007100431209&item_id=4607620007100431209"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7879476858243035775&item_id=7879476858243035775"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2410892255388879094&item_id=2410892255388879094"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4321728972523715789&item_id=4321728972523715789"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9843583198436114968&item_id=9843583198436114968"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2784944157908838848&item_id=2784944157908838848"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6496994062317933989&item_id=6496994062317933989"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3620158434905657406&item_id=3620158434905657406"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15525269539144752047&item_id=15525269539144752047"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14819178246321532610&item_id=14819178246321532610"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9983966323062176528&item_id=9983966323062176528"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13027130760629079332&item_id=13027130760629079332"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14212354802951338890&item_id=14212354802951338890"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1182703177549493279&item_id=1182703177549493279"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18289319646116159301&item_id=18289319646116159301"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11639840560144370849&item_id=11639840560144370849"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4684229457547058273&item_id=4684229457547058273"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8509541067886542597&item_id=8509541067886542597"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8597177612382384032&item_id=8597177612382384032"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9322179308081500806&item_id=9322179308081500806"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14774147421237425658&item_id=14774147421237425658"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3773350684048591840&item_id=3773350684048591840"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3847152387613329776&item_id=3847152387613329776"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6988957181785530752&item_id=6988957181785530752"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14107195125133985766&item_id=14107195125133985766"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15999229106914432927&item_id=15999229106914432927"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6916907183055999783&item_id=6916907183055999783"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17494525244650560655&item_id=17494525244650560655"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8794490436216108230&item_id=8794490436216108230"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5752779844860047042&item_id=5752779844860047042"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9653598454445962268&item_id=9653598454445962268"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10686934068661108595&item_id=10686934068661108595"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15283165225057455043&item_id=15283165225057455043"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15980834200012891314&item_id=15980834200012891314"
                }, {
                    "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6639143505287926138&item_id=6639143505287926138"
                }, { "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13360183574057726859&item_id=13360183574057726859" }
            ];

            var articlse=[];
            [...str1].forEach((e) => {//console.log(e["url"]);
                articlse.push({ "url": e["url"], "title": e["title"], "publishTime": e["publishTime"] })
            });
            var result = [];
            for (var i = 0; i < 13; i++) {
                var arts = articlse[Math.ceil(Math.random() * articlse.length)];
                console.log(arts);
                result.push(arts);
            }
            return result;
            console.log("getVideos() end");

        }


        async function doArticleStudy() {
            console.log("开始文章阅读：doArticleStudy() start")
            var articles = await getArticles();
            articles.forEach(item => console.log(item));
            /*articles.sort(function(){
            return Math.random() - 0.5
            })*/
            var i = 0;
            var scores = await getScores();
            if (debug) {
                console.log(scores);
            }
            var num = Math.ceil((scores.article.dayMaxScore - scores.article.dayScore) / 2) + 1
            while (num >= 0) {

                //console.log(scores.article_num.dayScore);
                //console.log(scores.article_num.dayMaxScore);
                //console.log(scores.article_time.dayScore);
                //console.log(scores.article_time.dayMaxScore);
                //if (scores.article.dayScore < scores.article.dayMaxScore) {
                var readarticle_time = 40 + (Math.ceil(Math.random() * 20) + 5);
                if (debug) {
                    console.log("readarticle_time:" + readarticle_time);
                }
                var win = window.open(articles[i].url, articles[i].title);
                console.log("第" + num + "篇文章：articles_url:" + articles[i].url, "articles_title:" + articles[i].title)
                //for (var j = 0; j < 2; j++) {
                //if (Math.random() > 0.3) {
                await delay()
                var height = win.document.body.clientHeight / 2;
                win.window.scrollTo(0, height);
                //}
                await sleep(readarticle_time * 1000);
                //console.log(j);
                //}

                win.close();
                num--;
                i++;
                //} else {
                // break;
                //}
            }
            console.log("文章学习完成！doArticleStudy() end")
        }


        function sleep(ms) {
            //console.log(timers)
            timers.map(timer => { clearTimeout(timer) })
            timers = []
            return new Promise((resolve) => {
                var timer = setTimeout(resolve, ms)
                //console.log(timers)
            });
        }

        async function getArticles() {
            // console.log("getArticles() start")
            // let { data, error } = await supa
            // .from('xuexi-articles-test')
            // .select('id')

            // let ids = data.sort(function () {
            // return Math.random() - 0.5
            // }).slice(0, 20).map(id => {
            // return id.id
            // })

            // let response = await supa
            // .from('xuexi-articles-test')
            // .select('article')
            // .in('id', ids)

            // let result = response.data.map(article => {
            // return article.article
            // })

            // if (debug) {
            // console.log(result)
            // }
            // console.log("getArticles() end")
            console.log("读取文章列表开始：getArticles() start")
            //str1/str2数据来源：
            //https://www.xuexi.cn/lgdata/2rjuh3kn0ahm.json?_st=26990568
            //https://www.xuexi.cn/lgdata/35qt2rpnnjpg.json?_st=26990556
            //https://www.xuexi.cn/lgdata/2rjuh3kn0ahm.json?_st=26990568
            //https://www.xuexi.cn/lgdata/34t16n4073d2.json?_st=26990568
            //https://www.xuexi.cn/lgdata/31udoplf85ng.json?_st=26990568
            //https://www.xuexi.cn/lgdata/1crqb964p71.json?_st=26990572
            var articlse = [];
            let str1 = [{
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6362555010920796981&item_id=6362555010920796981"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17042028567493884922&item_id=17042028567493884922"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9367897986102175009&item_id=9367897986102175009"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2195247234288774324&item_id=2195247234288774324"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17359753104077402165&item_id=17359753104077402165"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5987445204645053784&item_id=5987445204645053784"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12136158411990784667&item_id=12136158411990784667"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6407370358901581365&item_id=6407370358901581365"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6694205915925759773&item_id=6694205915925759773"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5901951185316110654&item_id=5901951185316110654"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6405427922995236292&item_id=6405427922995236292"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1436656064160918195&item_id=1436656064160918195"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7153626773315865695&item_id=7153626773315865695"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18375703870063320697&item_id=18375703870063320697"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3696921327024148193&item_id=3696921327024148193"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8055869727896605747&item_id=8055869727896605747"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13729232638846677605&item_id=13729232638846677605"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14403367951380003224&item_id=14403367951380003224"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9527473057058036670&item_id=9527473057058036670"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6538343817491085341&item_id=6538343817491085341"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16251080088761490790&item_id=16251080088761490790"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6993102237392443050&item_id=6993102237392443050"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5316970377778419295&item_id=5316970377778419295"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13760317579195012966&item_id=13760317579195012966"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4146291735072009669&item_id=4146291735072009669"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14762116481434454549&item_id=14762116481434454549"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12052243771612013210&item_id=12052243771612013210"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10931338041503051867&item_id=10931338041503051867"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=634525639881416007&item_id=634525639881416007"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2320162121189115070&item_id=2320162121189115070"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6970929583436971580&item_id=6970929583436971580"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2103096623167902175&item_id=2103096623167902175"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3512082495512229855&item_id=3512082495512229855"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=550358880215477203&item_id=550358880215477203"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8740069374602587887&item_id=8740069374602587887"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15631894130557119610&item_id=15631894130557119610"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12138763302114478777&item_id=12138763302114478777"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10575896204551108344&item_id=10575896204551108344"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5023313763362022772&item_id=5023313763362022772"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16474782338289377804&item_id=16474782338289377804"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10115729056119113844&item_id=10115729056119113844"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15695687824576035817&item_id=15695687824576035817"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16951480997015824468&item_id=16951480997015824468"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6822714688544136101&item_id=6822714688544136101"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4030419708537203076&item_id=4030419708537203076"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6206957799316865116&item_id=6206957799316865116"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1771083512163448527&item_id=1771083512163448527"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12332159790924244967&item_id=12332159790924244967"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5611982816252965204&item_id=5611982816252965204"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3777633110497767660&item_id=3777633110497767660"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2829009936019824801&item_id=2829009936019824801"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5675051634143552412&item_id=5675051634143552412"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3613178495570922974&item_id=3613178495570922974"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17018534431318241878&item_id=17018534431318241878"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14172086643613846607&item_id=14172086643613846607"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17309007551773747136&item_id=17309007551773747136"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3503556115649920885&item_id=3503556115649920885"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12447724646729806591&item_id=12447724646729806591"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9524705693944124831&item_id=9524705693944124831"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13076594421166699393&item_id=13076594421166699393"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1720834663623524561&item_id=1720834663623524561"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15442259633041114686&item_id=15442259633041114686"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9408582739979891496&item_id=9408582739979891496"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3562490616301215863&item_id=3562490616301215863"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10372774370381418773&item_id=10372774370381418773"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17133484299903637808&item_id=17133484299903637808"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15512305906634813807&item_id=15512305906634813807"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2242129409244597814&item_id=2242129409244597814"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17460178561964599092&item_id=17460178561964599092"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10092185214276250918&item_id=10092185214276250918"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14273820174038979427&item_id=14273820174038979427"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18284213472008358342&item_id=18284213472008358342"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11985537033964510462&item_id=11985537033964510462"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2154574097220883503&item_id=2154574097220883503"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14189926775213166605&item_id=14189926775213166605"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=708220089266940622&item_id=708220089266940622"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2514686252191868141&item_id=2514686252191868141"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7028757341138647136&item_id=7028757341138647136"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6191443115390172716&item_id=6191443115390172716"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6662933757066583780&item_id=6662933757066583780"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14731275602324830193&item_id=14731275602324830193"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1006800460032601755&item_id=1006800460032601755"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13033556241179746910&item_id=13033556241179746910"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17080086432340842461&item_id=17080086432340842461"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17092006516880780169&item_id=17092006516880780169"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17894890838674815289&item_id=17894890838674815289"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4869549673314874347&item_id=4869549673314874347"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7932443987943459815&item_id=7932443987943459815"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=166302445160804117&item_id=166302445160804117"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18425997442098896590&item_id=18425997442098896590"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9532868197287436280&item_id=9532868197287436280"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6046490713307098771&item_id=6046490713307098771"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8542910189331262402&item_id=8542910189331262402"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5457580439902304368&item_id=5457580439902304368"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12353823732465920893&item_id=12353823732465920893"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3721910945158637112&item_id=3721910945158637112"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16847588646288929704&item_id=16847588646288929704"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9678676375871502593&item_id=9678676375871502593"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8845467023466107202&item_id=8845467023466107202"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9775316357665217373&item_id=9775316357665217373"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9630264506816467197&item_id=9630264506816467197"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8660765562004602163&item_id=8660765562004602163"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10489486041386085758&item_id=10489486041386085758"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6142095031556447210&item_id=6142095031556447210"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14654278923482434373"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9343741817529623767"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16730743897360078069&item_id=16730743897360078069"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3535145793568463478&item_id=3535145793568463478"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1606211816050130336&item_id=1606211816050130336"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=900946372013352926&item_id=900946372013352926"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3040363947477503234&item_id=3040363947477503234"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16906157614536539395&item_id=16906157614536539395"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3607104602414659556&item_id=3607104602414659556"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4910641974484598684&item_id=4910641974484598684"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18083914301811476450&item_id=18083914301811476450"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10269212295595247710&item_id=10269212295595247710"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15452574294374374677&item_id=15452574294374374677"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12275281004853274508&item_id=12275281004853274508"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2938550669012607422&item_id=2938550669012607422"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15903653661208167753&item_id=15903653661208167753"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17091389719856695640&item_id=17091389719856695640"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7347420206565731928&item_id=7347420206565731928"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6834839493299729588&item_id=6834839493299729588"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9331366344723888789&item_id=9331366344723888789"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11079361168096694675&item_id=11079361168096694675"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2810936441513915546&item_id=2810936441513915546"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9675932584480658031&item_id=9675932584480658031"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16150277933604372250&item_id=16150277933604372250"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3350593947114403679&item_id=3350593947114403679"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7567795877704767611&item_id=7567795877704767611"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1311321225282628186&item_id=1311321225282628186"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3122455447425383197&item_id=3122455447425383197"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14218463112728193607&item_id=14218463112728193607"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11380794079936804024&item_id=11380794079936804024"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8196719374964058073&item_id=8196719374964058073"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1458122900257828485&item_id=1458122900257828485"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6246382598177632998&item_id=6246382598177632998"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=176882727474237935&item_id=176882727474237935"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14126746336539022265&item_id=14126746336539022265"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16001617505134917249&item_id=16001617505134917249"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14369815387007396533&item_id=14369815387007396533"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4049429993182886392&item_id=4049429993182886392"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11755947957192044607&item_id=11755947957192044607"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3333222071504567037&item_id=3333222071504567037"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=779300708390991875&item_id=779300708390991875"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18287121091741260725&item_id=18287121091741260725"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2007256389145417633&item_id=2007256389145417633"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11518944430180264147&item_id=11518944430180264147"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12373125956482961558&item_id=12373125956482961558"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11872379783854812777&item_id=11872379783854812777"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11925719906145883503&item_id=11925719906145883503"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18273773891479357018&item_id=18273773891479357018"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15202748390517238110&item_id=15202748390517238110"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9373474680580275815&item_id=9373474680580275815"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12571718612262039647&item_id=12571718612262039647"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1858244396613040618&item_id=1858244396613040618"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4949614639362583843&item_id=4949614639362583843"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6635476749877426937&item_id=6635476749877426937"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8058855700336308394&item_id=8058855700336308394"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9140672239882197068&item_id=9140672239882197068"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=993842020719927475&item_id=993842020719927475"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10932542612203468474&item_id=10932542612203468474"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16442874304020369135&item_id=16442874304020369135"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16704560374336625296&item_id=16704560374336625296"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6659363654439155731&item_id=6659363654439155731"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15534405563578974829&item_id=15534405563578974829"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12847119914696929506&item_id=12847119914696929506"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16707755198678215085&item_id=16707755198678215085"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5851420167908259897&item_id=5851420167908259897"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=666697199947911257&item_id=666697199947911257"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7409740569607236847&item_id=7409740569607236847"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7610380713305472531&item_id=7610380713305472531"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16812942900378328197&item_id=16812942900378328197"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4946023627407165190&item_id=4946023627407165190"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17188019379137255833&item_id=17188019379137255833"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7406746870194296251&item_id=7406746870194296251"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8924501292103721663&item_id=8924501292103721663"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12717156227705389636&item_id=12717156227705389636"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8088560673345086337&item_id=8088560673345086337"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16966010128763833073&item_id=16966010128763833073"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13151793517288003479&item_id=13151793517288003479"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3285057165934613300&item_id=3285057165934613300"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10761945658009267857&item_id=10761945658009267857"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2013309198322803077&item_id=2013309198322803077"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8232900629896633627&item_id=8232900629896633627"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17190007784315490676&item_id=17190007784315490676"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1243118007152997277&item_id=1243118007152997277"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4247426215383554338&item_id=4247426215383554338"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15828428907315130052&item_id=15828428907315130052"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8534925599052687729&item_id=8534925599052687729"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2127390671479954363&item_id=2127390671479954363"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17763607518224190986&item_id=17763607518224190986"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15982126021529827911&item_id=15982126021529827911"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18137228655547489691&item_id=18137228655547489691"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9284239873057573896&item_id=9284239873057573896"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13616469399869517973&item_id=13616469399869517973"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9776828927978957384&item_id=9776828927978957384"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6999662004933552532&item_id=6999662004933552532"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2711953719519433389&item_id=2711953719519433389"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7844305003435792612&item_id=7844305003435792612"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3344838213809240044&item_id=3344838213809240044"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7230896328573701748&item_id=7230896328573701748"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6601644247935112757&item_id=6601644247935112757"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17170102478862074201&item_id=17170102478862074201"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17219536784757815339&item_id=17219536784757815339"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7220761831529739583&item_id=7220761831529739583"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8089153787029892934&item_id=8089153787029892934"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=22809783695466044&item_id=22809783695466044"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10294374316818528165&item_id=10294374316818528165"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11739831261632766110&item_id=11739831261632766110"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15888293947448995161&item_id=15888293947448995161"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9623844700370076399&item_id=9623844700370076399"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11002529725913301999&item_id=11002529725913301999"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10686456795025348397&item_id=10686456795025348397"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7662755056173911668&item_id=7662755056173911668"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13121788437411173552&item_id=13121788437411173552"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9333156080545074426&item_id=9333156080545074426"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18350735085896958003&item_id=18350735085896958003"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1866726588073645575&item_id=1866726588073645575"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10355574415450169979&item_id=10355574415450169979"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6030649431054193264&item_id=6030649431054193264"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=314193120537403665&item_id=314193120537403665"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16585017029808551646&item_id=16585017029808551646"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15076704914066278519&item_id=15076704914066278519"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16179517738041365877&item_id=16179517738041365877"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9859734177289897113&item_id=9859734177289897113"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13192780895710938221&item_id=13192780895710938221"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1708566020405855602&item_id=1708566020405855602"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2798794238960236986&item_id=2798794238960236986"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6535552163033391410"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13123576510224536618&item_id=13123576510224536618"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4038951322451815465&item_id=4038951322451815465"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=630214069101359245&item_id=630214069101359245"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3311560931279288750&item_id=3311560931279288750"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5342052972402850567&item_id=5342052972402850567"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=571623939165899183"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6639616008831893936&item_id=6639616008831893936"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4425949832118781232&item_id=4425949832118781232"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13294206662812044376&item_id=13294206662812044376"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3287466640640170007&item_id=3287466640640170007"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12945195029814462433&item_id=12945195029814462433"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16544512552905082947&item_id=16544512552905082947"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2298146960863130840&item_id=2298146960863130840"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7810545514077710722&item_id=7810545514077710722"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=811652255979685498"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3651427157997001291&item_id=3651427157997001291"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12834864196326824230&item_id=12834864196326824230"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1099119152614536369&item_id=1099119152614536369"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3595360142501415124&item_id=3595360142501415124"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=778079987084643648&item_id=778079987084643648"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9020454838521223213&item_id=9020454838521223213"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18197426598300796725&item_id=18197426598300796725"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13883524830603747036"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3909408815927904665"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11238724427693576199&item_id=11238724427693576199"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8319552839542957194&item_id=8319552839542957194"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7254127553255037045&item_id=7254127553255037045"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16665928669873402564&item_id=16665928669873402564"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1622228125960664476&item_id=1622228125960664476"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=102145428476369393&item_id=102145428476369393"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17242958732422732425&item_id=17242958732422732425"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13435424551557018796&item_id=13435424551557018796"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16056139293745284889&item_id=16056139293745284889"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13501632790503327430&item_id=13501632790503327430"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=496536777711805279&item_id=496536777711805279"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15492724319087091981&item_id=15492724319087091981"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3338066799758425505&item_id=3338066799758425505"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=662520567332102331&item_id=662520567332102331"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2808633720497844364&item_id=2808633720497844364"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3476890094480736903&item_id=3476890094480736903"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2958667759565609186&item_id=2958667759565609186"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2954149826848206831&item_id=2954149826848206831"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15634659363330680426&item_id=15634659363330680426"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4186061353604872080&item_id=4186061353604872080"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3780385498767962071&item_id=3780385498767962071"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3774854492086891980&item_id=3774854492086891980"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12334775399298387545&item_id=12334775399298387545"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3988257153256835509&item_id=3988257153256835509"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6598744967923567408&item_id=6598744967923567408"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14111665220929364267&item_id=14111665220929364267"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7582318995994270764&item_id=7582318995994270764"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16785263462268017631&item_id=16785263462268017631"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11934981416616138094&item_id=11934981416616138094"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6955975669405786838&item_id=6955975669405786838"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4238482740251515985&item_id=4238482740251515985"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4730408148461862312&item_id=4730408148461862312"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14002912379291338724&item_id=14002912379291338724"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14804421768230283894&item_id=14804421768230283894"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6750020369248006977&item_id=6750020369248006977"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3081337839708882771&item_id=3081337839708882771"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5735054750759582930&item_id=5735054750759582930"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3959072247865001629&item_id=3959072247865001629"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5386797131381841428&item_id=5386797131381841428"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15017202129637118493&item_id=15017202129637118493"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16057801861372495284&item_id=16057801861372495284"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15662112244554338572&item_id=15662112244554338572"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3001670371353194640&item_id=3001670371353194640"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18024872203585539800&item_id=18024872203585539800"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=624677281723412976&item_id=624677281723412976"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11289336605101358586&item_id=11289336605101358586"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8239418201447032735&item_id=8239418201447032735"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4530420808128895716&item_id=4530420808128895716"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=978175599227821450&item_id=978175599227821450"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=723478460171410946&item_id=723478460171410946"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15543397870829596167&item_id=15543397870829596167"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15907395161913423424&item_id=15907395161913423424"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1946499016143065672&item_id=1946499016143065672"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7803267150770740424&item_id=7803267150770740424"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12499229653270662649&item_id=12499229653270662649"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9082842777855933033&item_id=9082842777855933033"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7154787509122191046&item_id=7154787509122191046"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9502379483896878624&item_id=9502379483896878624"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15592421776296283090&item_id=15592421776296283090"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7766078508390675601&item_id=7766078508390675601"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15833402238513931726&item_id=15833402238513931726"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16249629488640433497&item_id=16249629488640433497"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8111262654075986237&item_id=8111262654075986237"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5596965998676655012&item_id=5596965998676655012"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1283193949234337189&item_id=1283193949234337189"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13595386395720321354&item_id=13595386395720321354"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12733334817695511953&item_id=12733334817695511953"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14975456415816239367&item_id=14975456415816239367"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11023997229737770095&item_id=11023997229737770095"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16849395499868438609&item_id=16849395499868438609"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5467527518099225495&item_id=5467527518099225495"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6312899176960784487&item_id=6312899176960784487"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10427888735557367064&item_id=10427888735557367064"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14370714474862665623&item_id=14370714474862665623"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12677260855150365302&item_id=12677260855150365302"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12289262508932562589&item_id=12289262508932562589"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3300309551597939105&item_id=3300309551597939105"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8666198967583352641&item_id=8666198967583352641"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14265383242630188318&item_id=14265383242630188318"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9289963038968851684&item_id=9289963038968851684"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18042963086682697987&item_id=18042963086682697987"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18055593660675424984"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13967364811354852738"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5165340258821406822"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7066153219093225523"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=859931103194831711"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=440842791218955971"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15895772328476844234"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12006644061612097796"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11046121344035468038"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12453754147369326033&item_id=12453754147369326033"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4034195909467241254"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12110817675859833734"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11335824452397876980&item_id=11335824452397876980"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6971849084810120883"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4367394010088422419&item_id=4367394010088422419"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12110446168500879054"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13838023553675032431"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5173683455580557247&item_id=5173683455580557247"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11284026273978758620"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7472612441421702913&item_id=7472612441421702913"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17200045154064946593&item_id=17200045154064946593"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9136803655510708222"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6896851545711002244&item_id=6896851545711002244"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17215278549121390772"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13547889206475552946"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8760644872286864443"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15094525398000018070&item_id=15094525398000018070"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11087688391745702875"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12836727398142224154&item_id=12836727398142224154"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9305753746046481811&item_id=9305753746046481811"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12921685322884569873"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12909208667084954196"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15548692872113735431"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15802124763450436692"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3077017118236813375"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8071765929783890108"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17090988623649324188&item_id=17090988623649324188"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16615112298234745661&item_id=16615112298234745661"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9263874592133784818&item_id=9263874592133784818"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7523060542535725830&item_id=7523060542535725830"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6378126832723101200&item_id=6378126832723101200"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14887662328758235182&item_id=14887662328758235182"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16789588797417075232&item_id=16789588797417075232"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5097526664035814010&item_id=5097526664035814010"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17263064727508867511&item_id=17263064727508867511"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1939863516073570269&item_id=1939863516073570269"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4206758498457880454&item_id=4206758498457880454"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11793811594098390628"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17085422339518609396&item_id=17085422339518609396"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17264091910665180475&item_id=17264091910665180475"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17930251876520906842&item_id=17930251876520906842"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6609982190371267690&item_id=6609982190371267690"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17140215704017848184&item_id=17140215704017848184"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4199079107644328344"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9672283053929885730&item_id=9672283053929885730"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14349454370770266679&item_id=14349454370770266679"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11893056953608094802&item_id=11893056953608094802"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14454964840275697967&item_id=14454964840275697967"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15249738438080241821&item_id=15249738438080241821"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14935679484732781728&item_id=14935679484732781728"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11432170478402368822&item_id=11432170478402368822"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4805352014910163645&item_id=4805352014910163645"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14825024347492965533&item_id=14825024347492965533"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5706445049022268470&item_id=5706445049022268470"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16831850967182071000&item_id=16831850967182071000"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7379683622707754293&item_id=7379683622707754293"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1610313993065084442&item_id=1610313993065084442"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11598970794344497909&item_id=11598970794344497909"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9165193451525274546&item_id=9165193451525274546"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17944463248845043517&item_id=17944463248845043517"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9798462900650464916&item_id=9798462900650464916"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13873968529965914272&item_id=13873968529965914272"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17940204277544925804&item_id=17940204277544925804"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3554093829887182579&item_id=3554093829887182579"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15249944143549231110&item_id=15249944143549231110"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12343030342460875257&item_id=12343030342460875257"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1974221531588917430&item_id=1974221531588917430"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8171822712953907857&item_id=8171822712953907857"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2667902287649855176&item_id=2667902287649855176"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3015449707661795929&item_id=3015449707661795929"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=788227454307476582&item_id=788227454307476582"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5151733806691657934&item_id=5151733806691657934"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8348752320053389940&item_id=8348752320053389940"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13627535490113367612&item_id=13627535490113367612"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11506657343116208603&item_id=11506657343116208603"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15672444975213091872&item_id=15672444975213091872"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9375977339741416764&item_id=9375977339741416764"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3725629267822824550&item_id=3725629267822824550"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2965135065448012536&item_id=2965135065448012536"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10437033699781382201&item_id=10437033699781382201"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18112477762919921941&item_id=18112477762919921941"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8799949905507011958&item_id=8799949905507011958"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11099602190373965143&item_id=11099602190373965143"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9663744837052357098&item_id=9663744837052357098"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=836950572457828943&item_id=836950572457828943"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16710523194402828136&item_id=16710523194402828136"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17875526499580804328&item_id=17875526499580804328"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17929519460499737192&item_id=17929519460499737192"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17042423036632376234&item_id=17042423036632376234"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4650667775136698712&item_id=4650667775136698712"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12300376175274096435"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17131890785810252692&item_id=17131890785810252692"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2747666795855929884&item_id=2747666795855929884"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17549834557930416398&item_id=17549834557930416398"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15083106100350530396&item_id=15083106100350530396"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7453620951024119117&item_id=7453620951024119117"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1642840898317285765&item_id=1642840898317285765"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2132951675728597362&item_id=2132951675728597362"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9772439578731334961&item_id=9772439578731334961"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18002768838517570734&item_id=18002768838517570734"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6943909366938776337"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1075693093630649208&item_id=1075693093630649208"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17957361638509401669&item_id=17957361638509401669"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=457109943665747562&item_id=457109943665747562"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=520165579240534202&item_id=520165579240534202"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7718274148473597942&item_id=7718274148473597942"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5423314753087894060&item_id=5423314753087894060"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1368793794717750395&item_id=1368793794717750395"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4507393306448916314&item_id=4507393306448916314"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4126478674319108902&item_id=4126478674319108902"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13683960877501092056&item_id=13683960877501092056"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10495527223999383414"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8732895225397129813"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10535649316110478367"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7356666857020804952"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14917522604817671544"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12385461683312150539"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2622485054478087838"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15790803575701947968"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16279378969322351399&item_id=16279378969322351399"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16163825797579097128&item_id=16163825797579097128"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7554907149946133098&item_id=7554907149946133098"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5665184309975178267&item_id=5665184309975178267"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1890474293743284816&item_id=1890474293743284816"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2761839118672377301&item_id=2761839118672377301"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14673905442172725772"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4857945869856824047&item_id=4857945869856824047"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2314355822086179279&item_id=2314355822086179279"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7163264732213710917&item_id=7163264732213710917"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17826327655032694620"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3514843084301510796&item_id=3514843084301510796"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7250523358532680238&item_id=7250523358532680238"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16025721261239537157&item_id=16025721261239537157"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12039899432712371402&item_id=12039899432712371402"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17474097707509266547&item_id=17474097707509266547"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10271437243676677646&item_id=10271437243676677646"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12292633243132934106&item_id=12292633243132934106"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16327089357961482772&item_id=16327089357961482772"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13076337250496574289&item_id=13076337250496574289"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11084798184734116809&item_id=11084798184734116809"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11992018237411541330&item_id=11992018237411541330"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12310680883373226326&item_id=12310680883373226326"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8443987986173729602&item_id=8443987986173729602"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=474988192306213749&item_id=474988192306213749"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18108635806017975291"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17022571380487131595&item_id=17022571380487131595"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15332184747496916171&item_id=15332184747496916171"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9987703799698938067&item_id=9987703799698938067"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1564037809799246589&item_id=1564037809799246589"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4488475365603852628&item_id=4488475365603852628"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3226392439259711989&item_id=3226392439259711989"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6418169802916711467&item_id=6418169802916711467"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12471842936572395980&item_id=12471842936572395980"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2144002741924808572&item_id=2144002741924808572"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6003404821728372463&item_id=6003404821728372463"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9203186945873323264&item_id=9203186945873323264"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6594878409813448327&item_id=6594878409813448327"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4317881407433822609&item_id=4317881407433822609"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14151842503647972483&item_id=14151842503647972483"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12529092731700004855&item_id=12529092731700004855"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13331634694228335699&item_id=13331634694228335699"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3845881121787352842&item_id=3845881121787352842"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2667682194968646013"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3905356975642175799"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=18431222965386362345"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10937740295371983210&item_id=10937740295371983210"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3710229273209577446"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1416490035035453569&item_id=1416490035035453569"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5721869126187029267&item_id=5721869126187029267"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=897155263263338214&item_id=897155263263338214"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16996825599015282454&item_id=16996825599015282454"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11508776446040970913&item_id=11508776446040970913"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11639052599737590153&item_id=11639052599737590153"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7941489223309686813&item_id=7941489223309686813"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8062209344101036221&item_id=8062209344101036221"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16138040532364007878&item_id=16138040532364007878"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8276022702942860550"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=5714761636031190909"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11940716437506738353&item_id=11940716437506738353"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4546515949521540584&item_id=4546515949521540584"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17192454702871810229"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16869248047689740235&item_id=16869248047689740235"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4539633476483846930&item_id=4539633476483846930"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15909818994096886421&item_id=15909818994096886421"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8597871042695032627&item_id=8597871042695032627"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1248435310675916356&item_id=1248435310675916356"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2901008793676200999&item_id=2901008793676200999"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8216622765705712324&item_id=8216622765705712324"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12774437969036134667&item_id=12774437969036134667"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15530293351864298750&item_id=15530293351864298750"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8913018070711849904&item_id=8913018070711849904"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8628114996933935125&item_id=8628114996933935125"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13097891525541377543&item_id=13097891525541377543"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17169747546139638844&item_id=17169747546139638844"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6049959018737973349&item_id=6049959018737973349"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11615419164644569166&item_id=11615419164644569166"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2933857312966155677&item_id=2933857312966155677"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4629267122526360647&item_id=4629267122526360647"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7131468158344003287&item_id=7131468158344003287"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2802573153125951925&item_id=2802573153125951925"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12451321806575989568&item_id=12451321806575989568"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9490021219358755182&item_id=9490021219358755182"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6749191468230699776&item_id=6749191468230699776"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14103725220641627271&item_id=14103725220641627271"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=686869177526333934&item_id=686869177526333934"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=13260344034781243558&item_id=13260344034781243558"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2842704090439073399&item_id=2842704090439073399"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1927186001131674790&item_id=1927186001131674790"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16388443221234849589&item_id=16388443221234849589"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15189080812316181893&item_id=15189080812316181893"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=11920334044110983133&item_id=11920334044110983133"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7954160110037706740&item_id=7954160110037706740"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=4747130658086640640&item_id=4747130658086640640"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8896862810606344022&item_id=8896862810606344022"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1834318695269934036&item_id=1834318695269934036"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1301924080803520718&item_id=1301924080803520718"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14183053521074868132&item_id=14183053521074868132"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9993064121517257252&item_id=9993064121517257252"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3128519971992082147&item_id=3128519971992082147"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=15251873897818721474&item_id=15251873897818721474"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8291367047205960209&item_id=8291367047205960209"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9500129113899366339&item_id=9500129113899366339"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17837944646055148983&item_id=17837944646055148983"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8570836090034845705&item_id=8570836090034845705"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=1398370649344413362&item_id=1398370649344413362"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2583089636662419774&item_id=2583089636662419774"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=17123365429455979982&item_id=17123365429455979982"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16471169471000025741&item_id=16471169471000025741"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8380265790436652776&item_id=8380265790436652776"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8739694044550689366&item_id=8739694044550689366"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10256538707602653434&item_id=10256538707602653434"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10147063063025110819&item_id=10147063063025110819"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8483371666701902501&item_id=8483371666701902501"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3923208074574065132&item_id=3923208074574065132"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14362607232036314155&item_id=14362607232036314155"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=9758563945309159631&item_id=9758563945309159631"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16814636688582548780&item_id=16814636688582548780"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=7501494747569041670&item_id=7501494747569041670"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6793129557056468788&item_id=6793129557056468788"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3510518445346561059&item_id=3510518445346561059"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2026588952562172894&item_id=2026588952562172894"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8919187278143951984&item_id=8919187278143951984"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=12819985223450251166&item_id=12819985223450251166"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6299583898040617516&item_id=6299583898040617516"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=3048025128512187591&item_id=3048025128512187591"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=10320463968305991341&item_id=10320463968305991341"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6285184532128213762&item_id=6285184532128213762"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=6545438413160579188&item_id=6545438413160579188"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=14142629612196251593&item_id=14142629612196251593"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2756919854178070459&item_id=2756919854178070459"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=2758710944891105201&item_id=2758710944891105201"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=16940869538548112882&item_id=16940869538548112882"
            }, {
                "url": "https://www.xuexi.cn/lgpage/detail/index.html?id=8182805603650555514&item_id=8182805603650555514"
            }];
            var articlse=[];

            [...str1].forEach((e) => {//console.log(e["url"]);
                articlse.push({ "url": e["url"], "title": "title", "publishTime": "publishTime" })
            });
            var result = [];
            for (var i = 0; i < 13; i++) {
                var arts = articlse[Math.ceil(Math.random() * articlse.length)];
                console.log(arts);
                result.push(arts);
            }
            return result;
            console.log("读取文章列表结束：getArticles() end");


        }


        async function getScores() {
            console.log("获取积分开始：getScores() start")
            var scores = GMgetValue("scores", {})
            if (debug) {
                console.log(scores);
            }
            console.log("获取积分结束：getScores() end")
            return scores;
        }


        /*function getTotalScore() {
        var scores = GMgetValue("scores", {})
        return scores;
        }*/


        function getDayScore() {
            console.log("获取当日积分开始：getDayScore() start")
            var scores = GMgetValue("scores", {})
            console.log("获取当日积分结束：getDayScore() end")
            return scores;
        }

        async function parseScoreDocument() {
            var datt = new Date();
            console.log(datt + "解析积分页面开始：parseScoreDocument() start")
            var scores = {};
            scores.totalScore = $jq("span.my-points-points.my-points-red").text();
            var cards = $jq("div.my-points-card-text");
            var length = cards.length;
            var retryNum = 20
            while (retryNum > 0 && length == 0) {
                cards = $jq("div.my-points-card-text");
                length = cards.length;
                if (length > 0) {
                    break;
                }
                if (debug) {
                    console.log(length)
                }
                await sleep(5000)
                retryNum--;
            }

            /*for (var i = 0; i < length; i++) {
            console.log($jq(cards[i]).text());
            }*/
            var loginScoreText = $jq(cards[0]).text();
            var dayScore_login = parseInt(loginScoreText.split("/")[0].substring(0, 1));
            var dayMaxScore_login = parseInt(loginScoreText.split("/")[1].substring(0, 1));

            var articleScoreText = $jq(cards[1]).text();
            var dayScore_article = parseInt(articleScoreText.split("/")[0].substring(0, articleScoreText.split("/")[0].indexOf("分")));
            var dayMaxScore_article = parseInt(articleScoreText.split("/")[1].substring(0, articleScoreText.split("/")[1].indexOf("分")));

            var videoNumScoreText = $jq(cards[2]).text();
            var dayScore_videoNum = parseInt(videoNumScoreText.split("/")[0].substring(0, 1));
            var dayMaxScore_videoNum = parseInt(videoNumScoreText.split("/")[1].substring(0, 1));

            var videoTimeScoreText = $jq(cards[3]).text();
            var dayScore_videoTime = parseInt(videoTimeScoreText.split("/")[0].substring(0, 1));
            var dayMaxScore_videoTime = parseInt(videoTimeScoreText.split("/")[1].substring(0, 1));

            var dailyScoreText = $jq(cards[4]).text();
            var dayScore_daily = parseInt(dailyScoreText.split("/")[0].substring(0, 1));
            var dayMaxScore_daily = parseInt(dailyScoreText.split("/")[1].substring(0, 1));

            var weeklyScoreText = $jq(cards[5]).text();
            var dayScore_weekly = parseInt(weeklyScoreText.split("/")[0].substring(0, 1));
            var dayMaxScore_weekly = parseInt(weeklyScoreText.split("/")[1].substring(0, 1));

            var zhuanxiangScoreText = $jq(cards[6]).text();
            var dayScore_zhuanxiang = parseInt(zhuanxiangScoreText.split("/")[0].substring(0, zhuanxiangScoreText.split("/")[0].indexOf("分")));
            var dayMaxScore_zhuanxiang = parseInt(zhuanxiangScoreText.split("/")[1].substring(0, zhuanxiangScoreText.split("/")[1].indexOf("分")));


            scores.login = { dayScore: dayScore_login, dayMaxScore: dayMaxScore_login } // 登陆
            scores.article = { dayScore: dayScore_article, dayMaxScore: dayMaxScore_article }
            scores.video_num = { dayScore: dayScore_videoNum, dayMaxScore: dayMaxScore_videoNum }

            scores.video_time = { dayScore: dayScore_videoTime, dayMaxScore: dayMaxScore_videoTime } // 视听学习时长
            scores.daily = { dayScore: dayScore_daily, dayMaxScore: dayMaxScore_daily } // 每日答题
            scores.weekly = { dayScore: dayScore_weekly, dayMaxScore: dayMaxScore_weekly } // 每周答题
            scores.zhuanxiang = { dayScore: dayScore_zhuanxiang, dayMaxScore: dayMaxScore_zhuanxiang } // 专项答题
            GMsetValue("scores", scores);

            console.log("解析积分页面结束：parseScoreDocument() end，解析结果如下对象内容。")
            if (debug) {
                console.log(scores)
            }
        }

        function xiangshidu(str1, str2) {
            var len1 = str1.length;
            var len2 = str2.length;
            var arr = [];
            for (var y = 0; y <= len1; y++)
                arr[y] = [y];
            for (var x = 1; x <= len2; x++)
                arr[0][x] = x;
            for (var y = 1; y <= len1; y++) {
                for (var x = 1; x <= len2; x++) {
                    arr[y][x] = Math.min(
                        arr[y - 1][x] + 1,
                        arr[y][x - 1] + 1,
                        arr[y - 1][x - 1] + (str1[y - 1] == str2[x - 1] ? 0 : 1)
                    );
                }
            }
            return 1 - arr[len1][len2] / Math.max(len1, len2);
        }



        // 加菜单====================================================================
        function addStyle(cssText) {
            let a = document.createElement('style');
            a.textContent = cssText;
            let doc = document.head || document.documentElement;
            doc.appendChild(a);
        }

        function GMgetValue(name, defaultValue) {
            return GM_getValue(name, defaultValue)
        }

        function GMsetValue(name, value) {
            GM_setValue(name, value)
        }


        /**
        * 主界面 组件
        */
        const comMain = {
            template: `<div id="crackVIPSet" ref="crackVIPSet" :style="styleTop">
<div id="nav">
<button >☑</button>
</div>
<div id="list">
<div style="position:relative;top:0px;">
<b v-for="(key,index) in Object.keys(settings)" :key="index">
<label>
<input v-model="settings[key].value" @change="changeSetting(key)" type="checkbox">
<span>{{settings[key].name}}</span>
</label>
</b>
</div>
</div>

</div>`,
            data() {
                return {
                    settings: settings,
                    nav: 'settings',
                    topOffset: 50,
                }
            },
            components: {
            },
            methods: {
                changeSetting(name) {
                    GMsetValue("Settings", this.settings);
                    console.log(this.settings);
                },

            },
            computed: {
                styleTop() {
                    return `top:${this.topOffset}px;`;
                }
            },
            mounted: function () {

            }
        };

        /**
        * 主界面 CSS
        */
        addStyle(`
body{padding:0;margin:0}
/*
#crackVIPSet input[type=checkbox], input[type=checkbox]{display:none}
#crackVIPSet input[type=checkbox] + span:before,input[type=checkbox] + span:before{content:'☒';margin-right:5px}
#crackVIPSet input[type=checkbox]:checked + span:before, input[type=checkbox]:checked + span:before{content:'☑';margin-right:5px}
*/
#crackVIPSet{z-index:999999;position:fixed;display:grid;grid-template-columns:30px 150px;width:30px;height:150px;overflow:hidden;padding:5px 0 5px 0;opacity:0.4;font-size:12px}
#crackVIPSet button{cursor:pointer}
#crackVIPSet:hover{width:180px;height:450px;padding:5px 5px 5px 0;opacity:1}
#crackVIPSet #nav {display:grid;grid-auto-rows:50px 50px 200px;grid-row-gap:5px}
#crackVIPSet #nav [name=startStudy]:active{cursor:move}
#crackVIPSet #nav button{background:yellow;color:red;font-size:20px;padding:0;border:0;cursor:pointer;border-radius:0 5px 5px 0}
#crackVIPSet #list{overflow:auto;margin-left:2px}
#crackVIPSet #list b{display:block;cursor:pointer;color:#3a3a3a;font-weight:normal;font-size:14px;padding:5px;background-color:#ffff00cc;border-bottom:1px dashed #3a3a3a}
#crackVIPSet #list b:before{content:attr(data-icon);padding-right:5px}
#crackVIPSet #list b:first-child{border-radius:5px 5px 0 0}
#crackVIPSet #list b:last-child{border-radius:0 0 5px 5px}
#crackVIPSet #list b:hover{background-color:#3a3a3a;color:white}
`);


        Vue.prototype.$tele = new Vue();

        let crackApp = document.createElement("div");
        crackApp.id = "crackVIPSet";
        document.body.appendChild(crackApp);

        new Vue({
            el: "#crackVIPSet",
            render: h => h(comMain)
        });


    }




    function addDay(datetime, days) {
        if (datetime == "undefine" || datetime == "" || datetime.length < 8) {
            datetime = new Date();
        }
        if (datetime.length == 8 && datetime.indexOf("-") == -1)
            datetime =
                datetime.substring(0, 4) +
                "-" +
                datetime.substring(4, 6) +
                "-" +
                datetime.substring(6, 8);

        startDate = new Date(datetime);
        startDate = +startDate + days * 1000 * 60 * 60 * 24;
        startDate = new Date(startDate);
        var nextStartDate =
            startDate.getFullYear() +
            "" +
            (startDate.getMonth() + 1 - 0 > 9
                ? startDate.getMonth() + 1
                : "0" + (startDate.getMonth() + 1)) +
            "" +
            (startDate.getDate() - 0 > 9
                ? startDate.getDate()
                : "0" + startDate.getDate());
        return nextStartDate;
    }

    function qiandaoDaojishi(nextDay) {
        var TempnextDay = "";
        var tips = "";
        var jingqueshijian = "";

        if (nextDay)
            TempnextDay = new Date(nextDay); //定义结束时间
        else
            nextDay = TempnextDay = FindNextDay();

        return jingqueshijian + tips;
    }
}