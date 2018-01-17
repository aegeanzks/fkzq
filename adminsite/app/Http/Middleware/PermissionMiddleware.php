<?php

namespace App\Http\Middleware;
use App\vpermission;
use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Contracts\Routing\TerminableMiddleware;
class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    { 
        $ispermission=false;
        $currequesturl=strtolower( $request->getUri());
        $curuser_groupid=Auth::user()->groupid;
        if($curuser_groupid==2){     //超级管理员全开(测试用)
            return $next($request);
        }
      
        $permissionmodel=new \App\vpermission(); //实例化model
        $permissionurllist=$permissionmodel->GetPermissionList($curuser_groupid);
        $count= count($permissionurllist);
        foreach( $permissionurllist as $urlitem)
        {
            $url=strtolower($urlitem->purl);
           if(strpos(strtolower($currequesturl), $url)){
             $ispermission=true;
             break;
           }
        }
        if(!$ispermission){
          
            return response('Permission Denied.', 401);
        }
        
        return $next($request);
    }
}
