import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { refreshTokenThunk } from './features/Auth/AuthSlice';
import { publicRoutes, privateRoutes } from './routes';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Loader from './components/Loader';
import { Fragment } from 'react';

function App() {
  const isLoading = useSelector((state) => state.loader.loading);


  return (
    <BrowserRouter>
      {isLoading && <Loader />}
      <Routes>
        {publicRoutes.map((route, index) => {
          const Page = route.component;
          let Layout;

          if (route.layout) {
            Layout = route.layout;
          } else if (route.layout === null) {
            Layout = Fragment;
          }
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Page />
                </Layout>
              }
            />
          );
        })}
        {privateRoutes.map((route, index) => {
          let Layout;

          if (route.layout) {
            Layout = route.layout;
          } else if (route.layout === null) {
            Layout = Fragment;
          }
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={route.allowedRoles}>
                  <Layout>
                    <route.component />
                  </Layout>
                </ProtectedRoute>
              }
            >
              {route.children?.map((child, idx) => (
                <Route
                  key={idx}
                  path={child.path}
                  element={
                    <TeacherProtectedRoute>
                      <child.component />
                    </TeacherProtectedRoute>
                  }
                />
              ))}
            </Route>
          );
        })}
      </Routes>
    </BrowserRouter>
  );
}

export default App;