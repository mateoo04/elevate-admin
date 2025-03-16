import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Header from '../header/Header';
import Comments from '../comments/Comments';
import { FullNameContext } from '../../context/fullNameContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Post() {
  const { fullName } = useContext(FullNameContext);
  const [post, setPost] = useState([]);

  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    const logInUrl = BASE_URL + '/posts/' + id;

    const fetchPosts = async () => {
      try {
        const response = await fetch(logInUrl, {
          method: 'GET',
        });

        if (!response.ok) throw new Error('Error fetching posts');

        const json = await response.json();

        setPost(json.post);
      } catch {
        toast.error('Error fetching posts');
      }
    };

    fetchPosts();
  }, [id]);

  if (!fullName) {
    navigate('/log-in');
    return;
  } else
    return (
      <>
        <Header />
        <main className='container mt-4'>
          <div className='d-flex justify-content-between'>
            <p>{post.date ? format(post.date, 'd.M.yyyy., HH:mm') : ''}</p>
            {post.author ? (
              <p>By {post.author.firstName + ' ' + post.author.lastName}</p>
            ) : (
              ''
            )}
          </div>
          <h2 className='article-heading mb-3'>{post.title}</h2>
          {post.imageUrl && (
            <img
              className='article-image rounded-4 mb-4'
              src={post.imageUrl}
              alt=''
              width='800px'
              height='auto'
            />
          )}
          <p>{post.content}</p>
          <Comments commentsArray={post.comments} postId={id} />
        </main>
      </>
    );
}
