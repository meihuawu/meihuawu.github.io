/**
 * Created by tjd on 2019/5/10.
 */
function addScript(src) {
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.src = src;
    document.body.appendChild(script);
    return script;
}
function refreshPrice() {
    //initOilPrice();
    for (var n = 0; n < quoteUrlList.length; n++) {
        var scriptElement = addScript(quoteUrlList[n]);
        recordScriptElement(quoteUrlList[n], scriptElement)
    }
    //基金直接估值
    //initForGetGuZhi();
    // for (var n = 0; n < gzFundCode.length; n++) {
    //     var url = gzUrlTemplate + gzFundCode[n] + ".js";
    //     fundCode2script[gzFundCode[n]] = addScript(url);
    // }
}

//#region 中国互联白天估值
var hk00700Price = {};
var hk03690Price = {};
var zghlNightGsz = null;
function getAndUpdateZghlPrice(gsz) {
    zghlNightGsz = gsz;
    //getHkZghlPriceSina(); //同步get
    //updateZghlPrice();
    getHkZghlPriceEastMoney(); //异步get
}
function updateZghlPrice() {
    document.getElementById("zghlOrigin00700").innerText = hk00700Price.name + ", " + (hk00700Price.zdf * 100).toFixed(2) + "%, " + hk00700Price.time;
    document.getElementById("zghlOrigin03690").innerText = hk03690Price.name + ", " + (hk03690Price.zdf * 100).toFixed(2) + "%, " + hk03690Price.time;
    var newPrice = zghlNightGsz * (1 + hk00700Price.zdf * 0.0956 + hk03690Price.zdf  * 0.0656);
    document.getElementById("zghlPrice").innerText = newPrice.toFixed(4);
    var desc = "forum: 腾讯控股9.56%; 美团点评6.56%";
    document.getElementById("zghlDesc").innerText = desc;
}

//从sina取得延时10分钟行情，还是用东财的吧
//https://hq.sinajs.cn/list=sz163402
//var hq_str_sz163402="兴全趋势,0.717,0.724,0.727,0.728,0.715,0.726,0.727,5052163,3643320.161,50000,0.726,16900,0.725,236159,0.724,5000,0.723,73000,0.722,19000,0.727,79300,0.728,39100,0.729,118800,0.730,942400,0.731,2019-05-14,10:25:33,00";
//https://hq.sinajs.cn/list=hk03690
//var hq_str_hk03690="NULL,美团点评－Ｗ,57.750,58.950,57.800,56.450,57.150,-1.800,-3.053,57.100,57.150,364770926,6356634,0.000,0.000,74.000,40.250,2019/05/14,10:03";
//https://hq.sinajs.cn/list=hk00700
//var hq_str_hk00700="TENCENT,腾讯控股,369.000,382.000,374.400,369.000,372.600,-9.400,-2.461,372.400,372.600,3321936652,8951038,39.163,0.000,431.600,251.400,2019/05/14,10:04";
//var hq_str_hk00700="TENCENT,腾讯控股,369.000开,382.000昨,377.000高,369.000低,375.800现,-6.200涨额,-1.623涨幅,375.600买一,375.800卖一,4242018425,11410188,39.500,0.000,431.600,251.400,2019/05/14,10:34";
function getHkZghlPriceSina() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://hq.sinajs.cn/list=hk03690", false);
    xhr.send(null);
    console.log(xhr.responseText);
    var res = parseSinaJsPrice(xhr.responseText);
    hk03690Price.name = res.name;
    hk03690Price.zdf = res.zdf;
    hk03690Price.time = res.time;

    xhr.reset();
    xhr.open("GET", "https://hq.sinajs.cn/list=hk00700", false);
    xhr.send(null);
    console.log(xhr.responseText);
    var res = parseSinaJsPrice(xhr.responseText);
    hk00700Price.name = res.name;
    hk00700Price.zdf = res.zdf;
    hk00700Price.time = res.time;
}
function parseSinaJsPrice(respText) {
    var ret = {};
    var respArr = respText.split(","); //1名字, 8涨幅， 17日期，18时间
    ret.name = respArr[1];
    ret.zdf = respArr[8];
    ret.time = respArr[17] + ", " + respArr[18];
    return ret;
}

