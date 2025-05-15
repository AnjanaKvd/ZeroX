import React from 'react';
import { BarChart3, Package, ShoppingCart, Users } from 'lucide-react';

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
        title="Customers"
        value={productStats?.customerCount || 0}
        bgColor="bg-purple-600"
      />
      <StatCard
        icon={BarChart3}
        title="Revenue"
        value={`$${productStats?.revenue?.toFixed(2) || '0.00'}`}
        bgColor="bg-orange-500"
      />
    </div>
  );
};

export default DashboardStats; 