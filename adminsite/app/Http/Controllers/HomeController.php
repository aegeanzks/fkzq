<?php

namespace App\Http\Controllers;
use App\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $ip = $_SERVER["REMOTE_ADDR"];
        //return view('home');
        $isdel= Auth::user()->isdelete;
        if ($isdel == 0) {
            $nuserinfo = [
                'loginip' => $ip,
            ];
            User::where('id', Auth::user()->id)->update($nuserinfo);
            return view('home');
        }
        else{
          return  Redirect::To('/logout');
        }
    }
}
