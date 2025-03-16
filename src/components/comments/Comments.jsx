import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { clearLocalStorage } from '../../utils/helpers';
import { FullNameContext } from '../../context/fullNameContext.jsx';

const commentSchema = z.object({
  content: z.string().min(5, 'Comment must be at least 5 characters long'),
});

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Comments({ commentsArray, postId }) {
  const [comments, setComments] = useState([]);
  const [commentEdited, setCommentEdited] = useState({});

  const { logOut } = useContext(FullNameContext);

  useEffect(() => {
    if (Array.isArray(commentsArray)) {
      setComments(commentsArray);
    }
  }, [commentsArray]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(commentSchema) });

  const postComment = async (data) => {
    reset();
    try {
      const response = await fetch(`${BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({ content: data.content, postId }),
      });

      if (response.status == 401) {
        clearLocalStorage();
        logOut();
      } else if (!response.ok) throw new Error('Error posting the comment');

      const json = await response.json();

      setComments([json.comment, ...comments]);
    } catch {
      toast.error('Error posting the comment');
    }
  };

  const deleteComment = async (comment) => {
    if (comment.user.email !== localStorage.getItem('userEmail')) return;

    if (confirm('Are you sure you want to delete this comment?')) {
      fetch(`${BASE_URL}/comments/${comment.id}`, {
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
            setComments(comments.filter((item) => item.id != comment.id));
        })
        .catch(() => toast.error('Error deleting the comment'));
    }
  };

  const putComment = async (data) => {
    reset();
    try {
      const response = await fetch(`${BASE_URL}/comments/${commentEdited.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({ content: data.content, postId }),
      });

      if (!response.ok) throw new Error('Error updating the comment');

      const json = await response.json();

      setComments(
        comments.map((item) => {
          if (json.comment.id == item.id) {
            return json.comment;
          }
          return item;
        })
      );

      setCommentEdited({});
    } catch {
      toast.error('Error updating the comment');
    }
  };
  const handleEdit = (comment) => {
    setCommentEdited(comment);
    setValue('content', comment.content);
  };

  const cancelEditing = () => {
    setCommentEdited({});
    setValue('content', '');
  };

  return (
    <div className='comments'>
      <h3>Comments</h3>

      {localStorage.getItem('token') ? (
        <>
          {errors.content?.message && (
            <p>{Object.values(errors).at(0)?.message}</p>
          )}
          <form
            onSubmit={
              commentEdited.content
                ? handleSubmit(putComment)
                : handleSubmit(postComment)
            }
            className='mb-3'
          >
            <textarea
              className='form-control mb-3'
              name='content'
              id='content'
              {...register('content')}
            ></textarea>
            <button
              className={
                'btn bg-secondary text-white me-2 ' +
                (commentEdited.content ? '' : 'd-none')
              }
              onClick={cancelEditing}
              type='button'
            >
              Cancel
            </button>
            <button className='btn bg-primary text-white' type='submit'>
              {commentEdited.content ? 'Save changes' : 'Post comment'}
            </button>
          </form>
        </>
      ) : (
        ''
      )}

      {comments?.length === 0 ? (
        <p>No comments yet</p>
      ) : (
        comments.map((comment) => {
          return (
            <div key={comment.id}>
              <div className='d-flex justify-content-between align-items-center'>
                <p className='text-muted mb-0'>
                  {format(comment.date, 'd.M.yyyy., HH:mm')}
                </p>
                {comment.user?.email === localStorage.getItem('userEmail') ? (
                  <div className='dropdown'>
                    <button
                      className='btn btn-secondary bg-transparent border-0 text-black three-dots'
                      type='button'
                      data-bs-toggle='dropdown'
                      aria-expanded='false'
                    >
                      &#x22EE;
                    </button>
                    <ul className='dropdown-menu'>
                      <li>
                        <button
                          className='dropdown-item'
                          onClick={() => handleEdit(comment)}
                        >
                          Edit
                        </button>
                        <button
                          className='dropdown-item'
                          onClick={() => deleteComment(comment)}
                        >
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  ''
                )}
              </div>
              <h4>{comment.user?.firstName + ' ' + comment.user?.lastName}</h4>
              <p>{comment.content}</p>
            </div>
          );
        })
      )}
    </div>
  );
}
