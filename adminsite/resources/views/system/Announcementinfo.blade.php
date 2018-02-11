@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
公告
</h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/Announcement/list')}}">公告管理</a></li>
    @if($option=='add')
    <li class="active">添加公告</li>
    @else
    <li class="active">编辑公告</li>
    @endif
  
</ol>
</section>
<section class="content">
<div class="box">
<div class="box-header with-border">

@if($option=='add')
<h3 class="box-title">添加公告</h3>
@else
<h3 class="box-title">编辑公告</h3>
@endif
</div>
@if($option=='add')
<form  onsubmit="return checksubmit()" action="{{ url('/Announcement/announceadd')}}">
@else
<form  onsubmit="return checksubmit()" action="{{ url('/Announcement/announceupdate')}}">
@endif
<div class="row"  style="padding:5px;">
   <div class="col-sm-12">
   <label> 内容</label>
   <textarea rows="3" cols="20" name="content" id="content"  class="form-control" placeholder="输入公告内容" >{{$showdata!=null?$showdata['content']:""}}</textarea>
   </div>
   <div class="col-sm-12">
   <label> 类型</label>
   <select name="type" id="type" class="form-control" style="width:180px" >
    <option value="">全部</option>
    <option value="0">系统公告</option> 
    <option value="1">弹窗公告</option> 
    </select>
   </div>
   <div class="col-sm-12">
   <label>  开始时间</label>
   <input type="text" class="form-control pull-right" id="starttime" name="starttime" value="{{$showdata!=null?$showdata['starttime']:'' }}">
   </div>
   <div class="col-sm-12">
   <label>  结束时间</label>
   <input type="text" class="form-control pull-right" id="endtime" name="endtime" value="{{$showdata!=null?$showdata['endtime']:'' }}">
   </div>
</div> 
<div class="row" style="padding:5px;">
<input type="hidden" id="a_id" name="a_id" value="{{$showdata!=null?$showdata['a_id']:'' }}">
   <button type="submit" id="savebtn" class="btn btn-primary" style="width:80px; margin-left:10px; float:left">保 存</button>
   <button type="reset" class="btn btn-danger"  style="width:80px; margin-left:10px; float:left">重置</button>
   </div>
    </div>

  </form>
</div>
<!-- /.box-body -->
</div>
</section>
<script>
$(function(){
    $('#starttime').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true
        });
       $('#endtime').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true
        });

  $("#type").val("{{$showdata!=null?$showdata['type']:'' }}");


});

function checksubmit(){
    var starttime = $("#starttime").val();
    if(starttime == ""){
      layer.alert('输入开始时间为空');
        return false;
    }
    var endtime = $("#endtime").val();
    if(endtime == ""){
      layer.alert('输入结束时间为空');
        return false;
    }
    var start =parseInt(starttime.replace(/-/ig,""));
    var end =parseInt(endtime.replace(/-/ig,""));
    if(start > end){
      layer.alert('请输入结束时间大于开始时间');
        return false;
    }
    return true;
}
</script>

@endsection
