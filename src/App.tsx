import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';

import { ClientAuthProvider } from './context/ClientAuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';

import ClientAppLayout from './Client/ClientsComponent/Layout/ClientAppLayout';
import Home from './Client/ClientPages/Home';
import AllProduct from './Client/ClientPages/AllProducts';
import FlashSale from './Client/ClientPages/FlashSale';
import ProductDetails from './Client/ClientPages/ProductDetails';
import MyOrders from './Client/ClientPages/MyOrders';
import Cart from './Client/ClientPages/Cart';
import Contact from './Client/ClientPages/Contact';
import BecomeSeller from './Client/ClientPages/BecomeSeller';
import FAQs from './Client/ClientPages/FAQs';
import DeliveryInformation from './Client/ClientPages/DeliveryInformation';
import ReturnRefundPolicy from './Client/ClientPages/ReturnRefundPolicy';
import PaymentMethods from './Client/ClientPages/PaymentMethods';
import Wishlist from './Client/ClientPages/Wishlist';
import NotFound from './Client/ClientsComponent/NotFound';

const router = createBrowserRouter([
  {
    path: "/",
    element: <ClientAppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/AllProduct", element: <AllProduct /> },
      { path: "/flash-sale", element: <FlashSale /> },
      { path: "/product/:productId", element: <ProductDetails /> },
      { path: "/cart", element: <Cart /> },
      { path: "/my-orders", element: <MyOrders /> },
      { path: "/wishlist", element: <Wishlist /> },
      { path: "/contact", element: <Contact /> },
      { path: "/become-seller", element: <BecomeSeller /> },
      { path: "/faqs", element: <FAQs /> },
      { path: "/delivery-information", element: <DeliveryInformation /> },
      { path: "/return-refund-policy", element: <ReturnRefundPolicy /> },
      { path: "/payment-methods", element: <PaymentMethods /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <ClientAuthProvider>
      <ProductProvider>
        <OrderProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </OrderProvider>
      </ProductProvider>
    </ClientAuthProvider>
  );
}

export default App;