Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
folder = files.GetParentFolderName(WScript.ScriptFullName)
runtime = shell.ExpandEnvironmentStrings("%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
If Not files.FileExists(runtime) Then runtime = "node.exe"
shell.Run Chr(34) & runtime & Chr(34) & " " & Chr(34) & folder & "\desktop-launch.cjs" & Chr(34), 0, False
