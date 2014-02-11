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

MathJax.Extension.annotations = {version: \0.9}

/* \Annotations command */
MathJax.Hub.Register.StartupHook "TeX Jax Ready" ->
  MML = MathJax.ElementJax.mml
  TEX = MathJax.InputJax.TeX
  TEXDEF = TEX.Definitions
  
  # register the \Annotate command
  TEXDEF.Add do
    macros:
      Annotate: \Annotate
    null
    true

  TEX.Parse.Augment do
    # expand macros without screwing up the string
    ExpandMacro: (name, macro, argcount, def) ->
      if argcount
        args = []
        if def?
          optional = @GetBrackets name
          args.push if optional? then optional else def

        for i from args.length til argcount
          args.push @GetArgument name
          
        macro = @SubstituteArgs args, macro

      [macro, args]
  
    #
    # Provide the \Annotate command
    #
    Annotate: (name) ->
      type = @GetBrackets name, ''
      cmd = @GetArgument name .match /^\\(.+)$/ .1
      annotation = @GetArgument name
      
      macro = @cs-find-macro cmd
      return unless macro?
      
      if !macro.annotations
      # redefine the command to include the annotations
        macro.annotations = {}
        
        args = ['\\' + cmd] ++ macro.slice 1

        @set-def cmd, (name) ->
          # get the original definition
          [str, params] = TEX.Parse '',{} .ExpandMacro.apply @, args
        
          # stick that into a <semantics> element
          math = TEX.Parse str, @stack.env .mml!
          mml = MML.semantics math
          
          # now, add the annotations...
          for let type of macro.annotations
            # expand
            annotation = @SubstituteArgs params, macro.annotations[type]
            mml.Append <| MML.annotation annotation .With {name: type}
          
          @Push @mml-token mml
      
      macro.annotations[type] = annotation


/* output jaxes */
MathJax.Hub.Register.StartupHook "HTML-CSS Jax Ready" ->
  MML = MathJax.ElementJax.mml
  
  MML_semantics_toHTML = MML.semantics::toHTML
  
  MML.semantics.Augment do
    toHTML: (span,HW,D) ->
      span = MML_semantics_toHTML.call(this,span,HW,D);
      
      # add the annotations
      for i from 1 til @data.length
        if (d = @data[i]) != null && d.type == \annotation
          attr = \data-annotation + if d['name'] then "_#{d['name']}" else ''
          span.set-attribute attr, d.data[0]
        
      span

MathJax.Hub.Register.StartupHook "SVG Jax Ready" ->
  MML = MathJax.ElementJax.mml
  SVG = MathJax.OutputJax.SVG
  
  MML_semantics_toSVG = MML.semantics::toSVG
  
  MML.semantics.Augment do
    toSVG: ->
      @class = \semantics
      svg = MML_semantics_toSVG.call @
      
      # add the annotations
      for i from 1 til @data.length
        if (d = @data[i]) != null && d.type == \annotation
          attr = \data-annotation + if d['name'] then "_#{d['name']}" else ''
          svg.element.set-attribute attr, d.data[0]

        
      # rectangular click region
      SVG.add-element do
        svg.element
        \rect
        {
          width: svg.w
          height: svg.h+svg.d
          y:-svg.d
          fill: \none
          stroke: \none
          "pointer-events": \all
        }
                                 
      @SVGsaveData svg
      
      # don't taint the object
      @class = null
      svg

MathJax.Ajax.load-complete "#{MathJaxRoot}/annotations.js"