//从东财取得实时行情
function getHkZghlPriceEastMoney() {
    hk00700Price.script = addScript(url00700);
    hk03690Price.script = addScript(url03690);
}
var url00700 = "https://nufm1.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?type=CT&cmd=007005&sty=MPNASDP&st=z&sr=&p=&ps=&cb=jsonp_85A10BF8DE3747AD8806C997FA69B643&token=7bc05d0d4c3c22ef9fca8c2a912d779c";
//jsonp_85A10BF8DE3747AD8806C997FA69B643(["5,00700,腾讯控股,372.800,372.148,-2.41%,-9.200,13446901,5004236544,0.14,1.52,377.000,369.000,369.000,382.000,-,-,8360505,5086396,8.27,-,40.481,39.506,38.781,9.85,24.33,9520560778,3549264941820.62,9520560778,3549264941821,-,2019-05-14 11:12:07,116,0,431.600|251.400"])
function jsonp_85A10BF8DE3747AD8806C997FA69B643(content) {
    var data = hk00700Price;
    document.body.removeChild(data.script);
    delete data.script;

    var quoteArr = content[0].split(",");
    data.name = quoteArr[2];
    data.zdf =  parseFloat(quoteArr[5]) / 100;
    data.time = quoteArr[31];
    updateZghlPrice();
}
var url03690 = "https://nufm1.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?type=CT&cmd=036905&sty=MPNASDP&st=z&sr=&p=&ps=&cb=jsonp_8030B2E8CB5C4B518CB2702E3BADB4E2&token=7bc05d0d4c3c22ef9fca8c2a912d779c";
//jsonp_8030B2E8CB5C4B518CB2702E3BADB4E2(["5,03690,美团点评-W,57.200,57.288,-2.97%,-1.750,11902747,681882592,0.24,1.60,57.800,56.450,57.750,58.950,-,-,7395864,4506883,-20.11,-,-2.57,-,17.192,3.43,-133.49,5742501384,328471083545.981,5006932601,286396548597,-,2019-05-14 11:14:08,116,0,74.000|40.250"])
function jsonp_8030B2E8CB5C4B518CB2702E3BADB4E2(content) {
    var data = hk03690Price;
    document.body.removeChild(data.script);
    delete data.script;

    var quoteArr = content[0].split(",");
    data.name = quoteArr[2];
    data.zdf =  parseFloat(quoteArr[5]) / 100;
    data.time = quoteArr[31];
    updateZghlPrice();
}
//#endregion


//#region 基金直接估值
//http://fundgz.1234567.com.cn/js/165525.js
//净值日期jzrq，单位净值dwjz，估算值gsz, 估值时间gztime, 估算增长量gszzl
//jsonpgz({"fundcode":"165525","name":"信诚中证基建工程指数LOF","jzrq":"2019-05-09","dwjz":"0.7870","gsz":"0.8050","gszzl":"2.28","gztime":"2019-05-10 15:00"});
//jsonpgz({"fundcode":"163402","name":"兴全趋势投资混合(LOF)","jzrq":"2019-05-09","dwjz":"0.7105","gsz":"0.7411","gszzl":"4.30","gztime":"2019-05-10 15:00"});
//jsonpgz({"fundcode":"161226","name":"国投瑞银白银期货(LOF)","jzrq":"2019-05-09","dwjz":"0.7540","gsz":"0.7540","gszzl":"0.00","gztime":"2019-05-10 15:00"});
//jsonpgz({"fundcode":"162605","name":"景顺长城鼎益混合(LOF)","jzrq":"2019-05-09","dwjz":"1.5190","gsz":"1.5799","gszzl":"4.01","gztime":"2019-05-10 15:00"});
//jsonpgz({"fundcode":"161127","name":"易标普生物科技人民币","jzrq":"2019-05-08","dwjz":"1.2433","gsz":"1.2374","gszzl":"-0.48","gztime":"2019-05-10 04:00"});
//jsonpgz({"fundcode":"162415","name":"华宝标普美国消费人民币","jzrq":"2019-05-08","dwjz":"1.5210","gsz":"1.5137","gszzl":"-0.48","gztime":"2019-05-10 04:00"});
//jsonpgz({"fundcode":"162411","name":"华宝标普油气上游股票","jzrq":"2019-05-08","dwjz":"0.5030","gsz":"0.5006","gszzl":"-0.47","gztime":"2019-05-10 04:00"});
var gzFundCode = [
    "165525", "161226"];
