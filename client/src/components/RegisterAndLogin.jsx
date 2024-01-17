import React, { useContext, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../context/UserContext'

const RegisterAndLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isLoginOrRegister === "register" ? "register" : "login";
            const { data } = await axios.post(url, { username, password });
            setLoggedInUsername(username);
            setId(data.id);
        } catch (error) {
            console.error("Error during login/register:", error);
        }
    }
    return (
        <>
            <div className="hero my-9 mx-auto">
                <div className="hero-content flex-col lg:flex-row rounded-lg border bg-base-200">
                    <img src="https://i.pinimg.com/564x/f0/e7/00/f0e700b818e5bcfc35d46b652febd7a9.jpg"
                        className="max-w-sm rounded-lg shadow-2xl" />
                    <div>
                        <h1 className='text-4xl text-center font-bold p-4'>Login to your account</h1>
                        <div className="card card-body justify-center items-center py-4 ">
                            <div className="mx-auto w-full max-w-sm">
                                <form className="space-y-3 ">
                                    <div>
                                        <label htmlFor="username" className="block text-sm leading-6 text-gray-900">Username</label>
                                        <input name="username" type="text"
                                            className="block w-full rounded-lg border-0 p-2 text-gray-900 shadow-sm ring-2 ring-inset ring-base-300 focus:border-none"
                                            onChange={(e) => setUsername(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm leading-6 text-gray-900">Password</label>
                                        <input name="password" type="password"
                                            className="block w-full rounded-lg border-0 p-2 text-gray-900 shadow-sm ring-2 ring-inset ring-base-300 focus:border-none "
                                            onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                </form>
                            </div>
                            <div className='join justify-center items-center mt-4'>
                                <button className="btn btn-warning mx-1.5 w-32 hover:bg-yellow-500 hover:text-base-100 normal-case" onClick={handleSubmit} >
                                    {isLoginOrRegister === "register" ? "Register" : "Login"}</button>
                                <button className="btn btn-error mx-1.5 w-32 hover:bg-rose-600 hover:text-base-100 normal-case" >Cancel</button>
                            </div>
                            <div>
                                {isLoginOrRegister === "register" && (
                                    <div>
                                        Already a member?{" "}
                                        <button className="ml-1 text-rose-700" 
                                        onClick={() => {
                                            setIsLoginOrRegister("login");
                                        }}>
                                            Login Here
                                        </button>
                                    </div>
                                )}
                                {isLoginOrRegister === "login" && (
                                    <div>
                                        Don't have an account   ?{" "}
                                        <button className="ml-1 text-rose-700" 
                                        onClick={() => {
                                            setIsLoginOrRegister("register");
                                        }}>
                                            Login Here
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RegisterAndLogin