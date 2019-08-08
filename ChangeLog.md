# Change Log

## Version v3.1.0 (not published yet)
* Added support for json editor (thanks to Rishav Sharma).

## Version v3.0.2
* Added support for culture (but is seems to still be a Power BI issue with this: https://github.com/microsoft/powerbi-visuals-utils-formattingutils/issues/36).
* Added tslint.json (certification requirement).

## Version v3.0.1
* Code improved to support certification (support of rendering events and no use of innerHtml)

## Version v3.0.0
* Code restructured and prepared for new types of editors.

## Version v2.0.0
* Support for the new 2.6 api.
* Better handling of wrapped columns. Note that there are minor changes to the width of the column due to this fix, which can make older summary tables appear wider. To correct this, decrease the width of the column.
* Possible to use a json string from the data model (name it "json" and it will be used)
* Reference a measure in title fields of columns.
* Possible to specify master header and border styles for the whole table.
* Removed property for additionalWidth and made columns not wrap instead.
* Added support for parenthesis in row reference names.
* Added support for reusable styles.

## Version v1.4.3 
* Added additionalWidth property to make it possible to work with border style/width.

## Version v1.4.2
* Bugfix for older browsers.

## Version v1.4.0
* Possible to set custom format on a whole row by using the format property on a row.
* Possible to use any formula expression on row calculations. Javascript's standard evaluation of expressions are used instead of custom code.

## Version v1.3.0
* Possible to reference calculated rows in row formulas.
* Possible to add ranges i row formulas, using double colon. Syntax: "formula": "[1240]::[1668]"

## Version v1.2.0
* Any formula expression (including parenthesis etc.) is now possible on column calculations. Javascript's standard evaluation of expressions are used instead of custom one.
* Added attribute "displayAllRows", to make it possible to force rows to be displayed even if no data is available.
* Display empty cell instead of (blank) when cell contains no data.

## Version v1.1.0
* Bug fix: Calculation columns did not handle formulas correctly.

## Version v1.0.0
* First version
