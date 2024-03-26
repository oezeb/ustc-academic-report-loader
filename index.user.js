// ==UserScript==
// @name         USTC Academic Report Loader
// @namespace    https://github.com/oezeb/ustc-academic-report-loader/
// @version      1.0.0
// @description  Load ustc academinc report list from yjs system
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
            BGTMZW: { name: "Title (Chinese)", size: "300px" },
            BGTMYW: { name: "Title (English)", size: "158px" },
            BGRZW: { name: "Speaker", size: "100px" },
            YXDM_DISPLAY: { name: "Department", size: "100px" },
            DD: { name: "Location", size: "100px" },
            BGSJ: { name: "Time", size: "130px" },
            JZSJ: { name: "Deadline", size: "130px" },
            "YXRS/KXRS": { name: "Selected/Total", size: "80px" },
            BZ: { name: "Note", size: "100px" },
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
                column == "YXRS/KXRS"
                    ? `${item.YXRS}/${item.KXRS}`
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
        iframe.style.display = "none";
        iframe.src = "/gsapp/sys/xsbgglappustc/*default/index.do?#/xsbgxk";
        return iframe;
    };

    async function getData(n = 20) {
        let url =
            "https://yjs1.ustc.edu.cn/gsapp/sys/xsbgglappustc/modules/xsbgxk/wxbgbgdz.do";

        let res = await fetch(url, {
            headers: { cookie: document.cookie },
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
