import React from 'react';
import { Formik, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaTrash, FaClock, FaShieldAlt, FaList, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  duration: Yup.string().required('Duration is required'),
  guarantee: Yup.string().required('Guarantee information is required'),
  includedServices: Yup.array().of(
    Yup.string().required('Service item cannot be empty')
  ).min(1, 'Add at least one included service'),
  requirements: Yup.array().of(
    Yup.string().required('Requirement cannot be empty')
  ),
  imageUrl: Yup.string().url('Must be a valid URL'),
  features: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required('Feature title is required'),
      description: Yup.string().required('Feature description is required')
    })
  )
});

export const ServiceForm = ({ service, onSubmit, onCancel }) => {
  const initialValues = {
    title: service?.title || '',
    description: service?.description || '',
    category: service?.category || '',
    price: service?.price || '',
    duration: service?.duration || '1 hour',
    guarantee: service?.guarantee || '100% Satisfaction Guaranteed',
    includedServices: service?.includedServices || ['Professional service by experienced staff'],
    requirements: service?.requirements || [],
    imageUrl: service?.imageUrl || '',
    features: service?.features || [
      {
        title: 'Expert Staff',
        description: 'Our team consists of highly trained professionals'
      }
    ]
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await onSubmit(values);
    } catch (error) {
      toast.error('Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {service ? 'Edit Service' : 'Create New Service'}
      </h3>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, errors, touched, isSubmitting, values }) => (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Title
              </label>
              <Field
                name="title"
                type="text"
                      className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors
                  ${errors.title && touched.title
                    ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:border-green-500'
                  }`}
              />
              {errors.title && touched.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Field
                as="select"
                name="category"
                      className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors
                  ${errors.category && touched.category
                    ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:border-green-500'
                  }`}
              >
                <option value="">Select a category</option>
                <option value="food">Food</option>
                <option value="fish">Fish</option>
                <option value="equipment">Equipment</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </Field>
              {errors.category && touched.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors
                    ${errors.description && touched.description
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-green-500'
                    }`}
                />
                {errors.description && touched.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

              {/* Service Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (PKR)
              </label>
              <Field
                name="price"
                type="number"
                min="0"
                      className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors
                  ${errors.price && touched.price
                    ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:border-green-500'
                  }`}
              />
              {errors.price && touched.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaClock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Field
                        name="duration"
                        type="text"
                        className="pl-10 w-full px-4 py-2 border rounded-lg outline-none transition-colors border-gray-300 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guarantee
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaShieldAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <Field
                        name="guarantee"
                        type="text"
                        className="pl-10 w-full px-4 py-2 border rounded-lg outline-none transition-colors border-gray-300 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Included Services */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
                <FieldArray name="includedServices">
                  {({ push, remove }) => (
                    <div className="space-y-3">
                      {values.includedServices.map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaList className="h-5 w-5 text-gray-400" />
                            </div>
                            <Field
                              name={`includedServices.${index}`}
                              type="text"
                              className="pl-10 w-full px-4 py-2 border rounded-lg outline-none transition-colors border-gray-300 focus:border-green-500"
                              placeholder="Enter included service"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push('')}
                        className="flex items-center text-green-600 hover:text-green-700"
                      >
                        <FaPlus className="h-4 w-4 mr-2" />
                        Add Service Item
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                <FieldArray name="requirements">
                  {({ push, remove }) => (
                    <div className="space-y-3">
                      {values.requirements.map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Field
                            name={`requirements.${index}`}
                            type="text"
                            className="flex-1 px-4 py-2 border rounded-lg outline-none transition-colors border-gray-300 focus:border-green-500"
                            placeholder="Enter requirement"
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push('')}
                        className="flex items-center text-green-600 hover:text-green-700"
                      >
                        <FaPlus className="h-4 w-4 mr-2" />
                        Add Requirement
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                <FieldArray name="features">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.features.map((_, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Feature {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <Field
                              name={`features.${index}.title`}
                              type="text"
                              className="w-full px-4 py-2 border rounded-lg outline-none transition-colors border-gray-300 focus:border-green-500"
                              placeholder="Feature title"
                            />
                            <Field
                              name={`features.${index}.description`}
                              type="text"
                              className="w-full px-4 py-2 border rounded-lg outline-none transition-colors border-gray-300 focus:border-green-500"
                              placeholder="Feature description"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => push({ title: '', description: '' })}
                        className="flex items-center text-green-600 hover:text-green-700"
                      >
                        <FaPlus className="h-4 w-4 mr-2" />
                        Add Feature
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Image URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaImage className="h-5 w-5 text-gray-400" />
                  </div>
                  <Field
                    name="imageUrl"
                    type="url"
                    className="pl-10 w-full px-4 py-2 border rounded-lg outline-none transition-colors border-gray-300 focus:border-green-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {errors.imageUrl && touched.imageUrl && (
                  <p className="mt-1 text-sm text-red-500">{errors.imageUrl}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
              </button>
            </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}; 