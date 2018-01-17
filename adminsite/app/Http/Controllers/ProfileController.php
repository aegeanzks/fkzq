<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use App\Group;

class ProfileController extends Controller
{
    //
    public  function index()
    {
        if (Auth::check())
        {
            $userid= Auth::user()->id;
            $Groupinfo= Group::where('userid',$userid)->get();
             
        }
    }
}
