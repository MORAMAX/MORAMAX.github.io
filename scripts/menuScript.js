sfHover=function(){var e=document.getElementById("mainNav").getElementsByTagName("LI");for(var t=0;t<e.length;t++){e[t].onmouseover=function(){this.className+=" sfhover"};e[t].onmouseout=function(){this.className=this.className.replace(new RegExp(" sfhover\\b"),"")}}};if(window.attachEvent)window.attachEvent("onload",sfHover)