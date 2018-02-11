@extends('layouts.base')
@section('content')
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>
      </h1>
      <ol class="breadcrumb">
        <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
        <li class="active">提示页</li>
      </ol>
    </section>

    <!-- Main content -->
    <section class="content">
      <div class="error-page">
        <h2 class="headline text-yellow"> 提示</h2>

        <div class="error-content">
         

          <h3><i class="fa {{ $data['ico']}} text-yellow"></i>  {{ $data['msg'] }} !</h3>
          <div>
						<h4 class="lighter smaller">页面自动 <a id="href" href="javascript:history.back()">跳转</a> 等待时间： <b id="wait">5</b> 秒</h4>

					</div>
          <p>
           <a href="javascript:history.back()">马上返回</a>
          </p>
        </div>
        <!-- /.error-content -->
      </div>
      <!-- /.error-page -->
    </section>
    <script>
      $(function(){
        var url=document.referrer;
        var wait = document.getElementById('wait');
        var interval = setInterval(function(){
          var time = --wait.innerHTML;
          if(time <= 0) {
         //   
            if(url==""){
              history.back();
            }
            else{
              document.location.href= url ;
            }
            clearInterval(interval);
          };
        }, 1000);

      });
    </script>
  
    <!-- /.content -->
    @endsection
