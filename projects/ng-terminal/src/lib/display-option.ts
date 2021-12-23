/**
 * options for dimensions of terminal.
 * fixedGrid has high priority than activateDraggableOnEdge's
 */
export interface DisplayOption{
    fixedGrid?: {rows: number, cols: number};
    activateDraggableOnEdge?: {
        minWidth: number,
        minHeight: number
    }
}

export function compareDisplayOption(op1: DisplayOption, op2: DisplayOption){
    if(op1?.fixedGrid?.rows != op2?.fixedGrid?.rows){
        return false;
    }
    if(op1?.fixedGrid?.cols != op2?.fixedGrid?.cols){
        return false;
    }
    if(op1?.activateDraggableOnEdge?.minWidth != op2?.activateDraggableOnEdge?.minWidth){
        return false;
    }
    if(op1?.activateDraggableOnEdge?.minHeight != op2?.activateDraggableOnEdge?.minHeight){
        return false;
    }
    return true;
}