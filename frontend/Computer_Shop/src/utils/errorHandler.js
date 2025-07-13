export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data.message || 'An error occurred';

        switch (status) {
            case 400:
                return {
                    type: 'validation',
                    message,
                    errors: error.response.data.validationErrors
                };
            case 401:
                return {
                    type: 'authentication',
                    message: 'User Not Found!'
                };
            case 403:
                return {
                    type: 'authorization',
                    message: 'You do not have permission to perform this action'
                };
            case 404:
                return {
                    type: 'not_found',
                    message: 'The requested resource was not found'
                };
            default:
                return {
                    type: 'server',
                    message
                };
        }
    } else if (error.request) {
        // Request was made but no response received
        return {
            type: 'network',
            message: 'Network error. Please check your connection and try again.'
        };
    } else {
        // Something else happened in setting up the request
        return {
            type: 'client',
            message: 'An unexpected error occurred'
        };
    }
};