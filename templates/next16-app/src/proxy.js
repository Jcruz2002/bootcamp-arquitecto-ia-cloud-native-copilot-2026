import { withAuth } from "next-auth/middleware";

export default withAuth(
  function proxy() {},
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (!token) {
          return false;
        }

        if (req.nextUrl.pathname.startsWith("/admin")) {
          const roles = token.roles || [];
          return roles.includes("admin");
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/users", "/admin"],
};
