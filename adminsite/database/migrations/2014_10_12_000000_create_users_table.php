<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Schema::create('users', function (Blueprint $table) {
        //     $table->increments('id');
        //     $table->string('name');
        //     $table->string('email')->unique();
        //     $table->string('password');
        //     $table->integer('groupid')->default(1) ;
        //     $table->rememberToken();
        //     $table->timestamps();
        // });

    //  Schema::table('users',function($table){
    //     $table->integer('isdelete')->default(0);  
    //     $table->string('realname');  
    //     $table->string('mobile');
    //     $table->string('loginip');
    //  });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
       //Schema::drop('users');
    }
}
