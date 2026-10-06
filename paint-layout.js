'use strict';
// Reorganize the existing controls without replacing image-processing code.
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
const main=document.querySelector('main'),oldAside=document.querySelector('.workspace>aside');
oldAside.className='ribbon';oldAside.dataset.editControls='';document.querySelector('.workspace').prepend(oldAside);
const modeNav=document.querySelector('main>nav');modeNav.className='menu-strip';
const menuArea=make('div','application-menus');modeNav.prepend(menuArea);
const menus={ファイル:[['写真を開く…','open'],['プレビュー・保存…','preview'],['起動時の設定…','settings'],['終了','exit']],編集:[['元に戻す　Ctrl+Z','undo'],['写真をリセット','reset'],['写真を削除　Delete','delete']],表示:[['全画面／標準表示','fullscreen'],['写真一覧の表示／非表示','layers']]};
const popup=make('div','app-menu');popup.hidden=true;popup.id='appMenu';document.body.append(popup);
for(const[name,items]of Object.entries(menus)){const button=make('button','menu-button',name);button.type='button';button.setAttribute('aria-haspopup','menu');button.onclick=()=>{const same=!popup.hidden&&popup.dataset.menu===name;popup.replaceChildren();popup.dataset.menu=name;for(const[label,action]of items){const item=make('button','',label);item.type='button';item.onclick=()=>{popup.hidden=true;menuAction(action);};popup.append(item);}const box=button.getBoundingClientRect();popup.style.left=box.left+'px';popup.style.top=box.bottom+'px';popup.hidden=same;};menuArea.append(button);}
const quick=make('div','quick-access');quick.append($('undo'));const quickPreview=make('button','quick-button','▧ プレビュー');quickPreview.title='プレビュー・保存（Ctrl+S）';quickPreview.onclick=()=>menuAction('preview');quick.append(quickPreview);modeNav.append(quick);
document.querySelector('.edit-toolbar').remove();
function group(title,nodes,cls=''){const g=make('section','ribbon-group '+cls);const content=make('div','group-content');for(const n of nodes)if(n)content.append(n);g.append(content,make('div','group-caption',title));return g;}
const labelOf=id=>$(id).closest('label');
const split=$('splitControls');split.querySelector('h2').remove();
const splitGrid=$('count').closest('.buttonrow');
const sg=[group('写真',[labelOf('splitFile'),$('deleteSplit')],'file-group'),group('分割・比率',[splitGrid,labelOf('splitRatio')],'grid-group'),group('写真の調整',[labelOf('splitZoom'),labelOf('splitAngle'),$('splitReset')],'transform-group'),group('背景・保存',[labelOf('splitBg'),$('makeTiles')],'color-group')];
const splitInfo=$('splitInfo');split.replaceChildren(...sg);
const collage=$('collageControls');collage.querySelector('h2').remove();
const layerList=$('layers'),collageInfo=$('collageInfo');
const cg=[group('写真',[labelOf('collageFiles')],'file-group'),group('配置',[labelOf('layout'),$('gridControls')],'grid-group'),group('キャンバス',[labelOf('collageRatio'),labelOf('outputSize')],'canvas-group'),group('写真の調整',[$('selectedControls')],'photo-transform-group'),group('背景・保存',[labelOf('bgColor'),$('saveCollage')],'color-group')];
collage.replaceChildren(...cg);
const workspace=document.querySelector('.workspace');
const layersPanel=make('section','photos-panel');layersPanel.dataset.editControls='';layersPanel.id='photosPanel';
const layersHeader=make('div','photos-header');layersHeader.append(make('strong','','写真一覧'));const add=make('button','secondary','＋ 写真を追加');add.title='写真を追加';add.onclick=()=>menuAction('open');const layerEmpty=make('p','layer-empty','写真を追加すると、ここで選択できます。');const splitThumbnail=make('img','split-thumbnail');splitThumbnail.alt='読み込んだ写真';splitThumbnail.hidden=true;layersPanel.append(layersHeader,add,splitThumbnail,layerEmpty,layerList);workspace.prepend(layersPanel);workspace.append(oldAside);
const statusBar=make('div','paint-statusbar');statusBar.append(splitInfo,collageInfo,$('status'));main.append(statusBar);
const tips=make('span','canvas-help','ドラッグ：移動　ホイール：大きさ');tips.title='グリッド配置では別の枠へドラッグすると写真を交換します';statusBar.append(tips);
$('empty').querySelector('p').textContent='左の「写真を開く」または「写真を追加」を押すか、ここへ写真をドラッグしてください。';
labelOf('splitFile').childNodes[0].textContent='▧ 写真を開く';labelOf('collageFiles').childNodes[0].textContent='▧ 写真を追加';
$('deleteSplit').textContent='✕ 写真を削除';$('splitReset').textContent='↺ リセット';$('makeTiles').textContent='▧ プレビュー';$('saveCollage').textContent='▧ プレビュー';$('arrangeGrid').textContent='↔ 並べ直す';
labelOf('outputSize').title='保存する画像の長い辺の画素数です。3:2・3000pxなら3000×2000px。';
for(const id of ['splitBg','bgColor']){const palette=make('div','color-palette');for(const color of ['#ff0000','#ffffff','#000000','#808080','#ffff00','#0080ff','#00aa60','#ff80c0']){const b=make('button','color-swatch');b.type='button';b.style.background=color;b.title=color;b.setAttribute('aria-label','背景色 '+color);b.onclick=()=>{$(id).value=color;$(id).dispatchEvent(new Event('input',{bubbles:true}));};palette.append(b);}labelOf(id).after(palette);}
function menuAction(action){switch(action){case'open':$(mode==='split'?'splitFile':'collageFiles').click();break;case'preview':if(!$('tileResults').hidden)$('saveTiles').click();else if(!$('compositionReview').hidden)$('saveComposition').click();else{const b=$(mode==='split'?'makeTiles':'saveCollage');if(!b.disabled)b.click();}break;case'settings':$('settingsButton').click();break;case'exit':$('exitApp').click();break;case'undo':$('undo').click();break;case'reset':$(mode==='split'?'splitReset':'resetPhoto').click();break;case'delete':if(mode==='split')$('deleteSplit').click();else if(selected){deletePhoto(selected);commitEdit();}break;case'fullscreen':$('fullscreenToggle').click();break;case'layers':layersPanel.classList.toggle('user-hidden');break;}}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.application-menus,#appMenu'))popup.hidden=true;});
document.addEventListener('keydown',e=>{if(e.target.closest('input,select,textarea,dialog'))return;if(e.ctrlKey&&['o','s','z'].includes(e.key.toLowerCase())){e.preventDefault();menuAction({o:'open',s:'preview',z:'undo'}[e.key.toLowerCase()]);}else if(e.key==='Delete'){e.preventDefault();menuAction('delete');}else if(e.key==='Escape')popup.hidden=true;});
const originalRender=render;render=function(){originalRender();if(window.appHasExited)return;const review=document.querySelector('.workspace').hidden;oldAside.hidden=review;layersPanel.hidden=false;splitInfo.hidden=mode!=='split';collageInfo.hidden=mode!=='collage';layerList.hidden=mode!=='collage';splitThumbnail.hidden=mode!=='split'||!source;if(mode==='split'&&source&&splitThumbnail.src!==source.src)splitThumbnail.src=source.src;layerEmpty.hidden=mode==='split'?!!source:photos.length>0;add.textContent=mode==='split'?'＋ 写真を開く':'＋ 写真を追加';quickPreview.disabled=mode==='split'?$('makeTiles').disabled:$('saveCollage').disabled;};
const originalSelection=syncSelection;syncSelection=function(){originalSelection();document.querySelectorAll('#layers .layer-row').forEach((row,i)=>{const p=photos[i];if(!p.thumbnail){const c=document.createElement('canvas');c.width=72;c.height=64;const cc=c.getContext('2d'),f=Math.max(c.width/p.image.width,c.height/p.image.height);cc.drawImage(p.image,(c.width-p.image.width*f)/2,(c.height-p.image.height*f)/2,p.image.width*f,p.image.height*f);p.thumbnail=c.toDataURL('image/png');}const b=row.querySelector('button'),thumb=make('img','photo-thumbnail');thumb.src=p.thumbnail;thumb.alt='';b.prepend(thumb);});};
const originalBack=backToEditor;backToEditor=function(){originalBack();oldAside.hidden=false;render();};$('backTiles').onclick=$('backComposition').onclick=backToEditor;
const originalReview=showReview;showReview=function(view){originalReview(view);oldAside.hidden=true;};
render();

