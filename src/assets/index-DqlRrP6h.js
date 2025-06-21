(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const D=globalThis,J=D.ShadowRoot&&(D.ShadyCSS===void 0||D.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol(),se=new WeakMap;let ue=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==K)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(J&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=se.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&se.set(t,e))}return e}toString(){return this.cssText}};const me=o=>new ue(typeof o=="string"?o:o+"",void 0,K),Q=(o,...e)=>{const t=o.length===1?o[0]:e.reduce((i,s,r)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[r+1],o[0]);return new ue(t,o,K)},ye=(o,e)=>{if(J)o.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),s=D.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,o.appendChild(i)}},ie=J?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return me(t)})(o):o;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:ve,defineProperty:$e,getOwnPropertyDescriptor:_e,getOwnPropertyNames:xe,getOwnPropertySymbols:Ae,getPrototypeOf:ke}=Object,m=globalThis,oe=m.trustedTypes,Ee=oe?oe.emptyScript:"",F=m.reactiveElementPolyfillSupport,W=(o,e)=>o,I={toAttribute(o,e){switch(e){case Boolean:o=o?Ee:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},Y=(o,e)=>!ve(o,e),re={attribute:!0,type:String,converter:I,reflect:!1,useDefault:!1,hasChanged:Y};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),m.litPropertyMetadata??(m.litPropertyMetadata=new WeakMap);let E=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=re){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&$e(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=_e(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){const c=s==null?void 0:s.call(this);r==null||r.call(this,n),this.requestUpdate(e,c,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??re}static _$Ei(){if(this.hasOwnProperty(W("elementProperties")))return;const e=ke(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(W("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(W("properties"))){const t=this.properties,i=[...xe(t),...Ae(t)];for(const s of i)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(ie(s))}else e!==void 0&&t.push(ie(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ye(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostConnected)==null?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostDisconnected)==null?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){var r;const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const n=(((r=i.converter)==null?void 0:r.toAttribute)!==void 0?i.converter:I).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(e,t){var r,n;const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const c=i.getPropertyOptions(s),a=typeof c.converter=="function"?{fromAttribute:c.converter}:((r=c.converter)==null?void 0:r.fromAttribute)!==void 0?c.converter:I;this._$Em=s,this[s]=a.fromAttribute(t,c.type)??((n=this._$Ej)==null?void 0:n.get(s))??null,this._$Em=null}}requestUpdate(e,t,i){var s;if(e!==void 0){const r=this.constructor,n=this[e];if(i??(i=r.getPropertyOptions(e)),!((i.hasChanged??Y)(n,t)||i.useDefault&&i.reflect&&n===((s=this._$Ej)==null?void 0:s.get(e))&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??t??this[e]),r!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,n]of s){const{wrapped:c}=n,a=this[r];c!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,n,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(i=this._$EO)==null||i.forEach(s=>{var r;return(r=s.hostUpdate)==null?void 0:r.call(s)}),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(i=>{var s;return(s=i.hostUpdated)==null?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};E.elementStyles=[],E.shadowRootOptions={mode:"open"},E[W("elementProperties")]=new Map,E[W("finalized")]=new Map,F==null||F({ReactiveElement:E}),(m.reactiveElementVersions??(m.reactiveElementVersions=[])).push("2.1.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const L=globalThis,q=L.trustedTypes,ne=q?q.createPolicy("lit-html",{createHTML:o=>o}):void 0,we="$lit$",g=`lit$${Math.random().toFixed(9).slice(2)}$`,fe="?"+g,Se=`<${fe}>`,k=document,U=()=>k.createComment(""),M=o=>o===null||typeof o!="object"&&typeof o!="function",Z=Array.isArray,Ce=o=>Z(o)||typeof(o==null?void 0:o[Symbol.iterator])=="function",B=`[ 	
\f\r]`,P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ae=/-->/g,ce=/>/g,$=RegExp(`>|${B}(?:([^\\s"'>=/]+)(${B}*=${B}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),le=/'/g,de=/"/g,be=/^(?:script|style|textarea|title)$/i,Oe=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),u=Oe(1),S=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),he=new WeakMap,_=k.createTreeWalker(k,129);function ge(o,e){if(!Z(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return ne!==void 0?ne.createHTML(e):e}const Te=(o,e)=>{const t=o.length-1,i=[];let s,r=e===2?"<svg>":e===3?"<math>":"",n=P;for(let c=0;c<t;c++){const a=o[c];let l,p,d=-1,f=0;for(;f<a.length&&(n.lastIndex=f,p=n.exec(a),p!==null);)f=n.lastIndex,n===P?p[1]==="!--"?n=ae:p[1]!==void 0?n=ce:p[2]!==void 0?(be.test(p[2])&&(s=RegExp("</"+p[2],"g")),n=$):p[3]!==void 0&&(n=$):n===$?p[0]===">"?(n=s??P,d=-1):p[1]===void 0?d=-2:(d=n.lastIndex-p[2].length,l=p[1],n=p[3]===void 0?$:p[3]==='"'?de:le):n===de||n===le?n=$:n===ae||n===ce?n=P:(n=$,s=void 0);const b=n===$&&o[c+1].startsWith("/>")?" ":"";r+=n===P?a+Se:d>=0?(i.push(l),a.slice(0,d)+we+a.slice(d)+g+b):a+g+(d===-2?c:b)}return[ge(o,r+(o[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class N{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,n=0;const c=e.length-1,a=this.parts,[l,p]=Te(e,t);if(this.el=N.createElement(l,i),_.currentNode=this.el.content,t===2||t===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=_.nextNode())!==null&&a.length<c;){if(s.nodeType===1){if(s.hasAttributes())for(const d of s.getAttributeNames())if(d.endsWith(we)){const f=p[n++],b=s.getAttribute(d).split(g),z=/([.?@])?(.*)/.exec(f);a.push({type:1,index:r,name:z[2],strings:b,ctor:z[1]==="."?We:z[1]==="?"?Le:z[1]==="@"?Ue:j}),s.removeAttribute(d)}else d.startsWith(g)&&(a.push({type:6,index:r}),s.removeAttribute(d));if(be.test(s.tagName)){const d=s.textContent.split(g),f=d.length-1;if(f>0){s.textContent=q?q.emptyScript:"";for(let b=0;b<f;b++)s.append(d[b],U()),_.nextNode(),a.push({type:2,index:++r});s.append(d[f],U())}}}else if(s.nodeType===8)if(s.data===fe)a.push({type:2,index:r});else{let d=-1;for(;(d=s.data.indexOf(g,d+1))!==-1;)a.push({type:7,index:r}),d+=g.length-1}r++}}static createElement(e,t){const i=k.createElement("template");return i.innerHTML=e,i}}function C(o,e,t=o,i){var n,c;if(e===S)return e;let s=i!==void 0?(n=t._$Co)==null?void 0:n[i]:t._$Cl;const r=M(e)?void 0:e._$litDirective$;return(s==null?void 0:s.constructor)!==r&&((c=s==null?void 0:s._$AO)==null||c.call(s,!1),r===void 0?s=void 0:(s=new r(o),s._$AT(o,t,i)),i!==void 0?(t._$Co??(t._$Co=[]))[i]=s:t._$Cl=s),s!==void 0&&(e=C(o,s._$AS(o,e.values),s,i)),e}class Pe{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=((e==null?void 0:e.creationScope)??k).importNode(t,!0);_.currentNode=s;let r=_.nextNode(),n=0,c=0,a=i[0];for(;a!==void 0;){if(n===a.index){let l;a.type===2?l=new H(r,r.nextSibling,this,e):a.type===1?l=new a.ctor(r,a.name,a.strings,this,e):a.type===6&&(l=new Me(r,this,e)),this._$AV.push(l),a=i[++c]}n!==(a==null?void 0:a.index)&&(r=_.nextNode(),n++)}return _.currentNode=k,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class H{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=C(this,e,t),M(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==S&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ce(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&M(this._$AH)?this._$AA.nextSibling.data=e:this.T(k.createTextNode(e)),this._$AH=e}$(e){var r;const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=N.createElement(ge(i.h,i.h[0]),this.options)),i);if(((r=this._$AH)==null?void 0:r._$AD)===s)this._$AH.p(t);else{const n=new Pe(s,this),c=n.u(this.options);n.p(t),this.T(c),this._$AH=n}}_$AC(e){let t=he.get(e.strings);return t===void 0&&he.set(e.strings,t=new N(e)),t}k(e){Z(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new H(this.O(U()),this.O(U()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,t);e&&e!==this._$AB;){const s=e.nextSibling;e.remove(),e=s}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class j{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=h}_$AI(e,t=this,i,s){const r=this.strings;let n=!1;if(r===void 0)e=C(this,e,t,0),n=!M(e)||e!==this._$AH&&e!==S,n&&(this._$AH=e);else{const c=e;let a,l;for(e=r[0],a=0;a<r.length-1;a++)l=C(this,c[i+a],t,a),l===S&&(l=this._$AH[a]),n||(n=!M(l)||l!==this._$AH[a]),l===h?e=h:e!==h&&(e+=(l??"")+r[a+1]),this._$AH[a]=l}n&&!s&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class We extends j{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}}class Le extends j{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}}class Ue extends j{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=C(this,e,t,0)??h)===S)return;const i=this._$AH,s=e===h&&i!==h||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==h&&(i===h||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class Me{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){C(this,e)}}const V=L.litHtmlPolyfillSupport;V==null||V(N,H),(L.litHtmlVersions??(L.litHtmlVersions=[])).push("3.3.0");const Ne=(o,e,t)=>{const i=(t==null?void 0:t.renderBefore)??e;let s=i._$litPart$;if(s===void 0){const r=(t==null?void 0:t.renderBefore)??null;i._$litPart$=s=new H(e.insertBefore(U(),r),r,void 0,t??{})}return s._$AI(o),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const x=globalThis;class A extends E{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ne(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return S}}var pe;A._$litElement$=!0,A.finalized=!0,(pe=x.litElementHydrateSupport)==null||pe.call(x,{LitElement:A});const G=x.litElementPolyfillSupport;G==null||G({LitElement:A});(x.litElementVersions??(x.litElementVersions=[])).push("4.2.0");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const X=o=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(o,e)}):customElements.define(o,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Re={attribute:!0,type:String,converter:I,reflect:!1,hasChanged:Y},He=(o=Re,e,t)=>{const{kind:i,metadata:s}=t;let r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),i==="setter"&&((o=Object.create(o)).wrapped=!0),r.set(t.name,o),i==="accessor"){const{name:n}=t;return{set(c){const a=e.get.call(this);e.set.call(this,c),this.requestUpdate(n,a,o)},init(c){return c!==void 0&&this.C(n,void 0,o,c),c}}}if(i==="setter"){const{name:n}=t;return function(c){const a=this[n];e.call(this,c),this.requestUpdate(n,a,o)}}throw Error("Unsupported decorator location: "+i)};function ee(o){return(e,t)=>typeof t=="object"?He(o,e,t):((i,s,r)=>{const n=s.hasOwnProperty(r);return s.constructor.createProperty(r,i),n?Object.getOwnPropertyDescriptor(s,r):void 0})(o,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function w(o){return ee({...o,state:!0,attribute:!1})}class ze extends EventTarget{constructor(e){super(),this.ws=null,this.reconnectTimeout=null,this.reconnectAttempts=0,this.maxReconnectAttempts=5,this.reconnectDelay=1e3,e&&(this.url=e),this.connect()}async getWebSocketUrl(){var t;let e;if(window.__TAURI__){const i=(t=window.__TAURI__.core)==null?void 0:t.invoke;try{return e=await i("get_websocket_url"),this.url=e,e}catch(s){throw console.error("Failed to get WebSocket URL from Tauri backend:",s),s}}else{const i=window.location.protocol==="https:"?"wss:":"ws:",s=window.location.host;return e=`${i}//${s}/ws`,this.url=e,e}}async connect(){try{this.ws=new WebSocket(await this.getWebSocketUrl()),this.ws.onopen=()=>{console.log("WebSocket connected"),this.reconnectAttempts=0,this.dispatchEvent(new CustomEvent("connected"))},this.ws.onmessage=e=>{try{const t=JSON.parse(e.data);this.dispatchEvent(new CustomEvent("message",{detail:t}))}catch(t){console.error("Error parsing WebSocket message:",t)}},this.ws.onclose=()=>{console.log("WebSocket disconnected"),this.dispatchEvent(new CustomEvent("disconnected")),this.scheduleReconnect()},this.ws.onerror=e=>{console.error("WebSocket error:",e),this.dispatchEvent(new CustomEvent("error",{detail:e}))}}catch(e){console.error("Failed to create WebSocket connection:",e),this.scheduleReconnect()}}scheduleReconnect(){this.reconnectAttempts<this.maxReconnectAttempts&&(this.reconnectTimeout=window.setTimeout(()=>{this.reconnectAttempts++,console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`),this.connect()},this.reconnectDelay*Math.pow(2,this.reconnectAttempts)))}sendMessage(e){return new Promise((t,i)=>{if(!this.ws||this.ws.readyState!==WebSocket.OPEN){i(new Error("WebSocket is not connected"));return}const s=r=>{const c=r.detail;c.action===e.action&&(this.removeEventListener("message",s),t(c))};this.addEventListener("message",s);try{this.ws.send(JSON.stringify(e))}catch(r){this.removeEventListener("message",s),i(r)}setTimeout(()=>{this.removeEventListener("message",s),i(new Error("Request timeout"))},1e4)})}async createWindow(e,t,i=!1,s=!1){return this.sendMessage({action:"create_window",label:e,url:t,transparent:i,always_on_top:s})}async closeWindow(e){return this.sendMessage({action:"close_window",label:e})}async focusWindow(e){return this.sendMessage({action:"focus_window",label:e})}async listWindows(){return this.sendMessage({action:"list_windows"})}async getWindowInfo(e){return this.sendMessage({action:"get_window_info",label:e})}async reloadWindow(e){return this.sendMessage({action:"reload_window",label:e})}async navigateWindow(e,t){return this.sendMessage({action:"navigate_window",label:e,url:t})}async toggleTransparency(e){return this.sendMessage({action:"toggle_transparency",label:e})}async toggleAlwaysOnTop(e){return this.sendMessage({action:"toggle_always_on_top",label:e})}async setAlwaysOnTop(e,t){return this.sendMessage({action:"set_always_on_top",label:e,always_on_top:t})}async ping(){return this.sendMessage({action:"ping"})}isConnected(){var e;return((e=this.ws)==null?void 0:e.readyState)===WebSocket.OPEN}disconnect(){this.reconnectTimeout&&(clearTimeout(this.reconnectTimeout),this.reconnectTimeout=null),this.ws&&(this.ws.close(),this.ws=null)}getUrl(){return this.url}async createAdvancedWindow(e){return this.createWindow(e.label,e.url,e.transparent??!1,e.alwaysOnTop??!1)}async getAllWindowsInfo(){var t;const e=await this.listWindows();return e.success&&((t=e.data)!=null&&t.windows)?e.data.windows:[]}async windowExists(e){try{return(await this.getWindowInfo(e)).success}catch{return!1}}async closeAllWindows(){const t=(await this.getAllWindowsInfo()).map(i=>this.closeWindow(i.label));await Promise.allSettled(t)}onWindowEvent(e,t){this.addEventListener(e,t)}offWindowEvent(e,t){this.removeEventListener(e,t)}}var De=Object.defineProperty,Ie=Object.getOwnPropertyDescriptor,O=(o,e,t,i)=>{for(var s=i>1?void 0:i?Ie(e,t):e,r=o.length-1,n;r>=0;r--)(n=o[r])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&De(e,t,s),s};let y=class extends A{constructor(){super(...arguments),this.label="",this.url="",this.isLoading=!1,this.transparent=!1,this.alwaysOnTop=!1,this.quickUrls=[{label:"Google",url:"https://www.google.com"},{label:"GitHub",url:"https://github.com"},{label:"YouTube",url:"https://www.youtube.com"},{label:"Stack Overflow",url:"https://stackoverflow.com"},{label:"MDN",url:"https://developer.mozilla.org"}]}handleSubmit(o){o.preventDefault(),!(!this.label.trim()||!this.url.trim())&&this.isValidUrl(this.url)&&(this.isLoading=!0,this.dispatchEvent(new CustomEvent("create-window",{detail:{label:this.label.trim(),url:this.url.trim(),transparent:this.transparent,alwaysOnTop:this.alwaysOnTop},bubbles:!0})))}handleReset(){this.label="",this.url="",this.transparent=!1,this.alwaysOnTop=!1}handleQuickUrl(o){this.url=o}isValidUrl(o){try{return new URL(o),!0}catch{return!1}}setLoading(o){this.isLoading=o}reset(){this.handleReset(),this.isLoading=!1}render(){const o=this.label.trim()&&this.url.trim()&&this.isValidUrl(this.url);return u`
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
            @input="${e=>this.label=e.target.value}"
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
            @input="${e=>this.url=e.target.value}"
            ?disabled="${this.isLoading}"
            required
          />
          <div class="form-help">
            The URL to load in the new window
          </div>
          
          <div class="quick-urls">
            <div class="quick-urls-title">Quick URLs:</div>
            <div class="quick-url-buttons">
              ${this.quickUrls.map(e=>u`
                <button
                  type="button"
                  class="quick-url-btn"
                  @click="${()=>this.handleQuickUrl(e.url)}"
                  ?disabled="${this.isLoading}"
                >
                  ${e.label}
                </button>
              `)}
            </div>
          </div>
          <div class="form-group">
            <div class="form-help">Window Options:</div>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input
                  id="transparent"
                  class="checkbox-input"
                  type="checkbox"
                  .checked="${this.transparent}"
                  @change="${e=>this.transparent=e.target.checked}"
                  ?disabled="${this.isLoading}"
                />
                <label class="checkbox-label" for="transparent">Transparent</label>
              </div>
              <div class="checkbox-item">
                <input
                  id="alwaysOnTop"
                  class="checkbox-input"
                  type="checkbox"
                  .checked="${this.alwaysOnTop}"
                  @change="${e=>this.alwaysOnTop=e.target.checked}"
                  ?disabled="${this.isLoading}"
                />
                <label class="checkbox-label" for="alwaysOnTop">Always On Top</label>
              </div>
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
            ${this.isLoading?u`
              <span class="loading-spinner"></span>
              Creating...
            `:"Create Window"}
          </button>
        </div>
      </form>
    `}};y.styles=Q`
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
    .checkbox-group {
      display: flex;
      gap: 16px;
      margin-top: 12px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .checkbox-input {
      width: 16px;
      height: 16px;
      accent-color: var(--primary-color);
    }

    .checkbox-label {
      font-size: 14px;
      color: var(--text-primary);
      cursor: pointer;
    }

  `;O([w()],y.prototype,"label",2);O([w()],y.prototype,"url",2);O([w()],y.prototype,"isLoading",2);O([w()],y.prototype,"transparent",2);O([w()],y.prototype,"alwaysOnTop",2);y=O([X("create-window-form")],y);var qe=Object.defineProperty,je=Object.getOwnPropertyDescriptor,te=(o,e,t,i)=>{for(var s=i>1?void 0:i?je(e,t):e,r=o.length-1,n;r>=0;r--)(n=o[r])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&qe(e,t,s),s};let R=class extends A{constructor(){super(...arguments),this.selected=!1}willUpdate(o){o.has("window")&&this.requestUpdate()}formatDate(o){return new Date(o*1e3).toLocaleString()}handleFocus(){this.dispatchEvent(new CustomEvent("focus-window",{detail:{label:this.window.label},bubbles:!0}))}handleClose(){this.dispatchEvent(new CustomEvent("close-window",{detail:{label:this.window.label},bubbles:!0}))}handleGetInfo(){this.dispatchEvent(new CustomEvent("get-window-info",{detail:{label:this.window.label},bubbles:!0}))}handleClick(){this.dispatchEvent(new CustomEvent("select-window",{detail:{label:this.window.label},bubbles:!0}))}handleToggleTransparency(){this.dispatchEvent(new CustomEvent("toggle-transparency",{detail:{label:this.window.label},bubbles:!0}))}handleToggleAlwaysOnTop(){this.dispatchEvent(new CustomEvent("toggle-always-on-top",{detail:{label:this.window.label},bubbles:!0}))}render(){const o=["window-item",this.selected?"selected":"",this.window.is_focused?"focused":""].filter(Boolean).join(" ");return u`
      <div class="${o}" @click="${this.handleClick}">
        ${this.window.is_focused?u`<div class="focused-indicator"></div>`:""}
        
        <div class="window-header">
          <h3 class="window-title">${this.window.title}</h3>
          <div class="window-status">
            <span class="status-badge ${this.window.is_visible?"status-visible":"status-hidden"}">
              ${this.window.is_visible?"Visible":"Hidden"}
            </span>
            ${this.window.is_focused?u`
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
          <div class="window-properties">
            <strong>Properties:</strong> 
            ${this.window.is_transparent?"Transparent":"Opaque"}
            ${this.window.is_always_on_top?" • Always On Top":""}
          </div>
        </div>

        <div class="window-actions">
          <button class="btn btn-info" @click="${this.handleGetInfo}" title="Get Info">
            Info
          </button>
          <button 
            class="btn ${this.window.is_transparent?"btn-warning":"btn-secondary"}" 
            @click="${this.handleToggleTransparency}" 
            title="Toggle Transparency"
          >
            ${this.window.is_transparent?"Opaque":"Transparent"}
          </button>
          <button 
            class="btn ${this.window.is_always_on_top?"btn-warning":"btn-secondary"}" 
            @click="${this.handleToggleAlwaysOnTop}" 
            title="Toggle Always On Top"
          >
            ${this.window.is_always_on_top?"Normal":"On Top"}
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
    .btn-warning {
      background: var(--warning-color);
      color: var(--text-dark);
    }

    .btn-warning:hover {
      background: #e0a800;
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
  `;te([ee({type:Object})],R.prototype,"window",2);te([ee({type:Boolean})],R.prototype,"selected",2);R=te([X("window-item")],R);var Fe=Object.defineProperty,Be=Object.getOwnPropertyDescriptor,T=(o,e,t,i)=>{for(var s=i>1?void 0:i?Be(e,t):e,r=o.length-1,n;r>=0;r--)(n=o[r])&&(s=(i?n(e,t,s):n(s))||s);return i&&s&&Fe(e,t,s),s};let v=class extends A{constructor(){super(...arguments),this.wsService=null,this.windows=[],this.isLoading=!0,this.isConnected=!1,this.notification=null}connectedCallback(){super.connectedCallback(),this.initializeWebSocket()}disconnectedCallback(){var o;super.disconnectedCallback(),(o=this.wsService)==null||o.disconnect()}initializeWebSocket(){this.wsService=new ze("ws://127.0.0.1:8080/ws"),this.wsService.addEventListener("connected",()=>{this.isConnected=!0,this.showNotification("success","Connected to WebSocket server."),this.fetchWindowList()}),this.wsService.addEventListener("disconnected",()=>{this.isConnected=!1,this.isLoading=!0,this.showNotification("error","Disconnected. Trying to reconnect...")}),this.wsService.addEventListener("message",o=>{o.detail.action==="window_update"&&(console.log("Received window update broadcast, refreshing list..."),this.fetchWindowList())})}async fetchWindowList(){var o;if(!(!this.wsService||!this.isConnected)){this.isLoading=!0;try{const e=await this.wsService.listWindows();e.success&&((o=e.data)!=null&&o.windows)?this.windows=e.data.windows:(this.showNotification("error",e.message||"Failed to fetch window list."),this.windows=[])}catch(e){this.showNotification("error",`Error fetching windows: ${e.message}`)}finally{this.isLoading=!1}}}async handleCreateWindow(o){var r,n,c,a;const{label:e,url:t,transparent:i,alwaysOnTop:s}=o.detail;this.createWindowForm=o.target;try{const l=await((r=this.wsService)==null?void 0:r.createWindow(e,t,i,s));l!=null&&l.success?(this.showNotification("success",`Window "${e}" created successfully.`),(n=this.createWindowForm)==null||n.reset(),this.fetchWindowList()):(this.showNotification("error",(l==null?void 0:l.message)||"Failed to create window."),(c=this.createWindowForm)==null||c.setLoading(!1))}catch(l){this.showNotification("error",`Error: ${l.message}`),(a=this.createWindowForm)==null||a.setLoading(!1)}}async handleWindowAction(o){const{label:e}=o.detail,t=o.type;if(!this.wsService)return;let i;switch(t){case"close-window":i=this.wsService.closeWindow(e);break;case"focus-window":i=this.wsService.focusWindow(e);break;case"get-window-info":i=this.wsService.getWindowInfo(e);break;case"toggle-transparency":i=this.wsService.toggleTransparency(e);break;case"toggle-always-on-top":i=this.wsService.toggleAlwaysOnTop(e);break}if(i)try{const s=await i;s.success?(this.showNotification("success",s.message),t==="get-window-info"&&console.log("Window Info:",s.data)):this.showNotification("error",s.message)}catch(s){this.showNotification("error",`Action failed: ${s.message}`)}finally{this.fetchWindowList()}}showNotification(o,e){this.notification={type:o,message:e},setTimeout(()=>{this.notification=null},5e3)}render(){return u`
      <div class="header">
        <h1 class="title">Tauri Window Manager</h1>
        <div class="status">
          <div class="status-indicator ${this.isConnected?"connected":""}"></div>
          <span>${this.isConnected?"Connected":"Disconnected"}</span>
        </div>
      </div>
      
      ${this.notification?u`
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
        ${this.isLoading&&this.windows.length===0?u`<div class="no-windows">Loading windows...</div>`:this.windows.length>0?this.windows.map(o=>u`
                <window-item 
                  .window=${o}
                  @close-window=${this.handleWindowAction}
                  @focus-window=${this.handleWindowAction}
                  @get-window-info=${this.handleWindowAction}
                  @toggle-transparency=${this.handleWindowAction}
                  @toggle-always-on-top=${this.handleWindowAction}
                ></window-item>
              `):u`<div class="no-windows">No windows have been created yet.</div>`}
      </div>
    `}};v.styles=Q`
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
`;T([w()],v.prototype,"wsService",2);T([w()],v.prototype,"windows",2);T([w()],v.prototype,"isLoading",2);T([w()],v.prototype,"isConnected",2);T([w()],v.prototype,"notification",2);v=T([X("window-manager-app")],v);
