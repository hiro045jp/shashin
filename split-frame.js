'use strict';
// Editable crop grid. Export uses the same geometry as the visible frame.
const frameSize=document.createElement('input');frameSize.type='hidden';frameSize.id='splitFrameSize';frameSize.value='1';split.append(frameSize);
const baseSplitGeometry=geometry;
const pixelTileWidth=make('input'),pixelTileHeight=make('input');for(const input of [pixelTileWidth,pixelTileHeight]){input.type='hidden';input.value='0';split.append(input);}pixelTileWidth.id='pixelTileWidth';pixelTileHeight.id='pixelTileHeight';
geometry=function(){
 const g=baseSplitGeometry(),size=+frameSize.value||1,magnification=1,originalFrame=$('splitRatio').value==='original';if(originalFrame&&source){const z=+$('splitZoom').value/100;g.w=Math.max(1,Math.floor(source.width/g.cols/z));g.h=Math.max(1,Math.floor(source.height/g.rows/z));}
 if($('splitRatio').value==='custom'&&+pixelTileWidth.value>0){const [a,b]=ratio('splitRatio'),short=Math.min(+pixelTileWidth.value,+pixelTileHeight.value),long=Math.max(+pixelTileWidth.value,+pixelTileHeight.value);g.w=a<b?short:long;g.h=a<b?long:short;}
 g.w=Math.max(1,Math.round(g.w*size));g.h=Math.max(1,Math.round(g.h*size));
 if(source){
  // A screen-aligned crop becomes a rotated rectangle in source coordinates.
  const angle=+$('splitAngle').value*Math.PI/180,c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));
  const extentX=c*g.w*g.cols+s*g.h*g.rows,extentY=s*g.w*g.cols+c*g.h*g.rows;
  const scale=Math.min(1,(source.width-(originalFrame?0:2))/extentX,(source.height-(originalFrame?0:2))/extentY);
  // Rotation limits only the displayed/exported geometry, preserving the requested size.
  if(scale<1){g.w=Math.max(1,Math.floor(g.w*scale));g.h=Math.max(1,Math.floor(g.h*scale));}
  const halfX=(c*g.w*g.cols+s*g.h*g.rows)/(2*magnification)+(originalFrame?0:1),halfY=(s*g.w*g.cols+c*g.h*g.rows)/(2*magnification)+1;
  center.x=Math.max(halfX,Math.min(source.width-halfX,center.x));
  center.y=Math.max(halfY,Math.min(source.height-halfY,center.y));
 }
 g.total=g.w*g.cols;g.height=g.h*g.rows;g.x=Math.round(center.x-g.total/2);g.y=Math.round(center.y-g.height/2);return g;
};
let splitFrameView=null,frameDrag=null;
const frameBackdrop=document.createElement('canvas');
let frameAnimation=0;
function paintSplitFrame(time=0){
 if(!splitFrameView)return;
 const {x,y,w,h,cols,rows}=splitFrameView;
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(frameBackdrop,0,0);
 ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=.65;ctx.shadowColor='#0009';ctx.shadowBlur=1;
 // Solid, fine interior boundaries; only the crop perimeter marches.
 for(let i=1;i<cols;i++){ctx.beginPath();ctx.moveTo(x+w*i/cols,y);ctx.lineTo(x+w*i/cols,y+h);ctx.stroke();}
 for(let i=1;i<rows;i++){ctx.beginPath();ctx.moveTo(x,y+h*i/rows);ctx.lineTo(x+w,y+h*i/rows);ctx.stroke();}
 ctx.setLineDash([6,4]);ctx.lineDashOffset=-(time/80)%10;ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);
 for(const[hx,hy]of[[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){ctx.fillStyle='#fff';ctx.fillRect(hx-6,hy-6,12,12);ctx.strokeStyle='#555';ctx.strokeRect(hx-6,hy-6,12,12);}
 ctx.restore();
}
function animateSplitFrame(time){
 frameAnimation=0;
 if(window.appHasExited||mode!=='split'||!source||workspace.hidden)return;
 paintSplitFrame(time);frameAnimation=requestAnimationFrame(animateSplitFrame);
}
let splitDisplayReference=null;
const beforeFrameRender=render;
render=function(){beforeFrameRender();if(window.appHasExited||mode!=='split'||!source||workspace.hidden)return;const g=geometry();const freeFrame=$('splitRatio').value==='free',displayKey=[$('splitRatio').value,...(freeFrame?[]:ratio('splitRatio')),g.cols,g.rows].join(':');if(!splitDisplayReference||splitDisplayReference.source!==source||splitDisplayReference.key!==displayKey)splitDisplayReference={source,key:displayKey,w:g.total*1.08,h:g.height*1.08,center:{...center}};const f=fit(splitDisplayReference.w,splitDisplayReference.h),angle=+$('splitAngle').value*Math.PI/180;ctx.fillStyle=window.splitWorkAreaColor||getComputedStyle($('stage')).backgroundColor;ctx.fillRect(0,0,canvas.width,canvas.height);const photoF=f*g.imageScale,photoCenter=freeFrame?splitDisplayReference.center:center,photoCx=canvas.width/2,photoCy=canvas.height/2,offsetX=(center.x-photoCenter.x)*photoF,offsetY=(center.y-photoCenter.y)*photoF,cx=photoCx+offsetX*Math.cos(angle)-offsetY*Math.sin(angle),cy=photoCy+offsetX*Math.sin(angle)+offsetY*Math.cos(angle);ctx.save();ctx.translate(photoCx,photoCy);ctx.rotate(angle);ctx.drawImage(source,-photoCenter.x*photoF,-photoCenter.y*photoF,source.width*photoF,source.height*photoF);ctx.restore();const w=g.total*f,h=g.height*f,x=cx-w/2,y=cy-h/2;splitFrameView={x,y,w,h,cx,cy,f,photoF:f*g.imageScale,angle,cols:g.cols,rows:g.rows};
// Preview-only shade outside the crop.
ctx.save();ctx.translate(photoCx,photoCy);ctx.rotate(angle);ctx.beginPath();ctx.rect(-photoCenter.x*photoF,-photoCenter.y*photoF,source.width*photoF,source.height*photoF);ctx.clip();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.rect(0,0,canvas.width,canvas.height);ctx.rect(x,y,w,h);ctx.fill('evenodd');ctx.restore();
frameBackdrop.width=canvas.width;frameBackdrop.height=canvas.height;frameBackdrop.getContext('2d').drawImage(canvas,0,0);
paintSplitFrame(performance.now());if(!frameAnimation)frameAnimation=requestAnimationFrame(animateSplitFrame);
};
const framePoint=e=>{const box=canvas.getBoundingClientRect();return{x:(e.clientX-box.left)*canvas.width/box.width,y:(e.clientY-box.top)*canvas.height/box.height};};
const rotationCursor='url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2732%27 height=%2732%27 viewBox=%270 0 32 32%27%3E%3Cpath d=%27M25 12a10 10 0 1 0 0 9M25 5v8h-8%27 fill=%27none%27 stroke=%27white%27 stroke-width=%275%27/%3E%3Cpath d=%27M25 12a10 10 0 1 0 0 9M25 5v8h-8%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272.5%27/%3E%3C/svg%3E") 16 16, crosshair';
function inWorkArea(e){const r=canvas.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;}
function resizeFrameCursor(p,v){
 const angle=Math.atan2(v.cy-p.y,v.cx-p.x)*180/Math.PI;
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><g transform="rotate('+angle+' 24 24)" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 24h34M15 16l-8 8 8 8M33 16l8 8-8 8" stroke="white" stroke-width="6"/><path d="M7 24h34M15 16l-8 8 8 8M33 16l8 8-8 8" stroke="black" stroke-width="3"/></g></svg>';
 return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'") 24 24, nwse-resize';
}
function frameHit(p,v){
 if([[v.x,v.y],[v.x+v.w,v.y],[v.x,v.y+v.h],[v.x+v.w,v.y+v.h]].some(([x,y])=>Math.hypot(p.x-x,p.y-y)<16))return 'resize';
 const dx=(p.x-v.cx)/v.photoF,dy=(p.y-v.cy)/v.photoF;
 const sx=center.x+dx*Math.cos(v.angle)+dy*Math.sin(v.angle),sy=center.y-dx*Math.sin(v.angle)+dy*Math.cos(v.angle);
 const onPhoto=sx>=0&&sx<=source.width&&sy>=0&&sy<=source.height;
 if(p.x<v.x||p.x>v.x+v.w||p.y<v.y||p.y>v.y+v.h)return 'rotate';
 return onPhoto?'move':null;
}
$('stage').addEventListener('pointerdown',e=>{if(splitCropApplied||mode!=='split'||!source||e.button!==0||!splitFrameView||!inWorkArea(e))return;const p=framePoint(e),v=splitFrameView,kind=frameHit(p,v);e.preventDefault();e.stopImmediatePropagation();if(!kind)return;frameDrag={p,v:{...v},center:{...center},size:+frameSize.value,angle:+$('splitAngle').value,kind};$('stage').setPointerCapture(e.pointerId);canvas.style.cursor=kind==='resize'?resizeFrameCursor(p,v):kind==='rotate'?rotationCursor:'grabbing';},true);
$('stage').addEventListener('pointermove',e=>{if(splitCropApplied||mode!=='split'||!source||!splitFrameView)return;if(!frameDrag&&!inWorkArea(e)){canvas.style.cursor='default';$('stage').style.cursor='default';return;}const p=framePoint(e);if(!frameDrag){const v=splitFrameView,kind=frameHit(p,v);canvas.style.cursor=kind==='resize'?resizeFrameCursor(p,v):kind==='rotate'?rotationCursor:kind==='move'?'grab':'default';return;}e.preventDefault();e.stopImmediatePropagation();const d=frameDrag,v=d.v;if(d.kind==='resize'){if($('splitRatio').value==='free'){const width=Math.max(12,2*Math.abs(p.x-v.cx))/v.f,height=Math.max(12,2*Math.abs(p.y-v.cy))/v.f;setFreeFrameDimensions(width,height);}else{const start=Math.hypot(d.p.x-v.cx,d.p.y-v.cy),now=Math.hypot(p.x-v.cx,p.y-v.cy);frameSize.value=Math.max(.03,Math.min(4,d.size*now/Math.max(1,start)));}}else if(d.kind==='rotate'){
 const delta=Math.atan2(p.y-v.cy,p.x-v.cx)-Math.atan2(d.p.y-v.cy,d.p.x-v.cx);
 const degrees=d.angle+delta*180/Math.PI;$('splitAngle').value=((degrees+180)%360+360)%360-180;
 $('splitAngleValue').value=$('splitAngle').value+'°';
}else{const dx=(p.x-d.p.x)/v.photoF,dy=(p.y-d.p.y)/v.photoF;const direction=$('splitRatio').value==='free'?1:-1;center.x=d.center.x+direction*(dx*Math.cos(v.angle)+dy*Math.sin(v.angle));center.y=d.center.y+direction*(-dx*Math.sin(v.angle)+dy*Math.cos(v.angle));}invalidate();render();},true);
for(const type of ['pointerup','pointercancel'])$('stage').addEventListener(type,e=>{if(!frameDrag)return;e.stopImmediatePropagation();frameDrag=null;canvas.style.cursor='grab';commitEdit();render();},true);
$('splitReset').addEventListener('click',()=>{splitDisplayReference=null;frameSize.value='1';updateSplit();});
$('splitFile').addEventListener('change',()=>{frameSize.value='1';});
render();

// Apply shows the complete cropped photo; tile preview/save remains in the header.
let splitCropApplied=false;
const beforeCropInvalidate=invalidate;
invalidate=function(){splitCropApplied=false;beforeCropInvalidate();};
const generateSplitTiles=$('makeTiles').onclick;
$('makeTiles').textContent='プレビュー';
quickPreview.textContent='保存';
quickPreview.title='保存';
$('makeTiles').after(quickPreview);quickPreview.classList.add('split-save-button');
$('makeTiles').onclick=()=>{if(!source)return;previewView={x:0,y:0,scale:1};splitCropApplied=true;render();};
const beforeCropMenuAction=menuAction;
menuAction=function(action){if(action==='preview'&&mode==='split'&&workspace.hidden===false){return generateSplitTiles();}return beforeCropMenuAction(action);};
let previewView={x:0,y:0,scale:1},previewDrag=null;
const editCropButton=make('button','secondary','編集に戻る');editCropButton.type='button';editCropButton.hidden=true;$('makeTiles').after(editCropButton);
const cropPreviewActions=make('div','crop-preview-actions');cropPreviewActions.hidden=true;canvasBottomBar.append(cropPreviewActions);
editCropButton.onclick=()=>{splitCropApplied=false;previewDrag=null;canvas.style.transform='';$('stage').style.cursor='default';render();};
function syncPreviewView(){
 const transform=()=>{canvas.style.transform='translate('+previewView.x+'px,'+previewView.y+'px) scale('+previewView.scale+')';};
 transform();const photo=canvas.getBoundingClientRect(),stage=$('stage').getBoundingClientRect();
 const visibleX=Math.min(100,photo.width,stage.width),visibleY=Math.min(100,photo.height,stage.height);
 previewView.x+=Math.max(stage.left+visibleX-photo.right,Math.min(stage.right-visibleX-photo.left,0));
 previewView.y+=Math.max(stage.top+visibleY-photo.bottom,Math.min(stage.bottom-visibleY-photo.top,0));
 transform();
}
const previewStage=$('stage');
previewStage.addEventListener('pointerdown',e=>{if(!splitCropApplied||mode!=='split'||e.button!==0||!inWorkArea(e))return;e.preventDefault();e.stopImmediatePropagation();previewDrag={x:e.clientX,y:e.clientY,view:{...previewView}};previewStage.setPointerCapture(e.pointerId);previewStage.style.cursor='grabbing';},true);
previewStage.addEventListener('pointermove',e=>{if(!splitCropApplied||mode!=='split')return;e.stopImmediatePropagation();if(!inWorkArea(e)){previewStage.style.cursor='default';return;}previewStage.style.cursor=previewDrag?'grabbing':'grab';if(!previewDrag)return;const d=previewDrag;previewView.x=d.view.x+e.clientX-d.x;previewView.y=d.view.y+e.clientY-d.y;syncPreviewView();},true);
for(const type of ['pointerup','pointercancel'])previewStage.addEventListener(type,e=>{if(!previewDrag)return;e.stopImmediatePropagation();previewDrag=null;commitEdit();},true);
previewStage.addEventListener('wheel',e=>{if(!splitCropApplied||mode!=='split'||!inWorkArea(e))return;e.preventDefault();e.stopImmediatePropagation();previewView.scale=Math.max(.2,Math.min(5,previewView.scale*Math.exp(-e.deltaY*.001)));syncPreviewView();},{capture:true,passive:false});
const beforeAppliedCropRender=render;
render=function(){
 if(!splitCropApplied||mode!=='split'){canvas.style.transform='';}
 beforeAppliedCropRender();
 const cropPreview=splitCropApplied&&mode==='split'&&!workspace.hidden;
 cropPreviewActions.hidden=!cropPreview;
 oldAside.hidden=workspace.hidden||cropPreview;
 splitBottom.hidden=mode!=='split'||cropPreview;
 if(cropPreview){cropPreviewActions.append(editCropButton,quickPreview);quickPreview.textContent='保存する';}
 else{quickPreview.textContent='保存';if(editCropButton.parentElement===cropPreviewActions)$('makeTiles').after(editCropButton);if(mode==='split')editCropButton.after(quickPreview);else if(quickPreview.parentElement!==quick)quick.append(quickPreview);}
 editCropButton.hidden=!splitCropApplied||mode!=='split'||workspace.hidden;
 if(!splitCropApplied||mode!=='split'||!source||workspace.hidden||window.appHasExited)return;
 if(frameAnimation){cancelAnimationFrame(frameAnimation);frameAnimation=0;}
 const g=geometry();fit(g.total,g.height);ctx.clearRect(0,0,canvas.width,canvas.height);
 drawSplit(ctx,g,canvas.width/g.total);
 ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.setLineDash([]);
 for(let i=1;i<g.cols;i++){ctx.beginPath();ctx.moveTo(canvas.width*i/g.cols,0);ctx.lineTo(canvas.width*i/g.cols,canvas.height);ctx.stroke();}
 for(let i=1;i<g.rows;i++){ctx.beginPath();ctx.moveTo(0,canvas.height*i/g.rows);ctx.lineTo(canvas.width,canvas.height*i/g.rows);ctx.stroke();}
 ctx.restore();splitFrameView=null;canvas.style.cursor='grab';syncPreviewView();
};
function setFreeFrameDimensions(width,height){const a=width/+$('count').value,b=height/+$('rows').value,r=a/b;const limited=Math.max(.02,Math.min(50,r));$('splitRatioWidth').value=limited;$('splitRatioHeight').value=1;orientations.splitRatio=limited<1?'portrait':'landscape';const base=baseSplitGeometry();frameSize.value=width/base.total;}
const freeRatioButton=ratioButtons.querySelector('[data-ratio="free"]');
freeRatioButton.onclick=()=>{const g=source?geometry():null;$('splitRatio').value='free';if(g)setFreeFrameDimensions(g.total,g.height);$('splitRatioInputs').hidden=true;updateSplit();commitEdit();syncRatioButtons();};
const customRatioDialog=make('dialog','custom-ratio-dialog');customRatioDialog.id='customRatioDialog';
const customForm=make('form');const customHeading=make('h2','','各タイルの比率を入力');
const customWidth=make('input'),customHeight=make('input');for(const input of [customWidth,customHeight]){input.type='number';input.min='.01';input.max='10000';input.step='any';input.required=true;}
customWidth.id='customTileWidth';customHeight.id='customTileHeight';
const widthLabel=make('label','','幅'),heightLabel=make('label','','高さ');widthLabel.append(customWidth);heightLabel.append(customHeight);
const ratioError=make('p','custom-ratio-error');ratioError.setAttribute('role','alert');
const customActions=make('div','custom-ratio-actions');const cancelRatio=make('button','secondary','キャンセル');cancelRatio.type='button';cancelRatio.onclick=()=>customRatioDialog.close();const applyRatio=make('button','primary','適用');applyRatio.type='submit';customActions.append(cancelRatio,applyRatio);customForm.append(customHeading,widthLabel,heightLabel,ratioError,customActions);customRatioDialog.append(customForm);document.body.append(customRatioDialog);
ratioButtons.querySelector('[data-ratio="custom"]').onclick=()=>{const[a,b]=ratio('splitRatio');customWidth.value=a;customHeight.value=b;ratioError.textContent='';customRatioDialog.showModal();};
customForm.onsubmit=e=>{e.preventDefault();const a=+customWidth.value,b=+customHeight.value;if(!Number.isFinite(a/b)||a/b<.02||a/b>50){ratioError.textContent='幅÷高さは0.02～50の範囲で入力してください。';return;}$('splitRatioWidth').value=a;$('splitRatioHeight').value=b;orientations.splitRatio=a<b?'portrait':'landscape';$('splitRatio').value='custom';ratioChanged('splitRatio');$('splitRatioInputs').hidden=true;commitEdit();syncRatioButtons();customRatioDialog.close();};
const beforeFreeControlsRender=render;render=function(){beforeFreeControlsRender();if(!window.appHasExited)$('splitRatioInputs').hidden=true;};
render();

const dimensionMode=make('select');dimensionMode.setAttribute('aria-label','入力方法');dimensionMode.innerHTML='<option value="ratio">比率入力</option><option value="pixels">ピクセル</option>';customHeading.after(dimensionMode);
const dimensionHint=make('p','dimension-hint','各タイルの幅と高さの比率を入力します。');dimensionMode.after(dimensionHint);
customHeading.textContent='各タイルのサイズを入力';
dimensionMode.onchange=()=>{const pixels=dimensionMode.value==='pixels';dimensionHint.textContent=pixels?'各タイルの幅・高さをピクセルで指定します。':'各タイルの幅と高さの比率を入力します。';for(const input of [customWidth,customHeight]){input.min=pixels?'1':'.01';input.step=pixels?'1':'any';}if(pixels&&source){const g=geometry();customWidth.value=g.w;customHeight.value=g.h;}else{const[a,b]=ratio('splitRatio');customWidth.value=a;customHeight.value=b;}};
const ratioSubmit=customForm.onsubmit;
customForm.onsubmit=e=>{if(dimensionMode.value==='ratio'){pixelTileWidth.value=pixelTileHeight.value='0';return ratioSubmit(e);}e.preventDefault();const w=+customWidth.value,h=+customHeight.value;if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1){ratioError.textContent='幅と高さは1以上の整数で入力してください。';return;}if(w/h<.02||w/h>50){ratioError.textContent='幅÷高さは0.02～50の範囲で入力してください。';return;}if(source){const a=+$('splitAngle').value*Math.PI/180,c=Math.abs(Math.cos(a)),sn=Math.abs(Math.sin(a)),total=w*+$('count').value,height=h*+$('rows').value;if(c*total+sn*height>source.width-2||sn*total+c*height>source.height-2){ratioError.textContent='指定したサイズが写真に収まりません。小さいサイズを指定してください。';return;}}pixelTileWidth.value=w;pixelTileHeight.value=h;frameSize.value=1;$('splitRatioWidth').value=w;$('splitRatioHeight').value=h;orientations.splitRatio=w<h?'portrait':'landscape';$('splitRatio').value='custom';updateSplit();commitEdit();syncRatioButtons();customRatioDialog.close();};
const openDimensions=ratioButtons.querySelector('[data-ratio="custom"]').onclick;ratioButtons.querySelector('[data-ratio="custom"]').onclick=()=>{openDimensions();dimensionMode.onchange();};

