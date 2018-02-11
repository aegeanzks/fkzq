<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Redirect;
use App\Http\Requests;
use Mockery\CountValidator\Exception;

class GamesetController extends Controller
{
    /**
	 * 获得游戏列表
	 */
    public function gamelist(Request $request){
        $page=$request->page;
        $key=getmd5key();
       if($page==null){
           $page=1;
         }
          $sign=md5($page.$key);    
              $data=[
                "page"=>$page==null?"":$page,
                "sign"=>$sign
              ];
              $host=hosturl();
              $url=$host."/SystemManage/getStockList";
              $resultjson=doCurlGetJsonReq($url,$data,30);
              $resultjson=json_decode($resultjson,True);
             try{
               $arrlength= count($resultjson) ;
             }catch (\Exception $e) {
               $arrlength=0;
             }
              if($arrlength>0)
              {
                    $restatus=$resultjson[0]['status'];
                    if($restatus==200){
                        $data=[
                            "sign"=>$sign
                              ];
                        $pageurl='/system/gamelist?'. http_build_query($data)."&page={page}";
                        $total=$resultjson[0]['totalCount'];
                        $dataarray=$resultjson[1];
                        $pagelist= buildPage($total,pagesize(),$page, $pageurl);
                    }
                    else if($restatus==2){
                        $dataarray=[];
                        $pagelist="";
                    }
                    else if($restatus==0){
                        $dataarray=[];
                        $pagelist="";
                    }
           }
           else{
               $dataarray=[];
               $pagelist="";
           }
              //$pagelist= buildPage($rs_count,10);
              return view('system.Gamesystemset',compact('data','dataarray','pagelist'));
         
    }

