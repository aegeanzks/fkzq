@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
用户管理
</h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li class="active">用户管理</li>
</ol>
</section>
<section class="content">
<div class="row">
<form  class="form-inline" onSubmit="return selsumbit()" action="{{url('/Accounts/list')}}">
<div class="box">
<div style="margin:5px 0px;clear:both; height:40px;">
<div class="col-sm-12">
<div style="float:left">账号查询:<input type="text" class="form-control" id="user_name" name="user_name" placeholder="输入账号名"  value="{{ $data['user_name'] }}"/></div>
<button type="sumbit" class="btn btn-block btn-primary" style="width:150px; float:left; margin-left:5px;">查 询</button>
<input type="hidden" id="pagehidden" name="page" value="{{ $data['page'] }}" />
</div>
</div>
<div class="row" style="margin:8px;">

 <a class="btn btn-info" href="javascript:selfreezebtn(1)" >冻结</a>
 <a class="btn btn-primary" href="javascript:selfreezebtn(0)">解冻</a>
 <!-- <a class="btn btn-warning" href="javascript:void(0)">增送金币</a>
 <a class="btn btn-danger" href="javascript:selhotbtn(0)">修改杀率</a> -->
</div>
  <div class="box-body">
                    <table class="table table-bordered">
                    <tbody id="contentbox">
                        <tr>
                        <th>&nbsp;</th>
                        <th>用户ID</th>
                        <th>账号</th>
                        <th>金币</th>
                        <th>注册时间</th>
                        <th>注册IP</th>
                        <th>最后登录时间</th>               
                        <th>最后登录IP</th>      
                        <th>登录次数</th>      
                        <th>状态</th>      
                        <th>虚拟场盈利率（%）</th>    
                        <th>虚拟场杀率（%）</th>      
                        <th>操作</th>
                      </tr> 
                   
                      @foreach($dataarray as $itemdata)
                      <tr>
                      <tr>
                      <td><input type="checkbox" name="selcheck_{{$itemdata['user_id']}}" id="selcheck_{{$itemdata['user_id']}}" value="{{$itemdata['user_id']}}" /></td>
                      <td>{{$itemdata['user_id']}}</td>
                      <td>{{$itemdata['user_name']}}</td>
                      <td>0</td>
                      <td>2017-1-1</td>
                      <td>0.0.0.0</td>
                      <td>{{$itemdata['last_login_date']}}</td>
                      <td>{{$itemdata['last_login_ip']}}</td>
                      <td>{{$itemdata['login_count']}}</td>
                      @if($itemdata['status']==0)
                      <td>启动</td>
                      @else
                      <td>屏蔽</td>
                      @endif
                      <td>{{$itemdata['invented_profitrate']}}</td>
                      <td>{{$itemdata['invented_slew_rate']}}</td>
                      <td>   
                      <a class="btn btn-info" href="/Accounts/slewrateedit/{{$itemdata['user_id']}}/{{$itemdata['invented_slew_rate']}}" style="width:80px; float:left;margin:0px 2px;">修改杀率</a>
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

function selfreezebtn(values){
        var idarrstr="";
        var checkboxarr= document.getElementById("contentbox").getElementsByTagName("input");
          for(var i=0;i<checkboxarr.length;i++){
              if( checkboxarr[i].checked){
                  idarrstr=idarrstr+checkboxarr[i].value+","
              }
          }
          idarrstr = idarrstr.substr(0,idarrstr.length - 1);  
          $.get("/Accounts/freezeaccount",
                     {userid:idarrstr,status:values},
                      function(data){
                          if(data.errcode==200){
                             if(values==0){
                              layer.alert('设置解冻状态成功', {
                                skin: 'layui-layer-lan' //样式类名
                                ,closeBtn: 0
                                }, function(){
                                document.location.reload();
                                });
                             }
                             else{
                              layer.alert('设置冻结状态成功', {
                                skin: 'layui-layer-lan' //样式类名
                                ,closeBtn: 0
                                }, function(){
                                document.location.reload();
                                });
                             }
      
                          }
                          else{
                              layer.msg(data.msg);
                          }
                      }, "json");
   }
</script>
</form>

</section>
@endsection
