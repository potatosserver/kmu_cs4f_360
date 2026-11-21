/* Project-specific presentation layer. The existing Viewer retains every action handler. */
(() => {
 const targets={title:'.visitorTitle',filmstrip:'#visitorFilmstrip',tools:'#dock',share:'.visitorShare',fullscreen:'.visitorFullscreen',decoration:'#viewerDecoration'};
 const defaults={title:{anchor:'top-center',x:0,y:6,scale:1,visible:true},filmstrip:{anchor:'bottom-center',x:0,y:0,scale:1,visible:true},tools:{anchor:'bottom-center',x:0,y:0,scale:1,visible:true},share:{anchor:'top-right',x:-18,y:18,scale:1,visible:true},fullscreen:{anchor:'bottom-right',x:-18,y:-18,scale:1,visible:true},decoration:{anchor:'middle-left',x:16,y:0,scale:1,visible:false}};
 let layout,forcedProfile=null,snapshot=null,draftMediaUrl='';
 const put=(style,name,value)=>style.setProperty(name,value,'important');
 function reset(){for(const selector of Object.values(targets)){const el=document.querySelector(selector);if(!el)continue;for(const key of ['position','top','right','bottom','left','width','height','max-width','transform','visibility','display','opacity'])el.style.removeProperty(key);}document.querySelector('#viewerDecoration').hidden=true;document.body.classList.remove('viewer-ui-custom');}
 function profile(){return forcedProfile||((matchMedia('(max-width:700px)').matches||matchMedia('(pointer:coarse)').matches)?'mobile':'desktop');}
 function apply(input){layout=input;reset();if(input?.mode!=='custom')return;document.body.classList.add('viewer-ui-custom');const items=input.profiles?.[profile()]||input.profiles?.desktop||{};
  for(const [id,selector] of Object.entries(targets)){const el=document.querySelector(selector),m=items[id]||defaults[id];if(!el||!m||!Number.isFinite(m.x)||!Number.isFinite(m.y)||!Number.isFinite(m.scale))continue;if(id==='decoration'){const key=input.decorationMediaId;if(!key||m.visible===false)continue;el.src=draftMediaUrl|| (staticMode?snapshot?.packageMedia?.[key]||'':new URL('media/'+key,location.href).href);el.hidden=!el.src;if(el.hidden)continue;}const anchor=String(m.anchor||'top-left').split('-'),vertical=anchor[0],horizontal=anchor[1]||'center',style=el.style;
   if(m.visible===false&&id!=='tools'&&id!=='fullscreen'){put(style,'display','none');continue;}
   const x=horizontal==='left'?`calc(env(safe-area-inset-left) + ${m.x}px)`:horizontal==='right'?`calc(env(safe-area-inset-right) - ${m.x}px)`:`calc(50% + ${m.x}px)`;
   const y=vertical==='top'?`calc(env(safe-area-inset-top) + ${m.y}px)`:vertical==='bottom'?`calc(env(safe-area-inset-bottom) - ${m.y}px)`:`calc(50% + ${m.y}px)`;
   put(style,'left',horizontal==='right'?'auto':x);put(style,'right',horizontal==='right'?x:'auto');put(style,'top',vertical==='bottom'?'auto':y);put(style,'bottom',vertical==='bottom'?y:'auto');
   const tx=horizontal==='center'?'-50%':'0',ty=vertical==='middle'||vertical==='center'?'-50%':'0';
   if(id==='filmstrip'){put(style,'width',Math.min(100,Math.max(50,100*m.scale))+'%');put(style,'right',horizontal==='right'?x:'auto');put(style,'height','116px');style.setProperty('--viewer-ui-filmstrip-x',horizontal==='center'?'-50%':'0');continue;}
   if(id==='tools'){put(style,'position','fixed');if(vertical==='bottom')put(style,'bottom',`calc(var(--viewer-tray) + env(safe-area-inset-bottom) - ${m.y}px)`);el.style.setProperty('--viewer-ui-tools-transform',`translate(${tx}, ${ty}) scale(${m.scale})`);continue;}
   put(style,'transform',`translate(${tx}, ${ty}) scale(${m.scale})`);
   if(id==='title')put(style,'max-width','min(88vw,760px)');
  }
 }
 window.addEventListener('message',event=>{if(document.documentElement.dataset.viewerMode!=='preview'||event.origin!==location.origin||event.data?.type!=='viewer-ui-layout-draft')return;forcedProfile=event.data.profile==='mobile'?'mobile':'desktop';draftMediaUrl=event.data.draftMediaUrl||'';apply(event.data.layout);});
 window.addEventListener('resize',()=>layout&&apply(layout));
 const staticMode=document.documentElement.dataset.viewerMode==='static';fetch(staticMode?'data.json':new URL('data',location.href),{credentials:'same-origin'}).then(r=>r.ok?r.json():null).then(data=>{snapshot=data;if(data?.settings?.viewerUiLayout)apply(data.settings.viewerUiLayout);window.parent?.postMessage?.({type:'viewer-ui-layout-ready'},location.origin);}).catch(()=>{});
})();
