import * as Yup from 'yup';

const phoneRegExp = /^03[0-4]{1}[0-9]{8}$/;
const cnicRegExp = /^[0-9]{5}[0-9]{7}[0-9]{1}$/;

const formatCNIC = (value) => {
  if (!value) return value;
  const cleaned = value.replace(/[^\d]/g, '');
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
};

export const signUpSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces')
    .required('Full name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password is too long')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .matches(/^\S*$/, 'Password cannot contain spaces')
    .required('Password is required'),
  phoneNumber: Yup.string()
    .matches(phoneRegExp, 'Must be a valid Pakistani mobile number (03XX-XXXXXXX)')
    .required('Phone number is required')
    .transform((value) => value?.replace(/[^\d]/g, '')),
  cnic: Yup.string()
    .matches(cnicRegExp, 'Must be a valid CNIC number')
    .required('CNIC is required')
    .transform((value) => value?.replace(/[^\d]/g, ''))
    .test('valid-cnic', 'Invalid CNIC number', (value) => {
      if (!value) return false;
      return value.length === 13;
    }),
});

export const signInSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

export const additionalDetailsSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(phoneRegExp, 'Phone number must be a valid Pakistani number (03XXXXXXXXX)')
    .required('Phone number is required'),
  cnic: Yup.string()
    .matches(cnicRegExp, 'CNIC must be in format XXXXX-XXXXXXX-X')
    .required('CNIC is required'),
}); 