// Browser title-bar style controls. Browser OS windows cannot be minimized by a page.
const windowControls=document.querySelector('.header-actions');windowControls.classList.add('window-controls');
$('settingsButton').hidden=true;
const minimize=make('button','window-minimize','−');minimize.id='minimizeApp';minimize.type='button';minimize.title='作業画面を折りたたむ';minimize.setAttribute('aria-label','作業画面を折りたたむ');windowControls.prepend(minimize);
let collapsed=false;
function restoreWorkspace(){main.hidden=false;collapsed=false;minimize.setAttribute('aria-expanded','true');requestAnimationFrame(render);}
minimize.onclick=()=>{collapsed=!collapsed;main.hidden=collapsed;minimize.setAttribute('aria-expanded',String(!collapsed));minimize.title=collapsed?'作業画面を戻す':'作業画面を折りたたむ';};
syncFullscreen=function(){const active=!!document.fullscreenElement||window.desktopFullscreen;$('fullscreenToggle').textContent=active?'❐':'□';$('fullscreenToggle').title=active?'標準表示に戻す':'画面を最大化';$('fullscreenToggle').setAttribute('aria-label',$('fullscreenToggle').title);$('fullscreenToggle').setAttribute('aria-pressed',String(active));requestAnimationFrame(render);};
const desktopParams=new URLSearchParams(location.search);if(desktopParams.has('bridge')&&desktopParams.has('key'))window.desktopWindowControl=async state=>{const response=await fetch('http://127.0.0.1:'+desktopParams.get('bridge')+'/?key='+encodeURIComponent(desktopParams.get('key'))+'&state='+state,{method:'POST'});if(!response.ok)throw Error('表示状態を変更できませんでした。');};
const fullscreenAction=$('fullscreenToggle').onclick;$('fullscreenToggle').onclick=async()=>{if(collapsed){restoreWorkspace();return;}if(window.desktopWindowControl){try{const active=window.desktopFullscreen||!!document.fullscreenElement;if(document.fullscreenElement)await document.exitFullscreen();await window.desktopWindowControl(active?'normal':'fullscreen');window.desktopFullscreen=!active;syncFullscreen();}catch{status('表示を切り替えられませんでした。起動ファイルから開き直してください。');}return;}if(window.desktopFullscreen&&!document.fullscreenElement){try{await document.documentElement.requestFullscreen();window.desktopFullscreen=false;await document.exitFullscreen();syncFullscreen();}catch{status('標準表示に戻すにはF11キーを押してください。');}return;}await fullscreenAction();};
document.addEventListener('keydown',e=>{if(e.key==='F11'&&window.desktopFullscreen){window.desktopFullscreen=false;setTimeout(syncFullscreen,100);}});
$('exitApp').textContent='×';$('exitApp').title='アプリを終了';$('exitApp').setAttribute('aria-label','アプリを終了');
document.addEventListener('fullscreenchange',()=>syncFullscreen());
syncFullscreen();

