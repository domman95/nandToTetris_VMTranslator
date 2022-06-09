// *SP--, THIS/THAT = *SP
// POP POINTER 0/1

@SP
M=M-1
@3
D=A
@0 // 0 = THIS, 1 = THAT
D=A+D
@pointer
M=D
@SP
A=M
D=M
@pointer
A=M
M=D