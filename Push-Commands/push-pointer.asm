// *SP = THIS/THAT, *SP++
// POP POINTER 0/1

@3
D=A
@0
D=A+D
@pointer
M=D
@pointer
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1