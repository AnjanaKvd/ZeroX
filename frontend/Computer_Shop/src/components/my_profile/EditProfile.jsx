import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define Validation Schema
const EditProfileSchema = z.object({
  firstName: z.string().nonempty({ message: "First name is required!" }),
  lastName: z.string().nonempty({ message: "Last name is required!" }),
  email: z
    .string()
    .nonempty({ message: "Email is required!" })
    .email({ message: "Invalid email!" }),
  address: z.string().nonempty({ message: "Address is required!" }),
  province: z.string().nonempty({ message: "Province is required!" }),
  district: z.string().nonempty({ message: "District is required!" }),
  contactNumber: z.string().min(10, { message: "Enter a valid phone number!" }),
});

const EditProfile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(EditProfileSchema),
  });

  const onSubmit = (data) => {
    console.log("Updated Profile:", data);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* 🔹 First & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              {...register("firstName")}
              type="text"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              {...register("lastName")}
              type="text"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="mt-3">
          <label className="block text-sm font-medium">E-mail</label>
          <input
            {...register("email")}
            type="email"
            className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="mt-3">
          <label className="block text-sm font-medium">Address</label>
          <input
            {...register("address")}
            type="text"
            className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message}</p>
          )}
        </div>

        {/* Province & District */}
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium">Province</label>
            <input
              {...register("province")}
              type="text"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            />
            {errors.province && (
              <p className="text-red-500 text-sm">{errors.province.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">District</label>
            <input
              {...register("district")}
              type="text"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            />
            {errors.district && (
              <p className="text-red-500 text-sm">{errors.district.message}</p>
            )}
          </div>
        </div>

        {/*Contact Number */}
        <div className="mt-3">
          <label className="block text-sm font-medium">Contact Number</label>
          <input
            {...register("contactNumber")}
            type="text"
            className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-sm">
              {errors.contactNumber.message}
            </p>
          )}
        </div>

        {/*Save Button */}
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
