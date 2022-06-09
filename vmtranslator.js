const myArgs = process.argv.slice(2);
const readline = require('readline');
const fs = require('fs');

const line_counter = (
    (i = 0) =>
    () =>
        ++i
)();

const seg = {
    local: 'LCL',
    argument: 'ARG',
    this: 'THIS',
    that: 'THAT',
};

const increment = ['@SP', 'M=M+1'];
const decrement = ['@SP', 'M=M-1'];

function readCode(fileName) {
    const fileNameWithoutPath = fileName.replace(/^.*[\\\/]/, '');
    const result = [];

    const rl = readline.createInterface({
        input: fs.createReadStream(fileName),
    });

    rl.on('line', (line) => {
        line = line.replace(/\s+/g, '');

        if (line.indexOf('/') > -1) {
            line = line.substr(0, line.indexOf('/'));
        }

        if (line.length > 0) {
            writeCode(line);
        }
    });
    function writeCode(line) {
        const lineno = line_counter();
        if (/^(add|sub|neg|eq|gt|lt|and|or|not)$/g.test(line)) {
            // TODO: Arithmetic-Logical Commands
            switch (line) {
                case 'add':
                    result.push(
                        ...[
                            '@SP',
                            'AM=M-1',
                            'D=M',
                            '@SP',
                            'AM=M-1',
                            'D=D+M',
                            'M=D',
                            ...increment,
                        ],
                    );
                    return;
                case 'sub':
                    result.push(
                        ...[
                            '@SP',
                            'AM=M-1',
                            'D=M',
                            '@SP',
                            'AM=M-1',
                            'D=M-D',
                            'M=D',
                            ...increment,
                        ],
                    );
                    return;
                case 'neg':
                    result.push(
                        ...['@SP', 'AM=M-1', 'D=M', 'M=-D', ...increment],
                    );
                    return;
                case 'eq':
                    result.push(
                        ...[
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
                            ...increment,
                        ],
                    );
                    return;
                case 'lt':
                    result.push(
                        ...[
                            '@SP',
                            'AM=M-1',
                            'D=M',
                            '@SP',
                            'AM=M-1',
                            'D=M-D',
                            `@JLTRUE_${lineno}`,
                            'D;JLT',
                            '@SP',
                            'A=M',
                            'M=0',
                            `@JLTEND_${lineno}`,
                            '0;JMP',
                            `(JLTRUE_${lineno})`,
                            '@SP',
                            'A=M',
                            'M=-1',
                            `(JLTEND_${lineno})`,
                            ...increment,
                        ],
                    );
                    return;
                case 'gt':
                    result.push(
                        ...[
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
                            ...increment,
                        ],
                    );
                    return;
                case 'and':
                    result.push(
                        ...[
                            '@SP',
                            'AM=M-1',
                            'D=M',
                            '@SP',
                            'AM=M-1',
                            'D=D&M',
                            'M=D',
                            ...increment,
                        ],
                    );
                    return;
                case 'or':
                    result.push(
                        ...[
                            '@SP',
                            'AM=M-1',
                            'D=M',
                            '@SP',
                            'AM=M-1',
                            'D=D|M',
                            'M=D',
                            ...increment,
                        ],
                    );
                    return;
                case 'not':
                    result.push(
                        ...['@SP', 'AM=M-1', 'D=M', 'M=!D', '@SP', 'M=M+1'],
                    );
                    return;

                default:
                    return;
            }
        }

        if (/\W*(push|pop)\W*/g.test(line)) {
            const i = line.match(/\d+/g)[0];
            const type = line.match(/\W*(push|pop)\W*/g)[0];
            const segment = line.substring(type.length, line.indexOf(i));
            switch (type) {
                case 'push':
                    writePushCommand(segment, i);
                    return;
                case 'pop':
                    writePopCommand(segment, i);
                    return;
                default:
                    return;
            }
        }
    }
    function writePushCommand(segment, i) {
        //TODO: Push Command Implementation
        // SEGMENT: constant, local, argument, this, that, static, temp, pointer,
        switch (segment) {
            case 'constant':
                result.push(
                    ...[`@${i}`, 'D=A', '@SP', 'A=M', 'M=D', '@SP', 'M=M+1'],
                );
                return;
            case 'local':
            case 'argument':
            case 'this':
            case 'that':
                result.push(
                    ...[
                        `@${seg[segment]}`,
                        'D=M',
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
                        ...increment,
                    ],
                );
                return;
            case 'static':
                result.push(
                    ...[
                        `@${fileNameWithoutPath.substr(
                            0,
                            fileNameWithoutPath.indexOf('.') + 1,
                        )}${i}`,
                        'D=M',
                        '@SP',
                        'A=M',
                        'M=D',
                        ...increment,
                    ],
                );
                return;
            case 'temp':
                result.push(
                    ...[
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
                        ...increment,
                    ],
                );
                return;
            case 'pointer':
                result.push(
                    ...[
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
                        ...increment,
                    ],
                );
                return;
            default:
                return;
        }
    }

    function writePopCommand(segment, i) {
        //TODO: Pop Command Implementation
        //local, argument, this, that, static, temp, pointer,
        switch (segment) {
            case 'local':
            case 'argument':
            case 'this':
            case 'that':
                result.push(
                    ...[
                        `@${seg[segment]}`,
                        'D=M',
                        `@${i}`,
                        'D=A+D',
                        '@R13',
                        'M=D',
                        ...decrement,
                        '@SP',
                        'A=M',
                        'D=M',
                        '@R13',
                        'A=M',
                        'M=D',
                    ],
                );
                return;
            case 'static':
                result.push(
                    ...[
                        ...decrement,
                        '@SP',
                        'A=M',
                        'D=M',
                        `@${fileNameWithoutPath.substr(
                            0,
                            fileNameWithoutPath.indexOf('.') + 1,
                        )}${i}`,
                        'M=D',
                    ],
                );
                return;
            case 'temp':
                result.push(
                    ...[
                        '@5',
                        'D=A',
                        `@${i}`,
                        'D=A+D',
                        '@R13',
                        'M=D',
                        ...decrement,
                        '@SP',
                        'A=M',
                        'D=M',
                        '@R13',
                        'A=M',
                        'M=D',
                    ],
                );
                return;
            case 'pointer':
                result.push(
                    ...[
                        ...decrement,
                        '@3',
                        'D=A',
                        `@${i}`,
                        'D=A+D',
                        '@R13',
                        'M=D',
                        '@SP',
                        'A=M',
                        'D=M',
                        '@R13',
                        'A=M',
                        'M=D',
                    ],
                );
                return;
            default:
                return;
        }
    }

    rl.on('close', () => {
        writeHackFile(result);
    });
}

function writeHackFile(array) {
    const outputFileName = myArgs[0].substr(0, myArgs[0].indexOf('.')) + '.asm';
    const outputfile = array.join('\n');

    fs.writeFile(`${outputFileName}`, outputfile, (err) => {
        if (err) throw err;
    });
}

readCode(myArgs[0]);
