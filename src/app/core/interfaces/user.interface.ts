export interface User {
    uid: string;
    email: string;
    url: string;
    token: string;
    first_name: string;
    last_name: string;
    level: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

export interface UserRegister {
    email: string;
    password1: string;
    password2: string;
}

export interface UserData {
    email: string;
    firstName: string;
    lastName: string;
}