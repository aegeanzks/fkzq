@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
游戏设置列表
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li>游戏设置列表</li>
  <li class="active">游戏基本配置</li>
</ol>
</section>
<section class="content">
<div class="row">
<ul class="nav nav-tabs">
  <li class="active"><a href="#event" data-toggle="tab">事件配置</a></li>
  <li><a href="{{url('/system/gameoodinfo')}}" >赔率配置</a></li>
  <li><a href="{{url('/system/gamegoalsinfo')}}" >进球配置</a></li>
</ul>
<div class="tab-content">
  <div class="tab-pane active" id="event">
  <div class="box">
  <div class="box-body">
  <form  class="form-inline" method="get" action="{{ url('/system/gameeventsetupdate')}}">
  <table class="table table-bordered">
    <tbody id="bodycontent">
            <tr>
              <th>事件</th>
              <th>主队控球(%)</th>
              <th>主队进攻(%)</th>
              <th>主队危险进攻(%)</th>
              <th>客队控球(%)</th>
              <th>客队进攻(%)</th>
              <th>客队危险进攻(%)</th>
              <th>动画时间(t)</th>
              <th>伴随封盘动画（%）</th>
            </tr> 
            @foreach($eventdata as $data)
            <tr>
             <td>{{ $data['event_name']}}</td>
             <td><input type="text" class="form-control"  name="host_ball_handling_{{ $data['event_id']}}" value="{{ $data['host_ball_handling']}}" oldvalue="{{ $data['host_ball_handling']}}" /></td>
             <td><input type="text" class="form-control"  name="host_attack_{{ $data['event_id']}}" value="{{ $data['host_attack']}}" oldvalue="{{ $data['host_attack']}}" /></td>
             <td><input type="text" class="form-control"  name="host_dangerous_attack_{{ $data['event_id']}}" value="{{ $data['host_dangerous_attack']}}" oldvalue="{{ $data['host_dangerous_attack']}}" /></td>
             <td><input type="text" class="form-control"  name="guest_ball_handling_{{ $data['event_id']}}" value="{{ $data['guest_ball_handling']}}"  oldvalue="{{ $data['guest_ball_handling']}}" /></td>
             <td><input type="text" class="form-control"  name="guest_attack_{{ $data['event_id']}}" value="{{ $data['guest_attack']}}"   oldvalue="{{ $data['guest_attack']}}"/></td>
             <td><input type="text" class="form-control"  name="guest_dangerous_attack_{{ $data['event_id']}}" value="{{ $data['guest_dangerous_attack']}}"  oldvalue="{{ $data['guest_dangerous_attack']}}" /></td>
             <td><input type="text" class="form-control"  name="animation_time_{{ $data['event_id']}}" value="{{ $data['animation_time']}}"  oldvalue="{{ $data['animation_time']}}"  /></td>
             @if($data['event_id']==3 || $data['event_id']==6)
             <td><input type="text" class="form-control"  name="blockade_{{ $data['event_id']}}" value="{{ $data['blockade']}}"  oldvalue="{{ $data['blockade']}}"   /></td>
             @else
             <td><input type="text" class="form-control"  name="blockade_{{ $data['event_id']}}" value="{{ $data['blockade']}}"  oldvalue="{{ $data['blockade']}}"  readonly="readonly"  /></td>
             @endif
        </tr>
            @endforeach
           </tbody>
        </table>
      <div class="row">
      <button type="submit" class="btn btn-primary" style="width:80px; margin-left:10px; float:left">保 存</button>

      &nbsp; &nbsp; &nbsp;
							<button class="btn" type="reset">
								<i class="icon-undo bigger-110"></i>
								重 置
							</button>
  
      </div>
</form>
</div>               
</div>
<script>
$(function () {
$('#myTab a:last').tab('show');
$('.form-control').width('130px')
$("#bodycontent input").bind("change",function(){
  if( $(this).val()=="")
  {
    $(this).val($(this).attr("oldvalue"))
  }
  /*else{
    if(parseInt($(this).val())<1 || parseInt($(this).val())>100 )
    {
      layer.alert("输入值在1-100之间") ;
      $(this).val($(this).attr("oldvalue"))
    }
  }*/
})
// $('#myTab a').click(function (e) {
// e.preventDefault();
// $(this).tab('show');
})
</script>
</div>
</div>
</div>
</section>
@endsection
