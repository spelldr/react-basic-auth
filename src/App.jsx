// https://reactrouter.com/en/main/upgrading/v6-data
// https://github.com/remix-run/react-router/tree/dev/examples/auth

import './App.scss';
import React, { createContext, useContext, useState } from 'react';
import { useNavigate, useLocation, Navigate, Outlet, createHashRouter, RouterProvider, Link } from 'react-router-dom';
import { fakeAuthProvider } from './auth';
import { Button } from '@carbon/react';

const router = createHashRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: PublicPage },
      { path: '/login', Component: LoginPage },
      {
        path: '/protected',
        element: (
          <RequireAuth>
            <ProtectedPage />
          </RequireAuth>
        ),
      },
    ],
  },
]);

function Root() {
  return (
    <div className='App'>
      <h1>EH</h1>
      <Layout />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

function Layout() {
  return (
    <div>
      <AuthStatus />
      <br />
      <Link to='/'>Public page</Link>
      <br />
      <Link to='/protected'>Protected page</Link>
      <Outlet />
    </div>
  );
}

let AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setuser] = useState(null);
  let signin = (newUser, callback) => {
    return fakeAuthProvider.signin(() => {
      setuser(newUser);
      callback();
    });
  };
  let signout = (callback) => {
    return fakeAuthProvider.signout(() => {
      setuser(null);
      callback();
    });
  };
  let value = { user, signin, signout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

function AuthStatus() {
  let auth = useAuth();
  let navigate = useNavigate();

  if (!auth.user) {
    return <p>You are not logged in</p>;
  }
  return (
    <p>
      Welcome {auth.user}!{' '}
      <Button
        onClick={() => {
          auth.signout(() => navigate('/'));
        }}
      >
        Sign out
      </Button>
    </p>
  );
}

function RequireAuth({ children }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    // Redirect to /login, but save the current location first.
    // When the login is complete, the user will be sent to where they were trying to go.
    return (
      <Navigate
        to='/login'
        state={{ from: location }}
        replace
      />
    );
  }
  return children;
}

function LoginPage() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();

  let from = location.state?.from?.pathname || '/';

  function handleSubmit(event) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let username = formData.get('username');

    auth.signin(username, () => {
      // send them back to the page they were trying to go to
      navigate(from, { replace: true });
    });
  }
  return (
    <div>
      <p>You must log in to view the page at {from}</p>
      <form onSubmit={handleSubmit}>
        <label>
          Username:{' '}
          <input
            name='username'
            type='text'
          />
        </label>
        <Button type='submit'>Login</Button>
      </form>
    </div>
  );
}

function PublicPage() {
  return (
    <>
      <h3>Public</h3>
    </>
  );
}

function ProtectedPage() {
  return <h3>Protected</h3>;
}
