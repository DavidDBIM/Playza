import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  const prevPathname = useRef(pathname);

  useEffect(() => {
    const isProfileNav = prevPathname.current.startsWith("/profile") && pathname.startsWith("/profile");
    
    if (isProfileNav && pathname !== "/profile") {
      const mobileContent = document.getElementById("profile-content-mobile");
      if (mobileContent && window.innerWidth < 768) {
        mobileContent.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (!pathname.startsWith("/profile")) {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }
    
    prevPathname.current = pathname;
  }, [pathname]);

  return null;
}
