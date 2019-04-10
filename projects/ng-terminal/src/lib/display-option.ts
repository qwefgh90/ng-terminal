export interface DisplayOption{
    fixedSize?: {rows: number, cols: number};
    activateDraggableOnEdge?: {
        minWidth: number,
        minHeight: number
    }
}