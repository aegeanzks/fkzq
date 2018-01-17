@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
添加权限
</h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/Permissions/list')}}">权限管理</a></li>
  <li class="active">添加权限</li>
</ol>
</section>
<section class="content">
<div class="box box-warning">
<div class="box-header with-border">
  <h3 class="box-title">添加</h3>
</div>
<!-- /.box-header -->
<div class="box-body">
<form role="form" onsubmit="return checkinput();"  action="{{ url('/Permissions/addpermission')}}">
    <!-- text input -->
    <div class="form-group">
      <label>访问权限页面</label>
      <input type="text" name="pname" id="pname" class="form-control" placeholder="输入访问权限页面" />
    </div>
    <div class="form-group">
      <label>访问权限链接</label>
      <input type="text" name="purl" id="purl" class="form-control" placeholder="输入访问权限链接"  />
    </div>
    <div class="form-group">
      <label>组权限</label>
      <select id="pgroupid" name="pgroupid" class="form-control">
        <option value="">请选择</option>
        <option value="1">管理员</option>
        <option value="2">超级管理员</option>
      </select>
    </div>
    <div class="box-footer">
      <button type="submit" class="btn btn-primary">确 定</button>
    </div>
    </div>

  </form>
  <script>
  function checkinput(){

        var pname = $('#pname').val();
        if(pname==""){
            bootbox.alert('请输入访问权限页面');
            return false;
        }
        var purl = $('#purl').val();
        if(purl==""){
            bootbox.alert('请输入访问权限链接');
            return false;
        }
        if($("#groupid").val()==""){
            bootbox.alert('请管理分组');
            return false;
       }
       return true;

  }
  </script>
</div>
<!-- /.box-body -->
</div>
</section>
@endsection
