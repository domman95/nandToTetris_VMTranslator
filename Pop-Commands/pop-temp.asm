// addr = 5 + i, SP--, *addr = *SP
// POP TEMP 2

@5
D=M
@2 // i = 2
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
