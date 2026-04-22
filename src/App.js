import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import StaffRoute from './components/StaffRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import MenuList from './pages/menu/MenuList';
import MenuShow from './pages/menu/MenuShow';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/user/Dashboard';
import Edit from './pages/user/Edit';
import Order from './pages/user/Order';
import OrderList from './pages/user/OrderList';
import OrderEdit from './pages/user/OrderEdit';
import StaffDashboard from './pages/staff/Dashboard';
import StaffOrderList from './pages/staff/OrderList';
import StaffOrderTreatment from './pages/staff/OrderTreatment';
import CatalogManagement from './pages/staff/catalog/CatalogManagement';
import MenuCreate from './pages/staff/catalog/MenuCreate';
import MenuEdit from './pages/staff/catalog/MenuEdit';
import ReviewCreate from './pages/user/ReviewCreate';
import Reviews from './pages/user/Reviews';
import ReviewsManage from './pages/staff/ReviewsManage';
import UserCreate from './pages/admin/UserCreate';
import './App.scss';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/menu/list/' element={<MenuList />} />
          <Route path='/menu/show/:id' element={<MenuShow />} />
          <Route path='/auth/login/' element={<Login />} />
          <Route path='/auth/register/' element={<Register />} />
          <Route path='/user/dashboard/' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path='/user/edit/' element={<PrivateRoute><Edit /></PrivateRoute>} />
          <Route path='/user/order/' element={<PrivateRoute><Order /></PrivateRoute>} />
          <Route path='/user/orders/' element={<PrivateRoute><OrderList /></PrivateRoute>} />
          <Route path='/user/orders/:id/edit/' element={<PrivateRoute><OrderEdit /></PrivateRoute>} />
          <Route path='/user/reviews/' element={<PrivateRoute><Reviews /></PrivateRoute>} />
          <Route path='/user/reviews/create/:orderId' element={<PrivateRoute><ReviewCreate /></PrivateRoute>} />
          <Route path='/staff/dashboard/' element={<StaffRoute><StaffDashboard /></StaffRoute>} />
          <Route path='/staff/orders/' element={<StaffRoute><StaffOrderList /></StaffRoute>} />
          <Route path='/staff/orders/:id/treat/' element={<StaffRoute><StaffOrderTreatment /></StaffRoute>} />
          <Route path='/staff/catalog/' element={<StaffRoute><CatalogManagement /></StaffRoute>} />
          <Route path='/staff/catalog/menu/create/' element={<StaffRoute><MenuCreate /></StaffRoute>} />
          <Route path='/staff/catalog/menu/:id/edit/' element={<StaffRoute><MenuEdit /></StaffRoute>} />
          <Route path='/staff/reviews/' element={<StaffRoute><ReviewsManage /></StaffRoute>} />
          <Route path='/admin/users/' element={<AdminRoute><UserCreate /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
