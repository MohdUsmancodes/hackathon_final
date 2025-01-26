import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../components/Input';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { signInSchema } from '../../utils/validationSchema';
import { adminService } from '../../Admin/services/adminService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserOptions } from '../../Admin/components/UserOptions';

export const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    const loginPromise = (async () => {
      try {
        const userCredential = await signIn(values.email, values.password);
        
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        const userData = userDoc.data();

        await adminService.sendUserNotification(
          {
            ...userData,
            uid: userCredential.user.uid,
            email: userCredential.user.email
          },
          'LOGIN'
        );

        setShowOptions(true);
        setTimeout(() => {
          navigate('/user/dashboard');
        }, 3000);

        return 'Successfully logged in!';
      } catch (error) {
        throw new Error(error.message || 'Failed to login');
      } finally {
        setSubmitting(false);
      }
    })();

    toast.promise(loginPromise, {
      loading: 'Logging in...',
      success: (message) => message,
      error: (err) => err.message
    });
  };

  return (
    <div className="flex min-h-screen bg-contain bg-no-repeat bg-center" style={{backgroundImage: "url('https://edunewspk.com/wp-content/uploads/2023/09/Saylani-Welfare-Free-Rashan-Program-2023-Registration-Last-Date.jpg')"}}>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">Sign in to Account</h2>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={signInSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
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
                  placeholder="Enter your password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 
                    transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Logging in...' : 'Sign in'}
                </button>

                <p className="text-center text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-green-600 hover:underline">
                    Sign up
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