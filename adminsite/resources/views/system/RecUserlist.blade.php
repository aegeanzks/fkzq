@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
管理员列表
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li class="active">管理员列表</li>
</ol>
</section>
<section class="content">
<div class="row">
<form class="form-inline" method="get" action="{{ url('/recuserlist')}}">
<div class="box">
<div style="margin:5px 0px;clear:both; height:40px;">
<div class="col-sm-7">
管理员:<input type="text" class="form-control" id="name" name="name" placeholder="输入管理员名称">
姓名:<input type="text" class="form-control" id="realname" name="realname" placeholder="输入姓名">       
手机号:<input type="text" class="form-control" id="mobile" name="mobile" placeholder="输入手机号">
分组: <select name="groupid" class="form-control" style="width:180px" >
<option value="">全部</option>
<option value="1">管理员</option> 
<option value="2">超级管理员</option>
</select>
</div>
<div class="col-sm-2"><button type="submit" class="btn btn-block btn-primary" style="width:150px;">搜 索</button>
</div>
</div>
  <div class="box-body">
                    <table class="table table-bordered">
                        <tr>
                        <th>编号</th>
                        <th>管理员</th>
                        <th>分组</th>
                        <th>姓名</th>
                        <th >手机号</th>
                        <th>登录IP</th>               
                        <th>状态</th>      
                        <th width="20%"></th>
                      </tr> 
                      <tbody>
                      @foreach($userlist as $user)
                      <tr>
                       <td>{{$user->id}}</td>
                       <td>{{$user->name}}</td>
                       <td>{{$user->groupid==1?"管理员":"超级管理员"}}</td>
                       <td>{{$user->realname}}</td>
                       <td>{{$user->mobile}}</td>
                       <td>{{$user->loginip}}</td>
                       <td>{{$user->isdelete==0?"正常":"停用"}}</td>
                       <td>   
                         <a class="btn btn-info" href="{{ url('/user/getinfo',[$user->id] )}}" style="width:80px; float:left;margin:0px 2px;">修改</a>
                         <a class="btn btn-success delete-confirm" href="{{ url('/user/active',[$user->id] )}}" tip="确认激活该账号吗？" style="width:80px; float:left;margin:0px 2px;">激活</a>
                       </td>
                      </tr>
                      @endforeach
                     </tbody>
                  </table>
                  <div class="text-center">{!! $userlist->render() !!}</div>
                </table>
                  </div>
                </div>
                </div>
</form>
</section>
@endsection
