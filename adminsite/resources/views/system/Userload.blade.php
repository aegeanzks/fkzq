@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
管理员列表
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/userlist')}}">管理员列表</a></li>
  <li class="active">编辑管理员</li>
</ol>
</section>
<section class="content">
<div class="box box-warning">
<div class="box-header with-border">
  <h3 class="box-title">编辑</h3>
</div>
<!-- /.box-header -->
<div class="box-body">
<form role="form"  action="{{ url('/user/edit')}}">
    <!-- text input -->
    <div class="form-group">
      <label>用户名</label>
      <input type="text" name="name" id="name" class="form-control" placeholder="输入用户名" value="{{$name}}" readonly="readonly"/>
    </div>
    <div class="form-group">
      <label>姓名</label>
      <input type="text" name="realname" id="realname" class="form-control" placeholder="输入姓名"  value="{{$realname}}" />
    </div>
    <div class="form-group">
      <label>电话</label>
      <input type="text" name="mobile" id="mobile"  class="form-control" placeholder="输入电话"  value="{{$mobile}}" />
    </div>
    <div class="form-group">
      <label>管理分组</label>
      <select id="groupid" name="groupid" class="form-control">
        <option value="">请选择</option>
        <option value="1">管理员</option>
        <option value="2">超级管理员</option>
      </select>
      <input type="hidden" id="ghidden" value="{{$groupid}}" />
      <input type="hidden" id="useridhidden" name="userid" value="{{$id}}" />
    </div>
    <div class="box-footer">
      <button type="submit" class="btn btn-primary">确 定</button>
    </div>
    </div>

  </form>
<script>
$(function(){
  var gid=$("#ghidden").val();
  $("#groupid").val(gid);
})
</script>
</div>
<!-- /.box-body -->
</div>
</section>
@endsection