var fundCode2script = {};
var fundCode2content = {};
var gzUrlTemplate = "https://fundgz.1234567.com.cn/js/"; //fundcode.js
function jsonpgz(content) {
    //record gu zhi data
    console.log(content);
    fundCode2content[content.fundcode] = content;

    //164906 中国互联
    if (content.fundcode == "164906") {
        getAndUpdateZghlPrice(+content.gsz);
    }

    //check if has get all gu zhi data
    var contentNum = 0;
    for (var key in fundCode2content) {
        if (fundCode2content.hasOwnProperty(key)) {
            contentNum++;
        }
    }
    if (contentNum == gzFundCode.length) {
        finishForGetGuZhi();
    }
}
function initForGetGuZhi() {
    //delete gu zhi element
    var gzPriceElem = document.getElementById("gzPrice");
    if (gzPriceElem.lastChild != null) {
        gzPriceElem.removeChild(gzPriceElem.lastChild);
    }
    var elem = document.createElement("div");
    gzPriceElem.appendChild(elem);

    //delete script element & gu zhi data
    for (var n = 0; n < gzFundCode.length; n++) {
        var oldScript = fundCode2script[gzFundCode[n]];
        if (oldScript != null) {
            document.body.removeChild(oldScript);
            delete fundCode2script[gzFundCode[n]];
        }
        delete fundCode2content[gzFundCode[n]];
    }
}
function finishForGetGuZhi() {
    //gu zhi element
    var listParentElem = document.getElementById("gzPrice").lastChild;
    for (var n = 0; n < gzFundCode.length; n++) {
        if (n != 0 && n % 4 == 0) {
            listParentElem.appendChild(document.createTextNode("-------------"));
        }
        var content = fundCode2content[gzFundCode[n]];
        var nodeText = formatString("{5}{0}：估【{1}】{2};   净({3}), {4}; ", content.fundcode, content.gsz, content.gztime, content.dwjz, content.jzrq, content.name.substr(0, 6));
        var childNode = document.createElement("div");
        childNode.textContent = nodeText; //JSON.stringify(content);
        listParentElem.appendChild(childNode);
    }
}
//#endregion 基金直接估值


//#region 全球商品
var agUrl = "https://nufm1.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?type=CT&cmd=SI00Y0&sty=MPICTTA&st=z&sr=&p=&ps=&cb=jsonp_85F656AAF7F54EA6A303ACDCC3C585C2&token=7bc05d0d4c3c22ef9fca8c2a912d779c";
//jsonp_85F656AAF7F54EA6A303ACDCC3C585C2(["0,SI00Y,COMEX白银,14.750,14.773,14.805,0.032,0.22%,-,14.830,14.750,6137,-,-,-,3413,2724,-,-,-,-,-,-,-,(PB),-,-,2019-05-10 10:38:44,0,1,-,14.773,152959,14.805,14.810,-1,-,-,1565,-,-,COMEX白银,101"])

