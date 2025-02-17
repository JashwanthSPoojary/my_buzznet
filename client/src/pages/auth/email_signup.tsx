import { useState } from "react";
import { api, AxiosErrorResponse, isAxios } from "../../util/api";
import { useNavigate } from "react-router-dom";

const EmailSignUp = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpFieldDisabled, setIsOtpFieldDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const handleSendOtp = async () => {
        try {
            setLoading(true);
            const response = await api.post("/user/signupemail",{
                email:email
            });
            console.log(response);
            if (response.status===200) {
                setIsOtpFieldDisabled(false);
                console.log('OTP sent to your email!');
            }
            if (response.status === 202) {
                setError(response.data.error)
            }
        } catch (err) {
            console.log(err);
        }finally {
            setLoading(false);
        }
    }
    const handleVerifyOtp = async (e:React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.post('/user/verify-otp',{
                email:email,
                otp:otp
            });
            console.log(response);
            
            if (response.status === 200) {
                console.log('Email verified successfully!');
            }else if(response.status === 202){
                setError(response.data.error);
                return
            }
            navigate(`/emailForm/${email}`);
        } catch (err) {
            if (isAxios(err)) {
                const errorMessage =
                  (err.response?.data as AxiosErrorResponse)?.error ||
                  "An unknown error occurred";
                setError(errorMessage);
            }else {
                setError("Error occured");
                console.log(error);
            }
        }finally {
            setLoading(false);
        }
    }
    return ( 
        <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-b from-[#000000] to-[#0B192C] p-4">
            <div className="w-full max-w-md p-4 sm:p-6 md:p-8 rounded-lg bg-[#1E2A38] text-white shadow-lg">
                <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
                    Email Verification
                </h1>
                
                <form onSubmit={handleVerifyOtp}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 bg-[#2A3744] rounded-lg p-2.5 text-white"
                                    placeholder="Enter your email"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading || !email}
                                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-[#2A3744] rounded-lg p-2.5 text-white disabled:opacity-50"
                                placeholder="Enter OTP"
                                disabled={isOtpFieldDisabled}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isOtpFieldDisabled || !otp}
                            className="w-full bg-green-600 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
     );
}
 
export default EmailSignUp;