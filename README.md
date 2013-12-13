# Annotations
An extension to add annotation support to MathJax. It is your job to decide how to render the annotations.

### Example usage:

    \newcommand{\R}{\mathbb R}
    \Annotate[text]{the real numbers}
    \Annotate[defn]{http://your-site.org/lesson1/the-real-number-line}
    
    \newcommand{\space}[1]{#1}
    \Annotate[text]{\(#1\) is a topological space}
    \Annotate[pict]{http://your-site.org/img/space-example.jpg}
    
    
More documentation to come soon...