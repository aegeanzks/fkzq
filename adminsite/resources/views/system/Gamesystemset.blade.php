@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
游戏设置列表
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li class="active">游戏设置列表</li>
</ol>
</section>
<section class="content">
<div class="row">
<div class="box">
  <div class="box-body">
                    <table class="table table-bordered">
                        <tr>
                        <th>游戏</th>
                        <th>当前库存值</th>
                        <th></th>
                      </tr> 
                      <tbody id="gamebody">
                      @foreach($dataarray as $itemdata)
                      <tr>
                       <td>{{$itemdata['game_name']}}</td>
                       <td>{{$itemdata['cur_stock']}}</td>
                       <td>   
                         <a class="btn btn-info" href="/system/gamebaseset" style="width:80px; float:left;margin:0px 2px;">基本配置</a>
                         <a class="btn btn-success" href="/system/gamestockinfo/{{$itemdata['game_id']}}" style="width:80px; float:left;margin:0px 2px;">库存配置</a>
                       </td>
                      </tr>
                     @endforeach
                     </tbody>
                  </table>
                  <div class="pagebox" class="text-center">
                  </div>
     </div>
   </div>
 </div>
</div>
</section>
<script>
$(function(){
        $(".pagebox").html("{!! $pagelist !!}")

});
</script>
@endsection
