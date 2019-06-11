
export function jsonCopy(src) {
    return JSON.parse(JSON.stringify(src));
}

export function containsValue(v) {
    if ( typeof v === 'undefined' ) {
        return false;
    }
    if ( v === "" ) {
        return false;
    }
    if ( v.trim().length === 0 ) {
        return false;
    }
    return true;
}

export function replace2(str, strToFind, strToReplace) {
    var strR = strToReplace;
    var strF = strToFind.replace("[", "\\[", "g").replace("]", "\\]", "g").replace(")", "\\)", "g").replace("(", "\\(", "g");
    var regEx = new RegExp(strF, "ig");       
    var result = str.replace(regEx, strR);
    return result;
}
