// Generated by LiveScript 1.2.0
/*************************************************************
 *
 *  MathJax/extensions/TeX/annotations.js
 *
 *  Implements annotations for MathJax
 *  
 *  ---------------------------------------------------------------------
 *  
 *  Copyright (c) 2013 Yuri Sulyma <yuri@sulyma.ca>.
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
MathJax.Extension.annotations = {
  version: '0.8'
};
/* \Annotations command */
MathJax.Hub.Register.StartupHook("TeX Jax Ready", function(){
  var MML, TEX, TEXDEF, annotations;
  MML = MathJax.ElementJax.mml;
  TEX = MathJax.InputJax.TeX;
  TEXDEF = TEX.Definitions;
  annotations = TEX.Definitions.annotations = {};
  TEX.Definitions.macros.Annotate = 'Annotate';
  return TEX.Parse.Augment({
    ExpandMacro: function(name, macro, argcount, def){
      var args, optional, i$, i;
      if (argcount) {
        args = [];
        if (def != null) {
          optional = this.GetBrackets(name);
          args.push(optional != null ? optional : def);
        }
        for (i$ = args.length; i$ < argcount; ++i$) {
          i = i$;
          args.push(this.GetArgument(name));
        }
        macro = this.SubstituteArgs(args, macro);
      }
      return [macro, args];
    },
    Annotate: function(name){
      var type, cmd, annotation, macro, args;
      type = this.GetBrackets(name, '');
      cmd = this.GetArgument(name).match(/^\\(.+)$/)[1];
      annotation = this.GetArgument(name);
      if (!annotations.hasOwnProperty(cmd)) {
        annotations[cmd] = {};
        macro = TEX.Definitions.macros[cmd];
        if (macro == null) {
          return;
        }
        args = ['\\' + cmd].concat(macro.slice(1));
        TEX.Definitions.macros[cmd] = function(name){
          var ref$, str, params, math, mml, i$;
          ref$ = TEX.Parse('', {}).ExpandMacro.apply(this, args), str = ref$[0], params = ref$[1];
          math = TEX.Parse(str, this.stack.env).mml();
          mml = MML.semantics(math);
          for (i$ in annotations[cmd]) {
            (fn$.call(this, i$));
          }
          return this.Push(this.mmlToken(mml));
          function fn$(type){
            var annotation;
            annotation = this.SubstituteArgs(params, annotations[cmd][type]);
            mml.Append(MML.annotation(annotation).With({
              name: type
            }));
          }
        };
      }
      return annotations[cmd][type] = annotation;
    }
  });
});
/* output jaxes */
MathJax.Hub.Register.StartupHook("HTML-CSS Jax Ready", function(){
  var MML, MML_semantics_toHTML;
  MML = MathJax.ElementJax.mml;
  MML_semantics_toHTML = MML.semantics.prototype.toHTML;
  return MML.semantics.Augment({
    toHTML: function(span, HW, D){
      var i$, to$, i, d, attr;
      span = MML_semantics_toHTML.call(this, span, HW, D);
      for (i$ = 1, to$ = this.data.length; i$ < to$; ++i$) {
        i = i$;
        if ((d = this.data[i]) !== null && d.type === 'annotation') {
          attr = 'data-annotation' + (d['name'] ? "_" + d['name'] : '');
          span.setAttribute(attr, d.data[0]);
        }
      }
      return span;
    }
  });
});
MathJax.Hub.Register.StartupHook("SVG Jax Ready", function(){
  var MML, SVG, MML_semantics_toSVG;
  MML = MathJax.ElementJax.mml;
  SVG = MathJax.OutputJax.SVG;
  MML_semantics_toSVG = MML.semantics.prototype.toSVG;
  return MML.semantics.Augment({
    toSVG: function(){
      var svg, i$, to$, i, d, attr;
      this['class'] = 'semantics';
      svg = MML_semantics_toSVG.call(this);
      for (i$ = 1, to$ = this.data.length; i$ < to$; ++i$) {
        i = i$;
        if ((d = this.data[i]) !== null && d.type === 'annotation') {
          attr = 'data-annotation' + (d['name'] ? "_" + d['name'] : '');
          svg.element.setAttribute(attr, d.data[0]);
        }
      }
      SVG.addElement(svg.element, 'rect', {
        width: svg.w,
        height: svg.h + svg.d,
        y: -svg.d,
        fill: 'none',
        stroke: 'none',
        "pointer-events": 'all'
      });
      this.SVGsaveData(svg);
      this['class'] = null;
      return svg;
    }
  });
});
MathJax.Ajax.loadComplete(MathJaxRoot + "/annotations.js");