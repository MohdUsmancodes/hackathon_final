import React from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../context/AdminAuthContext';

const adminLoginSchema = Yup.object().shape({
  secretKey: Yup.string().required('Secret key is required')
});

export const AdminLogin = () => {
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    const loginPromise = (async () => {
      try {
        await adminLogin(values.secretKey);
        navigate('/admin/dashboard');
        return 'Admin login successful';
      } catch (error) {
        throw new Error('Invalid admin secret key');
      } finally {
        setSubmitting(false);
      }
    })();

    toast.promise(loginPromise, {
      loading: 'Verifying...',
      success: (message) => message,
      error: (err) => err.message
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your admin secret key to continue
          </p>
        </div>

        <Formik
          initialValues={{ secretKey: '' }}
          validationSchema={adminLoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="mt-8 space-y-6">
              <div>
                <label htmlFor="secretKey" className="sr-only">
                  Admin Secret Key
                </label>
                <Field
                  id="secretKey"
                  name="secretKey"
                  type="password"
                  autoComplete="off"
                  required
                  className={`appearance-none rounded-lg relative block w-full px-3 py-2 border
                    ${errors.secretKey && touched.secretKey
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-1 
                    focus:z-10 sm:text-sm`}
                  placeholder="Enter admin secret key"
                />
                {errors.secretKey && touched.secretKey && (
                  <p className="mt-2 text-sm text-red-600">{errors.secretKey}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                    text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Verifying...' : 'Access Admin Panel'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}; 