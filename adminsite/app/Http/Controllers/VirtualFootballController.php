<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Response;

class VirtualFootballController extends Controller
{
    public function matchlist(Request $request){
        $type=$request->type;
        $date=$request->date;
        $date_num=$request->date_num;
        $page=$request->page;
        $key=getmd5key();
   
           if($type==null){
               
                  $type=1;
                  $page=1;
                  $sign=md5($page.$key.$type);
              }
              else{
               if($page==null){
                   $page=1;
                 }
                  $sign=md5($page.$key.$type);
               
              }
                  
              $data=[
                "type"=>$type==null?1:$type,
                "date"=>$date==null?"":$date,
                "date_num"=>$date_num==null?"":$date_num,
                "page"=>$page==null?"":$page,
                "sign"=>$sign
              ];
              $host=hosturl();
              $url=$host."/VFootball/list";
              $resultjson=doCurlGetJsonReq($url,$data,30);
              $resultjson=json_decode($resultjson,True);
             try{
               $arrlength= count($resultjson) ;
             }catch (\Exception $e) {
               $arrlength=3;
             }
              if($arrlength!=3)
              {
              $restatus=$resultjson[0]['status'];
              if($restatus==200){
                  $data=[
                    "type"=>$type==null?1:$type,
                    "date"=>$date==null?"":$date,
                    "date_num"=>$date_num==null?"":$date_num,
                    "page"=>$page==null?"":$page,
                    ];
                    $postdata=[
                        "type"=>$type==null?1:$type,
                        "date"=>$date==null?"":$date,
                        "date_num"=>$date_num==null?"":$date_num,
                        "sign"=>$sign
                     ];
                  $pageurl='/vfootball/matchlist?'. http_build_query($postdata)."&page={page}";
                  $total=$resultjson[0]['totalCount'];
                  $dataarray=$resultjson[1];
                  $pagelist= buildPage($total,10,$page, $pageurl);
              }
              else if($restatus==2){
               $data=[
                "type"=>$type==null?1:$type,
                "date"=>$date==null?"":$date,
                "date_num"=>$date_num==null?"":$date_num,
                "page"=>$page==null?"":$page

                 ];
                  $dataarray=[];
                  $pagelist="";
              }
              else if($restatus==0){
               $data=[
                "type"=>$type==null?1:$type,
                "date"=>$date==null?"":$date,
                "date_num"=>$date_num==null?"":$date_num,
                "page"=>$page==null?"":$page

                 ];
                  $dataarray=[];
                  $pagelist="";
              }
           }
           else{
               $data=[
                "type"=>$type==null?1:$type,
                "date"=>$date==null?"":$date,
                "date_num"=>$date_num==null?"":$date_num,
                "page"=>$page==null?"":$page

                 ];
               $dataarray=[];
               $pagelist="";
           }
              //$pagelist= buildPage($rs_count,10);
              return view('vfootball.Matchlist',compact('data','dataarray','pagelist'));
         
      }


      public function crecordlist(Request $request){
        $type=$request->type;
        $user_name=$request->user_name;
        $balance_schedule_id=$request->balance_schedule_id;
        $status=$request->status;
        $page=$request->page;
        $start_time=$request->start_time;
        $end_time=$request->end_time;
        $key=getmd5key();
   
           if($type==null){
                  $type=1;
                  $page=1;
                  $sign=md5($page.$key.$type);
              }
              else{
               if($page==null){
                   $page=1;
                 }
                  $sign=md5($page.$key.$type);
               
              }
                  
              $data=[
                "type"=>$type==null?1:$type,
                "user_name"=>$user_name==null?"":$user_name,
                "status"=>$status==null?"":$status,
                "balance_schedule_id"=>$balance_schedule_id==null?"":$balance_schedule_id,
                "start_time"=>$start_time==null?"":$start_time,
                "end_time"=>$end_time==null?"":$end_time,
                "page"=>$page==null?"":$page,
                "sign"=>$sign
              ];
              $host=hosturl();
              $url=$host."/VFootball/records";
              $resultjson=doCurlGetJsonReq($url,$data,30);
              $resultjson=json_decode($resultjson,True);
             try{
               $arrlength= count($resultjson) ;
             }catch (\Exception $e) {
               $arrlength=3;
             }
              if($arrlength!=3)
              {
              $restatus=$resultjson[0]['status'];
              if($restatus==200){
                  $data=[
                    "type"=>$type==null?1:$type,
                    "user_name"=>$user_name==null?"":$user_name,
                    "status"=>$status==null?"":$status,
                    "balance_schedule_id"=>$balance_schedule_id==null?"":$balance_schedule_id,
                    "start_time"=>$start_time==null?"":$start_time,
                    "end_time"=>$end_time==null?"":$end_time,
                    "page"=>$page==null?"":$page,
                    ];
                    $postdata=[
                        "type"=>$type==null?1:$type,
                        "user_name"=>$user_name==null?"":$user_name,
                        "status"=>$status==null?"":$status,
                        "balance_schedule_id"=>$balance_schedule_id==null?"":$balance_schedule_id,
                        "start_time"=>$start_time==null?"":$start_time,
                        "end_time"=>$end_time==null?"":$end_time,
                        "sign"=>$sign
                     ];
                  $pageurl='/vfootball/compeetitivrecord?'. http_build_query($postdata)."&page={page}";
                  $total=$resultjson[0]['totalCount'];
                  $dataarray=$resultjson[1];
                  $pagelist= buildPage($total,10,$page, $pageurl);
              }
              else if($restatus==2){
               $data=[
                "type"=>$type==null?1:$type,
                "user_name"=>$user_name==null?"":$user_name,
                "status"=>$status==null?"":$status,
                "balance_schedule_id"=>$balance_schedule_id==null?"":$balance_schedule_id,
                "start_time"=>$start_time==null?"":$start_time,
                "end_time"=>$end_time==null?"":$end_time,
                "page"=>$page==null?"":$page,
                 ];
                  $dataarray=[];
                  $pagelist="";
              }
              else if($restatus==0){
               $data=[
                "type"=>$type==null?1:$type,
                "user_name"=>$user_name==null?"":$user_name,
                "status"=>$status==null?"":$status,
                "balance_schedule_id"=>$balance_schedule_id==null?"":$balance_schedule_id,
                "start_time"=>$start_time==null?"":$start_time,
                "end_time"=>$end_time==null?"":$end_time,
                "page"=>$page==null?"":$page,
                 ];
                  $dataarray=[];
                  $pagelist="";
              }
           }
           else{
               $data=[
                "type"=>$type==null?1:$type,
                "user_name"=>$user_name==null?"":$user_name,
                "status"=>$status==null?"":$status,
                "balance_schedule_id"=>$balance_schedule_id==null?"":$balance_schedule_id,
                "start_time"=>$start_time==null?"":$start_time,
                "end_time"=>$end_time==null?"":$end_time,
                "page"=>$page==null?"":$page,
                 ];
               $dataarray=[];
               $pagelist="";
           }
              //$pagelist= buildPage($rs_count,10);
              return view('vfootball.CompetitiveRecord',compact('data','dataarray','pagelist'));

      }
}
