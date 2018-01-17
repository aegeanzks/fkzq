@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
编辑赛事
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/guess/competitionmanage')}}">游戏配置</a></li>
  <li class="active">库存配置</li>
</ol>
</section>
<section class="content">
<div class="box box-warning">
<div class="box-header with-border">
  <h3 class="box-title">库存配置</h3>
</div>
<!-- /.box-header -->
<div class="box-body">
<form role="form" action="{{url('/system/gamestockinfoupdate')}}">
    <div class="form-group">
      <label>当前库存值</label>
      <input type="text" name="cur_stock" id="cur_stock" class="form-control" placeholder="输入主队名称" value="{{$data[0]['cur_stock']}}"  />
    </div>
    <div class="form-group">
      <label>库存起始值</label>
      <input type="text" name="stock_initial_value" id="stock_initial_value"  class="form-control" placeholder="输入客队名称" value="{{$data[0]['stock_initial_value']}}" />
    </div>
    <div class="form-group">
      <label>作弊概率1</label>
      <input type="text" name="cheat_chance_1" id="cheat_chance_1"  class="form-control" placeholder="输入客队名称" value="{{$data[0]['cheat_chance_1']}}" />
      <label>% 库存值在起始值到库存阀值1之间生效</label>
    </div>
    <div class="form-group">
      <label>库存阀值1</label>
      <input type="text" name="stock_threshold_1" id="stock_threshold_1"  class="form-control" placeholder="输入客队名称" value="{{$data[0]['stock_threshold_1']}}" />
    </div>
    <div class="form-group">
      <label>作弊概率2</label>
      <input type="text" name="cheat_chance_2" id="cheat_chance_2"  class="form-control" placeholder="输入客队名称" value="{{$data[0]['cheat_chance_2']}}" />
      <label>库存值在库存阀值1到库存阀值2之间生效</label>
    </div>
    <div class="form-group">
      <label>库存阀值2</label>
      <input type="text" name="stock_threshold_2" id="stock_threshold_2"  class="form-control" placeholder="输入客队名称" value="{{$data[0]['stock_threshold_2']}}" />
      <label>%</label>
    </div>
    <div class="form-group">
      <label>作弊概率3</label>
      <input type="text" name="cheat_chance_3" id="cheat_chance_3"  class="form-control" placeholder="输入客队名称" value="{{$data[0]['cheat_chance_3']}}" />
      <label>% 库存值大于库存阀值2生效</label>
    </div>
   <div class="row">
   <input  type="hidden" name="game_id" id="game_id" value="{{$data[0]['game_id']}}" />
   <button type="submit" id="savebtn" class="btn btn-primary" style="width:80px; margin-left:10px; float:left">保 存</button>
   <button type="button" class="btn btn-danger"  style="width:80px; margin-left:10px; float:left">取 消</button>
   </div>
    </div>

  </form>
</div>
<!-- /.box-body -->
</div>
</section>
@endsection
