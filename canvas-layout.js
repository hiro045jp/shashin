'use strict';
let tilePickerLimit=3,collagePickerLimit=3;
// Rearrange existing controls; keep the image editing and save handlers.
const canvasTopBar=make('div','canvas-topbar');canvasTopBar.dataset.editControls='';canvasTopBar.append(add,$('deleteSplit'));main.prepend(canvasTopBar);
document.querySelector('header').append(quick);
const canvasBottomBar=make('div','canvas-bottom-settings');canvasBottomBar.dataset.editControls='';
const splitBottom=make('div','canvas-bottom-mode'),collageBottom=make('div','canvas-bottom-mode');
const splitRatioGroup=split.querySelector('.grid-group');
const collageGridGroup=collage.querySelector('.grid-group'),collageCanvasGroup=collage.querySelector('.canvas-group');
splitBottom.append(splitRatioGroup);collageBottom.append(collageGridGroup,collageCanvasGroup);canvasBottomBar.append(splitBottom,collageBottom);
main.insertBefore(canvasBottomBar,statusBar);
main.insertBefore(layersPanel,statusBar);
workspace.prepend(oldAside);
const canvasLayoutRender=render;render=function(){canvasLayoutRender();if(window.appHasExited)return;const review=workspace.hidden;canvasTopBar.hidden=review;canvasBottomBar.hidden=review;layersPanel.hidden=review||mode!=='collage';splitBottom.hidden=mode!=='split';collageBottom.hidden=mode!=='collage';};
render();

// Apply the selected split through the existing tile-generation handler.
const splitApplyGroup=split.querySelector('.color-group');
splitApplyGroup.querySelector('.group-caption').hidden=true;
$('splitBg').closest('label').hidden=true;
splitApplyGroup.querySelector('.color-palette').hidden=true;
$('makeTiles').textContent='適用';
$('makeTiles').hidden=false;
$('makeTiles').classList.add('split-apply-button');

canvasTopBar.hidden=true;
canvasTopBar.style.display='none';
splitGrid.hidden=true;
const tilePicker=make('section','ribbon-group tile-picker');tilePicker.dataset.editControls='';
const tileSummary=make('p','tile-picker-summary');const tileCells=make('div','tile-picker-cells');tileCells.setAttribute('aria-label','分割数を選択');
tilePicker.append(make('div','group-caption','分割数'),tileSummary,tileCells,make('p','tile-picker-hint','左上からドラッグして選択'));
split.querySelector('.transform-group').before(tilePicker);
for(let row=1;row<=5;row++)for(let col=1;col<=5;col++){const cell=make('button','tile-picker-cell');cell.type='button';cell.dataset.col=col;cell.dataset.row=row;cell.setAttribute('aria-label',`横${col}枚 × 縦${row}枚`);cell.onclick=()=>chooseTileCount(col,row);tileCells.append(cell);}
function syncTilePicker(){const cols=+$('count').value,rows=+$('rows').value;tileSummary.textContent=`横（列）${cols}枚 × 縦（行）${rows}枚`;tileCells.querySelectorAll('button').forEach(cell=>{const on=+cell.dataset.col<=cols&&+cell.dataset.row<=rows;cell.classList.toggle('chosen',on);cell.setAttribute('aria-pressed',String(on));});}
function chooseTileCount(cols,rows){$('count').value=cols;$('rows').value=rows;updateSplit();syncTilePicker();}
let pickingTiles=false;
const pickAt=e=>{const rect=tileCells.getBoundingClientRect();chooseTileCount(Math.max(1,Math.min(tilePickerLimit,Math.floor((e.clientX-rect.left)/rect.width*tilePickerLimit)+1)),Math.max(1,Math.min(tilePickerLimit,Math.floor((e.clientY-rect.top)/rect.height*tilePickerLimit)+1)));};
tileCells.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();pickingTiles=true;tileCells.setPointerCapture(e.pointerId);pickAt(e);};
tileCells.onpointermove=e=>{if(pickingTiles)pickAt(e);};
tileCells.onpointerup=()=>{if(pickingTiles){pickingTiles=false;commitEdit();}};tileCells.onpointercancel=()=>{pickingTiles=false;commitEdit();};
const ratioButtons=make('div','tile-ratio-buttons');ratioButtons.setAttribute('aria-label','各タイルの比率');
for(const option of $('splitRatio').options){const b=make('button','tile-ratio-button',option.value==='free'?'自由':option.value==='custom'?'数値を入力':option.value);b.type='button';b.dataset.ratio=option.value;b.onclick=()=>{$('splitRatio').value=option.value;orientations.splitRatio=null;ratioChanged('splitRatio');commitEdit();syncRatioButtons();};ratioButtons.append(b);}
$('splitRatio').hidden=true;$('splitRatio').before(ratioButtons);
for(const[value,label]of [['1:1.414','A/B判'],['1:1.427','L判'],['1:1.402','2L判']])ratioButtons.querySelector(`[data-ratio="${value}"]`).textContent=label;
const orientationMark=document.createElementNS('http://www.w3.org/2000/svg','svg');
orientationMark.setAttribute('viewBox','0 0 64 32');orientationMark.setAttribute('aria-hidden','true');
orientationMark.innerHTML='<rect x="3" y="5" width="14" height="22" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 11h14m-4-4 4 4-4 4M38 21H24m4-4-4 4 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="43" y="9" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>';
$('splitRatioOrientation').replaceChildren(document.createTextNode('縦 ⇄ 横'));
function syncRatioButtons(){ratioButtons.querySelectorAll('button').forEach(b=>{const on=b.dataset.ratio===$('splitRatio').value;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});}
const tileControlsRender=render;render=function(){tileControlsRender();if(window.appHasExited)return;canvasTopBar.hidden=true;syncTilePicker();syncRatioButtons();};
render();
document.querySelectorAll('[data-mode]').forEach(button=>button.textContent=button.dataset.mode==='split'?'写真分割':'写真結合');
splitRatioGroup.querySelector('.group-caption').hidden=true;
document.querySelector('.brand').after(titleModes);
document.querySelector('.brand span').textContent='写真分割・結合アプリ';
document.title='写真分割・結合アプリ';
const emptySplitTitle=make('h2','empty-split-title','写真分割');
const emptySplitDescription=make('p','empty-split-description','かんたんな操作で、写真をご希望のグリッドに分割します！');
const readableExtensions=make('p','empty-readable-extensions','対応形式：.jpg / .jpeg / .png / .webp / .gif / .bmp');
emptyPhotoButton.after(readableExtensions);
$('empty').prepend(emptySplitTitle,emptySplitDescription);
const emptyModeRender=render;render=function(){emptyModeRender();if(window.appHasExited)return;const splitting=mode==='split';emptySplitTitle.hidden=emptySplitDescription.hidden=!splitting;emptyPhotoButton.textContent='写真ファイルを選択';$('empty').querySelector('.empty-drop-instruction').textContent=splitting?'または、ここに写真をドロップしてください':'または、ここに写真ファイルをドロップしてください';};
render();

