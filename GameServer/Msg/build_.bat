 @echo off


::协议文件路径, 最后不要跟“\”符号
set SOURCE_FOLDER=D:\study\zqjc\GameServer\Msg\ProtoFile
::如果文件中引用了别的proto文件，IMP_FOLDER是引用的proto文件的目录
set IMP_FOLDER=D:\study\zqjc\GameServer\Msg\ProtoFile
::Js编译器路径
set JS_COMPILER_PATH=D:\study\zqjc\GameServer\Msg\protoc.exe
::Js文件生成路径, 最后不要跟“\”符号
set JS_TARGET_PATH=D:\study\zqjc\GameServer\Msg\MsgFile


::删除之前创建的文件
del %JS_TARGET_PATH%\*.* /f /s /q


::遍历所有文件
for /f "delims=" %%i in ('dir /b "%SOURCE_FOLDER%\*.proto"') do (
    
    echo %JS_COMPILER_PATH% -I=%SOURCE_FOLDER%  --js_out=%JS_TARGET_PATH% %SOURCE_FOLDER%\%%i
    %JS_COMPILER_PATH% --proto_path=%IMP_FOLDER%  --js_out=%JS_TARGET_PATH% %SOURCE_FOLDER%\%%i
    
)


echo 协议生成完毕。


pause