// Keep the commands needed for the current editing workflow visible.
menuArea.hidden=true;
document.querySelectorAll('[data-mode]').forEach(b=>b.textContent=b.dataset.mode==='split'?'写真分割モード':'写真合成モード');
$('undo').hidden=true;
quickPreview.textContent='プレビュー・保存';
quickPreview.title='プレビュー・保存';
layersHeader.querySelector('strong').textContent='写真一覧';
layersPanel.prepend(add);
layersPanel.insertBefore($('deleteSplit'),layersHeader);
$('deleteSplit').textContent='写真を削除';
splitThumbnail.hidden=true;
splitThumbnail.remove();
for(const controls of [split,collage]){
  controls.querySelector('.file-group').hidden=true;
  controls.querySelector('.color-group .group-caption').textContent='背景色';
}
$('makeTiles').hidden=true;$('saveCollage').hidden=true;
const renderCommands=render;
render=function(){renderCommands();if(window.appHasExited)return;add.textContent='写真ファイルを選択';layersHeader.hidden=mode!=='collage';layerEmpty.hidden=mode!=='collage'||photos.length>0;$('deleteSplit').hidden=mode!=='split';};
$('empty').querySelector('p').textContent='左の「写真を選択」を押すか、ここへ写真をドラッグしてください。';
render();

