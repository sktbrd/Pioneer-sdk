import React from "react";
import type { PathRouteProps } from "react-router-dom";

const Home = React.lazy(() => import("../pages/home"));

export const routes: Array<PathRouteProps> = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/txid/:txid",
    element: <Home />,
  },
  {
    path: "*",
    element: <Home />,
  },
];

export const privateRoutes: Array<PathRouteProps> = [];
