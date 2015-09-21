 $(function(){
  
  var width=0;
  if(screen.width<767)
  {
    $('.content_google_map .content').after($('.content_google_map .pic'));
   }
  else{
    var width=$('#wrapper').width();
  }
  $('.scan_img').width(width);
  var curIndex = 0;
  var isSlideLeft=true;
  var isSlideRight=true; 
  imgLen = $(".imgList li").length;
  $(".indexList").find("li").each(function(item){ 
      $(this).hover(function(){ 
          changeTo(item);
          curIndex = item;
      },function(){ 
      });
  });
  function changeTo(num){ 
      var width=$('#wrapper').width();
      if(screen.width<768)
      {
         width=width+480;
        var goLeft = num * width;
        $(".imgList").animate({left: "-" + goLeft + "px"},100);
      }
      if(screen.width==768)
      {
        var goLeft = num * width;
        $(".imgList").animate({left: "-" + goLeft + "px"},20);
      }
      else{
        var goLeft = num * width;
        if(curIndex==0&&isSlideLeft)
        {
           $(".imgList").animate({left: "-" + goLeft + "px"},50);
        }else if(curIndex==(imgLen-1)&&isSlideRight)
        {
           $(".imgList").animate({left: "-" + goLeft + "px"},50);
        }
        else
        {
           $(".imgList").animate({left: "-" + goLeft + "px"},150);
        }      
      }
      $(".infoList").find("li").removeClass("infoOn").eq(num).addClass("infoOn");
      $(".indexList").find("li").removeClass("indexOn").eq(num).addClass("indexOn");
  }
    function immidateChangeTo(num){ 
      var width=$('#wrapper').width();
      var goLeft = num * width;
      $(".imgList").animate({left: "-" + goLeft + "px"},1);
      $(".infoList").find("li").removeClass("infoOn").eq(num).addClass("infoOn");
      $(".indexList").find("li").removeClass("indexOn").eq(num).addClass("indexOn");
  }
  var startX=0;
  var startY=0;
  function touchStart(event) {
       event.preventDefault();
       var touch = event.changedTouches[0];
       startX = touch.pageX;
       startY = touch.pageY;
   }
  function touchMove(event) {
       
      
  }
  function touchEnd(event) {
       
      var touch = event.changedTouches[0],
      x = touch.pageX - startX,
      y = touch.pageY - startY;
      if(Math.abs(x)>Math.abs(y))
        if(x>0)
        {
          toLeftSlider(); 
        }
       else
        {
         toRightSlider();
        }
   }
   $('#arrow_right').click(function(){
       toRightSlider();
   });
   window.onresize = function(){
    var screen_width=$(window).width(); 

    if(screen_width<800)
     {
       var width=screen_width*0.9125;
       // $('.scan_img').css('width', width);
       
     }
     if(isPc())
     {
        var width=0.0;
        if(screen_width<768)
        {
          width=screen_width*0.9125;
        }
        else
        {
          width=screen_width*0.65028;
        }
        var li= "<li><img class="+"\"scan_img\""+"src="+"\"resources/image/BubbleReferenceLine.svg\""+" style="+"\"width:"+width+"\""+"></li>"+
            "<li><img class="+"\"scan_img\""+"src="+"\"resources/image/BarHierarchy.svg\""+" style="+"\"width:"+width+"\""+"></li>"+
            " <li><img class="+"\"scan_img\""+"src="+"\"resources/image/TimeAxis.svg\""+" style="+"\"width:"+width+"\""+"></li>"+
            " <li><img class="+"\"scan_img\""+"src="+"\"resources/image/TagCloud.svg\""+" style="+"\"width:"+width+"\""+"></li>"+
            " <li><img class="+"\"scan_img\""+"src="+"\"resources/image/HichertChart.svg\""+" style="+"\"width:"+width+"\""+"></li>"+
            " <li><img class="+"\"scan_img\""+"src="+"\"resources/image/GeoMap.png\""+" style="+"\"width:"+width+"\""+"></li>"+
            "<li><img class="+"\"scan_img\""+"src="+"\"resources/image/SemanticChart.svg\""+" style="+"\"width:"+width+"\""+"></li>";
        var str="<li style="+"\"width:"+width+"\""+"><a href="+"\"#\""+">";
    if($('.content_open_sdk .content').height()-$('.content_open_sdk .pic').height()>0)
      {
        $('.content_open_sdk .pic').css('padding-top',($('.content_open_sdk .content').height()+8-137)/2);
      }
        $('.imgList').html(li);
        immidateChangeTo(curIndex);
     }
   }
   function isPc()
   {
     var userAgentInfo=navigator.userAgent;
     var agents=new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
     var flag=true;
     for(var i=0;i<agents.length;i++)
     {
       if(userAgentInfo.indexOf(agents[i])>0)
       {
        flag=false;
        break;
       }
     }
     return flag;
   }
  $('#arrow_left').click(function(){
        toLeftSlider();
   });
   function toLeftSlider()
  {
    isSlideRight=false;
    curIndex = (curIndex < imgLen-1) ? (++curIndex) : 0;
    changeTo(curIndex);
  }
  function toRightSlider()
  {
      isSlideLeft=false;
     if(curIndex>0)
      {
         --curIndex;
         changeTo(curIndex);
      }
      else
      {
        curIndex=imgLen-1;
        changeTo(curIndex);
      }
  }
    var scan_center=document.getElementById('banner');
   scan_center.addEventListener("touchend", touchEnd, false);
   scan_center.addEventListener("touchstart", touchStart, false);
   scan_center.addEventListener("touchmove", touchMove, false);
   });