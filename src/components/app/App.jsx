import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import { toast } from 'react-toastify';
import { FullNameContext } from '../../context/fullNameContext';
import { clearLocalStorage } from '../../utils/helpers';
import noImageImg from '../../assets/no-image.png';
import trashSvg from '../../assets/trash.svg';
import pencilSvg from '../../assets/pencil.svg';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const { fullName, logOut } = useContext(FullNameContext);
  const [posts, setPosts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const postsUrl = BASE_URL + '/posts';

    const fetchPosts = async () => {
      try {
        const response = await fetch(postsUrl, {
          method: 'GET',
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        });

        if (!response.ok) throw new Error('Failed to fetch posts');

        const json = await response.json();

        setPosts(json.posts);
      } catch {
        toast.error('Failed to fetch posts');
      }
    };

    fetchPosts();
  }, []);

  const updatePublishedStatus = async (postId, isPublished) => {
    try {
      const response = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({ isPublished }),
      });

      if (response.status == 401) {
        clearLocalStorage();
        logOut();
      } else if (!response.ok) throw new Error('Error posting the comment');

      const json = await response.json();

      setPosts(
        posts.map((post) => {
          if (post.id == postId) return json.post;
          else return post;
        })
      );
    } catch {
      toast.err('Failed updating published status');
    }
  };

  const deletePost = async (post) => {
    if (confirm('Are you sure you want to delete this post?')) {
      fetch(`${BASE_URL}/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      })
        .then(async (response) => {
          if (response.status == 401) {
            clearLocalStorage();
            logOut();
          } else if (response.status === 200)
            setPosts(posts.filter((item) => item.id != post.id));
        })
        .catch(() => toast.error('Error deleting the comment'));
    }
  };

  if (!fullName) {
    navigate('/log-in');
    return;
  } else
    return (
      <>
        <Header />
        <main className='container mt-4 mb-4 d-flex flex-column align-items-center'>
          <button className='btn bg-primary text-white ps-4 pe-4 pt-2 pb-2 rounded-5 mb-4'>
            <Link className='text-white text-decoration-none' to='/posts/new'>
              New post
            </Link>
          </button>
          {posts.length === 0 ? (
            <p>Loading...</p>
          ) : (
            <div className='row g-3'>
              {posts.map((post) => {
                return (
                  <div
                    className='col-sm-6 col-lg-4'
                    key={'container-' + post.id}
                  >
                    <div className='card h-100' key={post.id}>
                      <img
                        src={post.imageUrl || noImageImg}
                        className='card-img-top border-bottom border-1'
                        alt=''
                        onClick={() => navigate(`/posts/${post.id}`)}
                        onError={(e) => (e.target.src = noImageImg)}
                      />
                      <div
                        className='card-body'
                        onClick={() => navigate(`/posts/${post.id}`)}
                      >
                        <h3 className='card-title'>{post.title}</h3>
                        <p>
                          {post.author
                            ? `By ${post.author.firstName} ${post.author.lastName}`
                            : ''}
                        </p>
                      </div>
                      <div className='card-footer d-flex justify-content-between'>
                        <div className='form-check form-switch pt-2'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            role='switch'
                            id='flexSwitchCheckDefault'
                            checked={post.isPublished ? true : false}
                            onChange={async (event) => {
                              await updatePublishedStatus(
                                post.id,
                                event.target.checked
                              );
                            }}
                          />
                          <label
                            className='form-check-label'
                            htmlFor='flexSwitchCheckDefault'
                          >
                            {post.isPublished ? 'Published' : 'Unpublished'}
                          </label>
                        </div>
                        <div>
                          <button className='btn bg-transparent border-0'>
                            <img src={pencilSvg} alt='' />
                          </button>
                          <button
                            className='btn bg-transparent border-0'
                            onClick={() => deletePost(post)}
                          >
                            <img src={trashSvg} alt='' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </>
    );
}

export default App;
