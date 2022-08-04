const myArgs = process.argv.slice(2);
const readline = require('readline');
const fs = require('fs');

const line_counter = (
    (i = 0) =>
    () =>
        ++i
)();

const lines = {};

const seg = {
    local: 'LCL',
    argument: 'ARG',
    this: 'THIS',
    that: 'THAT',
};

function readCode(fileName) {
    let parsedCode = '';
    const result = [];

    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
    });

    rl.on('line', (line) => {
        line = line.replace(/\s\s+/g, ' ');
        if (line.includes('//')) {
            line = line.substr(0, line.indexOf('/'));
        }
        if (line.length > 0) {
            line = line.trim();
            // line += '\n';
            // parsedCode += line;
            writeCode(line, result);
        }
    });

    rl.on('close', () => {
        writeHackFile(result);
    });
}

function writeCode(line, result) {
    const lineno = line_counter();
    const eachLine = line.split(' ');

    const command = eachLine[0];
    const name = eachLine[1];
    const i = eachLine[2];

    try {
        if (/^(add|sub|neg|eq|gt|lt|and|or|not)$/g.test(command)) {
            result.push(...writeArithmetic(command, lineno));
        }

        if (/^(push|pop)\W*/g.test(command)) {
            result.push(...writePushPop(command, name, i));
        }

        if (/^(label)\W*/g.test(command)) {
            result.push(...writeLabel(command, name));
        }

        if (/^(goto)\W*/g.test(command)) {
            result.push(...writeGoto(command, name));
        }

        if (/^(if-goto)\W*/g.test(command)) {
            result.push(...writeIfGoto(command, name));
        }

        if (/^(function)\W*/g.test(command)) {
            if (/\W*(Sys.init)\W*/g.test(name)) {
                result.push(...['@256', 'D=A', '@SP', 'M=D']);
                result.push(...writeCall(command, name, i, lineno));
            }

            result.push(...writeFunction(command, name, i));
        }

        if (/^(call)\W*/g.test(command)) {
            result.push(...writeCall(command, name, i, lineno));
        }

        if (/^(return)\W*/g.test(command)) {
            result.push(...writeReturn(command));
        }
    } catch {
        console.log(line);
        throw new Error(
            `Something is wrong with your code! at code line ${lineno}`,
        );
    }
}

function writeArithmetic(command, lineno) {
    // TODO: Arithmetic Code
    switch (command) {
        case 'add':
            return [
                `// add`,
                '@SP',
                'A=M-1',
                'D=M',
                '@R13',
                'M=D',
                '@SP',
                'M=M-1',
                '@SP',
                'A=M-1',
                'D=M',
                '@R13',
                'D=D+M',
                '@SP',
                'A=M-1',
                'M=D',
            ];
        case 'sub':
            return [
                `// sub`,
                '@SP',
                'A=M-1',
                'D=M',
                '@R13',
                'M=D',
                '@SP',
                'M=M-1',
                '@SP',
                'A=M-1',
                'D=M',
                '@R13',
                'D=D-M',
                '@SP',
                'A=M-1',
                'M=D',
            ];
        case 'neg':
            return [`// neq`, '@SP', 'AM=M-1', 'D=M', 'M=-D', '@SP', 'M=M+1'];
        case 'eq':
            return [
                `// eq`,
                '@SP',
                'AM=M-1',
                'D=M',
                '@SP',
                'AM=M-1',
                'D=D-M',
                `@JEQTRUE_${lineno}`,
                'D;JEQ',
                '@SP',
                'A=M',
                'M=0',
                `@JEQEND_${lineno}`,
                '0;JMP',
                `(JEQTRUE_${lineno})`,
                '@SP',
                'A=M',
                'M=-1',
                `(JEQEND_${lineno})`,
                '@SP',
                'M=M+1',
            ];
        case 'lt':
            return [
                `// lt`,
                '@SP',
                'A=M-1',
                'D=M',
                '@R13',
                'M=D',
                '@SP',
                'M=M-1',
                '@SP',
                'A=M-1',
                'D=M',
                '@R13',
                'D=D-M',
                `@labelLTTrue_${lineno}`,
                'D;JLT',
                '@SP',
                'A=M-1',
                'M=0',
                `@labelLTEnd_${lineno}`,
                '0;JMP',
                `(labelLTTrue_${lineno})`,
                '@SP',
                'A=M-1',
                'M=-1',
                `(labelLTEnd_${lineno})`,
            ];
        case 'gt':
            return [
                `// gt`,
                '@SP',
                'AM=M-1',
                'D=M',
                '@SP',
                'AM=M-1',
                'D=M-D',
                `@JGTRUE_${lineno}`,
                'D;JGT',
                '@SP',
                'A=M',
                'M=0',
                `@JGTEND_${lineno}`,
                '0;JMP',
                `(JGTRUE_${lineno})`,
                '@SP',
                'A=M',
                'M=-1',
                `(JGTEND_${lineno})`,
                '@SP',
                'M=M+1',
            ];
        case 'and':
            return [
                `// and`,
                '@SP',
                'AM=M-1',
                'D=M',
                '@SP',
                'AM=M-1',
                'D=D&M',
                'M=D',
                '@SP',
                'M=M+1',
            ];
        case 'or':
            return [
                `// or`,
                '@SP',
                'AM=M-1',
                'D=M',
                '@SP',
                'AM=M-1',
                'D=D|M',
                'M=D',
                '@SP',
                'M=M+1',
            ];
        case 'not':
            return [`// not`, '@SP', 'AM=M-1', 'D=M', 'M=!D', '@SP', 'M=M+1'];

        default:
            return;
    }
}