	/**
	 * 获得游戏的库存信息
	 */
    public function gamestockinfo(Request $request){

        $game_id=$request->gameid;
        $key=getmd5key();
        if($game_id==null)
        {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
              ];
            return  view("tips",compact('data'));
        }
        else{
            $url=hosturl(). "/SystemManage/getStockInfo";
            $sign=md5($game_id.$key);
            $getarray=[
                "game_id"=>$game_id,
                "sign"=> $sign
                 ];
            $resultjson=doCurlGetJsonReq($url,$getarray,30);
            $resultjson=json_decode($resultjson,True);
            try{
             $resarraylength=count( $resultjson);
            }
            catch(\Exception $ex){
             $resarraylength=3;
            }
            if($resarraylength!=3){
                $restatus=$resultjson[0]['status'];
                $data=$resultjson[1];
                if($restatus==200){
                    return view('system.Gamestockset',compact('data'));
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
	/**
	 * 库存信息更新
	 */
    public function gamestockinfoupdate(Request $request)
    {
        $game_id=$request->game_id;
        $cur_stock=$request->cur_stock;
        $stock_initial_value=$request->stock_initial_value;
        $cheat_chance_1=$request->cheat_chance_1;
        $stock_threshold_1=$request->stock_threshold_1;
        $cheat_chance_2=$request->cheat_chance_2;
        $stock_threshold_2=$request->stock_threshold_2;
        $cheat_chance_3=$request->cheat_chance_3;
        $key=getmd5key();
        if($game_id==null ||  $cur_stock==null || $stock_initial_value==null || $cheat_chance_1==null ||$stock_threshold_1==null || $cheat_chance_2==null || $stock_threshold_2==null ||$cheat_chance_3==null)
        {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
              ];
            return  view("tips",compact('data'));
        }
        else
        {
            $url=hosturl(). "/SystemManage/updateStockInfo";
            $sign=md5($game_id.$key);
            $getarray=[
                "cur_stock"=>$request->cur_stock,
                "stock_initial_value"=>$request->stock_initial_value,
                "cheat_chance_1"=>$request->cheat_chance_1,
                "stock_threshold_1"=>$request->stock_threshold_1,
                "cheat_chance_2"=>$request->cheat_chance_2,
                "stock_threshold_2"=>$request->stock_threshold_2,
                "cheat_chance_3"=>$request->cheat_chance_3,
                "game_id"=>$game_id,
                "sign"=> $sign
                 ];
            $resultjson=doCurlGetJsonReq($url,$getarray,30);
            $resultjson=json_decode($resultjson,True);
            $restatus=$resultjson['status'];
           if( $restatus==200)
            {
            $data=[
                'ico'=>'fa-check',
                'msg'=>'库存配置更新成功'
                ];
              return  view("tips",compact('data'));
             
            }
            else if($restatus==1){
                    $data=[
                        'ico'=>'fa-warning',
                        'msg'=>'库存配置更新失败'
                      ];
                    return  view("tips",compact('data'));
            }
            else{
                $data=[
                    'ico'=>'fa-warning',
                    'msg'=>'参数错误'
                  ];
                return  view("tips",compact('data'));
            }
        }
    }

      /**
	 * 获得游戏事件配置
	 */
    public function gamebaseset(Request $request){
        $key=getmd5key();
        $sign=md5('getEv'.$key); 
            $data=[
                "sign"=>$sign
              ];
              $host=hosturl();
              $url=$host."/SystemManage/getEventInfo";
              $resultjson=doCurlGetJsonReq($url,$data,30);
              $resultjson=json_decode($resultjson,True);
              try{
                $arrlength= count($resultjson) ;
              }catch (\Exception $e) {
                $arrlength=3;
              }
              if($arrlength!=3){
                $rstatus=$resultjson[0]['status'];
                if($rstatus==200){
                    $eventdata=$resultjson[1];
                  
                }
                else if($rstatus==2){
                    $eventdata=[];
                }
                else if($rstatus==1){
                    $eventdata=[];
                }
              }
              else{
                $eventdata=[];
              }
       
             
              return view('system.Gamebaseset',compact('eventdata'));
    }
	/**
	 * 游戏事件更新
	 */
   public function gameeventsetupdate(Request $request){
    $key=getmd5key();
    $sign=md5('getEv'.$key); 
        $data=[
            "sign"=>$sign
          ];
          $host=hosturl();
          $url=$host."/SystemManage/getEventInfo";
          $resultjson=doCurlGetJsonReq($url,$data,30);
          $resultjson=json_decode($resultjson,True);
          try{
            $arrlength= count($resultjson) ;
          }catch (\Exception $e) {
            $arrlength=3;
          }
          if($arrlength!=3){
            $rstatus=$resultjson[0]['status'];
            if($rstatus==200){
                $eventdata=$resultjson[1];
                $msg="";
               foreach($eventdata as $itemdata){
                    $total = intval(request('host_ball_handling_'.$itemdata['event_id'])) +
                             intval(request('host_attack_'.$itemdata['event_id'])) + 
                             intval(request('host_dangerous_attack_'.$itemdata['event_id'])) +
                             intval(request('guest_ball_handling_'.$itemdata['event_id'])) +
                             intval(request('guest_attack_'.$itemdata['event_id'])) +
                             intval(request('guest_dangerous_attack_'.$itemdata['event_id']));
                    if($total != 100){
                        $data=[
                            'ico'=>'fa-check',
                            'msg'=>'修改失败,'.$itemdata['event_name'].'概率之和不为100%',
                          ];
                        return  view("tips",compact('data'));
                    }
                    $postdata=[
                    "event_id"=>$itemdata['event_id'],
                    "host_ball_handling"=>request('host_ball_handling_'.$itemdata['event_id']),
                    "host_attack"=>request('host_attack_'.$itemdata['event_id']),
                    "host_dangerous_attack"=>request('host_dangerous_attack_'.$itemdata['event_id']),
                    "guest_ball_handling"=>request('guest_ball_handling_'.$itemdata['event_id']),
                    "guest_attack"=>request('guest_attack_'.$itemdata['event_id']),
                    "guest_dangerous_attack"=>request('guest_dangerous_attack_'.$itemdata['event_id']),
                    "animation_time"=>request('animation_time_'.$itemdata['event_id']),
                    "blockade"=>request('blockade_'.$itemdata['event_id']),
                    "sign"=>md5($itemdata['event_id'].$key)
                    ];
                    $url=$host."/SystemManage/updateEventInfo";
                    $resultjson=doCurlGetJsonReq($url,$postdata,30);
                    $resultjson=json_decode($resultjson,True);
            
                      $rstatus=$resultjson['status'];
                      if($rstatus!=200){
                         $msg=$msg.$itemdata['event_name']."事件配置更新失败<br>";
                      }

               }

               if($msg!=""){
                $data=[
                    'ico'=>'fa-warning',
                    'msg'=> $msg
                  ];
                return  view("tips",compact('data'));
               }
               else{
                $data=[
                    'ico'=>'fa-check',
                    'msg'=>'事件配置更新成功'
                  ];
                return  view("tips",compact('data'));
               }
            }
        }

   }

   	/**
	 * 获得游戏的赔率信息
	 */
    public function gameoodinfo(Request $request){
        $page=$request->page;
        $key=getmd5key();
       if($page==null){
           $page=1;
         }
          $sign=md5($page.$key);    
              $data=[
                "page"=>$page==null?"":$page,
                "sign"=>$sign
              ];
              $host=hosturl();
              $url=$host."/SystemManage/getOddsInfo";
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
                            "sign"=>$sign
                              ];
                        $pageurl='/system/gameoodinfo?'. http_build_query($data)."&page={page}";
                        $total=$resultjson[0]['totalCount'];
                        $ooddata=$resultjson[1];
                        $pagelist= buildPage($total,pagesize(),$page, $pageurl);
                    }
                    else if($restatus==2){
                        $ooddata=[];
                        $pagelist="";
                    }
                    else if($restatus==0){
                        $ooddata=[];
                        $pagelist="";
                    }
           }
           else{
               $ooddata=[];
               $pagelist="";
           }
              //$pagelist= buildPage($rs_count,10);
              return view('system.Gameoodinfoset',compact('ooddata','pagelist'));
    }
   	/**
	 * 获得游戏赔率详细信息
	 */
   public function gameoodloadinfo(Request $request){
        $id=$request->id;
        $key=getmd5key();

        $data=[
            "id"=>$id,
            "sign"=>md5($id.$key)
        ];
        $host=hosturl();
        $url=$host."/SystemManage/getOddsByIdInfo";
        $resultjson=doCurlGetJsonReq($url,$data,30);
        $resultjson=json_decode($resultjson,True);
        try{
            $arrlength= count($resultjson) ;
        }catch (\Exception $e) {
            $arrlength=3;
        }
        if($arrlength!=3){
            $restatus=$resultjson[0]['status'];
            if($restatus==200){
            $data= $resultjson[1];
            return view('system.Gameoodinfo',compact('data'));
            }
        
        }else
        {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
            ];
            return  view("tips",compact('data'));      
        }

   }

   public function gameoodloadinfoupdate(Request $request){
    $id = $request->id;
    $both_sides= $request->both_sides;
    $host_win = $request->host_win;
    $drawn = $request->drawn;
    $guest_win = $request->guest_win;
    $host_goal =$request->host_goal;
    $zero = $request->zero;
    $guest_goal = $request->guest_goal;
    $key=getmd5key();
    if($both_sides==null || $id==null ||  !is_numeric($id) || $host_win==null  ||$drawn==null||$guest_win==null||$host_goal==null||$zero==null||$guest_goal==null)
    {
        $data=[
            'ico'=>'fa-warning',
            'msg'=>'参数错误'
          ];
        return  view("tips",compact('data'));
    }

     $getarray=[
        "id"=>$request->id,
        "both_sides" => $request->both_sides,
        "host_win"=>$request->host_win,
        "drawn"=>$request->drawn,
        "guest_win"=>$request->guest_win,
        "host_goal"=>$request->host_goal,
        "zero"=>$request->zero,
        "guest_goal"=>$request->guest_goal,
        "sign"=>md5($id.$key)
         ];
    $url=hosturl()."/SystemManage/updateOodInfo";
    $resultjson=doCurlGetJsonReq($url,$getarray,30);
    $resultjson=json_decode($resultjson,True);
    $restatus=$resultjson['status'];
   if( $restatus==200)
    {
    $data=[
        'ico'=>'fa-check',
        'msg'=>'赔率配置更新成功'
        ];
      return  view("tips",compact('data'));
     
    }
    else if($restatus==1){
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'赔率更新失败'
              ];
            return  view("tips",compact('data'));
    }
    else{
        $data=[
            'ico'=>'fa-warning',
            'msg'=>'参数错误'
          ];
        return  view("tips",compact('data'));
    }
}

