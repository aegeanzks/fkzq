@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
竞彩足球记录
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/guess/competitionrecords')}}">竞彩足球记录<</a></li>
  <li class="active">投注方案</li>
</ol>
</section>
<section class="content">
<div class="row">
<form  class="form-inline">
<div class="box">
<div style="margin:5px 0px;clear:both; height:40px;">
<div class="col-sm-9">
账号查询:<input type="text" class="form-control" id="account" name="account" placeholder="输入账号">
状态: <select name="status" class="form-control" style="width:180px" >
<option value="">全部</option>
<option value="1">未开奖</option> 
<option value="2">中</option>
<option value="3">不中</option>

</select>

开始时间：
<div class="input-group date">
                  <div class="input-group-addon">
                    <i class="fa fa-calendar"></i>
                  </div>
                  <input type="text" class="form-control pull-right" id="starttime" name="starttime">
 </div>

结束时间：
<div class="input-group date">
                  <div class="input-group-addon">
                    <i class="fa fa-calendar"></i>
                  </div>
                  <input type="text" class="form-control pull-right"  id="endtime" name="endtime">
</div>
</div>
<div class="col-sm-1">

</div>
</div>
<div class="box-body">
                    <table class="table table-bordered">
                    <tbody>
                        <tr>
                        <th>下注时间</th>
                        <th>账号</th>
                        <th>注数</th>
                        <th>倍数</th>
                        <th>下注金额</th>
                        <th>派奖金额</th>          
                        <th>下注前金额</th>        
                        <th>状态</th>      
                        <th>操作</th>      
                       
                      </tr> 
                      <tr>
    
                       <td>2017/12/13 12：00</td>
                       <td>zzq</td>
                       <td>20</td>
                       <td>1</td>
                       <td>40</td>
                       <td>5500</td>
                       <td>中</td>

                       <td>   
                         <a class="btn btn-info" href="{{ url('/user/getinfo/1')}}" style="width:80px; float:left;margin:0px 2px;">投注方案</a>
                       </td>
                      </tr>
                      <tr>
      
                       <td>2017/12/13 12：00</td>
                       <td>zzq</td>
                       <td>20</td>
                       <td>1</td>
                       <td>40</td>
                       <td>5500</td>
                       <td>中</td>

                       <td>   
                         <a class="btn btn-info" href="{{ url('/user/getinfo/1')}}" style="width:80px; float:left;margin:0px 2px;">投注方案</a>
                       </td>
                      </tr>
                      <tr>
                   
                       <td>2017/12/13 12：00</td>
                       <td>zzq</td>
                       <td>20</td>
                       <td>1</td>
                       <td>40</td>
                       <td>5500</td>
                       <td>中</td>

                       <td>   
                         <a class="btn btn-info" href="{{ url('/user/getinfo/1')}}" style="width:80px; float:left;margin:0px 2px;">投注方案</a>
                       </td>
                      </tr>
                     </tbody>
                  </table>
                  <div class="text-center"></div>
                </table>
                  </div>
                </div>
                </div>
</form>
<script>
    $(function(){
        $('#starttime').datepicker({
     format: 'yyyy-mm-dd',
      autoclose: true
    });
        $('#endtime').datepicker({
      format: 'yyyy-mm-dd',
      autoclose: true
    });
     loaddata(1,1);
    });



    function searchfn(){
     $("#pageinit").val('0'); 
    var account=$("#account").val();
    var status=$("#status").val();
    var starttime=$("#starttime").val();
    var endtime=$("#endtime").val();
    if(starttime!="" && endtime==""){
     layer.msg("请输入结束时间")
     return;
    }
    if(endtime!="" && starttime==""){
      layer.msg("请输入开始时间")
     return; 
    }
    if(account!=""){
        loaddata(2,1);
    }
    else if(status!=""){
        loaddata(3,1);
    }
    else if(starttime!="" &&  endtime!="")
    {
        loaddata(4,1);
    }
    else if(account!=""&& status!="")
    {
        loaddata(5,1);
    }
    else if(account!="" && starttime!="" &&  endtime!="")
    {
        loaddata(6,1);
    }
    else if( account!="" &&  status!=""&& starttime!="" &&  endtime!="")
    {
        loaddata(7,1);
    }
    else if(status!=""&& starttime!="" && endtime!="")
    {
        loaddata(8,1);
    }
    else{
        loaddata(1,1);
    }
  }

