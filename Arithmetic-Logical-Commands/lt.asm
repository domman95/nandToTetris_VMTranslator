@SP
AM=M-1
D=M
@SP
AM=M-1
D=M-D
@labelLTrue
D;JLT
@SP
A=M
M=0
@labelLTEnd
0;JMP
(labelLTrue)
@SP
A=M
M=-1
(labelLTEnd)
@SP
M=M+1