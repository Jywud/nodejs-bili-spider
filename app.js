const superagent = require("superagent"),
    async = require("async"),
    fs = require("fs");

require('superagent-proxy')(superagent)

var start = new Date(),
    imgUrls = [],
    url = "http://api.bilibili.com/archive_stat/stat?aid=";

for (let i = 10086; i < 11086; i++) {
    imgUrls.push(url + i);
}

var jsonData = []

var fetchUrl = function(url, callback) {
    // 控制时间在 500ms 内
    var delay = parseInt((Math.random() * 30000000) % 500, 10);
    superagent
        .get(url)
        .proxy("http://localhost:1080") // 使用 Shadowsocks 代理
        .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/12.0')
        .retry(3)
        .timeout({ response: 5000 })
        .end(function(err, res) {
            if (err) {
                console.log(err.status);
                return;
            } else if (res.body.data !== undefined) {
                console.log(res.body.data.aid);
                jsonData.push(res.body.data);
            }
        });
    setTimeout(function() {
        callback();
    }, delay);

};

// 并发
async.mapLimit(imgUrls, 8, function(url, callback) {
    fetchUrl(url, callback);
}, function(err, result) {
    console.log("共爬取到: " + jsonData.length + " 条数据，耗时: " + (new Date() - start) / 1000 + ' s');
    fs.writeFile("result.json", JSON.stringify(jsonData), { encoding: "utf8" });
});