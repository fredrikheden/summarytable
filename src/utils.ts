module powerbi.extensibility.visual {
    export function getMeasureIndex(dv: DataViewCategorical, measureName: string): number {
        let RetValue: number = -1;
        for (let i = 0; i < dv.values.length; i++) {
            if (dv.values[i].source.roles[measureName] === true) {
                RetValue = i;
                break;
            }
        }
        return RetValue;
    }

    export function getFormat(dv: DataViewTable, columnName: string): string {
        let RetValue: string = "";
        for (let i = 0; i < dv.columns.length; i++) {
            if ( dv.columns[i].displayName === columnName ) {
                RetValue = dv.columns[i].format;
            }
        }
        /*for (let i = 0; i < dv.values.length; i++) {
            if (dv.values[i].source.roles[measureName] === true) {
                RetValue = i;
                break;
            }
        }
        */
        return RetValue;
    }


    export function getMetadataColumnIndex(dv: DataViewMetadata, measureOrCategoryName: string): number {
        var retValue = -1;
        for (var i = 0, ilen = dv.columns.length; i < ilen; i++) {
            var column = dv.columns[i];
            if(column.roles !== undefined) { // Need to do this check. If SSAS MD model kit will break otherwise...
                if ( column.roles.hasOwnProperty(measureOrCategoryName)) {
                    retValue = i;
                    break;
                }
            }
        }
        return retValue;
    }

    
}
