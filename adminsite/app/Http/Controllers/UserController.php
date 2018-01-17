<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class UserController extends Controller
{
    //
    public function editpwd(Request $request){
    
       $opwd= $request->opwdtxt;  
       $npwd=  $request->npwdtxt;  
       $userid= Auth::user()->id;
       $UserInfo = User::where("id",$userid);
       if($UserInfo!=null){
         $getpwd=$UserInfo->password;
         if( $getpwd == bcrypt($opwd)){
            $nuserinfo=[
            'password' => bcrypt($npwd),
            ];
            if($UserInfo->update($nuserinfo)){
                  $data=[
                      'ico'=>'fa-check',
                      'msg'=>'修改密码成功'
                  ];
            }
            else{
                  $data=[
                      'ico'=>'fa-warning',
                      'msg'=>'修改密码失败'
                  ];
                }
           }
       else{
            $data=[
              'ico'=>'fa-warning',
              'msg'=>'旧密码输入错误'
            ];
          }
        }
        else{
          $data=[
            'ico'=>'fa-warning',
            'msg'=>'账户登录超时'
          ];
        }
        return  view("tips",compact('data'));
    }

      public function index(Request $requests){
        $perPage =20; 
        $userlist = User::where('isdelete','=','0')->where(function($query) use($requests) {  
                          if (!empty($requests['name'])) {  
                              $query ->where('name', 'like', '%' .$requests['name'] . '%');
                          } 
                           if (!empty($requests['realname'])) {  
                              $query->where('realname', 'like', '%' .$requests['realname'] . '%');  
                          } 
                           if (!empty($requests['mobile'])) {  
                              $query->where('mobile', 'like', '%' .$requests['mobile'] . '%');  
                          }
                          if (!empty($requests['groupid'])) {  
                            $query->where('groupid', '=',$requests['groupid']);  
                          }
                        })
                        ->orderBy('created_at', 'desc')
                        ->paginate($perPage);
               
    // // //追加额外参数，例如搜索条件
    // $appendData = $userlist->appends(array(
    //     'search' => $search,
    //     'customer_type' => $customer_type,
    //     'perPage' => $perPage,
    // ));
       return view('system.Userlist', compact('userlist'));
     }


     public function recindex(Request $requests){
      $perPage =20; 
      $userlist = User::where("isdelete",'=',1)
                        ->where(function($query) use($requests) {  
                        if (!empty($requests['name'])) {  
                            $query ->where('name', 'like', '%' .$requests['name'] . '%');
                        } 
                         if (!empty($requests['realname'])) {  
                            $query->where('realname', 'like', '%' .$requests['realname'] . '%');  
                        } 
                         if (!empty($requests['mobile'])) {  
                            $query->where('mobile', 'like', '%' .$requests['mobile'] . '%');  
                        }
                        if (!empty($requests['groupid'])) {  
                          $query->where('groupid', '=',$requests['groupid']);  
                        }
                      })
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);
             
     return view('system.RecUserlist', compact('userlist'));
   }


     public function loaduser($userid){
        $user= User::find($userid);
        if($user!=null){
          return view("system.Userload",[
            'id'=>$user->id,
            'name'=>$user->name,
            'realname'=>$user->realname,
            'mobile'=>$user->mobile,
            'groupid'=>$user->groupid 
          ]);
        }
        else{
          $data=[
            'ico'=>'fa-warning',
            'msg'=>'不存在用户'
          ];
          return  view("tips",compact('data'));
        }
     }

     public function edituser(Request $requests){
      $nuserinfo=[
         'realname'=>$requests->realname,
         'mobile'=> $requests->mobile,
         'groupid'=> $requests->groupid
        ];
        if(User::where('id',$requests->userid)->update($nuserinfo)){
              $data=[
                  'ico'=>'fa-check',
                  'msg'=>'修改信息成功'
              ];
              return  view("tips",compact('data'));
        }
        else
        {
          $data=[
            'ico'=>'fa-warning',
            'msg'=>'修改信息失败'
          ];
          return  view("tips",compact('data'));
        }
     }

     
     public function adduser(Request $requests){
      $nuserinfo=[
         'name'=> $requests->name,
         'email'=>$requests->email,
         'password'=>bcrypt($requests->password),
         'realname'=>$requests->realname,
         'mobile'=> $requests->mobile,
         'groupid'=> $requests->groupid
        ];
        if(User::create($nuserinfo)->save()){
              $data=[
                  'ico'=>'fa-check',
                  'msg'=>'添加管理员成功'
              ];
              return  view("tips",compact('data'));
        }
        else
        {
          $data=[
            'ico'=>'fa-warning',
            'msg'=>'添加管理员失败'
          ];
          return  view("tips",compact('data'));
        }
     }

     public function deluser($userid){
      $info=[
        'isdelete'=>1,
       ];
        if(User::where('id',$userid)->update($info)){
          $data=[
            'errcode'=>0,
            'msg'=>'用户已经转移到回收站'
          ];
          return  response()->json($data);
        }
        else{
          $data=[
            'errcode'=>-1,
            'msg'=>'用户删除失败'
          ];
          return  response()->json($data);
        }

     }


     public function activeuser($userid){
      $info=[
        'isdelete'=>0,
       ];
        if(User::where('id',$userid)->update($info)){
          $data=[
            'errcode'=>0,
            'msg'=>'管理员已经激活'
          ];
          return  response()->json($data);
        }
        else{
          $data=[
            'errcode'=>-1,
            'msg'=>'管理员激活失败'
          ];
          return  response()->json($data);
        }

     }


     public function userlogout(Request $request){
     
        $request->session()-forget('user');
        if( !$request->session()->has('user')){ 
          Redirect::to('/user/logout');
      }
    }
      

      public function userlogin(Request $request){
           $name= $request->name;
           $password-$request->password;
       
           $data=[
            "name"=> $name,
            "password"=>$password
             ];
        $url=hosturl(). "/Auth/login";
        $resultjson=doCurlGetJsonReq($url,$getarray,30);
        $resultjson=json_decode($resultjson,True);
        try{
            $arrlength= count($resultjson) ;
          }catch (\Exception $e) {
            $arrlength=3;
          }
        if($arrlength==2)
         {
          if($resultjson[0]['status']==200){
            $userdata=$resultjson[1];
            $request->session()->push("user",$userdata);
            $backdata=[
              "errcode"=> 200,
              "msg"=>'登录成功'
               ];
             return  response()->json($backdata);
          }
          else{
            $backdata=[
              "errcode"=> -1,
              "msg"=>'账号名或密码错误'
               ];
             return  response()->json($backdata);
          }
         }
         else{
          $backdata=[
            "errcode"=> -1,
            "msg"=>'账号名或密码错误'
             ];
           return  response()->json($backdata);
         }
       }
    
}