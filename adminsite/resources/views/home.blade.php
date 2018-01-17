@extends('layouts.base')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-10 col-md-offset-1">
            <div class="panel panel-default">
                <div class="panel-heading">欢迎你,<h2>{{ Auth::user()->name }}</h2></div>

                <div class="panel-body">
                  
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
