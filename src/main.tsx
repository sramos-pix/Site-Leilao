/**
 * CHECKPOINT DE SEGURANÇA
 * Data: {new Date().toLocaleString('pt-BR')}
 * Status: Admin restaurado, Verificação com câmera/PDF ativa, Dashboard funcional.
 */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

createRoot(document.getElementById("root")!).render(<App />);