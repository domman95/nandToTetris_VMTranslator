@SP
AM=M-1
D=M
@SP
AM=M-1
D=M-D
@labelGTrue
D;JGT
@SP
A=M
M=0
@labelGTEnd
0;JMP
(labelGTrue)
@SP
A=M
M=-1
(labelGTEnd)
@SP
M=M+1