import React, { useEffect, useState } from 'react';
import { BarChart3, Package, ShoppingCart, Users } from 'lucide-react';
import { getCustomerCount } from '../../services/authService';


const StatCard = ({ icon: Icon, title, value, bgColor }) => (
  <div className={`${bgColor} rounded-lg shadow-sm p-6 flex items-center space-x-4`}>
    <div className="p-3 bg-white rounded-full bg-opacity-30">
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-white text-opacity-80">{title}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  </div>
);

const DashboardStats = ({ productStats }) => {
  const [customerCount, setCustomerCount] = useState(productStats?.customerCount || 0);
  const [revenue, setRevenue] = useState(productStats?.revenue || 0);

  const formatRevenue = (amount) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return 'Rs.0.00';
    return `Rs.${value.toFixed(2)}`;
  };

  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const count = await getCustomerCount();
        setCustomerCount(count);
      } catch (error) {
        setCustomerCount(0);
      }
    };

    fetchCustomerCount();
  }, []);

  useEffect(() => {
    if (productStats?.revenue !== undefined) {
      setRevenue(productStats.revenue);
    }
  }, [productStats?.revenue]);
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Users}
        title="Customers"
        value={customerCount}
        bgColor="bg-blue-500"
      />
      <StatCard
        icon={ShoppingCart}
        title="Orders"
        value={productStats?.orderCount || 0}
        bgColor="bg-green-500"
      />
      <StatCard
        icon={Package}
        title="Products"
        value={productStats?.productCount || 0}
        bgColor="bg-yellow-500"
      />
      <StatCard
        icon={BarChart3}
        title="Revenue"
        value={formatRevenue(revenue)}
        bgColor="bg-purple-500"
      />
    </div>
  );
};

export default DashboardStats;
