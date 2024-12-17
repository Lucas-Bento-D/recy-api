export interface ICaptchaProtectedReturn{
    success: boolean
    message: string,
    data: {
        token: string
    }
}
export interface ITokenResponse{
    body: {
        token: string
    }
}