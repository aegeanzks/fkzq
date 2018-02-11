@extends('layouts.base')
@section('content')
<section class="content-header">
<h1>
编辑赛事
  </h1>
<ol class="breadcrumb">
  <li><a href="{{url('/')}}"><i class="fa fa-dashboard"></i> 首页</a></li>
  <li><a href="{{url('/guess/competitionmanage')}}">比赛管理</a></li>
  <li class="active">编辑赛事</li>
</ol>
</section>
<section class="content">
<div class="box box-warning">
<div class="box-header with-border">
  <h3 class="box-title">编辑</h3>
</div>
<!-- /.box-header -->
<div class="box-body">
<form role="form" onsubmit="return checksubmit()" action="{{url('/guess/competitionupdate')}}">
<div class="box-header with-border">
    <h3 class="box-title">基础信息</h3>
 </div>
    <!-- text input -->
    <div class="form-group">
      <label>比赛时间</label>
    <div class="input-group date">
        <div class="input-group-addon">
        <i class="fa fa-calendar"></i>
        </div>
    <input type="text" class="form-control pull-right" id="match_date" name="match_date" value="{{$data[0]['match_date']}}"  readonly="readonly" />
    <!-- <input type="text" class="form-control pull-right" id="match_date" name="match_date" value="{{$data[0]['match_date']}}" /> -->
 </div>
</div>
    <div class="form-group">
      <label>主队名称</label>
      <input type="text" name="hometeam" id="home_team" class="form-control" placeholder="输入主队名称" value="{{$data[0]['home_team']}}"  readonly="readonly"/>
    </div>
    <div class="form-group">
      <label>客队名称</label>
      <input type="text" name="awayteam" id="away_team"  class="form-control" placeholder="输入客队名称" value="{{$data[0]['away_team']}}" readonly="readonly"/>
    </div>
    <div class="form-group">
      <label>让球</label>
      <input type="text" name="handicap" id="handicap" class="form-control" placeholder="让球数" value="{{$data[0]['handicap']}}"  readonly="readonly"/>
    </div>
<div class="form-group">
 <label>全场比分</label>
 @if($data[0]['lottery_status']!=0 and $data[0]['status'] == 1)
 <input type="text" name="final_score" id="final_score"  class="form-control" placeholder="比赛已完场,请输入比分" value="{{$data[0]['final_score']}}" />
 @else
 <input type="text" name="final_score" id="final_score"  class="form-control" placeholder="等待比赛完场" value="{{$data[0]['final_score']}}"  readonly="readonly" />
 @endif
</div>
<div class="box-header with-border">
              <h3 class="box-title">赔率修改</h3>
 </div>
 <div class="row">
 <div class="col-sm-12" style="padding-top:8px;">
<div class="form-group">
<input type="radio" name="input_flag" id="radio1" onchange="test(this.id)" value="0" />
<label>
  启动抓取数据
  <div class="row"  style="padding-top:20px;">
   <div class="col-sm-2">
   <label>   胜平负玩法</label>
   </div>
    <div class="col-sm-2">
    <label>主胜</label>
    <input type="text" name="oddsjingcaihostwin" id="odds_jingcaihostwin"  class="form-control" placeholder="输入主胜率" value="{{$data[0]['odds_jingcai'][0]['h']}}" readonly="readonly"/>
   </div>
   <div class="col-sm-2">
   <label>平</label>
   <input type="text" name="oddsjingcaipingwin" id="odds_jingcaipingwin"  class="form-control" placeholder="输入平胜率" value="{{$data[0]['odds_jingcai'][0]['d']}}" readonly="readonly"/>
   </div>
   <div class="col-sm-2">
   <label>客胜</label>
   <input type="text" name="oddsjingcaiawaywin" id="odds_jingcaiawaywin"  class="form-control" placeholder="输入客胜率"  value="{{$data[0]['odds_jingcai'][0]['a']}}" readonly="readonly"/>
   </div>
  </div> 

  <div class="row"  style="padding-top:20px;">
   <div class="col-sm-2">
   <label> 让球胜平负玩法</label>
   </div>
    <div class="col-sm-2">
    <label>主胜</label>
    <input type="text" name="oddsrangqiuhostwin" id="odds_rangqiuhostwin"  class="form-control" placeholder="输入主胜率"  value="{{$data[0]['odds_rangqiu'][0]['h']}}" readonly="readonly"/>
   </div>
   <div class="col-sm-2">
   <label>平</label>
   <input type="text" name="oddsrangqiupingwin" id="odds_rangqiupingwin"  class="form-control" placeholder="输入平胜率" value="{{$data[0]['odds_rangqiu'][0]['d']}}" readonly="readonly"/>
   </div>
   <div class="col-sm-2">
   <label>客胜</label>
   <input type="text" name="oddsrangqiuawaywin" id="odds_rangqiuawaywin"  class="form-control" placeholder="输入客胜率" value="{{$data[0]['odds_rangqiu'][0]['a']}}" readonly="readonly"/>
   </div>
