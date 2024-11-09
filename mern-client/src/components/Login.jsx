import React, { useContext, useState } from 'react'
import { AuthContext } from '../contacts/AuthProvider';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import googleLogo from "../assets/Google__G__logo.svg"


const Login = () => {
    const { login, loginWithGoogle } = useContext(AuthContext);
    const [error, setError] = useState("");

    const location = useLocation();
    const navigate = useNavigate();

    const from = location.state?.from?.pathname || "/";


    const handleLogin = (event) => {
        event.preventDefault();
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;
        login(email, password).then((userCredential) => {
            const user = userCredential.user;
            alert("Login successful ! ")
            navigate(from, { replace: true })
        })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setError(errorMessage)
            });
    }
    const handleRegister = () => {
        loginWithGoogle().then((result) => {
            const user = result.user;
            alert("Sign up successful !")
            navigate(from, { replace: true })
        })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setError(errorMessage)
                // ..
            });
    }
    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div
                    className="absolute inset-0 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl" style={{ backgroundImage: 'linear-gradient(to bottom right,#f29ad8,#f039b1)'}}>
                </div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div>
                            <h1 className="text-2xl font-semibold">Log In</h1>
                        </div>
                        <div className="divide-y divide-gray-200">
                            <form onSubmit={handleLogin} className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <div className="relative">
                                    <input id="email" name="email" type="text" className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600" placeholder="Email address" />
                                </div>
                                <div className="relative">
                                    <input id="password" name="password" type="password" className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600" placeholder="Password" />
                                </div>

                                {error ? <p className='text-red-600 text-base'>Email or password is incorrect...</p> : ""}

                                <p>If you don't have an account please <Link to="/sign-up" style={{color:'#f658b8'}}>Sign up</Link> here</p>
                                <div className="relative">
                                    <button classNameName="" style={{color:'white', backgroundColor:'#f658b8', borderRadius:'4rem', width:'5rem', height:'2.5rem'}}>Login</button>
                                </div>
                            </form>
                        </div>
                        <hr />
                        <div className='flex w-full items-center flex-xol mt-5 gap-3'>
                            <button onClick={handleRegister} className='block' style={{color:'brown', backgroundColor:'	#ff9ee2', borderRadius:'1rem', width:'13rem', height:'4rem'}}><img src={googleLogo} alt="" className='w-12 h-12 inline-block' />Login with Google</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login