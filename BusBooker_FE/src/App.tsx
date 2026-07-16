import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { createRouter } from "./routes/Router";

const App: React.FC = () => {
  const router = createRouter();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default App;
