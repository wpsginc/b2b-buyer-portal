import {
  lazy,
} from 'react'

const OrderList = lazy(() => import('../../pages/order/MyOrder'))

const CompanyOrderList = lazy(() => import('../../pages/order/CompanyOrder'))

const Dashboard = lazy(() => import('../../pages/dashboard/Dashboard'))

const OrderDetail = lazy(() => import('../../pages/orderDetail/OrderDetail'))

// const SeleRep = lazy(() => import('../../pages/seleRep/SeleRep'))

type OrderItem = typeof OrderList

export interface RouteItem {
  path: string,
  name: string,
  component: OrderItem,
  isMenuItem: boolean,
  wsKey: string,
}

const routes: RouteItem[] = [
  {
    path: '/orders',
    name: 'My Order',
    wsKey: 'router-orders',
    isMenuItem: true,
    component: OrderList,
  },
  {
    path: '/company-orders',
    name: 'Company Order',
    wsKey: 'router-orders',
    isMenuItem: true,
    component: CompanyOrderList,
  },
  {
    path: '/orderDetail/:id',
    name: 'Order Details',
    wsKey: 'router-orders',
    isMenuItem: false,
    component: OrderDetail,
  },
  {
    path: '/addresss',
    name: 'Addresss',
    wsKey: 'router-orders',
    isMenuItem: true,
    component: Dashboard,
  },
  // {
  //   path: '/',
  //   name: 'seleRep',
  //   wsKey: 'router-seleRep',
  //   isMenuItem: true,
  //   component: SeleRep,
  // },
  {
    path: '/recently-viewed',
    name: 'Recently Viewed',
    wsKey: 'router-orders',
    isMenuItem: true,
    component: Dashboard,
  },
  {
    path: '/account-settings',
    name: 'Account Settings',
    wsKey: 'router-orders',
    isMenuItem: true,
    component: Dashboard,
  },
  {
    path: '/',
    name: 'Dashboard',
    wsKey: 'router-orders',
    isMenuItem: true,
    component: Dashboard,
  },
]

export {
  routes,
}
