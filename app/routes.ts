import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [


    route("/", "layouts/main-layout.tsx", [
        index("routes/home/index.tsx"),
        route("home", "routes/home/index.tsx"),
        route("quizzes", "routes/quizzes/index.tsx"),
        route("login", "routes/auth/login.tsx"),
        route("register", "routes/auth/register.tsx"),
        route("profile", "routes/profile/index.tsx")
    ]),

    route("quiz", "layouts/quiz-layout.tsx", [
        route("subject", "routes/quiz/subject.tsx"),
        route(":id/subject", "routes/quiz/index.tsx")
    ])
] satisfies RouteConfig;
