// FormElements.jsx
import { Spinner } from '../common/LoadingSpinner/Spinner';

export const FormInput = ({ id, label, error, register, ...props }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={`${id}-error`}
        className={`w-full border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        {...props}
        {...register}
      />
      {error && (
        <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
  
  export const ErrorMessage = ({ message }) => (
    <div
      role="alert"
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      {message}
    </div>
  );
  
  export const AuthButton = ({ children, isLoading, ...props }) => (
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-all ${
        isLoading ? 'opacity-75 cursor-not-allowed' : ''
      }`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Spinner className="w-5 h-5 mr-2" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );