import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../header/Header';
import { toast } from 'react-toastify';
import { FullNameContext } from '../../context/fullNameContext.jsx';
import { useContext } from 'react';

const logInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/\d/, 'Must contain at least one number'),
});

export default function LogIn() {
  const { logIn } = useContext(FullNameContext);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(logInSchema) });

  const logInUrl = import.meta.env.VITE_API_BASE_URL + '/auth/admin/log-in';

  const handleLogIn = async (data) => {
    try {
      const response = await fetch(logInUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status == 401) {
        setError('server', { message: 'Invalid credentials' });
      } else if (!response.ok) throw new Error('Failed to log in');
      else {
        const json = await response.json();

        localStorage.setItem('token', json.token);
        localStorage.setItem('tokenExpiry', json.expiresAt);
        localStorage.setItem(
          'userFullName',
          `${json.firstName} ${json.lastName}`
        );
        localStorage.setItem('userEmail', json.email);

        logIn(`${json.firstName} ${json.lastName}`);

        navigate('/');
      }
    } catch {
      toast.error('Failed to log in');
    }
  };

  return (
    <>
      <Header hideLogInButton={true}></Header>
      <main className='container flex-grow-1 d-flex flex-column justify-content-center align-items-center'>
        {Object.values(errors).length ? (
          <div className='bg-warning rounded-4 p-3 mb-3'>
            <ul className='ps-3 mb-0'>
              {Object.values(errors).map((error) => {
                return <li>{error.message}</li>;
              })}
            </ul>
            {}
          </div>
        ) : (
          ''
        )}
        <form
          onSubmit={handleSubmit(handleLogIn)}
          className='d-flex flex-column align-items-center mb-4'
        >
          <label htmlFor='email'>
            Email
            <input
              type='email'
              name='email'
              {...register('email')}
              className='form-control mb-3'
            />
          </label>
          <label htmlFor='password'>
            Password
            <input
              type='password'
              name='password'
              {...register('password')}
              className='form-control mb-3'
            />
          </label>
          <input
            type='submit'
            value='Log in'
            className='btn bg-primary text-white'
          />
        </form>
      </main>
    </>
  );
}
