(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const z=globalThis,J=z.ShadowRoot&&(z.ShadyCSS===void 0||z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol(),st=new WeakMap;let pt=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==K)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(J&&t===void 0){const i=e!==void 0&&e.length===1;i&&(t=st.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&st.set(e,t))}return t}toString(){return this.cssText}};const mt=o=>new pt(typeof o=="string"?o:o+"",void 0,K),Q=(o,...t)=>{const e=o.length===1?o[0]:t.reduce((i,s,r)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[r+1],o[0]);return new pt(e,o,K)},vt=(o,t)=>{if(J)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const i=document.createElement("style"),s=z.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,o.appendChild(i)}},it=J?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return mt(e)})(o):o;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:yt,defineProperty:$t,getOwnPropertyDescriptor:_t,getOwnPropertyNames:xt,getOwnPropertySymbols:At,getPrototypeOf:Et}=Object,g=globalThis,ot=g.trustedTypes,St=ot?ot.emptyScript:"",F=g.reactiveElementPolyfillSupport,U=(o,t)=>o,D={toAttribute(o,t){switch(t){case Boolean:o=o?St:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},Y=(o,t)=>!yt(o,t),rt={attribute:!0,type:String,converter:D,reflect:!1,useDefault:!1,hasChanged:Y};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),g.litPropertyMetadata??(g.litPropertyMetadata=new WeakMap);let E=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=rt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&$t(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=_t(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:s,set(n){const a=s==null?void 0:s.call(this);r==null||r.call(this,n),this.requestUpdate(t,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??rt}static _$Ei(){if(this.hasOwnProperty(U("elementProperties")))return;const t=Et(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(U("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(U("properties"))){const e=this.properties,i=[...xt(e),...At(e)];for(const s of i)this.createProperty(s,e[s])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[e,i]of this.elementProperties){const s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const s of i)e.unshift(it(s))}else t!==void 0&&e.push(it(t));return e}static _$Eu(t,e){const i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(e=>e(this))}addController(t){var e;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((e=t.hostConnected)==null||e.call(t))}removeController(t){var e;(e=this._$EO)==null||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return vt(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(e=>{var i;return(i=e.hostConnected)==null?void 0:i.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(e=>{var i;return(i=e.hostDisconnected)==null?void 0:i.call(e)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){var r;const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){const n=(((r=i.converter)==null?void 0:r.toAttribute)!==void 0?i.converter:D).toAttribute(e,i.type);this._$Em=t,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){var r,n;const i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){const a=i.getPropertyOptions(s),c=typeof a.converter=="function"?{fromAttribute:a.converter}:((r=a.converter)==null?void 0:r.fromAttribute)!==void 0?a.converter:D;this._$Em=s,this[s]=c.fromAttribute(e,a.type)??((n=this._$Ej)==null?void 0:n.get(s))??null,this._$Em=null}}requestUpdate(t,e,i){var s;if(t!==void 0){const r=this.constructor,n=this[t];if(i??(i=r.getPropertyOptions(t)),!((i.hasChanged??Y)(n,e)||i.useDefault&&i.reflect&&n===((s=this._$Ej)==null?void 0:s.get(t))&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,n??e??this[t]),r!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,n]of s){const{wrapped:a}=n,c=this[r];a!==!0||this._$AL.has(r)||c===void 0||this.C(r,void 0,n,c)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),(i=this._$EO)==null||i.forEach(s=>{var r;return(r=s.hostUpdate)==null?void 0:r.call(s)}),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){var e;(e=this._$EO)==null||e.forEach(i=>{var s;return(s=i.hostUpdated)==null?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};E.elementStyles=[],E.shadowRootOptions={mode:"open"},E[U("elementProperties")]=new Map,E[U("finalized")]=new Map,F==null||F({ReactiveElement:E}),(g.reactiveElementVersions??(g.reactiveElementVersions=[])).push("2.1.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const O=globalThis,j=O.trustedTypes,nt=j?j.createPolicy("lit-html",{createHTML:o=>o}):void 0,ft="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,wt="?"+b,kt=`<${wt}>`,A=document,W=()=>A.createComment(""),T=o=>o===null||typeof o!="object"&&typeof o!="function",Z=Array.isArray,Ct=o=>Z(o)||typeof(o==null?void 0:o[Symbol.iterator])=="function",B=`[ 	
\f\r]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,at=/-->/g,ct=/>/g,y=RegExp(`>|${B}(?:([^\\s"'>=/]+)(${B}*=${B}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),lt=/'/g,dt=/"/g,bt=/^(?:script|style|textarea|title)$/i,Pt=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),p=Pt(1),S=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),ht=new WeakMap,$=A.createTreeWalker(A,129);function gt(o,t){if(!Z(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return nt!==void 0?nt.createHTML(t):t}const Lt=(o,t)=>{const e=o.length-1,i=[];let s,r=t===2?"<svg>":t===3?"<math>":"",n=L;for(let a=0;a<e;a++){const c=o[a];let d,u,l=-1,f=0;for(;f<c.length&&(n.lastIndex=f,u=n.exec(c),u!==null);)f=n.lastIndex,n===L?u[1]==="!--"?n=at:u[1]!==void 0?n=ct:u[2]!==void 0?(bt.test(u[2])&&(s=RegExp("</"+u[2],"g")),n=y):u[3]!==void 0&&(n=y):n===y?u[0]===">"?(n=s??L,l=-1):u[1]===void 0?l=-2:(l=n.lastIndex-u[2].length,d=u[1],n=u[3]===void 0?y:u[3]==='"'?dt:lt):n===dt||n===lt?n=y:n===at||n===ct?n=L:(n=y,s=void 0);const w=n===y&&o[a+1].startsWith("/>")?" ":"";r+=n===L?c+kt:l>=0?(i.push(d),c.slice(0,l)+ft+c.slice(l)+b+w):c+b+(l===-2?a:w)}return[gt(o,r+(o[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]};class N{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,n=0;const a=t.length-1,c=this.parts,[d,u]=Lt(t,e);if(this.el=N.createElement(d,i),$.currentNode=this.el.content,e===2||e===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(s=$.nextNode())!==null&&c.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(const l of s.getAttributeNames())if(l.endsWith(ft)){const f=u[n++],w=s.getAttribute(l).split(b),H=/([.?@])?(.*)/.exec(f);c.push({type:1,index:r,name:H[2],strings:w,ctor:H[1]==="."?Ot:H[1]==="?"?Wt:H[1]==="@"?Tt:q}),s.removeAttribute(l)}else l.startsWith(b)&&(c.push({type:6,index:r}),s.removeAttribute(l));if(bt.test(s.tagName)){const l=s.textContent.split(b),f=l.length-1;if(f>0){s.textContent=j?j.emptyScript:"";for(let w=0;w<f;w++)s.append(l[w],W()),$.nextNode(),c.push({type:2,index:++r});s.append(l[f],W())}}}else if(s.nodeType===8)if(s.data===wt)c.push({type:2,index:r});else{let l=-1;for(;(l=s.data.indexOf(b,l+1))!==-1;)c.push({type:7,index:r}),l+=b.length-1}r++}}static createElement(t,e){const i=A.createElement("template");return i.innerHTML=t,i}}function k(o,t,e=o,i){var n,a;if(t===S)return t;let s=i!==void 0?(n=e._$Co)==null?void 0:n[i]:e._$Cl;const r=T(t)?void 0:t._$litDirective$;return(s==null?void 0:s.constructor)!==r&&((a=s==null?void 0:s._$AO)==null||a.call(s,!1),r===void 0?s=void 0:(s=new r(o),s._$AT(o,e,i)),i!==void 0?(e._$Co??(e._$Co=[]))[i]=s:e._$Cl=s),s!==void 0&&(t=k(o,s._$AS(o,t.values),s,i)),t}class Ut{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=((t==null?void 0:t.creationScope)??A).importNode(e,!0);$.currentNode=s;let r=$.nextNode(),n=0,a=0,c=i[0];for(;c!==void 0;){if(n===c.index){let d;c.type===2?d=new M(r,r.nextSibling,this,t):c.type===1?d=new c.ctor(r,c.name,c.strings,this,t):c.type===6&&(d=new Nt(r,this,t)),this._$AV.push(d),c=i[++a]}n!==(c==null?void 0:c.index)&&(r=$.nextNode(),n++)}return $.currentNode=A,s}p(t){let e=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class M{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=k(this,t,e),T(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ct(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&T(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){var r;const{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=N.createElement(gt(i.h,i.h[0]),this.options)),i);if(((r=this._$AH)==null?void 0:r._$AD)===s)this._$AH.p(e);else{const n=new Ut(s,this),a=n.u(this.options);n.p(e),this.T(a),this._$AH=n}}_$AC(t){let e=ht.get(t.strings);return e===void 0&&ht.set(t.strings,e=new N(t)),e}k(t){Z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new M(this.O(W()),this.O(W()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,e);t&&t!==this._$AB;){const s=t.nextSibling;t.remove(),t=s}}setConnected(t){var e;this._$AM===void 0&&(this._$Cv=t,(e=this._$AP)==null||e.call(this,t))}}class q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=h}_$AI(t,e=this,i,s){const r=this.strings;let n=!1;if(r===void 0)t=k(this,t,e,0),n=!T(t)||t!==this._$AH&&t!==S,n&&(this._$AH=t);else{const a=t;let c,d;for(t=r[0],c=0;c<r.length-1;c++)d=k(this,a[i+c],e,c),d===S&&(d=this._$AH[c]),n||(n=!T(d)||d!==this._$AH[c]),d===h?t=h:t!==h&&(t+=(d??"")+r[c+1]),this._$AH[c]=d}n&&!s&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Ot extends q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}}class Wt extends q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}}class Tt extends q{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=k(this,t,e,0)??h)===S)return;const i=this._$AH,s=t===h&&i!==h||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==h&&(i===h||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;typeof this._$AH=="function"?this._$AH.call(((e=this.options)==null?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class Nt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){k(this,t)}}const V=O.litHtmlPolyfillSupport;V==null||V(N,M),(O.litHtmlVersions??(O.litHtmlVersions=[])).push("3.3.0");const Rt=(o,t,e)=>{const i=(e==null?void 0:e.renderBefore)??t;let s=i._$litPart$;if(s===void 0){const r=(e==null?void 0:e.renderBefore)??null;i._$litPart$=s=new M(t.insertBefore(W(),r),r,void 0,e??{})}return s._$AI(o),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const _=globalThis;class x extends E{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Rt(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return S}}var ut;x._$litElement$=!0,x.finalized=!0,(ut=_.litElementHydrateSupport)==null||ut.call(_,{LitElement:x});const G=_.litElementPolyfillSupport;G==null||G({LitElement:x});(_.litElementVersions??(_.litElementVersions=[])).push("4.2.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const X=o=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(o,t)}):customElements.define(o,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Mt={attribute:!0,type:String,converter:D,reflect:!1,hasChanged:Y},Ht=(o=Mt,t,e)=>{const{kind:i,metadata:s}=e;let r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),i==="setter"&&((o=Object.create(o)).wrapped=!0),r.set(e.name,o),i==="accessor"){const{name:n}=e;return{set(a){const c=t.get.call(this);t.set.call(this,a),this.requestUpdate(n,c,o)},init(a){return a!==void 0&&this.C(n,void 0,o,a),a}}}if(i==="setter"){const{name:n}=e;return function(a){const c=this[n];t.call(this,a),this.requestUpdate(n,c,o)}}throw Error("Unsupported decorator location: "+i)};function tt(o){return(t,e)=>typeof e=="object"?Ht(o,t,e):((i,s,r)=>{const n=s.hasOwnProperty(r);return s.constructor.createProperty(r,i),n?Object.getOwnPropertyDescriptor(s,r):void 0})(o,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function v(o){return tt({...o,state:!0,attribute:!1})}class zt extends EventTarget{constructor(t){super(),this.ws=null,this.reconnectTimeout=null,this.reconnectAttempts=0,this.maxReconnectAttempts=5,this.reconnectDelay=1e3,t&&(this.url=t),this.connect()}async getWebSocketUrl(){var e;let t;if(window.__TAURI__){const i=(e=window.__TAURI__.core)==null?void 0:e.invoke;try{return t=await i("get_websocket_url"),this.url=t,t}catch(s){throw console.error("Failed to get WebSocket URL from Tauri backend:",s),s}}else{const i=window.location.protocol==="https:"?"wss:":"ws:",s=window.location.host;return t=`${i}//${s}/ws`,this.url=t,t}}async connect(){try{this.ws=new WebSocket(await this.getWebSocketUrl()),this.ws.onopen=()=>{console.log("WebSocket connected"),this.reconnectAttempts=0,this.dispatchEvent(new CustomEvent("connected"))},this.ws.onmessage=t=>{try{const e=JSON.parse(t.data);this.dispatchEvent(new CustomEvent("message",{detail:e}))}catch(e){console.error("Error parsing WebSocket message:",e)}},this.ws.onclose=()=>{console.log("WebSocket disconnected"),this.dispatchEvent(new CustomEvent("disconnected")),this.scheduleReconnect()},this.ws.onerror=t=>{console.error("WebSocket error:",t),this.dispatchEvent(new CustomEvent("error",{detail:t}))}}catch(t){console.error("Failed to create WebSocket connection:",t),this.scheduleReconnect()}}scheduleReconnect(){this.reconnectAttempts<this.maxReconnectAttempts&&(this.reconnectTimeout=window.setTimeout(()=>{this.reconnectAttempts++,console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`),this.connect()},this.reconnectDelay*Math.pow(2,this.reconnectAttempts)))}sendMessage(t){return new Promise((e,i)=>{if(!this.ws||this.ws.readyState!==WebSocket.OPEN){i(new Error("WebSocket is not connected"));return}const s=r=>{const a=r.detail;a.action===t.action&&(this.removeEventListener("message",s),e(a))};this.addEventListener("message",s);try{this.ws.send(JSON.stringify(t))}catch(r){this.removeEventListener("message",s),i(r)}setTimeout(()=>{this.removeEventListener("message",s),i(new Error("Request timeout"))},1e4)})}async createWindow(t,e,i=!0){return this.sendMessage({action:"create_window",label:t,url:e,transparent:i})}async closeWindow(t){return this.sendMessage({action:"close_window",label:t})}async listWindows(){return this.sendMessage({action:"list_windows"})}async getWindowInfo(t){return this.sendMessage({action:"get_window_info",label:t})}async focusWindow(t){return this.sendMessage({action:"focus_window",label:t})}async ping(){return this.sendMessage({action:"ping"})}isConnected(){var t;return((t=this.ws)==null?void 0:t.readyState)===WebSocket.OPEN}disconnect(){this.reconnectTimeout&&(clearTimeout(this.reconnectTimeout),this.reconnectTimeout=null),this.ws&&(this.ws.close(),this.ws=null)}getUrl(){return this.url}}var Dt=Object.defineProperty,jt=Object.getOwnPropertyDescriptor,I=(o,t,e,i)=>{for(var s=i>1?void 0:i?jt(t,e):t,r=o.length-1,n;r>=0;r--)(n=o[r])&&(s=(i?n(t,e,s):n(s))||s);return i&&s&&Dt(t,e,s),s};let C=class extends x{constructor(){super(...arguments),this.label="",this.url="",this.isLoading=!1,this.quickUrls=[{label:"Google",url:"https://www.google.com"},{label:"GitHub",url:"https://github.com"},{label:"YouTube",url:"https://www.youtube.com"},{label:"Stack Overflow",url:"https://stackoverflow.com"},{label:"MDN",url:"https://developer.mozilla.org"}]}handleSubmit(o){o.preventDefault(),!(!this.label.trim()||!this.url.trim())&&this.isValidUrl(this.url)&&(this.isLoading=!0,this.dispatchEvent(new CustomEvent("create-window",{detail:{label:this.label.trim(),url:this.url.trim()},bubbles:!0})))}handleReset(){this.label="",this.url=""}handleQuickUrl(o){this.url=o}isValidUrl(o){try{return new URL(o),!0}catch{return!1}}setLoading(o){this.isLoading=o}reset(){this.handleReset(),this.isLoading=!1}render(){const o=this.label.trim()&&this.url.trim()&&this.isValidUrl(this.url);return p`
      <h2 class="form-title">Create New Window</h2>
      
      <form @submit="${this.handleSubmit}">
        <div class="form-group">
          <label class="form-label" for="label">Window Label</label>
          <input
            id="label"
            class="form-input"
            type="text"
            placeholder="Enter a unique label for the window"
            .value="${this.label}"
            @input="${t=>this.label=t.target.value}"
            ?disabled="${this.isLoading}"
            required
          />
          <div class="form-help">
            A unique identifier for the window (e.g., "main-browser", "docs-viewer")
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="url">URL</label>
          <input
            id="url"
            class="form-input ${this.url&&!this.isValidUrl(this.url)?"error":""}"
            type="url"
            placeholder="https://example.com"
            .value="${this.url}"
            @input="${t=>this.url=t.target.value}"
            ?disabled="${this.isLoading}"
            required
          />
          <div class="form-help">
            The URL to load in the new window
          </div>
          
          <div class="quick-urls">
            <div class="quick-urls-title">Quick URLs:</div>
            <div class="quick-url-buttons">
              ${this.quickUrls.map(t=>p`
                <button
                  type="button"
                  class="quick-url-btn"
                  @click="${()=>this.handleQuickUrl(t.url)}"
                  ?disabled="${this.isLoading}"
                >
                  ${t.label}
                </button>
              `)}
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="${this.handleReset}"
            ?disabled="${this.isLoading}"
          >
            Reset
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            ?disabled="${!o||this.isLoading}"
          >
            ${this.isLoading?p`
              <span class="loading-spinner"></span>
              Creating...
            `:"Create Window"}
          </button>
        </div>
      </form>
    `}};C.styles=Q`
    :host {
      display: block;
      background: var(--bg-primary, white);
      border: 1px solid var(--border-color, #dee2e6);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;

      --primary-color: #007bff;
      --primary-dark: #0056b3;
      --secondary-color: #6c757d;
      --secondary-dark: #5a6268;
      --danger-color: #dc3545;
      --border-color: #dee2e6;
      --bg-primary: #ffffff;
      --bg-light: #f8f9fa;
      --text-primary: #212529;
      --text-secondary: #6c757d;
      --text-muted: #6c757d;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --primary-color: #66b2ff;
        --primary-dark: #3399ff;
        --secondary-color: #999ea2;
        --secondary-dark: #868e96;
        --danger-color: #ff6b6b;
        --border-color: #444c56;
        --bg-primary: #1e1e1e;
        --bg-light: #2c2c2c;
        --text-primary: #f1f1f1;
        --text-secondary: #aaaaaa;
        --text-muted: #888888;
      }
    }

    .form-title {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--text-primary);
      font-size: 14px;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
      background: var(--bg-light);
      color: var(--text-primary);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .form-input.error {
      border-color: var(--danger-color);
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 80px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark);
    }

    .btn-secondary {
      background: var(--secondary-color);
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--secondary-dark);
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s ease-in-out infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-help {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .quick-urls {
      margin-top: 12px;
    }

    .quick-urls-title {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .quick-url-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .quick-url-btn {
      padding: 4px 8px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: var(--bg-light);
      color: var(--text-secondary);
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .quick-url-btn:hover {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
  `;I([v()],C.prototype,"label",2);I([v()],C.prototype,"url",2);I([v()],C.prototype,"isLoading",2);C=I([X("create-window-form")],C);var qt=Object.defineProperty,It=Object.getOwnPropertyDescriptor,et=(o,t,e,i)=>{for(var s=i>1?void 0:i?It(t,e):t,r=o.length-1,n;r>=0;r--)(n=o[r])&&(s=(i?n(t,e,s):n(s))||s);return i&&s&&qt(t,e,s),s};let R=class extends x{constructor(){super(...arguments),this.selected=!1}willUpdate(o){o.has("window")&&this.requestUpdate()}formatDate(o){return new Date(o*1e3).toLocaleString()}handleFocus(){this.dispatchEvent(new CustomEvent("focus-window",{detail:{label:this.window.label},bubbles:!0}))}handleClose(){this.dispatchEvent(new CustomEvent("close-window",{detail:{label:this.window.label},bubbles:!0}))}handleGetInfo(){this.dispatchEvent(new CustomEvent("get-window-info",{detail:{label:this.window.label},bubbles:!0}))}handleClick(){this.dispatchEvent(new CustomEvent("select-window",{detail:{label:this.window.label},bubbles:!0}))}render(){const o=["window-item",this.selected?"selected":"",this.window.is_focused?"focused":""].filter(Boolean).join(" ");return p`
      <div class="${o}" @click="${this.handleClick}">
        ${this.window.is_focused?p`<div class="focused-indicator"></div>`:""}
        
        <div class="window-header">
          <h3 class="window-title">${this.window.title}</h3>
          <div class="window-status">
            <span class="status-badge ${this.window.is_visible?"status-visible":"status-hidden"}">
              ${this.window.is_visible?"Visible":"Hidden"}
            </span>
            ${this.window.is_focused?p`
              <span class="status-badge status-focused">Focused</span>
            `:""}
          </div>
        </div>

        <div class="window-details">
          <div class="window-label">
            <strong>Label:</strong> ${this.window.label}
          </div>
          <div class="window-url">
            <strong>URL:</strong> ${this.window.url}
          </div>
          <div class="window-created">
            <strong>Created:</strong> ${this.formatDate(this.window.created_at)}
          </div>
        </div>

        <div class="window-actions">
          <button class="btn btn-info" @click="${this.handleGetInfo}" title="Get Info">
            Info
          </button>
          <button class="btn btn-focus" @click="${this.handleFocus}" title="Focus Window">
            Focus
          </button>
          <button class="btn btn-close" @click="${this.handleClose}" title="Close Window">
            Close
          </button>
        </div>
      </div>
    `}};R.styles=Q`
    :host {
      display: block;
      margin-bottom: 8px;

      --primary-color: #007bff;
      --primary-dark: #0056b3;
      --primary-light: #e3f2fd;
      --secondary-color: #6c757d;
      --danger-color: #dc3545;
      --danger-dark: #c82333;
      --success-color: #28a745;
      --success-light: #d4edda;
      --warning-color: #ffc107;
      --info-color: #17a2b8;
      --info-dark: #138496;
      --border-color: #dee2e6;
      --bg-secondary: #f8f9fa;
      --text-primary: #212529;
      --text-secondary: #6c757d;
      --text-muted: #6c757d;
      --text-dark: #212529;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --primary-color: #66b2ff;
        --primary-dark: #3399ff;
        --primary-light: #1a2a3a;
        --secondary-color: #999ea2;
        --danger-color: #ff6b6b;
        --danger-dark: #e55353;
        --success-color: #51d88a;
        --success-light: #253b2d;
        --warning-color: #ffd65a;
        --info-color: #4cc9f0;
        --info-dark: #3aa7cb;
        --border-color: #444c56;
        --bg-secondary: #2c2c2c;
        --text-primary: #f1f1f1;
        --text-secondary: #aaaaaa;
        --text-muted: #888888;
        --text-dark: #f8f9fa;
      }
    }

    .window-item {
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .window-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
    }

    .window-item.selected {
      border-color: var(--primary-color);
      background: var(--primary-light);
    }

    .window-item.focused {
      border-color: var(--success-color);
      background: var(--success-light);
    }

    .window-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .window-title {
      font-weight: 600;
      font-size: 16px;
      color: var(--text-primary);
      margin: 0;
      flex: 1;
      margin-right: 12px;
    }

    .window-status {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-visible {
      background: var(--success-color);
      color: white;
    }

    .status-hidden {
      background: var(--warning-color);
      color: var(--text-dark);
    }

    .status-focused {
      background: var(--info-color);
      color: white;
    }

    .window-details {
      margin-bottom: 12px;
    }

    .window-label {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .window-url {
      font-size: 13px;
      color: var(--text-muted);
      word-break: break-all;
      margin-bottom: 4px;
    }

    .window-created {
      font-size: 12px;
      color: var(--text-muted);
    }

    .window-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .btn-focus {
      background: var(--primary-color);
      color: white;
    }

    .btn-focus:hover {
      background: var(--primary-dark);
    }

    .btn-close {
      background: var(--danger-color);
      color: white;
    }

    .btn-close:hover {
      background: var(--danger-dark);
    }

    .btn-info {
      background: var(--info-color);
      color: white;
    }

    .btn-info:hover {
      background: var(--info-dark);
    }

    .focused-indicator {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success-color);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
      }
    }
  `;et([tt({type:Object})],R.prototype,"window",2);et([tt({type:Boolean})],R.prototype,"selected",2);R=et([X("window-item")],R);var Ft=Object.defineProperty,Bt=Object.getOwnPropertyDescriptor,P=(o,t,e,i)=>{for(var s=i>1?void 0:i?Bt(t,e):t,r=o.length-1,n;r>=0;r--)(n=o[r])&&(s=(i?n(t,e,s):n(s))||s);return i&&s&&Ft(t,e,s),s};let m=class extends x{constructor(){super(...arguments),this.wsService=null,this.windows=[],this.isLoading=!0,this.isConnected=!1,this.notification=null}connectedCallback(){super.connectedCallback(),this.initializeWebSocket()}disconnectedCallback(){var o;super.disconnectedCallback(),(o=this.wsService)==null||o.disconnect()}initializeWebSocket(){this.wsService=new zt("ws://127.0.0.1:8080/ws"),this.wsService.addEventListener("connected",()=>{this.isConnected=!0,this.showNotification("success","Connected to WebSocket server."),this.fetchWindowList()}),this.wsService.addEventListener("disconnected",()=>{this.isConnected=!1,this.isLoading=!0,this.showNotification("error","Disconnected. Trying to reconnect...")}),this.wsService.addEventListener("message",o=>{o.detail.action==="window_update"&&(console.log("Received window update broadcast, refreshing list..."),this.fetchWindowList())})}async fetchWindowList(){var o;if(!(!this.wsService||!this.isConnected)){this.isLoading=!0;try{const t=await this.wsService.listWindows();t.success&&((o=t.data)!=null&&o.windows)?this.windows=t.data.windows:(this.showNotification("error",t.message||"Failed to fetch window list."),this.windows=[])}catch(t){this.showNotification("error",`Error fetching windows: ${t.message}`)}finally{this.isLoading=!1}}}async handleCreateWindow(o){var i,s,r,n;const{label:t,url:e}=o.detail;this.createWindowForm=o.target;try{const a=await((i=this.wsService)==null?void 0:i.createWindow(t,e));a!=null&&a.success?(this.showNotification("success",`Window "${t}" created successfully.`),(s=this.createWindowForm)==null||s.reset(),this.fetchWindowList()):(this.showNotification("error",(a==null?void 0:a.message)||"Failed to create window."),(r=this.createWindowForm)==null||r.setLoading(!1))}catch(a){this.showNotification("error",`Error: ${a.message}`),(n=this.createWindowForm)==null||n.setLoading(!1)}}async handleWindowAction(o){const{label:t}=o.detail,e=o.type;if(!this.wsService)return;let i;switch(e){case"close-window":i=this.wsService.closeWindow(t);break;case"focus-window":i=this.wsService.focusWindow(t);break;case"get-window-info":i=this.wsService.getWindowInfo(t);break}if(i)try{const s=await i;s.success?(this.showNotification("success",s.message),e==="get-window-info"&&console.log("Window Info:",s.data)):this.showNotification("error",s.message)}catch(s){this.showNotification("error",`Action failed: ${s.message}`)}finally{this.fetchWindowList()}}showNotification(o,t){this.notification={type:o,message:t},setTimeout(()=>{this.notification=null},5e3)}render(){return p`
      <div class="header">
        <h1 class="title">Tauri Window Manager</h1>
        <div class="status">
          <div class="status-indicator ${this.isConnected?"connected":""}"></div>
          <span>${this.isConnected?"Connected":"Disconnected"}</span>
        </div>
      </div>
      
      ${this.notification?p`
        <div class="notification ${this.notification.type}">
          ${this.notification.message}
        </div>
      `:""}

      <create-window-form @create-window=${this.handleCreateWindow}></create-window-form>
      
      <div class="windows-list-header">
        <h2 class="windows-list-title">Managed Windows (${this.windows.length})</h2>
        <button class="btn-refresh" @click=${this.fetchWindowList} ?disabled=${this.isLoading}>
            ${this.isLoading?"Loading...":"Refresh List"}
        </button>
      </div>

      <div class="windows-list">
        ${this.isLoading&&this.windows.length===0?p`<div class="no-windows">Loading windows...</div>`:this.windows.length>0?this.windows.map(o=>p`
                <window-item 
                  .window=${o}
                  @close-window=${this.handleWindowAction}
                  @focus-window=${this.handleWindowAction}
                  @get-window-info=${this.handleWindowAction}
                ></window-item>
              `):p`<div class="no-windows">No windows have been created yet.</div>`}
      </div>
    `}};m.styles=Q`
  :host {
    display: block;
    max-width: 960px;
    margin: 40px auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    
    /* Default (light mode fallback) */
    --primary-color: #007bff;
    --primary-dark: #0056b3;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --border-color: #dee2e6;
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #212529;
    --text-secondary: #6c757d;
  }

  /* Dark Mode overrides */
  @media (prefers-color-scheme: dark) {
    :host {
      --primary-color: #66b2ff;
      --primary-dark: #3399ff;
      --success-color: #5cb85c;
      --danger-color: #d9534f;
      --warning-color: #f0ad4e;
      --info-color: #5bc0de;
      --border-color: #444c56;
      --bg-primary: #1e1e1e;
      --bg-secondary: #2c2c2c;
      --text-primary: #eaeaea;
      --text-secondary: #aaaaaa;
    }
  }

  /* Resto de tus estilos */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--danger-color);
  }

  .status-indicator.connected {
    background: var(--success-color);
    animation: pulse 2s infinite;
  }

  .windows-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 40px 0 20px;
  }

  .windows-list-title {
    font-size: 20px;
    font-weight: 600;
  }

  .btn-refresh {
    padding: 8px 16px;
    border: 1px solid var(--primary-color);
    background: transparent;
    color: var(--primary-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-refresh:hover {
    background: var(--primary-color);
    color: white;
  }

  .no-windows {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
    border: 2px dashed var(--border-color);
    border-radius: 8px;
  }

  .notification {
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 20px;
    font-weight: 500;
  }

  .notification.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .notification.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
    100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
  }
`;P([v()],m.prototype,"wsService",2);P([v()],m.prototype,"windows",2);P([v()],m.prototype,"isLoading",2);P([v()],m.prototype,"isConnected",2);P([v()],m.prototype,"notification",2);m=P([X("window-manager-app")],m);
