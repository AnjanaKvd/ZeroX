import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';
import api from '../services/api';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });
  
  const onSubmit = async (data) => {
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      // Call the actual API endpoint
      const response = await api.put('/api/users/profile', data);
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile', error);
      setUpdateError('Failed to update profile. Please try again.');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">My Account</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold">{user?.fullName}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  
                  <div className="mt-6 border-t border-gray-200 pt-4 w-full">
                    <div className="mb-2">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="ml-2 font-medium">
                        {user?.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-gray-600">Loyalty Points:</span>
                      <span className="ml-2 font-medium">{user?.loyaltyPoints || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/orders" className="text-blue-600 hover:underline">My Orders</a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-600 hover:underline">Saved Addresses</a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-600 hover:underline">Change Password</a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
                
                {updateSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Profile updated successfully!
                  </div>
                )}
                
                {updateError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {updateError}
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        {...register('fullName', { required: 'Full name is required' })}
                        className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 ${!isEditing && 'bg-gray-100'}`}
                        disabled={!isEditing}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md p-3 bg-gray-100"
                        disabled={true} // Email can't be changed
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phone"
                        {...register('phone', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^\d{10,15}$/,
                            message: 'Please enter a valid phone number'
                          }
                        })}
                        className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 ${!isEditing && 'bg-gray-100'}`}
                        disabled={!isEditing}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="mt-6 flex space-x-4">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile; 