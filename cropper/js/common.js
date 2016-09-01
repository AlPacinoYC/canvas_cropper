/**
 * Created by yuechen .
 */
/*
 * 功能：ajax请求
 * url：请求地址
 * type：post请求还是get请求
 * dataType：请求的数据类型"json,txt,xml等"
 * data：传递过去的数据
 * callback：请求成功后的回调函数
 */
function ajaxTodo(type,url,dataType,data,callback){
    $.ajax({
        type:type,
        url:url,
        async:false,
        dataType:dataType,
        data:data,
        success:function(dataReturn){
            // 请求成功后回调函数
            callback(dataReturn);
        },
        error:function(error){
            // 打印错误信息
            console.log(error.responseText);
        }
    })
}

/* 判断是否是IE浏览器*/
function isIE(){
    if(document.all){
        return true;
    }else{
        return false;
    }
}

/*
*功能：获取Get参数，采用$_GET["变量名"]的方式获取页面传递过来的参数直接使用$_GET方法将获取所有变量的对象集合
*/
var $_GET = (function(){
    var url = window.document.location.href.toString();
    var u = url.split("?");
    if(typeof(u[1]) == "string"){
        u = u[1].split("&");
        var get = {};
        for(var i in u){
            var j = u[i].split("=");
            get[j[0]] = j[1];
        }
        return get;
    } else {
        return {};
    }
})();

/*
*功能：获取页面滚动条的高度
*/
function getScrollTop() {
    var scrollTop=0;
    // 兼容html4.0写法如果页面有DTD申明则使用document.documentElement如果没用则使用document.body
    if(document.documentElement&&document.documentElement.scrollTop)
    {
        scrollTop=document.documentElement.scrollTop;
    }
    else if(document.body)
    {
        scrollTop=document.body.scrollTop;
    }
    return scrollTop;
}