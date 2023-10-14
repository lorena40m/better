import {SignIn} from '@clerk/nextjs'

export default function SignInPage(){
    return (
        <div
            // w='80%'
            // m='auto'
            // justifyContent='center'
            // alignItems='center'
            // mt='70px'
            // pb='20px'
        >
            <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
    )
}