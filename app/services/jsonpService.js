/*
        //实现自己的jsonp
        //1:先生成一个唯一的编码，可以使用时间毫秒值，作为函数名 callback_1243432
        //2: 将该函数挂载到全局中 window.callback_1243432 
        //核心动态生成script标签
        //  1: 创建srcipt标签
        //  2:设置其src  url+ callback=callback_1243432  让服务器知道回调函数名称
        //      - 服务器返回的东西就是 callback_1243432(data)
        //  3:插入到document中
 */

(function() {
    var app = angular.module('app.jsonp', []);
    //创建一个服务
    //为了避免作用域问题，我们把这个callback函数挂载到全局window中
    app.service('jsonpService', ['$window', function($window) {
        this.jsonp = function(url, argv, callback) { // url,/detail/456 ? callback=xxxx 回调函数
            var callbackName = 'callback_';
            //Date.now()会生成唯一的编码，作为callback_1243432的1243432
            callbackName += Date.now() + ''; //callback_1243432
            //window.callback_1243432 = 回调函数
            $window[callbackName] = callback;

            //argv = {name:123,age:12}   并且我们的argv参数的个数未知
            //操作url-> http://127.0.0.1/in_theaters/123?name=123&age=12
            // argv是对象形式，但是我们url中的形式是name=123&age=12，所以我们需要遍历对象将其进行拼接
            url += '?';
            for (var key in argv) {
                var searchStr = key + '=' + argv[key] + '&';
                url += searchStr;
            }
            //添加callback  url变成callback=callback_1243432
            url += 'callback=' + callbackName;


            //创建script标签
            var script = $window.document.createElement('script');
            //设置src
            script.src = url;
            //插入到文档的时候，立刻发起请求
            //script标签返回回来的js代码会立刻执行
            // 服务器返回callback_1243432('我是电影')
            
            // 我们在跨域访问的时候，访问成功以后，数据会以回调函数的形式返回
            // 这时候我们拿到数据以后。将其加入到我们的页面中
            $window.document.body.appendChild(script);
        }
    }])
})(angular);
