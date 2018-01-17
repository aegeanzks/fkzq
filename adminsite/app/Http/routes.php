<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GamesetController;
use Illuminate\Http\Request;
/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::auth();

//Route::group(['middleware'=>['auth','authpermission']],function(){}); //组路由验证

Route::get('/', 'HomeController@index');
Route::get('404', function()
 {
     return view('404');
 });
Route::get('/profile',['middleware'=>['auth','authpermission'],function(){
    return view('profile');
}]);
Route::post('/editpwd',['uses'=>'UserController@editpwd','middleware'=>['auth','authpermission']]);
Route::get('/userlist',['uses'=>'UserController@index','middleware'=>['auth','authpermission']]);
Route::get('/recuserlist', ['uses'=>'UserController@recindex','middleware'=>['auth','authpermission']]);
Route::get('/user/getinfo/{userid}', ['uses'=>'UserController@loaduser','middleware'=>['auth','authpermission']]);
Route::get('/user/edit', ['uses'=>'UserController@edituser','middleware'=>['auth','authpermission']]);
Route::get('/user/active', ['uses'=>'UserController@activeuser','middleware'=>['auth','authpermission']]);
Route::get('/user/adduser',['middleware'=>['auth','authpermission'],function(){
    return view('system.Useradd');
}]);
Route::get('/user/add', ['uses'=>'UserController@adduser','middleware'=>['auth','authpermission']]);
Route::get('/user/del/{userid}', ['uses'=>'UserController@deluser','middleware'=>['auth','authpermission']])->where(['id'=>'[0-9]+']);



/**游戏设置路由 */
Route::get('/system/gamelist', ['uses'=>'GamesetController@gamelist','middleware'=>['auth','authpermission']]);
Route::get('/system/gamebaseset', ['uses'=>'GamesetController@gamebaseset','middleware'=>['auth','authpermission']]);
Route::get('/system/gameeventsetupdate',['uses'=>'GamesetController@gameeventsetupdate','middleware'=>['auth','authpermission']]);
Route::get('/system/gameoodinfo',['uses'=>'GamesetController@gameoodinfo','middleware'=>['auth','authpermission']]);
Route::get('/system/gamegoalsinfo',['uses'=>'GamesetController@gamegoalsinfo','middleware'=>['auth','authpermission']]);
Route::get('/system/gamegoalsadd',['uses'=>'GamesetController@gamegoalsadd','middleware'=>['auth','authpermission']]);
Route::get('/system/gamestockinfo/{gameid}',['uses'=>'GamesetController@gamestockinfo','middleware'=>['auth','authpermission']]);
Route::get('/system/gamestockinfoupdate',['uses'=>'GamesetController@gamestockinfoupdate','middleware'=>['auth','authpermission']]);
Route::get('/system/gameoodinfodel/{id}',['uses'=>'GamesetController@gameoodinfodel','middleware'=>['auth','authpermission']]);
Route::get('/system/gameoodloadinfo/{id}',['uses'=>'GamesetController@gameoodloadinfo','middleware'=>['auth','authpermission']]);
Route::get('/system/gameoodloadinfoupdate',['uses'=>'GamesetController@gameoodloadinfoupdate','middleware'=>['auth','authpermission']]);
Route::get('/system/addgameoodinfo/',['uses'=>'GamesetController@gameoodinfoadd','middleware'=>['auth','authpermission']]);
Route::get('/system/addoodinfo',['middleware'=>['auth','authpermission'],function(){
    return view('system.Gameaddoodinfo');
}]);
Route::get('/system/addgoalsinfo',['middleware'=>['auth','authpermission'],function(){
    return view('system.Gamegoalsadd');
}]);
/**游戏设置路由 */



/*竞彩足球管理 */
Route::get('/guess/competitionmanage',['uses'=>'GuessController@index','middleware'=>['auth','authpermission']]); 
Route::get('/guess/competitionrecords',['uses'=>'GuessController@records','middleware'=>['auth','authpermission']]);
// Route::get('/guess/competitionmanage',function(){
//     return view('guess.competitionmanage');
// });
Route::get('/guess/changeracetype',['uses'=>'GuessController@changeracetype','middleware'=>['auth','authpermission']]);
// Route::get('/guess/competitionrecords',function(){
//     return view('guess.competitionrecords');
// });
Route::get('/guess/competitionedit/{id}',['uses'=>'GuessController@loadedit','middleware'=>['auth','authpermission']])->where(['id'=>'[0-9]+']);  //过滤输入参数的类型
Route::get('/guess/competitionupdate',['uses'=>'GuessController@loadupdate','middleware'=>['auth','authpermission']]);
/*竞彩足球管理 */


/*虚拟竞彩足球管理 */
Route::get('/vfootball/matchlist',['uses'=>'VirtualFootballController@matchlist','middleware'=>['auth','authpermission']]);
Route::get('/vfootball/compeetitivrecord',['uses'=>'VirtualFootballController@crecordlist','middleware'=>['auth','authpermission']]);
/*虚拟竞彩足球管理 */


/*公告管理 */
Route::get('/Announcement/list',['uses'=>'AnnouncementController@index','middleware'=>['auth','authpermission']]);  ///['auth','authpermission']
Route::get('/Announcement/announceinfo/{a_id}',['uses'=>'AnnouncementController@announceinfo','middleware'=>['auth','authpermission']])->where(['id'=>'[0-9]+']);
Route::get('/Announcement/announceupdate',['uses'=>'AnnouncementController@announceupdate','middleware'=>['auth','authpermission']]);
Route::get('/Announcement/announceadd',['uses'=>'AnnouncementController@announceadd','middleware'=>['auth','authpermission']]);
Route::get('/Announcement/announcedel/{a_id}',['uses'=>'AnnouncementController@announcedel','middleware'=>['auth','authpermission']])->where(['id'=>'[0-9]+']);
Route::get('/Announcement/addannounce',['middleware'=>['auth','authpermission'],function(){
    $option='add';
    $showdata=[];
    return view('system.Announcementinfo',compact('option'),compact('showdata'));
}]);
/*公告管理 */

/*用户管理 */


Route::get('/Accounts/list',['uses'=>'AccountsController@accountlist','middleware'=>['auth','authpermission']]);
Route::get('/Accounts/freezeaccount',['uses'=>'AccountsController@freezeaccount','middleware'=>['auth','authpermission']]);
Route::get('/Accounts/slewrateupdate',['uses'=>'AccountsController@slewrateupdate','middleware'=>['auth','authpermission']]);
Route::get('/Accounts/slewrateedit/{user_id}/{invented_slew_rate}',['middleware'=>['auth','authpermission'],function($user_id,$invented_slew_rate){
  return view('accounts.accountslewrateedit')->with(["user_id"=>$user_id,"invented_slew_rate"=>$invented_slew_rate]); // ,compact('user_id',compact('invented_slew_rate')))
}]);

/*用户管理 */


/*用户操作管理 */
Route::get('/user/logout','UserController@userlogout');
/*用户操作管理 */


/*权限管理 */
Route::get('/Permissions/list',['uses'=>'PermissionController@plist','middleware'=>['auth','authpermission']]);
Route::get('/Permissions/addpermissionpage',['middleware'=>['auth','authpermission'],function(){
       return view('system.GPermissionadd');
}]);
Route::get('/Permissions/addpermission',['uses'=>'PermissionController@addpermission','middleware'=>['auth','authpermission']]);
Route::get('/Permissions/delpermission/{id}',['uses'=>'PermissionController@delpermission','middleware'=>['auth','authpermission']])->where(['id'=>'[0-9]+']);
/*权限管理 */
