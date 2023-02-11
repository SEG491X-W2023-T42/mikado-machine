import { useEffect } from 'react';
import { GoogleButton } from 'react-google-button';
import { FirebaseContext } from '../context/FirebaseContext';
import { useNavigate } from 'react-router-dom';

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
            <div className='max-w-[240px] m-auto py-4'>
                <GoogleButton onClick={handleGoogleSignIn}/>
            </div>
        </div>
    );
}

export default SignIn;