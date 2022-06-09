// For segments LOCAL, ARGUMENT, THIS, THAT works same
// addr = LCL + i, *SP = *addr, SP++
// PUSH LOCAL 2

@LCL
D=M
@2
D=A+D
@R13
M=D
@R13
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1
