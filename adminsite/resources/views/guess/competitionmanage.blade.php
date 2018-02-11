@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
竞彩足球管理
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li class="active">竞彩足球管理</li>
</ol>
</section>
<section class="content">
<div class="row">
<form  class="form-inline" onSubmit="return selsumbit()" action="{{url('/guess/competitionmanage')}}">
<div class="box">
<div style="margin:5px 0px;clear:both; height:40px;">
<div class="col-sm-12">
期数查询:<input type="text" class="form-control" id="phase" name="phase" placeholder="输入期数"  value="{{ $data['phase'] }}">
状态: <select id="status" name="status" class="form-control" style="width:180px" >
<option value="">全部</option>
<option value="0">未开始</option>
<option value="1">完场</option> 
<option value="2">进行中</option>
<option value="3">取消</option>
<option value="4">延期</option>
<option value="5">中断</option>
</select>
是否显示: <select name="display_flag" id="display_flag" class="form-control" style="width:180px" >
<option value="">全部</option>
<option value="0">不显示</option> 
<option value="1">显示</option>
</select>

开始时间：
<div class="input-group date">
                  <div class="input-group-addon">
                    <i class="fa fa-calendar"></i>
                  </div>
                  <input type="text" class="form-control pull-right" id="starttime" name="starttime" value="{{ $data['starttime'] }}">
 </div>

结束时间：
<div class="input-group date">
                  <div class="input-group-addon">
                    <i class="fa fa-calendar"></i>
                  </div>
                  <input type="text" class="form-control pull-right"  id="endtime" name="endtime" value="{{ $data['endtime'] }}">
</div>
<button type="sumbit" class="btn btn-block btn-primary" style="width:150px; float:right">查 询</button>
<!-- <button type="button" class="btn btn-block btn-primary" style="width:150px; float:right" onclick="searchfn()">查 询</button> -->
<input type="hidden" id="typehidden" name="type" value="{{ $data['type'] }}" />
<input type="hidden" id="pagehidden" name="page" value="{{ $data['page'] }}" />
<input type="hidden" id="statushidden" name="statushidden" value="{{ $data['status'] }}" />
<input type="hidden" id="displayhidden" name="displayhidden" value="{{ $data['display'] }}" />
</div>
</div>
<div class="row" style="margin:6px;">

 <a class="btn btn-info" href="javascript:selshowbtn(1)" >显示</a>
 <a class="btn btn-primary" href="javascript:selshowbtn(0)">不显示</a>
 <a class="btn btn-warning" href="javascript:selhotbtn(1)">热门</a>
 <a class="btn btn-danger" href="javascript:selhotbtn(0)">非热门</a>
</div>
  <div class="box-body">
                    <table class="table table-bordered">
                    <tbody id="contentbox">
                        <tr>
                        <th>&nbsp;</th>
                        <th>场次</th>
                        <th>期数</th>
                        <th>赛事id</th>
                        <th>比赛时间</th>
                        <th>比赛状态</th>
                        <th >主队名称</th>
                        <th>比分</th>               
                        <th>客队名称</th>      
                        <th>胜平负</th>      
                        <th>让球</th>      
                        <th>是否显示</th>    
                        <th>是否热门</th>
                        <th>开奖状态</th>      
                        <th>操作</th>
                      </tr> 
                   
                      @foreach($dataarray as $itemdata)
                      <tr>
                      <tr>
                      <td><input type="checkbox" name="selcheck_{{$itemdata['id']}}" id="selcheck_{{$itemdata['id']}}" value="{{$itemdata['id']}}" /></td>
                      <td>{{$itemdata['official_num']}}</td>
                      <td>{{$itemdata['phase']}}</td>
                      <td>{{$itemdata['id']}}</td>
                      <td>{{$itemdata['match_date']}}</td>
                      @if($itemdata['status']==0)
                      <td>未开始</td>
                      @elseif($itemdata['status']==1)
                      <td>完场</td>
                      @elseif($itemdata['status']==2)
                      <td>进行中</td>
                      @elseif($itemdata['status']==3)
                      <td>取消</td>
                      @elseif($itemdata['status']==4)
                      <td>延期</td>
                      @elseif($itemdata['status']==5)
                      <td>中断</td>
                      @else
                      <td>--</td>
                      @endif
                      <td>{{$itemdata['home_team']}}</td>
                      <td>{{$itemdata['final_score']==""?"0:0":$itemdata['final_score']}}</td>
                      <td>{{$itemdata['away_team']}}</td>
                      @if($itemdata['odds_jingcai']!="")
                      <td>{{$itemdata['odds_jingcai'][0]['h']}}/{{$itemdata['odds_jingcai'][0]['d']}}/{{$itemdata['odds_jingcai'][0]['a']}}</td>
                      @else
                      <td>0/0/0</td>
                      @endif
                      <td>{{$itemdata['handicap']}}</td>
                      <td>{{$itemdata['display_flag']==0?"不显示":"显示"}}</td>
                      <td>{{$itemdata['hot_flag']==0?"非热门":"热门"}}</td>
                      @if($itemdata['lottery_status']==0)
                      <td>未开始</td>
                      @elseif($itemdata['lottery_status']==1)
                      <td>等待开奖</td>
                      @elseif($itemdata['lottery_status']==2)
                      <td>已开奖</td>
                      @else
                      <td>----</td>
                      @endif
                      <td>   
                      <a class="btn btn-info" href="/guess/competitionedit/{{$itemdata['id']}}" style="width:80px; line-height:0.6;float:left;margin:0px 2px;">编辑</a>
                      @if($itemdata['status']==1 and $itemdata['final_score']=="")
                      <a class="btn btn-info" href="/guess/manualsettle/{{$itemdata['id']}}" style="width:80px; line-height:0.6;float:left;margin:0px 2px;">结算</a>
                      @endif
                      </td>
                  </tr>
                  
                    </tr>
                      @endforeach
                     </tbody>
                  </table>
                  <div class="pagebox" class="text-center">
                              <!-- 这里显示分页 -->
                 </div>
                </table>
                  </div>
                </div>
                </div>

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

        $("#status").val($("#statushidden").val());
        $("#display_flag").val($("#displayhidden").val())
        $(".pagebox").html("{!! $pagelist !!}")

});