var usoUrl = "https://nufm1.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?type=CT&cmd=USO7&sty=MPNASDP&st=z&sr=&p=&ps=&cb=jsonp_551A99C38D514FE5A15144A7CB671EB9&token=7bc05d0d4c3c22ef9fca8c2a912d779c";
//jsonp_551A99C38D514FE5A15144A7CB671EB9(["7,USO,美国原油基金,12.810,12.796,-0.62%,-0.080,19192148,245584960,-,0.60,12.870,12.680,12.820,12.890,-,-,9613031,9579117,0.000,-,-,-,0.000,-,-,0,-,0,-,-,2019-05-10 08:00:17,107,1,-"])

var xopUrl = "https://nufm1.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?type=CT&cmd=XOP7&sty=MPNASDP&st=z&sr=&p=&ps=&cb=jsonp_B95BEDE264A043F7810D0FBEE18821CD&token=7bc05d0d4c3c22ef9fca8c2a912d779c";
//jsonp_B95BEDE264A043F7810D0FBEE18821CD(["7,XOP,油气开采ETF-SPDR S&P,29.660,29.463,-0.37%,-0.110,26357576,776562000,-,1.05,29.840,29.060,29.470,29.770,-,-,11125976,15231600,0.000,-,-,-,0.000,-,-,0,-,0,-,-,2019-05-10 08:00:17,107,1,-"])


var auUrl = "https://nufm1.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?type=CT&cmd=GC00Y0&sty=MPICTTA&st=z&sr=&p=&ps=&cb=jsonp_E3E480FFDEC346F2BE36AE2BE91C3BFC&token=7bc05d0d4c3c22ef9fca8c2a912d779c";
//jsonp_E3E480FFDEC346F2BE36AE2BE91C3BFC(["0,GC00Y,COMEX黄金,1285.0,1285.2,1284.9,-0.3,-0.02%,-,1286.2,1283.9,27458,-,-,-,14261,13197,-,-,-,-,-,-,-,(PB),-,-,2019-05-10 10:39:54,0,1,-,1285.2,285417,1284.9,1285.0,-1,-,-,3179,-,-,COMEX黄金,101"])

var bcUrl = "https://nufm1.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?type=CT&cmd=BC0&sty=MPICTTA&st=z&sr=&p=&ps=&cb=jsonp_A83DCDDED32D49358B57607339BCE1F0&token=7bc05d0d4c3c22ef9fca8c2a912d779c";
//jsonp_A83DCDDED32D49358B57607339BCE1F0(["0,BC,布伦特原油当月连续,70.45,70.39,70.88,0.49,0.70%,-,71.23,70.18,97350,-,-,-,49518,47832,-,-,-,-,-,-,-,(PB),-,-,2019-05-10 18:48:08,0,1,-,70.39,446996,70.88,70.89,1,70.39,-,-14970,-,-,布伦特原油,"])

var cl00yUrl = "https://nufm1.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?type=CT&cmd=CL00Y0&sty=MPICTTA&st=z&sr=&p=&ps=&cb=jsonp_019AD499069B4AA79196013ADCDD7C6D&token=7bc05d0d4c3c22ef9fca8c2a912d779c";
//jsonp_019AD499069B4AA79196013ADCDD7C6D(["0,CL00Y,NYMEX原油,61.64,61.70,62.13,0.43,0.70%,-,62.49,61.53,227376,-,-,-,116145,111231,-,-,-,-,-,-,-,(PB),-,-,2019-05-10 18:48:08,0,1,-,61.70,304264,62.12,62.13,-1,-,-,-11178,-,-,NYMEX原油,102"])

var urlAgm = "https://push2.eastmoney.com/api/qt/stock/get?secid=113.agm&forcect=1&fields=f39,f43,f57,f58,f60&invt=2&cb=hqCall";
//{"rc":0,"rt":4,"svr":183021830,"lt":1,"full":1,"data":{"f43":4398,"f57":"agm","f58":"沪银主力","f60":4309}}

var quoteUrlList = [cl00yUrl, xopUrl, urlAgm];
var quoteUrlScript = {};

