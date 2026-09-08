/*!
 * Bubble effect vendored from Canvas UI — https://github.com/DavidHDev/canvas-ui
 * (c) David Haz. MIT + Commons Clause. Used unmodified except for TypeScript
 * type-stripping and IIFE wrapping. Source: src/lib/Bubble/BubbleVanilla.ts +
 * src/lib/rect-cache.ts. Rebuild: see _templates/canvas-ui/build.sh
 * Exposes window.CanvasUIBubble = { createBubble, supportsHtmlInCanvas }.
 */
var CanvasUIBubble=(()=>{var $=Object.defineProperty;var be=Object.getOwnPropertyDescriptor;var ge=Object.getOwnPropertyNames;var Ee=Object.prototype.hasOwnProperty;var xe=(c,u)=>{for(var t in u)$(c,t,{get:u[t],enumerable:!0})},Te=(c,u,t,s)=>{if(u&&typeof u=="object"||typeof u=="function")for(let f of ge(u))!Ee.call(c,f)&&f!==t&&$(c,f,{get:()=>u[f],enumerable:!(s=be(u,f))||s.enumerable});return c};var Re=c=>Te($({},"__esModule",{value:!0}),c);var De={};xe(De,{createBubble:()=>Ae,createRectCache:()=>me,supportsHtmlInCanvas:()=>Se});function me(c){let u=c.getBoundingClientRect(),t=()=>{u=c.getBoundingClientRect()},s=new ResizeObserver(t);return s.observe(c),window.addEventListener("resize",t,{passive:!0}),window.addEventListener("scroll",t,{capture:!0,passive:!0}),{get current(){return u},destroy(){s.disconnect(),window.removeEventListener("resize",t),window.removeEventListener("scroll",t,!0)}}}var Me={size:30,trail:24,follow:.5,blend:14,speed:2,refraction:80,dispersion:1,frost:0,shine:.25,rim:.5,iridescence:1,intensity:.9,tint:[1,1,1],tintStrength:0,colorA:[.2902,.4549,.7216],colorB:[.4118,.4118,.4157],fallbackOpacity:1},b=24,ye=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
void main () {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,Ce=`#version 300 es
precision highp float;
out vec4 outColor;
uniform sampler2D uContent;
uniform vec2 uResolution;
uniform float uMaxX;
uniform float uDpr;
uniform float uTime;
uniform float uHasContent;
uniform int uCount;
uniform vec2 uTrail[${b}];
uniform float uBaseRadius;
uniform float uBlend;
uniform float uRefraction;
uniform float uDispersion;
uniform float uFrost;
uniform float uShine;
uniform float uRim;
uniform float uIridescence;
uniform float uIntensity;
uniform vec3 uTint;
uniform float uTintStrength;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uFallbackAlpha;

const float EPS = 1e-4;
const int ITR = 16;

vec3 page (vec2 px, float lod) {
  vec2 uv = px / uResolution;
  uv.x = clamp(uv.x, 0.0005, uMaxX - 0.0005);
  uv.y = clamp(uv.y, 0.0005, 0.9995);
  return pow(textureLod(uContent, vec2(uv.x, 1.0 - uv.y), lod).rgb, vec3(2.2));
}

float rnd3D (vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453123);
}

float noise3D (vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);

  float a000 = rnd3D(i);
  float a100 = rnd3D(i + vec3(1.0, 0.0, 0.0));
  float a010 = rnd3D(i + vec3(0.0, 1.0, 0.0));
  float a110 = rnd3D(i + vec3(1.0, 1.0, 0.0));
  float a001 = rnd3D(i + vec3(0.0, 0.0, 1.0));
  float a101 = rnd3D(i + vec3(1.0, 0.0, 1.0));
  float a011 = rnd3D(i + vec3(0.0, 1.0, 1.0));
  float a111 = rnd3D(i + vec3(1.0, 1.0, 1.0));

  vec3 u = f * f * (3.0 - 2.0 * f);

  float k0 = a000;
  float k1 = a100 - a000;
  float k2 = a010 - a000;
  float k3 = a001 - a000;
  float k4 = a000 - a100 - a010 + a110;
  float k5 = a000 - a010 - a001 + a011;
  float k6 = a000 - a100 - a001 + a101;
  float k7 = -a000 + a100 + a010 - a110 + a001 - a101 - a011 + a111;

  return k0 + k1 * u.x + k2 * u.y + k3 * u.z + k4 * u.x * u.y +
    k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z;
}

float smoothMin (float d1, float d2, float k) {
  float h = exp(-k * d1) + exp(-k * d2);
  return -log(max(h, 1e-12)) / k;
}

float map (vec3 p) {
  float radius = uBaseRadius * float(uCount);
  float d = 1e5;
  for (int i = 0; i < ${b}; i++) {
    if (i >= uCount) break;
    float sphere = length(p - vec3(uTrail[i], 0.0)) -
      (radius - uBaseRadius * float(i));
    d = smoothMin(d, sphere, uBlend);
  }
  return d;
}

vec3 generateNormal (vec3 p) {
  return normalize(vec3(
    map(p + vec3(EPS, 0.0, 0.0)) - map(p + vec3(-EPS, 0.0, 0.0)),
    map(p + vec3(0.0, EPS, 0.0)) - map(p + vec3(0.0, -EPS, 0.0)),
    map(p + vec3(0.0, 0.0, EPS)) - map(p + vec3(0.0, 0.0, -EPS))));
}

vec3 dropletColor (vec3 normal, vec3 rayDir) {
  vec3 reflectDir = reflect(rayDir, normal);
  float noisePosTime = noise3D(reflectDir * 2.0 + uTime);
  float noiseNegTime = noise3D(reflectDir * 2.0 - uTime);
  vec3 color0 = uColorA * noisePosTime;
  vec3 color1 = uColorB * noiseNegTime;
  return (color0 + color1) * uIntensity;
}

void main () {
  vec2 frag = gl_FragCoord.xy;
  float minRes = min(uResolution.x, uResolution.y);
  vec2 p = (frag * 2.0 - uResolution) / minRes;

  vec3 ray = vec3(p, 1.0);
  vec3 rayDir = vec3(0.0, 0.0, -1.0);
  float dist = 0.0;

  for (int i = 0; i < ITR; ++i) {
    dist = map(ray);
    ray += rayDir * dist;
    if (dist < EPS || dist > 8.0) break;
  }

  float cov = 1.0 - smoothstep(0.0, 3.0 / minRes, dist);
  if (!(cov > 0.001)) {
    outColor = vec4(0.0);
    return;
  }

  vec3 n = generateNormal(ray);
  vec3 glints = pow(max(dropletColor(n, rayDir), 0.0), vec3(7.0));
  vec3 L = normalize(vec3(-0.5, 0.7, 0.6));
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 60.0);

  vec3 color;
  float alpha = cov;
  if (uHasContent > 0.5) {
    float depth = uRefraction * uDpr;
    float ca = uDispersion * 0.03;
    vec3 rvR = refract(rayDir, n, 1.0 / (1.33 - ca));
    vec3 rvG = refract(rayDir, n, 1.0 / 1.33);
    vec3 rvB = refract(rayDir, n, 1.0 / (1.33 + ca));
    vec2 offR = rvR.xy * (depth / max(abs(rvR.z), 0.35));
    vec2 offG = rvG.xy * (depth / max(abs(rvG.z), 0.35));
    vec2 offB = rvB.xy * (depth / max(abs(rvB.z), 0.35));
    float lod = max(uFrost * 5.0, log2(1.0 + length(offG) * 0.05 / uDpr));
    vec3 refr = vec3(
      page(frag + offR, lod).r,
      page(frag + offG, lod).g,
      page(frag + offB, lod).b);
    refr *= mix(vec3(1.0), uTint, clamp(uTintStrength, 0.0, 1.0));
    float edge = pow(1.0 - clamp(n.z, 0.0, 1.0), 1.5);
    refr *= 1.0 - 0.35 * uRim * edge;
    color = pow(max(refr, 0.0), vec3(1.0 / 2.2));
    color += glints * uIridescence;
    color += vec3(spec * uShine * 0.9);
  } else {
    float edge = pow(1.0 - clamp(n.z, 0.0, 1.0), 1.5);
    vec3 filmTint = mix(vec3(0.9), uTint, clamp(uTintStrength, 0.0, 1.0));
    float fade = cov * clamp(uFallbackAlpha, 0.0, 1.0);
    vec3 light = glints * uIridescence * 0.65 + vec3(spec * uShine * 1.5) +
      filmTint * (0.55 * max(uRim, 0.4) * edge + 0.03);
    float a = fade * clamp(0.08 + 0.4 * edge, 0.0, 1.0);
    outColor = vec4(light * fade, a);
    return;
  }
  outColor = vec4(color * alpha, alpha);
}`;function Se(){if(typeof document=="undefined")return!1;let c=document.createElement("canvas"),u=c.getContext("2d");return!!(u&&typeof u.drawElementImage=="function"&&typeof c.requestPaint=="function")}function Ae(c,u={}){let t={...Me,...u},{source:s,content:f,output:r}=c,e=r.getContext("webgl2",{alpha:!0,depth:!1,stencil:!1,antialias:!1,premultipliedAlpha:!0});if(!e||e.isContextLost())return null;let I=s.getContext("2d"),P=s,C=!!(I&&typeof I.drawElementImage=="function"&&typeof P.requestPaint=="function"),S=!1,Q=()=>{};C&&(P.onpaint=()=>{try{I.reset(),I.drawElementImage(f,0,0),S=!0,Q()}catch{}});function J(n,o){let i=e.createShader(n);return e.shaderSource(i,o),e.compileShader(i),e.getShaderParameter(i,e.COMPILE_STATUS)||console.error("Bubble shader error:",e.getShaderInfoLog(i)),i}let K=J(e.VERTEX_SHADER,ye),Z=J(e.FRAGMENT_SHADER,Ce),d=e.createProgram();e.attachShader(d,K),e.attachShader(d,Z),e.linkProgram(d);let a={},de=e.getProgramParameter(d,e.ACTIVE_UNIFORMS);for(let n=0;n<de;n++){let o=e.getActiveUniform(d,n);a[o.name]=e.getUniformLocation(d,o.name)}let ee=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,ee),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let _=e.createTexture();e.bindTexture(e.TEXTURE_2D,_),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),e.generateMipmap(e.TEXTURE_2D);let te=1;function X(){let n=Math.min(window.devicePixelRatio||1,2),o=Math.max(1,Math.round(r.clientWidth*n)),i=Math.max(1,Math.round(r.clientHeight*n));if((r.width!==o||r.height!==i)&&(r.width=o,r.height=i),te=Math.min(1,Math.max(.05,f.clientWidth/Math.max(r.clientWidth,1))),C){let p=Math.max(1,Math.round(s.clientWidth*n)),R=Math.max(1,Math.round(s.clientHeight*n));(s.width!==p||s.height!==R)&&(s.width=p,s.height=R),P.requestPaint()}}X();function he(){!C||!S||(S=!1,e.bindTexture(e.TEXTURE_2D,_),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,s),e.generateMipmap(e.TEXTURE_2D))}let h=new Float32Array(b),v=new Float32Array(b),O=new Float32Array(b*2),g=r.clientWidth/2,E=r.clientHeight/2,A=g,D=E;h.fill(g),v.fill(E);let x=0,T=0,z=!1,ne=0;function ve(){return Math.min(Math.max(Math.round(t.trail),1),b)}function pe(){he();let n=r.width/Math.max(r.clientWidth,1);if(e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,r.width,r.height),e.disable(e.SCISSOR_TEST),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),x<=.004)return;let o=ve(),i=Math.min(r.width,r.height),p=Math.max(t.size,4)*n*x,R=p*2/(i*o),M=Math.max(t.blend,.5),B=1/0,l=1/0,Y=-1/0,q=-1/0;for(let y=0;y<o;y++){let V=h[y]*n,j=r.height-v[y]*n;O[y*2]=(V*2-r.width)/i,O[y*2+1]=(j*2-r.height)/i,B=Math.min(B,V),Y=Math.max(Y,V),l=Math.min(l,j),q=Math.max(q,j)}let U=p+Math.log(o+1)/M*i/2+Math.abs(t.refraction)*n*.5+32*n,se=Math.max(0,Math.floor(B-U)),fe=Math.max(0,Math.floor(l-U));e.enable(e.SCISSOR_TEST),e.scissor(se,fe,Math.min(r.width-se,Math.ceil(Y-B+U*2)),Math.min(r.height-fe,Math.ceil(q-l+U*2))),e.useProgram(d),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,_),e.uniform1i(a.uContent,0),e.uniform2f(a.uResolution,r.width,r.height),e.uniform1f(a.uMaxX,te),e.uniform1f(a.uDpr,n),e.uniform1f(a.uTime,ne),e.uniform1f(a.uHasContent,C?1:0),e.uniform1i(a.uCount,o),e.uniform2fv(a["uTrail[0]"],O),e.uniform1f(a.uBaseRadius,R),e.uniform1f(a.uBlend,M),e.uniform1f(a.uRefraction,t.refraction),e.uniform1f(a.uDispersion,Math.max(t.dispersion,0)),e.uniform1f(a.uFrost,Math.min(Math.max(t.frost,0),1)),e.uniform1f(a.uShine,Math.max(t.shine,0)),e.uniform1f(a.uRim,Math.min(Math.max(t.rim,0),2)),e.uniform1f(a.uIridescence,Math.max(t.iridescence,0)),e.uniform1f(a.uIntensity,Math.max(t.intensity,0)),e.uniform3f(a.uTint,t.tint[0],t.tint[1],t.tint[2]),e.uniform1f(a.uTintStrength,Math.min(Math.max(t.tintStrength,0),1)),e.uniform3f(a.uColorA,t.colorA[0],t.colorA[1],t.colorA[2]),e.uniform3f(a.uColorB,t.colorB[0],t.colorB[1],t.colorB[2]),e.uniform1f(a.uFallbackAlpha,Math.min(Math.max(t.fallbackOpacity,0),1)),e.drawArrays(e.TRIANGLE_STRIP,0,4),e.disable(e.SCISSOR_TEST)}let G=0,H=performance.now(),N=!1,L=!1,k=!0,F=window.matchMedia("(prefers-reduced-motion: reduce)"),w=F.matches;function re(n){if(N)return;if(!k){L=!1;return}let o=Math.min((n-H)/1e3,1/30);H=n,w||(ne+=o*Math.max(t.speed,0));let i=Math.min(Math.max(t.follow,.02),1),p=w||i>=1?1:1-Math.exp(-o*(3+i*30)),R=w?1:1-Math.exp(-o*10);g+=(A-g)*p,E+=(D-E)*p;for(let l=b-1;l>0;l--)h[l]=h[l-1],v[l]=v[l-1];h[0]=g,v[0]=E;let M=Math.abs(A-g)+Math.abs(D-E);for(let l=1;l<b;l++)M=Math.max(M,Math.abs(h[l]-h[l-1])+Math.abs(v[l]-v[l-1]));if(x+=(T-x)*R,pe(),w?M<.1&&Math.abs(T-x)<.002&&!S:x<.004&&T===0&&!S){x=T,L=!1;return}G=requestAnimationFrame(re)}function m(){N||L||!k||(L=!0,H=performance.now(),G=requestAnimationFrame(re))}Q=m,m();let oe=me(r);function ae(n){let o=oe.current;A=n.clientX-o.left,D=n.clientY-o.top,z||(g=A,E=D,h.fill(A),v.fill(D),z=!0),T=1,m()}function ie(){T=0,z=!1,m()}f.addEventListener("pointermove",ae,{passive:!0}),f.addEventListener("pointerleave",ie,{passive:!0});function le(){m()}f.addEventListener("scroll",le,{passive:!0});function ue(){w=F.matches,m()}F.addEventListener("change",ue);let W=new ResizeObserver(()=>{X(),m()});W.observe(r),W.observe(f);let ce=new IntersectionObserver(n=>{var o,i;k=(i=(o=n[n.length-1])==null?void 0:o.isIntersecting)!=null?i:!0,k&&m()});return ce.observe(r),{setOptions(n){Object.entries(n).some(([o,i])=>t[o]!==i)&&(Object.assign(t,n),m())},resize(){X(),m()},destroy(){N=!0,oe.destroy(),cancelAnimationFrame(G),f.removeEventListener("pointermove",ae),f.removeEventListener("pointerleave",ie),f.removeEventListener("scroll",le),W.disconnect(),ce.disconnect(),F.removeEventListener("change",ue),e.deleteTexture(_),e.deleteProgram(d),e.deleteShader(K),e.deleteShader(Z),e.deleteBuffer(ee),C&&(P.onpaint=null)}}}return Re(De);})();
