import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PilarPage from "./pages/PilarPage";
import CasaPage from "./pages/CasaPage";
import MetasPage from "./pages/MetasPage";
import CorpoPage from "./pages/CorpoPage";

function Protegido() {
  const { session, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="font-display text-2xl text-salvia">Raiz</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return <Layout />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Protegido />}>
            <Route index element={<Dashboard />} />
            {/* salas ja mobiliadas */}
            <Route path="corpo" element={<CorpoPage />} />
            <Route path="casa" element={<CasaPage />} />
            <Route path="financas-metas" element={<MetasPage />} />
            {/* salas ainda vazias, esperando a gente montar */}
            <Route path=":slug" element={<PilarPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
