export interface notification {
    id:number,
    message:string,
    type: "Error" | "Warning" | "Success" | "Info"
}