function loaddata(type,pageindex){
    var bodyhtml="";
    var getparam="";
    var account=$("#account").val();
    var status=$("#status").val();
    var starttime=$("#starttime").val();
    var endtime=$("#endtime").val();
    if(type==1)
    {
        getparam="type=1&page="+pageindex;
        $("#typehidden").val('1');
    }
    else if(type==2){
        getparam="type=2&account="+phase+"&page="+pageindex;;
        $("#typehidden").val('2');
    }
    else if(type==3){
        getparam="type=3&status="+status+"&page="+pageindex;  
        $("#typehidden").val('3');
    }
    else if(type==4){
        getparam="type=4&begin_time="+starttime+"&end_time="+endtime+"&page="+pageindex; 
        $("#typehidden").val('4');
    }
    else if(type==5){
        getparam="type=5&account="+account+"&status="+status+"&page="+pageindex; 
        $("#typehidden").val('5');
    }
    else if(type==6){
        getparam="type=6&account="+account+"&begin_time="+starttime+"&end_time="+endtime+"&page="+pageindex; 
        $("#typehidden").val('6');
    }
    else if(type==7){
        getparam="type=7&account="+account+"&status="+status+"&begin_time="+starttime+"&end_time="+endtime+"&page="+pageindex;
        $("#typehidden").val('7'); 
    }
    else if(type==8){
        getparam="type=8&status="+status+"&begin_time="+starttime+"&end_time="+endtime+"&page="+pageindex;  
        $("#typehidden").val('8'); 
    }

$.ajax({
  //  url:'http://192.168.0.232:9090/RealFootball/list?'+getparam,
    url:'http://127.0.0.1:9090/RealFootball/list?'+getparam,
    type:'GET', //GET
    async:true,    //或false,是否异步
    timeout:5000,    //超时时间
    dataType:'json',    //返回的数据格式：json/xml/html/script/jsonp/text
    beforeSend:function(xhr){
        layer.load(2);
    },
    success:function(data,textStatus,jqXHR){
     var repstatus=0;
     var total=0;
      if(typeof(data.length)=='undefined'){
        repstatus=data.status;

         }
     else{
        repstatus=data[0].status;
      }
 if(repstatus==200){
    var datarows=data[1];
    var total=data[0].totalCount;
    for(var i=0;i<datarows.length;i++){

        bodyhtml+=" <tr>"
        bodyhtml+=" <td>"+"2017-12-14"+"</td>";
        bodyhtml+=" <td>"+"zz1"+"</td>";
        bodyhtml+=" <td>"+"22"+"</td>";
        bodyhtml+=" <td>"+"1"+"</td>";
        bodyhtml+=" <td>"+"500"+"</td>";
        bodyhtml+=" <td>"+"5000+"</td>";
        bodyhtml+=" <td>"+"3000+"</td>";
        bodyhtml+=" <td>"+fnstatus(parseInt(1))+"</td>";
        bodyhtml+=' <a class="btn btn-info" href="/guess/competitionedit/'+"1"+'" style="width:80px; float:left;margin:0px 2px;">投注方案</a>'
        bodyhtml+=" </tr>";
    }
      $("#contentbox").html(bodyhtml);
     var ispageinit= $("#pageinit").val();  
        if(ispageinit=="0"){           //第一次加载初始化分页控件
            $("#pageinit").val("1");
            pageinit(total);
        }
    }
    else if(repstatus==0){
        $("#pageinit").val("0");
        $("#contentbox").html("");
        $("#Pagination").html("");
        layer.msg('无相关数据');
    }
     else if(repstatus==2){
        $("#pageinit").val("0");
        $("#contentbox").html("");
        $("#Pagination").html("");
        layer.msg('查询参数出现错误');
     }
     else {
        $("#pageinit").val("0");
        $("#contentbox").html("");
        $("#Pagination").html("");
        layer.msg('加载出错,请稍后再试');
     }
    },
    error:function(xhr,textStatus){
        layer.closeAll('loading');
    },
    complete:function(){
        layer.closeAll('loading');
    }
   });
}
function fnstatus(statusvalue){
    var statusstr="";
    switch (statusvalue){
        case 0:
        statusstr="未开奖";
        break;
        case 1:
        statusstr="中";
        break;
        case 2:
        statusstr="不中";
        break;
    }
    return statusstr;
}
function pageinit(totals){
    $("#Pagination").pagination(totals, 
    { //total不能少 
    callback: PageCallback, 
    prev_text: '上一页', 
    next_text: '下一页', 
    items_per_page: 10, 
    num_display_entries: 4, //连续分页主体部分显示的分页条目数
    num_edge_entries: 1, //两侧显示的首尾分页的条目数 
    });  
   
}
function PageCallback(index, jq) { //前一个表示您当前点击的那个分页的页数索引值，后一个参数表示装载容器。 
      var type=parseInt($("#typehidden").val()); //查询
        $("#curpagehidden").val(index+1);
        loaddata(type,index+1)
    } 
</script>
</section>
@endsection
