import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { 
  getUserAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} from '../services/addressService';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';

const SavedAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm();

  // Load addresses when component mounts
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if user exists and has id (not userId)
        if (!user?.id) {
          return;
        }
        const addressData = await getUserAddresses(user.id);
        setAddresses(addressData);
      } catch (err) {
        setError(err.message || 'Failed to load addresses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  // Handle form submission for adding/editing address
  const onSubmit = async (data) => {
    try {
      if (isEditingAddress) {
        // Update existing address
        const updatedAddress = await updateAddress(isEditingAddress, data);
        setAddresses(addresses.map(addr => 
          addr.addressId === isEditingAddress ? updatedAddress : addr
        ));
        setActionSuccess('Address updated successfully');
      } else {
        // Add new address - use user.id instead of user.userId
        const newAddress = await createAddress(user.id, data);
        setAddresses([...addresses, newAddress]);
        setActionSuccess('Address added successfully');
      }
      
      // Reset form and state
      reset();
      setIsAddingAddress(false);
      setIsEditingAddress(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save address. Please try again.');
    }
  };

  // Handle setting default address
  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(user.id, addressId); // Use user.id instead of user.userId
      
      // Update local state
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.addressId === addressId
      })));
      
      setActionSuccess('Default address updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to set default address. Please try again.');
    }
  };

  // Handle deleting address
  const handleDelete = async (addressId) => {
    try {
      await deleteAddress(addressId);
      
      // Update local state
      setAddresses(addresses.filter(addr => addr.addressId !== addressId));
      
      setActionSuccess('Address deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete address. Please try again.');
    }
  };

  // Handle editing address
  const handleEdit = (address) => {
    setIsEditingAddress(address.addressId);
    setIsAddingAddress(true);
    
    // Populate form with address data
    reset({
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });
  };

  // Clear form and reset states
  const handleCancel = () => {
    reset();
    setIsAddingAddress(false);
    setIsEditingAddress(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Saved Addresses</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {actionSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {actionSuccess}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading addresses...</p>
            </div>
          ) : (
            <>
              {/* Address List */}
              {!isAddingAddress && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Your Addresses</h2>
                    <button
                      onClick={() => {
                        setIsAddingAddress(true);
                        setIsEditingAddress(null);
                        reset();
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      Add New Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-gray-600">You don't have any saved addresses yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((address) => (
                        <div 
                          key={address.addressId}
                          className={`bg-white border ${address.isDefault ? 'border-blue-500' : 'border-gray-200'} rounded-lg p-6 relative`}
                        >
                          {address.isDefault && (
                            <span className="absolute top-3 right-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                          
                          <h3 className="font-semibold text-lg mb-2">{address.fullName}</h3>
                          <p className="text-gray-700 mb-1">{address.addressLine1}</p>
                          {address.addressLine2 && (
                            <p className="text-gray-700 mb-1">{address.addressLine2}</p>
                          )}
                          <p className="text-gray-700 mb-1">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-gray-700 mb-4">{address.country}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button
                              onClick={() => handleEdit(address)}
                              className="text-blue-600 border border-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(address.addressId)}
                              className="text-red-600 border border-red-600 px-3 py-1 rounded-md hover:bg-red-50 transition text-sm"
                            >
                              Delete
                            </button>
                            {!address.isDefault && (
                              <button
                                onClick={() => handleSetDefault(address.addressId)}
                                className="text-green-600 border border-green-600 px-3 py-1 rounded-md hover:bg-green-50 transition text-sm"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Address Form */}
              {isAddingAddress && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {isEditingAddress ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                      <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        {...register('fullName', { required: 'Full name is required' })}
                        className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="addressLine1" className="block text-gray-700 font-medium mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        {...register('addressLine1', { required: 'Address is required' })}
                        className={`w-full border ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                      />
                      {errors.addressLine1 && (
                        <p className="text-red-500 text-sm mt-1">{errors.addressLine1.message}</p>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="addressLine2" className="block text-gray-700 font-medium mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        {...register('addressLine2')}
                        className="w-full border border-gray-300 rounded-md p-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          {...register('city', { required: 'City is required' })}
                          className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-gray-700 font-medium mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          {...register('state', { required: 'State is required' })}
                          className={`w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                        />
                        {errors.state && (
                          <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="zipCode" className="block text-gray-700 font-medium mb-2">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          {...register('zipCode', { required: 'Zip code is required' })}
                          className={`w-full border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                        />
                        {errors.zipCode && (
                          <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="country" className="block text-gray-700 font-medium mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          id="country"
                          {...register('country', { required: 'Country is required' })}
                          className={`w-full border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                        />
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('isDefault')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">Set as default address</span>
                      </label>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                      >
                        Save Address
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedAddresses; 