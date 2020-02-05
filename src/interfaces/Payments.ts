export enum PaymentType {
    In = 1,
    Out = 2
}

export enum PaymentStatus {
    Pending = 1, // in process
    Available = 2, // available for tutor to get
    Completed = 3, // tranfered to tutor's account,
    InReview = 4 // waiting for confirmation from admin
}