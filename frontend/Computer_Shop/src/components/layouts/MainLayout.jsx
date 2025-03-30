import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import Sidebar from '../common/Sidebar/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout; 