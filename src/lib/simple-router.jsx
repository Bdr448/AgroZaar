import { useState, useEffect, createContext, useContext } from "react";

// Simple hash-based router - no heavy dependencies
const RouterContext = createContext({ route: "/", navigate: (path) => {} });

export function SimpleRouter({ children }) {
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash.slice(1) || "/";
    return hash;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "/";
      setRoute(hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
  };

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function useNavigate() {
  const { navigate } = useRouter();
  return (to) => {
    if (typeof to === "object" && to.to) {
      navigate(to.to);
    } else {
      navigate(to);
    }
  };
}

export function Link({ to, children, className, onClick }) {
  const handleClick = (e) => {
    e.preventDefault();
    window.location.hash = to;
    if (onClick) onClick(e);
  };

  return (
    <a href={`#${to}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

export function Navigate({ to }) {
  useEffect(() => {
    window.location.hash = to;
  }, [to]);
  return null;
}
