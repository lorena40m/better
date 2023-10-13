// import React, { createContext, useState } from "react";
// import { useRouter } from "next/router";

// const AuthContext = createContext();
// const { Provider } = AuthContext;

// const AuthProvider = ({ children } : any) => {
//   const [authState, setAuthState] = useState<any>({
//    token: "",
//   });

//   const setUserAuthInfo = ({ data } : any) => {
//    const token = localStorage.setItem("token", data.data);

//    setAuthState({
//     token,
//    });
//  };

//  // checks if the user is authenticated or not
//  const isUserAuthenticated = () => {
//   if (!authState.token) {
//     return false;
//   }
//  };

//  return (
//    <Provider
//      value={{
//       authState,
//       setAuthState: (userAuthInfo) => setUserAuthInfo(userAuthInfo),
//       isUserAuthenticated,
//     }}
//    >
//     {children}
//    </Provider>
//  );
// };

// export { AuthContext, AuthProvider };