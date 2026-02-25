const initLegalTabs=()=>{
  const tabs=Array.from(document.querySelectorAll("[data-legal-tab]"));
  const panels=Array.from(document.querySelectorAll("[data-legal-panel]"));
  if(!tabs.length||!panels.length)return;
  const tablist=document.querySelector(".legal-tabs");
  const tabById=new Map(tabs.map((tab)=>[tab.dataset.legalTab, tab]));
  const panelById=new Map(panels.map((panel)=>[panel.dataset.legalPanel, panel]));
  const setActive=(id, options={})=>{
    const {
      focus=false, updateHash=true
    }=options;
    const tab=tabById.get(id);
    const panel=panelById.get(id);
    if(!tab||!panel)return;
    tabs.forEach((item)=>{
      const isActive=item===tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.tabIndex=isActive?0:-1;
    }
    );
    panels.forEach((item)=>{
      const isActive=item===panel;
      item.classList.toggle("is-active", isActive);
      if(isActive){
        item.removeAttribute("hidden");
      }
      else{
        item.setAttribute("hidden", "");
      }
    }
    );
    if(updateHash){
      const nextHash=`#${id}`;
      if(window.history&&window.history.replaceState){
        window.history.replaceState(null, "", nextHash);
      }
      else{
        window.location.hash=nextHash;
      }
    }
    if(focus){
      tab.focus({
        preventScroll:true
      }
      );
    }
  };
  const aliasMap={
    "terminos-condiciones":"cobranza",
    "politica-privacidad":"privacidad"
  };
  const setFromHash=()=>{
    const raw=decodeURIComponent(window.location.hash||"").replace("#", "");
    const normalized=aliasMap[raw]||raw;
    if(normalized&&tabById.has(normalized)){
      setActive(normalized, {
        updateHash:raw!==normalized
      }
      );
      return true;
    }
    return false;
  };
  tabs.forEach((tab)=>{
    tab.addEventListener("click", ()=>{
      const id=tab.dataset.legalTab;
      setActive(id, {
        focus:true
      }
      );
    }
    );
  }
  );
  if(tablist){
    tablist.addEventListener("keydown", (event)=>{
      if(!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))return;
      event.preventDefault();
      const currentIndex=tabs.findIndex((tab)=>tab.classList.contains("is-active"));
      let nextIndex=currentIndex;
      if(event.key==="ArrowRight")nextIndex=(currentIndex+1)%tabs.length;
      if(event.key==="ArrowLeft")nextIndex=(currentIndex-1+tabs.length)%tabs.length;
      if(event.key==="Home")nextIndex=0;
      if(event.key==="End")nextIndex=tabs.length-1;
      const nextTab=tabs[nextIndex];
      if(nextTab){
        setActive(nextTab.dataset.legalTab, {
          focus:true
        }
        );
      }
    }
    );
  }
  const hasHash=setFromHash();
  if(!hasHash){
    setActive(tabs[0]?.dataset.legalTab||"cobranza");
  }
  window.addEventListener("hashchange", setFromHash);
};

document.addEventListener("DOMContentLoaded", initLegalTabs);