const beforeUnifiedLayoutRender=render;render=function(){beforeUnifiedLayoutRender();const joining=mode==='collage';panelHandle.querySelector('span').textContent=joining?'結合設定':'分割設定';workspace.classList.toggle('joining-layout',joining);if(joining){$('saveCollage').after(quickPreview);quickPreview.textContent='保存';}const cols=+$('gridCols').value,rows=+$('gridRows').value;collageSummary.textContent='横（列）'+cols+'枚 × 縦（行）'+rows+'枚';collageCells.querySelectorAll('button').forEach(b=>{const on=+b.dataset.col<=cols&&+b.dataset.row<=rows;b.classList.toggle('chosen',on);b.setAttribute('aria-pressed',String(on));});};render();

const beforeCollageDetailsRender=render;render=function(){beforeCollageDetailsRender();const joining=mode==='collage';emptySplitTitle.hidden=emptySplitDescription.hidden=false;emptySplitTitle.textContent=joining?'写真結合':'写真分割';emptySplitDescription.textContent=joining?'かんたんな操作で、写真を結合します！':'かんたんな操作で、写真をご希望のグリッドに分割します！';$('collageRatioInputs').hidden=true;collageRatioButtons.querySelectorAll('button').forEach(b=>{const on=b.dataset.ratio===$('collageRatio').value;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});panelMinimize.textContent=oldAside.classList.contains('panel-minimized')?'↺':'−';};render();

