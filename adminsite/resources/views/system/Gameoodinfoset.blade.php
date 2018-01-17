@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
游戏设置列表
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/system/gamebaseset')}}">游戏设置</a></li>
  <li class="active">游戏赔率设置</li>
</ol>
</section>
<section class="content">
<div class="row">
<ul class="nav nav-tabs">
  <li><a href="{{url('/system/gamebaseset')}}">事件配置</a></li>
  <li class="active"><a href="#reparation" data-toggle="tab">赔率配置</a></li>
  <li><a href="{{url('/system/gamegoalsinfo')}}">进球配置</a></li>

</ul>
<div class="tab-content">
<div class="tab-pane active" id="reparation">
<div class="row" style="margin:8px;">
<a class="btn btn-info" href="{{ url('/system/addoodinfo')}}" >添加</a>
</div>
  <div class="box">
  <div class="box-body">
  <form  class="form-inline">
                    <table class="table table-bordered">
                    <tbody>
                        <tr>
                        <th>双阵双方</th>
                        <th>主胜</th>
                        <th>平</th>
                        <th>客胜</th>
                        <th>主队进球</th>
                        <th>无进球</th>
                        <th>客队进球</th>
                        <th>操作</th>
                      </tr> 
                      @foreach($ooddata as $data)
                      <tr id="tr_{{ $data['id']}}">
                       <td>{{ $data['both_sides']}}</td>
                       <td><span>{{ $data['host_win']}}</span></td>
                       <td><span>{{ $data['drawn']}}</span></td>
                       <td><span>{{ $data['guest_win']}}</span></td>
                       <td><span>{{ $data['host_goal']}}</span></td>
                       <td><span>{{ $data['zero']}}</span></td>
                       <td><span>{{ $data['guest_goal']}}</span></td>
                       <td>
                       <a class="btn btn-info" href="/system/gameoodloadinfo/{{$data['id']}}" style="width:80px; float:left;margin:0px 2px;">修改</a>
                       <a class="btn btn-success delete-confirm" href="/system/gameoodinfodel/{{$data['id']}}" tip="确认删除吗？" style="width:80px; float:left;margin:0px 2px;">删除</a>
                       </td>
                      </tr>
                      @endforeach
                     </tbody>
                  </table>
                  <div class="pagebox" class="text-center">
                   <!-- 这里显示分页 -->
                 </div>        
   </form>
   </div>               
   </div>
  </div>

<script>
  $(function () {
    $(".pagebox").html("{!! $pagelist !!}")
  })
  
</script>
 </div>
</div>
</section>
@endsection
