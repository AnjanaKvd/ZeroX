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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <StatCard
        icon={Package}
        title="Active Products"
        value={productStats?.activeCount || 0}
        bgColor="bg-blue-600"
      />
      <StatCard
        icon={ShoppingCart}
        title="Total Sales"
        value={productStats?.totalSales || 0}
        bgColor="bg-green-600"
      />
      <StatCard
        icon={Users}
        title="User Accounts"
        value={customerCount}
        bgColor="bg-purple-600"
      />
      <StatCard
        icon={BarChart3}
        title="Revenue"
        value={formatRevenue(revenue)}
        bgColor="bg-orange-500"
      />
    </div>
  );
};

export default DashboardStats; 