function writePushPop(command, name, i) {
    const fileNameWithoutPath = myArgs[0].replace(/^.*[\\\/]/, '');
    // TODO: Push and Pop Code
    if (/^(push)\W*/g.test(command)) {
        switch (name) {
            case 'constant':
                return [
                    `// push ${name} ${i}`,
                    `@${i}`,
                    'D=A',
                    '@SP',
                    'A=M',
                    'M=D',
                    '@SP',
                    'M=M+1',
                ];
            case 'local':
            case 'argument':
            case 'this':
            case 'that':
                return [
                    `// push ${name} ${i}`,
                    `@${seg[name]}`,
                    'D=M',
                    `@${i}`,
                    'A=D+A',
                    'D=M',
                    '@SP',
                    'A=M',
                    'M=D',
                    '@SP',
                    'M=M+1',
                ];
            case 'static':
                return [
                    `// push ${name} ${i}`,
                    `@${fileNameWithoutPath.substr(
                        0,
                        fileNameWithoutPath.indexOf('.') + 1,
                    )}${i}`,
                    'D=M',
                    '@SP',
                    'A=M',
                    'M=D',
                    '@SP',
                    'M=M+1',
                ];

            case 'temp':
                return [
                    `// push ${name} ${i}`,
                    '@5',
                    'D=A',
                    `@${i}`,
                    'D=A+D',
                    '@R13',
                    'M=D',
                    '@R13',
                    'A=M',
                    'D=M',
                    '@SP',
                    'A=M',
                    'M=D',
                    '@SP',
                    'M=M+1',
                ];

            case 'pointer':
                return [
                    `// push ${name} ${i}`,
                    '@3',
                    'D=A',
                    `@${i}`,
                    'D=A+D',
                    '@R13',
                    'M=D',
                    '@R13',
                    'A=M',
                    'D=M',
                    '@SP',
                    'A=M',
                    'M=D',
                    '@SP',
                    'M=M+1',
                ];

            default:
                return;
        }
    }

    if (/^(pop)\W*/g.test(command)) {
        switch (name) {
            case 'local':
            case 'argument':
            case 'this':
            case 'that':
                return [
                    `// pop ${name} ${i}`,
                    `@${seg[name]}`,
                    'D=M',
                    `@${i}`,
                    'D=D+A',
                    '@R13',
                    'M=D',
                    '@SP',
                    'A=M-1',
                    'D=M',
                    '@R13',
                    'A=M',
                    'M=D',
                    '@SP',
                    'M=M-1',
                ];

            case 'static':
                return [
                    `// pop ${name} ${i}`,
                    '@SP',
                    'A=M-1',
                    'D=M',
                    `@${fileNameWithoutPath.substr(
                        0,
                        fileNameWithoutPath.indexOf('.') + 1,
                    )}${i}`,
                    'M=D',
                    '@SP',
                    'M=M-1',
                ];

            case 'temp':
                return [
                    `// pop ${name} ${i}`,
                    '@5',
                    'D=A',
                    `@${i}`,
                    'D=D+A',
                    '@R13',
                    'M=D',
                    '@SP',
                    'A=M-1',
                    'D=M',
                    '@R13',
                    'A=M',
                    'M=D',
                    '@SP',
                    'M=M-1',
                ];

            case 'pointer':
                return [
                    `// pop ${name} ${i}`,
                    '@3',
                    'D=A',
                    `@${i}`,
                    'D=D+A',
                    '@R13',
                    'M=D',
                    '@SP',
                    'A=M-1',
                    'D=M',
                    '@R13',
                    'A=M',
                    'M=D',
                    '@SP',
                    'M=M-1',
                ];

            default:
                return;
        }
    }
}

