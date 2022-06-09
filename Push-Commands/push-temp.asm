// addr = 5 + i, *SP = *addr, SP++
// PUSH TEMP 2

@5
D=A
@2 // i = 2
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
