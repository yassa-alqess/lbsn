export interface UserAddPayload {
    email?: string;
    academicId: string; //required
    displayName: string; // required
    arabicName?: string;
    gender?: boolean;
    password: string; // required
    isLocked?: boolean;
    isDeleted?: boolean;
    departmentName?: string;
    group?: string;
    role: number; // required
    lawId?: string;
}

export interface UserResponse {
    userId: string;
    studentId?: string;
    instructorId?: string;
    email?: string;
    academicId: string;
    displayName: string;
    arabicName?: string;
    gender?: boolean;
    isLocked?: boolean;
    isDeleted?: boolean;
    departmentName?: string;
    group?: string;
    role: number;
    lawId?: string;
}
export interface UserUpdatePayload {
    userId: string; // required
    email?: string;
    academicId?: string;
    displayName?: string;
    arabicName?: string
    gender?: boolean;
    hashedPassword?: string;
    isLocked?: boolean;
    isDeleted?: boolean;
    departmentName?: string;
    group?: string;
    role?: number;
    lawId?: string;
}