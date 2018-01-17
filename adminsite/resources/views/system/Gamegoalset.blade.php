@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
游戏设置列表
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/system/gamelist')}}">游戏配置</a></li>
  <li class="active">进球配置基本配置</li>
</ol>
</section>
<section class="content">
<div class="row">
<ul class="nav nav-tabs">
<li><a href="{{url('/system/gamebaseset')}}">事件配置</a></li>
<li><a href="{{url('/system/gameoodinfo')}}">赔率配置</a></li>
<li class="active"><a href="#gogal" data-toggle="tab">进球配置</a></li>
</ul>
<div class="tab-content">
  <div class="tab-pane active" id="gogal">
  <div class="row" style="margin:8px;">
  <a class="btn btn-info" href="{{ url('/system/addgoalsinfo')}}" >添加</a>
</div>
  <div class="box">
  <div class="box-body">
  <form  class="form-inline" method="get" action="{{ url('/')}}">
                    <table class="table table-bordered">
                    <tbody>
                        <tr>
                        <th>总进球数</th>
                        <th>总进球数概率</th>
                      </tr> 
                     
                      @foreach($goalsdata as $data)
                      <tr>
                       <td><span>{{$data['all_goal_num']}}</span></td>
                       <td><span>{{$data['chance']}}</span></td>
                      </tr>
                      @endforeach
                     </tbody>
                  </table>

                
   </form>
   </div>               
   </div>
</div>

<script>
  $(function () {
    $('.form-control').width('130px')
  })
</script>
 </div>
</div>
</section>
@endsection
