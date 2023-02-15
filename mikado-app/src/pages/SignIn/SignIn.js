/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { GoogleButton } from 'react-google-button';
// import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { FirebaseContext } from '../../context/FirebaseContext';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import {Helmet} from "react-helmet";

function SignIn() {

    const { googleSignIn, user } = FirebaseContext();
    const navigate = useNavigate();

    const handleGoogleSignIn = async() => {
        try {
            await googleSignIn();
        } catch (e) {
            console.log(e);
        }
    }

    // Redirects user to main graph after sign in
    useEffect(() => {
        if (user != null) {
            if (Object.keys(user).length !== 0) {
                navigate('/graph')
            }
        }
    }, [user]);

    return (
            <div>
                <Helmet 
                bodyAttributes={{style: 'background-color : #0a021c; background-image : radial-gradient(#EEE 1px, transparent 0); background-size: 40px 40px;'}}>
                </Helmet>
                <div className='sign-in-card max-w-[240px] m-auto py-4'>
                    <h1>The Mikado Machine</h1>

                    <button className='google-sign-in-button' onClick={handleGoogleSignIn}>
                        <img src='https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' alt='Google Logo' className='google-logo'/>
                        <p className='google-button-text'>Sign in with Google</p>
                    </button>
                    <p className='footnote'>More sign-in options coming soon!</p>
                    <p className='flavour-text'>The Mikado Machine is an open-source project developed by students at the <a href="https://www.uottawa.ca/en">University of Ottawa</a></p>
                    <p className='flavour-text'>Learn about the <a href="https://mikadomethod.info/">Mikado Method</a></p>
                    <p className='github-cta'>Follow our work on <a href="https://github.com/SEG491X-W2023-T42/mikado-machine">GitHub</a></p>
                </div>
            </div>
    );
}

export default SignIn;