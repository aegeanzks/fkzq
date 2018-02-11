@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
系统设置列表
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/system/paramlist')}}">系统设置</a></li>
  <li class="active">虚拟足球系统设置</li>
</ol>
</section>
<section class="content">
<ul class="nav nav-tabs">
  <li><a href="{{url('/system/paramlist')}}">竞猜足球</a></li>
  <li class="active"><a href="#paramvf" data-toggle="tab">虚拟足球</a></li>
</ul>
<div class="box box-warning">
<div class="box-header with-border">
  <h3 class="box-title">编辑</h3>
</div>
<!-- /.box-header -->
<div class="box-body">
<form role="form" onsubmit="return checksubmit()" action="{{ url('/system/paramvirtualupdate')}}">
    <!-- text input -->
    <div class="form-group">
      <label>区域投注金额</label>
    <div class="input-group date">
        <div class="input-group-addon">
        <i class="fa fa-calendar"></i>
        </div>
    <input type="text" style="width:150px;" class="form-control " placeholder="输入投注区域1金额" id="item1" name="item1" value="{{$paramdata[0]['item1']}}" oldvalue="{{$paramdata[0]['item1']}}" />
    <input type="text" style="width:150px;" class="form-control " placeholder="输入投注区域2金额" id="item2" name="item2" value="{{$paramdata[0]['item2']}}"  oldvalue="{{$paramdata[0]['item2']}}"/>
    <input type="text" style="width:150px;" class="form-control " placeholder="输入投注区域3金额" id="item3" name="item3" value="{{$paramdata[0]['item3']}}"  oldvalue="{{$paramdata[0]['item3']}}"/>
 </div>
</div>

   <div class="row">
   <input  type="hidden" name="id" id="id" value="{{$paramdata[0]['game_id']}}" />
   <button type="submit" id="savebtn" class="btn btn-primary" style="width:80px; margin-left:10px; float:left">保 存</button>

   &nbsp; &nbsp; &nbsp;
							<button class="btn" type="reset">
								<i class="icon-undo bigger-110"></i>
								重 置
							</button>
   </div>
    </div>

  </form>
</div>
<!-- /.box-body -->
<script >

$(function(){

})
function checksubmit(){
    var iterm1 = $("#item1").val();
    if(iterm1 == ""){
      layer.alert('输入投注区域1金额为空');
        return false;
    }
    var iterm2 = $("#item2").val();
    if(iterm2 == ""){
      layer.alert('输入投注区域2金额为空');
        return false;
    }
    var iterm3 = $("#item3").val();
    if(iterm3 == ""){
      layer.alert('输入投注区域3金额为空');
        return false;
    }
    if(parseInt(iterm1) <1 || parseInt(iterm2) <1 || parseInt(iterm3)<1 ){
        layer.alert('格式不正确,请输入大于1的整数');
        return false;
    }
    return true;
}
</script>
</div>
</section>
@endsection
