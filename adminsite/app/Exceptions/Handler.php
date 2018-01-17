<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Redirect;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        AuthorizationException::class,
        HttpException::class,
        ModelNotFoundException::class,
        ValidationException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $e
     * @return void
     */
    public function report(Exception $e)
    {
        parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $e
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $e)
    { 

        if ($this->isHttpException($e))
        {
            return  Redirect::to('404');
        }

         //if($e instanceof NotFoundHttpException){
        
                // if($request->ajax()){
        
                //     return response()->json(['ret'=>'ERROR','message'=>'Model Not Found'],404);
        
                // }
           //     return response()->view('404');
        
          //  }
        
        //     if($e instanceof TokenMismatchException){
        
        //         if($request->ajax()){
        
        //             return response()->json(['ret'=>'ERROR','message'=>'Token Mismatch'],400);
        
        //         }
        
        //         //Flash::error('表单重复提交，请刷新页面再试！');
        
        //         return Redirect::back()->withInput()->withErrors('表单重复提交，请刷新页面再试！');
        
        //     }
        
        return parent::render($request, $e);
    }
}
