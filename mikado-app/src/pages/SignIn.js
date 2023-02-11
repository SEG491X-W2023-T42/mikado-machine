import React from 'react';
import { GoogleButton } from 'react-google-button';

function SignIn() {
    return (
        <div>
            <div className='max-w-[240px] m-auto py-4'>
                <GoogleButton />
            </div>
        </div>
    );
}

export default SignIn;