const panelHandle=make('div','panel-drag-handle');panelHandle.append(make('span','','分割設定'));const panelMinimize=make('button','','−');panelMinimize.type='button';panelMinimize.setAttribute('aria-label','パネルを最小化');panelHandle.append(panelMinimize);oldAside.prepend(panelHandle);
function containPanel(){const parent=workspace.getBoundingClientRect(),r=oldAside.getBoundingClientRect();const left=Math.max(0,Math.min(parent.width-r.width,r.left-parent.left)),top=Math.max(0,Math.min(parent.height-r.height,r.top-parent.top));oldAside.style.left=left+'px';oldAside.style.top=top+'px';oldAside.style.right='auto';}
panelMinimize.onclick=()=>{const minimized=oldAside.classList.toggle('panel-minimized');panelMinimize.textContent=minimized?'□':'−';panelMinimize.setAttribute('aria-label',minimized?'パネルを復元':'パネルを最小化');containPanel();};
let panelDrag=null;panelHandle.onpointerdown=e=>{if(e.button!==0||e.target.closest('button'))return;e.preventDefault();const r=oldAside.getBoundingClientRect(),p=workspace.getBoundingClientRect();panelDrag={x:e.clientX,y:e.clientY,left:r.left-p.left,top:r.top-p.top};panelHandle.setPointerCapture(e.pointerId);};panelHandle.onpointermove=e=>{if(!panelDrag)return;oldAside.style.left=panelDrag.left+e.clientX-panelDrag.x+'px';oldAside.style.top=panelDrag.top+e.clientY-panelDrag.y+'px';oldAside.style.right='auto';containPanel();};panelHandle.onpointerup=panelHandle.onpointercancel=()=>{panelDrag=null;};window.addEventListener('resize',()=>{if(!oldAside.hidden)containPanel();});

