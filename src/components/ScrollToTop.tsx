import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes. This is the recommended approach for BrowserRouter
 * when ScrollRestoration (which requires data routers) is not available.
 * 
 * Should be placed inside BrowserRouter but outside Routes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;