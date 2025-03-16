import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './scss/styles.scss';
import * as bootstrap from 'bootstrap';
import App from './components/app/App';
import Post from './components/post/Post';
import LogIn from './components/log-in/LogIn';
import { ToastContainer, Slide } from 'react-toastify';
import { FullNameProvider } from './context/fullNameContext.jsx';

const router = createBrowserRouter([
  {
    path: '*',
    element: <App />,
  },
  {
    path: '/posts/:id',
    element: <Post />,
  },
  {
    path: '/log-in',
    element: <LogIn />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FullNameProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
        transition={Slide}
      />
    </FullNameProvider>
  </StrictMode>
);