workspace.prepend(layersPanel);
collage.prepend(collageGridGroup);
const collagePicker=make('section','ribbon-group tile-picker');const collageSummary=make('p','tile-picker-summary'),collageCells=make('div','tile-picker-cells');collagePicker.append(make('div','group-caption','配置数'),collageSummary,collageCells,make('p','tile-picker-hint','左上からドラッグして選択'));collageGridGroup.before(collagePicker);collageGridGroup.hidden=true;
function chooseCollageCount(cols,rows){if(+$('gridCols').value===cols&&+$('gridRows').value===rows)return;$('gridCols').value=cols;$('gridRows').value=rows;$('gridCols').onchange();}
for(let row=1;row<=5;row++)for(let col=1;col<=5;col++){const b=make('button','tile-picker-cell');b.type='button';b.dataset.col=col;b.dataset.row=row;b.setAttribute('aria-label','横'+col+'枚 × 縦'+row+'枚');b.onclick=()=>{chooseCollageCount(col,row);commitEdit();};collageCells.append(b);}
// Keep pointer feedback independent of photo rendering and history snapshots.
let collagePicking=false,collagePickPending=null,collagePickBounds=null;
function paintCollagePicker(cols,rows){collageSummary.textContent='横（列）'+cols+'枚 × 縦（行）'+rows+'枚';collageCells.querySelectorAll('button').forEach(b=>{const on=+b.dataset.col<=cols&&+b.dataset.row<=rows;b.classList.toggle('chosen',on);b.setAttribute('aria-pressed',String(on));});}
function pickCollage(e){const r=collagePickBounds||collageCells.getBoundingClientRect(),cols=Math.max(1,Math.min(collagePickerLimit,Math.floor((e.clientX-r.left)/r.width*collagePickerLimit)+1)),rows=Math.max(1,Math.min(collagePickerLimit,Math.floor((e.clientY-r.top)/r.height*collagePickerLimit)+1));if(collagePickPending&&collagePickPending.cols===cols&&collagePickPending.rows===rows)return;collagePickPending={cols,rows};paintCollagePicker(cols,rows);}
collageCells.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();collagePicking=true;collagePickPending=null;collagePickBounds=collageCells.getBoundingClientRect();collageCells.setPointerCapture(e.pointerId);pickCollage(e);};
collageCells.onpointermove=e=>{if(collagePicking)pickCollage(e);};
collageCells.onpointerup=e=>{if(!collagePicking)return;pickCollage(e);const choice=collagePickPending;collagePicking=false;collagePickPending=collagePickBounds=null;chooseCollageCount(choice.cols,choice.rows);commitEdit();};
collageCells.onpointercancel=()=>{if(!collagePicking)return;collagePicking=false;collagePickPending=collagePickBounds=null;paintCollagePicker(+$('gridCols').value,+$('gridRows').value);};
$('saveCollage').hidden=false;$('saveCollage').textContent='プレビュー';$('saveCollage').classList.add('split-apply-button');

collageCanvasGroup.querySelector('.group-caption').hidden=true;
const collageRatioButtons=make('div','tile-ratio-buttons');collageRatioButtons.setAttribute('aria-label','キャンバスの比率');
for(const option of $('collageRatio').options){const names={'free':'自由','custom':'数値を入力','1:1.414':'A/B判','1:1.427':'L判','1:1.402':'2L判'};const b=make('button','tile-ratio-button',names[option.value]||option.value);b.type='button';b.dataset.ratio=option.value;b.onclick=()=>{if(option.value==='custom'){collageRatioDialog.showModal();return;}$('collageRatio').value=option.value;ratioChanged('collageRatio');$('collageRatioInputs').hidden=true;commitEdit();};collageRatioButtons.append(b);}
$('collageRatio').hidden=true;$('collageRatio').before(collageRatioButtons);$('collageRatioOrientation').textContent='縦 ⇄ 横';
const collageRatioDialog=make('dialog','custom-ratio-dialog');const collageRatioForm=make('form');const cw=make('input'),ch=make('input');for(const input of [cw,ch]){input.type='number';input.min='.01';input.step='any';input.required=true;input.value=1;}const cwl=make('label','','幅'),chl=make('label','','高さ');cwl.append(cw);chl.append(ch);const ca=make('div','custom-ratio-actions'),cc=make('button','secondary','キャンセル'),cp=make('button','primary','適用');cc.type='button';cc.onclick=()=>collageRatioDialog.close();cp.type='submit';ca.append(cc,cp);collageRatioForm.append(make('h2','','キャンバスの比率を入力'),cwl,chl,ca);collageRatioDialog.append(collageRatioForm);document.body.append(collageRatioDialog);collageRatioForm.onsubmit=e=>{e.preventDefault();const a=+cw.value,b=+ch.value;if(a/b<.02||a/b>50){cw.setCustomValidity('幅÷高さは0.02～50の範囲で入力してください。');cw.reportValidity();return;}cw.setCustomValidity('');$('collageRatioWidth').value=a;$('collageRatioHeight').value=b;orientations.collageRatio=a<b?'portrait':'landscape';$('collageRatio').value='custom';ratioChanged('collageRatio');$('collageRatioInputs').hidden=true;commitEdit();collageRatioDialog.close();};cw.oninput=()=>cw.setCustomValidity('');

collage.querySelector('.color-group .group-caption').textContent='キャンバス';

const persistentAddPhoto=make('button','persistent-add-photo','＋ 写真ファイルを追加');persistentAddPhoto.type='button';persistentAddPhoto.onclick=()=>{$('collageFiles').value='';$('collageFiles').click();};layersHeader.after(persistentAddPhoto);
