// For segments LOCAL, ARGUMENT, THIS, THAT works same
// addr = LCL + i, SP--, *addr = *SP
// POP LOCAL 2

@LCL
D=M
@2
D=A+D
@addr
M=D
@SP
M=M-1
@SP
A=M
D=M
@addr
A=M
M=D
