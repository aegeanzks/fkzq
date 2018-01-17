@extends('layouts.base')
@section('content')
<!-- Content Header (Page header) -->
<section class="content-header">
  <h1>
   个人信息中心
  </h1>
  <ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
    <li class="active"> 个人信息中心</li>
  </ol>
</section>

<!-- Main content -->
<section class="content">

  <div class="row">
    <div class="col-md-12">

      <!-- Profile Image -->
      <div class="box box-primary">
        <div class="box-body box-profile">
          <img class="profile-user-img img-responsive img-circle" src="../../dist/img/user2-160x160.jpg" alt="User profile picture">

          <h3 class="profile-username text-center"> {{ Auth::user()->name }}</h3>

          <p class="text-muted text-center">  @if (Auth::user()->groupid==2 ) 超级管理员 @else 管理员 @endif</p>
        </div>
        <!-- /.box-body -->
      </div>
      <!-- /.box -->

      <!-- About Me Box -->
      <div class="box box-primary">
      <div class="box-header with-border">
        <h3 class="box-title">重设密码</h3>
      </div>
      <!-- /.box-header -->
      <!-- form start -->
      <form role="form" name="form1" action="{{url('/editpwd')}}"  method="POST">
        <div class="box-body">
        {{ csrf_field() }}
          <div class="form-group">
            <label for="exampleInputPassword1">旧密码</label>
            <input type="password" class="form-control" name="opwdtxt" id="opwdtxt" placeholder="输入旧密码">
          </div>
          <div class="form-group">
          <label for="exampleInputPassword1">新密码</label>
          <input type="password" class="form-control" name="npwdtxt" id="npwdtxt"  placeholder="输入新密码">
          </div>
          <div class="form-group">
          <label for="exampleInputPassword1">确认密码</label>
          <input type="password" class="form-control"  name="rnpwdtxt" id="rnpwdtxt"  placeholder="再次输入新密码">
          </div>
        </div>
        <!-- /.box-body -->

        <div class="box-footer">
          <button type="submit" class="btn btn-primary">设置</button>
        </div>
      </form>
    </div>
      <!-- /.box -->
    </div>
  
    <!-- /.col -->
  </div>
  <!-- /.row -->

</section>
<!-- /.content -->
  @endsection
