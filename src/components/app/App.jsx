import { useState, useEffect, useContext } from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import imageSvg from '../../assets/image.svg';
import { toast } from 'react-toastify';
import { FullNameContext } from '../../context/fullNameContext';
import { clearLocalStorage } from '../../utils/helpers';

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

  if (!fullName) {
    navigate('/log-in');
    return;
  } else
    return (
      <>
        <Header />
        <main className='container mt-4 mb-4'>
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
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          className='card-img-top'
                          alt=''
                          onClick={() => navigate(`/posts/${post.id}`)}
                        />
                      ) : (
                        <div className='card-img-top d-flex align-content-center justify-content-center border-bottom border-2'>
                          <img src={imageSvg} width='64px' alt='' />
                        </div>
                      )}
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
                      <div className='card-footer'>
                        <div className='form-check form-switch'>
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
