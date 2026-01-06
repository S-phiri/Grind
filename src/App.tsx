import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AppLayout from "./components/app/AppLayout";
import { SessionDetail } from "./components/app/SessionDetail";
import Login from "./components/auth/Login";

function App() {
  return (
    <Suspense fallback={
      <div className="w-screen h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-[#00FF88] font-display text-2xl">Loading...</div>
      </div>
    }>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<AppLayout />} />
          <Route path="/app/session/:id" element={<SessionDetail />} />
        </Routes>
      </>
    </Suspense>
  );
}

export default App;
