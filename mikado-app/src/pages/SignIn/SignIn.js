/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import './SignIn.css';

function SignIn() {

  const { googleSignIn, user } = useFirebase();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
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
    <div id="sign-in-page">
      <div className='sign-in-card max-w-[240px] m-auto py-4'>
        <h1>Welcome to MyMikado!</h1>
        <p>
          MyMikado helps you manage your tasks and goals using the <a href="https://mikadomethod.info/" target="new">Mikado Method</a>.
        </p>

        <Button variant="contained" startIcon={<GoogleIcon />} className='google-sign-in-button' onClick={handleGoogleSignIn}>
          Continue With Google
        </Button>
        <p className='detail-text'>
          MyMikado is developed by students at the <a href="https://www.uottawa.ca/en">University of Ottawa.</a><br/>
        </p>
        <p className='detail-text'>
          Learn about the <a href="https://mikadomethod.info/">Mikado Method.</a> <br/>
        </p>
        <p className='detail-text'>
          Follow our work on <a href="https://github.com/SEG491X-W2023-T42/mikado-machine">GitHub.</a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