function parseJsonp(url) {
    var pos = url.search("jsonp_");
    var end = url.search("&token");
    return url.substring(pos, end);
}
function recordScriptElement(url, element) {
    //var key = parseJsonp(url);
    //quoteUrlScript[key] = element;
}
function clearScriptElement(fnName) {
    //document.body.removeChild(quoteUrlScript[fnName]);
    //delete quoteUrlScript[fnName];
}
//黄金现货
function jsonp_E3E480FFDEC346F2BE36AE2BE91C3BFC(content) {
    //clear script element
    var fnName = arguments.callee.name;
    clearScriptElement(fnName);

    //update price element
    console.log(content);
    var priceArr = content[0].split(",");
    var lastPrice = priceArr[34];
    var newPrice = 2.824 * (lastPrice / 1283);
    document.getElementById("auOrigin").innerText = priceArr[2] + ": " + lastPrice + "; " + priceArr[27];
    document.getElementById("auPrice").innerText = newPrice.toFixed(4);
    var desc = "forum: newPrice=2.824 * (lastPrice / 1283);   BaseDate=2019-05-13.";
    document.getElementById("auDesc").innerText = desc;
}
//白银期货
function jsonp_85F656AAF7F54EA6A303ACDCC3C585C2(content) {
    //clear script element
    var fnName = arguments.callee.name;
    clearScriptElement(fnName);
}
//原油期货(美国原油基金)
function jsonp_551A99C38D514FE5A15144A7CB671EB9(content) {
    //clear script element
    var fnName = arguments.callee.name;
    clearScriptElement(fnName);
}
//原油开采股票
function jsonp_B95BEDE264A043F7810D0FBEE18821CD(content) {
    //clear script element
    var fnName = arguments.callee.name;
    clearScriptElement(fnName);

    //update price element
    var priceArr = content[0].split(",");
    var lastPrice = priceArr[3];
    document.getElementById("162411.xop.new").value = lastPrice;
    calc162411();
}

//南方原油 - 布伦特原油当月连续
function jsonp_A83DCDDED32D49358B57607339BCE1F0(content) {
    //clear script element
    var fnName = arguments.callee.name;
    clearScriptElement(fnName);

    //update price element
    console.log(content);
    var priceArr = content[0].split(",");
    var lastPrice = priceArr[5];
}
//南方原油 - NYMEX原油
//["0,CL00Y,NYMEX原油,56.07,56.23,56.01,-0.22,-0.39%,-,56.17,55.85,24644,-,-,-,12453,12191,-,-,-,-,-,-,-,(PB),-,-,2019-10-25 14:40:42,0,1,-,56.23,444100,56.01,56.02,-1,56.23,-,-4753,-,-,NYMEX原油,102"]
function jsonp_019AD499069B4AA79196013ADCDD7C6D(content) {
    //clear script element
    var fnName = arguments.callee.name;
    clearScriptElement(fnName);

    var priceArr = content[0].split(",");
    var lastPrice = priceArr[5];
    document.getElementById("501018.cl00y.new").value = lastPrice;
    calc501018();
}

//新接口:沪银主力
//{"rc":0,"rt":4,"svr":183021830,"lt":1,"full":1,"data":{"f43":4398,"f57":"agm","f58":"沪银主力","f60":4309}}
function hqCall(content) {
    var lastPrice = content.data.f43;
    document.getElementById("161226.agm.new").value = lastPrice;
    calc161226();
}

//#endregion 全球商品



//#region 辅助函数
String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};

