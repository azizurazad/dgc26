const ts = require("typescript");
const fs = require("fs");

function checkNode(node, file) {
  if (ts.isJsxExpression(node)) {
    if (node.expression && ts.isCallExpression(node.expression)) {
      if (!ts.isPropertyAccessExpression(node.expression.expression) || node.expression.expression.name.text !== 'map') {
         const pos = file.getLineAndCharacterOfPosition(node.getStart());
         console.log(`Call expression in JSX at line ${pos.line + 1}: ${node.expression.getText()}`);
      }
    }
  }
  ts.forEachChild(node, child => checkNode(child, file));
}

const fileToParse = "src/components/AdminPanel.tsx";
const content = fs.readFileSync(fileToParse, "utf8");
const file = ts.createSourceFile(fileToParse, content, ts.ScriptTarget.Latest, true);
checkNode(file, file);
