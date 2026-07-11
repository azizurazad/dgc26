const ts = require("typescript");
const fs = require("fs");
const path = require("path");

function checkMapCall(node, file) {
  if (ts.isCallExpression(node) && 
      ts.isPropertyAccessExpression(node.expression) && 
      node.expression.name.text === 'map') {
    
    if (node.arguments.length > 0) {
      const func = node.arguments[0];
      if (ts.isArrowFunction(func) || ts.isFunctionExpression(func)) {
        let body = func.body;
        if (ts.isParenthesizedExpression(body)) {
          body = body.expression;
        }
        
        if (ts.isJsxElement(body) || ts.isJsxSelfClosingElement(body)) {
          const tag = ts.isJsxElement(body) ? body.openingElement : body;
          const hasKey = tag.attributes.properties.some(p => p.name && p.name.text === 'key');
          if (!hasKey) {
            const pos = file.getLineAndCharacterOfPosition(body.getStart());
            console.log(`${file.fileName}: Missing key at line ${pos.line + 1} for element <${tag.tagName.getText()}>`);
          }
        } else if (ts.isJsxFragment(body)) {
          const pos = file.getLineAndCharacterOfPosition(body.getStart());
          console.log(`${file.fileName}: Fragment missing key at line ${pos.line + 1}`);
        } else if (ts.isBlock(body)) {
          const returnStmt = body.statements.find(ts.isReturnStatement);
          if (returnStmt && returnStmt.expression) {
            let expr = returnStmt.expression;
            if (ts.isParenthesizedExpression(expr)) {
              expr = expr.expression;
            }
            if (ts.isJsxElement(expr) || ts.isJsxSelfClosingElement(expr)) {
              const tag = ts.isJsxElement(expr) ? expr.openingElement : expr;
              const hasKey = tag.attributes.properties.some(p => p.name && p.name.text === 'key');
              if (!hasKey) {
                const pos = file.getLineAndCharacterOfPosition(expr.getStart());
                console.log(`${file.fileName}: Missing key at line ${pos.line + 1} for element <${tag.tagName.getText()}>`);
              }
            } else if (ts.isJsxFragment(expr)) {
               const pos = file.getLineAndCharacterOfPosition(expr.getStart());
               console.log(`${file.fileName}: Fragment missing key at line ${pos.line + 1}`);
            }
          }
        }
      }
    }
  }

  ts.forEachChild(node, child => checkMapCall(child, file));
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, "utf8");
      const srcFile = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true);
      checkMapCall(srcFile, srcFile);
    }
  }
}

processDir("src");
