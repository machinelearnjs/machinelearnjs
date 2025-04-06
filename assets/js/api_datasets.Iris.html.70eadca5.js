"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[6135],{5884:(t,s,a)=>{a.r(s),a.d(s,{comp:()=>r,data:()=>d});var n=a(2288);const e={},r=(0,a(7433).A)(e,[["render",function(t,s){return(0,n.uX)(),(0,n.CE)("div",null,s[0]||(s[0]=[(0,n.Fv)('<h1 id="datasets-iris" tabindex="-1"><a class="header-anchor" href="#datasets-iris"><span>datasets.Iris</span></a></h1><h3 id="usage" tabindex="-1"><a class="header-anchor" href="#usage"><span>Usage</span></a></h3><div class="language-typescript line-numbers-mode" data-highlighter="prismjs" data-ext="ts"><pre><code><span class="line"><span class="token keyword">import</span> <span class="token punctuation">{</span> Iris <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;machinelearn/datasets&#39;</span><span class="token punctuation">;</span></span>\n<span class="line"></span>\n<span class="line"><span class="token punctuation">(</span><span class="token keyword">async</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>\n<span class="line">  <span class="token keyword">const</span> irisData <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Iris</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>\n<span class="line">  <span class="token keyword">const</span> <span class="token punctuation">{</span></span>\n<span class="line">    data<span class="token punctuation">,</span>         <span class="token comment">// returns the iris data (X)</span></span>\n<span class="line">    targets<span class="token punctuation">,</span>      <span class="token comment">// list of target values (y)</span></span>\n<span class="line">    labels<span class="token punctuation">,</span>       <span class="token comment">// list of labels</span></span>\n<span class="line">    targetNames<span class="token punctuation">,</span>  <span class="token comment">// list of short target labels</span></span>\n<span class="line">    description   <span class="token comment">// dataset description</span></span>\n<span class="line">  <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token keyword">await</span> irisData<span class="token punctuation">.</span><span class="token function">load</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// loads the data internally</span></span>\n<span class="line"><span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>\n<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="constructors" tabindex="-1"><a class="header-anchor" href="#constructors"><span>Constructors</span></a></h3><ul><li><a href="#constructor">constructor</a></li></ul><h3 id="methods" tabindex="-1"><a class="header-anchor" href="#methods"><span>Methods</span></a></h3><ul><li><p><a href="#%CE%BB-fsload">fsLoad</a></p></li><li><p><a href="#%CE%BB-load">load</a></p></li></ul><h1 id="constructors-1" tabindex="-1"><a class="header-anchor" href="#constructors-1"><span>Constructors</span></a></h1><hr><h3 id="constructor" tabindex="-1"><a class="header-anchor" href="#constructor"><span>constructor</span></a></h3><p>⊕ <strong>Iris</strong>()</p><p>Defined in</p><p><strong>Parameters:</strong></p><table><thead><tr><th>Param</th><th>Type</th><th>Default</th><th>Description</th></tr></thead></table><p><strong>Returns:</strong> Iris</p><h1 id="methods-1" tabindex="-1"><a class="header-anchor" href="#methods-1"><span>Methods</span></a></h1><hr><h3 id="λ-fsload" tabindex="-1"><a class="header-anchor" href="#λ-fsload"><span>λ fsLoad</span></a></h3><p>Load data from the local data folder</p><p>Defined in <a href="https://github.com/machinelearnjs/machinelearnjs/blob/master/src/lib/datasets/BaseDataset.ts#L65" target="_blank" rel="noopener noreferrer">datasets/BaseDataset.ts:65</a></p><p><strong>Parameters:</strong></p><table><thead><tr><th>Param</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody><tr><td>type</td><td>string</td><td></td><td></td></tr><tr><td>options.delimiter</td><td>string</td><td>&#39;,&#39;</td><td></td></tr><tr><td>options.lastIsTarget</td><td></td><td>true</td><td></td></tr><tr><td>options.targetType</td><td>string</td><td>&#39;float&#39;</td><td></td></tr><tr><td>options.trainType</td><td>string</td><td>&#39;float&#39;</td><td></td></tr></tbody></table><p><strong>Returns:</strong></p><p>🤘 Promise</p><table><thead><tr><th>Param</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td>data</td><td>any</td><td>undefined</td></tr><tr><td>labels</td><td>any</td><td>undefined</td></tr><tr><td>targets</td><td>any</td><td>undefined</td></tr></tbody></table><h3 id="λ-load" tabindex="-1"><a class="header-anchor" href="#λ-load"><span>λ load</span></a></h3><p>Load datasets</p><p>Defined in <a href="https://github.com/machinelearnjs/machinelearnjs/blob/master/src/lib/datasets/Iris.ts#L38" target="_blank" rel="noopener noreferrer">datasets/Iris.ts:38</a></p><p><strong>Returns:</strong></p><p>🤘 Promise</p><table><thead><tr><th>Param</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td>data</td><td>any[][]</td><td>Training data</td></tr><tr><td>description</td><td>string</td><td>Dataset description</td></tr><tr><td>labels</td><td>string[]</td><td>Real labels</td></tr><tr><td>targetNames</td><td>string[]</td><td>Short labels</td></tr><tr><td>targets</td><td>any[]</td><td>Target data</td></tr></tbody></table>',31)]))}]]),d=JSON.parse('{"path":"/api/datasets.Iris.html","title":"datasets.Iris","lang":"en-US","frontmatter":{},"headers":[{"level":3,"title":"Usage","slug":"usage","link":"#usage","children":[]},{"level":3,"title":"Constructors","slug":"constructors","link":"#constructors","children":[]},{"level":3,"title":"Methods","slug":"methods","link":"#methods","children":[]},{"level":3,"title":"constructor","slug":"constructor","link":"#constructor","children":[]},{"level":3,"title":"λ fsLoad","slug":"λ-fsload","link":"#λ-fsload","children":[]},{"level":3,"title":"λ load","slug":"λ-load","link":"#λ-load","children":[]}],"git":{},"filePathRelative":"api/datasets.Iris.md"}')}}]);