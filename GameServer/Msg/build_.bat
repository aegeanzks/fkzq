 @echo off


::Э���ļ�·��, ���Ҫ����\������
set SOURCE_FOLDER=D:\study\zqjc\GameServer\Msg\ProtoFile
::����ļ��������˱��proto�ļ���IMP_FOLDER�����õ�proto�ļ���Ŀ¼
set IMP_FOLDER=D:\study\zqjc\GameServer\Msg\ProtoFile
::Js������·��
set JS_COMPILER_PATH=D:\study\zqjc\GameServer\Msg\protoc.exe
::Js�ļ�����·��, ���Ҫ����\������
set JS_TARGET_PATH=D:\study\zqjc\GameServer\Msg\MsgFile


::ɾ��֮ǰ�������ļ�
del %JS_TARGET_PATH%\*.* /f /s /q


::���������ļ�
for /f "delims=" %%i in ('dir /b "%SOURCE_FOLDER%\*.proto"') do (
    
    echo %JS_COMPILER_PATH% -I=%SOURCE_FOLDER%  --js_out=%JS_TARGET_PATH% %SOURCE_FOLDER%\%%i
    %JS_COMPILER_PATH% --proto_path=%IMP_FOLDER%  --js_out=%JS_TARGET_PATH% %SOURCE_FOLDER%\%%i
    
)


echo Э��������ϡ�


pause