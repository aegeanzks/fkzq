@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
权限管理
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li class="active">权限管理</li>
</ol>
</section>
<section class="content">
<div class="row">
<form  class="form-inline" onSubmit="return selsumbit()" action="{{url('/Permissions/list')}}">
<div class="box">
<div style="margin:5px 0px;clear:both; height:40px;">
<div class="col-sm-2">

管理员:<select id="pgroupid" name="pgroupid" class="form-control" style="width:180px" >
<option value="">全部</option>
<option value="1">管理员</option>
<option value="2">超级管理员</option> 
</select>
</div>
<div class="col-sm-10">
<button type="sumbit" class="btn btn-block btn-primary" style="width:150px; float:left">查 询</button>`
</div>
</div>
<div class="row" style="margin:8px;">
<a class="btn btn-info" href="{{ url('/Permissions/addpermissionpage')}}" >添加</a>
</div>
<div class="box-body">
                    <table class="table table-bordered">
                    <tbody id="contentbox">
                        <tr>
                        <th>等级用户</th>
                        <th>访问页面</th>
                        <th>访问链接</th>
                        <th>操作</th>
                      </tr> 
                   
                      @foreach($plist as $itemdata)
                      <tr>
                      @if($itemdata['pgroupid']==1)
                      <td>管理员</td>
                      @elseif($itemdata['pgroupid']==2)
                      <td>超级管理员</td>
                      @else
                      <td>--</td>
                      @endif
                      <td>{{$itemdata['pname']}}</td>
                      <td>{{$itemdata['purl']}}</td>
                      <td>   
                      <a class="btn btn-success delete-confirm" href="{{ url('/Permissions/delpermission',[$itemdata->id] )}}" tip="确认删除吗？" style="width:80px; float:left;margin:0px 2px;">删除</a>
                      </td>
                  </tr>
                  
                    </tr>
                      @endforeach
                     </tbody>
                  </table>
                  <div class="pagebox" class="text-center">
                  {!! $plist->render() !!}   
                 </div>
                </table>
                  </div>
                </div>
                </div>

                <script>
$(function(){
        $("#pgroupid").val('{{$groupid}}');
});
</script>
</form>

</section>
@endsection
