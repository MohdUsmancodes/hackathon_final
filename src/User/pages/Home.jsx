import React from 'react';
import { Link } from 'react-router-dom';
import { FaFish, FaLeaf, FaUsers, FaChartLine, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

export const Home = () => {
  const features = [
    {
      icon: <FaFish className="h-6 w-6" />,
      title: 'Fresh Fish Supply',
      description: 'Get access to the freshest fish directly from our farms'
    },
    {
      icon: <FaLeaf className="h-6 w-6" />,
      title: 'Sustainable Practices',
      description: 'We follow eco-friendly and sustainable fishing practices'
    },
    {
      icon: <FaUsers className="h-6 w-6" />,
      title: 'Expert Guidance',
      description: 'Get advice from our experienced fishery professionals'
    },
    {
      icon: <FaChartLine className="h-6 w-6" />,
      title: 'Market Insights',
      description: 'Stay updated with the latest fishery market trends'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl"
                >
                  <span className="block">Welcome to</span>
                  <span className="block text-green-200">Saylani Fishery</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-3 text-base text-green-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                >
                  Discover our premium fishery services and products. We provide sustainable fishing solutions and fresh seafood delivery.
                </motion.p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Link
                      to="/user/services"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-green-700 bg-white hover:bg-green-50 md:py-4 md:text-lg md:px-10"
                    >
                      View Services
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-3 sm:mt-0 sm:ml-3"
                  >
                    <Link
                      to="/user/signup"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-green-800 hover:bg-green-900 md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1535591273668-578e31182c4f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            alt="Fishery"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Us?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              We provide comprehensive fishery services with a focus on quality and sustainability
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div>
                    <div className="absolute h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                      {feature.icon}
                    </div>
                    <p className="ml-16 text-xl font-medium text-gray-900">{feature.title}</p>
                  </div>
                  <p className="mt-4 text-base text-gray-500">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-green-600">Start exploring our services today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-full shadow">
              <Link
                to="/user/services"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-full text-white bg-green-600 hover:bg-green-700"
              >
                Get Started
                <FaArrowRight className="ml-3 -mr-1 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 