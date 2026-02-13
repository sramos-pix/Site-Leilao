/**
 * CHECKPOINT DE SEGURANÇA
 * Data: {new Date().toLocaleString('pt-BR')}
 * Status: Logout admin funcional. Iniciando integração de Lotes.
 */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

createRoot(document.getElementById("root")!).render(<App />);