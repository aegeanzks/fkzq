@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
公告管理
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li class="active">公告管理</li>
</ol>
</section>
<section class="content">
<div class="row">
<form  class="form-inline"  action="{{url('/Announcement/list')}}">

<div class="box">
<div class="row" style="margin:8px;">
<a class="btn btn-info" href="{{ url('/Announcement/addannounce')}}" >添加</a>
</div>
  <div class="box-body">
                    <table class="table table-bordered">
                    <tbody id="contentbox">
                        <tr>
                        <th>内容</th>
                        <th>类别</th>
                        <th>创建时间</th>
                        <th>操作</th>    
                      </tr> 
                   
                      @foreach($dataarray as $itemdata)
                      <tr>
                      <td>{{$itemdata['content']}}</td>
                      @if($itemdata['type']==0)
                      <td>系统广告</td>
                      @elseif($itemdata['type']==1)
                      <td>弹窗广告</td>
                      @endif
                      <td>{{$itemdata['createtime']}}</td>
                      <td>
                       <a class="btn btn-info" href="/Announcement/announceinfo/{{$itemdata['a_id']}}" style="width:80px; float:left;margin:0px 2px;">修改</a>
                       <a class="btn btn-success delete-confirm" href="/Announcement/announcedel/{{$itemdata['a_id']}}" tip="确认删除吗？" style="width:80px; float:left;margin:0px 2px;">删除</a>
                       </td>
                  </tr>
                    </tr>
                      @endforeach
                     </tbody>
                  </table>
                  <div class="pagebox" class="text-center">
                              <!-- 这里显示分页 -->
                  </div>
                </table>
                  </div>
                </div>
                </div>

<script>
$(function(){
        $(".pagebox").html("{!! $pagelist !!}")
});
</script>
<div><input type="hidden" id="pagehidden" name="page" value="{{ $data['page'] }}" /></div>
</form>

</section>
@endsection
