
export function  EvalFormula(expr) {
    console.log(expr);
    var e = null;
    try {
        e = eval(expr);
    } catch(exc) {
        e = null;
    }
    return e;
}