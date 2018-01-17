<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\vpermission;
use App\Http\Requests;

class PermissionController extends Controller
{
    //
    public function plist(Request $request){
       $perPage =20; 
       $pgroupid=$request->pgroupid;

       if($pgroupid==null){
        $groupid='';
        $plist = vpermission::where('id','>',0)->orderBy('id', 'desc')->paginate($perPage);
       return view('system.GPermissionlist',compact('groupid') ,compact('plist'));
         }
       else{
        $groupid=$pgroupid;
        $plist = vpermission::where('pgroupid','=',$pgroupid)->orderBy('id', 'desc')->paginate($perPage);
        return view('system.GPermissionlist',compact('groupid'), compact('plist'));
       }
    }

    public function addpermission(Request $request){
           $pgroupid=$request->pgroupid;
           $pname=$request->pname;
           $purl=$request->purl;

           $permissioninfo=[
            'pgroupid'=>$pgroupid,
            'pname'=>$pname,
            'purl'=>$purl,
           ];
           if(vpermission::create($permissioninfo)->save()){
                 $data=[
                     'ico'=>'fa-check',
                     'msg'=>'添加访问权限成功'
                 ];
                 return  view("tips",compact('data'));
           }
           else
           {
             $data=[
               'ico'=>'fa-warning',
               'msg'=>'添加访问权限失败'
             ];
             return  view("tips",compact('data'));
           }

    }

    public function delpermission($id){
        if(vpermission::find($id)->delete()){
          $data=[
            'errcode'=>0,
            'msg'=>'访问权限删除成功'
          ];
          return  response()->json($data);
        }
        else{
          $data=[
            'errcode'=>-1,
            'msg'=>'访问权限删除失败'
          ];
          return  response()->json($data);
        }

     }
}
