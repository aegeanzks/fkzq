<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class AccountsController extends Controller
{
  public function accountlist(Request $request)
  {
        $user_name=$request->user_name;
        $page=$request->page;
        $key=getmd5key();
        if($page==null){
            $page=1;
          }
        $sign=md5("Accounts".$key.$page);
    
        $data=[
            "user_name"=>$user_name==null?"":$user_name,
            "page"=>$page==null?1:$page,
            "sign"=>$sign
          ];
          $host=hosturl();
          $url=$host."/Accounts/list";
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
                  "user_name"=>$user_name==null?"":$user_name,
                  "page"=>$page==null?"":$page,
                ];
                $postdata=[
                  "user_name"=>$user_name==null?"":$user_name,
                  "page"=>$page==null?"":$page,
                  "sign"=>$sign
                  ];
              $pageurl='/Accounts/list?'. http_build_query($postdata)."&page={page}";
              $total=$resultjson[0]['totalCount'];
              $dataarray=$resultjson[1];
              $pagelist= buildPage($total,10,$page, $pageurl);
          }
          else if($restatus==2){
            $data=[
              "user_name"=>$user_name==null?"":$user_name,
              "page"=>$page==null?1:$page,

              ];
              $dataarray=[];
              $pagelist="";
          }
          else if($restatus==0){
            $data=[
              "user_name"=>$user_name==null?"":$user_name,
              "page"=>$page==null?1:$page,
              ];
              $dataarray=[];
              $pagelist="";
          }
      }
      else{
          $data=[
            "user_name"=>$user_name==null?"":$user_name,
            "page"=>$page==null?1:$page,

            ];
          $dataarray=[];
          $pagelist="";
      }
         return view('accounts.accountlist',compact('data','dataarray','pagelist'));  
 }

/**
	 * 更新竞彩足球属性值状态
	 */
  public function freezeaccount(Request $request){
           $userid=$request->userid;
           $status=$request->status;
           $key=getmd5key();
           if( $userid==null ||$status==null){
            $data=[
                'errcode'=>2,
                'msg'=>'参数错误'
              ];
           return  Response()->json($data);
           }

            $sign=md5("Account".$key);
            $host=hosturl();
            $url=$host."/Accounts/accountfreeze";
            $getdata=[
                "sign"=>$sign,
                "userid"=>$userid,
                "status"=>$status
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

  public function slewrateupdate(Request $request){
    $user_id=$request->user_id;
    $invented_slew_rate=$request->invented_slew_rate;
    $key=getmd5key();
    if($user_id==null || $invented_slew_rate==null)
    {
        $data=[
            'ico'=>'fa-warning',
            'msg'=>'参数错误'
          ];
        return  view("tips",compact('data'));
    }
    else{
        $url=hosturl(). "/Accounts/slewrateupdate";
        $sign=md5('Account'.$key);
        $getarray=[
            "user_id"=>$user_id,
            "invented_slew_rate"=>$invented_slew_rate,
            "sign"=> $sign
             ];
        $resultjson=doCurlGetJsonReq($url,$getarray,30);
        $resultjson=json_decode($resultjson,True);
        try{
            $arrlength= count($resultjson) ;
          }catch (\Exception $e) {
            $arrlength=3;
          }
        if($arrlength==3)
         {
            $restatus=$resultjson['status'];
            if($restatus==200){
              $data=[
                'ico'=>'fa-check',
                'msg'=>'更新杀率成功'
            ];
            return  view("tips",compact('data'));
            }
            else if($restatus==1)
            {
                $data=[
                    'ico'=>'fa-warning',
                    'msg'=>'更新杀率失败'
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

 }