function formatString(str, args) {
    if (arguments.length >= 2) {
        if (arguments.length == 2 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    str = str.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 1; i < arguments.length; i++) {
                var templateIndex = i - 1;
                if (arguments[templateIndex] != undefined) {
                    var reg = new RegExp("({)" + templateIndex + "(})", "g");
                    str = str.replace(reg, arguments[i]);
                }
            }
        }
    }
    return str;
}
//#endregion 辅助函数


       function loadAllPrice() {
            document.getElementById("501018.cl00y.old").value = localStorage.getItem("501018.cl00y.old");
            document.getElementById("501018.cl00y.new").value = localStorage.getItem("501018.cl00y.new");
            document.getElementById("501018.value").value = localStorage.getItem("501018.value");

            document.getElementById("162411.xop.old").value = localStorage.getItem("162411.xop.old");
            document.getElementById("162411.xop.new").value = localStorage.getItem("162411.xop.new");
            document.getElementById("162411.value").value = localStorage.getItem("162411.value");

            document.getElementById("161226.agm.old").value = localStorage.getItem("161226.agm.old");
            document.getElementById("161226.agm.new").value = localStorage.getItem("161226.agm.new");
            document.getElementById("161226.value").value = localStorage.getItem("161226.value");

            calc501018();
            calc162411();
            calc161226();
        }
        //window.onload = loadAllPrice();
        function saveAllPrice() {
            localStorage.setItem("501018.cl00y.old", document.getElementById("501018.cl00y.old").value);
            localStorage.setItem("501018.cl00y.new", document.getElementById("501018.cl00y.new").value);
            localStorage.setItem("501018.value", document.getElementById("501018.value").value);

            localStorage.setItem("162411.xop.old", document.getElementById("162411.xop.old").value);
            localStorage.setItem("162411.xop.new", document.getElementById("162411.xop.new").value);
            localStorage.setItem("162411.value", document.getElementById("162411.value").value);

            localStorage.setItem("161226.agm.old", document.getElementById("161226.agm.old").value);
            localStorage.setItem("161226.agm.new", document.getElementById("161226.agm.new").value);
            localStorage.setItem("161226.value", document.getElementById("161226.value").value);
        }
        function calc501018() {
            var bookValue = +document.getElementById("501018.value").value;
            var oldPrice = +document.getElementById("501018.cl00y.old").value;
            var newPrice = +document.getElementById("501018.cl00y.new").value;
            var desc = "公式: " + bookValue + " * " + newPrice + " / " + oldPrice;
            var calcValue = bookValue * (1 + (newPrice / oldPrice - 1) * 0.68);
            document.getElementById("501018.calc").innerText = calcValue.toFixed(3);
            document.getElementById("501018.desc").innerText = desc;
            document.getElementById("501018.float").innerText = calcFloatPrice(calcValue);
        }
        function calc162411() {
            var bookValue = +document.getElementById("162411.value").value;
            var oldPrice = +document.getElementById("162411.xop.old").value;
            var newPrice = +document.getElementById("162411.xop.new").value;
            var desc = "公式: " + bookValue + " * " + newPrice + " / " + oldPrice;
            var calcValue = bookValue * newPrice / oldPrice;
            document.getElementById("162411.calc").innerText = calcValue.toFixed(3);
            document.getElementById("162411.desc").innerText = desc;
            document.getElementById("162411.float").innerText = calcFloatPrice(calcValue);
        }
        function calc161226() {
            var bookValue = +document.getElementById("161226.value").value;
            var oldPrice = +document.getElementById("161226.agm.old").value;
            var newPrice = +document.getElementById("161226.agm.new").value;
            var desc = "公式: " + bookValue + " * " + newPrice + " / " + oldPrice;
            var calcValue = bookValue * newPrice / oldPrice;
            document.getElementById("161226.calc").innerText = calcValue.toFixed(3);
            document.getElementById("161226.desc").innerText = desc;
            document.getElementById("161226.float").innerText = calcFloatPrice(calcValue);
        }
        function calcFloatPrice(price) {
            var str = "(" + (price * 0.98).toFixed(3) + ", " + (price * 0.99).toFixed(3) + " -- " + (price * 1.01).toFixed(3) + ", " + (price * 1.02).toFixed(3) + ")";
            return str;
        }