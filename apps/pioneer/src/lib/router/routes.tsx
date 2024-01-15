import React from 'react';
import type { PathRouteProps } from 'react-router-dom';

const Home = React.lazy(() => import('../pages/home'));

export const routes: PathRouteProps[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/intent/:intent',
    element: <Home />,
  },
];

export const privateRoutes: PathRouteProps[] = [];