// Preview gestures change only the viewing scale; saved pixels remain unchanged.
function preparePreviewGestures(){
  document.querySelectorAll('.tile>img,#compositionImage').forEach(img=>{
    if(img.dataset.gestures)return;
    img.dataset.gestures='1';
    const frame=make('div','preview-photo-viewport');img.before(frame);frame.append(img);
    let zoom=100,x=0,y=0,pointer=null;
    const update=()=>{img.style.transform=`translate(${x}px,${y}px) scale(${zoom/100})`;};
    frame.addEventListener('wheel',e=>{if(!e.deltaY)return;e.preventDefault();zoom=Math.max(100,Math.min(3000,zoom+wheelDelta(e)));update();},{passive:false});
    frame.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();pointer={id:e.pointerId,px:e.clientX,py:e.clientY,x,y};frame.setPointerCapture(e.pointerId);frame.classList.add('dragging');});
    frame.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;x=pointer.x+e.clientX-pointer.px;y=pointer.y+e.clientY-pointer.py;update();});
    const end=()=>{pointer=null;frame.classList.remove('dragging');};frame.addEventListener('pointerup',end);frame.addEventListener('pointercancel',end);
    frame.addEventListener('dblclick',()=>{zoom=100;x=y=0;update();});
    img.draggable=false;frame.title='ドラッグで移動・ホイールで拡大縮小・ダブルクリックで表示をリセット';
  });
}
const reviewWithGestures=showReview;showReview=function(view){reviewWithGestures(view);preparePreviewGestures();};

const titleModes=make('div','title-mode-switch');
document.querySelectorAll('[data-mode]').forEach(button=>titleModes.append(button));
document.querySelector('header').append(titleModes);
document.querySelector('header').insertBefore(quick,windowControls);
modeNav.hidden=true;
labelOf('layout').hidden=true;
const renderGridCommands=render;
render=function(){renderGridCommands();if(window.appHasExited)return;$('gridControls').hidden=false;$('layout').value=isGrid()?'grid':'free';$('arrangeGrid').hidden=!isGrid();};
const sizePreviewCommand=()=>{const card=(mode==='collage'?collage:split).querySelector('.grid-group');const width=card.getBoundingClientRect().width;if(width)quickPreview.style.width=width+'px';};
new ResizeObserver(sizePreviewCommand).observe(oldAside);
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(sizePreviewCommand)));
render();

