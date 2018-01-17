@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
编辑赛事
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> Home</a></li>
  <li><a href="{{url('/system/gamelist')}}">游戏配置</a></li>
  <li><a href="{{url('/system/gameoodinfo')}}">赔率配置</a></li>
  <li class="active">编辑赔率</li>
</ol>
</section>
<section class="content">
<div class="box box-warning">
<div class="box-header with-border">
  <h3 class="box-title">编辑赔率</h3>
</div>
<form  action="{{ url('/system/gameoodloadinfoupdate')}}">
<div class="row"  style="padding-top:20px;">
   <div class="col-sm-2">
   <label>  猜想平负</label>
   </div>
    <div class="col-sm-2">
    <label>主胜</label>
    <input type="text" name="host_win" id="host_win"  class="form-control" placeholder="输入主胜率" value="{{$data[0]['host_win']}}" />
   </div>
   <div class="col-sm-2">
   <label>平</label>
   <input type="text" name="drawn" id="drawn"  class="form-control" placeholder="输入平胜率" value="{{$data[0]['drawn']}}" />
   </div>
   <div class="col-sm-2">
   <label>客胜</label>
   <input type="text" name="guest_win" id="guest_win"  class="form-control" placeholder="输入客胜率"  value="{{$data[0]['guest_win']}}"/>
   </div>
</div> 

<div class="row"  style="padding-top:20px;">
<div class="col-sm-2">
<label> 猜进球</label>
   </div>
    <div class="col-sm-2">
    <label>主对进球</label>
    <input type="text" name="host_goal" id="host_goal"  class="form-control" placeholder="主对进球"  value="{{$data[0]['host_goal']}}"/>
   </div>
   <div class="col-sm-2">
   <label>无进球</label>
   <input type="text" name="zero" id="zero"  class="form-control" placeholder="无进球" value="{{$data[0]['zero']}}" />
   </div>
   <div class="col-sm-2">
   <label>客队进球</label>
   <input type="text" name="guest_goal" id="guest_goal"  class="form-control" placeholder="客队进球" value="{{$data[0]['guest_goal']}}" />
   </div>
</div>

<div class="row"  style="padding-top:20px;">
<div class="col-sm-2">
<label>  对阵双方</label>
   </div>
    <div class="col-sm-2">
    <select name="both_sides" id="both_sides" class="form-control" style="width:180px" >
    <option value="">全部</option>
    <option value="上下">上下</option> 

    </select>
    
   </div>

</div>
   <div class="row">
   <input  type="hidden" name="id" id="id" value="{{$data[0]['id']}}" />
   <button type="submit" id="savebtn" class="btn btn-primary" style="width:80px; margin-left:10px; float:left">保 存</button>
   <button type="reset" class="btn btn-danger"  style="width:80px; margin-left:10px; float:left">取 消</button>
   </div>
    </div>

  </form>
</div>
<!-- /.box-body -->
</div>

<script>
  $(function () {
    $("#both_sides").val("{{$data[0]['both_sides']}}")
  })
  
</script>
</section>
@endsection