const beforePhotoAdditionRender=render;render=function(){beforePhotoAdditionRender();$('empty').querySelector('.empty-drop-instruction').textContent='または、ここに写真ファイルをドロップしてください';persistentAddPhoto.hidden=mode!=='collage';const panelStyle=getComputedStyle(oldAside),headingStyle=getComputedStyle(panelHandle);layersPanel.style.backgroundColor=panelStyle.backgroundColor;layersHeader.style.fontSize=headingStyle.fontSize;};render();

// Consistent composition preview and direct rotation controls.
let collagePreviewActive=false,collagePointer=null;
const originalGridDrawing=drawGrid;
drawGrid=function(cols,rows,numbers=false){ctx.save();const lines=()=>{ctx.beginPath();for(let i=1;i<cols;i++){ctx.moveTo(i*canvas.width/cols,0);ctx.lineTo(i*canvas.width/cols,canvas.height);}for(let i=1;i<rows;i++){ctx.moveTo(0,i*canvas.height/rows);ctx.lineTo(canvas.width,i*canvas.height/rows);}ctx.stroke();};ctx.setLineDash([]);ctx.strokeStyle='#222';ctx.lineWidth=3;lines();ctx.strokeStyle='#fff';ctx.lineWidth=1;lines();ctx.restore();};
$('photoScale').closest('label').hidden=true;$('photoAngle').closest('label').hidden=true;collage.querySelector('.photo-transform-group .group-caption').hidden=true;collage.querySelector('.color-group .group-caption').hidden=true;const bgLabel=$('bgColor').closest('label');for(const node of bgLabel.childNodes)if(node.nodeType===3)node.textContent='キャンバスの色';
$('saveCollage').onclick=()=>{if(!photos.length)return;collagePreviewActive=true;previewView={x:0,y:0,scale:1};render();};
const editPreviewClick=editCropButton.onclick;editCropButton.onclick=()=>{collagePreviewActive=false;editPreviewClick();};
const previewSaveAction=menuAction;menuAction=function(action){if(action==='preview'&&mode==='collage')return openSave([{composition:true}]);return previewSaveAction(action);};
function collageRotateRegion(e){if(!selected||selected.locked||!inWorkArea(e))return false;const r=canvas.getBoundingClientRect(),w=world(),f=r.width/w.w,cell=cellFor(selected),cx=(cell?cell.x+cell.w/2:selected.x)*f+r.left,cy=(cell?cell.y+cell.h/2:selected.y)*f+r.top,hw=(cell?cell.w:w.w*selected.scale)*f/2,hh=(cell?cell.h:w.w*selected.scale*selected.image.height/selected.image.width)*f/2;const dx=Math.abs(e.clientX-cx),dy=Math.abs(e.clientY-cy);return (dx>=hw-20&&dx<=hw+30&&dy<=hh+30)||(dy>=hh-20&&dy<=hh+30&&dx<=hw+30);}
previewStage.addEventListener('pointerdown',e=>{if(mode!=='collage'||e.button!==0||!inWorkArea(e))return;if(collagePreviewActive){e.preventDefault();e.stopImmediatePropagation();collagePointer={kind:'pan',x:e.clientX,y:e.clientY,view:{...previewView}};}else if(!e.ctrlKey&&collageRotateRegion(e)){e.preventDefault();e.stopImmediatePropagation();const r=canvas.getBoundingClientRect(),w=world();collagePointer={kind:'rotate',photo:selected,angle:selected.angle,cx:r.left+selected.x*r.width/w.w,cy:r.top+selected.y*r.height/w.h,x:e.clientX,y:e.clientY};}else return;previewStage.setPointerCapture(e.pointerId);},true);
previewStage.addEventListener('pointermove',e=>{if(mode!=='collage')return;if(!collagePointer){canvas.style.cursor=collagePreviewActive?'grab':collageRotateRegion(e)?rotationCursor:'default';return;}e.preventDefault();e.stopImmediatePropagation();if(!inWorkArea(e))return;const d=collagePointer;if(d.kind==='pan'){previewView.x=d.view.x+e.clientX-d.x;previewView.y=d.view.y+e.clientY-d.y;syncPreviewView();}else{d.photo.angle=d.angle+(Math.atan2(e.clientY-d.cy,e.clientX-d.cx)-Math.atan2(d.y-d.cy,d.x-d.cx))*180/Math.PI;syncSelection();render();}},true);
for(const type of ['pointerup','pointercancel'])previewStage.addEventListener(type,e=>{if(!collagePointer)return;e.stopImmediatePropagation();collagePointer=null;commitEdit();},true);
previewStage.addEventListener('wheel',e=>{if(mode!=='collage'||!collagePreviewActive||!inWorkArea(e))return;e.preventDefault();e.stopImmediatePropagation();previewView.scale=Math.max(.2,Math.min(5,previewView.scale*Math.exp(-e.deltaY*.001)));syncPreviewView();},{capture:true,passive:false});
const beforeCompositionPreviewRender=render;render=function(){beforeCompositionPreviewRender();if(mode!=='collage'){collagePreviewActive=false;return;}if(!collagePreviewActive||workspace.hidden)return;oldAside.hidden=true;layersPanel.hidden=true;collageBottom.hidden=true;cropPreviewActions.hidden=false;editCropButton.hidden=false;cropPreviewActions.append(editCropButton,quickPreview);quickPreview.textContent='保存する';const w=world();fit(w.w,w.h);fillCollageBackground(ctx,canvas.width,canvas.height);for(const p of photos)drawPhoto(ctx,p,canvas.width/w.w);if(isGrid())drawGrid(+$('gridCols').value,+$('gridRows').value);syncPreviewView();};render();

