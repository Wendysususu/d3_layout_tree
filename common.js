

//开始
function  getData(str){
    d3.select("svg").empty();
    d3.selectAll(".nodeLeft").remove();
    d3.selectAll(".linkLeft").remove();
    d3.selectAll(".circle").remove();
    d3.selectAll("li").remove();
    d3.selectAll(".role").remove();
    d3.selectAll(".user").remove();
    var width=d3.select("svg").attr("width");
    var height=d3.select("svg").attr("height");
    var tree=d3.layout.tree()
        .size([width-700,height-350])
        .separation(function(a,b){
            return 1.6;
        });
    d3.json(str,function(error,root)
    {
        var role=root.project;
        var users=root.users;
        var edges=root.edges;
//   第一部分、在右侧列表中显示所有的人员信息
        d3.select("#list")
            .selectAll("li")
            .data(users)
            .enter()
            .append("li")
            .html(function(d,i){
                var s='<input class="userList" type="checkbox" num=2 name="userAll" value="'+ d.name+'"/>'+ d.name;
                return s;
            })
        ;
//   第二部分、绘制左边树形部分
//     2.1设置一个全局变量用于保存左边树的所有节点信息
        var leftLeaf=[];
//     2.2 用d3的树形结构绘制左侧项目关系
        var node1=tree.nodes(role);
//     2.3 获取节点，并将树节点放在leftLeaf数组中
        for(var i=0;i<node1.length;i++)
        {
            var j=i;
            leftLeaf.push(node1[j]);
        }
        var  link1=tree.links(node1);
//      2.4 绘制树形结构的节点连线，使用d3的对角线生成器
        var diagonal=d3.svg.diagonal()
            .projection(function(d){return [d.y+30,d.x-10];});
        var linkLeft=d3.select("svg").selectAll(".linkLeft")
            .data(link1)
            .enter()
            .append("path")
            .attr("class","linkLeft")
            .attr("stroke",function(d,i){
                if(d.source.depth==0)
                {
                    return "none";
                }
                else
                {
                    return "#666";
                }
            })
            .attr("fill","none")
            .attr("d",diagonal);
//   2.5 为每个节点建立一个g.nodeLeft#id，用于保存节点的图标及描述文本等信息，并赋予g坐标，用于之后人员绘制权限连线
        var nodeLeft=d3.select("svg").selectAll(".nodeLeft")
            .data(node1)
            .enter()
            .append("g")
            .attr("class","nodeLeft")
            .attr("id",function(d){return d.id;})
            .attr("transform",function(d){
                return "translate("+ d.y+","+ d.x+")";
            })
            .attr("x",function(d){
                return d.x;
            })
            .attr("y",function(d)
            {
                return d.y;
            });
//   2.6为每个节点添加图标image
        nodeLeft.append("image")
            .attr("width",function(d,i)
            {
                if(d.depth==1)
                {
                    return 50;
                }
                else
                {
                    return 30;
                }
            })
            .attr("height",function(d,i)
            {
                if(d.depth==1)
                {
                    return 50;
                }
                else
                {
                    return 30;
                }
            })
            .attr("x",function(d,i){
                if(d.depth==1)
                {
                    return 0;
                }
                else
                {
                    return 10;
                }
            })
            .attr("y",function(d,i){
                if(d.depth==1)
                {
                    return -35;
                }
                else
                {
                    return -20;
                }
            })
            .attr("xlink:href",function(d,i){
                return "images/project/集团.png";
            });
//     2.7  为左侧项目图标添加描述文字
        nodeLeft.append("text")
            .attr("fill","#fff")
            .attr("text-anchor","middle")
            .append("tspan")
            .attr("x",function(d,i){
                if(d.depth==1){return 24;}
                else{ return 20;}
            })
            .attr("y",function(d,i){
                if(d.depth==1){return 30;}
                else{ return 20;}
            })
            .text(function(d){return d.name;});
//  第三部分、绘制右边人员
        d3.select("svg").append("image")
            .attr("xlink:href","images/project/log.png")
            .attr("x",600)
            .attr("y",440)
            .attr("width",500)
            .attr("height",10);

//            3.1绘制一个椭圆，用于存放要显示的人员
        d3.select("svg").append("ellipse")
            .attr("cx","850")
            .attr("cy","250")
            .attr("rx","250")
            .attr("ry","180")
            .style("fill","url(#grad1)");
//            3.2根据用户按首字母排序，进行分组，并生成相应的小椭圆
//            申明一个数组用于存放，所有用户姓名
        var arrUser=[];
        for(var i=0;i<users.length;i++)
        {
            arrUser.push(users[i].name);
        }
//            根据分组，生成小椭圆，并按首字母绘制
        var userPacket=pySegSort(arrUser);
        console.log(userPacket);
//遍历生成的按字母排序姓名小组，生成快捷小圆-每个小圆对应生成的数组名称首字母
        $.each(userPacket,function(i,e){
            var nav=d3.select("svg").append("g")
                .attr("class","circle")
                .attr("id",function(){return "cir"+i;});
            nav.append("circle")
                .attr("r",12)
                .attr("cx",function(){return 870+(i-userPacket.length/2)*2*16;})
                .attr("cy","500")
                .attr("stroke","#ccc")
                .attr("fill","#fff");
            nav.append("text")
                .attr("x",function(){return 870+(i-userPacket.length/2)*2*16-4;})
                .attr("y","505")
                .html(function(){return e.letter.toUpperCase();});
        });
//            默认显示第一组元素
        d3.select("#cir0").select("circle").style("fill","#f39400");
        drawPerson(showPeople(userPacket[0].data,users),edges);
        d3.selectAll(".circle")
            .on("mouseenter",function(d,i){
//                       d3.event.preventDefault();
                d3.selectAll("circle").style("fill","#fff");
                var currentEle=d3.select(this);
                currentEle.select("circle").style("fill","#f39400");
//                获取要在椭圆中显示的人员信息
                var userShow=showPeople(userPacket[i].data,users);
                console.log(userShow);
//                 根据需要显示的人员在椭圆中绘制相应的人及角色连线
                drawPerson(userShow,edges);
            });
//            5.设置按钮响应事件
//            5.1设置显示全部按钮点击事件


        $("#selectAll").click(function(){
            $(".userList").prop("checked", true).attr("num",1).attr("checked",true);
//           绘制选中的额连线
            d3.selectAll("circle").style("fill","#f39400");
            drawPerson(users,edges);
        });
        $("#selectNone").click(function(){
            $(".userList").prop("checked", false).attr("num",2).attr("checked",false);
            d3.selectAll("circle").style("fill","#fff");
            drawPerson([],[]);
        });
        var arrShowName=[];
        $(".userList").click(function(){
            if($(this).attr("checked"))
            {
                $(this).attr("num",2);
                $(this).attr("checked",false);
            }
            else
            {
                $(this).attr("num",1);
                $(this).attr("checked",true);
            }
            arrShowName.length=0;
            $(".userList")
                .each(function(i,e){
//                       console.log(e);
                    var num=$(e).attr("num");
//                       console.log(num);
                    if(num==1)
                    {
                        arrShowName.push($(this).val());
                    }
                });
            console.log(arrShowName);
            var userS=showPeople(arrShowName,users);
            drawPerson(userS,edges);

        });
    });
}