</div>
</label>

<input type="radio" name="input_flag" id="radio2" onchange="test(this.id)" value="1" />
<label>
 
 启动管理员录入数据
 <tbody id="bodycontent">
 <div class="row"  style="padding-top:20px;">
 <div class="col-sm-2">
 <label>   胜平负玩法</label>
 </div>
  <div class="col-sm-2">
  <label>主胜</label>
  <input type="text" name="oddsjingcaiadminhostwin"  id="odds_jingcaiadminhostwin"  class="form-control" placeholder="输入主胜率" value="{{$data[0]['odds_jingcai_admin'][0]['h']}}" />
 </div>
 <div class="col-sm-2">
 <label>平</label>
 <input type="text" name="oddsjingcaiadminpingwin" id="odds_jingcaiadminpingwin"  class="form-control" placeholder="输入平胜率" value="{{$data[0]['odds_jingcai_admin'][0]['d']}}" />
 </div>
 <div class="col-sm-2">
 <label>客胜</label>
 <input type="text" name="oddsjingcaiadminawaywin" id="odds_jingcaiadminawaywin"  class="form-control" placeholder="输入客胜率"  value="{{$data[0]['odds_jingcai_admin'][0]['a']}}" />
 </div>
</div> 

<div class="row"  style="padding-top:20px;">
 <div class="col-sm-2">
 <label> 让球胜平负玩法</label>
 </div>
  <div class="col-sm-2">
  <label>主胜</label>
  <input type="text" name="oddsrangqiuadminhostwin" id="odds_rangqiuadminhostwin"  class="form-control" placeholder="输入主胜率"  value="{{$data[0]['odds_rangqiu_admin'][0]['h']}}" />
 </div>
 <div class="col-sm-2">
 <label>平</label>
 <input type="text" name="oddsrangqiuadminpingwin" id="odds_rangqiuadminpingwin"  class="form-control" placeholder="输入平胜率" value="{{$data[0]['odds_rangqiu_admin'][0]['d']}}" />
 </div>
 <div class="col-sm-2">
 <label>客胜</label>
 <input type="text" name="oddsrangqiuadminwaywin" id="odds_rangqiuadminawaywin"  class="form-control" placeholder="输入客胜率" value="{{$data[0]['odds_rangqiu_admin'][0]['a']}}"  />
 </div>
</div>
</tbody>
 </label>

</div>
</div>
</div>

