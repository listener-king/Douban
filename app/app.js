(function(angular) {
    var app = angular.module('app', ['ui.router', 'app.jsonp']);

    //担心会有作用域的问题，这时声明一个全局使用的常量
    // app.value("host",url)和app.constant("host",url)的作用是一样的
    app.value('host', 'https://api.douban.com/v2/movie/');
    app.constant('viewCount', 20);    //默认一页有20个数据
    //配置路由规则
    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        //当我们进入页面的时候，默认到首页，所以配置默认的一个路由
        // $urlRouterProvider。otherwise是固定的一个写法
        $urlRouterProvider.otherwise('home_page'); // 默认就走Home_page状态名
        $stateProvider.state('home_page', { //首页
                url: '/home_page',
                templateUrl: './views/home/home_page.html'
            })

            .state('in_theaters', {
                //因为正在热映这个页面和search有共同的部分，所以我们用的是同一个页面
                //配置一个通用的url,当输入点击搜索的时候，会替换movieType和q，从而请求search
                url: '/:movieType/:q', // /search?q=xxx || /in_theaters
                templateUrl: './views/movie/in_theaters.html',
                controller: 'movieController'
            }) //正在热映
            // .state('search', {
            //     url: '/:movieType/:q', //  /search/葫芦娃 || 
            //     // url:'/search?q', //  /search/葫芦娃 ||  /search?q=葫芦娃 
            //     templateUrl: './views/movie/in_theaters.html',
            //     controller: 'movieController'
            // })
            .state('detail', {
                url: '/detail/:id',
                templateUrl: './views/movie/detail.html'
            })
    }]);



    //声明main控制器，也就是主页的搜索按钮
     app.controller('movieController', ['$scope', '$http', 'jsonpService', '$state', 'host', 'viewCount', function($scope, $http, jsonpService, $state, host, viewCount) {

               //默认查询的参数对象是一个基本对象
              
                $scope.argv = { count: viewCount }; //声明默认每页的数据是viewCount
                if ($state.params.movieType === 'search') { //如果是search页面
                    $scope.argv.q = $state.params.q; //获取其参数，添加到对象中
                }

                //url 拼接    host是声明的全局地址
                $scope.url = host;
                //https://api.douban.com/v2/movie/search||in_theaters||top250
                $scope.url += $state.params.movieType;

         //我们用$http请求豆瓣的数据，请求失败，是因为跨域原因
        // $http.get('https://api.douban.com/v2/movie/in_theaters')
        //     .then(function(res) {
        //         console.log(res.data);
        //         //挂载数据
        //     }, function(err) {
        //         console.log('获取正在热映数据失败');
        //     })

        // 在angular中直接获取jsonp的方法，但是由由于angular会默认把JSON_CALLBACK替换成angular.callbacks._0
        // 在豆瓣中不支持.点 所以跨域失败

        //    使用angular的jsonp
        // $http.jsonp('https://api.douban.com/v2/movie/in_theaters?callback=JSON_CALLBACK') // JSON_CALLBACK会被替换成angular.callbacks._0，而豆瓣不支持
        //     .then(function(res) {
        //         console.log(res.data);
        //         //挂载数据
        //     }, function(err) {
        //         console.log('获取正在热映数据失败');
        //     });

        // 这时候我们就手动实现自己的jsonp

        //我们这里可以以第一页，也可以是第N页
        //封装函数，传递参数是页码
        $scope.showMoviesByPage = function(page) {
            //判断当前页是否合理  不小于1，不大于total
            if (page < 1 || page > $scope.totalPages) return;
            //计算起始start = (page-1)* viewCount
            var start = (page - 1) * viewCount;

            //给$scope.argv添加一个属性.start  为了是让翻页以后能够对应到相应的数据
                $scope.argv.start = start;
            //  /search/葫芦娃  $scope.argv: {count:5,q:'葫芦娃',start:1}
            //jsonp是我们跨域请求到的
             // $scope.url是请求的地址
             // $scope.argv是参数，是一个对象
            jsonpService.jsonp($scope.url, $scope.argv, function(data) {
                $scope.isShow = false; //隐藏进度条
                //计算合计页   总条数/每页显示的条数   然后+1  不满一页也算一页
                $scope.totalPages = Math.ceil(data.total / viewCount);
                //获取合计记录数
                $scope.movieCount = data.total;
                //当前页码
                $scope.currentPage = page;
                //电影列表
                $scope.movies = data.subjects;
                $scope.$apply(); //只要不是angular的异步操作，就需要调用该函数通知页面更新
            });
        }
        $scope.showMoviesByPage(1); //默认加载的时候第一页

    }]);

    //声明main控制器，也就是主页的搜索按钮
    app.controller('mainController', ['$scope', '$state', function($scope, $state) {
        $scope.search = function(q) {
            //需要通过程序来改变URL
            $state.go('in_theaters', { movieType: 'search', q: q });
            // url规则生成的href: /search/葫芦娃
            // 在index.html 中的a标签是不是也是一样的道理
            // <a ui-sref="in_theaters(movieType:'in_theaters')">正在热映</a>
        }
    }]);

    //激活样式的控制器
    app.controller('activeController', ['$scope', '$location', function($scope, $location) {
        //只能监视$scope的属性
        $scope.local = $location;
        //默认选中码状态是首页
        $scope.selectedNum = 1;
        $scope.$watch('local.url()', function(newV, oldV) {
            switch (newV) {
                case '/home_page':
                    $scope.selectedNum = 1;
                    break;
                case '/in_theaters/':
                    $scope.selectedNum = 2;
                    break;
                case '/coming_soon/':
                    $scope.selectedNum = 3;
                    break;
                case '/top250/':
                    $scope.selectedNum = 4;
                    break;
            }
        })
    }]);

    //创建自定义指令
    // 我们创建一个自定义指令来控制loading，因为loading和页面会被各自请求一次，所以会请求两次，会出现问题
    // 现在我们把loading放到页面中，loading会继承页面中的$scope，所以只需要请求一次
    app.directive('appProcess', function() {
        return {
            templateUrl: './views/commons/process.html',
            link: function(scope, ele, attrs) {
                scope.isShow = true; //显示
            }
        }
    });
})(angular);
