(()=>{
  // Date-only calendar: no UTC conversion, no automatic date insertion.
  let targetDateInput=null,dateReturnFocus=null,visibleMonth=null,focusedDate=null,dateCounter=0;
  const calendar=$('dateDialog');
  const dateString=d=>String(d.getFullYear()).padStart(4,'0')+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const parseDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?new Date(Number(v.slice(0,4)),Number(v.slice(5,7))-1,Number(v.slice(8,10)),12):null;
  const dateAllowed=d=>{const v=dateString(d);return (!targetDateInput.min||v>=targetDateInput.min)&&(!targetDateInput.max||v<=targetDateInput.max)};
  function applyDate(value){if(!targetDateInput)return;targetDateInput.value=value;targetDateInput.dispatchEvent(new Event('input',{bubbles:true}));targetDateInput.dispatchEvent(new Event('change',{bubbles:true}));calendar.close()}
  function drawCalendar({focus=false}={}){
    const year=visibleMonth.getFullYear(),month=visibleMonth.getMonth(),days=new Date(year,month+1,0).getDate(),offset=(new Date(year,month,1).getDay()+6)%7;
    txt('monthTitle',visibleMonth.toLocaleDateString('en-GB',{month:'long',year:'numeric'}));$('calendarGrid').replaceChildren();
    for(let i=0;i<offset;i++){const spacer=document.createElement('span');spacer.setAttribute('aria-hidden','true');$('calendarGrid').append(spacer)}
    const today=dateString(new Date()),selection=targetDateInput.value;
    for(let day=1;day<=days;day++){
      const d=new Date(year,month,day,12),v=dateString(d),btn=document.createElement('button');btn.type='button';btn.textContent=String(day);btn.dataset.date=v;btn.setAttribute('aria-label',d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}));btn.setAttribute('aria-pressed',String(v===selection));if(v===today)btn.setAttribute('aria-current','date');btn.tabIndex=v===dateString(focusedDate)?0:-1;btn.disabled=!dateAllowed(d);
      btn.onclick=()=>applyDate(v);
      btn.onkeydown=e=>{
        let next=null;
        if(e.key==='ArrowRight')next=new Date(year,month,day+1,12);if(e.key==='ArrowLeft')next=new Date(year,month,day-1,12);if(e.key==='ArrowDown')next=new Date(year,month,day+7,12);if(e.key==='ArrowUp')next=new Date(year,month,day-7,12);
        if(e.key==='Home')next=new Date(year,month,day-(d.getDay()+6)%7,12);if(e.key==='End')next=new Date(year,month,day+6-(d.getDay()+6)%7,12);
        if(e.key==='PageUp'||e.key==='PageDown'){const m=month+(e.key==='PageDown'?1:-1);next=new Date(year,m,Math.min(day,new Date(year,m+1,0).getDate()),12)}
        if(next){e.preventDefault();focusedDate=next;visibleMonth=new Date(next.getFullYear(),next.getMonth(),1,12);drawCalendar({focus:true})}
      };
      $('calendarGrid').append(btn);
    }
    const firstEnabled=$('calendarGrid').querySelector('button:not(:disabled)');if(!$('calendarGrid').querySelector('button[tabindex="0"]:not(:disabled)')&&firstEnabled)firstEnabled.tabIndex=0;
    if(focus)($('calendarGrid').querySelector('button[tabindex="0"]:not(:disabled)')||firstEnabled)?.focus();
  }
  function openCalendar(input,button,label){targetDateInput=input;dateReturnFocus=button;const initial=parseDate(input.value)||new Date();focusedDate=new Date(initial.getFullYear(),initial.getMonth(),initial.getDate(),12);visibleMonth=new Date(initial.getFullYear(),initial.getMonth(),1,12);txt('calendarTitle',label.replace(/\s*\(optional\)/i,''));drawCalendar();calendar.showModal();drawCalendar({focus:true})}
  window.enhanceInvoiceDate=input=>{
    if(input.dataset.calendarReady)return;input.dataset.calendarReady='true';
    const label=input.closest('label')?.childNodes[0]?.textContent?.trim()||'Date',wrap=document.createElement('div');wrap.className='date-wrap';
    input.parentNode.insertBefore(wrap,input);wrap.append(input);const button=document.createElement('button');button.type='button';button.className='date-button';button.setAttribute('aria-label','Choose '+label.toLowerCase());button.setAttribute('aria-haspopup','dialog');
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 2v6M16 2v6"/></svg>';
    button.onclick=()=>openCalendar(input,button,label);input.addEventListener('keydown',e=>{if(e.altKey&&e.key==='ArrowDown'){e.preventDefault();openCalendar(input,button,label)}});wrap.append(button);
  };
  function syncDateControls(){document.querySelectorAll('input[type="date"]').forEach(window.enhanceInvoiceDate)}
  $('previousMonth').onclick=()=>{visibleMonth=new Date(visibleMonth.getFullYear(),visibleMonth.getMonth()-1,1,12);focusedDate=new Date(visibleMonth);drawCalendar()};$('nextMonth').onclick=()=>{visibleMonth=new Date(visibleMonth.getFullYear(),visibleMonth.getMonth()+1,1,12);focusedDate=new Date(visibleMonth);drawCalendar()};
  $('clearDate').onclick=()=>applyDate('');$('closeCalendar').onclick=()=>calendar.close();calendar.addEventListener('close',()=>dateReturnFocus?.isConnected&&dateReturnFocus.focus());
  calendar.addEventListener('click',e=>{if(e.target===calendar){const r=calendar.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)calendar.close()}});

syncDateControls();
})();