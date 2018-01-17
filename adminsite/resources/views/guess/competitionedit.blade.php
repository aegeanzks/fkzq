@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
编辑赛事
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/guess/competitionmanage')}}">比赛管理</a></li>
  <li class="active">编辑赛事</li>
</ol>
</section>
<section class="content">
<div class="box box-warning">
<div class="box-header with-border">
  <h3 class="box-title">编辑</h3>
</div>
<!-- /.box-header -->
<div class="box-body">
<form role="form" onsubmit="return checksubmit()" action="{{url('/guess/competitionupdate')}}">
<div class="box-header with-border">
    <h3 class="box-title">基础信息</h3>
 </div>
    <!-- text input -->
    <div class="form-group">
      <label>比赛时间</label>
    <div class="input-group date">
        <div class="input-group-addon">
        <i class="fa fa-calendar"></i>
        </div>
    <input type="text" class="form-control pull-right" id="match_date" name="match_date" value="{{$data[0]['match_date']}}"  readonly="readonly" />
 </div>
</div>
    <div class="form-group">
      <label>主队名称</label>
      <input type="text" name="hometeam" id="home_team" class="form-control" placeholder="输入主队名称" value="{{$data[0]['home_team']}}"  />
    </div>
    <div class="form-group">
      <label>客队名称</label>
      <input type="text" name="awayteam" id="away_team"  class="form-control" placeholder="输入客队名称" value="{{$data[0]['away_team']}}" />
</div>
<div class="form-group">
 <label>全场比分</label>
 @if($data[0]['lottery_status']==0)
 <input type="text" name="final_score" id="final_score"  class="form-control" placeholder="输入" value="{{$data[0]['final_score']}}" />
 @else
 <input type="text" name="final_score" id="final_score"  class="form-control" placeholder="输入" value="{{$data[0]['final_score']}}"  readonly="readonly" />
 @endif
</div>
<div class="box-header with-border">
              <h3 class="box-title">赔率修改</h3>
 </div>
 <div class="row">
 <div class="col-sm-12" style="padding-top:8px;">
<div class="form-group">
<label>
  <input type="radio" name="input_flag" value="0" />
  启动抓取数据
</label>
<label>
  <input type="radio" name="input_flag" value="1"/>
 启动管理员录入数据
 </label>
</div>
</div>
</div>
<div class="row"  style="padding-top:20px;">
   <div class="col-sm-2">
   <label>   胜平负玩法</label>
   </div>
    <div class="col-sm-2">
    <label>主胜</label>
    <input type="text" name="oddsjingcaihostwin" id="odds_jingcaihostwin"  class="form-control" placeholder="输入主胜率" value="{{$data[0]['odds_jingcai'][0]['a']}}" />
   </div>
   <div class="col-sm-2">
   <label>平</label>
   <input type="text" name="oddsjingcaipingwin" id="odds_jingcaipingwin"  class="form-control" placeholder="输入平胜率" value="{{$data[0]['odds_jingcai'][0]['d']}}" />
   </div>
   <div class="col-sm-2">
   <label>客胜</label>
   <input type="text" name="oddsjingcaiawaywin" id="odds_jingcaiawaywin"  class="form-control" placeholder="输入客胜率"  value="{{$data[0]['odds_jingcai'][0]['h']}}"/>
   </div>
</div> 

<div class="row"  style="padding-top:20px;">
   <div class="col-sm-2">
   <label> 让球胜平负玩法</label>
   </div>
    <div class="col-sm-2">
    <label>主胜</label>
    <input type="text" name="oddsrangqiuhostwin" id="odds_rangqiuhostwin"  class="form-control" placeholder="输入主胜率"  value="{{$data[0]['odds_rangqiu'][0]['a']}}"/>
   </div>
   <div class="col-sm-2">
   <label>平</label>
   <input type="text" name="oddsrangqiupingwin" id="odds_rangqiupingwin"  class="form-control" placeholder="输入平胜率" value="{{$data[0]['odds_rangqiu'][0]['d']}}" />
   </div>
   <div class="col-sm-2">
   <label>客胜</label>
   <input type="text" name="oddsrangqiuawaywin" id="odds_rangqiuawaywin"  class="form-control" placeholder="输入客胜率" value="{{$data[0]['odds_rangqiu'][0]['h']}}" />
   </div>
</div>
   <div class="row">
   <input  type="hidden" name="id" id="id" value="{{$data[0]['id']}}" />
   <input  type="hidden" name="input_flaghidden" id="input_flaghidden" value="{{$data[0]['input_flag']}}" />
   <button type="submit" id="savebtn" class="btn btn-primary" style="width:80px; margin-left:10px; float:left">保 存</button>
   <button type="button" class="btn btn-danger"  style="width:80px; margin-left:10px; float:left">取 消</button>
   </div>
    </div>

  </form>
</div>
<!-- /.box-body -->
<script>

$(function(){
      // $('#time').datepicker({
      //   format: 'yyyy-mm-dd',
      //   autoclose: true
      // });
      loaddata();
      $("#lottery_status").val("{{$data[0]['lottery_status']}}")
    })
 function loaddata()
 {  
       var input_flag=$("#input_flaghidden").val();
         $('input:radio').each(function(index){
            if(parseInt($(this).attr('value'))==input_flag){
              $(this).attr('checked', 'true');
             }
          });
     
 
 }
function checksubmit(){
  var final_score=$("#final_score").val();
var pattern = /^(([1-9]?[0-9]?)\:([1-9]?[0-9]?))$/
if(!pattern.test(final_score)){
   layer.alert('比赛比分格式不正确，如：1:1 ,请输入整数');
    return false;
 }
 return true;
}
</script>
</div>
</section>
@endsection
