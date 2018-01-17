@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
管理员列表
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/userlist')}}">管理员列表</a></li>
  <li class="active">编辑管理员</li>
</ol>
</section>
<section class="content">
<div class="box box-warning">
<div class="box-header with-border">
  <h3 class="box-title">编辑</h3>
</div>
<!-- /.box-header -->
<div class="box-body">
<form role="form" onsubmit="return checkinput();"  action="{{ url('/user/add')}}">
    <!-- text input -->
    <div class="form-group">
      <label>用户名</label>
      <input type="text" name="name" id="name" class="form-control" placeholder="输入用户名" />
    </div>
    <div class="form-group">
      <label>姓名</label>
      <input type="text" name="realname" id="realname" class="form-control" placeholder="输入姓名"  />
    </div>
    <div class="form-group">
      <label>电话</label>
      <input type="text" name="mobile" id="mobile"  class="form-control" placeholder="输入电话" />
    </div>
    <div class="form-group">
      <label>邮箱</label>
      <input type="text" name="email" id="email"  class="form-control" placeholder="输入邮箱" />
    </div>
    <div class="form-group">
      <label>密码</label>
      <input type="password" name="password" id="password"  class="form-control" placeholder="输入密码" />
    </div>
    <div class="form-group">
      <label>确认密码</label>
      <input type="password" name="rpassword" id="rpassword"  class="form-control" placeholder="再次输入密码" />
    </div>
    <div class="form-group">
      <label>管理分组</label>
      <select id="groupid" name="groupid" class="form-control">
        <option value="">请选择</option>
        <option value="1">管理员</option>
        <option value="2">超级管理员</option>
      </select>
    </div>
    <div class="box-footer">
      <button type="submit" class="btn btn-primary">确 定</button>
    </div>
    </div>

  </form>
  <script>
  function checkinput(){
    

        var account = $('#name').val();
        if(!(/^[a-zA-Z0-9_]{4,32}$/.test(account))){
            bootbox.alert('请输入正确的账号(账号由4-32位字母、数字、下划线组成)');
            return false;
        }
        var realname = $('#realname').val();
        if(!( /^([a-zA-Z0-9\u4e00-\u9fa5\·]{0,32})$/.test(realname))){
            bootbox.alert('请输入正确的姓名(汉字组成))');
            return false;
        }

        var mobile = $('#mobile').val();
            if(mobile!=""){
                if(!(/^1[34578]\d{9}$/.test(mobile))){
                	bootbox.alert("手机号码有误，请重填");
                return false;
            }
        }
        var email = $('#email').val();
            if(email!=""){
                if(!(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(email))){
                	bootbox.alert("邮箱格式不正确，请重填");
                return false;
            }
        }

        var password=$('#password').val();
        if(!(/^([a-zA-Z0-9!@#$%^&*()_?<>{}]{6,22})$/.test(password))){
            bootbox.alert('密码设置有误，请重填');
            return false;
        }

        var repassword=$('#rpassword').val();
        if(repassword!=password){
            bootbox.alert('两次输入的密码不一致');
            return false;
        }

        if($("#groupid").val()==""){
            bootbox.alert('请管理分组');
            return false;
       }

  }
  </script>
</div>
<!-- /.box-body -->
</div>
</section>
@endsection
