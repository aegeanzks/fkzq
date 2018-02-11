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
  <!-- <a class="btn btn-info" href="{{ url('/system/addgoalsinfo')}}" >添加</a> -->
</div>
  <div class="box">
  <div class="box-body">
  <form  class="form-inline" method="get" action="{{ url('/system/gamegoalsupdate')}}">
                    <table class="table table-bordered">
                    <tbody id="bodycontent">
                        <tr>
                        <th>总进球数</th>
                        <th>总进球数概率</th>
                        <!-- <th>操作</th> -->
                      </tr> 
                     
                      @foreach($goalsdata as $data)
                      <tr>
                       <td><span>{{$data['all_goal_num']}}</span></td>
                       <td><input type="text" class="form-control"  name="chance_{{ $data['all_goal_num']}}" value="{{ $data['chance']}}" oldvalue="{{ $data['chance']}}"/></td>
    
                       <!-- <td><span>{{$data['chance']}}</span></td> -->
                       <!-- <td>
                       <a class="btn btn-success delete-confirm" href="/system/gamegoalsinfodel/{{$data['all_goal_num']}}" tip="确认删除吗？" style="width:80px; line-height:0.6;float:left;margin:0px 2px;">删除</a>
                       </td> -->
                      </tr>
                      @endforeach
                     </tbody>
                  </table>
                <div class="row">
                <button type="submit" class="btn btn-primary" style="width:80px; margin-left:10px; float:left">保 存</button>

                &nbsp; &nbsp; &nbsp;
                <button class="btn" type="reset">
                  <i class="icon-undo bigger-110"></i>
                  重 置
                </button>
          
                </div>

                
   </form>
   </div>               
   </div>
</div>

<script>
  $(function () {
    $('.form-control').width('130px')
    $("#bodycontent input").bind("change",function(){
      if( $(this).val()=="")
      {
        $(this).val($(this).attr("oldvalue"))
      }
      /*else{
        if(parseInt($(this).val())<1 || parseInt($(this).val())>100 )
        {
          layer.alert("输入值在1-100之间") ;
          $(this).val($(this).attr("oldvalue"))
        }
      }*/
    })
  })
</script>
 </div>
</div>
</section>
@endsection
