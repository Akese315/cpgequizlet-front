import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useEffect } from "react";
import { useUserStore } from "./store/userStore";
import { API_URL } from "./config";



import appStylesHref from "./app.css?url";

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: appStylesHref },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { setUser } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    console.warn({ token, userId })

    if (token && userId) {
      const fetchUserInfo = async () => {
        try {
          // Utilise une requête POST avec un corps JSON pour correspondre à web::Json<UserInfoQuery> côté Rust
          const response = await fetch(`${API_URL}/user/info`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              user_token: token,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            console.log(data)
            setUser({
              id: data.user_id,
              token: data.user_token,
              email: data.email,
              pseudo: data.first_name || '', // On utilise first_name en guise d'affichage par défaut si besoin
              firstName: data.first_name,
              lastName: data.last_name,
              role: data.role || 'student',
            });
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des infos utilisateur:", error);
        }
      };
      fetchUserInfo();
    }
  }, [setUser]);

  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
