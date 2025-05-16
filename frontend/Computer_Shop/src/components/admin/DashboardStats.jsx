import React, { useEffect, useState } from 'react';
import { BarChart3, Package, ShoppingCart, Users } from 'lucide-react';
import { getCustomerCount } from '../../services/authService';


const StatCard = ({ icon: Icon, title, value, bgColor }) => (
  <div className={`${bgColor} rounded-lg shadow-sm p-6 flex items-center space-x-4`}>
    <div className="rounded-full bg-white bg-opacity-30 p-3">
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-white text-opacity-80 text-sm font-medium">{title}</p>
      <p className="text-white text-2xl font-semibold">{value}</p>
    </div>
  </div>
);

const DashboardStats = ({ productStats }) => {
  const [customerCount, setCustomerCount] = useState(productStats?.customerCount || 0);
  const [revenue, setRevenue] = useState(productStats?.revenue || 0);
  
  // Format the revenue amount
  const formatRevenue = (amount) => {
    // Convert to float and handle non-numeric values
    const value = parseFloat(amount);
    if (isNaN(value)) return 'Rs.0.00';
    
    // Format with 2 decimal places and Rupees symbol
    return `Rs.${value.toFixed(2)}`;
  };
  
  // Fetch customer count directly
  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        console.log('Fetching customer count in DashboardStats');
        // Fetch directly using the service
        const count = await getCustomerCount();
        console.log('Customer count received in component:', count);
        setCustomerCount(count);
      } catch (error) {
        console.error('Error fetching customer count:', error);
        setCustomerCount(0);
      }
    };
    
    fetchCustomerCount();
  }, []);
  
  // Update revenue when productStats changes
  useEffect(() => {
    if (productStats?.revenue !== undefined) {
      setRevenue(productStats.revenue);
    }
  }, [productStats?.revenue]);
        title="User Accounts"
        value={customerCount}
        title="Customers"
        value={productStats?.customerCount || 0}
        value={formatRevenue(revenue)}
        value={`$${productStats?.revenue?.toFixed(2) || '0.00'}`}
      />
    </div>
  );
};

export default DashboardStats; 