import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MenuList from './pages/menu/MenuList';
import MenuShow from './pages/menu/MenuShow';
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/menu/list/' element={<MenuList />} />
        <Route path='/menu/show/:id' element={<MenuShow />} />
        
      </Routes>
    </BrowserRouter>

  );
}

export default App;
