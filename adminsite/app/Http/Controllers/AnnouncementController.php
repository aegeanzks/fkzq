<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use App\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Response;

class AnnouncementController extends Controller
{
    //

    public function index(Request $request){
      $page=$request->page;
      $key=getmd5key();
      if($page==null){
          $page=1;
      }
             
      $data=[
        "page"=>$page==null?1:$page,
        "sign"=>md5('Announce'.$key.$page)
      ];
      $host=hosturl();
      $url=$host."/Announcement/list";
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
              "page"=>$page==null?1:$page,
               "sign"=>md5('Announce'.$key.$page)
            ];
            $postdata=[
               "sign"=>md5('Announce'.$key.$page)
             ];
          $pageurl='/Announcement/list?'. http_build_query($postdata)."&page={page}";
          $total=$resultjson[0]['totalCount'];
          $dataarray=$resultjson[1];
          $pagelist= buildPage($total,10,$page, $pageurl);
      }
      else if($restatus==2){
       $data=[
           "page"=>$page==null?1:$page
         ];
          $dataarray=[];
          $pagelist="";
      }
      else if($restatus==0){
       $data=[
           "page"=>$page==null?1:$page
         ];
          $dataarray=[];
          $pagelist="";
      }
   }
   else{
       $data=[
           "page"=>$page==null?1:$page

         ];
       $dataarray=[];
       $pagelist="";
   }
      //$pagelist= buildPage($rs_count,10);
      return view('system.Announcements',compact('data','dataarray','pagelist'));
  }

  public function announceinfo(Request $request){
    $a_id=$request->a_id;
    $key=getmd5key();
    if( $a_id!=null && is_numeric($a_id) ){
        $data=[
            "a_id"=>$a_id,
            "sign"=>md5('Announce'.$key)
          ];
          $host=hosturl();
          $url=$host."/Announcement/info";
          $resultjson=doCurlGetJsonReq($url,$data,30);
          $resultjson=json_decode($resultjson,True);
          try{
            $arrlength=count($resultjson) ;
          }catch (\Exception $e) {
            $arrlength=3;
          }
          if($arrlength==2){
            $restatus=$resultjson[0]['status'];
            if($restatus==200){
              $showdata=$resultjson[1][0];
              $option="edit";
              return view('system.Announcementinfo',compact('option','showdata'));
            }
            else {
              $showdata=[];
              $option="edit";
              return view('system.Announcementinfo',compact('option','showdata'));
            }
          }
          else
          {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数/签名错误'
              ];
            return  view("tips",compact('data'));
          }
    }
    else{
        $data=[
            'ico'=>'fa-warning',
            'msg'=>'参数错误'
          ];
        return  view("tips",compact('data'));
    }
           
 }
 public function announceupdate(Request $request)
    {    $key=getmd5key();
         $a_id=$request->a_id;
         $content=$request->content;
         $type=$request->content;
         $starttime=$request->starttime;
         $endtime=$request->endtime;
         if($a_id==null || !is_numeric($a_id) || $content==null || $type==null  || $starttime==null  ||$endtime==null )
         {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
              ];
            return  view("tips",compact('data'));
         }
      
      $data=[
            "a_id"=>$request->a_id,
            "content"=>$request->content,
            "type"=>$request->type,
            "starttime"=>$request->starttime,
            "endtime"=>$request->endtime,
            "sign"=>md5('Announce'.$key)
          ];
          $host=hosturl();
          $url=$host."/Announcement/updateinfo";
          $resultjson=doCurlGetJsonReq($url,$data,30);
          $resultjson=json_decode($resultjson,True);
          try{
            $arrlength=count($resultjson) ;
          }catch (\Exception $e) {
            $arrlength=3;
          }
          if($arrlength==3){
            $restatus=$resultjson['status'];
            if( $restatus==200)
            {
                $data=[
                    'ico'=>'fa-check',
                    'msg'=>'更新公告成功'
                    ];
                  return  view("tips",compact('data'));
            }
            else if($restatus==1){
                        $data=[
                            'ico'=>'fa-warning',
                            'msg'=>'添加公告失败'
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
      else{
        $data=[
            'ico'=>'fa-warning',
            'msg'=>'参数/签名错误'
          ];
          return  view("tips",compact('data'));
         }
    }
   
 public function announceadd(Request $request){
         $key=getmd5key();
         $content=$request->content;
         $type=$request->type;
         $starttime=$request->starttime;
         $endtime=$request->endtime;
         if($content==null || $type==null  || $starttime==null  ||$endtime==null )
         {
            $data=[
                'ico'=>'fa-warning',
                'msg'=>'参数错误'
              ];
            return  view("tips",compact('data'));
         }
      
        $data=[
            "content"=>$request->content,
            "type"=>$request->type,
            "starttime"=>$request->starttime,
            "endtime"=>$request->endtime,
            "sign"=>md5('Announce'.$key)
          ];
          $host=hosturl();
          $url=$host."/Announcement/addinfo";
          $resultjson=doCurlGetJsonReq($url,$data,30);
          $resultjson=json_decode($resultjson,True);
          try{
            $arrlength=count($resultjson) ;
          }catch (\Exception $e) {
            $arrlength=3;
          }
          if($arrlength==3){
            $restatus=$resultjson['status'];
            if( $restatus==200)
            {
                $data=[
                    'ico'=>'fa-check',
                    'msg'=>'添加公告成功'
                    ];
                  return  view("tips",compact('data'));
                 
                }
                else if($restatus==1){
                        $data=[
                            'ico'=>'fa-warning',
                            'msg'=>'添加公告失败'
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
      else{
        $data=[
            'ico'=>'fa-warning',
            'msg'=>'参数/签名错误'
          ];
        return  view("tips",compact('data'));
      }
  } 

  public function announcedel(Request $request){
    $key=getmd5key();
    $a_id=$request->a_id;
 
    if($a_id==null || !is_numeric($a_id))
    {
       $data=[
           'ico'=>'fa-warning',
           'msg'=>'参数错误'
         ];
       return  view("tips",compact('data'));
    }
 
   $data=[
       "a_id"=> $a_id,
       "sign"=>md5( $a_id.$key)
     ];
     $host=hosturl();
     $url=$host."/Announcement/delinfo";
     $resultjson=doCurlGetJsonReq($url,$data,30);
     $resultjson=json_decode($resultjson,True);
     try{
       $arrlength=count($resultjson) ;
     }catch (\Exception $e) {
       $arrlength=3;
     }
     if($arrlength==3){
       $restatus=$resultjson['status'];
       if( $restatus==200)
       {
        $data=[
          'errcode'=>0,
          'msg'=>'删除成功'
          ];
          return  response()->json($data);
            
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
 else{
   $data=[
       'ico'=>'fa-warning',
       'msg'=>'参数/签名错误'
     ];
   return  view("tips",compact('data'));
 }
} 
}