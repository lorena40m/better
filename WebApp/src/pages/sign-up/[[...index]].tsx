import {SignUp} from '@clerk/nextjs'

export default function SignupPage(){
    return (
        <div
            // w='80%'
            // m='auto'
            // justifyContent='center'
            // alignItems='center'
            // mt='70px'
            // pb='20px'
        >
            <SignUp path="/sign-up" routing="path" signInUrl="/sign-in"  />
        </div>
    )
}