document.addEventListener('contextmenu',e=>e.preventDefault(),true);
canvasBottomBar.prepend(splitInfo);statusBar.hidden=true;
const multiplePhotos=new Set();let multiplePrimary=null,selectionAnimation=0;const selectionBackdrop=document.createElement('canvas');
function togglePhotoSelection(p){if(!p)return;if(!multiplePhotos.size&&selected)multiplePhotos.add(selected);if(multiplePhotos.has(p))multiplePhotos.delete(p);else multiplePhotos.add(p);selected=multiplePhotos.has(p)?p:[...multiplePhotos].at(-1)||null;multiplePrimary=selected;syncSelection();render();}
previewStage.addEventListener('pointerdown',e=>{if(mode!=='collage'||collagePreviewActive||!e.ctrlKey||e.button!==0||!inWorkArea(e))return;e.preventDefault();e.stopImmediatePropagation();togglePhotoSelection(hitPhoto(point(e)));},true);
layerList.addEventListener('click',e=>{if(mode!=='collage'||!e.ctrlKey||e.target.closest('.remove-layer'))return;const row=e.target.closest('.layer-row');if(!row)return;e.preventDefault();e.stopImmediatePropagation();togglePhotoSelection(photos[[...layerList.children].indexOf(row)]);},true);
function paintPhotoSelection(time){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(selectionBackdrop,0,0);const w=world(),f=canvas.width/w.w;ctx.save();ctx.strokeStyle='#ffc225';ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.lineDashOffset=-(time/80)%10;for(const p of multiplePhotos){ctx.save();ctx.translate(p.x*f,p.y*f);ctx.rotate(p.angle*Math.PI/180);const pw=w.w*p.scale*f,ph=pw*p.image.height/p.image.width;ctx.strokeRect(-pw/2,-ph/2,pw,ph);ctx.restore();}ctx.restore();}
function animatePhotoSelection(time){selectionAnimation=0;if(mode!=='collage'||collagePreviewActive||workspace.hidden||window.appHasExited||!multiplePhotos.size)return;paintPhotoSelection(time);selectionAnimation=requestAnimationFrame(animatePhotoSelection);}
const beforeMultiRender=render;render=function(){beforeMultiRender();if(selectionAnimation){cancelAnimationFrame(selectionAnimation);selectionAnimation=0;}if(mode!=='collage'||collagePreviewActive||workspace.hidden)return;if(selected!==multiplePrimary){multiplePhotos.clear();if(selected)multiplePhotos.add(selected);multiplePrimary=selected;}for(const p of multiplePhotos)if(!photos.includes(p))multiplePhotos.delete(p);const w=world();fillCollageBackground(ctx,canvas.width,canvas.height);for(const p of photos)drawPhoto(ctx,p,canvas.width/w.w);if(isGrid())drawGrid(+$('gridCols').value,+$('gridRows').value);selectionBackdrop.width=canvas.width;selectionBackdrop.height=canvas.height;selectionBackdrop.getContext('2d').drawImage(canvas,0,0);layerList.querySelectorAll('.layer-row').forEach((row,i)=>row.querySelector('button').classList.toggle('active',multiplePhotos.has(photos[i])));paintPhotoSelection(performance.now());if(multiplePhotos.size)selectionAnimation=requestAnimationFrame(animatePhotoSelection);};render();