//        说明标记线及说明文字
var markers= d3.select("svg").append("g");
markers.selectAll("text")
.data(["表示可读","表示可写","表示可读可写"])
.enter()
.append("text")
.attr("fill","#fff")
.attr("x",58)
.attr("y",function(d,i){return 12+30*i;})
.text(function(d,i){return d;});
markers.selectAll(".mak")
.data([1,2,3])
.enter()
.append("path")
.attr("class","mak")
.attr("marker-end",function(d,i){
    if(d==1){
//                        红色
    return "url(#1)";
    }
    else if(d==2){
//                        绿色
    return "url(#2)";}
    else if(d==3){
//                        蓝色
    return "url(#3)";
    }
    })
.attr("stroke-width",1.5)
.attr("stroke",function(d,i){
    if(d==1){
//                        红色
    return "#DB4437";
    }
    else if(d==2){
//                        绿色
    return "#0f9d58";}
    else if(d==3){
//                        蓝色
    return "#4285F4";
    }
    })
.attr("d",function(d,i){
    var x1=10;
    var y1=8+30*i;
    var x2=50;
    var y2=8+30*i;
    x1=parseInt(x1);
    y1=parseInt(y1);
    x2=parseInt(x2);
    y2=parseInt(y2);
    var lines=[[x1,y1],[x2,y2]];
    var linePath=d3.svg.line();
    return  linePath(lines);

    });

