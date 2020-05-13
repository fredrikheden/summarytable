export function EvalFunc(fn) {
    return new Function('return ' + fn)();
}

export function  EvalFormula(expr) {
    var e = null;
    try {
        // e = eval(expr);
        e = EvalFunc(expr);
    } catch(exc) {
        e = null;
    }
    return e;
}