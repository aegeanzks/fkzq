<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Response;
class GuessController extends Controller
{

    
    public function index(Request $request){
         $type=$request->type;
         $phase=$request->phase;
         $status=$request->status;
         $display_flag=$request->display_flag;
         $page=$request->page;
         $starttime=str_replace('-','',$request->starttime);
         $endtime=str_replace('-','',$request->endtime);
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
                 "phase"=>$phase==null?"":$phase,
                 "status"=>$status==null?"":$status,
                 "display"=>$display_flag==null?"":$display_flag,
                 "page"=>$page==null?"":$page,
                 "start_time"=>$starttime==null?"":$starttime,
                 "end_time"=>$endtime==null?"":$endtime,
                 "sign"=>$sign
               ];
               $host=hosturl();
               $url=$host."/RealFootball/list";
               $resultjson=doCurlGetJsonReq($url,$data,30);
               $resultjson=json_decode($resultjson,True);
              try{
                $arrlength= count($resultjson) ;
              }catch (\Exception $e) {
                $arrlength=3;
              }
            if($arrlength==2)
               {
               $restatus=$resultjson[0]['status'];
               if($restatus==200){
                   $data=[
                       "type"=>$type==null?1:$type,
                       "phase"=>$phase==null?"":$phase,
                       "status"=>$status==null?"":$status,
                       "display"=>$display_flag==null?"":$display_flag,
                       "starttime"=>$starttime==null?"":$starttime,
                       "endtime"=>$endtime==null?"":$endtime,
                       "page"=>$page==null?1:$page,
                     ];
                     $postdata=[
                        "type"=>$type==null?1:$type,
                        "phase"=>$phase==null?"":$phase,
                        "status"=>$status==null?"":$status,
                        "display_flag"=>$display_flag==null?"":$display_flag,
                        "starttime"=>$starttime==null?"":$starttime,
                        "endtime"=>$endtime==null?"":$endtime,
                        "sign"=>$sign
                      ];
                   $pageurl='/guess/competitionmanage?'. http_build_query($postdata)."&page={page}";
                   $total=$resultjson[0]['totalCount'];
                   $dataarray=$resultjson[1];
                   $pagelist= buildPage($total,pagesize(),$page, $pageurl);
               }
               else if($restatus==2){
                $data=[
                    "type"=>$type==null?1:$type,
                    "phase"=>$phase==null?"":$phase,
                    "status"=>$status==null?"":$status,
                    "display"=>$display_flag==null?"":$display_flag,
                    "starttime"=>$starttime==null?"":$starttime,
                    "endtime"=>$endtime==null?"":$endtime,
                    "page"=>$page==null?1:$page,

                  ];
                   $dataarray=[];
                   $pagelist="";
               }
               else if($restatus==0){
                $data=[
                    "type"=>$type==null?1:$type,
                    "phase"=>$phase==null?"":$phase,
                    "status"=>$status==null?"":$status,
                    "display"=>$display_flag==null?"":$display_flag,
                    "starttime"=>$starttime==null?"":$starttime,
                    "endtime"=>$endtime==null?"":$endtime,
                    "page"=>$page==null?1:$page,

                  ];
                   $dataarray=[];
                   $pagelist="";
               }
            }
            else{
                $data=[
                    "type"=>$type==null?1:$type,
                    "phase"=>$phase==null?"":$phase,
                    "status"=>$status==null?"":$status,
                    "display"=>$display_flag==null?"":$display_flag,
                    "starttime"=>$starttime==null?"":$starttime,
                    "endtime"=>$endtime==null?"":$endtime,
                    "page"=>$page==null?1:$page,

                  ];
                $dataarray=[];
                $pagelist="";
            }
               //$pagelist= buildPage($rs_count,10);
               return view('guess.competitionmanage',compact('data','dataarray','pagelist'));
          
       }
   
     public function records(Request $request){
        $type=$request->type;
        $out_trade_no = $request->out_trade_no;
        $user_name=$request->user_name;
        $status=$request->status;
        $page=$request->page;
        $start_time=str_replace('-','',$request->start_time);
        $end_time=str_replace('-','',$request->end_time);
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
                "out_trade_no"=>$out_trade_no==null?"":$out_trade_no,
                "user_name"=>$user_name==null?"":$user_name,
                "status"=>$status==null?"":$status,
                "page"=>$page==null?"":$page,
                "start_time"=>$start_time==null?"":$start_time,
                "end_time"=>$end_time==null?"":$end_time,
                "sign"=>$sign
              ];
              $host=hosturl();
              $url=$host."/RealFootball/records";
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
                      "out_trade_no"=>$out_trade_no==null?"":$out_trade_no,
                      "user_name"=>$user_name==null?"":$user_name,
                      "status"=>$status==null?"":$status,
                      "start_time"=>$start_time==null?"":$start_time,
                      "end_time"=>$end_time==null?"":$end_time,
                      "page"=>$page==null?1:$page,
                      "sign"=>$sign
                    ];
                    $postdata=[
                       "type"=>$type==null?1:$type,
                       "out_trade_no"=>$out_trade_no==null?"":$out_trade_no,
                       "user_name"=>$user_name==null?"":$user_name,
                       "status"=>$status==null?"":$status,
                       "start_time"=>$start_time==null?"":$start_time,
                       "end_time"=>$end_time==null?"":$end_time,
                       "sign"=>$sign
                     ];
                  $pageurl='/guess/competitionrecords?'. http_build_query($postdata)."&page={page}";
                  $total=$resultjson[0]['totalCount'];
                  $dataarray=$resultjson[1];
                  $pagelist= buildPage($total,pagesize(),$page, $pageurl);
              }
              else if($restatus==2){
                $data=[
                    "type"=>$type==null?1:$type,
                    "out_trade_no"=>$out_trade_no==null?"":$out_trade_no,
                    "user_name"=>$user_name==null?"":$user_name,
                    "status"=>$status==null?"":$status,
                    "start_time"=>$start_time==null?"":$start_time,
                    "end_ime"=>$end_time==null?"":$end_time,
                    "page"=>$page==null?1:$page,

                  ];
                  $dataarray=[];
                  $pagelist="";
              }
              else if($restatus==0){
                $data=[
                    "type"=>$type==null?1:$type,
                    "out_trade_no"=>$out_trade_no==null?"":$out_trade_no,
                    "user_name"=>$user_name==null?"":$user_name,
                    "status"=>$status==null?"":$status,
                    "start_time"=>$start_time==null?"":$start_time,
                    "end_time"=>$end_time==null?"":$end_time,
                    "page"=>$page==null?1:$page,

                  ];
                  $dataarray=[];
                  $pagelist="";
              }
           }
           else{
            $data=[
                "type"=>$type==null?1:$type,
                "out_trade_no"=>$out_trade_no==null?"":$out_trade_no,
                "user_name"=>$user_name==null?"":$user_name,
                "status"=>$status==null?"":$status,
                "start_time"=>$start_time==null?"":$start_time,
                "end_time"=>$end_time==null?"":$end_time,
                "page"=>$page==null?1:$page,

              ];
               $dataarray=[];
               $pagelist="";
           }
              return view('guess.competitionrecords',compact('data','dataarray','pagelist'));
    }

    public function loadbetplan(Request $request){
        $out_trade_no=$request->out_trade_no;
        $type =7;
        $key=getmd5key();
        if($out_trade_no==null){
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
            ];
            return view("tips",compace('data'));
        }
        else{
            $url=hosturl(). "/RealFootball/records";
            $sign=md5($out_trade_no.$key.$type);
            $getarray=[
                "out_trade_no"=>$out_trade_no,
                "type"=>$type,
                "sign"=> $sign
                 ];
            $resultjson=doCurlGetJsonReq($url,$getarray,30);
            $resultjson=json_decode($resultjson,True);
            try{
                $arrlength= count($resultjson) ;
              }catch (\Exception $e) {
                $arrlength=3;
              }
            if($arrlength!=3)
             {
                $restatus=$resultjson[0]['status'];
                $data=$resultjson[1];
                if($restatus==200){
                    return view('guess.competitionbetplan',compact('data'));
                }
                else if($restatus==2)
                {
                    $data=[
                        'ico'=>'fa-warning',
                        'msg'=>'签名或参数错误'
                    ];
                    return  view("tips",compact('data'));
                }
                else
                {
                    $data=[
                        'ico'=>'fa-warning',
                        'msg'=>'签名或参数错误'
                    ];
                    return  view("tips",compact('data'));
                }
           }
           else{
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'签名或参数错误'
            ];
            return  view("tips",compact('data'));
           }


          }


    }

    public function loadedit(Request $request){
        $id=$request->id;
        $type=10;
        $key=getmd5key();
        if($id==null)
        {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
              ];
            return  view("tips",compact('data'));
        }
        else{
            $url=hosturl(). "/RealFootball/list";
            $sign=md5($id.$key.$type);
            $getarray=[
                "id"=>$id,
                "type"=>$type,
                "sign"=> $sign
                 ];
            $resultjson=doCurlGetJsonReq($url,$getarray,30);
            $resultjson=json_decode($resultjson,True);
            try{
                $arrlength= count($resultjson) ;
              }catch (\Exception $e) {
                $arrlength=3;
              }
            if($arrlength!=3)
             {
                $restatus=$resultjson[0]['status'];
                $data=$resultjson[1];
                if($restatus==200){
                    return view('guess.competitionedit',compact('data'));
                }
                else if($restatus==2)
                {
                    $data=[
                        'ico'=>'fa-warning',
                        'msg'=>'签名或参数错误'
                    ];
                    return  view("tips",compact('data'));
                }
                else
                {
                    $data=[
                        'ico'=>'fa-warning',
                        'msg'=>'签名或参数错误'
                    ];
                    return  view("tips",compact('data'));
                }
           }
           else{
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'签名或参数错误'
            ];
            return  view("tips",compact('data'));
           }


          }
    }

    public function loadupdate(Request $request){
        $id=$request->id;
        $home_team=$request->hometeam;
        $away_team=$request->awayteam;
        $odds_jingcaihostwin=$request->oddsjingcaihostwin;
        $odds_jingcaipingwin=$request->oddsjingcaipingwin;
        $odds_jingcaiawaywin=$request->oddsjingcaiawaywin;
        $odds_rangqiuhostwin=$request->oddsrangqiuhostwin;
        $odds_rangqiupingwin=$request->oddsrangqiupingwin;
        $odds_rangqiuawaywin=$request->oddsrangqiuawaywin;
        
        $odds_jingcaiadminhostwin=$request->oddsjingcaiadminhostwin;
        $odds_jingcaiadminpingwin=$request->oddsjingcaiadminpingwin;
        $odds_jingcaiadminawaywin=$request->oddsjingcaiadminawaywin;
        $odds_rangqiuadminhostwin=$request->oddsrangqiuadminhostwin;
        $odds_rangqiuadminpingwin=$request->oddsrangqiuadminpingwin;
        $odds_rangqiuadminawaywin=$request->oddsrangqiuadminwaywin;
        $lottery_status = $request->lottery_status;
        $input_flag=$request->input_flag;
        $final_score=$request->final_score;
        if($final_score!=null){
            try{

            }
            catch(\Exception $e){

            }
        }
        if($id==null || $home_team==null || $away_team==null|| $input_flag==null || ($lottery_status =='0' &&$input_flag == "1" && ($odds_jingcaiadminhostwin == null
          || $odds_jingcaiadminpingwin == null || $odds_jingcaiadminawaywin == null ||$odds_rangqiuadminhostwin == null 
          || $odds_rangqiuadminpingwin == null || $odds_rangqiuadminawaywin == null || $lottery_status == null)))
        {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
              ];
            return  view("tips",compact('data'));
        }
        else{

        

            $type=3;
            $key=getmd5key();
            $sign=md5($key.$id.$input_flag.$type);
            $url=hosturl()."/RealFootball/updateRaceInfo";
            $getarray=[
                "type"=>$type,
                "id"=>$id,
                "home_team"=> $home_team,
                "away_team"=>$away_team,
                "odds_jingcai"=>["h"=>$odds_jingcaihostwin,"d"=>$odds_jingcaipingwin,"a"=>$odds_jingcaiawaywin],
                "odds_rangqiu"=>["h"=>$odds_rangqiuhostwin,"d"=>$odds_rangqiupingwin,"a"=>$odds_rangqiuawaywin],
                "odds_jingcai_admin"=>["h"=>$odds_jingcaiadminhostwin,"d"=>$odds_jingcaiadminpingwin,"a"=>$odds_jingcaiadminawaywin],
                "odds_rangqiu_admin"=>["h"=>$odds_rangqiuadminhostwin,"d"=>$odds_rangqiuadminpingwin,"a"=>$odds_rangqiuadminawaywin],
                "lottery_status"=>$lottery_status,
                "input_flag"=>$input_flag,
                "final_score"=>$final_score,
                "sign"=>$sign
                 ];
            $resultjson= doCurlGetJsonReq($url,$getarray,30);
            $rdata=json_decode($resultjson,True);
           if($rdata['status']==200){
            $data=[
                'ico'=>'fa-check',
                'msg'=>'赛事更新成功'
              ];
              return  view("tips",compact('data'));
           }
           else{
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'签名或参数错误'
              ];
              return  view("tips",compact('data'));
           }
         
        }
    }
 
 
 
    /**
	 * 更新竞彩足球属性值状态
	 */
    public function changeracetype(Request $request){
       $type=$request->type;
       $id=$request->id;
       $display=$request->display;
       $hot_flag=$request->hot_flag;
       $key=getmd5key();
       if($type==null || $id==null){
        $data=[
            'errcode'=>2,
            'msg'=>'请选择要修改的比赛'
          ];
       return  Response()->json($data);
       }
       //	var sign = signValue+req.query.display+type;
       if($type=="1"){
          if($display ==null ){
            $data=[
                'errcode'=>2,
                'msg'=>'参数错误'
              ];
           return  Response()->json($data);
          } 
        $sign=md5($key.$display.$type);
        $host=hosturl();
        $url=$host."/RealFootball/updateRaceInfo";
        $getdata=[
            "type"=>$type,
            "sign"=>$sign,
            "id"=>$id,
            "display"=>$display
        ];
        $resultjson=doCurlGetJsonReq($url,$getdata,30);
        $resultjson=json_decode($resultjson,True);
        $restatus=$resultjson['status'];
        if($restatus==200){
            $data=[
                'errcode'=>200,
                'msg'=>'更新成功'
              ];
          
        }
        else {
            $data=[
                'errcode'=>2,
                'msg'=>'签名sign或参数错误'
              ];
        }
        return  Response()->json($data);
       }
       else if($type=="2"){
        if($hot_flag==null ){
            $data=[
                'errcode'=>2,
                'msg'=>'参数错误'
              ];
           return  Response()->json($data);
          } 
        $sign=md5($key.$hot_flag.$type);  
        $host=hosturl();
        $url=$host."/RealFootball/updateRaceInfo";
        $getdata=[
            "type"=>$type,
            "sign"=>$sign,
            "id"=>$id,
            "hot_flag"=>$hot_flag
        ];
        $resultjson=doCurlGetJsonReq($url,$getdata,30);
        $resultjson=json_decode($resultjson,True);
        $restatus=$resultjson['status'];
        if($restatus==200){
            $data=[
                'errcode'=>200,
                'msg'=>'更新热门成功'
              ];
          
        }
        else {
            $data=[
                'errcode'=>2,
                'msg'=>'签名sign或参数错误'
              ];
        }
        return  Response()->json($data);
       }
   
    }

}