<script>
function test(id){
  if("{{$data[0]['lottery_status']}}"!=0){
      document.getElementsByName('oddsjingcaiadminhostwin')[0].setAttribute("disabled","true");
      document.getElementsByName('oddsjingcaiadminpingwin')[0].setAttribute("disabled","true");
      document.getElementsByName('oddsjingcaiadminawaywin')[0].setAttribute("disabled","true");

      document.getElementsByName('oddsrangqiuadminhostwin')[0].setAttribute("disabled","true");
      document.getElementsByName('oddsrangqiuadminpingwin')[0].setAttribute("disabled","true");
      document.getElementsByName('oddsrangqiuadminwaywin')[0].setAttribute("disabled","true");
  }else{
    if(id == "radio2"){
      document.getElementsByName('oddsjingcaiadminhostwin')[0].removeAttribute("disabled");
      document.getElementsByName('oddsjingcaiadminpingwin')[0].removeAttribute("disabled");
      document.getElementsByName('oddsjingcaiadminawaywin')[0].removeAttribute("disabled");

      document.getElementsByName('oddsrangqiuadminhostwin')[0].removeAttribute("disabled");
      document.getElementsByName('oddsrangqiuadminpingwin')[0].removeAttribute("disabled");
      document.getElementsByName('oddsrangqiuadminwaywin')[0].removeAttribute("disabled");
      
    }else{
      document.getElementsByName('oddsjingcaiadminhostwin')[0].setAttribute("disabled","true");
      document.getElementsByName('oddsjingcaiadminpingwin')[0].setAttribute("disabled","true");
      document.getElementsByName('oddsjingcaiadminawaywin')[0].setAttribute("disabled","true");

      document.getElementsByName('oddsrangqiuadminhostwin')[0].setAttribute("disabled","true");
      document.getElementsByName('oddsrangqiuadminpingwin')[0].setAttribute("disabled","true");
      document.getElementsByName('oddsrangqiuadminwaywin')[0].setAttribute("disabled","true");
    }
  }

}
</script>

   <div class="row">
   <input  type="hidden" name="id" id="id" value="{{$data[0]['id']}}" />
   <input  type="hidden" name="input_flaghidden" id="input_flaghidden" value="{{$data[0]['input_flag']}}" />
   <input  type="hidden" name="lottery_status" id="lottery_status" value="{{$data[0]['lottery_status']}}" />
   <button type="submit" id="savebtn" class="btn btn-primary" style="width:80px; margin-left:10px; float:left">保 存</button>
   <!-- <button type="button" class="btn btn-danger" onclick="javascript:history.back()"  style="width:80px; margin-left:10px; float:left ">取 消</button> -->

   &nbsp; &nbsp; &nbsp;
							<button class="btn" type="reset">
								<i class="icon-undo bigger-110"></i>
								重 置
							</button>
   </div>
    </div>

  </form>
</div>
<!-- /.box-body -->
<script >

$(function(){
      loaddata();
      $("#lottery_status").val("{{$data[0]['lottery_status']}}")

})
 function loaddata()
 {  
       var input_flag=$("#input_flaghidden").val();
         $('input:radio').each(function(index){
            if(parseInt($(this).attr('value'))==input_flag){
              $(this).attr('checked', 'true');
              if(input_flag =='0' || "{{$data[0]['lottery_status']}}"!=0 ){
                document.getElementsByName('oddsjingcaiadminhostwin')[0].setAttribute("disabled","true");
                document.getElementsByName('oddsjingcaiadminpingwin')[0].setAttribute("disabled","true");
                document.getElementsByName('oddsjingcaiadminawaywin')[0].setAttribute("disabled","true");

                document.getElementsByName('oddsrangqiuadminhostwin')[0].setAttribute("disabled","true");
                document.getElementsByName('oddsrangqiuadminpingwin')[0].setAttribute("disabled","true");
                document.getElementsByName('oddsrangqiuadminwaywin')[0].setAttribute("disabled","true");
              }
             }
          });
 }
function checksubmit(){
  var lottery_status ="{{$data[0]['lottery_status']}}"
  var status = "{{$data[0]['status']}}"
  if(status == 1 && lottery_status !=0 ){      //比赛结束并且等待开奖(拉取比分为空)/拉取比分错误重新录入
    var final_score=$("#final_score").val();
    if(final_score == ""){
      layer.alert('该比赛已完场,请输入比分');
        return false;
    }
    var pattern = /^(([1-9]?[0-9]?)\:([1-9]?[0-9]?))$/
    if(!pattern.test(final_score)){
      layer.alert('比赛比分格式不正确，如：1:1 ,请输入整数');
        return false;
    }
  }
  var oddsjingcaiadminhost = $('#odds_jingcaiadminhostwin').val();
  var oddsjingcaiadminping = $('#odds_jingcaiadminpingwin').val();
  var oddsjingcaiadminaway = $('#odds_jingcaiadminawaywin').val();
  var oddsrangqiuadminhost = $('#odds_rangqiuadminhostwin').val();
  var oddsrangqiuadminping = $('#odds_rangqiuadminpingwin').val();
  var oddsrangqiuadminway = $('#odds_rangqiuadminawaywin').val();

  if(oddsjingcaiadminhost == "" || oddsjingcaiadminping == "" 
     || oddsjingcaiadminaway =="" || oddsrangqiuadminhost == ""
     || oddsrangqiuadminping == "" || oddsrangqiuadminway == "" ){
      layer.alert('输入的管理员录入的赔率为空');
        return false;
  }
 return true;
}
</script>
</div>
</section>
@endsection