let groupDrag=null,groupBaseline=null;
previewStage.addEventListener('pointerdown',e=>{if(mode!=='collage'||collagePreviewActive||e.ctrlKey||e.button!==0||multiplePhotos.size<2||!inWorkArea(e))return;const hit=hitPhoto(point(e));if(!multiplePhotos.has(hit))return;e.preventDefault();e.stopImmediatePropagation();selected=hit;multiplePrimary=hit;groupBaseline=null;groupDrag={x:e.clientX,y:e.clientY,items:[...multiplePhotos].filter(p=>!p.locked).map(p=>({p,x:p.x,y:p.y}))};previewStage.setPointerCapture(e.pointerId);syncSelection();render();},true);
previewStage.addEventListener('pointermove',e=>{if(!groupDrag)return;e.preventDefault();e.stopImmediatePropagation();if(!inWorkArea(e))return;const r=canvas.getBoundingClientRect(),w=world(),d=groupDrag;let dx=(e.clientX-d.x)*w.w/r.width,dy=(e.clientY-d.y)*w.h/r.height;for(const t of d.items){dx=Math.max(-t.x,Math.min(w.w-t.x,dx));dy=Math.max(-t.y,Math.min(w.h-t.y,dy));}for(const t of d.items){t.p.x=t.x+dx;t.p.y=t.y+dy;}render();},true);
for(const type of ['pointerup','pointercancel'])previewStage.addEventListener(type,e=>{if(!groupDrag)return;e.stopImmediatePropagation();groupDrag=null;commitEdit();},true);
previewStage.addEventListener('wheel',e=>{if(mode!=='collage'||collagePreviewActive||multiplePhotos.size<2||!inWorkArea(e)||!multiplePhotos.has(hitPhoto(point(e))))return;e.preventDefault();e.stopImmediatePropagation();for(const p of multiplePhotos)if(!p.locked){p.percent=Math.max(10,Math.min(3000,p.percent+wheelDelta(e)));p.scale=p.baseScale*p.percent/100;}groupBaseline=null;syncSelection();render();commitEdit();},{capture:true,passive:false});
const beforeGroupRender=render;render=function(){if(mode==='collage'&&selected&&multiplePhotos.has(selected)&&multiplePhotos.size>1){if(groupBaseline&&groupBaseline.p===selected){const da=selected.angle-groupBaseline.angle,db=selected.blur-groupBaseline.blur,factor=selected.scale/groupBaseline.scale;for(const p of multiplePhotos)if(p!==selected&&!p.locked){p.angle+=da;p.blur=Math.max(0,Math.min(50,p.blur+db));p.scale*=factor;p.percent=p.scale/p.baseScale*100;}}groupBaseline={p:selected,angle:selected.angle,blur:selected.blur,scale:selected.scale};}else groupBaseline=null;beforeGroupRender();};
const outputLabel=$('outputSize').closest('label');for(const node of outputLabel.childNodes)if(node.nodeType===3)node.textContent='キャンバスのサイズ';$('outputSize').hidden=true;
const canvasDimensionText=make('span','canvas-dimension-text');outputLabel.append(canvasDimensionText);const canvasLongLabel=make('span','canvas-long-label','長辺（px）');$('outputSize').before(canvasLongLabel);$('outputSize').hidden=false;$('outputSize').setAttribute('aria-label','キャンバスの長辺（px）');
const beforeDimensionRender=render;render=function(){beforeDimensionRender();if(mode==='collage'){try{const d=outputDimensions();canvasDimensionText.textContent=d.w+' × '+d.h+' px';}catch{canvasDimensionText.textContent='サイズを確認してください';}}};render();

