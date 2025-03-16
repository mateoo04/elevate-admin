import { z } from 'zod';
import Header from '../header/Header';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clearLocalStorage } from '../../utils/helpers';
import { useContext } from 'react';
import { FullNameContext } from '../../context/fullNameContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const postSchema = z.object({
  title: z.string().min(5, 'Post titles must be at least 5 characters long'),
  content: z
    .string()
    .min(10, 'Post content must be at least 10 characters log'),
  imageUrl: z.string(),
});

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function PostEditor() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(postSchema) });

  const navigate = useNavigate();

  const { logOut } = useContext(FullNameContext);

  const uploadPost = async (data) => {
    reset();
    try {
      data.content = data.content.replace(/\n/g, '\\n');

      const response = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify(data),
      });

      if (response.status == 401) {
        clearLocalStorage;
        logOut();
      } else if (!response.ok) throw new Error('Error saving the post');

      navigate('/');
    } catch {
      toast.error('Error saving the post');
    }
  };

  return (
    <>
      <main className='container mt-4 mb-4 d-flex flex-column align-items-center'>
        <Header></Header>
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
          className='d-flex flex-column align-items-center mb-4 w-100'
          onSubmit={handleSubmit(uploadPost)}
        >
          <label htmlFor='title' className='w-100 mb-3'>
            Title
            <textarea
              name='title'
              id='title'
              rows={2}
              className='form-control'
              {...register('title')}
            ></textarea>
          </label>
          <label htmlFor='imageUrl' className='w-100 mb-3'>
            Image URL
            <input
              type='text'
              name='imageUrl'
              id='imageUrl'
              className='form-control'
              {...register('imageUrl')}
            />
          </label>
          <label htmlFor='content' className='w-100 mb-3'>
            Content
            <textarea
              name='content'
              id='content'
              className='form-control'
              rows={15}
              {...register('content')}
            ></textarea>
          </label>
          <input
            type='submit'
            value='SAVE POST'
            className='btn bg-primary text-white ps-4 pe-4 pt-2 pb-2 rounded-4 mb-4'
          />
        </form>
      </main>
    </>
  );
}
