<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;  
class vpermission extends Model
{


        /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id', 'pgroupid', 'pname','purl'
    ];
  

        /**
     * 获得管理员权限列表
     *
     * @var groupid
     */
    public function GetPermissionList($groupid){
     $purllist= DB::table('vpermissions')->where('pgroupid','=',intval($groupid))->get();
     return $purllist;
    }
}
