import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { refreshTokenThunk } from './features/Auth/AuthSlice';
import { publicRoutes, privateRoutes } from './routes';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';

function App() {
  const isLoading = useSelector((state) => state.loader.loading);

  return (
    <BrowserRouter>
      {isLoading && <Loader />}
      <Routes>
        {publicRoutes.map((r, i) => (
          <Route key={i} path={r.path} element={<r.component />} />
        ))}
        {privateRoutes.map((r, i) => (
          <Route
            key={i}
            path={r.path}
            element={
              <ProtectedRoute allowedRoles={r.allowedRoles}>
                <r.component />
              </ProtectedRoute>
            }
          >
            {r.children?.map((child, idx) => (
              <Route
                key={idx}
                path={child.path}
                element={<child.component />}
              />
            ))}
          </Route>
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
