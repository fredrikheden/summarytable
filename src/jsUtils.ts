
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
    const strR = strToReplace;
    const strF = strToFind.replace("[", "\\[", "g").replace("]", "\\]", "g").replace(")", "\\)", "g").replace("(", "\\(", "g");
    const regEx = new RegExp(strF, "ig");       
    const result = str.replace(regEx, strR);
    return result;
}


export function clearHtmlElement(element) {
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
}