function returnFromSave(preview){if($('saveDialog').open)$('saveDialog').close();sizeVersion++;pendingSave=[];backToEditor();if(mode==='split')splitCropApplied=preview;else collagePreviewActive=preview;previewView={x:0,y:0,scale:1};render();}
function saveNavigation(host){const bar=make('div','save-navigation');const edit=make('button','secondary','編集に戻る'),preview=make('button','secondary','プレビューに戻る');for(const b of [edit,preview])b.type='button';edit.onclick=()=>returnFromSave(false);preview.onclick=()=>returnFromSave(true);bar.append(edit,preview);host.prepend(bar);}
for(const id of ['tileResults','compositionReview']){saveNavigation($(id));$(id).querySelector('h2').textContent='保存';}saveNavigation($('saveDialog').querySelector('.save-settings'));$('backTiles').hidden=$('backComposition').hidden=true;
for(const type of ['pointerdown','pointermove','wheel','dblclick'])document.addEventListener(type,e=>{if(!e.target.closest('#tileResults .preview-photo-viewport,#compositionReview .preview-photo-viewport'))return;if(type==='wheel')e.preventDefault();e.stopImmediatePropagation();},{capture:true,passive:false});
let autoCanvasSize=true;
$('outputSize').addEventListener('input',()=>{autoCanvasSize=false;});
function sizeCanvasFromPhotos(){if(mode!=='collage'||!photos.length||!autoCanvasSize)return;const[a,b]=ratio('collageRatio'),cols=isGrid()?+$('gridCols').value:1,rows=isGrid()?+$('gridRows').value:1,maxWidth=Math.max(...photos.map(p=>p.image.width))*cols,maxHeight=Math.max(...photos.map(p=>p.image.height))*rows;const long=Math.round(Math.min(maxWidth/a,maxHeight/b)*Math.max(a,b));$('outputSize').value=Math.max(256,Math.min(8192,long));}
const loadBeforeAutomaticSize=loadFilesImpl;loadFilesImpl=async function(files){await loadBeforeAutomaticSize(files);sizeCanvasFromPhotos();render();};
const chooseBeforeAutomaticSize=chooseCollageCount;chooseCollageCount=function(cols,rows){chooseBeforeAutomaticSize(cols,rows);sizeCanvasFromPhotos();};
const ratioBeforeAutomaticSize=ratioChanged;ratioChanged=function(id){ratioBeforeAutomaticSize(id);if(id==='collageRatio'){sizeCanvasFromPhotos();render();}};
