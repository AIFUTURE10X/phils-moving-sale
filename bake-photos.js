// Reads photos from /photos subfolders and injects them into index.html as base64
const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, 'photos');
const htmlPath = path.join(__dirname, 'index.html');

// Map folder names to item names in the HTML
const folderToItem = {
  'ant-dinner-table': 'Ant Dinner Table + 3 Chairs',
  'double-bed': 'Beds',
  'dryer': 'Dryer',
  'fridge': 'Samsung 500L Twin Cooling Plus Fridge',
  'honda-accord': 'Car',
  'marble-tables': 'Marble-Look Side Table',
  'marri-bedside-table': 'Marri Bedside Table',
  'marri-sideboard': 'Marri Sideboard',
  'microwave': 'Microwave',
  'recliners': 'Lounge Chairs',
  'tv-stand': 'TV Stand',
  'washing-machine': 'Washing Machine',
};

// Build photo data
const photoData = {};
const folders = fs.readdirSync(photosDir).filter(f => fs.statSync(path.join(photosDir, f)).isDirectory());

for (const folder of folders) {
  const itemName = folderToItem[folder];
  if (!itemName) { console.log(`⚠️  No mapping for folder: ${folder}`); continue; }
  
  const files = fs.readdirSync(path.join(photosDir, folder))
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .sort();
  
  const base64Photos = files.map(f => {
    const data = fs.readFileSync(path.join(photosDir, folder, f));
    const ext = path.extname(f).toLowerCase().replace('.','');
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mime};base64,${data.toString('base64')}`;
  });
  
  photoData[itemName] = base64Photos;
  console.log(`✅ ${itemName}: ${base64Photos.length} photos`);
}

// Read HTML and inject
let html = fs.readFileSync(htmlPath, 'utf8');

// Look for existing baked photos marker or insert before "let photos="
const marker = '// BAKED_PHOTOS_START';
const markerEnd = '// BAKED_PHOTOS_END';
const bakedBlock = `${marker}\nconst bakedPhotos=${JSON.stringify(photoData)};\n${markerEnd}`;

if (html.includes(marker)) {
  html = html.replace(new RegExp(`${marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[\\s\\S]*?${markerEnd.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`), bakedBlock);
} else {
  // Insert before "const photos="
  html = html.replace('const photos={};', bakedBlock + '\nconst photos={};');
}

// Add/update code to merge baked photos into localStorage photos on load
const mergeCode = `// BAKED_MERGE_START
if(typeof bakedPhotos!=='undefined'){
  items.forEach((item,i)=>{
    if(bakedPhotos[item.name]&&bakedPhotos[item.name].length){
      if(!photos[i]||!photos[i].length) photos[i]=bakedPhotos[item.name];
    }
  });
}
// BAKED_MERGE_END`;

const mergeMarker = '// BAKED_MERGE_START';
const mergeMarkerEnd = '// BAKED_MERGE_END';

if (html.includes(mergeMarker)) {
  html = html.replace(new RegExp(`${mergeMarker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[\\s\\S]*?${mergeMarkerEnd.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`), mergeCode);
} else {
  // Insert after loadPhotos() call
  html = html.replace('loadPhotos();\n', `loadPhotos();\n${mergeCode}\n`);
}

fs.writeFileSync(htmlPath, html);
console.log(`\n✅ Baked ${Object.keys(photoData).length} items' photos into index.html`);
const size = (fs.statSync(htmlPath).size / 1024 / 1024).toFixed(1);
console.log(`📦 File size: ${size} MB`);
