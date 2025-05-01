import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Load user data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        const userProfile = response.data;

        // Format the createdAt date to be more readable
        const formattedUser = {
          ...userProfile,
          createdAt: userProfile.createdAt
            ? new Date(userProfile.createdAt)
            : null,
          lastLogin: userProfile.lastLogin
            ? new Date(userProfile.lastLogin)
            : null,
        };

        setUserData(formattedUser);
        if (updateUser) {
          updateUser(formattedUser);
        }
        setIsLoading(false);
      } catch (error) {
        setUpdateError(
          error.response?.data?.message || "Failed to load profile"
        );
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [updateUser]);

  // Profile form
  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm();

  // Update form values when userData changes
  useEffect(() => {
    if (userData) {
      resetProfile({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        userId: userData.userId || "",
      });
    }
  }, [userData, resetProfile]);

  const onSubmitProfile = async (data) => {
    setUpdateSuccess(false);
    setUpdateError(null);

    try {
      const response = await api.put("/auth/profile", {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        userId: data.userId,
      });

      const updatedUser = {
        ...userData,
        fullName: response.data.fullName,
        email: response.data.email,
        phone: response.data.phone,
      };

      setUserData(updatedUser);
      if (updateUser) {
        updateUser(updatedUser);
      }

      setUpdateSuccess(true);
      setIsEditing(false);

      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (error) {
      setUpdateError(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    }
  };

  // Password form
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm();

  const onSubmitPassword = async (data) => {
    setPasswordSuccess("");
    setPasswordError("");

    try {
      await api.post("/auth/changepassword", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      setPasswordSuccess("Password changed successfully!");
      resetPassword();
      setIsChangingPassword(false);

      setTimeout(() => setPasswordSuccess(""), 5000);
    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to change password. Please try again."
      );
    }
  };
  // Delete account
  const handleDeleteAccount = async () => {
    setDeleteError("");
    try {
      await api.delete("/auth/deleteaccount");
      // Clear user data and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      setDeleteError(
        error.response?.data?.error ||
          "Failed to delete account. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading profile...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold text-red-500">
          {updateError || "No user data available"}
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">My Account</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Profile Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {userData?.fullName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold">
                    {userData?.fullName}
                  </h2>
                  <p className="text-gray-600">{userData?.email}</p>

                  <div className="mt-6 border-t border-gray-200 pt-4 w-full">
                    <div className="mb-2">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="ml-2 font-medium">
                        {formatDate(userData?.createdAt)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-600">Last Login:</span>
                      <span className="ml-2 font-medium">
                        {formatDate(userData?.lastLogin)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-600">Loyalty Points:</span>
                      <span className="ml-2 font-medium">
                        {userData?.loyaltyPoints || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/orders" className="text-blue-600 hover:underline">
                      My Orders
                    </a>
                  </li>
                  <li>
                    <a href="/saved-addresses" className="text-blue-600 hover:underline">
                      Saved Addresses
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      className="text-blue-600 hover:underline"
                    >
                      Change Password
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 hover:underline"
                    >
                      Delete Account
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-2">
              {/* Profile Information Form */}
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

                <form onSubmit={handleProfileSubmit(onSubmitProfile)}>
                  <input type="hidden" {...profileRegister("userId")} />
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        {...profileRegister("fullName", {
                          required: "Full name is required",
                          minLength: {
                            value: 3,
                            message: "Full name must be at least 3 characters",
                          },
                        })}
                        className={`w-full border ${
                          profileErrors.fullName
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md p-3 ${!isEditing && "bg-gray-100"}`}
                        disabled={!isEditing}
                      />
                      {profileErrors.fullName && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileErrors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        {...profileRegister("email")}
                        className="w-full border border-gray-300 rounded-md p-3 bg-gray-100"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        {...profileRegister("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^\+?[\d\s-]{10,15}$/,
                            message: "Please enter a valid phone number",
                          },
                        })}
                        className={`w-full border ${
                          profileErrors.phone
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md p-3 ${!isEditing && "bg-gray-100"}`}
                        disabled={!isEditing}
                      />
                      {profileErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {profileErrors.phone.message}
                        </p>
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
                        onClick={() => {
                          setIsEditing(false);
                          resetProfile();
                          setUpdateError(null);
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Password Change Section */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Change Password</h2>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    {isChangingPassword ? "Cancel" : "Change Password"}
                  </button>
                </div>

                {passwordSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {passwordError}
                  </div>
                )}

                {isChangingPassword && (
                  <form onSubmit={handlePasswordSubmit(onSubmitPassword)}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          {...passwordRegister("currentPassword", {
                            required: "Current password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                          })}
                          className={`w-full border ${
                            passwordErrors.currentPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md p-3`}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {passwordErrors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          {...passwordRegister("newPassword", {
                            required: "New password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                          })}
                          className={`w-full border ${
                            passwordErrors.newPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md p-3`}
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {passwordErrors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          {...passwordRegister("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (val) => {
                              if (watch("newPassword") !== val) {
                                return "Passwords do not match";
                              }
                            },
                          })}
                          className={`w-full border ${
                            passwordErrors.confirmPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md p-3`}
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {passwordErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                )}
              </div>
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-xl font-bold mb-4">Delete Account</h3>
                    <p className="mb-4">
                      Are you sure you want to delete your account? If you once delete your account then you will lose all your data and access.
                    </p>

                    {deleteError && (
                      <div className="text-red-500 mb-4">{deleteError}</div>
                    )}

                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 border rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;