@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
添加赔率
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/system/gamelist')}}">游戏配置</a></li>
  <li><a href="{{url('/system/gamegoalsinfo')}}">进球配置</a></li>
  <li class="active">添加进球配置</li>
</ol>
</section>
<section class="content">
<div class="box box-warning">
<div class="box-header with-border">
  <h3 class="box-title">添加进球配置</h3>
</div>
<form  action="{{ url('/system/gamegoalsadd')}}">
<div class="row"  style="padding-top:20px;">
   <div class="col-sm-2">
   <label>总进球数</label>
    <input type="text" name="all_goal_num" id="all_goal_num"  class="form-control" placeholder="输入主胜率" value="" />
   </div>
   <div class="col-sm-2">
   <label>总进球数概率</label>
   <input type="text" name="chance" id="chance"  class="form-control" placeholder="输入平胜率" value="" />
   </div>
</div> 
   <div class="row" style="margin-top:10px">
   <button type="submit" id="savebtn" class="btn btn-primary" style="width:80px; margin-left:20px; float:left">保 存</button>
   <button type="reset" class="btn btn-danger"  style="width:80px; margin-left:10px; float:left">取 消</button>
   </div>
    </div>

  </form>
</div>
<!-- /.box-body -->
</div>
</section>
@endsection
