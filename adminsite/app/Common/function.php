<?php

use Illuminate\Http\Request;
use App\Http\Requests;
use App\User;
use Illuminate\Support\Str;
use Illuminate\Support\HtmlString;
use Illuminate\Container\Container;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Contracts\Auth\Access\Gate;
use Illuminate\Contracts\Routing\UrlGenerator;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Contracts\Auth\Factory as AuthFactory;
use Illuminate\Contracts\View\Factory as ViewFactory;
use Illuminate\Contracts\Cookie\Factory as CookieFactory;
use Illuminate\Database\Eloquent\Factory as EloquentFactory;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;



	/**
	 * @desc 封装curl的调用接口，post Json数据的请求方式
	 */

  function doCurlPostJsonReq($url, $data = array(), $timeout = 25){
		if($url == ""  || $timeout <= 0){
			return false;
        }
	    $con = curl_init((string)$url);
        curl_setopt($con,CURLOPT_HTTPAUTH,CURLAUTH_BASIC);  //设置http验证方法
        curl_setopt($con,CURLOPT_HEADER,0);  //设置头信息
        curl_setopt($con,CURLOPT_RETURNTRANSFER,true);  //设置curl_exec获取的信息的返回方式
        curl_setopt($con, CURLOPT_TIMEOUT, (int)$timeout);	
        curl_setopt($con,CURLOPT_POST,true);  //设置发送方式为post请求
        curl_setopt($con,CURLOPT_POSTFIELDS,http_build_query($data));  //设置post的数据
        $returndata = curl_exec($con);
       // $errno = curl_errno( $ch );  //获得错误码
       // $info  = curl_getinfo( $ch );  //获得提交请求的所有信息
       // $info['errno'] = $errno;
        curl_close($con);
        return $returndata;
    }




	/**
	 * @desc 封装curl的调用接口，post Json数据的请求方式
	 */

function doCurlGetJsonReq($url, $data = array(), $timeout = 25 ) {
    if($url == "" || $timeout <= 0){
        return false;
    }
    if($data != array()) {
        $url = $url . '?' . http_build_query($data);
    }
    //Log::write("发送URL[".$url."]");
    $con = curl_init((string)$url);
    curl_setopt($con, CURLOPT_HEADER, 0);
    curl_setopt($con, CURLOPT_RETURNTRANSFER,true);
    curl_setopt($con, CURLOPT_TIMEOUT, (int)$timeout);
    $returndata= curl_exec($con);
    //$errno = curl_errno( $ch );  //获得错误码
    //$info  = curl_getinfo( $ch );  //获得提交请求的所有信息
    // $info['errno'] = $errno;

    curl_close($con);
    return $returndata;
  }
  
    
/**
 * 签名验证KEY
 *  * @return string
 */
  function getmd5key(){
      return '4A1fd0cEskf';
  }
  /**
 * 获得提交的主站地址
 *  * @return string
 */
  function hosturl(){
      return "http://127.0.0.1:9090";
  }


  
/**
 * 分页处理
 * @param string $type 所在页面
 * @param int $total_count 记录总数
 * @param array  $args 参数
 * @param int $offset 偏移量
 * @return array
 */
function buildPage($total_count,$page_size = 0,$curpage,$pageurl){
	$page = new Page($total_count,$page_size,$curpage,$pageurl,2);   //初始化分页对象
    $pagehtml=  $page->myde_write();
	return $pagehtml;
}



