import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AppLayout from "./components/app/AppLayout";
import { SessionDetail } from "./components/app/SessionDetail";
import { Players } from "./components/app/Players";
import { PlayerDetail } from "./components/app/PlayerDetail";
import { Sessions } from "./components/app/Sessions";
import { Leaders } from "./components/app/Leaders";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { IntakeForm } from "./components/intake/IntakeForm";

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
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute requireIntake={true}>
                <AppLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/players"
            element={
              <ProtectedRoute>
                <Players />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/players/:id"
            element={
              <ProtectedRoute>
                <PlayerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/leaders"
            element={
              <ProtectedRoute>
                <Leaders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/session/:id"
            element={
              <ProtectedRoute>
                <SessionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/intake"
            element={
              <ProtectedRoute>
                <IntakeForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </>
    </Suspense>
  );
}

export default App;