//    绘制人员权限连线的方法
function drawLine(arr,time){
    d3.select("#arrow path")
        .transition()
        .duration(time);
    var makers=d3.select("svg").append("g");
    makers.selectAll(".role")
    .data(arr)
    .enter()
    .append("path")//"url(#2)"
    .attr("marker-end",function(d,i){
    if(d.type==1){
//                        红色
    return "url(#1)";
    }
    else if(d.type==2){
//                        绿色
    return "url(#2)";}
    else if(d.type==3){
//                        蓝色
    return "url(#3)";
    }
    })
    .attr("class","role")
    .attr("stroke-width",1.5)
    .attr("fill","none")
    .attr("stroke",function(d,i)
    {
    if(d.type==1){
//                        红色
    return "#FC0405";
    }
    else if(d.type==2){
//                        绿色
    return "#04F705";}
    else if(d.type==3){
//                        蓝色
    return "#0303FB";
    }
    })
    .attr("d",function(d,i){
    var source= d.source;
    var x1=document.getElementById(source).getAttribute("x");
    var y1=document.getElementById(source).getAttribute("y");
    x1=parseInt(x1);
    y1=parseInt(y1)+20;
    var lines=[[x1,y1],[x1,y1]];
    var linePath=d3.svg.line();
    return linePath(lines);
    })
    .attr("opacity",0.01)
    .transition()
    .duration(time)
    .attr("opacity",1)
    .attr("d",function(d,i){
            console.log(d);
    var source= d.source;
    var x1=document.getElementById(source).getAttribute("x");
    var y1=document.getElementById(source).getAttribute("y");
    var target= d.target;
    var x2=document.getElementById(target).getAttribute("y");
    var y2=document.getElementById(target).getAttribute("x");
    x1=parseInt(x1);
    y1=parseInt(y1)+20;
    x2=parseInt(x2)+46;
    y2=parseInt(y2)-2;
    var lines=[[x1,y1],[x2,y2]];
    var linePath=d3.svg.line();
    return linePath(lines);
    });
    }
// 绘制异常线的方法
function drawErrorLine(){
    var timer=[];
    d3.selectAll(".role").each(function(d,i){
    if(d.error==1)
    {
    var pain=d3.select(this);
    var n=1;
    var tim=setInterval(function(){
    if(n==1)
    {
    pain .attr("opacity",1)
    .transition()
    .duration(50)
    .attr("opacity",0.4);
    n=2;
    }
    else if(n==2)
    {
    pain.attr("opacity",0.4)
    .transition()
    .duration(50)
    .attr("opacity",1);
    n=1;
    }
    },800);
    timer.push(tim);
    }
    });
    return timer;
    }
//            声明一个方法：名字按首字母排序方法,分组排序
function pySegSort(arr,empty) {
    if(!String.prototype.localeCompare)
    return null;
    var letters = "abcdefghjklmnopqrstwxyz".split('');
    var segs = [];
    var curr;
    $.each(letters, function(i){
    curr = {letter: this, data:[]};
    $.each(arr, function(i,d) {
    if(d[0]==curr.letter) {
    curr.data.push(this);
    }
    });
    if(empty || curr.data.length) {
    segs.push(curr);
    curr.data.sort(function(a,b){
    return a.localeCompare(b);
    });
    }
    });
    return segs;
    }
//              声明一个方法，用于获取鼠标移动到圆球获取要显示的人
function showPeople(uNames,users){
    var userShow=[];
    for(var m=0;m<uNames.length;m++)
    {
    var uName=uNames[m];
    for(var n=0;n<users.length;n++)
    {
    var  userSouce=users[n];
    if(userSouce.name==uName)
    {
    userShow.push(userSouce);
    }

    }
    }
    return userShow;
    }
