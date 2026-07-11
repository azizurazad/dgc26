const ts = require("typescript");
const fs = require("fs");

function checkArrayLiteral(node, file) {
  if (ts.isArrayLiteralExpression(node)) {
    node.elements.forEach(el => {
      if (ts.isJsxElement(el) || ts.isJsxSelfClosingElement(el)) {
        const tag = ts.isJsxElement(el) ? el.openingElement : el;
        const hasKey = tag.attributes.properties.some(p => p.name && p.name.text === 'key');
        if (!hasKey) {
          const pos = file.getLineAndCharacterOfPosition(el.getStart());
          console.log(`Array literal element missing key at line ${pos.line + 1} for <${tag.tagName.getText()}>`);
        }
      }
    });
  }

  ts.forEachChild(node, child => checkArrayLiteral(child, file));
}

const content = fs.readFileSync("src/components/AdminPanel.tsx", "utf8");
const file = ts.createSourceFile("AdminPanel.tsx", content, ts.ScriptTarget.Latest, true);
checkArrayLiteral(file, file);
