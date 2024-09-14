import { Lexer, TokenType } from "./lexer.js";
import fs from "fs/promises";
import vm from "vm";

// Read the input file
const filePath = "./index.cn.js";
const code = await fs.readFile(filePath, "utf-8");

const lexer = new Lexer(code);

let token = lexer.nextToken();
const jsCode = [];
const tokens = [];

// Tokenization and translation
while (token.type !== TokenType.EOF) {
  tokens.push(`Type: ${TokenType[token.type]}, Value: ${token.value}`);

  if (
    token.type === TokenType.Console ||
    token.type === TokenType.StringLiteral
  ) {
    // Handle console.log statements correctly
    jsCode.push(`${token.value}`);
  } else if (
    token.type === TokenType.Identifier ||
    token.type === TokenType.Keyword ||
    token.type === TokenType.NumberLiteral
  ) {
    jsCode.push(token.value); // Concatenate identifiers, keywords, and numbers with a space
  } else {
    jsCode.push(token.value); // For punctuation, operators, and others, no extra space needed
  }

  // Add line breaks and indentations after specific punctuation
  if (token.value === "{") {
    jsCode.push("\n\t");
  } else if (token.value === "}") {
    jsCode.push("\n");
  } else if (token.value === ";") {
    jsCode.push("\n");
  } else {
    // Add a space after tokens that should be followed by a space
    if (
      ["function", "let", "const", "var", "return"].includes(token.value) ||
      ["(", ")", ",", "=", ":", "+"].includes(token.value)
    ) {
      jsCode.push(" ");
    }
  }

  token = lexer.nextToken();
}

// Join the translated JavaScript code with appropriate spacing
const finalCode = jsCode.join("");

// Output tokenized result for debugging
// console.log("Tokenized Output:");
// tokens.forEach((token) => console.log(token));

// Output the translated JavaScript code
console.log("\nTranslated JavaScript Code:");
console.log(finalCode);

// Capture the output of the evaluated code
let output = "";

const sandbox = {
  console: {
    log: (...args) => {
      output += args.join(" ") + "\n"; // Capture console.log outputs
    },
  },
};

try {
  // Create a sandboxed VM context and evaluate the final code
  vm.createContext(sandbox);
  vm.runInContext(finalCode, sandbox); // Evaluate the final code

  // Output captured logs
  console.log("\nExecution Result:");
  console.log(output);
} catch (error) {
  console.error("\nError during execution:", error);
}
