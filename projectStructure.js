// projectStructure.js
const fs = require('fs');
const path = require('path');

function generateProjectStructure(startPath) {
    const structure = {
        name: path.basename(startPath),
        type: 'directory',
        path: startPath,
        children: [],
        metadata: {
            totalFiles: 0,
            fileTypes: {},
            lastUpdate: new Date().toISOString()
        }
    };

    function exploreDirectory(currentPath, currentStructure) {
        const items = fs.readdirSync(currentPath);
        
        items.forEach(item => {
            const fullPath = path.join(currentPath, item);
            const stats = fs.statSync(fullPath);
            const relativePath = path.relative(startPath, fullPath);

            if (stats.isDirectory()) {
                const subStructure = {
                    name: item,
                    type: 'directory',
                    path: relativePath,
                    children: []
                };
                currentStructure.children.push(subStructure);
                exploreDirectory(fullPath, subStructure);
            } else {
                const ext = path.extname(item);
                structure.metadata.totalFiles++;
                structure.metadata.fileTypes[ext] = (structure.metadata.fileTypes[ext] || 0) + 1;

                currentStructure.children.push({
                    name: item,
                    type: 'file',
                    path: relativePath,
                    extension: ext,
                    size: stats.size,
                    lastModified: stats.mtime
                });
            }
        });
    }

    exploreDirectory(startPath, structure);
    return structure;
}

// Chemin vers votre projet
const projectPath = './gacha-game';

try {
    const structure = generateProjectStructure(projectPath);
    
    // Créer le dossier docs s'il n'existe pas
    if (!fs.existsSync('docs')) {
        fs.mkdirSync('docs');
    }

    // Sauvegarder la structure complète
    fs.writeFileSync(
        'docs/project-structure.json', 
        JSON.stringify(structure, null, 2)
    );

    // Générer un résumé markdown
    const summary = `
# Structure du Projet
Généré le : ${new Date().toLocaleString()}

## Statistiques
- Total des fichiers : ${structure.metadata.totalFiles}
- Types de fichiers : ${JSON.stringify(structure.metadata.fileTypes, null, 2)}

## Arborescence
\`\`\`
${JSON.stringify(structure, null, 2)}
\`\`\`
    `;

    fs.writeFileSync('docs/structure.md', summary);
    
    console.log('Structure du projet générée avec succès !');
    console.log('Consultez docs/project-structure.json pour la structure détaillée');
    console.log('Consultez docs/structure.md pour un résumé');

} catch (error) {
    console.error('Erreur lors de la génération de la structure :', error);
}