public function gameoodinfoadd(Request $request){
    $both_sides = $request->both_sides;
    $host_win = $request->host_win;
    $drawn = $request->drawn;
    $guest_win = $request->guest_win;
    $host_goal =$request->host_goal;
    $zero = $request->zero;
    $guest_goal = $request->guest_goal;
    $key=getmd5key();
    if( $host_win==null  ||$drawn==null||$guest_win==null||$host_goal==null||$zero==null||$guest_goal==null || $both_sides==null)
    {
        $data=[
            'ico'=>'fa-warning',
            'msg'=>'参数错误'
          ];
        return  view("tips",compact('data'));
    }

     $getarray=[
        "both_sides" => $request->both_sides,
        "host_win"=>$request->host_win,
        "drawn"=>$request->drawn,
        "guest_win"=>$request->guest_win,
        "host_goal"=>$request->host_goal,
        "zero"=>$request->zero,
        "guest_goal"=>$request->guest_goal,
        "sign"=>md5('Addood'.$key)
         ];
    $url=hosturl()."/SystemManage/addOodInfo";
    $resultjson=doCurlGetJsonReq($url,$getarray,30);
    $resultjson=json_decode($resultjson,True);
    $restatus=$resultjson['status'];
   if( $restatus==200)
    {
    $data=[
        'ico'=>'fa-check',
        'msg'=>'赔率配置添加成功'
        ];
      return  view("tips",compact('data'));
     
    }
    else if($restatus==1){
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'赔率添加失败'
              ];
            return  view("tips",compact('data'));
    }
    else{
        $data=[
            'ico'=>'fa-warning',
            'msg'=>'参数错误'
          ];
        return  view("tips",compact('data'));
    }
}
public function gameoodinfodel(Request $request){
    $id = $request->id;
    $key=getmd5key();
    if( $id==null  && is_numeric($id))
    {
        $data=[
            'ico'=>'fa-warning',
            'msg'=>'参数错误'
          ];
        return  view("tips",compact('data'));
    }

     $getarray=[
        "id" => $request->id,
        "sign"=>md5($id.$key)
         ];
    $url=hosturl()."/SystemManage/delOddsById";
    $resultjson=doCurlGetJsonReq($url,$getarray,30);
    $resultjson=json_decode($resultjson,True);
    $restatus=$resultjson['status'];
   if( $restatus==200)
    {
    $data=[
        'errcode'=>0,
        'msg'=>'删除赔率配置成功'
        ];
        return  response()->json($data);
    //     return  view('tips',compact('data'));
     // return Redirect::to('/system/gameoodinfo');
    }
    else if($restatus==1){
            $data=[
                'errcode'=>1,
                'msg'=>'删除赔率配置失败'
              ];
              return  response()->json($data);
    }
    else{
        $data=[
            'errcode'=>2,
            'msg'=>'参数错误'
          ];
          return  response()->json($data);
    }
}

    public function gamegoalsinfo(Request $request){
        $key=getmd5key();
        $sign=md5('getGo'.$key); 
            $data=[
                "sign"=>$sign
              ];
              $host=hosturl();
              $url=$host."/SystemManage/getGoalInfo";
              $resultjson=doCurlGetJsonReq($url,$data,30);
              $resultjson=json_decode($resultjson,True);
              try{
                $arrlength= count($resultjson) ;
              }catch (\Exception $e) {
                $arrlength=3;
              }
              if($arrlength!=3){
                $rstatus=$resultjson[0]['status'];
                if($rstatus==200){
                    $goalsdata=$resultjson[1];
                  
                }
                else if($rstatus==2){
                    $goalsdata=[];
                }
                else if($rstatus==1){
                    $goalsdata=[];
                }
              }
              else{
                $goalsdata=[];
              }
       
              return view('system.Gamegoalset',compact('goalsdata'));
    }


    public function gamegoalsadd(Request $request){
        $all_goal_num = $request->all_goal_num;
        $chance = $request->chance;
        $key=getmd5key();
        if( $all_goal_num==null  || $chance==null)
        {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
              ];
            return  view("tips",compact('data'));
        }

         $getarray=[
            "all_goal_num"=>$request->all_goal_num,
            "chance"=>$request->chance,
            "sign"=>md5('Addgoals'.$key)
             ];
        $url=hosturl()."/SystemManage/addGoalsInfo";
        $resultjson=doCurlGetJsonReq($url,$getarray,30);
        $resultjson=json_decode($resultjson,True);
        $restatus=$resultjson['status'];
       if( $restatus==200)
        {
          return Redirect::to('/system/gamegoalsinfo');
        }
        else if($restatus==1){
                $data=[
                    'ico'=>'fa-warning',
                    'msg'=>'进球配置添加失败'
                  ];
                return  view("tips",compact('data'));
        }
        else{
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
              ];
            return  view("tips",compact('data'));
        }
    }

    public function gamegoalsupdate(Request $request){
        $key=getmd5key();
        $sign=md5('getGo'.$key); 
            $data=[
                "sign"=>$sign
              ];
              $host=hosturl();
              $url=$host."/SystemManage/getGoalInfo";
              $resultjson=doCurlGetJsonReq($url,$data,30);
              $resultjson=json_decode($resultjson,True);
              try{
                $arrlength= count($resultjson) ;
              }catch (\Exception $e) {
                $arrlength=3;
              }
              if($arrlength!=3){
                $rstatus=$resultjson[0]['status'];
                if($rstatus==200){
                    $goaldata=$resultjson[1];
                    $msg="";
                    $total= 0;
                    foreach($goaldata as $itemdata){
                        $total += intval(request('chance_'.$itemdata['all_goal_num']));
                        error_log('total'.$total);
                    }

                    if($total != 100){
                        $data=[
                            'ico'=>'fa-check',
                            'msg'=>'修改失败,总进球数概率之和不为100%',
                          ];
                        return  view("tips",compact('data'));
                    }
                   foreach($goaldata as $itemdata){
                        $postdata=[
                        "all_goal_num"=>$itemdata['all_goal_num'],
                        "chance"=>request('chance_'.$itemdata['all_goal_num']),
                        "sign"=>md5($itemdata['all_goal_num'].$key)
                        ];
                        $url=$host."/SystemManage/updateGoalInfo";
                        $resultjson=doCurlGetJsonReq($url,$postdata,30);
                        $resultjson=json_decode($resultjson,True);
                
                          $rstatus=$resultjson['status'];
                          if($rstatus!=200){
                             $msg=$msg."进球配置更新失败<br>";
                          }
    
                   }
    
                   if($msg!=""){
                    $data=[
                        'ico'=>'fa-warning',
                        'msg'=> $msg
                      ];
                    return  view("tips",compact('data'));
                   }
                   else{
                    $data=[
                        'ico'=>'fa-check',
                        'msg'=>'进球配置更新成功'
                      ];
                    return  view("tips",compact('data'));
                   }
                }
            }
    
       }

    public function gamegoalsinfodel(Request $request){
        $id = $request->id;
        $key=getmd5key();
        if( $id==null  && is_numeric($id))
        {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
              ];
            return  view("tips",compact('data'));
        }
    
         $getarray=[
            "id" => $request->id,
            "sign"=>md5($id.$key)
             ];
        $url=hosturl()."/SystemManage/delGoalById";
        $resultjson=doCurlGetJsonReq($url,$getarray,30);
        $resultjson=json_decode($resultjson,True);
        $restatus=$resultjson['status'];
       if( $restatus==200)
        {
        $data=[
            'errcode'=>0,
            'msg'=>'删除进球配置成功'
            ];
            return  response()->json($data);
        //     return  view('tips',compact('data'));
         // return Redirect::to('/system/gameoodinfo');
        }
        else if($restatus==1){
                $data=[
                    'errcode'=>1,
                    'msg'=>'删除删除配置失败'
                  ];
                  return  response()->json($data);
        }
        else{
            $data=[
                'errcode'=>2,
                'msg'=>'参数错误'
              ];
              return  response()->json($data);
        }

   }



       /**
	 * 获得竞猜足球的系统设置
	 */
    public function paramlist(Request $request){
        $key=getmd5key();
        $sign=md5('getReal'.$key); 
            $data=[
                "sign"=>$sign
              ];
              $host=hosturl();
              $url=$host."/SystemManage/getRealBetItem";
              $resultjson=doCurlGetJsonReq($url,$data,30);
              $resultjson=json_decode($resultjson,True);
              try{
                $arrlength= count($resultjson) ;
              }catch (\Exception $e) {
                $arrlength=3;
              }
              if($arrlength!=3){
                $rstatus=$resultjson[0]['status'];
                if($rstatus==200){
                    $paramdata=$resultjson[1];
                  
                }
                else if($rstatus==2){
                    $paramdata=[];
                }
                else if($rstatus==1){
                    $paramdata=[];
                }
              }
              else{
                $paramdata=[];
              }
       
             
              return view('system.Systemparamset',compact('paramdata'));
    }


    /**
	 * 获得竞猜足球的系统设置
	 */
    public function paramvirtual(Request $request){
        $key=getmd5key();
        $sign=md5('getvirtual'.$key); 
            $data=[
                "sign"=>$sign
              ];
              $host=hosturl();
              $url=$host."/SystemManage/getVirtualBetItem";
              $resultjson=doCurlGetJsonReq($url,$data,30);
              $resultjson=json_decode($resultjson,True);
              try{
                $arrlength= count($resultjson) ;
              }catch (\Exception $e) {
                $arrlength=3;
              }
              if($arrlength!=3){
                $rstatus=$resultjson[0]['status'];
                if($rstatus==200){
                    $paramdata=$resultjson[1];
                  
                }
                else if($rstatus==2){
                    $paramdata=[];
                }
                else if($rstatus==1){
                    $paramdata=[];
                }
              }
              else{
                $paramdata=[];
              }
       
             
              return view('system.Systemparamvirtual',compact('paramdata'));
    }

        /**
	 * 竞猜足球系统设置更新
	 */
   public function paramvirtualupdate(Request $request){
        $id=$request->id;
        $item1=$request->item1;
        $item2=$request->item2;
        $item3=$request->item3;

        if($id==null || $item1==null || $item2==null|| $item3==null)
        {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
            ];
            return  view("tips",compact('data'));
        }
        else{
            $type=1;
            $key=getmd5key();
            $sign=md5($type.$key.$id);
            $url=hosturl()."/SystemManage/updateBetItem";
            $getarray=[
                "type"=>$type,
                "id"=>$id,
                "item1"=> $item1,
                "item2"=>$item2,
                "item3"=>$item3,
                "sign"=>$sign
                ];
            $resultjson= doCurlGetJsonReq($url,$getarray,30);
            $rdata=json_decode($resultjson,True);
            if($rdata['status']==200){
                $data=[
                    'ico'=>'fa-check',
                    'msg'=>'系统设置更新成功'
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
	 * 竞猜足球系统设置更新
	 */
   public function paramrealupdate(Request $request)
   {
        $id=$request->id;
        $item1=$request->item1;
        $item2=$request->item2;
        $item3=$request->item3;
        $num_limit=$request->numlimit;
        $coin_limit=$request->coinlimit;

        if($id==null || $item1==null || $item2==null|| $item3==null|| $num_limit==null|| $coin_limit==null)
        {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
            ];
            return  view("tips",compact('data'));
        }
        else{
            $type=2;
            $key=getmd5key();
            $sign=md5($type.$key.$id);
            $url=hosturl()."/SystemManage/updateBetItem";
            $getarray=[
                "type"=>$type,
                "id"=>$id,
                "item1"=> $item1,
                "item2"=>$item2,
                "item3"=>$item3,
                "num_limit"=>$num_limit,
                "coin_limit"=>$coin_limit,
                "sign"=>$sign
                ];
            $resultjson= doCurlGetJsonReq($url,$getarray,30);
            $rdata=json_decode($resultjson,True);
            if($rdata['status']==200){
                $data=[
                    'ico'=>'fa-check',
                    'msg'=>'系统设置更新成功'
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
   
}
