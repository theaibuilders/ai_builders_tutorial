function l(o){navigator.clipboard.writeText(o).then(()=>{console.log("Copied to clipboard")}).catch(e=>{console.error("Failed to copy to clipboard:",e)})}window.copyToClipboard=l;function h(){const o=document.documentElement,e=o.classList.contains("dark");o.classList.toggle("dark",!e),localStorage.setItem("theme",e?"light":"dark"),window.dispatchEvent(new CustomEvent("theme-changed",{detail:{theme:e?"light":"dark"}}))}window.toggleTheme=h;function u(o){const e=o.dataset.section,n=document.querySelector(`[data-section-content="${e}"]`),t=o.querySelector("svg");if(n&&t){const a=n.style.display!=="none";n.style.display=a?"none":"block",a?(o.removeAttribute("data-expanded"),t.classList.remove("rotate-90")):(o.setAttribute("data-expanded","true"),t.classList.add("rotate-90"))}}window.toggleSection=u;document.addEventListener("DOMContentLoaded",()=>{const o=document.querySelector('a[href*="/tutorials/"].bg-blue-500\\/10');if(o){const e=o.closest(".mb-6");if(e){const n=e.querySelector("button[data-section]"),t=e.querySelector("[data-section-content]"),a=n?.querySelector("svg");n&&t&&a&&(t.style.display="block",n.setAttribute("data-expanded","true"),a.classList.add("rotate-90"))}}});class m extends HTMLElement{constructor(){super();const e=this.getAttribute("data-content")||"";this.innerHTML=`
        <button class="px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded text-xs text-gray-300 transition-colors flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span class="copy-text">Copy</span>
        </button>
      `;const n=this.querySelector("button"),t=this.querySelector(".copy-text");n&&t&&n.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(e),t.textContent="Copied!",setTimeout(()=>{t.textContent="Copy"},2e3)}catch(a){console.error("Failed to copy:",a),t.textContent="Failed",setTimeout(()=>{t.textContent="Copy"},2e3)}})}}customElements.define("copy-button",m);document.addEventListener("DOMContentLoaded",()=>{const o=document.querySelectorAll("[data-heading-link]"),e=Array.from(o).map(t=>{const a=t.getAttribute("data-heading-link");return{link:t,element:document.getElementById(a)}}).filter(t=>t.element);if(e.length===0)return;const n=new IntersectionObserver(t=>{t.forEach(a=>{const c=a.target.id,r=document.querySelector(`[data-heading-link="${c}"]`);r&&a.isIntersecting&&(o.forEach(i=>{i.classList.remove("text-blue-400","border-r-2","border-blue-400")}),r.classList.add("text-blue-400","border-r-2","border-blue-400"))})},{rootMargin:"-20% 0px -60% 0px",threshold:0});if(e.forEach(({element:t})=>{t&&n.observe(t)}),o.forEach(t=>{t.addEventListener("click",a=>{a.preventDefault();const c=t.getAttribute("data-heading-link"),r=document.getElementById(c);r&&(r.scrollIntoView({behavior:"smooth",block:"start"}),history.pushState(null,"",`#${c}`))})}),window.location.hash){const t=document.querySelector(window.location.hash);t&&setTimeout(()=>{t.scrollIntoView({behavior:"smooth",block:"start"})},100)}});document.addEventListener("DOMContentLoaded",()=>{const o=document.getElementById("search-input"),e=document.getElementById("search-results"),n=document.getElementById("search-loading");let t;const a=[{title:"Getting Started with LangChain",path:"langchain/01-introduction.md",type:"markdown",description:"Introduction to LangChain framework",section:"LangChain"},{title:"LangChain Basics",path:"langchain/02-langchain-basics.ipynb",type:"notebook",description:"Basic concepts and examples",section:"LangChain"},{title:"LlamaIndex Introduction",path:"llamaindex/01-introduction.md",type:"markdown",description:"Getting started with LlamaIndex",section:"LlamaIndex"}];function c(i){const s=i.toLowerCase();return a.filter(d=>d.title.toLowerCase().includes(s)||d.description.toLowerCase().includes(s)||d.section.toLowerCase().includes(s))}function r(i){if(i.length===0){e.innerHTML=`
          <div class="p-4 text-center text-light-secondary dark:text-dark-secondary">
            <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.674-2.583m0 0A7.962 7.962 0 014 9c0-1.933.685-3.708 1.826-5.074C7.178 2.564 9.5 2 12 2s4.822.564 6.174 1.926C19.315 5.292 20 7.067 20 9c0 1.933-.685 3.708-1.826 5.074M6.326 6.417m0 0A7.962 7.962 0 0112 3" />
            </svg>
            <p class="text-sm">No tutorials found for "${o.value}"</p>
          </div>
        `;return}e.innerHTML=i.map(s=>`
        <button
          class="w-full px-4 py-3 text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors border-b border-light-border dark:border-dark-border last:border-b-0"
          onclick="window.location.href='/tutorials/${s.path}'"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-light-secondary dark:text-dark-secondary" fill="currentColor" viewBox="0 0 20 20">
                ${s.type==="notebook"?`
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2a1 1 0 000 2h8a1 1 0 100-2H6zm0 3a1 1 0 000 2h8a1 1 0 100-2H6zm0 3a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                `:`
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2v6l2-2 2 2V7H6z"/>
                `}
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-sm font-medium text-light-text dark:text-dark-text truncate">
                  ${s.title}
                </h3>
                <span class="text-xs px-2 py-0.5 rounded ${s.type==="notebook"?"bg-orange-500/20 text-orange-400":"bg-blue-500/20 text-blue-400"}">
                  ${s.type==="notebook"?"ipynb":"md"}
                </span>
              </div>
              <div class="text-xs text-light-secondary dark:text-dark-secondary mb-1">
                ${s.section}
              </div>
              <p class="text-xs text-light-secondary dark:text-dark-secondary line-clamp-2">
                ${s.description}
              </p>
            </div>
          </div>
        </button>
      `).join("")}o.addEventListener("input",i=>{const s=i.target.value.trim();if(clearTimeout(t),!s){e.classList.add("hidden"),n.classList.add("hidden");return}n.classList.remove("hidden"),t=setTimeout(()=>{const d=c(s);r(d),e.classList.remove("hidden"),n.classList.add("hidden")},300)}),o.addEventListener("keydown",i=>{i.key==="Escape"&&(e.classList.add("hidden"),o.blur())}),document.addEventListener("click",i=>{!o.contains(i.target)&&!e.contains(i.target)&&e.classList.add("hidden")})});