function selshowbtn(values){
  var idarrstr="";
  var checkboxarr= document.getElementById("contentbox").getElementsByTagName("input");
    for(var i=0;i<checkboxarr.length;i++){
        if( checkboxarr[i].checked){
            idarrstr=idarrstr+checkboxarr[i].value+","
        }
    }
    idarrstr = idarrstr.substr(0,idarrstr.length - 1);  
    $.get("/guess/changeracetype",
          {type:1,id:idarrstr,display:values},
                function(data){
                    if(data.errcode==200){
                        if(values==1){
                            
                              layer.alert('设置显示状态成功', {
                                skin: 'layui-layer-lan' //样式类名
                                ,closeBtn: 0
                                }, function(){
                                document.location.reload();
                                });
                             }
                             else{
                  
                              layer.alert('设置非显示状态成功', {
                                skin: 'layui-layer-lan' //样式类名
                                ,closeBtn: 0
                                }, function(){
                                document.location.reload();
                                });
                             }

                    }
                    else{
                        layer.msg(data.msg);
                    }
                }, "json");
}

function selhotbtn(values){
        var idarrstr="";
        var checkboxarr= document.getElementById("contentbox").getElementsByTagName("input");
          for(var i=0;i<checkboxarr.length;i++){
              if( checkboxarr[i].checked){
                  idarrstr=idarrstr+checkboxarr[i].value+","
              }
          }
          idarrstr = idarrstr.substr(0,idarrstr.length - 1);  
          $.get("/guess/changeracetype",
                     {type:2,id:idarrstr,hot_flag:values},
                      function(data){
                          if(data.errcode==200){
                             if(values==1){
                              layer.alert('设置热门状态成功', {
                                skin: 'layui-layer-lan' //样式类名
                                ,closeBtn: 0
                                }, function(){
                                document.location.reload();
                                });
                             }
                             else{
                              layer.alert('设置非热门状态成功', {
                                skin: 'layui-layer-lan' //样式类名
                                ,closeBtn: 0
                                }, function(){
                                document.location.reload();
                                });
                             }
      
                          }
                          else{
                              layer.msg(data.msg);
                          }
                      }, "json");
   }
 function selsumbit(){
    var phase=$("#phase").val();
    var status=$("#status").val();
    var display_flag=$("#display_flag").val();
    var starttime=$("#starttime").val();
    var endtime=$("#endtime").val();
    if(starttime!="" && endtime==""){
     layer.msg("请输入结束时间")
     return false;
    }
    if(endtime!="" && starttime==""){
      layer.msg("请输入开始时间")
     return false; 
    }
    if(phase!=""){
     $("#typehidden").val(2)
    }
     if(status!=""){
     $("#typehidden").val(3)
    }
     if(display_flag!="")
    {
        $("#typehidden").val(4)
    }
    
     if(starttime!="" &&  endtime!="")
    {
        $("#typehidden").val(5)
    }
     if(display_flag!=""&& status!="")
    {
        $("#typehidden").val(6)
    }
     if(status!=""&& starttime!="" &&  endtime!="")
    {
        $("#typehidden").val(7)
    }
     if(display_flag!=""&& starttime!="" &&  endtime!="")
    {
        $("#typehidden").val(8)
    }
     if(display_flag!="" && status!=""&& starttime!="" && endtime!="")
    {
        $("#typehidden").val(9)
    }
    if(display_flag=="" && status=="" && starttime=="" && endtime=="" && phase=="")
    {
        $("#typehidden").val(1)
    }
    $("#pagehidden").val(1);
    return true;
  }


</script>
</form>

</section>
@endsection
