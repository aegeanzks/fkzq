@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
虚拟足球开奖记录
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li class="active">虚拟足球开奖记录</li>
</ol>
</section>
<section class="content">
<div class="row">
<form  class="form-inline" onSubmit="return selsumbit()" action="{{url('/vfootball/matchlist')}}">
<div class="box">
<div style="margin:5px 0px;clear:both; height:40px;">
<div class="col-sm-11">
期数查询:<input type="text" class="form-control" id="date" name="date" placeholder="输入期数"  value="{{ $data['date'] }}">
期号查询:<input type="text" class="form-control" id="date_num" name="date_num" placeholder="输入期号"  value="{{ $data['date_num'] }}">

开始时间：
<div class="input-group date">
                  <div class="input-group-addon">
                    <i class="fa fa-calendar"></i>
                  </div>
                  <input type="text" class="form-control pull-right" id="start_time" name="start_time" value="{{ $data['start_time'] }}">
 </div>

结束时间：
<div class="input-group date">
                  <div class="input-group-addon">
                    <i class="fa fa-calendar"></i>
                  </div>
                  <input type="text" class="form-control pull-right"  id="end_time" name="end_time" value="{{ $data['end_time'] }}">
</div>

</div>
<div class="col-sm-1">
<button type="sumbit" class="btn btn-block btn-primary" style="width:150px; float:right">查 询</button>
<!-- <button type="button" class="btn btn-block btn-primary" style="width:150px; float:right" onclick="searchfn()">查 询</button> -->
<input type="hidden" id="typehidden" name="type" value="{{ $data['type'] }}" />
<input type="hidden" id="pagehidden" name="page" value="{{ $data['page'] }}" />
</div>
</div>
  <div class="box-body">
                    <table class="table table-bordered">
                    <tbody id="contentbox">
                        <tr>
           
                        <th>期数</th>
                        <th>期号</th>
                        <th>主队</th>
                        <th>比分</th>               
                        <th>客队</th>      
                        <th>下注金额</th>      
                        <th>派奖金额</th>
                        <th>操作</th>      
                     
                      </tr> 
                   
                      @foreach($dataarray as $itemdata)
                      <tr>
                      <td>{{$itemdata['date']}}</td>
                      <td>{{$itemdata['date_num']}}</td>
                      <td>{{$itemdata['host']}}</td>
                      <td>{{$itemdata['score']}}</td>
                      <td>{{$itemdata['guest']}}</td>
                      <td>{{$itemdata['all_bet']}}</td>
                      <td>{{$itemdata['distribution']}}</td>
                      <td>   
                      <a class="btn btn-info" href="/guess/compeetitivrdetail/{{$itemdata['date_num']}}" style="width:80px; line-height:0.6;float:left;margin:0px 2px;">查看详情</a>
                      </td>
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
        $('#start_time').datepicker({
         format: 'yyyy-mm-dd',
        autoclose: true
        });
        $('#end_time').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true
        });
        $("#status").val($("#statushidden").val());
        $(".pagebox").html("{!! $pagelist !!}")
});


 function selsumbit(){
    var date=$("#date").val();
    var date_num=$("#date_num").val();
    var start_time=$("#start_time").val();
    var end_time=$("#end_time").val();
    if(start_time!="" && end_time==""){
     layer.msg("请输入结束时间")
     return false;
    }
    if(end_time!="" && start_time==""){
      layer.msg("请输入开始时间")
     return false; 
    }
    if(date!=""){
     $("#typehidden").val(2)
    }
    if(date_num!=""){
     $("#typehidden").val(3)
    }
    if(start_time !="" && end_time != ""){
      $("#typehidden").val(4)
    }
    if(date!="" && date_num!=""){
        $("#typehidden").val(1)  
        $("#date").val("")
        $("#date_num").val("")
    }
    if(date =="" && date_num =="" && start_time == "" && end_time == ""){
      $("#typehidden").val(1)
    }
    $("#pagehidden").val(1);
    return true;
  }


</script>
</form>

</section>
@endsection
