export var configSchema = {
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://example.com/root.json",
  "type": "object",
  "title": "Design view",
  "format": "categories",
  "basicCategoryTitle": "Main",
  "options": {
    "disable_collapse": true,
    "disable_edit_json": true
  },
  "required": [
    "masterHeader",
    "columns",
    "rows",
    "headerRow",
    "displayAllRows",
    "culture",
    "reusableCSS",
  ],
  "properties": {
    "masterHeader": {
      "$id": "#/properties/masterHeader",
      "type": "object",
      "title": "Outer header/border",
      "required": [
        "title",
        "headerStyle",
        "borderStyle",
      ],
      "properties": {
        "title": {
          "$id": "#/properties/masterHeader/properties/title",
          "type": "string",
          "title": "Title",
          "default": "",
        },
        "headerStyle": {
          "$id": "#/properties/masterHeader/properties/headerStyle",
          "type": "string",
          "title": "Header style",
          "default": "",
        },
        "borderStyle": {
          "$id": "#/properties/masterHeader/properties/borderStyle",
          "type": "string",
          "title": "Border style",
          "default": "",
        }
      }
    },
    "reusableCSS": {
      "$id": "#/properties/reusableCSS",
      "type": "array",
      "title": "Reusable styles",
      "format": "table",
      "items": {
        "$id": "#/properties/reusableCSS/items",
        "type": "object",
        "title": "Items",
        "headerTemplate": "{{ i1 }} - {{ self.key }}",
        "properties": {
          "key": {
            "$id": "#/properties/reusableCSS/items/properties/key",
            "type": "string",
            "title": "Key",
            "default": ""
          },
          "value": {
            "$id": "#/properties/reusableCSS/items/properties/value",
            "type": "string",
            "title": "Value",
            "default": ""
          }
        }
      }
    },
    "headerRow": {
      "$id": "#/properties/headerRow",
      "type": "object",
      "title": "Header row",
      "required": [
        "rowStyle"
      ],
      "properties": {
        "rowStyle": {
          "$id": "#/properties/headerRow/properties/rowStyle",
          "type": "string",
          "title": "Row style",
          "default": "",
          "examples": [
            ""
          ],
          "pattern": "^(.*)$"
        }
      }
    },    
    "columns": {
      "$id": "#/properties/columns",
      "type": "array",
      "title": "Columns",
      "format": "tabs",
      "items": {
        "$id": "#/properties/columns/items",
        "type": "object",
        "title": "Column",
        "format": "categories",
        "options": {
          "disable_collapse": true,
          "disable_array_delete_all_rows": true,
          "disable_array_delete_last_row": true
        },
        "headerTemplate": "{{ i1 }} - {{ self.title }}",
        "required": [
          "headerStyle",
          "rowStyle",
          "width",
          "type",
          "refName",
          "title",
          "calculationFormula",
          "format"
        ],
        "properties": {
          "headerStyle": {
            "$id": "#/properties/columns/items/properties/headerStyle",
            "type": "string",
            "title": "Headerstyle",
            "default": "",
            "examples": [
              "border-bottom:1px;border-bottom-color:#eee;border-bottom-style:solid"
            ],
            "pattern": "^(.*)$"
          },
          "rowStyle": {
            "$id": "#/properties/columns/items/properties/rowStyle",
            "type": "string",
            "title": "Rowstyle",
            "default": "",
            "examples": [
              "text-align:left"
            ],
            "pattern": "^(.*)$"
          },
          "width": {
            "$id": "#/properties/columns/items/properties/width",
            "type": "integer",
            "title": "Width",
            "default": 0,
            "examples": [
              150
            ]
          },
          "hidden": {
            "$id": "#/properties/columns/items/properties/hidden",
            "type": "boolean",
            "title": "Hidden",
            "default": false,
            "examples": [
              false
            ]
          },
          "type": {
            "$id": "#/properties/columns/items/properties/type",
            "type": "string",
            "title": "Type",
            "default": "",
            "enum": [
              "RowHeader", "Data", "Calculation"
            ],
            "examples": [
              "RowHeader", "Data", "Calculation"
            ],
            "pattern": "^(.*)$"
          },
          "refName": {
            "$id": "#/properties/columns/items/properties/refName",
            "type": "string",
            "title": "Refname",
            "default": "",
            "examples": [
              "[Product]"
            ],
            "pattern": "^(.*)$"
          },
          "title": {
            "$id": "#/properties/columns/items/properties/title",
            "type": "string",
            "title": "Title",
            "default": "",
            "examples": [
              ""
            ],
            "pattern": "^(.*)$"
          },
          "calculationFormula": {
            "$id": "#/properties/columns/items/properties/calculationFormula",
            "type": "string",
            "title": "Calculationformula",
            "default": "",
            "examples": [
              ""
            ],
            "pattern": "^(.*)$"
          },
          "format": {
            "$id": "#/properties/columns/items/properties/format",
            "type": "string",
            "title": "Format",
            "default": "",
            "examples": [
              ""
            ],
            "pattern": "^(.*)$"
          },
          "styleByMeasure": {
            "$id": "#/properties/columns/items/properties/styleByMeasure",
            "type": "string",
            "title": "Format",
            "default": "",
            "examples": [
              "[MyStyleMeasure]"
            ],
            "pattern": "^(.*)$"
          }
        }
      }
    },
    "rows": {
      "$id": "#/properties/rows",
      "type": "array",
      "title": "Rows",
      "format": "tabs",
      "options": {
        "disable_collapse": true,
        "disable_array_delete_all_rows": true,
        "disable_array_delete_last_row": true
      },
      "items": {
        "$id": "#/properties/rows/items",
        "type": "object",
        "title": "Items",
        "format": "categories",
        "options": {
          "disable_collapse": true,
          "disable_edit_json": true
        },
        "headerTemplate": "{{ i1 }} - {{ self.title }}",
        "required": [
          "title",
          "formula",
          "rowStyle",
          "visible",
          "cellRowHeaderStyle",
          "cellRowDataStyle"
        ],
        "properties": {
          "title": {
            "$id": "#/properties/rows/items/properties/title",
            "type": "string",
            "title": "Title",
            "default": "",
            "examples": [
              "null"
            ],
            "pattern": "^(.*)$"
          },
          "formula": {
            "$id": "#/properties/rows/items/properties/formula",
            "type": "string",
            "title": "Formula",
            "default": "",
            "examples": [
              "[null]"
            ],
            "pattern": "^(.*)$"
          },
          "rowStyle": {
            "$id": "#/properties/rows/items/properties/rowStyle",
            "type": "string",
            "title": "Rowstyle",
            "default": "",
            "examples": [
              ""
            ],
            "pattern": "^(.*)$"
          },
          "visible": {
            "$id": "#/properties/rows/items/properties/visible",
            "type": "boolean",
            "title": "Visible",
            "default": false,
            "examples": [
              true
            ]
          },
          "cellRowHeaderStyle": {
            "$id": "#/properties/rows/items/properties/cellRowHeaderStyle",
            "type": "string",
            "title": "Cellrowheaderstyle",
            "default": "",
            "examples": [
              ""
            ],
            "pattern": "^(.*)$"
          },
          "cellRowDataStyle": {
            "$id": "#/properties/rows/items/properties/cellRowDataStyle",
            "type": "string",
            "title": "Cellrowdatastyle",
            "default": "",
            "examples": [
              ""
            ],
            "pattern": "^(.*)$"
          },
          "hideForColumns": {
            "$id": "#/properties/rows/items/properties/hideForColumns",
            "type": "array",
            "title": "Hide for columns",
            "items": {
              "type": "string"
            }
          },
          "directColumnRef": {
            "$id": "#/properties/rows/items/properties/directColumnRef",
            "type": "array",
            "title": "Direcy column reference",
            "format": "table",
            "items": {
              "$id": "#/properties/rows/items/properties/directColumnRef/items",
              "type": "object",
              "title": "Items",
              "properties": {
                "columnRefName": {
                  "$id": "#/properties/rows/items/properties/directColumnRef/items/properties/columnRefName",
                  "type": "string",
                  "title": "Column ref name",
                  "default": ""
                },
                "columnReplaceRefName": {
                  "$id": "#/properties/rows/items/properties/directColumnRef/items/properties/columnReplaceRefName",
                  "type": "string",
                  "title": "Column replace with ref name",
                  "default": ""
                }
              }
            }
          },
        }
      }
    },
    "displayAllRows": {
      "$id": "#/properties/displayAllRows",
      "type": "boolean",
      "title": "Force display of rows with no data",
      "default": false,
      "examples": [
        false
      ]
    },
    "culture": {
      "$id": "#/properties/displayAllRows",
      "type": "string",
      "title": "Culture (currently not working)",
      "default": "",
      "examples": [
        "en-US", "sv-SE"
      ]
    },
    "alternatingRowStyle": {
      "$id": "#/properties/alternatingRowStyle",
      "type": "string",
      "title": "Alternating row style",
      "default": "",
      "examples": [
        "background-color:#abc"
      ]
    }
  }
}