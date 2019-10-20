// ==UserScript==
// @name         translateSubTitle
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  视频字幕翻译插件, 目前支持: frontendMasters
// @author       You
// @match        https://frontendmasters.com/courses/*
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_notification

// @homepageURL  https://github.com/ShaojieLiu/tamperMonkey/blob/master/README.md
// @supportURL   https://github.com/ShaojieLiu/tamperMonkey/issues
// @downloadURL  https://github.com/ShaojieLiu/tamperMonkey/blob/master/translateSubTitle.user.js
// @updateURL    https://github.com/ShaojieLiu/tamperMonkey/blob/master/translateSubTitle.user.js
// ==/UserScript==

(function() {
  "use strict";
  let lastTxt = "";
  const translate = () => {
    const arr = Array.from(
      document.querySelectorAll(".vjs-text-track-display")
    );
    arr &&
      [arr[0]].forEach(titleDiv => {
        const title = titleDiv
          .querySelector("div")
          .querySelector("div")
          .querySelector("div");
        const txt = title.innerText;
        if (txt !== lastTxt) {
          console.log(txt);
          // sougou(txt, addCH(titleDiv))
          youdao(txt, addCH(titleDiv));
          lastTxt = txt;
        }
      });
  };
  setInterval(translate, 50);
})();

const addCH = titleDiv => txt => {
  const titleCtn = titleDiv.querySelector("div").querySelector("div");
  titleCtn.style.display = "flex";
  titleCtn.style["flex-direction"] = "column";
  titleCtn.style["justify-content"] = "center";
  titleCtn.style["align-items"] = "center";
  const ch = document.createElement("div");
  ch.style["background-color"] = "rgba(0, 0, 0, 0.8)";
  ch.innerHTML = txt;
  titleCtn.appendChild(ch);
};

function caiyun(r, callback) {
  var data = {
    source: r.split("\n"),
    trans_type: "en2zh",
    request_id: "web_fanyi",
    media: "text",
    os_type: "web",
    dict: true,
    cached: true,
    replaced: true
  };
  GM_xmlhttpRequest({
    method: "POST",
    url: "https://api.interpreter.caiyunai.com/v1/translator",
    headers: {
      accept: "application/json",
      "content-type": "application/json; charset=UTF-8",
      "X-Authorization": "token:gh0nd9ybc4a7mvb2unqi"
    },
    data: JSON.stringify(data),
    onload: function onload(response) {
      console.warn(response);
      var result = JSON.parse(response.responseText);
      callback(result.target.join("\n"), r.index); // 执行回调，在回调中拼接
    }
  });
}

function youdao(r, callback) {
  GM_xmlhttpRequest({
    method: "GET",
    url: `http://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=${r}`,
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    onload: function onload(response) {
      console.warn(response);
      var result = JSON.parse(response.responseText);
      callback(result.translateResult[0][0].tgt); // 执行回调，在回调中拼接
    }
  });
}

function sougou(r, callback) {
  var KEY = "e84c5ed53d15b9b6e2e302cdac46efc1"; // 硬编码于搜狗网页翻译js
  var pid = "e84c5ed53d15b9b6e2e302cdac46efc1";
  var salt = 3;
  var q = r;
  var data = {
    q,
    from: "auto",
    to: "zh-CHS",
    pid,
    salt,
    dict: false,
    sign: md5(pid + q + salt + KEY) // 签名算法
  };
  GM_xmlhttpRequest({
    method: "POST",
    url: "http://fanyi.sogou.com/reventondc/api/sogouTranslate",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    data: serialize(data),
    onload: function onload(response) {
      console.warn(response);
      var result = JSON.parse(response.responseText);
      callback(result.translation); // 执行回调，在回调中拼接
    }
  });
}

function serialize(obj) {
  return Object.keys(obj)
    .map(function(k) {
      return (
        encodeURIComponent(k) +
        "=" +
        encodeURIComponent(obj[k]).replace("%20", "+")
      );
    })
    .join("&");
}

function md5(str) {
  var k = [],
    i = 0;

  for (i = 0; i < 64; ) {
    k[i] = 0 | (Math.abs(Math.sin(++i)) * 4294967296);
  }

  var b,
    c,
    d,
    j,
    x = [],
    str2 = unescape(encodeURI(str)),
    a = str2.length,
    h = [(b = 1732584193), (c = -271733879), ~b, ~c];

  for (i = 0; i <= a; ) {
    x[i >> 2] |= (str2.charCodeAt(i) || 128) << (8 * (i++ % 4));
  }

  x[(str = ((a + 8) >> 6) * 16 + 14)] = a * 8;
  i = 0;

  for (; i < str; i += 16) {
    a = h;
    j = 0;

    for (; j < 64; ) {
      a = [
        (d = a[3]),
        (b = a[1] | 0) +
          (((d =
            a[0] +
            [
              (b & (c = a[2])) | (~b & d),
              (d & b) | (~d & c),
              b ^ c ^ d,
              c ^ (b | ~d)
            ][(a = j >> 4)] +
            (k[j] + (x[([j, 5 * j + 1, 3 * j + 5, 7 * j][a] % 16) + i] | 0))) <<
            (a = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][
              4 * a + (j++ % 4)
            ])) |
            (d >>> (32 - a))),
        b,
        c
      ];
    }

    for (j = 4; j; ) {
      h[--j] = h[j] + a[j];
    }
  }

  str = "";

  for (; j < 32; ) {
    str += ((h[j >> 3] >> ((1 ^ (j++ & 7)) * 4)) & 15).toString(16);
  }

  return str;
}
