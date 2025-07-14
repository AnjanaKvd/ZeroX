import { Link } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon, 
  WrenchScrewdriverIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const TechnicianDashboard = () => {
  const stats = [
    { 
      id: 1, 
      name: 'Pending Orders', 
      stat: '12', 
      icon: ClipboardDocumentListIcon,
      change: '4.75%',
      changeType: 'increase',
      link: '/technician/orders?status=pending'
    },
    { 
      id: 2, 
      name: 'Active Repairs', 
      stat: '8', 
      icon: WrenchScrewdriverIcon,
      change: '12.5%',
      changeType: 'increase',
      link: '/technician/repairs?status=in_progress'
    },
    { 
      id: 3, 
      name: 'Today\'s Reports', 
      stat: '5', 
      icon: ChartBarIcon,
      change: '2.1%',
      changeType: 'decrease',
      link: '/technician/reports?period=today'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-2xl font-medium leading-6 text-gray-900">Technician Dashboard</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Welcome to your technician dashboard. Here you can manage orders, repairs, and view reports.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/technician/orders"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">View All Orders</p>
              <p className="text-sm text-gray-500 truncate">Manage customer orders</p>
            </div>
          </Link>
          <Link
            to="/technician/repairs"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Manage Repairs</p>
              <p className="text-sm text-gray-500 truncate">Track and update repair status</p>
            </div>
          </Link>
          <Link
            to="/technician/reports"
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-500 truncate">Generate and analyze reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
