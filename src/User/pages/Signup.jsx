import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../components/Input';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { signUpSchema } from '../../utils/validationSchema';
import { generateQRCode } from '../../utils/qrCodeGenerator';
import { adminService } from '../../Admin/services/adminService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserOptions } from '../../Admin/components/UserOptions';

export const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    const signupPromise = (async () => {
      try {
        const sensitiveData = {
          phoneNumber: values.phoneNumber,
          cnic: values.cnic,
          verificationTime: new Date().toISOString()
        };
        
        const qrCodeUrl = await generateQRCode(sensitiveData);
        
        const userData = {
          fullName: values.fullName,
          email: values.email,
          qrCode: qrCodeUrl,
          createdAt: new Date().toISOString(),
          role: 'user',
          isVerified: false,
          phoneNumber: values.phoneNumber,
          cnic: values.cnic
        };

        const userCredential = await signUp(values.email, values.password, userData);
        
        await adminService.sendUserNotification(
          { 
            ...userData,
            uid: userCredential.user.uid 
          },
          'SIGNUP'
        );

        setShowOptions(true);
        setTimeout(() => {
          navigate('/user/profile');
        }, 3000);

        return 'Account created successfully!';
      } catch (error) {
        throw new Error(error.message || 'Failed to create account');
      } finally {
        setSubmitting(false);
      }
    })();

    toast.promise(signupPromise, {
      loading: 'Creating your account...',
      success: (message) => message,
      error: (err) => err.message
    });
  };

  return (
    <div className="flex min-h-screen bg-contain bg-no-repeat bg-center" style={{backgroundImage: "url('https://edunewspk.com/wp-content/uploads/2023/09/Saylani-Welfare-Free-Rashan-Program-2023-Registration-Last-Date.jpg')"}}>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">Create your account</h2>
          <Formik
            initialValues={{
              fullName: '',
              email: '',
              password: '',
              phoneNumber: '',
              cnic: ''
            }}
            validationSchema={signUpSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <Input
                  label="Full Name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  placeholder="03XXXXXXXXX"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Input
                  label="CNIC"
                  name="cnic"
                  type="text"
                  placeholder="XXXXX-XXXXXXX-X"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 
                    transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating account...' : 'Sign Up'}
                </button>

                <p className="text-center text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-green-600 hover:underline">
                    Login
                  </Link>
                </p>
              </Form>
            )}
          </Formik>

          {showOptions && <UserOptions />}
        </div>
      </div>
    </div>
  );
};