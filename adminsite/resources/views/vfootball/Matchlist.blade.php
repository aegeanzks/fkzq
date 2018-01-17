@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
虚拟足球开奖记录
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li class="active">虚拟足球开奖记录</li>
</ol>
</section>
<section class="content">
<div class="row">
<form  class="form-inline" onSubmit="return selsumbit()" action="{{url('/vfootball/matchlist')}}">
<div class="box">
<div style="margin:5px 0px;clear:both; height:40px;">
<div class="col-sm-6">
期数查询:<input type="text" class="form-control" id="date" name="date" placeholder="输入期数"  value="{{ $data['date'] }}">
期号查询:<input type="text" class="form-control" id="date_num" name="date_num" placeholder="输入期号"  value="{{ $data['date_num'] }}">
<button type="sumbit" class="btn btn-block btn-primary" style="width:150px; float:right">查 询</button>
<!-- <button type="button" class="btn btn-block btn-primary" style="width:150px; float:right" onclick="searchfn()">查 询</button> -->
<input type="hidden" id="typehidden" name="type" value="{{ $data['type'] }}" />
<input type="hidden" id="pagehidden" name="page" value="{{ $data['page'] }}" />
</div>
</div>
  <div class="box-body">
                    <table class="table table-bordered">
                    <tbody id="contentbox">
                        <tr>
           
                        <th>期数</th>
                        <th>期号</th>
                        <th>主队</th>
                        <th>比分</th>               
                        <th>客队</th>      
                        <th>下注金额</th>      
                        <th>派奖金额</th>      
                     
                      </tr> 
                   
                      @foreach($dataarray as $itemdata)
                      <tr>
                      <td>{{$itemdata['date']}}</td>
                      <td>{{$itemdata['date_num']}}</td>
                      <td>{{$itemdata['host']}}</td>
                      <td>{{$itemdata['score']}}</td>
                      <td>{{$itemdata['guest']}}</td>
                      <td>{{$itemdata['all_bet']}}</td>
                      <td>{{$itemdata['distribution']}}</td>
                     
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


 function selsumbit(){
    var date=$("#date").val();
    var date_num=$("#date_num").val();
    
    if(date!=""){
     $("#typehidden").val(2)
    }
    if(date_num!=""){
     $("#typehidden").val(3)
    }
    if(date!="" && date_num!=""){
        $("#typehidden").val(1)  
        $("#date").val("")
        $("#date_num").val("")
    }
    return true;
  }


</script>
</form>

</section>
@endsection