oldAside.prepend(quick);
collage.querySelector('.grid-group .group-caption').textContent='配置方法';
const layoutExplanation=make('p','layout-explanation','横（列）1枚 ✕ 縦（行）1枚にすると、\n　写真を自由に配置できます。');
collage.querySelector('.grid-group .group-content').prepend(layoutExplanation);
const startupSettingsAction=$('settingsButton').onclick;
$('settingsButton').hidden=false;
$('settingsButton').classList.add('settings-icon');
$('settingsButton').textContent='⚙';
const settingsDropdown=make('section','settings-dropdown');settingsDropdown.id='settingsDropdown';settingsDropdown.hidden=true;
const wheelLabel=make('label','','ホイール1回の拡大・縮小率');const wheelSelect=make('select');wheelSelect.id='wheelStep';for(const step of [1,2,5,10,25])wheelSelect.add(new Option(step+'％',step));wheelSelect.value=wheelStep;wheelLabel.append(wheelSelect);
const reverseLabel=make('label','reverse-wheel');const reverseInput=make('input');reverseInput.type='checkbox';reverseInput.checked=wheelReverse;reverseInput.id='wheelReverse';reverseLabel.append(reverseInput,' ホイールの方向を反転');
const startupButton=make('button','secondary','起動時の配置・比率・背景色…');startupButton.onclick=()=>{settingsDropdown.hidden=true;startupSettingsAction();};
const persistWheel=()=>{wheelStep=+wheelSelect.value;wheelReverse=reverseInput.checked;try{localStorage.setItem('grid-layout-next-wheel',JSON.stringify({step:wheelStep,reverse:wheelReverse}));}catch{status('この環境では設定を保存できません。現在の作業には反映しました。');}};
wheelSelect.onchange=reverseInput.onchange=persistWheel;
settingsDropdown.append(make('strong','','設定'),wheelLabel,reverseLabel,startupButton);document.body.append(settingsDropdown);
$('settingsButton').onclick=()=>{settingsDropdown.hidden=!settingsDropdown.hidden;const rect=$('settingsButton').getBoundingClientRect();settingsDropdown.style.right=Math.max(8,innerWidth-rect.right)+'px';settingsDropdown.style.top=rect.bottom+6+'px';$('settingsButton').setAttribute('aria-expanded',String(!settingsDropdown.hidden));};
$('settingsButton').setAttribute('aria-haspopup','true');
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#settingsButton,#settingsDropdown'))settingsDropdown.hidden=true;});
document.addEventListener('keydown',e=>{if(e.key==='Escape')settingsDropdown.hidden=true;});
const helpButton=make('button','help-button','ヘルプ');helpButton.id='helpButton';windowControls.insertBefore(helpButton,$('settingsButton'));
windowControls.append(helpButton,$('settingsButton'),minimize,$('fullscreenToggle'),$('exitApp'));
const helpScreen=make('section','help-screen');helpScreen.id='helpScreen';helpScreen.hidden=true;
const helpBack=make('button','secondary','編集画面へ戻る');helpBack.onclick=()=>{helpScreen.hidden=true;main.hidden=false;requestAnimationFrame(render);};
helpScreen.append(helpBack,make('h1','','グリッドレイアウトの使い方'));
for(const[title,body]of[
 ['写真を読み込む','左の「写真を選択」を押して画像を選びます。中央の写真表示領域へのドラッグでも読み込めます。'],
 ['写真分割モード','1枚の写真を指定した列・行に分割します。写真をドラッグして位置を調整し、ホイールで拡大・縮小します。100％より小さくはできません。ダブルクリックで位置・大きさ・回転をリセットします。'],
 ['写真合成モード','複数の写真を配置します。横1枚・縦1枚なら自由配置、それ以外はグリッド配置です。左の写真一覧で写真を選び、右側で大きさ・回転・ぼかしを調整します。グリッドでは別の枠へドラッグして写真を交換できます。'],
 ['写真を固定・重ねる','「写真を固定」で移動・拡大縮小を止められます。写真を右クリックすると重なり順を変更できます。'],
 ['プレビュー・保存','右上の「プレビュー・保存」で確認画面へ進みます。プレビューはドラッグで移動、ホイールで拡大・縮小、ダブルクリックで表示をリセットできます。この表示操作は保存画像に影響しません。保存ボタンからPNG／JPGと保存サイズを選びます。'],
 ['設定と画面表示','右上の歯車でホイールの変更幅と方向、起動時の設定を変更できます。設定は次回にも引き継ぎます。□で全画面と標準表示を切り替え、×で終了します。保存していない編集内容は終了すると消えます。']
 ]){const article=make('article');article.append(make('h2','',title),make('p','',body));helpScreen.append(article);}
document.body.append(helpScreen);helpButton.onclick=()=>{settingsDropdown.hidden=true;main.hidden=true;helpScreen.hidden=false;};
const emptyPhotoButton=make('button','secondary','写真ファイルを選択');
emptyPhotoButton.id='emptyPhotoSelect';emptyPhotoButton.type='button';emptyPhotoButton.onclick=()=>menuAction('open');
$('empty').replaceChildren(emptyPhotoButton,make('p','empty-drop-instruction','または、ここに写真ファイルをドロップしてください'));
add.title='写真ファイルを選択';
$('fullscreenToggle').hidden=true;
$('fullscreenToggle').disabled=true;
$('fullscreenToggle').onclick=null;
if($('fullscreenStart').open)$('fullscreenStart').close();
