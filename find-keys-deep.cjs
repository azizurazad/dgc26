const ts = require("typescript");
const fs = require("fs");

function checkNode(expr, file) {
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
  } else if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
     checkNode(expr.right, file);
  } else if (ts.isConditionalExpression(expr)) {
     checkNode(expr.whenTrue, file);
     checkNode(expr.whenFalse, file);
  } else if (ts.isParenthesizedExpression(expr)) {
     checkNode(expr.expression, file);
  }
}

function checkMapCall(node, file) {
  if (ts.isCallExpression(node) && 
      ts.isPropertyAccessExpression(node.expression) && 
      node.expression.name.text === 'map') {
    
    if (node.arguments.length > 0) {
      const func = node.arguments[0];
      if (ts.isArrowFunction(func) || ts.isFunctionExpression(func)) {
        let body = func.body;
        
        if (ts.isBlock(body)) {
          const returnStmt = body.statements.find(ts.isReturnStatement);
          if (returnStmt && returnStmt.expression) {
            checkNode(returnStmt.expression, file);
          }
        } else {
          checkNode(body, file);
        }
      }
    }
  }

  ts.forEachChild(node, child => checkMapCall(child, file));
}

const fileToParse = "src/components/AdminPanel.tsx";
const content = fs.readFileSync(fileToParse, "utf8");
const file = ts.createSourceFile(fileToParse, content, ts.ScriptTarget.Latest, true);
checkMapCall(file, file);
