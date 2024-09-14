export var TokenType;
(function (TokenType) {
    TokenType[TokenType["Keyword"] = 0] = "Keyword";
    TokenType[TokenType["Identifier"] = 1] = "Identifier";
    TokenType[TokenType["NumberLiteral"] = 2] = "NumberLiteral";
    TokenType[TokenType["StringLiteral"] = 3] = "StringLiteral";
    TokenType[TokenType["Operator"] = 4] = "Operator";
    TokenType[TokenType["Punctuation"] = 5] = "Punctuation";
    TokenType[TokenType["EOF"] = 6] = "EOF";
    TokenType[TokenType["FunctionName"] = 7] = "FunctionName";
    TokenType[TokenType["FunctionParams"] = 8] = "FunctionParams";
    TokenType[TokenType["FunctionBody"] = 9] = "FunctionBody";
    TokenType[TokenType["FunctionCall"] = 10] = "FunctionCall";
    TokenType[TokenType["Console"] = 11] = "Console";
    TokenType[TokenType["SingleLineComment"] = 12] = "SingleLineComment";
    TokenType[TokenType["MultiLineComment"] = 13] = "MultiLineComment";
})(TokenType || (TokenType = {}));
// Reserved keywords (Chinese -> JS keywords)
export const keywords = {
    让: "let",
    变量: "var",
    常量: "const",
    函数: "function",
    返回: "return",
    为: "for",
    为每个: "forEach",
    当: "while",
    做: "do",
    如果: "if",
    否则如果: "else if",
    否则: "else",
    抛出: "throw",
    尝试: "try",
    捕获: "catch",
    最终: "finally",
    新建: "new",
    实例: "instanceof",
    类型: "typeof",
    真: "true",
    假: "false",
    空: "null",
    未定义: "undefined",
    导出: "export",
    导入: "import",
    // Console methods
    // 控制台: "console",
    // 打印: "log",
    // 错误: "error",
    // 警告: "warn",
    // 清除: "clear",
    // 断言: "assert",
    // 计时: "time",
    // 计时结束: "timeEnd",
    // 组: "group",
    // 组结束: "groupEnd",
    // 跟踪: "trace",
};
// Define operators and punctuation
export const operators = [
    "+",
    "-",
    "*",
    "/",
    "=",
    "==",
    "!=",
    "<",
    ">",
    "&&",
    "||",
    "!",
];
export const punctuation = ["(", ")", "{", "}", "[", "]", ";", ",", "."];
// Updated Lexer class
export class Lexer {
    constructor(source) {
        this.current = 0;
        this.source = source;
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
    advance() {
        return this.source[this.current++];
    }
    peek() {
        return this.isAtEnd() ? "" : this.source[this.current];
    }
    isDigit(char) {
        return /\d/.test(char);
    }
    isAlpha(char) {
        return /[\u4e00-\u9fa5a-zA-Z_]/.test(char); // Support Chinese characters and Latin
    }
    isAlphaNumeric(char) {
        return this.isAlpha(char) || this.isDigit(char);
    }
    skipWhitespace() {
        while (!this.isAtEnd() && /\s/.test(this.peek())) {
            this.advance();
        }
    }
    number() {
        let value = "";
        while (this.isDigit(this.peek())) {
            value += this.advance();
        }
        return { type: TokenType.NumberLiteral, value };
    }
    string() {
        let value = "";
        const quoteType = this.advance(); // Get the opening quote
        value += quoteType; // Include the opening quote in the value
        while (!this.isAtEnd() && this.peek() !== quoteType) {
            if (this.peek() === "\\") {
                // Handle escape sequences
                value += this.advance(); // Add the backslash
                if (!this.isAtEnd()) {
                    value += this.advance(); // Add the escaped character
                }
            }
            else {
                value += this.advance(); // Add regular characters
            }
        }
        if (!this.isAtEnd()) {
            value += this.advance(); // Consume the closing quote
        }
        return { type: TokenType.StringLiteral, value };
    }
    operatorOrPunctuation() {
        const char = this.peek();
        // Check for operators
        for (const op of operators) {
            if (this.source.startsWith(op, this.current)) {
                this.current += op.length;
                return { type: TokenType.Operator, value: op };
            }
        }
        // Check for punctuation
        if (punctuation.includes(char)) {
            this.advance();
            return { type: TokenType.Punctuation, value: char };
        }
        return null;
    }
    identifier() {
        let value = "";
        while (this.isAlphaNumeric(this.peek())) {
            value += this.advance();
        }
        if (keywords.hasOwnProperty(value)) {
            return { type: TokenType.Keyword, value: keywords[value] };
        }
        // Check for function keyword
        if (value === "函数") {
            return this.functionDefinition();
        }
        // Check for console methods
        if (value === "console") {
            return this.consoleMethod();
        }
        // Check for function calls
        if (this.peek() === "(") {
            return this.functionCall(value); // If function name is followed by '(', treat it as a function call and pass the function name as an argument
        }
        return { type: TokenType.Identifier, value };
    }
    functionDefinition() {
        let value = "function ";
        let name = "";
        let params = "";
        const nextChar = this.source[this.current + 1];
        //consume the function keyword
        this.advance(); // '函书'
        // skip whitespace
        this.skipWhitespace();
        // since function name is mandatory, we can assume that the next character is an identifier
        // assume that the function name is a single identifier
        // assume that the function name is followed by an opening parenthesis
        // assume that the function parameters are separated by commas
        // assume that the function parameters are followed by a closing parenthesis
        // keep consuming characters until we reach the opening curly brace
        // make sure params are separated by commas
        // if there is no opening curly brace, we can assume that the function body is part of a larger expression
        // we will check if the next character is a newline character in the next iteration
        while (this.isAlphaNumeric(this.peek()) || this.peek() !== "{") {
            name += this.advance();
        }
        value += name;
        return { type: TokenType.FunctionBody, value };
    }
    functionCall(funcName) {
        let value = "";
        // append the function name
        value += funcName;
        // expect the first character to be an opening parenthesis and consume it
        // expect the last character to be a closing parenthesis
        // keep consuming characters until we reach a semicolon
        // if there is no semicolon, we can assume that the function call is part of a larger expression
        // we will check if the next character is an next line character in the next iteration
        while (!this.isAtEnd() && this.peek() !== ";") {
            value += this.advance();
        }
        return { type: TokenType.FunctionCall, value };
    }
    consoleMethod() {
        let value = "console";
        this.advance(); // Advance past the dot '.'
        let method = "";
        // Match the method part after console.
        while (this.isAlpha(this.peek())) {
            method += this.advance();
        }
        if ([
            "log",
            "error",
            "warn",
            "clear",
            "assert",
            "time",
            "timeEnd",
            "group",
            "groupEnd",
            "trace",
        ].includes(method)) {
            let code = `${value}.${method}`;
            let parenthesisCount = 1;
            // Add opening parenthesis
            code += this.advance(); // Consume '('
            // Append content inside parenthesis
            while (parenthesisCount > 0 && !this.isAtEnd()) {
                const char = this.peek();
                if (char === "(")
                    parenthesisCount++;
                if (char === ")")
                    parenthesisCount--;
                code += this.advance();
            }
            return { type: TokenType.Console, value: code };
        }
        else {
            throw new Error(`Unexpected console method: ${method}`);
        }
    }
    singleLineComment() {
        let value = "//";
        this.advance(); // Consume the '/' character
        while (!this.isAtEnd() && this.peek() !== "\n") {
            value += this.advance();
        }
        if (!this.isAtEnd() && this.peek() === "\n") {
            value += this.advance(); // Consume the newline character
        }
        return { type: TokenType.SingleLineComment, value };
    }
    multiLineComment() {
        let value = "/*";
        this.advance(); // Consume the '/*' characters
        while (!this.isAtEnd() &&
            (this.peek() !== "*" || this.source[this.current + 1] !== "/")) {
            value += this.advance();
        }
        value += this.advance(); // Consume the '*'
        value += this.advance(); // Consume the '/'
        return { type: TokenType.MultiLineComment, value };
    }
    nextToken() {
        this.skipWhitespace();
        if (this.isAtEnd()) {
            return { type: TokenType.EOF, value: "" };
        }
        const char = this.peek();
        const nextChar = this.source[this.current + 1];
        // Check for comments
        if (char === "/") {
            if (nextChar === "/") {
                this.advance(); // Consume the first '/'
                this.advance(); // Consume the second '/'
                return this.singleLineComment();
            }
            else if (nextChar === "*") {
                return this.multiLineComment();
            }
        }
        if (this.isDigit(char)) {
            return this.number();
        }
        if ((char === '"' || char === "'" || char === "`") &&
            typeof char === "string") {
            return this.string();
        }
        if (this.isAlpha(char)) {
            const identifier = this.identifier();
            if (identifier.type === TokenType.Keyword &&
                identifier.value === "function") {
                return this.functionDefinition();
            }
            else {
                return identifier;
            }
        }
        const opOrPunc = this.operatorOrPunctuation();
        if (opOrPunc) {
            return opOrPunc;
        }
        // If we encounter an unexpected character, throw an error
        throw new Error(`Unexpected character: ${char}`);
    }
    tokenize() {
        const tokens = [];
        let token = this.nextToken();
        while (token.type !== TokenType.EOF) {
            tokens.push(token);
            token = this.nextToken();
        }
        tokens.push(token); // Push EOF token
        return tokens;
    }
    translate(tokens) {
        let result = "";
        for (const token of tokens) {
            switch (token.type) {
                case TokenType.NumberLiteral:
                    result += token.value;
                    break;
                case TokenType.StringLiteral:
                    result += token.value;
                    break;
                case TokenType.Identifier:
                    result += token.value;
                    break;
                case TokenType.FunctionCall:
                    result += token.value;
                    break;
                case TokenType.Operator:
                    result += token.value;
                    break;
                case TokenType.Punctuation:
                    result += token.value;
                    break;
                case TokenType.Keyword:
                    result += token.value;
                    break;
                case TokenType.Console:
                    result += token.value;
                    break;
                case TokenType.SingleLineComment:
                case TokenType.MultiLineComment:
                    break; // Ignore comments in translation
                case TokenType.EOF:
                    break; // End of file
            }
        }
        return result;
    }
}