//    根据要显示的人员数组，绘制相应的人员
function drawPerson(arr,edges)
{
    d3.selectAll(".user").remove();
    var userImage= d3.select("svg").selectAll(".userShow")
    .data(arr)
    .enter();
    userImage
    .append("image")
    .attr("class","user")
    .attr("width","40")
    .attr("height","40")
    .attr("x",function(d,i){
    var x=Math.random()*(900-700)+700;
    return x;
    })
    .attr("y",function(d,i){
    var y=Math.random()*(380-90)+90;
    return y;
    })
    .attr("dept",function(d){return d.dept;})
    .attr("id",function(d){return d.id;})
    .attr("name",function(d){return d.name;})
    .attr("xlink:href",function(d,i)
    {
      return "images/project/集团.png";
    });
    //                        绘制人与权限之间的连线------显示的人为userShow[]---g.user
//                       设置一个数据，用于保存连线信息
    var  edagShow=[];
    for(var i=0;i<arr.length;i++)
    {
    var uID=arr[i].id;
    for(var j=0;j<edges.length;j++)
    {
    var edge=edges[j];
    if(edge.source==uID)
    {
    edagShow.push(edge);
    }
    }
    }
//                        绘制连线
    d3.selectAll(".role").remove();
    drawLine(edagShow,800);
//                        设置一个定时器变量
    var errorTimer=[];
//            4.设置异常连线
    errorTimer=drawErrorLine();
//            鼠标移动到指定的人时，只显示当前人的权限连线
    d3.selectAll(".user")
    .on("click",function(){
//                清空现有的所有连线
    d3.selectAll(".role").remove();
    d3.selectAll("marker path").attr("opacity","1");
    var source=d3.select(this).attr("id");
    var arr=[];
    for(var i=0;i<edges.length;i++)
    {
    var j=i;
    if(edges[j].source==source)
    {
    arr.push(edges[j]);
    }
    }
//                重新按要求绘制连线
    drawLine(arr,800);
    errorTimer=drawErrorLine();
    })
    .on("mouseover",function(d,i){
    d3.selectAll(".detail").remove();
    var name=d3.select(this).attr("name");
    var dept=d3.select(this).attr("dept");
    var id=d3.select(this).attr("id");
    var x=parseInt(d3.select(this).attr("x"));
    var y=parseInt(d3.select(this).attr("y"));
    var text=d3.select("svg")
    .append("g")
    .attr("class","detail")
    .attr("text-anchor","left")
    .append("text");
    text.append("tspan")
    .attr("x", x+50)
    .attr("y", y)
    .html("姓名:"+name);
    text.append("tspan")
    .attr("x",x+50)
    .attr("y",y+22)
    .html("部门:"+dept);
    text.append("tspan")
    .attr("x",x+50)
    .attr("y",y+44)
    .html("编号:"+id);
    })
    .on("mouseout",function(){
    d3.selectAll(".detail").remove();

    });

    var drag = d3.behavior.drag()
    //定义了元素拖拽行为的原点，设置为圆的圆心位置可以避免明显的元素跳动,第一个参考连接中的例子可以看到明显的跳动
    .origin(function() {
    var t = d3.select(this);
    return {
    x: t.attr("x"),
    y: t.attr("y")
    };
    })
    .on("dragstart",dragStart)
    .on("drag",dragmove);
    d3.selectAll(".user")
    .call(drag);
    function dragStart(d){
    var mId= d.id;
    var x=d3.select("#"+mId).attr("x");
    d3.select(this).attr("sx",x);
    var y= d3.select("#"+mId).attr("y");
    d3.select(this).attr("sy",y);
    console.log(x+","+y);
    }
    //定义拖拽行为，此处为重新设置元素圆心位置
    function dragmove(d) {
    d3.selectAll(".role").remove();
    var sx=d3.select(this).attr("sx");
    var sy=d3.select(this).attr("sy");
    d3.select(this)
    .attr("x", function() {
    if(d3.event.x>600&&d3.event.x<1070)
    { return d.x=d3.event.x;}
    else {return d.x=sx;}
    }
    )
    .attr("y", function() {
    if(d3.event.y>70&&d3.event.y<400)
    {
    return  d.y=d3.event.y;
    }
    else{ return d.y=sy;}
    });
//       d3.selectAll(".role").remove();
    d3.selectAll("marker path").attr("opacity","1");
    var source=d3.select(this).attr("id");
    var arr=[];
    for(var i=0;i<edges.length;i++)
    {
    var j=i;
    if(edges[j].source==source)
    {
    arr.push(edges[j]);
    }
    }
//                重新按要求绘制连线
    drawLine(arr,800);
    errorTimer=drawErrorLine();
    }

    }

