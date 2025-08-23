import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Posts from "./components/Posts";
import CreatePost from "./components/CreatePost";
import Form from "./components/Form";
import Header from "./components/Header";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const hideHeaderRoutes = ["/sign-in"];

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && (
        <Header btnText={user ? "" : "Sign In / Sign Up"} />
      )}

      <Routes>
        <Route path="/home" element={<Posts />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/sign-in" element={<Form />} />
        <Route path="/" element={<Posts />} />
        <Route
          path="*"
          element={
            <h2 className="p-[23vh] mt-30 font-bold text-xl text-neutral-800 text-center w-full px-4">
              Not Found (404 Page)
            </h2>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/">
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
