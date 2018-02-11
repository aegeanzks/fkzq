@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
虚拟足球竞猜记录
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li class="active">虚拟足球竞猜记录</li>
</ol>
</section>
<section class="content">
<div class="row">
<form  class="form-inline" onSubmit="return selsumbit()" action="{{url('/vfootball/compeetitivrecord')}}">
<div class="box">
<div style="margin:5px 0px;clear:both; height:40px;">
<div class="col-sm-11">
期号查询:<input type="text" class="form-control" id="balance_schedule_id" name="balance_schedule_id" placeholder="输入期号"  value="{{ $data['balance_schedule_id'] }}">
账号查询:<input type="text" class="form-control" id="user_name" name="user_name" placeholder="输入账号"  value="{{ $data['user_name'] }}">
状态: <select id="status" name="status" class="form-control" style="width:180px" >
<option value="">全部</option>
<option value="0">未开奖</option>
<option value="1">不中</option> 
<option value="2">中</option>
</select>
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
<button type="sumbit" class="btn btn-block btn-primary" style="width:150px;">查 询</button>
<input type="hidden" id="typehidden" name="type" value="{{ $data['type'] }}" />
<input type="hidden" id="statushidden" name="statushidden" value="{{ $data['status'] }}" />
<input type="hidden" id="pagehidden" name="page" value="{{ $data['page'] }}" />
</div>
</div>
  <div class="box-body">
                    <table class="table table-bordered">
                    <tbody id="contentbox">
                        <tr>
                        <th>下注时间</th>
                        <th>期号</th>
                        <th>账号</th>
                        <th>下注项</th>
                        <th>下注金额</th>               
                        <th>派奖金额</th> 
                        <th>下注前金额</th>     
                        <th>状态</th>    
                      </tr> 
                   
                      @foreach($dataarray as $itemdata)
                      <tr>
                      <td>{{$itemdata['bet_date']}}</td>
                      <td>{{$itemdata['balance_schedule_id']}}</td>
                      <td>{{$itemdata['user_name']}}</td>
                      <td>{{$itemdata['bet_area']}}</td>
                      <td>{{$itemdata['bet_coin']}}</td>
                      <td>{{$itemdata['distribute_coin']}}</td>
                      <td>{{$itemdata['before_bet_coin']}}</td>
                      @if($itemdata['status']==0)
                      <td>未开奖</td>
                      @elseif($itemdata['status']==1)
                      <td>不中</td>
                      @elseif($itemdata['status']==2)
                      <td>中</td>
                      @else
                      <td>--</td>
                      @endif
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
    var user_name=$("#user_name").val();
    var balance_schedule_id=$("#balance_schedule_id").val();
    var status=$("#status").val();
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
    if(user_name!=""){
     $("#typehidden").val(2)
    }
    if(balance_schedule_id!=""){
     $("#typehidden").val(3)
    
    }
    if(status!="")
    {
     $("#typehidden").val(4)
    }
    if(start_time!="" &&  end_time!="")
    {
        $("#typehidden").val(5)
    }
    if(status!="" && start_time!="" &&  end_time!="")
    {
        $("#typehidden").val(6)
    }
    if(user_name!=""&& start_time!="" &&  end_time!="")
    {
        $("#typehidden").val(7)
    }
    if(balance_schedule_id!="" && start_time!="" &&  end_time!="")
    {
        $("#typehidden").val(8)
    }
    if(user_name!="" && status!="" && start_time!="" && end_time!="")
    {
        $("#typehidden").val(9)
    }
    if(balance_schedule_id!=""&& status!="" && start_time!="" && end_time!="")
    {
        $("#typehidden").val(10)
    }
    if(balance_schedule_id!=""&& status!="" && start_time!=""&& end_time !="" &&user_name!=""){
        $("#typehidden").val(11)
    }
    if(balance_schedule_id!="" && user_name!=""){
        $("#typehidden").val(12);
    }
    if(user_name!="" && status !=""){
        $("#typehidden").val(14);
    }
    if(balance_schedule_id!="" && status !=""){
        $("#typehidden").val(15);
    }
    if(balance_schedule_id!="" && user_name!="" && status !=""){
        $("#typehidden").val(13);
    }
    if(balance_schedule_id==""&& status=="" && start_time=="" && end_time=="" && user_name ==""){
      $("#typehidden").val(1)
    }
     $("#pagehidden").val(1);
    return true;
  }


</script>
</form>

</section>
@endsection
