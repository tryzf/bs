new function (){
    var _self = this;
    _self.width = 1200;//设置默认最大宽度
    _self.fontSize = 100;//默认字体大小
    _self.widthProportion = function(){
        var p = (document.body&&document.body.clientWidth||document.getElementsByTagName("html")[0].offsetWidth)/_self.width;
            return p>1?1:p<0.4?0.5:p;
    };//判断当前屏幕尺寸，设置的最大屏幕宽度之间的比例
    _self.changePage = function(){
        document.getElementsByTagName("html")[0].setAttribute("style","font-size:"+_self.widthProportion()*_self.fontSize+"px !important");
    }//修改根元素html的font-size的植
    _self.changePage();
    window.addEventListener('resize',function(){
        _self.changePage();
    },false);//侦听屏幕宽度变化
};


function GoTop() {
    var fixed_obj = $("#js_fiexd_module");
    $(window).scroll(function(){
        var scroll_top = $(window).scrollTop();
        if(scroll_top > 560) {
            fixed_obj.fadeIn(600).css({bottom:".3rem"});
        }else{
            fixed_obj.fadeOut(200);
        } 
        
    });
    fixed_obj.on("click", function(){
        $("html,body").animate({scrollTop:0},1000);
        var wind_h = $(window).height();
        fixed_obj.addClass("actives").animate({bottom:wind_h,opacity:0}, 1500, function(){
            fixed_obj.css({opacity:1,display:"none",bottom:"-.5rem"}).removeClass('actives');
        });
    });
}

function GoLoginPage(obj){
    var count = 0;
    $(obj).on("click", function(){
        count += 1;
        if(count === 3){
            location.href = "/login"
        }
    });
}


//运行公共的函数
$(document).ready(function(){
    GoTop(); //滚动条置顶
    GoLoginPage('#js_header_pic');
});

//注册
function regUser(){
    var name = $(':input[name="name"]').val();
    var password = $(':input[name="password"]').val();
    var password_sure = $(':input[name="password_sure"]').val();
    var email = $(':input[name="email"]').val();
    if(!name){
        alert('帐号不能为空！');
        return false;
    }
    if(!password){
        alert('密码不能为空！');
        return false;
    }
    if(password !== password_sure){
        alert('前后密码不一致！');
        return false;
    }
    var select_email = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(email);
    if(!select_email){
        alert('邮箱地址不正确!');
        return false;
    }
    $.ajax({
        url:'/reg',
        type:'POST',
        data:{name:name, password: password, password_sure: password_sure, email: email},
        success: function(data) {
            var error = data['error'];
            if(error) {
                alert(error);
                return false;
            }
            alert(data['success']);
            window.location.href="/login"
        },
        error:function(){
            alert('未知错误！');
        }
    });
}

function login(){
    var name = $('#js_user').val();
    var password = $('#js_password').val();
    if(!(name && password)){
        alert('帐号或者密码不能为空！');
        return false;
    }
    $.ajax({
        url:'/login',
        type:'POST',
        data:{name:name, password:password},
        success:function(data){
            var error = data.error;
            if(error){ 
                alert(error);
                return false; 
            }
            alert(data.success);
            document.location.href =  '/post';
        },
        error: function(){
            alert('未知错误!');
        }
    });
}

function post() {
    var title = $('#js_title').val();
    var content = $('#js_content').val();
    var tag = $("#js_tags").val();
    $.ajax({
        url : '/post',
        type: 'POST',
        data: {title: title, post: content, tags: tag },
        success: function(data) {
            var error = data.error;
            if(error) {
                alert(error);
                return false;
            }
            alert(data['success']);
            document.location.href = "/";
        },
        error: function() {
            alert("未知错误");
        }
    })
}

function setBlogBase(){
    var blog_name = $("#js_blog_name").val();
    var blog_motto = $('#js_motto').val();
    $.ajax({
        url:'/base',
        type:'POST',
        data: {"title":blog_name, "motto": blog_motto},
        success: function(data) {
            if(data.error) {
                alert(data.error);
                return false;
            }
            alert(data.success);
        }
    });
}
//获取热门列表
 
 function GetHotList(callback) {
    var result = "";
    $.ajax({
        url:'/hot_blog',
        type:'GET',
        success: function(data) {
            if(data.error){
                return false;
            }
            result = data.result;
            for(var i = 0; i < result.length; i += 1){
                var href = '/u/' + result[i].name + '/' + result[i].time.day + '/' + result[i].title;
                var content = '<li><a href='+ href +'>' + result[i].title + "</a></li>";
                $('#js_hot_list').append(content); 
            }
            callback();
        }
    });
 }

 //获取 个人信息

 function getUserInfo(){
    var $title = $("#js_blog_title"),
        $motto = $("#js_blog_motto"),
        title = null,
        motto = null;

    $.ajax({
        url:'/get_info',
        type:'GET',
        success: function(data) {
            var error = data.error,
                motto = null;
                title = null;

            if(data.error) {
                motto = '未设置座右铭';
                title = '未设置博客名';
            }else{
                title = data.success.title;
                motto = data.success.motto;            
            }
            $title.text(title);
            $motto.text(motto);
        }
    });
 }

//获取最新文章

function getNewArticle(callback){
    $.ajax({
        url:'/new_blog',
        type:'GET',
        success: function(data){
            var error = data.error;
            var msg = data.success;
            if(error){
                alert(error);
                return false;
            }
           for(var i = 0; i < 4; i += 1){
                var href = '/u/' + msg[i].name + '/' + msg[i].time.day + '/' +msg[i].title;
                var content = '<li><a href=' + href + '>' + msg[i].title + "</a></li>";
                $('#new_blog_title').append(content);
           }
            callback();
        }
    })
}