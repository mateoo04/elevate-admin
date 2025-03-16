import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearLocalStorage, isTokenExpired } from '../../utils/helpers';
import { FullNameContext } from '../../context/fullNameContext.jsx';

export default function Header({ hideLogInButton }) {
  const { fullName, logOut } = useContext(FullNameContext);

  const token = localStorage.getItem('token');

  const navigate = useNavigate();

  if (isTokenExpired()) {
    clearLocalStorage();
  }

  useEffect(() => {
    if (!localStorage.getItem('token') && fullName) logOut();
  }, [token, logOut, fullName]);

  const handleLogOut = () => {
    clearLocalStorage();
    logOut();
    navigate('/log-in');
  };

  return (
    <header className='container d-flex align-items-center justify-content-between mt-3'>
      <h1>
        <Link
          className='text-decoration-none text-black'
          to={fullName ? '/' : '/log-in'}
        >
          Elevate
        </Link>
      </h1>
      {hideLogInButton || (
        <div className='dropdown'>
          <button
            className='btn btn-secondary dropdown-toggle bg-transparent border-0 text-black'
            type='button'
            data-bs-toggle='dropdown'
            aria-expanded='false'
          >
            {fullName}
          </button>
          <ul className='dropdown-menu'>
            {!localStorage.getItem('token') || isTokenExpired() ? (
              <>
                <li>
                  <button
                    className='dropdown-item'
                    onClick={() => navigate(`/log-in`)}
                  >
                    Log in
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button className='dropdown-item' onClick={handleLogOut}>
                  Log out
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
