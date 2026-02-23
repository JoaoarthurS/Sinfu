/**
 * Script para gerar documentação da arquitetura
 * Execute: npm run doc
 */

const fs = require('fs');
const path = require('path');

function generateStructureTree(dir, prefix = '', isLast = true) {
  const items = fs.readdirSync(dir);
  let result = '';

  // Ignorar pastas
  const ignore = ['node_modules', 'android/build', 'ios/Pods', '.git'];
  
  items.forEach((item, index) => {
    const itemPath = path.join(dir, item);
    const isLastItem = index === items.length - 1;
    
    if (ignore.some(i => itemPath.includes(i))) return;
    
    const connector = isLastItem ? '└── ' : '├── ';
    const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
    
    result += prefix + connector + item + '\n';
    
    if (fs.statSync(itemPath).isDirectory()) {
      result += generateStructureTree(itemPath, newPrefix, isLastItem);
    }
  });
  
  return result;
}

console.log('📦 Estrutura do Projeto:\n');
console.log(generateStructureTree('./src'));