function writeLabel(command, name) {
    // TODO: Label code
    return [`(${name})`];
}

function writeGoto(command, name) {
    // TODO: Goto code
    return [`@${name}`, '0;JMP'];
}

function writeIfGoto(command, name) {
    // TODO: If-Goto Code
    return ['@SP', 'AM=M-1', 'D=M', `@${name}`, 'D;JNE'];
}

function writeFunction(command, name, i) {
    // TODO: Function code
    const result = [];

    result.push(`(${name})`);

    for (let x = 0; x < i; x++) {
        result.push(...['@SP', 'A=M', 'M=0', '@SP', 'M=M+1']);
    }

    return result;
}

function writeCall(command, name, i, lineno) {
    // TODO: Call code
    const returnAddress = `${name}-ret-addr-${lineno}`;

    const pushReturnAddress = [
        `@${returnAddress}`,
        'D=A',
        '@SP',
        'A=M',
        'M=D',
        '@SP',
        'M=M+1',
    ];

    const pushLCL = ['@LCL', 'D=M', '@SP', 'A=M', 'M=D', '@SP', 'M=M+1'];

    const pushARG = ['@ARG', 'D=M', '@SP', 'A=M', 'M=D', '@SP', 'M=M+1'];

    const pushTHIS = ['@THIS', 'D=M', '@SP', 'A=M', 'M=D', '@SP', 'M=M+1'];

    const pushTHAT = ['@THAT', 'D=M', '@SP', 'A=M', 'M=D', '@SP', 'M=M+1'];

    const ARGisSPminusARGSn = [
        '@5',
        'D=A',
        `@${i}`,
        'D=D+A',
        '@SP',
        'D=M-D',
        '@ARG',
        'M=D',
    ];

    const LCLisSP = ['@SP', 'D=M', '@LCL', 'M=D'];

    const goToFunction = [`@${name}`, '0;JMP'];

    const markReturnAddress = `(${returnAddress})`;

    return [
        ...pushReturnAddress,
        ...pushLCL,
        ...pushARG,
        ...pushTHIS,
        ...pushTHAT,
        ...ARGisSPminusARGSn,
        ...LCLisSP,
        ...goToFunction,
        markReturnAddress,
    ];
}

function writeReturn(command) {
    // TODO: Return Code
    const endFrameIsLCL = ['@LCL', 'D=M', '@R13', 'M=D'];

    const retAddrIsPointerOfEndFrameMinusFive = [
        '@R13',
        'D=M',
        '@5',
        'A=D-A',
        'D=M',
        '@R14',
        'M=D',
    ];

    const pointerOfARGisPop = ['@SP', 'A=M-1', 'D=M', '@ARG', 'A=M', 'M=D'];

    const SPisARGplusOne = ['@ARG', 'D=M+1', '@SP', 'M=D'];

    const THATisPointerOfEndFrameMinusOne = [
        '@R13',
        'A=M-1',
        'D=M',
        '@THAT',
        'M=D',
    ];
    const THISisPointerOfEndFrameMinusTwo = [
        '@R13',
        'D=M',
        '@2',
        'A=D-A',
        'D=M',
        '@THIS',
        'M=D',
    ];
    const ARGisPointerOfEndFrameMinusThree = [
        '@R13',
        'D=M',
        '@3',
        'A=D-A',
        'D=M',
        '@ARG',
        'M=D',
    ];
    const LCLisPointerOfEndFrameMinusFour = [
        '@R13',
        'D=M',
        '@4',
        'A=D-A',
        'D=M',
        '@LCL',
        'M=D',
    ];

    const goToRetAddr = ['@R14', 'A=M', '0;JMP'];

    return [
        ...endFrameIsLCL,
        ...retAddrIsPointerOfEndFrameMinusFive,
        ...pointerOfARGisPop,
        ...SPisARGplusOne,
        ...THATisPointerOfEndFrameMinusOne,
        ...THISisPointerOfEndFrameMinusTwo,
        ...ARGisPointerOfEndFrameMinusThree,
        ...LCLisPointerOfEndFrameMinusFour,
        ...goToRetAddr,
    ];
}

function writeHackFile(array) {
    const fileName = myArgs[0];
    const outputFileName =
        fileName.substr(0, fileName.lastIndexOf('.')) + '.asm';
    const outputfile = array.join('\n');

    fs.writeFile(`${outputFileName}`, outputfile, (err) => {
        if (err) throw err;
    });
}

readCode(myArgs[0]);
