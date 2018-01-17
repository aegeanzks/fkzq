@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
修改杀率
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i>首页</a></li>
  <li><a href="{{url('/accounts/list')}}">用户管理</a></li>
  <li class="active">修改杀率</li>
</ol>
</section>
<section class="content">
<div class="box box-warning">
<div class="box-header with-border">
  <h3 class="box-title">修改杀率</h3>
</div>
<!-- /.box-header -->
<div class="box-body">
<form role="form" action="{{url('/Accounts/slewrateupdate')}}">

<div class="row"  style="padding-top:20px;">
    <div class="col-sm-12">
    <label>杀率</label>
    <input type="text" name="invented_slew_rate" id="invented_slew_rate"  class="form-control" placeholder="输入杀率"  value="{{$invented_slew_rate}}"/>
   </div>
  
</div>
   <div class="row"  style="margin-top:20px;">
   <input  type="hidden" name="user_id" id="user_id" value="{{$user_id}}" />
   <button type="submit" id="savebtn" class="btn btn-primary" style="width:80px; margin-left:10px; float:left">保 存</button>
   </div>
    </div>

  </form>
</div>
<!-- /.box-body -->
</div>
</section>
@endsection
