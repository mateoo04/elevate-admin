import { createContext, useState } from 'react';

export const FullNameContext = createContext();

export const FullNameProvider = ({ children }) => {
  const [fullName, setFullName] = useState(
    localStorage.getItem('userFullName')
  );

  const logIn = (newFullName) => setFullName(newFullName);
  const logOut = () => {
    console.log('logging out');
    setFullName('');
  };

  return (
    <FullNameContext.Provider value={{ fullName, logIn, logOut }}>
      {children}
    </FullNameContext.Provider>
  );
};
