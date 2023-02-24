module.exports = grammar({
  name: 'pikchr',
  extras: $ => [$.comments, /\s/],
  precedences: $ => [
    ['nth'],
  ],
  rules: {
    source_file: $ => $._statementList,

    _statementList: $ => prec.right(choice(
      $.statement,
      seq($._statementList, $._NEWLINE, optional($.statement)),
      seq($._statementList, ";", optional($.statement)),
    )),

    // Non-terminals
    statement: $ => choice(
      $.objectDefinition,
      seq($.LABEL, ":", $.objectDefinition),
      seq($.LABEL, ":", $.place),
      $.direction,
      seq($.VARIABLE, $._assignmentOp, $.expr),
      field("macroDefinition", seq("define", field("macroName",$.VARIABLE), $.CODEBLOCK)),
      seq("print", $.printArgument, optional(repeat(seq(",", $.printArgument)))),
      seq("assert", "(", $.expr, "==", $.expr, ")"),
      seq("assert", "(", $.position, "==", $.position, ")"),
      $.macroCall,
    ),
    direction:         $ => choice("right", "down", "left", "up"),
    _assignmentOp:      $ => choice("=", "+=", "-=", "*=", "/="),
    printArgument:     $ => choice($.expr, $.STRING),
    objectDefinition:  $ => choice(
      seq($.objectClass, repeat($.attribute)),
      seq($.STRING, repeat($.textAttribute), repeat($.attribute)),
      seq("[", $._statementList, "]", repeat($.attribute)),
    ),
    objectClass:       $ => choice(
      "arc", "arrow", "box", "circle", "cylinder", "dot", "ellipse",
      "file", "line", "move", "oval", "spline", "text"
    ),
    attribute:         $ => prec.left(choice(
      seq($.STRING, repeat($.textAttribute)),
      $.pathAttribute,
      $.locationAttribute,
      "same",
      seq("same as", $.object),
      seq($.numericProperty, $.newPropertyValue),
      seq("dashed", optional($.expr)),
      seq("dotted", optional($.expr)),
      seq("color", $.colorExpr),
      seq("fill", $.colorExpr),
      seq("behind", $.object),
      "cw",
      "ccw",
      "<-",
      "->",
      "<->",
      choice("invis", "invisible"),
      "thick",
      "thin",
      "solid",
      "chop",
      "fit",
      $.macroCall,
    )),
    colorExpr:         $ => $.expr,
    newPropertyValue:  $ => choice($.expr, seq($.expr, "%")),
    numericProperty:   $ => choice("diameter", "ht", "height", "rad", "radius", "thickness", "width", "wid"),
    textAttribute:     $ => choice("above", "aligned", "below", "big", "bold", "center", "italic", "ljust", "rjust", "small"),
    pathAttribute:     $ => prec.left(choice(
      seq("from", $.position),
      seq(optional("then"), "to", $.position),
      seq(optional("then"), optional("go"), $.direction, optional($.lineLength)),
      seq(optional("then"), optional("go"), $.direction, optional("until"), "even", "with", $.position),
      seq(choice("then", "go"), optional($.lineLength), "heading", $.compassAngle),
      seq(choice("then", "go"), optional($.lineLength), $.compassDirection),
      "close"
    )),
    lineLength:        $ => choice($.expr, seq($.expr, "%")),
    compassAngle:      $ => $.expr,
    compassDirection:  $ => choice("n", "north", "ne", "e", "east", "se", "s", "south", "sw", "w", "west", "nw"),
    locationAttribute: $ => choice(
      seq("at", $.position),
      seq("with", $.edgename, "at", $.position),
      seq("with", $.dotEdgename, "at", $.position),
    ),
    position:          $ => choice(
      seq($.expr, ",", $.expr),
      $.place,
      seq($.place, "+", $.expr, ",", $.expr),
      seq($.place, "-", $.expr, ",", $.expr),
      seq("(", $.position, "," , $.position ),
      seq("(", $.position, ")"),
      seq($.fraction, "of", "the","way","between",$.position,"and",$.position),
      seq($.fraction, "way", "between", $.position, "and", $.position),
      seq($.fraction, "between", $.position, "and", $.position),
      seq($.fraction, "<", $.position, ",", $.position, ">"),
      seq($.distance, $.whichWayFrom, $.position),
    ),
    fraction:          $ => $.expr,
    distance:          $ => $.expr,
    whichWayFrom:      $ => choice(
      "above",
      "below",
      seq("right", "of"),
      seq("left", "of"),
      seq("n", "of"),
      seq("north", "of"),
      seq("ne", "of"),
      seq("e", "of"),
      seq("east", "of"),
      seq("se", "of"),
      seq("s", "of"),
      seq("south", "of"),
      seq("sw", "of"),
      seq("w", "of"),
      seq("west", "of"),
      seq("nw", "of"),
      seq("heading", $.compassAngle, "from")
    ),
    place:             $ => choice(
      $.object,
      seq($.object, $.dotEdgename),
      seq($.edgename, "of", $.object),
      seq($.ORDINAL, "vertex", "of", $.object),
    ),
    object:            $ => prec.left(choice(
      $.LABEL,
      seq($.object, ".", $.LABEL),
      seq($.nthObject, choice("of", "if"), $.object),
    )),
    nthObject:         $ => prec.left('nth', choice(
      seq($.ORDINAL, $.objectClass),
      seq($.ORDINAL, "last", $.objectClass),
      seq($.ORDINAL, "previous", $.objectClass),
      seq("last", $.objectClass),
      seq("previous", $.objectClass),
      "last",
      "previous",
      seq($.ORDINAL, "[]"),
      seq($.ORDINAL, "last", "[]"),
      seq($.ORDINAL, "previous", "[]"),
      seq("last", "[]"),
      seq("previous", "[]"),
    )),
    dotEdgename:       $ => choice(
      ".n", ".north", ".ne", ".e", ".east", ".se", ".s", ".south", ".sw", ".w", ".west", ".nw", ".t",
      ".top", ".bot", ".bottom", ".left", ".right", ".c", ".center", ".start", ".end"
    ),
    edgename:          $ => choice(
      "n", "north", "ne", "e", "east", "se", "s", "south", "sw", "w", "west", "nw", "t",
      "top", "bot", "bottom", "left", "right", "c", "center", "start", "end"
    ),
    expr:              $ => prec.left(choice(
      $.NUMBER,
      $.VARIABLE,
      $.COLORNAME,
      seq($.place, ".x"),
      seq($.place, ".y"),
      seq($.object, $.dotProperty),
      seq("(", $.expr, ")"),
      seq($.expr, "+", $.expr),
      seq($.expr, "-", $.expr),
      seq($.expr, "*", $.expr),
      seq($.expr, "/", $.expr),
      seq("-", $.expr),
      seq("+", $.expr),
      seq("abs", "(",  $.expr, ")"),
      seq("cos", "(",  $.expr, ")"),
      seq("dist", "(",  $.position, ",", $.position, ")"),
      seq("int", "(",  $.expr, ")"),
      seq("max", "(", $.expr, ",", $.expr, ")"),
      seq("min", "(", $.expr, ",", $.expr, ")"),
      seq("sin", "(",  $.expr, ")"),
      seq("sqrt", "(",  $.expr, ")")
    )),
    dotProperty:       $ => choice(".color", ".dashed", ".diameter", ".dotted", ".fill", ".ht", ".height", ".rad", ".radius", ".thickness", ".wid", ".width"),

    // Tokens
    _NEWLINE:   $ => "\n",
    LABEL:     $ => /[A-Z][a-zA-Z0-9_]*/,
    VARIABLE:  $ => /[a-z@\$][a-zA-Z0-9_]*/,
    NUMBER:    $ => choice(
      seq(/\d+\.\d+/, optional(token.immediate(choice("mm", "pc", "pt", "px", "cm", "in")))), // Floating point - maybe with unit
      seq(/\d+/, optional(token.immediate(choice("mm", "pc", "pt", "px", "cm", "in")))), // Decimal - maybe with unit
      /0x[0-9a-fA-F]+/,
    ),
    ORDINAL:   $ => choice(seq(/[1-9][0-9]*/, token.immediate(choice("st", "nd", "rd", "th"))), "first"),
    STRING:    $ => /"(?:[^"\\]|\\.)*"/,
    COLORNAME: $ => choice(
"aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue",
"darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray",
"lightgreen", "lightgrey", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "none", "off", "oldlace", "olive", "olivedrab", "orange",
"orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise",
"violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"
    ),
    CODEBLOCK: $ => seq("{", /[^}]*/,"}"),

    // Extras - comments & macro calls
    comments: $ => choice(
      /#.*/, /\/\/.*/
    ),
    macroCall: $ => seq(field("macroName", $.VARIABLE), "(", /[^\)]*/, ")")
  }
});

// Local Variables:
// mode: js-ts
// eval: (highlight-regexp (rx "$") 'diary)
// compile-command: "tree-sitter generate"
// End:
