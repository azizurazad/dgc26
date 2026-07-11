const ts = require("typescript");
const fs = require("fs");

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
            console.log(`Missing key at line ${pos.line + 1} for element <${tag.tagName.getText()}>`);
          }
        } else if (ts.isJsxFragment(body)) {
          const pos = file.getLineAndCharacterOfPosition(body.getStart());
          console.log(`Fragment missing key at line ${pos.line + 1}`);
        } else if (ts.isBlock(body)) {
          // Find return statement
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
                console.log(`Missing key at line ${pos.line + 1} for element <${tag.tagName.getText()}>`);
              }
            } else if (ts.isJsxFragment(expr)) {
               const pos = file.getLineAndCharacterOfPosition(expr.getStart());
               console.log(`Fragment missing key at line ${pos.line + 1}`);
            }
          }
        }
      }
    }
  }

  ts.forEachChild(node, child => checkMapCall(child, file));
}

const content = fs.readFileSync("src/components/AdminPanel.tsx", "utf8");
const file = ts.createSourceFile("AdminPanel.tsx", content, ts.ScriptTarget.Latest, true);
checkMapCall(file, file);
