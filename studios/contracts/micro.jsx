import {useLayoutEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createPortal,flushSync} from 'react-dom';
import RubberSegment from './reactbits/RubberSegment.jsx';
import SwipeToast from './reactbits/SwipeToast.jsx';
import StatusMark from './reactbits/StatusMark.jsx';
import './micro.css';

const agreementHost=document.querySelector('.type-switch'),viewHost=document.querySelector('.view-switch'),toastHost=document.getElementById('toast'),readyCount=document.getElementById('readyCount');
const progressHost=document.createElement('span');progressHost.className='micro-ready';progressHost.setAttribute('aria-hidden','true');readyCount.before(progressHost);
const bridge=window.contractMicroBridge;
const snapshot=()=>bridge.snapshot();
const DocIcon=()=> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H5v18h14V8zM14 3v6h5M8 13h8M8 17h6"/></svg>;
const LockIcon=()=> <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>;
const InfoIcon=()=> <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></svg>;
const theme={trackColor:'var(--micro-track)',thumbColor:'var(--surface)',textColor:'var(--muted)',activeTextColor:'var(--blue)',size:'lg',radius:10,inset:4,stretch:60,squash:2,speed:1.35,draggable:false};

function Interactions(){
 const [ui,setUi]=useState(snapshot),[notice,setNotice]=useState(null),serial=useRef(0),returnFocus=useRef(null);
 useLayoutEffect(()=>{readyCount.hidden=ui.remaining===0},[ui.remaining]);
 useLayoutEffect(()=>{
  window.contractMicroUpdate=()=>{const next=snapshot();setUi(previous=>Object.keys(next).every(k=>previous[k]===next[k])?previous:next)};
  window.contractMicroNotify=message=>{returnFocus.current=document.activeElement;toastHost.hidden=false;setNotice({message,id:++serial.current})};
  return()=>{delete window.contractMicroUpdate;delete window.contractMicroNotify};
 },[]);
 const dismiss=reason=>{const focused=toastHost.contains(document.activeElement)||['close','escape','action'].includes(reason);setNotice(null);toastHost.hidden=true;if(focused){const el=returnFocus.current;const target=el?.isConnected&&el.getClientRects().length&&!el.closest('[hidden],details:not([open])')?el:document.querySelector('#filesMenu summary');target?.focus()}};
 const segment=(items,value,onChange,label)=> <RubberSegment {...theme} items={items} value={value} onChange={onChange} aria-label={label}/>;
 return <>
  {createPortal(segment([{value:'service',label:'Service agreement',icon:<DocIcon/>},{value:'nda',label:'NDA',icon:<LockIcon/>}],ui.type,bridge.setType,'Agreement type'),agreementHost)}
  {createPortal(segment([{value:'edit',label:'Edit agreement',id:'editView'},{value:'preview',label:'Preview',id:'previewView'}],ui.view,view=>bridge.setView(view),'Workspace view'),viewHost)}
  {createPortal(<StatusMark status={ui.remaining===0?'done':'running'} progress={ui.total?1-ui.remaining/ui.total:0} size={21} color="var(--blue)" doneColor="var(--green)" strike={false} strokeWidth={2.2}/>,progressHost)}
  {createPortal(notice?<SwipeToast key={notice.id} title={notice.message} icon={<InfoIcon/>} background="var(--ink)" color="var(--surface)" fuseColor="var(--micro-fuse)" closeButton duration={6500} width={420} radius={12} slideMs={240} onClose={dismiss}/>:null,toastHost)}
 </>;
}

// Keep the normal editor as the fallback until the bundled React islands are ready.
agreementHost.replaceChildren();viewHost.replaceChildren();toastHost.replaceChildren();
for(const host of [agreementHost,viewHost]){host.dataset.microReady='true';host.removeAttribute('role');host.removeAttribute('aria-label')}
toastHost.className='micro-toast-host';toastHost.removeAttribute('role');
const controller=document.createElement('div');controller.id='contractMicroController';controller.hidden=true;document.body.append(controller);
flushSync(()=>createRoot(controller).render(<Interactions/>));
document.documentElement.dataset.micro='react-bits';

// Glide Select's moving highlight, adapted to the existing keyboard listbox and viewport-aware popup.
function highlight(menu,option){if(!option||menu.hidden)return;menu.style.setProperty('--micro-option-y',option.offsetTop+'px');menu.style.setProperty('--micro-option-h',option.offsetHeight+'px');menu.style.setProperty('--micro-option-opacity','1')}
function selected(menu){return menu.querySelector('[aria-selected="true"]')||menu.querySelector('[role="option"]')}
document.addEventListener('pointerover',e=>{const option=e.target.closest('.currencymenu [role="option"]');if(option)highlight(option.parentElement,option)});
document.addEventListener('focusin',e=>{const option=e.target.closest('.currencymenu [role="option"]');if(option)highlight(option.parentElement,option)});
document.querySelectorAll('.currencymenu').forEach(menu=>{menu.classList.add('micro-glide');menu.addEventListener('pointerleave',()=>highlight(menu,menu.contains(document.activeElement)?document.activeElement:selected(menu)))});
const observer=new MutationObserver(records=>{for(const {target}of records)if(target.matches('.currencymenu')&&!target.hidden){const trigger=document.querySelector('[aria-controls="'+target.id+'"]');const above=trigger&&parseFloat(target.style.top)<trigger.getBoundingClientRect().top;target.style.setProperty('--dropdown-origin',above?'bottom center':'top center');target.style.setProperty('--dropdown-shift',above?'10px':'-10px');requestAnimationFrame(()=>highlight(target,selected(target)))}});
observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});
window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
