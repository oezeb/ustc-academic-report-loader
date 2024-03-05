// ==UserScript==
// @name         USTC Academic Report Loader
// @namespace    https://github.com/oezeb/ustc-academic-report-loader/
// @version      1.0.0
// @description  Load reports ustc academinc report list from yjs system with defined filters
// @author       oezeb
// @match        *://yjs1.ustc.edu.cn/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// ==/UserScript==

(function () {
    "use strict";

    const isLoggedIn = () => document.querySelector(".user-profile");

    async function main() {
        let iframe = createIframe();
        document.body.appendChild(iframe);

        iframe.onload = async function () {
            let data = await getData(100);
            let today = new Date();
            data = data.datas.wxbgbgdz.rows.filter(
                (item) => new Date(item.BGSJ) > today
            );
            data.sort((a, b) => new Date(b.BGSJ) - new Date(a.BGSJ));
            let table = createTable(data);
            document.body.appendChild(table);
            document.body.appendChild(createButton(table, data.length));
        };
    }

    const createTable = (data) => {
        let table = document.createElement("table");
        table.style.position = "fixed";
        table.style.bottom = "0";
        table.style.right = "0";
        table.style.backgroundColor = "white";
        table.style.border = "1px solid black";
        table.style.display = "none";
        table.style.zIndex = "10000";
        table.style.maxHeight = "30%";
        table.style.overflow = "auto";

        let columns = {
            BGTMZW: { name: "报告题目（中文）", size: "300px" },
            BGTMYW: { name: "报告题目（英文）", size: "158px" },
            BGRZW: { name: "报告人", size: "100px" },
            YXDM_DISPLAY: { name: "院系", size: "100px" },
            DD: { name: "地点", size: "100px" },
            BGSJ: { name: "报告时间", size: "130px" },
            JZSJ: { name: "选课截至时间", size: "130px" },
            "KXRS/YXRS": { name: "容量/已选", size: "80px" },
            BZ: { name: "备注", size: "100px" },
        };

        table.appendChild(createTableHeader(columns));
        table.appendChild(createTableBody(data, columns));
        return table;
    };

    const createTableHeader = (columns) => {
        let thead = document.createElement("thead");
        let tr = document.createElement("tr");
        for (let column in columns) {
            let th = document.createElement("th");
            th.textContent = columns[column].name;
            th.style.width = columns[column].size;
            tr.appendChild(th);
        }
        thead.appendChild(tr);
        return thead;
    };

    const createTableBody = (data, columns) => {
        let tbody = document.createElement("tbody");
        for (let item of data) {
            let tr = createTableRow(item, columns);
            tbody.appendChild(tr);
        }
        return tbody;
    };

    const createTableRow = (item, columns) => {
        let tr = document.createElement("tr");
        for (let column in columns) {
            let text =
                column == "KXRS/YXRS"
                    ? `${item.KXRS}/${item.YXRS}`
                    : item[column];
            let td = createTableCell(text, columns[column].size);
            tr.appendChild(td);
        }
        return tr;
    };

    const createTableCell = (text, size) => {
        let td = document.createElement("td");
        td.textContent = text;
        td.title = td.textContent;
        td.style.maxWidth = size;
        td.style.whiteSpace = "nowrap";
        td.style.overflow = "hidden";
        td.style.textOverflow = "ellipsis";
        return td;
    };

    const createButton = (table, length) => {
        let button = document.createElement("button");
        button.style.position = "fixed";
        button.style.bottom = "0";
        button.style.right = "0";
        button.style.zIndex = "10000";
        button.textContent = `Show (${length})`;
        button.onclick = function () {
            if (table.style.display === "none") {
                table.style.display = "block";
                button.textContent = `Hide (${length})`;
            } else {
                table.style.display = "none";
                button.textContent = `Show (${length})`;
            }
        };
        return button;
    };

    const createIframe = () => {
        let iframe = document.createElement("iframe");
        iframe.id = "xsbgxk_iframe";
        iframe.frameborder = "0";
        iframe.src =
            "/gsapp/sys/xsbgglappustc/*default/index.do?v=b072d6cc-e96a-44a3-8395-917e43a3208a&amp;THEME=blue&amp;EMAP_LANG=zh&amp;min=1&amp;_yhz=5257ccc1e6bf40f388a6b8169c80b56d#/xsbgxk";
        return iframe;
    };

    async function getData(n = 20) {
        let url =
            "https://yjs1.ustc.edu.cn/gsapp/sys/xsbgglappustc/modules/xsbgxk/wxbgbgdz.do";

        let res = await fetch(url, {
            headers: {
                accept: "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
                "content-type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                "sec-ch-ua":
                    '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                cookie: document.cookie,
                Referer:
                    "https://yjs1.ustc.edu.cn/gsapp/sys/xsbgglappustc/*default/index.do?v=c85d55a2-7d7a-4375-9450-39d14585e32d&THEME=blue&EMAP_LANG=zh&min=1&_yhz=5257ccc1e6bf40f388a6b8169c80b56d",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            },
            body: `*order=-BGSJ&pageSize=${n}&pageNumber=1`,
            method: "POST",
        });

        let data = await res.json();
        return data;
    }

    let observer = new MutationObserver(function (mutations) {
        if (isLoggedIn()) {
            main();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
